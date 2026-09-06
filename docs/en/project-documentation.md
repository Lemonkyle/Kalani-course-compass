# Kalani Course Compass Project Documentation

Last updated: September 5, 2026

## Product Overview

Kalani Course Compass is an unofficial 4-year course planning tool for Kalani High School students. It helps students browse the course catalog, understand prerequisites and concurrent-course rules, build a grade 9-12 plan, track graduation credits, and review curated Course Match templates.

The app is student-facing first, with an admin area for maintaining courses, announcements, disclaimers, and page maintenance settings.

The current scope is primarily Kalani's own courses. HOC, dual credit, Running Start, Early College, and IB have no dedicated eligibility, credit-conversion, or honors-equivalency rules. Students may record them as ordinary custom courses. AP progress uses the course's AP flag; external program equivalencies are not inferred.

World Language requires two credits in the same language. Each language is accumulated separately; the strongest group counts toward the requirement and remaining credit follows the existing elective-overflow rule. Current catalog languages are identified by stable Japanese/Korean/Chinese/Spanish course-code families. Custom language courses require a language entry. Existing custom names are recognized only when they identify one supported language; unidentified language credit remains elective credit rather than pooling unknown languages. Extend `src/lib/worldLanguage.js` when adding a new school language/code family.

## Current Architecture

| Area | Responsibility |
| --- | --- |
| `src/main.jsx` | React entry point, lazy-loads student/admin app, includes runtime error boundary. |
| `src/App.jsx` | Student app shell: composes pages, navigation, announcement banners, modals, and page context. |
| `src/pages/` | Student pages: Home, Catalog, Planner, Course Match. |
| `src/components/` | Domain UI components for course, planner, match, and shared UI. |
| `src/hooks/` | Supabase read hooks plus local planner storage, course catalog/search state, startup disclaimer state, site settings, page maintenance, and transient UI feedback. |
| `src/lib/` | Pure rules and utilities: course sorting/search, planner credits, prerequisites, honors, safe URLs. |
| `src/data/` | Static fallback data, requirements, constants, disclaimers, site settings, and Course Match templates. |
| `src/admin/` | Admin shell and management panels. |
| `supabase/` | Supabase setup SQL for RLS and admin access. |
| `docs/en`, `docs/zh` | English and Chinese maintenance documentation. |

## Data Flow

1. `src/supabase.js` creates a Supabase client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist.
2. `useCourseData()` reads active courses from Supabase and falls back to `src/data/courses.js` if Supabase is unavailable.
3. `usePlannerStorage()` owns browser-local planner state, prior prerequisite credits and custom courses; card keys derive from course occurrences.
4. `useCourseCatalog()` combines active courses, browser-local custom courses and snapshots for unavailable planned courses into one lookup and owns student-side search/filter state.
5. `useAnnouncements()`, `useDisclaimerItems()`, `usePageMaintenance()`, and `useSiteSettings()` read managed content from Supabase with static fallbacks where applicable.
6. Startup disclaimer dismissal remains in browser `localStorage`.
7. Graduation, prerequisite, planner capacity, and honors calculations run in the browser through pure helpers in `src/lib/`.
8. Admin writes go through api/admin/ with a server-verified username/password session. Public Supabase clients only read content.

## Refactor Status

The first maintenance refactor split the largest student-side files:

- `src/App.jsx` was reduced to the app shell, page composition, and shared action wiring.
- Student pages moved to `src/pages/`.
- Large modals moved to domain component folders.
- Local planner persistence moved to `src/hooks/usePlannerStorage.js`.
- Course lookup, search, and catalog filtering moved to `src/hooks/useCourseCatalog.js`.
- Startup disclaimer state moved to `src/hooks/useStartupDisclaimer.js`.
- Toast and shake feedback state moved to `src/hooks/useTransientUi.js`.
- Global app CSS moved to `src/components/shared/AppStyles.jsx`.
- `src/lib/utils.jsx` was removed and replaced by focused modules in `src/lib/`, `src/hooks/`, and `src/components/shared/`.
- `src/lib/data.js` was removed and replaced by focused modules in `src/data/`.
- Human-readable docs now live in language-specific folders.
- The root README now uses English first, then Chinese, and links to both language-specific doc sets.

## Maintenance Guidance

- Add new student pages under `src/pages/` and pass only the state/actions they need through the page context.
- Put reusable UI in `src/components/shared/` only when it is genuinely cross-domain.
- Keep business rules in `src/lib/*.js` as pure functions whenever possible.
- Keep Supabase reads in `src/hooks/`; keep Supabase client setup in `src/supabase.js`.
- Keep static fallback data in `src/data/` and preserve stable course IDs.
- Do not change `localStorage` keys without adding migration or fallback logic.
- Update the root README plus both `docs/en/` and `docs/zh/` when changing setup, architecture, security, or handoff guidance.

## September 2026 cloud update

- Grade placement, prerequisites and extra annual core-subject coursework are advisory and can be accepted with **Add Anyway**, including transfer and make-up courses. English, Mathematics, Social Studies and Science use a typical 1-credit annual load; two 0.5-credit entries count as one yearly load. Duplicate non-repeatable courses, unavailable records and total planner capacity remain protected.
- Course-detail grade buttons animate between the grade label, **Added!** and removal states, with keyboard/touch operation and reduced-motion support. The same planning reminders appear in catalog details, planner search, custom-course entry and template review.
- Same-language World Language credits; custom outside programs have no separate equivalency rules.
- Historical course snapshots and recoverable invalid-storage backups.
- Six clearly labeled example templates validated for current course grades, prerequisites and all graduation-credit categories. The existing Course Match maintenance switch is preserved.
- Hawaii-time announcements; explicit empty-content handling; refreshed public data and accurate catalog counts.
- Validated CSV imports, independent graduation credit editing, and visible save/read errors.
- Node.js administrator API, two incremental Supabase migrations, pinned dependencies, automated regression tests and CI.

See [security setup](security-setup.md) for deployment and rollback requirements.
