# Kalani Compass Security Setup

## Local development

Create `.env.local` in the project root. This file is ignored by git.

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are read by the React app.
`SUPABASE_SERVICE_ROLE_KEY` is stored for server-side tools only. Do not add a
`VITE_` prefix to it, because Vite exposes `VITE_` variables to the browser.

## Vercel

Set these environment variables in Vercel Project Settings:

```env
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Do not add `VITE_SUPABASE_SERVICE_ROLE_KEY` to Vercel. If a future server-only
function needs the service role key, add it as `SUPABASE_SERVICE_ROLE_KEY`.

## Admin access

The admin page uses Supabase Auth. A signed-in user can only manage data if their
Supabase Auth user is listed in `public.admin_users`.

Run `supabase/admin-security.sql` in the Supabase SQL Editor after creating the
admin user in Authentication. Replace `YOUR_ADMIN_EMAIL@example.com` with the
admin user's email before running it.

The database rules are the real security layer:

- Students can read active courses and visible announcements.
- Only authenticated admins can insert, update, or delete courses and announcements.
- The frontend no longer stores an admin password.
