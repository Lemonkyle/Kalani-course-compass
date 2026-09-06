import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword, createSession, verifySession, sessionCookie, requireSameOrigin, SESSION_SECONDS } from "../server/auth.js";
import { parseCourseCsv, readCsvRows } from "../shared/courseCsv.js";
import { validateCourseReferences } from "../shared/courseValidation.js";
import sessionHandler from "../api/admin/session.js";
import dataHandler from "../api/admin/data.js";

const password="test-only-password-with-entropy";
const config={username:"test-admin",passwordHash:hashPassword(password),sessionSecret:"test-only-secret-12345678901234567890"};
Object.assign(process.env,{ADMIN_USERNAME:config.username,ADMIN_PASSWORD_HASH:config.passwordHash,ADMIN_SESSION_SECRET:config.sessionSecret,SUPABASE_URL:"https://example.supabase.co",SUPABASE_SERVICE_ROLE_KEY:"test-key"});
delete process.env.VERCEL;
const course={id:"TEST",name:"Test",dept:"English",credits:1,grade_level:[9],prereqs:[],concurrent_ok:[],grad_category:"english",grad_credits:1,grade_reqs:{}};
async function call(handler,body,{cookie=true,method="POST",origin="http://localhost:5179"}={}) {
  const req={method,body,headers:{host:"localhost:5179",origin,"content-type":"application/json",...(cookie?{cookie:"kalani-admin-local="+createSession(config)}:{})},socket:{remoteAddress:"127.0.0.1"}};
  const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(text){this.body=JSON.parse(text);}};
  await handler(req,res);return res;
}
test("password hashes and sessions reject tampering, expiry and password rotation",()=>{
  assert(verifyPassword(password,config.passwordHash));assert(!verifyPassword("wrong",config.passwordHash));
  assert(!verifyPassword(password,"invalid"));assert(!verifyPassword("x".repeat(513),config.passwordHash));
  const token=createSession(config,1000000);
  assert(verifySession(token,config,1000001));assert(!verifySession(token+"x",config,1000001));
  assert(!verifySession(token,config,1000000+SESSION_SECONDS*1000));
  assert(!verifySession(token,{...config,passwordHash:hashPassword("changed")},1000001));
});
test("cookies are HttpOnly and Secure on HTTPS; cross-origin writes are rejected",()=>{
  const req={headers:{host:"example.com","x-forwarded-proto":"https",origin:"https://evil.test","content-type":"application/json"}};
  assert.match(sessionCookie(req,"token"),/__Host-kalani-admin=.*HttpOnly.*SameSite=Strict.*Secure/);
  assert.throws(()=>requireSameOrigin(req),/origin/);
});
test("CSV rejects malformed quotes, partial numbers and JSON instead of silently replacing values",()=>{
  assert.throws(()=>readCsvRows('id,name\nX,"unfinished'),/Unclosed/);
  const header="id,name,dept,credits,grade_level,prereqs,grade_reqs\n";
  assert.throws(()=>parseCourseCsv(header+'TEST,Test,English,1junk,9,,{}'),/row 2.*number/);
  assert.throws(()=>parseCourseCsv(header+'TEST,Test,English,-1,9,,{}'),/number/);
  assert.throws(()=>parseCourseCsv(header+'TEST,Test,English,1,9,,bad'),/row 2/);
  assert.throws(()=>parseCourseCsv('id,name\nTEST,Test'),/column/);
  const [row]=parseCourseCsv(header+'TEST,Test,English,1,9,123,{}',{normalize:true});
  assert.deepEqual(row.prereqs,["123"]);assert.equal(row.archived,undefined);
});
test("course validation rejects unknown references and duplicate batch IDs",()=>{
  assert.throws(()=>validateCourseReferences([{...course,prereqs:["unknown"]}],[]),/unknown prerequisite/);
  assert.throws(()=>validateCourseReferences([course,course],[]),/Duplicate/);
  assert.throws(()=>validateCourseReferences([{...course,grade_reqs:{OTHER:{nested:"object"}}}],[]),/must be text/);
});
test("admin endpoint rejects unauthenticated, cross-origin and unbounded mutations",async()=>{
  assert.equal((await call(dataHandler,{table:"courses",action:"select"},{cookie:false})).statusCode,401);
  assert.equal((await call(dataHandler,{table:"courses",action:"select"},{origin:"https://evil.test"})).statusCode,403);
  assert.equal((await call(dataHandler,{table:"admin_users",action:"select"})).statusCode,400);
  assert.equal((await call(dataHandler,{table:"courses",action:"update",payload:course})).statusCode,400);
});
test("admin API reports missing rows and protects independent graduation credit values",async(t)=>{
  const original=globalThis.fetch;let stored=structuredClone(course);
  globalThis.fetch=async(input,init)=>{
    const url=String(input);const method=init?.method||"GET";
    if(method==="GET")return new Response(JSON.stringify(url.includes('select=id')?[{id:"TEST"}]:stored),{headers:{"Content-Type":"application/json"}});
    if(method==="PATCH"){stored={...stored,...JSON.parse(init.body)};return new Response(JSON.stringify([{id:stored.id}]),{headers:{"Content-Type":"application/json"}});}
    throw new Error("Unexpected database request");
  };
  t.after(()=>{globalThis.fetch=original;});
  const update=await call(dataHandler,{table:"courses",action:"update",filter:{column:"id",value:"TEST"},payload:{name:"Edited",grad_credits:0.5}});
  assert.equal(update.statusCode,200);assert.equal(stored.grad_credits,.5);
  stored=null;
  assert.equal((await call(dataHandler,{table:"courses",action:"update",filter:{column:"id",value:"TEST"},payload:{name:"Gone"}})).statusCode,404);
});
test("session login fails closed when rate limiter refuses or is unavailable",async(t)=>{
  const original=globalThis.fetch;let allow=false;
  globalThis.fetch=async()=>new Response(JSON.stringify(allow),{headers:{"Content-Type":"application/json"}});
  t.after(()=>{globalThis.fetch=original;});
  assert.equal((await call(sessionHandler,{username:config.username,password},{cookie:false})).statusCode,429);
  allow=true;
  assert.equal((await call(sessionHandler,{username:config.username,password:"wrong"},{cookie:false})).statusCode,401);
  const login=await call(sessionHandler,{username:config.username,password},{cookie:false});
  assert.equal(login.statusCode,200);assert.match(login.headers["Set-Cookie"],/HttpOnly/);
});
