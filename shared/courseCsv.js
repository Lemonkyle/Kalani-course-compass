import { validateCourse } from "./courseValidation.js";

export function readCsvRows(text) {
  const source=String(text || "").replace(/^\uFEFF/, "");
  const rows=[]; let row=[], cell="", quoted=false, closed=false;
  const finishCell=()=>{row.push(cell.trim());cell="";closed=false;};
  for(let i=0;i<source.length;i++) {
    const ch=source[i];
    if(quoted) {
      if(ch==='"' && source[i+1]==='"'){cell+='"';i++;}
      else if(ch==='"'){quoted=false;closed=true;}
      else cell+=ch;
    } else if(ch==='"') {
      if(cell.trim() || closed) throw new Error("Unexpected quote in CSV");
      cell="";quoted=true;
    } else if(ch===",") finishCell();
    else if(ch==='\n' || ch==='\r') {
      if(ch==='\r' && source[i+1]==='\n')i++;
      finishCell();if(row.some(Boolean))rows.push(row);row=[];
    } else if(closed && ch.trim()) throw new Error("Unexpected text after closing CSV quote");
    else if(!closed) cell+=ch;
  }
  if(quoted)throw new Error("Unclosed quote in CSV");
  finishCell();if(row.some(Boolean))rows.push(row);return rows;
}
const list=value=>value ? value.replace(/^\{|\}$/g, "").split(",").map(s=>s.trim()).filter(Boolean) : [];
function number(value, fallback) {
  if(value==="" || value==null)return fallback;
  if(!/^\d+(\.\d+)?$/.test(value))throw new Error(`Invalid number: ${value}`);
  return Number(value);
}
function boolean(value) {
  if(!value)return false;
  if(["true","1","yes","y"].includes(value.toLowerCase()))return true;
  if(["false","0","no","n"].includes(value.toLowerCase()))return false;
  throw new Error(`Invalid boolean: ${value}`);
}
export function parseCourseCsv(text, {normalize=false}={}) {
  const rows=readCsvRows(text);if(!rows.length)return [];
  const headers=rows.shift();
  if(new Set(headers).size!==headers.length)throw new Error("Duplicate CSV header");
  for(const key of ["id","name","dept","credits","grade_level"]) if(!headers.includes(key))throw new Error(`Missing CSV column: ${key}`);
  return rows.map((values,index)=>{
    try {
      if(values.length!==headers.length)throw new Error("Column count does not match header");
      const row=Object.fromEntries(headers.map((h,i)=>[h,values[i]]));
      const result={id:row.id,name:row.name,code:row.code||"",subtitle:row.subtitle||"",dept:row.dept,
        cte_path:row.cte_path||null,fine_arts_type:row.fine_arts_type||null,misc_type:row.misc_type||null,
        credits:number(row.credits,NaN),grade_level:list(row.grade_level).map(Number),
        prereqs:list(row.prereqs),concurrent_ok:list(row.concurrent_ok),grad_category:row.grad_category||null,
        grad_credits:number(row.grad_credits,null),is_ap:boolean(row.is_ap),repeatable:boolean(row.repeatable),
        teacher_sig_required:boolean(row.teacher_sig_required),is_off_campus:boolean(row.is_off_campus),
        desc:row.desc||"",tips:row.tips||"",grade_reqs:row.grade_reqs?JSON.parse(row.grade_reqs):{},
        ...(row.archived ? {archived:boolean(row.archived)} : {})};
      validateCourse(result);return normalize?result:row;
    } catch(error){throw new Error(`CSV row ${index+2}: ${error.message}`);}
  });
}
