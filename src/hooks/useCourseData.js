import { useEffect, useState } from "react";

import { COURSES } from "../data/courses.js";

import { supabase } from "../supabase.js";

import { normalizeCourse, sortCourses } from "../lib/courseRules.js";



export function useCourseData() {
  const [courses, setCourses] = useState(sortCourses(COURSES));

  useEffect(() => {
    async function fetchCourses() {
      if (!supabase) {
        console.warn("[Kalani Compass] Supabase not configured, using local fallback");
        return;
      }

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .or("archived.is.null,archived.eq.false")
        .limit(500);

      if (error) {
        console.error("[Kalani Compass] fetchCourses error:", error.message);
        // Fallback: keep using local COURSES array
        return;
      }
      if (data && data.length > 0) {
        console.log("[Kalani Compass] fetchCourses: got", data.length, "courses from Supabase");
        setCourses(sortCourses(data.map(normalizeCourse)));
      } else {
        console.warn("[Kalani Compass] fetchCourses: empty response, using local fallback");
      }
    }
    fetchCourses();
  }, []);

  return { courses };
}
