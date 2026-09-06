import { readAdminConfig, readSession, requireSameOrigin } from "../../server/auth.js";
import { getDatabase } from "../../server/db.js";
import { readJson, respond } from "../../server/http.js";
import { validateCourseReferences } from "../../shared/courseValidation.js";
import { safeExternalUrl } from "../../src/lib/url.js";

const TABLES={
  courses:{key:"id",columns:"id code name subtitle dept cte_path fine_arts_type misc_type credits grade_level prereqs concurrent_ok grad_category grad_credits is_ap repeatable teacher_sig_required is_off_campus desc tips grade_reqs archived"},
  announcements:{key:"id",columns:"id title body type link_url starts_at ends_at visible"},
  disclaimer_items:{key:"id",columns:"id icon label body sort_order visible updated_at"},
  site_settings:{key:"key",columns:"key value updated_at"},
  page_maintenance:{key:"page_id",columns:"page_id enabled updated_at"},
};
const fail=message=>{throw Object.assign(new Error(message),{status:400});};
function validateRecord(table,row) {
  if(!row || typeof row!=="object" || Array.isArray(row)) fail("Invalid record");
  const allowed=TABLES[table].columns.split(" ");
  if(Object.keys(row).some(key=>!allowed.includes(key))) fail("Unexpected record field");
  if(table==="announcements") {
    if(typeof row.title!=="string" || !row.title.trim() || row.title.length>200) fail("An announcement title is required");
    if(!["info","warning","new"].includes(row.type)) fail("Invalid announcement type");
    if(row.link_url && !safeExternalUrl(row.link_url)) fail("Use an http or https link");
    for(const key of ["starts_at","ends_at"]) if(row[key] && (!/(Z|[+-]\d{2}:\d{2})$/.test(row[key]) || !Number.isFinite(Date.parse(row[key])))) fail("Announcement times must include a timezone");
    if(row.starts_at && row.ends_at && Date.parse(row.starts_at)>Date.parse(row.ends_at)) fail("Start time must be before expiry time");
  }
  if(table==="disclaimer_items" && (!row.id || !row.label?.trim() || !row.body?.trim() || !Number.isInteger(row.sort_order))) fail("Complete the disclaimer fields and display order");
  if(table==="site_settings") {
    if(!["catalog_year_label","catalog_source_title","catalog_source_url","catalog_last_reviewed"].includes(row.key) || typeof row.value!=="string") fail("Invalid setting");
    if(row.key==="catalog_source_url" && row.value && !safeExternalUrl(row.value)) fail("Use an http or https catalog link");
  }
  if(table==="page_maintenance" && (!["home","catalog","match","planner"].includes(row.page_id) || typeof row.enabled!=="boolean")) fail("Invalid maintenance setting");
  for(const key of ["visible","enabled"]) if(row[key]!=null && typeof row[key]!=="boolean") fail(`${key} must be true or false`);
}

export default async function handler(req,res) {
  try {
    if(req.method!=="POST") return respond(res,405,{error:"Method not allowed"});
    requireSameOrigin(req);
    if(!readSession(req,readAdminConfig())) return respond(res,401,{error:"Your session expired. Please sign in again."});
    const {table,action,payload,filter,order}=await readJson(req);
    if(!Object.hasOwn(TABLES,table) || !["select","insert","update","delete","upsert"].includes(action)) fail("Unsupported operation");
    const {key,columns}=TABLES[table];
    if(filter && (filter.column!==key || typeof filter.value!=="string" || !filter.value || filter.value.length>100)) fail("Invalid record identifier");
    if(["update","delete"].includes(action) && !filter) fail("Choose one record to modify");
    const db=getDatabase();
    if(action==="select") {
      let query=db.from(table).select("*").limit(1000);
      if(filter) query=query.eq(key,filter.value);
      if(order) {
        if(![...columns.split(" "),"created_at"].includes(order.column)) fail("Invalid sort field");
        query=query.order(order.column,{ascending:order.ascending!==false});
      }
      const {data,error}=await query;
      if(error) throw error;
      return respond(res,200,{data});
    }
    if(action==="delete") {
      if(table==="courses") {
        const {data,error}=await db.from("courses").select("id,prereqs,concurrent_ok");if(error) throw error;
        if(data.some(c=>[...(c.prereqs||[]),...(c.concurrent_ok||[])].includes(filter.value))) fail("This course is a prerequisite. Archive it instead of deleting it.");
      }
      const {data,error}=await db.from(table).delete().eq(key,filter.value).select(key);
      if(error) throw error;if(!data.length) return respond(res,404,{error:"Record no longer exists. Refresh and try again."});
      return respond(res,200,{data});
    }
    let rows=Array.isArray(payload)?payload:[payload];
    const patch=action==="update"?payload:null;
    if(!rows.length || rows.length>500 || (action==="update" && (rows.length!==1 || Array.isArray(payload)))) fail("Invalid batch size (maximum 500 records)");
    for(const row of rows) if(!row || typeof row!=="object" || Object.keys(row).some(k=>!columns.split(" ").includes(k))) fail("Unexpected record field");
    if(action==="update") {
      const {data,error}=await db.from(table).select("*").eq(key,filter.value).maybeSingle();if(error) throw error;
      if(!data) return respond(res,404,{error:"Record no longer exists. Refresh and try again."});
      if(rows[0][key]!==undefined && rows[0][key]!==filter.value) fail("Record IDs cannot be changed");
      rows=[Object.fromEntries(Object.entries({...data,...rows[0]}).filter(([k])=>columns.split(" ").includes(k)))];
    }
    if(action==="upsert" && table==="courses") {
      const {data,error}=await db.from(table).select("id,archived");if(error) throw error;
      const previous=new Map(data.map(row=>[row.id,row.archived]));
      rows=rows.map(row=>({...row,archived:row.archived??previous.get(row.id)??false}));
    }
    rows.forEach(row=>validateRecord(table,row));
    if(table==="courses") {
      const {data,error}=await db.from(table).select("id");if(error) throw error;
      try {validateCourseReferences(rows,data.map(row=>row.id));} catch(error) {fail(error.message);}
    }
    let query=db.from(table);
    if(action==="update") query=query.update(patch).eq(key,filter.value);
    else if(action==="upsert") query=query.upsert(rows,{onConflict:key});
    else query=query.insert(rows);
    const {data,error}=await query.select(key);
    if(error) throw error;
    if(!data?.length) return respond(res,409,{error:"No records were saved. Refresh and try again."});
    return respond(res,200,{data});
  } catch(error) {
    // Database errors are deliberately kept out of public responses.
    return respond(res,error.status || 500,{error:error.status?error.message:"The change could not be saved. Check the values and try again."});
  }
}
