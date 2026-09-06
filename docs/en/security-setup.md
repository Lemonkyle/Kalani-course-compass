# Cloud administrator and security setup

Updated September 5, 2026.

The cloud edition uses React/Vite on Vercel, two Node.js Vercel Functions, and the existing Supabase PostgreSQL database. Students do not sign in; their plans stay in their browser. Administrators sign in at /admin with one configured username and password. There is no signup, email verification, or Supabase Auth allowlist to maintain.

## Daily administration

Use the credentials delivered privately to the project owner. Courses, announcements, disclaimers, site settings and maintenance switches are managed in /admin. Announcement dates use Hawaii Standard Time (UTC−10), regardless of the administrator's computer timezone.

## Configuration

Use Node.js 24 and npm ci. Copy .env.example to .env.local when setting up a new checkout, then set the project's public Supabase URL/key and server-only service role key. Run npm run admin:setup to generate a random administrator password. It writes the credentials to .admin-credentials.txt and the username, scrypt password hash and session secret to .env.local. Both files are ignored by Git and Vercel uploads. Never share or commit them.

Vercel requires the following environment variables in the deployment target:

| Browser-safe | Server-only |
| --- | --- |
| VITE_SUPABASE_URL | SUPABASE_URL |
| VITE_SUPABASE_ANON_KEY | SUPABASE_SERVICE_ROLE_KEY |
| | ADMIN_USERNAME |
| | ADMIN_PASSWORD_HASH |
| | ADMIN_SESSION_SECRET |

Only the two VITE_ variables are included in browser assets. Never prefix administrator secrets or the service role key with VITE_. npm run dev serves both the frontend and local admin API; npm run preview serves static assets only.

## Database rollout

This repository upgrades the existing project database. Preserve a database backup when creating a new environment; the migrations are incremental, not a replacement for the original catalog/schema backup.

1. Apply cloud_integrity_and_admin_api: adds course constraints and a service-only login throttle. Existing content and legacy login remain intact.
2. Configure the server environment, deploy the new application, and verify login plus course save/read-back.
3. Apply server_only_admin_writes: browser roles retain public read access only. All content writes require the Vercel API session. Legacy Auth records are retained but have no content-management access.

supabase/admin-security.sql is retired. It intentionally does nothing; never restore its previous user-registration, policy, or seed-reset workflow.

## Security behavior

- Passwords are verified on the server using scrypt. The configured password hash is never sent to the browser.
- Signed HttpOnly cookies expire after eight hours and use Secure on HTTPS and SameSite=Strict. Password or session-secret rotation invalidates existing sessions after redeployment.
- Editing requires an exact same-origin JSON request and a valid session. Tables, fields, IDs and operations are allowlisted; no arbitrary SQL is accepted.
- Login is limited to 10 attempts per IP bucket and 100 attempts globally per 15-minute window. Only HMAC-derived IP buckets are stored, with old buckets cleaned after one day. Database/rate-limiter failure denies login.
- Public data is protected by RLS and read-only grants. Archived courses and hidden announcements/disclaimers are not publicly readable. The service role key exists only on the backend.
- Logout clears the browser cookie. Treat a copied session cookie as valid until expiry; rotate the password hash or session secret to invalidate all sessions immediately on the next deployment.

To intentionally rotate the password, move the private credentials file to a safe location, rerun npm run admin:setup, update the three ADMIN_ variables in Vercel, and redeploy. There is no email recovery workflow.

Run npm test, npm run build, and a browser/API check before deployment. A frontend rollback to the old Supabase Auth login will not work after the write-permission cutover; use a release with the new API or explicitly restore the previous grants from the database backup.
