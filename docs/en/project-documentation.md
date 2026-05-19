# Kalani Course Compass Project Documentation

Last updated: May 18, 2026

## Product Overview

Kalani Course Compass is an unofficial 4-year course planning tool for Kalani High School students. It helps students browse the course catalog, understand prerequisites and concurrent-course rules, build a grade 9-12 plan, track graduation credits, and review curated Course Match templates.

The app is student-facing first, with an admin area for maintaining courses, announcements, disclaimers, and page maintenance settings.

## Current Architecture

| Area | Responsibility |
| --- | --- |
| `src/main.jsx` | React entry point, lazy-loads student/admin app, includes runtime error boundary. |
| `src/App.jsx` | Student app shell: composes pages, navigation, announcement banners, modals, and page context. |
| `src/pages/` | Student pages: Home, Catalog, Planner, Course Match. |
| `src/components/` | Domain UI components for course, planner, match, and shared UI. |
| `src/hooks/` | Supabase read hooks plus local planner storage, course catalog/search state, startup disclaimer state, and transient UI state. |
| `src/lib/` | Pure rules and utilities: course sorting/search, planner credits, prerequisites, honors, safe URLs. |
| `src/data/` | Static fallback data, requirements, constants, disclaimers, and Course Match templates. |
| `src/admin/` | Admin shell and management panels. |
| `supabase/` | Supabase setup SQL for RLS and admin access. |
| `docs/en`, `docs/zh` | English and Chinese maintenance documentation. |

## Data Flow

1. `src/supabase.js` creates a Supabase client only when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` exist.
2. `useCourseData()` reads active courses from Supabase and falls back to `src/data/courses.js` if Supabase is unavailable.
3. `usePlannerStorage()` owns browser-local planner state, prior credits, custom courses, and stable planner card IDs.
4. `useCourseCatalog()` combines Supabase courses and browser-local custom courses into one lookup and owns student-side search/filter state.
5. Startup disclaimer dismissal remains in browser `localStorage`.
6. Graduation, prerequisite, planner capacity, and honors calculations run in the browser through pure helpers in `src/lib/`.
7. Admin write operations rely on Supabase Auth plus database RLS policies.

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

## Maintenance Guidance

- Add new student pages under `src/pages/` and pass only the state/actions they need through the page context.
- Put reusable UI in `src/components/shared/` only when it is genuinely cross-domain.
- Keep business rules in `src/lib/*.js` as pure functions whenever possible.
- Keep Supabase reads in `src/hooks/`; keep Supabase client setup in `src/supabase.js`.
- Keep static fallback data in `src/data/` and preserve stable course IDs.
- Do not change `localStorage` keys without adding migration or fallback logic.

## Roadmap

- Next cleanup target: split `src/admin/CoursePanel.jsx` into CSV parsing, form fields, list controls, and Supabase actions.
- Add focused tests for planner credits, prerequisite checks, course search, and honors progress.
- Consider formal Supabase migration history under `supabase/migrations/`.
- Continue updating Course Match templates only with counselor-approved or clearly labeled guidance.
