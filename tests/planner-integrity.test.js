import test from "node:test";
import assert from "node:assert/strict";
import { COURSES } from "../src/data/courses.js";
import { DEFAULT_PLAN } from "../src/data/requirements.js";
import { COURSE_MATCH_TEMPLATES } from "../src/data/courseMatchTemplates.js";
import { planAdditionError, planAdditionWarnings, getCoreLoadWarnings, calcPlannerCredits } from "../src/lib/plannerRules.js";
import { assessTemplate } from "../src/lib/templateRules.js";
import { makeHistoricalCatalog, readSaved, validPlan, validCustomCourses, validCourseSnapshots, backupAndReset } from "../src/lib/plannerStorage.js";
import { fromSchoolInput, toSchoolInput } from "../src/lib/schoolTime.js";
const empty=()=>({9:[],10:[],11:[],12:[]});
const get=id=>COURSES.find(c=>c.id===id);

test("uncategorized school courses do not invalidate the whole history cache",()=>{
  assert.equal(validCourseSnapshots({ELA1:{...get("ELA1"),gradCategory:null,gradCredits:null}}),true);
  assert.equal(validCourseSnapshots({ELA1:{...get("ELA1"),credits:"invalid"}}),false);
  assert.equal(validPlan({...DEFAULT_PLAN, unexpected:[]}),false);
});

