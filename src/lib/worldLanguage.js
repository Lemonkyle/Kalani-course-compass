// Hawaii course-code families used by Kalani's current language catalog.
const LANGUAGE_CODES = { WAJ: "japanese", WAK: "korean", WAC: "chinese", WES: "spanish" };

export const WORLD_LANGUAGES = ["Japanese", "Korean", "Chinese", "Spanish"];

export function getWorldLanguage(course) {
  const explicit = typeof course?.language === "string" ? course.language.trim().toLowerCase() : "";
  if (explicit) return explicit.replace(/\s+/g, " ");

  const fromCode = LANGUAGE_CODES[course?.code?.toUpperCase().slice(0, 3)];
  if (fromCode) return fromCode;

  // Recover existing custom entries only when their name identifies one language.
  const names = new Set(course?.name?.toLowerCase().match(/\b(japanese|korean|chinese|spanish)\b/g) || []);
  return names.size === 1 ? [...names][0] : null;
}
