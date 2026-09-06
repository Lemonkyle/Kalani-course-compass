-- Additive preparation: legacy login continues working until the API is deployed.
create schema if not exists kalani_private;
revoke all on schema kalani_private from public, anon, authenticated;
grant usage on schema kalani_private to service_role;

create table kalani_private.admin_login_attempts (
  bucket_key text not null,
  window_start timestamptz not null,
  attempts integer not null check (attempts > 0),
  primary key (bucket_key, window_start)
);
alter table kalani_private.admin_login_attempts enable row level security;
revoke all on kalani_private.admin_login_attempts from public, anon, authenticated;
grant select, insert, update, delete on kalani_private.admin_login_attempts to service_role;
create index admin_login_attempts_window_idx on kalani_private.admin_login_attempts(window_start);

create function public.consume_admin_login_attempt(bucket_key text)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare
  window_time timestamptz := pg_catalog.date_bin(interval '15 minutes', pg_catalog.now(), timestamptz '2000-01-01 00:00:00+00');
  global_count integer;
  ip_count integer;
begin
  if bucket_key is null or bucket_key !~ '^[a-f0-9]{64}$' then return false; end if;
  delete from kalani_private.admin_login_attempts where window_start < pg_catalog.now() - interval '1 day';
  -- Always take the global row lock first, so simultaneous requests serialize safely.
  insert into kalani_private.admin_login_attempts as existing values ('global', window_time, 1)
  on conflict on constraint admin_login_attempts_pkey do update set attempts = existing.attempts + 1
  returning attempts into global_count;
  insert into kalani_private.admin_login_attempts as existing values (bucket_key, window_time, 1)
  on conflict on constraint admin_login_attempts_pkey do update set attempts = existing.attempts + 1
  returning attempts into ip_count;
  return global_count <= 100 and ip_count <= 10;
end;
$$;
revoke all on function public.consume_admin_login_attempt(text) from public, anon, authenticated;
grant execute on function public.consume_admin_login_attempt(text) to service_role;

alter table public.courses add constraint courses_credit_bounds check (
  credits is not null and credits >= 0 and credits <= 14 and
  (grad_credits is null or (grad_credits >= 0 and grad_credits <= credits))
);
alter table public.courses add constraint courses_grade_bounds check (
  grade_level is not null and cardinality(grade_level) > 0 and
  grade_level <@ array[9,10,11,12] and array_position(grade_level, null) is null
);
alter table public.courses add constraint courses_category_valid check (
  grad_category is null or grad_category in ('english','ss','math','science','wlfa','pe','health','ptp','electives')
);
alter table public.courses add constraint courses_prereqs_not_self check (
  not (id = any(prereqs)) and not (id = any(concurrent_ok))
);
alter table public.announcements add constraint announcements_time_order check (ends_at is null or starts_at is null or ends_at >= starts_at);
-- No student plans, courses, announcements, or site settings are overwritten.
