-- Kalani Compass admin security setup
-- Run this in the Supabase SQL Editor after creating your admin user in Supabase Auth.
--
-- 1. Supabase Dashboard > Authentication > Users > Add user.
-- 2. Replace YOUR_ADMIN_EMAIL@example.com near the bottom of this file.
-- 3. Run the full script.

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;
alter table public.courses enable row level security;
alter table public.announcements enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
revoke all on public.courses from anon, authenticated;
revoke all on public.announcements from anon, authenticated;

grant select on public.courses to anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.courses to authenticated;
grant insert, update, delete on public.announcements to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('admin_users', 'courses', 'announcements')
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      existing_policy.policyname,
      existing_policy.schemaname,
      existing_policy.tablename
    );
  end loop;
end $$;

create policy "Admins can read their admin profile"
on public.admin_users
for select
to authenticated
using (user_id = auth.uid());

create policy "Public can read active courses"
on public.courses
for select
to anon, authenticated
using (coalesce(archived, false) = false);

create policy "Admins can read all courses"
on public.courses
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can insert courses"
on public.courses
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update courses"
on public.courses
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can delete courses"
on public.courses
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Public can read active announcements"
on public.announcements
for select
to anon, authenticated
using (
  visible = true
  and (starts_at is null or starts_at <= now())
  and (ends_at is null or ends_at >= now())
);

create policy "Admins can read all announcements"
on public.announcements
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can insert announcements"
on public.announcements
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update announcements"
on public.announcements
for update
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can delete announcements"
on public.announcements
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

-- Replace this email with the Supabase Auth user that should manage the admin panel.
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com')
on conflict (user_id) do update
set email = excluded.email;
