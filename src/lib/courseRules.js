import { COURSES } from "../data/courses.js";

import { DEPT_COLORS, DEPT_ORDER } from "../data/constants.js";

import { PREREQ_EQUIV } from "../data/requirements.js";



// Course normalization, lookup, display, and sorting helpers.

export function getCourseSlots(course) {
  if (!course) return 0;
  return course.isOffCampus || course.id === "OFF_CAMPUS" ? 1 : (course.credits || 0);
}

export function getCourse(id) { return COURSES.find(c => c.id === id); }

export function normalizeCourse(row) {
  // Convert Supabase row (snake_case, pg arrays) back to the shape the app expects
  return {
    id:                  row.id,
    code:                row.code || "",
    name:                row.name,
    subtitle:            row.subtitle || "",
    dept:                row.dept,
    language:            row.language || "",
    ctePath:             row.cte_path || "",
    fineArtsType:        row.fine_arts_type || "",
    miscType:            row.misc_type || "",
    credits:             row.credits,
    gradeLevel:          row.grade_level || [],
    prereqs:             row.prereqs || [],
    concurrentOk:        row.concurrent_ok || [],
    gradCategory:        row.grad_category || null,
    gradCredits:         row.grad_credits ?? null,
    isAP:                row.is_ap || false,
    repeatable:          row.repeatable || false,
    teacherSigRequired:  row.teacher_sig_required || false,
    isOffCampus:         row.is_off_campus || false,
    desc:                row.desc || "",
    tips:                row.tips || "",
    gradeReqs:           row.grade_reqs || {},
    // Off Campus special fields — not stored in Supabase, injected here
    ...(row.is_off_campus ? {
      eligibility: [
        "Met ALL graduation requirements (except ELA 12 & Social Studies)",
        "Completed the Personal Transition Plan (PTP)",
        "Have a qualifying reason (see below)",
      ],
      reasons: [
        { label:"✅ Early graduation (Semester A only)", limit:"One semester maximum — Grade 12 Sem A only" },
        { label:"🟡 Work study / employment during school day", limit:"Requires proof of employment + counselor approval" },
      ],
      submissions: [
        "Google Off Campus Request Form (submitted online)",
        "Parent/guardian signature on the request form",
        "Counselor approval prior to off campus period",
      ],
      warning: "Off Campus approval is not automatic. All three eligibility conditions must be met and administrative approval granted.",
      deadline: "See counselor for current deadline",
    } : {}),
  };
}

function normalizeCourseSortName(course) {
  const rawName = (course?.name || "").toLowerCase();
  return rawName
    .replace(/&/g, " and ")
    .replace(/\([^)]*\)/g, " ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getCourseSortParts(course) {
  const normalized = normalizeCourseSortName(course);
  const isAP = Boolean(course?.isAP || course?.is_ap || /\bap\b/.test(normalized));
  const isHonors = /\bhonors?\b/.test(normalized);
  const rigorRank = isAP ? 2 : isHonors ? 1 : 0;
  const levelMatch = normalized.match(/\b([1-4])\b/);
  const level = levelMatch ? Number(levelMatch[1]) : (rigorRank === 0 ? 0 : 99);
  const baseName = normalized
    .replace(/\bap\b/g, " ")
    .replace(/\bhonors?\b/g, " ")
    .replace(/\bgrade\s+\d+\s+track\b/g, " ")
    .replace(/\byears?\s+\d+\s+(?:and|or)\s+\d+\b/g, " ")
    .replace(/\b[1-4]\b/g, " ")
    .replace(/\s+/g, " ")
    .trim() || normalized;
  const lowestGrade = Math.min(...(course?.gradeLevel || course?.grade_level || [99]));

  return { baseName, level, rigorRank, lowestGrade, displayName: normalized };
}

export function sortCourses(arr) {
  return [...arr].sort((a, b) => {
    // 1. Dept order
    const di = DEPT_ORDER.indexOf(a.dept);
    const dj = DEPT_ORDER.indexOf(b.dept);
    if (di !== dj) return (di === -1 ? 99 : di) - (dj === -1 ? 99 : dj);

    const ai = getCourseSortParts(a);
    const bi = getCourseSortParts(b);
    const groupCompare = ai.baseName.localeCompare(bi.baseName);
    if (groupCompare !== 0) return groupCompare;
    if (ai.level !== bi.level) return ai.level - bi.level;
    if (ai.rigorRank !== bi.rigorRank) return ai.rigorRank - bi.rigorRank;
    if (ai.lowestGrade !== bi.lowestGrade) return ai.lowestGrade - bi.lowestGrade;
    return ai.displayName.localeCompare(bi.displayName);
  });
}

export function getCourseName(id, getCourseForId = getCourse) {
  const c = getCourseForId(id);
  return c ? c.name : id;
}

export function getPrereqDisplay(prereqId, getCourseForId = getCourse) {
  const equivs = PREREQ_EQUIV[prereqId] || [];
  const names = [
    getCourseName(prereqId, getCourseForId),
    ...equivs.map(id => getCourseName(id, getCourseForId)),
  ];
  return names.join(" or ");
}

export function deptColor(dept) { return DEPT_COLORS[dept] || "#6B7280"; }
