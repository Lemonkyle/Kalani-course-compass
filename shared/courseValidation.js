export const COURSE_DEPARTMENTS = ["English", "Social Studies", "Mathematics", "Science", "Health & PE", "CTE", "World Language", "Fine Arts", "Miscellaneous", "Off Campus"];
export const GRAD_CATEGORIES = ["english", "ss", "math", "science", "wlfa", "pe", "health", "ptp", "electives"];
export function validateCourse(row) {
  if (!row || typeof row !== "object" || Array.isArray(row)) throw new Error("Invalid course record");
  if (typeof row.id !== "string" || !/^[A-Za-z0-9_-]{1,80}$/.test(row.id)) throw new Error("Course ID must contain letters, digits, - or _");
  if (typeof row.name !== "string" || !row.name.trim() || row.name.length > 200) throw new Error(`${row.id}: course name is required (maximum 200 characters)`);
  if (!COURSE_DEPARTMENTS.includes(row.dept)) throw new Error(`${row.id}: unknown department`);
  if (!Number.isFinite(row.credits) || row.credits < 0 || row.credits > 14) throw new Error(`${row.id}: credits must be a number between 0 and 14`);
  if (row.grad_category != null && row.grad_category !== "" && !GRAD_CATEGORIES.includes(row.grad_category)) throw new Error(`${row.id}: unknown graduation category`);
  if (row.grad_credits != null && (!Number.isFinite(row.grad_credits) || row.grad_credits < 0 || row.grad_credits > row.credits)) throw new Error(`${row.id}: graduation credits must be between 0 and course credits`);
  if (!Array.isArray(row.grade_level) || !row.grade_level.length || row.grade_level.some(g=>![9,10,11,12].includes(g))) throw new Error(`${row.id}: select grades 9–12`);
  for (const key of ["prereqs", "concurrent_ok"]) {
    if (!Array.isArray(row[key]) || row[key].some(id=>typeof id !== "string" || !id || id === row.id)) throw new Error(`${row.id}: invalid ${key}`);
  }
  if (!row.grade_reqs || typeof row.grade_reqs !== "object" || Array.isArray(row.grade_reqs)) throw new Error(`${row.id}: grade requirements must be an object`);
  if (Object.values(row.grade_reqs).some(value=>typeof value!=="string" || value.length>500)) throw new Error(`${row.id}: grade requirement descriptions must be text`);
  for (const key of ["code","subtitle","cte_path","fine_arts_type","misc_type","desc","tips"]) {
    if (row[key]!=null && (typeof row[key]!=="string" || row[key].length>20000)) throw new Error(`${row.id}: ${key} must be text (maximum 20000 characters)`);
  }
  for (const key of ["is_ap","repeatable","teacher_sig_required","is_off_campus","archived"]) {
    if (row[key] != null && typeof row[key] !== "boolean") throw new Error(`${row.id}: ${key} must be true or false`);
  }
  return row;
}

export function validateCourseReferences(rows, existingIds) {
  const ids = new Set(existingIds);
  const incoming = new Set();
  for (const row of rows) {
    validateCourse(row);
    if (incoming.has(row.id)) throw new Error(`Duplicate course ID: ${row.id}`);
    incoming.add(row.id); ids.add(row.id);
  }
  for (const row of rows) for (const id of [...row.prereqs, ...row.concurrent_ok]) {
    if (!ids.has(id)) throw new Error(`${row.id}: unknown prerequisite ${id}`);
  }
}
