# Kalani Course Compass - Agent Context

Last updated: May 2026. Read this before changing code.

## Project Summary

Kalani Course Compass is an unofficial, student-built 4-year course planning web app for Kalani High School students. It helps students browse courses, check prerequisites, compare course-match templates, build a 9th-12th grade plan, and track graduation / honors progress.

Important context:

- This project is not officially affiliated with Kalani High School or Hawaii DOE.
- The app is a single-page React/Vite application deployed on Vercel.
- Student planner data stays in browser `localStorage`; it is not uploaded.
- Course and announcement data can come from Supabase, with a static local fallback.
- Admin write access is protected by Supabase Auth plus Supabase RLS policies.

Repository:

- GitHub: `Lemonkyle/Kalani-course-compass` (private)
- Live deployment: `kalani-course-compass.vercel.app`
- Main branch deployment is handled by Vercel.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18, Vite 5, JSX |
| Styling | Mostly inline CSS-in-JS inside JSX |
| Animation | Framer Motion |
| Backend/data | Supabase Postgres + `@supabase/supabase-js` |
| Deployment | Vercel |
| Package manager | npm with committed `package-lock.json` |

Common commands:

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Current File Structure

```text
src/
  App.jsx
    Main student-facing app. Owns most UI state, planner behavior, page routing,
    custom courses, prior credits, search, modals, and course-match application.

  main.jsx
    React entry point. Lazy-loads `AdminApp` for `/admin`, otherwise loads `App`.
    Also contains a runtime error boundary with a "clear plan and reload" recovery.

  supabase.js
    Creates the Supabase client when `VITE_SUPABASE_URL` and
    `VITE_SUPABASE_ANON_KEY` are present. Exports `supabase = null` when missing
    so local fallback mode can still run.

  lib/
    data.js
      Static data source: local `COURSES`, graduation requirements, prerequisite
      equivalents, department metadata, colors, default plan, honors definitions,
      and course-match templates.

    utils.jsx
      Shared logic and reusable JSX components: course normalization, sorting,
      search index helpers, Supabase fetch hooks, prerequisite checks, graduation
      credit calculations, honors calculations, `GradeBtn`, `renderPage`, etc.

  admin/
    AdminApp.jsx
      Admin shell, Supabase auth session check, admin membership verification,
      nav, sign-out, and tab routing.

    AdminLogin.jsx
      Supabase email/password login. No hardcoded admin password should be added.

    AnnPanel.jsx
      Announcement CRUD.

    CoursePanel.jsx
      Course CRUD, archive flow, and CSV import.

supabase/
  admin-security.sql
    RLS and admin access setup. Run in Supabase SQL Editor after creating the
    Supabase Auth admin user.

.env.example
  Documents required environment variable names.

SECURITY_SETUP.md
  Human-readable setup instructions for local/Vercel Supabase security.

vercel.json
  SPA rewrite for all routes to `index.html`.

vite.config.js
  Vite config with manual chunks for React, Framer Motion, and Supabase.
```

## Data Flow

The app prefers Supabase data when configured and available:

