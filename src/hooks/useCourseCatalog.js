import { useMemo, useState } from "react";
import { buildCourseSearchIndex, filterIndexedCourses } from "../lib/courseSearch.js";
import {
  getCourseName as getCourseNameFromData,
  getPrereqDisplay as getPrereqDisplayFromData,
} from "../lib/courseRules.js";
import { getUnmetPrereqs } from "../lib/plannerRules.js";

export function useCourseCatalog(liveCourses, customCourses) {
  const [searchQuery, setSearchQuery] = useState("");
  const [homeSearch, setHomeSearch] = useState("");
  const [homeSearchFocus, setHomeSearchFocus] = useState(false);
  const [filterDept, setFilterDept] = useState("All");
  const [filterCtePath, setFilterCtePath] = useState("All CTE");
  const [filterFineArts, setFilterFineArts] = useState("All Fine Arts");
  const [filterMisc, setFilterMisc] = useState("All Miscellaneous");
  const [gridKey, setGridKey] = useState(0);
  const [addSearch, setAddSearch] = useState("");

  const allCourses = useMemo(
    () => [...liveCourses, ...customCourses],
    [liveCourses, customCourses]
  );
  const courseById = useMemo(
    () => new Map(allCourses.map(course => [course.id, course])),
    [allCourses]
  );
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
  }, [filterDept, filterCtePath, filterFineArts, filterMisc, searchQuery, liveCourses, indexedCourses]);

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
