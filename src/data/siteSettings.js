export const DEFAULT_SITE_SETTINGS = {
  catalog_year_label: "2026-2027",
  catalog_source_title: "Kalani High School 2026-2027 Registration Guide & Course Catalog",
  catalog_source_url: "https://www.kalanihighschool.org/admissions/course-registration-information/",
  catalog_last_reviewed: "March 2026",
};

export function normalizeSiteSettings(rows = []) {
  return rows.reduce((settings, row) => {
    if (!row?.key) return settings;
    return { ...settings, [row.key]: row.value || "" };
  }, { ...DEFAULT_SITE_SETTINGS });
}
