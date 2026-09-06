-- Apply only after the Vercel admin API and login have been verified.
-- Public browser clients are read-only; writes go through the authenticated server API.
do $$
declare item record;
begin
  for item in select tablename, policyname from pg_policies
    where schemaname='public' and tablename in ('courses','announcements','disclaimer_items','site_settings','page_maintenance','admin_users')
  loop execute format('drop policy %I on public.%I', item.policyname, item.tablename); end loop;
end $$;
revoke all on public.courses, public.announcements, public.disclaimer_items, public.site_settings, public.page_maintenance from public, anon, authenticated;
revoke all on public.admin_users from public, anon, authenticated;
grant select on public.courses, public.announcements, public.disclaimer_items, public.site_settings, public.page_maintenance to anon, authenticated;
grant all on public.courses, public.announcements, public.disclaimer_items, public.site_settings, public.page_maintenance to service_role;
alter table public.courses enable row level security;
alter table public.announcements enable row level security;
alter table public.disclaimer_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.page_maintenance enable row level security;
alter table public.admin_users enable row level security;
create policy public_active_courses on public.courses for select to anon, authenticated using (coalesce(archived,false)=false);
create policy public_current_announcements on public.announcements for select to anon, authenticated using (
  visible=true and (starts_at is null or starts_at<=now()) and (ends_at is null or ends_at>now())
);
create policy public_visible_disclaimers on public.disclaimer_items for select to anon, authenticated using (visible=true);
create policy public_site_settings on public.site_settings for select to anon, authenticated using (true);
create policy public_page_maintenance on public.page_maintenance for select to anon, authenticated using (true);
-- Existing legacy Auth records are retained but have no content-management access.
-- No catalog or site content is seeded or reset by this migration.
