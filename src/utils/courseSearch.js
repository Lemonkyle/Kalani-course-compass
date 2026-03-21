function getCourseSearchText(course) {
  return [
    course.name,
    course.subtitle || "",
    course.code || "",
    course.dept || "",
    course.ctePath || "",
    course.fineArtsType || "",
    course.miscType || "",
    course.desc || "",
  ].join(" ").toLowerCase();
}

export function buildCourseSearchIndex(courses) {
  return courses.map((course) => ({
    course,
    searchText: getCourseSearchText(course),
  }));
}

export function filterIndexedCourses(indexedCourses, query, limit = Infinity) {
  const trimmedQuery = query.trim().toLowerCase();
  if (!trimmedQuery) return indexedCourses.slice(0, limit).map(({ course }) => course);

  const matches = [];
  for (const entry of indexedCourses) {
    if (entry.searchText.includes(trimmedQuery)) {
      matches.push(entry.course);
      if (matches.length >= limit) break;
    }
  }
  return matches;
}
