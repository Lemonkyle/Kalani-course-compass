# Kalani Compass Security Setup

Last updated: May 23, 2026

## Local Development

Create `.env.local` in the project root. This file is ignored by git.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read by the React app. `SUPABASE_SERVICE_ROLE_KEY` is for server-side tools only. Never add a `VITE_` prefix to the service role key because Vite exposes `VITE_` variables to the browser.

## Vercel

Set these environment variables in Vercel Project Settings:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not add `VITE_SUPABASE_SERVICE_ROLE_KEY` to Vercel. If a future server-only function needs the service role key, add it as `SUPABASE_SERVICE_ROLE_KEY`.

## Admin Access

The admin page uses Supabase Auth. A signed-in user can manage data only when their Supabase Auth user is listed in `public.admin_users`.

Run `supabase/admin-security.sql` in the Supabase SQL Editor after creating the admin user in Authentication. Replace `YOUR_ADMIN_EMAIL@example.com` with the admin user's email before running it.

The database rules are the real security layer:

- Students can read active courses and visible announcements.
- Only authenticated admins can insert, update, or delete managed content.
- The frontend must never store an admin password.

## Documentation Maintenance

When changing auth, RLS, environment variables, or admin access behavior, update this file and the matching Chinese file at `docs/zh/security-setup.md`.
