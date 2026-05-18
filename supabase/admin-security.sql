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
create table if not exists public.disclaimer_items (
  id text primary key,
  icon text not null default '',
  label text not null,
  body text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  updated_at timestamptz not null default now()
);
alter table public.disclaimer_items enable row level security;
create table if not exists public.page_maintenance (
  page_id text primary key,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint page_maintenance_page_id_check check (page_id in ('home', 'catalog', 'match', 'planner'))
);
alter table public.page_maintenance enable row level security;

grant usage on schema public to anon, authenticated;
revoke all on public.admin_users from anon, authenticated;
revoke all on public.courses from anon, authenticated;
revoke all on public.announcements from anon, authenticated;
revoke all on public.disclaimer_items from anon, authenticated;
revoke all on public.page_maintenance from anon, authenticated;

grant select on public.courses to anon, authenticated;
grant select on public.announcements to anon, authenticated;
grant select on public.disclaimer_items to anon, authenticated;
grant select on public.page_maintenance to anon, authenticated;
grant select on public.admin_users to authenticated;
grant insert, update, delete on public.courses to authenticated;
grant insert, update, delete on public.announcements to authenticated;
grant insert, update, delete on public.disclaimer_items to authenticated;
grant insert, update, delete on public.page_maintenance to authenticated;

do $$
declare
  existing_policy record;
begin
  for existing_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('admin_users', 'courses', 'announcements', 'disclaimer_items', 'page_maintenance')
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

create policy "Public can read visible disclaimer items"
on public.disclaimer_items
for select
to anon, authenticated
using (visible = true);

create policy "Admins can read all disclaimer items"
on public.disclaimer_items
for select
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can insert disclaimer items"
on public.disclaimer_items
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update disclaimer items"
on public.disclaimer_items
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

create policy "Admins can delete disclaimer items"
on public.disclaimer_items
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Public can read page maintenance"
on public.page_maintenance
for select
to anon, authenticated
using (true);

create policy "Admins can insert page maintenance"
on public.page_maintenance
for insert
to authenticated
with check (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

create policy "Admins can update page maintenance"
on public.page_maintenance
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

create policy "Admins can delete page maintenance"
on public.page_maintenance
for delete
to authenticated
using (
  exists (
    select 1 from public.admin_users
    where admin_users.user_id = auth.uid()
  )
);

insert into public.page_maintenance (page_id, enabled)
values
  ('home', false),
  ('catalog', false),
  ('match', false),
  ('planner', false)
on conflict (page_id) do nothing;

insert into public.disclaimer_items (id, icon, label, body, sort_order, visible)
values
  ('primary-source', '📚', 'Primary Source', 'Kalani High School 2026-2027 Registration Guide & Course Catalog. All course names, codes, credit values, grade levels, and prerequisite chains are derived from this document.', 10, true),
  ('graduation-requirements', '🎓', 'Graduation Requirements', 'Hawaii Department of Education Graduation Requirements, effective July 2023. Credit minimums and subject-area breakdowns follow this policy document.', 20, true),
  ('planning-reference', '⚠️', 'Planning Reference Only', 'Kalani Compass is an unofficial planning tool. It is not affiliated with Kalani High School or the Hawaii DOE. Always confirm your 4-year plan with your school counselor before submitting your registration card.', 30, true),
  ('plan-privacy', '💾', 'Your Plan & Privacy', 'Your 4-year plan is saved in your browser''s local storage and is never uploaded to any server or shared with anyone. However, your plan is tied to this specific browser and device — switching to a different device will reset your plan. We recommend using your private device.', 40, true),
  ('last-data-update', '🔄', 'Last Data Update', 'Course catalog last reviewed: March 2026. Based on the 2026-2027 Kalani High School Course Catalog.', 50, true)
on conflict (id) do update
set icon = excluded.icon,
    label = excluded.label,
    body = excluded.body,
    sort_order = excluded.sort_order,
    visible = excluded.visible,
    updated_at = now();

-- Replace this email with the Supabase Auth user that should manage the admin panel.
insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = lower('YOUR_ADMIN_EMAIL@example.com')
on conflict (user_id) do update
set email = excluded.email;
