import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyExternalForm,buildExternalCourse,migrateExternalCourses,externalForm} from '../src/lib/externalCourses.js';
import {calcPlannerCredits,calcWlfa,getUnmetPrereqs,gradeSlots} from '../src/lib/plannerRules.js';
import {validCustomCourses} from '../src/lib/plannerStorage.js';
import {computeHonorsProgress} from '../src/lib/honorsRules.js';
const plan={9:['CUSTOM_test'],10:[],11:[],12:[]};
const form={...emptyExternalForm('Dual Credit','Running Start'),name:'Test college course'};
test('unverified drafts cannot contribute credits, categories, slots or Honors even with stale numeric values',()=>{
  const c={...buildExternalCourse({...form,credits:'3',category:'Mathematics'},'CUSTOM_test'),credits:3,gradCredits:3,gradCategory:'math',dept:'Mathematics',isAP:true};
  assert.equal(calcPlannerCredits(plan,()=>c).total,0);
  assert.equal(calcPlannerCredits(plan,()=>c).cats.math,0);
  assert.equal(gradeSlots(plan,9,()=>c),0);
  assert.deepEqual(computeHonorsProgress(plan,()=>c),computeHonorsProgress({9:[],10:[],11:[],12:[]},()=>c));
});
test('confirmation counts selected HS category and revocation removes the credit',()=>{
  const c=buildExternalCourse({...form,credits:'0.5',category:'Mathematics',confirmed:true},'CUSTOM_test');
  assert.equal(calcPlannerCredits(plan,()=>c).cats.math,0.5);
  assert.equal(calcPlannerCredits(plan,()=>c).total,0.5);
  const revoked=buildExternalCourse({...externalForm(c),confirmed:false},c.id);
  assert.equal(calcPlannerCredits(plan,()=>revoked).total,0);
  assert.equal(revoked.externalDraft.credits,'0.5');
});
test('confirmation requires known positive HS credits, category, language or pathway and safe URLs',()=>{
  for(const patch of [{confirmed:true},{confirmed:true,category:'Science',credits:''},{confirmed:true,category:'Science',credits:'-1'},{confirmed:true,category:'Science',credits:'Infinity'},{confirmed:true,category:'World Language',credits:'1'},{confirmed:true,category:'CTE',credits:'1'},{url:'javascript:alert(1)'}])
    assert.throws(()=>buildExternalCourse({...form,...patch},'CUSTOM_test'));
});
test('legacy migration preserves identities and original information and survives JSON reload',()=>{
  const legacy={id:'CUSTOM_test',name:'Old course',dept:'Science',credits:1,gradCredits:1,gradeLevel:[9],isAP:true};
  const result=migrateExternalCourses([legacy]);
  assert.equal(result[0].id,legacy.id);
  assert.deepEqual(result[0].legacyOriginal,legacy);
  assert.equal(result[0].verification,'unverified');
  assert.equal(result[0].externalDraft.credits,1);
  assert.ok(validCustomCourses(result));
  assert.deepEqual(migrateExternalCourses(JSON.parse(JSON.stringify(result))),result);
  assert.equal(calcPlannerCredits(plan,()=>result[0]).total,0);
});
test('external language grouping respects the same-language requirement and ignores pending credits',()=>{
  const make=(id,language,confirmed=true)=>buildExternalCourse({...form,category:'World Language',credits:'1',language,confirmed},id);
  const courses={a:make('a','Japanese'),b:make('b','Korean'),c:make('c','Japanese',false)};
  const p={9:['a','b','c'],10:[],11:[],12:[]};
  assert.equal(calcWlfa(p,id=>courses[id]).earned,1);
  courses.b=make('b','Japanese');
  assert.equal(calcWlfa(p,id=>courses[id]).earned,2);
});
test('confirmed external category alone never grants named prerequisite equivalency or Honors',()=>{
  const c=buildExternalCourse({...form,category:'Mathematics',credits:'4',confirmed:true},'CUSTOM_test');
  const next={id:'NEXT',prereqs:['ALG2']};
  assert.deepEqual(getUnmetPrereqs('NEXT',['CUSTOM_test'],[],id=>id==='NEXT'?next:c),['ALG2']);
  assert.deepEqual(computeHonorsProgress(plan,()=>c),computeHonorsProgress({9:[],10:[],11:[],12:[]},()=>c));
});
