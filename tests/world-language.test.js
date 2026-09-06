import test from "node:test";
import assert from "node:assert/strict";
import { COURSES } from "../src/data/courses.js";
import { getCourse, normalizeCourse } from "../src/lib/courseRules.js";
import { calcWlfa, calcPlannerCredits } from "../src/lib/plannerRules.js";
import { getWorldLanguage } from "../src/lib/worldLanguage.js";

const plan = ids => ({ 9:ids, 10:[], 11:[], 12:[] });

test("Japanese and Korean cannot complete the same-language requirement", () => {
  assert.deepEqual(calcWlfa(plan(["JPN1", "KOR1"])), { earned:1, overflow:1 });
  const { cats, total } = calcPlannerCredits(plan(["JPN1", "KOR1"]));
  assert.equal(cats.wlfa, 1);
  assert.equal(cats.electives, 1);
  assert.equal(total, 2);
});

for (const [language, ids] of Object.entries({
  Japanese:["JPN1","JPN2"], Korean:["KOR1","KOR2"],
  Chinese:["CHN1","CHN2"], Spanish:["SPN1","SPN2"],
})) {
  test(`${language} sequence earns two language credits`, () => {
    assert.deepEqual(calcWlfa(plan(ids)), { earned:2, overflow:0 });
  });
}

test("honors and AP courses remain grouped with the same language", () => {
  assert.deepEqual(calcWlfa(plan(["JPN2H","AP_JPN"])), { earned:2, overflow:0 });
});

test("the strongest language is counted and other credit goes to electives", () => {
  assert.deepEqual(calcWlfa(plan(["JPN1","JPN2","JPN3","KOR1","SPN1"])), { earned:2, overflow:3 });
});

test("all current catalog language courses have a known language", () => {
  const languageCourses = COURSES.filter(c => c.dept === "World Language");
  assert.equal(languageCourses.length, 17);
  for (const course of languageCourses) assert.ok(getWorldLanguage(course), course.id);
});

test("Supabase normalization preserves explicitly supplied language metadata", () => {
  const course = normalizeCourse({ id:"FRENCH",name:"Conversation",dept:"World Language",language:"French" });
  assert.equal(getWorldLanguage(course), "french");
});

test("custom semester courses group by their explicit language", () => {
  const extra = {
    CUSTOM_1:{id:"CUSTOM_1", name:"Conversation", dept:"World Language", language:" Japanese ",credits:0.5,gradCredits:0.5,gradCategory:"wlfa"},
    CUSTOM_2:{id:"CUSTOM_2", name:"Reading", dept:"World Language", language:"japanese",credits:0.5,gradCredits:0.5,gradCategory:"wlfa"},
  };
  assert.deepEqual(calcWlfa(plan(["JPN1","CUSTOM_1","CUSTOM_2"]), id => extra[id] || getCourse(id)), {earned:2,overflow:0});
});

test("legacy custom names can identify one language but unknown/mixed names cannot pool", () => {
  assert.equal(getWorldLanguage({name:"Summer Japanese 1",code:"CUSTOM"}), "japanese");
  assert.equal(getWorldLanguage({name:"Japanese and Korean",code:"CUSTOM"}), null);
  const unknown = {id:"UNKNOWN",name:"Summer language course",dept:"World Language",gradCategory:"wlfa",credits:1,gradCredits:1};
  assert.deepEqual(calcWlfa(plan(["JPN1","UNKNOWN"]), id => id === "UNKNOWN" ? unknown : getCourse(id)), {earned:1,overflow:1});
});

test("Fine Arts and same-pathway CTE alternatives still work", () => {
  const fixture = (id,dept,ctePath) => ({id,dept,ctePath,gradCategory:"wlfa",gradCredits:1,credits:1});
  const lookup = new Map([
    fixture("ART","Fine Arts"), fixture("MUSIC","Fine Arts"),
    fixture("CTE1","CTE","Engineering"), fixture("CTE2","CTE","Engineering"),
    fixture("CTE3","CTE","Business"),
  ].map(c=>[c.id,c]));
  assert.deepEqual(calcWlfa(plan(["ART","MUSIC"]), id=>lookup.get(id)), {earned:2,overflow:0});
  assert.deepEqual(calcWlfa(plan(["CTE1","CTE2"]), id=>lookup.get(id)), {earned:2,overflow:0});
  assert.deepEqual(calcWlfa(plan(["CTE1","CTE3"]), id=>lookup.get(id)), {earned:1,overflow:1});
  assert.deepEqual(calcWlfa(plan([])), {earned:0,overflow:0});
});