test("capacity, duplicate and unavailable checks remain enforced",()=>{
  assert.equal(planAdditionError(empty(),10,get("AP_ENG3")),null);
  assert.match(planAdditionError(DEFAULT_PLAN,9,get("ELA1")),/already/);
  assert.match(planAdditionError(empty(),9,{...get("ELA1"),unavailable:true}),/unavailable/);
  assert.match(planAdditionError({9:Array(14).fill("ELA1")},9,get("ISCI")),/room/);
});
test("a transfer student can plan ELA1 in grade 12 after a grade reminder",()=>{
  const plan={...empty(),12:["ELA4"]};
  assert.equal(planAdditionError(plan,12,get("ELA1")),null);
  const warnings=planAdditionWarnings(plan,12,get("ELA1"));
  assert.deepEqual(warnings.map(w=>w.code),["grade","workload"]);
  assert.match(warnings[0].message,/Grade 9.*Grade 12/);
  assert.match(warnings[1].message,/2 English credits/);
});
for(const [first,second,grade] of [["PID","MHH",9],["ECON","AP_MACRO",12],["ECON","PSYCH",12]]) {
  test(`${first} + ${second} counts as one yearly Social Studies load`,()=>{
    const plan={...empty(),11:["WH"],[grade]:[first]};
    assert.equal(planAdditionError(plan,grade,get(second)),null);
    assert.deepEqual(planAdditionWarnings(plan,grade,get(second)),[]);
  });
}
test("a third half-credit Social Studies course is allowed with a load reminder",()=>{
  const plan={...empty(),12:["ECON","AP_MACRO"]};
  assert.equal(planAdditionError(plan,12,get("PSYCH")),null);
  assert.match(planAdditionWarnings(plan,12,get("PSYCH"))[0].message,/1.5 Social Studies credits/);
});
test("each core department warns by credits while other departments remain unrestricted",()=>{
  for(const dept of ["English","Mathematics","Social Studies","Science"]) {
    const first={id:"A",name:"A",dept,credits:1,gradCredits:0,gradeLevel:[12],prereqs:[]};
    const second={...first,id:"B",name:"B"};
    const get=id=>id==="A"?first:second;
    const plan={...empty(),12:["A"]};
    assert.equal(planAdditionError(plan,12,second,get),null);
    assert.deepEqual(planAdditionWarnings(plan,12,second,get).map(w=>w.code),["workload"]);
    assert.deepEqual(getCoreLoadWarnings([{...first,credits:.5},{...second,credits:.5}],12),[]);
  }
  assert.deepEqual(getCoreLoadWarnings([{dept:"World Language",credits:3}],12),[]);
});
test("grade, workload and prerequisites are combined; prior credits satisfy prerequisite reminders",()=>{
  const plan={...empty(),12:["ELA4"]};
  assert.deepEqual(planAdditionWarnings(plan,12,get("ELA2")).map(w=>w.code),["grade","workload","prerequisite"]);
  assert.deepEqual(planAdditionWarnings(plan,12,get("ELA2"),get,["ELA1"]).map(w=>w.code),["grade","workload"]);
});
test("advisories concern the selected subject, and disappear when extra coursework is removed",()=>{
  const plan={...empty(),12:["ECON","PSYCH","AP_MACRO"]};
  assert.equal(getCoreLoadWarnings(plan[12].map(get),12).length,1);
  assert.deepEqual(planAdditionWarnings(plan,12,get("ELA4"),get,["ELA3"]),[]);
  plan[12].pop();
  assert.deepEqual(getCoreLoadWarnings(plan[12].map(get),12),[]);
});
test("valid paired Social Studies and English electives can share a year",()=>{
  const plan=empty();plan[9]=["PID"];
  assert.equal(planAdditionError(plan,9,get("MHH")),null);
});
test("a template can include a grade exception, with a warning instead of an error",()=>{
  const result=assessTemplate({...empty(),12:["ELA1"]},get);
  assert.deepEqual(result.errors,[]);
  assert(result.warnings.some(message=>message.includes("Transfer or make-up")));
});
test("archived snapshots keep planned credits and unknown IDs remain removable",()=>{
  const plan={...empty(),9:["ELA1","REMOVED"]};
  const map=makeHistoricalCatalog([],[],{ELA1:get("ELA1")},[],plan);
  assert.equal(map.get("ELA1").unavailable,true);
  assert.equal(calcPlannerCredits(plan,id=>map.get(id)).cats.english,1);
  assert.equal(map.get("REMOVED").missingSnapshot,true);
});
test("active catalog records supersede historical snapshots",()=>{
  const map=makeHistoricalCatalog([{...get("ELA1"),name:"Updated"}],[],{ELA1:get("ELA1")},[],DEFAULT_PLAN);
  assert.equal(map.get("ELA1").name,"Updated");
  assert.equal(map.get("ELA1").unavailable,undefined);
});
test("invalid saved data is backed up before recovery; custom data is included in reset backup",()=>{
  const data=new Map([["kalani-compass-plan",'{"9":null}'],["kalani-custom-courses",'{"invalid":true}']]);
  const storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)};
  assert.deepEqual(readSaved(storage,"kalani-compass-plan",DEFAULT_PLAN,validPlan),DEFAULT_PLAN);
  assert([...data.keys()].some(k=>k.includes("recovery")));
  assert.equal(validCustomCourses({}),false);
  backupAndReset(storage);
  const saved=JSON.parse([...data].find(([k])=>k.startsWith("kalani-backup-"))[1]);
  assert.equal(saved["kalani-custom-courses"],'{"invalid":true}');
  assert(!data.has("kalani-custom-courses"));
});
test("Hawaii scheduled times round-trip across UTC date boundaries without browser timezone",()=>{
  assert.equal(fromSchoolInput("2026-09-05T18:30"),"2026-09-06T04:30:00.000Z");
  assert.equal(toSchoolInput("2026-09-06T04:30:00Z"),"2026-09-05T18:30");
  assert.throws(()=>fromSchoolInput("2026-02-30T12:00"));
  assert.equal(fromSchoolInput(""),null);
});
for(const template of COURSE_MATCH_TEMPLATES)test(`${template.title}: valid grade sequence, prerequisites and graduation categories`,()=>{
  const result=assessTemplate(template.plan,get);
  assert.deepEqual(result.errors,[]);assert.deepEqual(result.warnings.filter(message=>!message.includes("A typical yearly plan")),[]);assert.deepEqual(result.missing,[]);
  assert(result.total>=24);
});