1. `src/supabase.js` checks for `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
2. `useCourseData()` in `src/lib/utils.jsx` fetches active courses from Supabase.
3. If Supabase is unavailable or returns an error, the app falls back to local `COURSES` from `src/lib/data.js`.
4. `useAnnouncements()` fetches visible announcements from Supabase. If Supabase is not configured, announcements are simply empty.
5. `App.jsx` combines live courses and user-created custom courses into one app-level `getCourse(id)` lookup.

Key rule: App-level logic should use the `getCourse(id)` defined in `App.jsx` when it needs live Supabase courses or custom courses. The default `getCourse` in `utils.jsx` only knows about static `COURSES`.

## Environment Variables

Browser-safe Vite variables:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Server-only value, if future server-side tools need it:

```env
SUPABASE_SERVICE_ROLE_KEY=
```

Never expose the service role key with a `VITE_` prefix. Vite embeds `VITE_` values into browser JavaScript.

`.env`, `.env.*`, and `.env.local` should stay ignored by Git. `.env.example` is safe to commit.

## Supabase Security Model

Admin security is intentionally database-backed:

- Login uses Supabase Auth email/password.
- A signed-in user is only an admin if their `auth.users.id` exists in `public.admin_users`.
- RLS controls real read/write access.
- The frontend admin gate is convenience UX, not the true security boundary.

Relevant files:

- `src/admin/AdminLogin.jsx`
- `src/admin/AdminApp.jsx`
- `supabase/admin-security.sql`
- `SECURITY_SETUP.md`

Current expected tables:

- `courses`
- `announcements`
- `admin_users`

The older ratings feature has been removed from the UI/admin code. Do not assume `ratings` is part of the current active app unless the user explicitly asks to restore it.

Important Supabase notes:

- Public users should only read active, non-archived courses.
- Public users should only read visible announcements inside their date window.
- Authenticated admins can read/write courses and announcements.
- `archived` may be `null` for older rows, so course fetches should include both `archived is null` and `archived = false` when appropriate.

## Core Product Rules

### Graduation Requirements

Graduation requirements are defined in `GRAD_REQUIREMENTS` in `src/lib/data.js`.

The app tracks:

- English
- Social Studies
- Math
- Science
- World Language / Fine Arts / CTE (`wlfa`)
- PE
- Health
- Personal Transition Plan
- Electives

Credit calculations are mainly in `calcPlannerCredits()` and `calcWlfa()` in `src/lib/utils.jsx`.

### WLFA Rule

WLFA means World Language / Fine Arts / CTE. The app calculates whether the student has earned the 2-credit WLFA requirement and moves overflow to electives.

Be careful when changing this:

- Fine Arts credits can pool.
- CTE should respect pathways.
- World Language handling should match current product expectations and counselor guidance.
- Custom courses can contribute to WLFA when they use `gradCategory: "wlfa"`.

### Prerequisites

Prerequisite logic lives in `src/lib/utils.jsx`.

- `prereqs`: must be completed in previous grades.
- `concurrentOk`: may be completed in the same grade or a previous grade.
- `PREREQ_EQUIV` in `data.js` defines equivalent courses.
- `priorCredits` in `App.jsx` adds pre-high-school credits, such as Algebra 1, to prerequisite checks.

When checking prerequisites from `App.jsx`, pass the app-level `getCourse` into utility functions so Supabase and custom courses work.

### Planner Slots

The app currently uses `GRADE_MAX = 14.0` slots per grade year.

- Standard course slots generally equal course credits.
- Off Campus is 0 credits but counts as 1 slot.
- `getCourseSlots(course)` centralizes this behavior in `utils.jsx`.

Known area to watch: some add flows check whether a grade is already full, while others also check whether the new course would exceed the limit. Prefer checking `gradeSlots(...) + getCourseSlots(course) > GRADE_MAX` for any new add path.

### Course Match

Course Match templates live in `COURSE_MATCH_TEMPLATES` in `src/lib/data.js`.

Each template has an `id`, title/description metadata, suitability bullets, highlights, a `pinned` flag, and a `plan` object keyed by grades 9-12.

Template course IDs must match real course IDs in `COURSES` or Supabase.

### Custom Courses

Students can add non-catalog courses such as HOC, dual credit, or summer school.

Custom courses:

- Are stored in `localStorage` under `kalani-custom-courses`.
- Use IDs like `CUSTOM_<timestamp>`.
- Are merged with live/static courses in `App.jsx`.
- Are cleaned up when no longer present in the plan.
- Can count as AP for honors progress if `isAP` is true.

### Honors Recognition

Honors progress is computed by `computeHonorsProgress(plan, getCourseForId)` in `utils.jsx`.

Do not regress support for:

- Static courses
- Supabase courses
- Custom courses
- Custom AP courses

## Admin Panel

Admin URL: `/admin`

Current tabs:

- Announcements
- Courses

There is no active Ratings tab.

Admin behavior:

- `AdminApp.jsx` checks the current Supabase Auth session.
- It verifies admin membership against `public.admin_users`.
- `AdminLogin.jsx` signs in with Supabase Auth.
- `AnnPanel.jsx` and `CoursePanel.jsx` perform Supabase writes. RLS must allow them.

When changing admin behavior, keep the UI helpful but rely on RLS for real security.

## Local Storage Keys

Known browser storage keys:

- `kalani-compass-plan`
- `kalani-prior-credits`
- `kalani-custom-courses`
- `kalani-dismissed-announcements`
- `kalani-compass-admin-auth` for Supabase Auth session storage

If local state becomes corrupted, `main.jsx` error boundary lets the user clear the saved plan.

## Coding Conventions

Use the existing style unless there is a strong reason not to:

- JSX files use double quotes.
- Most UI styling is inline object styles.
- Keep `data.js` as data-only as much as possible.
- Keep shared calculations and reusable components in `utils.jsx`.
- `utils.jsx` contains JSX, so keep the `.jsx` extension and import it explicitly.
- Avoid adding a new UI library unless the user asks.
- Keep changes tightly scoped; this project is a student-facing tool with fragile business rules.

## Important Gotchas

- `App.jsx` has its own `GRADE_MAX = 14.0` and `utils.jsx` exports `GRADE_MAX = 14.0`. If the slot limit changes, update both or refactor to a single source.
- `App.jsx` defines a live/custom-aware `getCourse(id)`. Do not accidentally use the static utility lookup for planner calculations.
- Supabase can be unconfigured locally. Any code touching Supabase should handle `supabase === null` where local fallback mode should continue.
- Admin auth state can expire. Write operations should report Supabase errors instead of silently failing.
- CSV import in `CoursePanel.jsx` is simple and may break on quoted commas. Use a real CSV parser if import quality becomes important.
- Vite build can fail locally if Windows blocks esbuild process spawning; distinguish environment permission errors from real compile errors.
- Avoid bringing back hardcoded admin credentials.
- Avoid committing `.env.local` or any real secrets.

## Verification Checklist

For student-facing changes:

- Run `npm run build` when possible.
- Check Home, Courses, Course Match, and 4-Year Planner.
- Add/remove courses across grades.
- Test prerequisite warnings.
- Test custom courses and prior credits.
- Confirm planner progress and honors progress still update.
- Confirm local fallback still works if Supabase env vars are absent.

For admin changes:

- Confirm unauthenticated users cannot access admin panels.
- Confirm a non-admin Supabase Auth user is rejected.
- Confirm an admin user can create/update/archive courses and announcements.
- Confirm RLS denies writes from non-admin accounts.
- Confirm user-facing announcements respect visibility and date windows.

For Supabase/RLS changes:

- Review `SECURITY_SETUP.md`.
- Apply SQL in a non-production project first if possible.
- Test anon read behavior separately from authenticated admin behavior.

## Current Status Notes

Recently completed or in progress:

- Package lock was added for reproducible npm installs.
- Admin login was moved from hardcoded credentials to Supabase Auth.
- `admin_users` and RLS setup were added in `supabase/admin-security.sql`.
- `.env.example` and `SECURITY_SETUP.md` were added.
- Supabase client creation now supports local fallback when env vars are missing.
- Ratings UI/admin code was removed from the active app.
- Utility functions were updated to accept live/custom course lookups.

Recommended next cleanup:

- Fix all planner add paths to prevent adding a course that would exceed `GRADE_MAX`.
- Add visible error handling for admin toggle/archive/import failures.
- Replace hand-rolled CSV parsing with a safer parser if bulk import remains important.
- Consider consolidating duplicated `GRADE_MAX` constants.

