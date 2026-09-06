import { COURSES } from "../data/courses.js";
import { normalizeCourse, sortCourses } from "../lib/courseRules.js";
import { usePublicQuery } from "./usePublicQuery.js";
async function fetchCourses(db) {
  const rows = [];
  for (let start=0; ; start+=500) {
    const {data,error} = await db.from("courses").select("*").or("archived.is.null,archived.eq.false").order("id").range(start,start+499);
    if (error) throw error;
    rows.push(...data);
    if (data.length < 500) break;
  }
  const courses = sortCourses(rows.map(normalizeCourse));
  try { localStorage.setItem("kalani-catalog-cache", JSON.stringify(courses)); } catch {}
  return courses;
}
function initialCourses() {
  try { const cached = JSON.parse(localStorage.getItem("kalani-catalog-cache")); if (Array.isArray(cached) && cached.every(c=>c && typeof c.id==="string" && Array.isArray(c.gradeLevel) && Number.isFinite(c.credits))) return cached; } catch {}
  return sortCourses(COURSES);
}
export function useCourseData() { const {data:courses,status}=usePublicQuery(fetchCourses,initialCourses); return {courses,status}; }
