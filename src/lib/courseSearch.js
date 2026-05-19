import { sortCourses } from "./courseRules.js";



// Search index helpers for course lookup.

export function buildCourseSearchIndex(courses) {
  const index = new Map();
  for (const c of courses) {
    // name/code/dept/id → searched as substrings (precise fields)
    const nameText = [c.name, c.code, c.dept, c.id,
      c.ctePath, c.fineArtsType, c.miscType]
      .filter(Boolean).join(" ");
    // desc/tips → tokenised into individual words for whole-word matching only
    const descWords = new Set(
      [c.desc, c.tips].filter(Boolean).join(" ")
        .toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(w => w.length > 2)
    );
    index.set(c.id, { course: c, nameText: normalizeSearchText(nameText), descWords });
  }
  return index;
}

function normalizeSearchText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function filterIndexedCourses(index, query, limit) {
  if (!query || !query.trim()) return [];
  const queryText = normalizeSearchText(query);
  if (!queryText) return [];
  const tokens = queryText.split(/\s+/).filter(Boolean);
  const queryCompact = queryText.replace(/\s/g, "");
  const results = [];
  for (const { course, nameText, descWords } of index.values()) {
    let score = 0;
    const nameLow = normalizeSearchText(course.name);
    const nameCompact = nameLow.replace(/\s/g, "");

    if (nameLow === queryText || nameCompact === queryCompact) {
      score += 1000;
    } else if (nameLow.startsWith(queryText + " ") || nameCompact.startsWith(queryCompact)) {
      score += 700;
    } else if (nameLow.includes(queryText)) {
      score += 500;
    }

    for (const token of tokens) {
      // Tier 1 (10): exact full-name match
      if (nameLow === token) { score += 100; continue; }
      // Tier 2 (7): name starts with token (e.g. "AP " matches all AP courses)
      if (nameLow.startsWith(token + " ") || nameLow === token) { score += 70; continue; }
      // Tier 3 (5): name contains token as word (e.g. "calculus" in "AP Calculus")
      if (nameLow.split(" ").some(word => word.startsWith(token))) { score += 50; continue; }
      // Tier 4 (3): code / dept / id / pathway substring match
      if (nameText.includes(token)) { score += 3; continue; }
      // Tier 5 (1): whole-word match in description only — no substring
      if (descWords.has(token)) { score += 1; }
    }
    if (score > 0) results.push({ course, score });
  }
  results.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return sortCourses([a.course, b.course])[0] === a.course ? -1 : 1;
  });
  const out = results.map(r => r.course);
  return limit ? out.slice(0, limit) : out;
}
