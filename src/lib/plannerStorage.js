export const GRADES = [9, 10, 11, 12];
const isId = id => typeof id === "string" && id.length > 0 && id.length <= 100;
export function validPlan(value) {
  return value && !Array.isArray(value) && Object.keys(value).length === 4 && GRADES.every(g => Array.isArray(value[g]) && value[g].length <= 100 && value[g].every(isId));
}
export function validCustomCourses(value) {
  return Array.isArray(value) && value.every(c => c && isId(c.id) && typeof c.name === "string" && typeof c.dept === "string" && Number.isFinite(c.credits) && c.credits >= 0 && c.credits <= 14 && Number.isFinite(c.gradCredits) && c.gradCredits >= 0 && c.gradCredits <= c.credits && Array.isArray(c.gradeLevel));
}
export function validCourseSnapshots(value) {
  return value && !Array.isArray(value) && Object.entries(value).every(([id, course]) =>
    course?.id === id && validCustomCourses([{...course, gradCredits:course.gradCredits ?? 0}]));
}
export function readSaved(storage, key, fallback, validate) {
  try {
    const raw = storage.getItem(key);
    if (raw === null) return structuredClone(fallback);
    try { const value = JSON.parse(raw); if (validate(value)) return value; } catch {}
    storage.setItem(`${key}-recovery-${Date.now()}`, raw);
  } catch {}
  return structuredClone(fallback);
}
export function backupAndReset(storage) {
  const keys = ["kalani-compass-plan", "kalani-prior-credits", "kalani-custom-courses", "kalani-course-snapshots"];
  const backup = Object.fromEntries(keys.map(key => [key, storage.getItem(key)]));
  storage.setItem(`kalani-backup-${Date.now()}`, JSON.stringify(backup));
  keys.forEach(key => storage.removeItem(key));
}
export function makeHistoricalCatalog(live, custom, snapshots, fallback, plan) {
  const result = new Map([...live, ...custom].map(c => [c.id, c]));
  for (const id of new Set(Object.values(plan).flat())) {
    if (result.has(id)) continue;
    const cached = snapshots[id] || fallback.find(c => c.id === id);
    result.set(id, cached ? {...cached, unavailable:true} : {
      id, name:`Unavailable course (${id})`, dept:"Miscellaneous", credits:0, gradCredits:0,
      gradeLevel:[], prereqs:[], concurrentOk:[], unavailable:true, missingSnapshot:true,
    });
  }
  return result;
}
