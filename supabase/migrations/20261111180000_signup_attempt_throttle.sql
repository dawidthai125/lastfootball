-- Signup brake. Only the service role may call the function.
-- Limits are arguments so the app (signup-gate.ts) stays the source of the numbers.

create table if not exists public.auth_attempt_log (
  id bigint generated always as identity primary key,
  kind text not null default 'signup' check (kind = 'signup'),
  bucket text not null check (char_length(bucket) between 8 and 80),
  created_at timestamptz not null default now()
);

create index if not exists auth_attempt_log_kind_created_idx
  on public.auth_attempt_log (kind, created_at desc);

create index if not exists auth_attempt_log_kind_bucket_created_idx
  on public.auth_attempt_log (kind, bucket, created_at desc);

alter table public.auth_attempt_log enable row level security;

revoke all on table public.auth_attempt_log from public, anon, authenticated;

create or replace function public.consume_signup_slot(
  p_bucket text,
  p_ip_window int,
  p_ip_day int,
  p_global int
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ip_10 int;
  v_ip_day int;
  v_global int;
begin
  if p_bucket is null or char_length(p_bucket) < 8 or char_length(p_bucket) > 80 then
    return 'ok';
  end if;
  if p_ip_window < 1 or p_ip_day < 1 or p_global < 1 then
    return 'ok';
  end if;

  select count(*) into v_ip_10
  from public.auth_attempt_log
  where kind = 'signup'
    and bucket = p_bucket
    and created_at >= now() - interval '10 minutes';

  select count(*) into v_ip_day
  from public.auth_attempt_log
  where kind = 'signup'
    and bucket = p_bucket
    and created_at >= now() - interval '24 hours';

  select count(*) into v_global
  from public.auth_attempt_log
  where kind = 'signup'
    and created_at >= now() - interval '10 minutes';

  if v_ip_10 >= p_ip_window or v_ip_day >= p_ip_day then
    return 'ip';
  end if;
  if v_global >= p_global then
    return 'global';
  end if;

  insert into public.auth_attempt_log (kind, bucket) values ('signup', p_bucket);

  delete from public.auth_attempt_log
  where id in (
    select id
    from public.auth_attempt_log
    where created_at < now() - interval '2 days'
    limit 50
  );

  return 'ok';
end;
$$;

revoke all on function public.consume_signup_slot(text, int, int, int) from public, anon, authenticated;
grant execute on function public.consume_signup_slot(text, int, int, int) to service_role;
