import { useEffect, useMemo, useState } from "react";
import { buildCourseSearchIndex, filterIndexedCourses } from "../lib/courseSearch.js";
import {
  getCourseName as getCourseNameFromData,
  getPrereqDisplay as getPrereqDisplayFromData,
} from "../lib/courseRules.js";
import { getUnmetPrereqs } from "../lib/plannerRules.js";

import { COURSES } from "../data/courses.js";
import { makeHistoricalCatalog, readSaved, validCourseSnapshots } from "../lib/plannerStorage.js";

export function useCourseCatalog(liveCourses, customCourses, plan, catalogStatus) {
  const [searchQuery, setSearchQuery] = useState("");
  const [homeSearch, setHomeSearch] = useState("");
  const [homeSearchFocus, setHomeSearchFocus] = useState(false);
  const [filterGrade, setFilterGrade] = useState("All Grades");
  const [filterDept, setFilterDept] = useState("All");
  const [filterCtePath, setFilterCtePath] = useState("All CTE");
  const [filterFineArts, setFilterFineArts] = useState("All Fine Arts");
  const [filterMisc, setFilterMisc] = useState("All Miscellaneous");
  const [gridKey, setGridKey] = useState(0);
  const [addSearch, setAddSearch] = useState("");

  const [snapshots, setSnapshots] = useState(() => readSaved(localStorage, "kalani-course-snapshots", {}, validCourseSnapshots));
  useEffect(() => {
    if (catalogStatus !== "ready") return;
    setSnapshots(previous => {
      const next = {...previous}; let changed = false;
      for (const course of liveCourses) {
        if (JSON.stringify(next[course.id]) !== JSON.stringify(course)) { next[course.id] = course; changed = true; }
      }
      return changed ? next : previous;
    });
  }, [liveCourses, catalogStatus]);
  useEffect(() => { try { localStorage.setItem("kalani-course-snapshots", JSON.stringify(snapshots)); } catch {} }, [snapshots]);
  const courseById = useMemo(() => makeHistoricalCatalog(liveCourses, customCourses, snapshots, COURSES, plan), [liveCourses, customCourses, snapshots, plan]);
  const indexedCourses = useMemo(() => buildCourseSearchIndex(liveCourses), [liveCourses]);

  function getCourse(id) {
    return courseById.get(id);
  }

  function getCourseName(id) {
    return getCourseNameFromData(id, getCourse);
  }

  function getPrereqDisplay(id) {
    return getPrereqDisplayFromData(id, getCourse);
  }

  function getUnmetPrereqsForCurrentCourses(courseId, completedBefore, completedUpTo) {
    return getUnmetPrereqs(courseId, completedBefore, completedUpTo, getCourse);
  }

  const filteredCourses = useMemo(() => {
    let list = liveCourses;
    if (filterGrade !== "All Grades") {
      list = list.filter(course => (course.gradeLevel || []).some(grade => Number(grade) === filterGrade));
    }
    if (filterDept !== "All") list = list.filter(course => course.dept === filterDept);
    if (filterDept === "CTE" && filterCtePath !== "All CTE") {
      list = list.filter(course => course.ctePath === filterCtePath);
    }
    if (filterDept === "Fine Arts" && filterFineArts !== "All Fine Arts") {
      list = list.filter(course => course.fineArtsType === filterFineArts);
    }
    if (filterDept === "Miscellaneous" && filterMisc !== "All Miscellaneous") {
      list = list.filter(course => course.miscType === filterMisc);
    }
    if (searchQuery.trim()) {
      const allowedIds = new Set(list.map(course => course.id));
      list = filterIndexedCourses(indexedCourses, searchQuery)
        .filter(course => allowedIds.has(course.id));
    }
    return list;
  }, [filterGrade, filterDept, filterCtePath, filterFineArts, filterMisc, searchQuery, liveCourses, indexedCourses]);

  const homeSearchResults = useMemo(
    () => filterIndexedCourses(indexedCourses, homeSearch, 4),
    [homeSearch, indexedCourses]
  );

  const addSearchResults = useMemo(() => {
    if (!addSearch.trim()) return liveCourses.slice(0, 14);
    return filterIndexedCourses(indexedCourses, addSearch, 16);
  }, [addSearch, liveCourses, indexedCourses]);

  return {
    searchQuery,
    setSearchQuery,
    homeSearch,
    setHomeSearch,
    homeSearchFocus,
    setHomeSearchFocus,
    filterGrade,
    setFilterGrade,
    filterDept,
    setFilterDept,
    filterCtePath,
    setFilterCtePath,
    filterFineArts,
    setFilterFineArts,
    filterMisc,
    setFilterMisc,
    gridKey,
    setGridKey,
    addSearch,
    setAddSearch,
    filteredCourses,
    homeSearchResults,
    addSearchResults,
    courseById,
    getCourse,
    getCourseName,
    getPrereqDisplay,
    getUnmetPrereqsForCurrentCourses,
  };
}
