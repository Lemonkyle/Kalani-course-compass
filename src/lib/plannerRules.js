import { GRAD_REQUIREMENTS } from "../data/constants.js";

import { PREREQ_EQUIV } from "../data/requirements.js";

import { getCourse, getCourseSlots } from "./courseRules.js";
import { getWorldLanguage } from "./worldLanguage.js";



export const GRADE_MAX = 14.0;

export function planAdditionError(plan, grade, course, getCourseForId = getCourse) {
  if (![9,10,11,12].includes(Number(grade)) || !course || course.unavailable) return "This course is unavailable for new plans.";
  if (!course.repeatable && Object.values(plan).flat().includes(course.id)) return "This course is already in your plan.";
  if (gradeSlots(plan, grade, getCourseForId) + getCourseSlots(course) > GRADE_MAX) return `Grade ${grade} does not have enough room for this course.`;
  return null;
}

const CORE_DEPARTMENTS = ["English", "Mathematics", "Social Studies", "Science"];

// Two semester courses make one year-long load, regardless of catalog titles.
export function getCoreLoadWarnings(courses, grade) {
  return CORE_DEPARTMENTS.flatMap(dept => {
    const credits = courses.filter(course => course?.dept === dept)
      .reduce((total, course) => total + (course.credits || 0), 0);
    return credits > 1 + 1e-8 ? [{
      code: "workload", dept,
      message: `Grade ${grade} has ${Number(credits.toFixed(2))} ${dept} credits. A typical yearly plan has 1 credit in this subject: one year-long course or two 0.5-credit courses.`,
    }] : [];
  });
}

// Guidance is advisory; unavailable courses, duplicates and total capacity
// remain data-integrity checks in planAdditionError.
export function planAdditionWarnings(plan, grade, course, getCourseForId = getCourse, priorCredits = []) {
  if (!course || course.unavailable || ![9, 10, 11, 12].includes(Number(grade))) return [];
  const warnings = [];
  const listedGrades = (course.gradeLevel || []).map(Number);
  if (listedGrades.length && !listedGrades.includes(Number(grade))) {
    warnings.push({code: "grade", message: `${course.name} is normally listed for Grade ${listedGrades.join("/")}, rather than Grade ${grade}. Transfer or make-up coursework may be an exception.`});
  }
  warnings.push(...getCoreLoadWarnings([
    ...(plan[grade] || []).map(getCourseForId), course,
  ], grade).filter(warning => warning.dept === course.dept));
  const before = [...getCoursesBeforeGrade(plan, grade), ...priorCredits];
  const upTo = [...getAllCoursesUpTo(plan, grade), ...priorCredits];
  const unmet = getUnmetPrereqs(course.id, before, upTo, id => id === course.id ? course : getCourseForId(id));
  if (unmet.length) {
    warnings.push({code: "prerequisite", message: `Prerequisites not yet recorded in your plan: ${unmet.map(id => getCourseForId(id)?.name || id).join(", ")}.`});
  }
  return warnings;
}



// Planner capacity, prerequisites, and graduation-credit calculations.

export function gradeSlots(plan, grade, getCourseForId = getCourse) {
  return (plan[grade] || []).reduce((s, cid) => {
    return s + getCourseSlots(getCourseForId(cid));
  }, 0);
}

export function isPrereqSatisfied(prereqId, completedIds) {
  if (completedIds.includes(prereqId)) return true;
  const equivs = PREREQ_EQUIV[prereqId] || [];
  return equivs.some(eq => completedIds.includes(eq));
}

export function getCoursesBeforeGrade(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) < targetGrade)
    .flatMap(([, ids]) => ids);
}

export function getAllCoursesUpTo(plan, targetGrade) {
  return Object.entries(plan)
    .filter(([g]) => Number(g) <= targetGrade)
    .flatMap(([, ids]) => ids);
}

export function getUnmetPrereqs(courseId, completedBefore, completedUpTo, getCourseForId = getCourse) {
  const course = getCourseForId(courseId);
  if (!course) return [];
  const strictUnmet = (course.prereqs||[]).filter(pid => !isPrereqSatisfied(pid, completedBefore));
  const concurrentUnmet = (course.concurrentOk||[]).filter(pid => !isPrereqSatisfied(pid, completedUpTo||completedBefore));
  return [...strictUnmet, ...concurrentUnmet];
}

export function calcWlfa(plan, getCourseForId = getCourse) {
  // WLFA requires 2 credits in ONE of: same World Language, any Fine Arts, same CTE pathway
  // Returns { earned, overflow } where overflow flows to electives
  const allIds = Object.values(plan).flat();
  const allCourses = allIds.map(getCourseForId).filter(Boolean);
  const wlfaCourses = allCourses.filter(c => c.gradCategory === "wlfa");

  // Only the strongest single-language sequence counts toward this requirement.
  const languageCredits = new Map();
  wlfaCourses.filter(c => c.dept === "World Language").forEach(course => {
    const language = getWorldLanguage(course);
    if (!language) return; // Unidentified custom languages remain elective credit.
    languageCredits.set(language, (languageCredits.get(language) || 0) + course.gradCredits);
  });
  const worldLangMax = Math.max(0, ...languageCredits.values());

  // Fine Arts: all fine arts credits pool together (can mix Performing/Visual)
  const fineArtsTotal = wlfaCourses
    .filter(c => c.dept === "Fine Arts")
    .reduce((s, c) => s + c.gradCredits, 0);

  // CTE: group by ctePath
  const cteGroups = {};
  wlfaCourses.filter(c => c.dept === "CTE").forEach(c => {
    const path = c.ctePath;
    if (!path) return;
    cteGroups[path] = (cteGroups[path] || 0) + c.gradCredits;
  });
  const cteMax = Object.values(cteGroups).reduce((m, v) => Math.max(m, v), 0);

  const bestSingle = Math.max(worldLangMax, fineArtsTotal, cteMax);
  const earned = Math.min(2.0, bestSingle);

  // Overflow = total wlfa credits planned minus what counts toward the requirement
  const totalWlfa = wlfaCourses.reduce((s, c) => s + c.gradCredits, 0);
  const overflow = Math.max(0, totalWlfa - earned);

  return { earned, overflow };
}

export function calcPlannerCredits(plan, getCourseForId = getCourse) {
  const raw = {};
  GRAD_REQUIREMENTS.forEach(r => { raw[r.id] = 0; });
  let total = 0;

  // First pass: accumulate all non-wlfa categories
  Object.values(plan).forEach(courses => {
    courses.forEach(cid => {
      const c = getCourseForId(cid);
      if (!c) return;
      total += c.credits;
      if (!c.gradCategory || c.gradCredits == null) return;
      if (c.gradCategory === "wlfa") return; // handled separately
      if (c.gradCategory === "electives") { raw.electives += c.gradCredits; return; }
      const req = GRAD_REQUIREMENTS.find(r => r.id === c.gradCategory);
      if (!req) return;
      const space = Math.max(0, req.required - raw[c.gradCategory]);
      const used = Math.min(c.gradCredits, space);
      raw[c.gradCategory] += used;
      raw.electives += (c.gradCredits - used);
    });
  });

  // WLFA: use pathway-aware calculation
  const { earned: wlfaEarned, overflow: wlfaOverflow } = calcWlfa(plan, getCourseForId);
  raw.wlfa = wlfaEarned;
  raw.electives += wlfaOverflow;

  const cats = {};
  GRAD_REQUIREMENTS.forEach(r => { cats[r.id] = Math.min(raw[r.id] || 0, r.required); });
  return { cats, total };
}
