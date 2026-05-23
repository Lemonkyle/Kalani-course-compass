# Kalani Course Compass Maintenance Handoff

Last updated: May 23, 2026

## Quick Start

```bash
npm install
npm run dev
npm run build
npm run preview
```

Use `npm run build` before handing off or deploying changes.

## Important Context

- This is an unofficial planning tool and is not affiliated with Kalani High School or Hawaii DOE.
- Student plans stay in browser `localStorage`; they are not uploaded.
- Supabase is optional for local development because the app has static fallback data.
- Admin write access depends on Supabase Auth plus RLS policies.
- Keep course IDs stable; Course Match templates and saved student plans depend on them.

## Folder Responsibilities

```text
src/
  App.jsx                  Student app shell, page composition, and shared action wiring.
  main.jsx                 React entry point and admin/student lazy loading.
  supabase.js              Supabase client setup with safe null fallback.
  pages/                   Student pages.
  components/course/       Course detail and course-domain UI.
  components/planner/      Planner-specific UI and custom course modal.
  components/match/        Course Match cards and detail modal.
  components/shared/       Cross-domain UI components, app styles, and page transitions.
  hooks/                   Supabase reads plus local planner, catalog/search, disclaimer, settings, maintenance, and UI feedback state.
  lib/                     Pure business rules and utilities.
  data/                    Static fallback data, settings, requirements, templates, and constants.
  admin/                   Admin app and panels.
docs/en, docs/zh           Human-readable maintenance docs.
```

## Change Guidelines

- Prefer focused modules over adding more logic to `App.jsx`.
- Keep rules in `src/lib/` pure and easy to test.
- Keep browser persistence in hooks and preserve existing `localStorage` keys.
- Keep Supabase calls in hooks or admin panels, not inside generic UI components.
- Do not introduce a new framework, router, state library, or UI library unless explicitly planned.
- Preserve localStorage keys unless adding migration logic.
- Update both English and Chinese docs when changing maintenance behavior or folder responsibilities.
- Keep the root README in English first, then Chinese, when changing project setup or doc links.

## Next Recommended Cleanup

Student-side first-stage cleanup is now complete enough for normal maintenance. `src/admin/CoursePanel.jsx` remains the largest maintenance target. Split it into:

- CSV parsing/import helpers.
- Course form fields.
- Course list/search/filter controls.
- Supabase create/update/archive actions.

## Verification Checklist

After structural changes, verify:

- Home search opens course details.
- Catalog search and filters work.
- Planner add/remove, prerequisite warnings, capacity limits, ALG1 prior credit, and custom courses work.
- Course Match preview and apply flow work.
- Startup disclaimer and page maintenance behavior work.
- `/admin` loads and panels still import correctly.
