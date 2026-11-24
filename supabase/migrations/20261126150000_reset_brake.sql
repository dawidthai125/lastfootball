-- D149: brake for password reset letters, which go through the shared mail quota now.
create table if not exists public.reset_attempt_log (
  id bigint generated always as identity primary key,
  ip_bucket text not null check (char_length(ip_bucket) between 8 and 80),
  mail_bucket text not null check (char_length(mail_bucket) between 8 and 80),
  created_at timestamptz not null default now()
);

create index if not exists reset_attempt_log_created_idx
  on public.reset_attempt_log (created_at desc);

alter table public.reset_attempt_log enable row level security;
revoke all on public.reset_attempt_log from public, anon, authenticated;

create or replace function public.consume_reset_slot(
  p_ip text,
  p_mail text,
  p_ip_hour integer,
  p_mail_day integer,
  p_global_day integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- One at a time, so a burst cannot slip past the counts.
  perform pg_advisory_xact_lock(hashtext('consume_reset_slot'));
  if (select count(*) from public.reset_attempt_log
      where ip_bucket = p_ip and created_at > now() - interval '1 hour') >= p_ip_hour
    or (select count(*) from public.reset_attempt_log
      where mail_bucket = p_mail and created_at > now() - interval '1 day') >= p_mail_day
    or (select count(*) from public.reset_attempt_log
      where created_at > now() - interval '1 day') >= p_global_day
  then
    return false;
  end if;
  insert into public.reset_attempt_log (ip_bucket, mail_bucket) values (p_ip, p_mail);
  return true;
end;
$$;

revoke all on function public.consume_reset_slot(text, text, integer, integer, integer)
  from public, anon, authenticated;
grant execute on function public.consume_reset_slot(text, text, integer, integer, integer)
  to service_role;

-- Both logs keep hashes for two days, also when nobody signs up.
select cron.schedule(
  'lf-attempt-cleanup',
  '50 * * * *',
  $job$
    delete from public.auth_attempt_log where created_at < now() - interval '2 days';
    delete from public.reset_attempt_log where created_at < now() - interval '2 days';
  $job$
);

notify pgrst, 'reload schema';
