-- D150: one match is one match, club names through the server, reports and moderation,
-- change of the account address.

-- A match that went on is resumed, never started again.
alter table public.match_kickoffs
  add column if not exists progress_tick integer not null default 0,
  add column if not exists manager_log jsonb not null default '[]'::jsonb;

create or replace function public.save_match_progress(
  p_club_id uuid,
  p_fixture_id uuid,
  p_tick integer,
  p_log jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_tick integer;
  v_log jsonb;
  v_len integer;
begin
  select progress_tick, manager_log into v_tick, v_log
  from public.match_kickoffs
  where club_id = p_club_id and fixture_id = p_fixture_id
  for update;
  if not found or jsonb_typeof(p_log) <> 'array' or p_tick < v_tick or p_tick > 20000 then
    return false;
  end if;
  v_len := jsonb_array_length(v_log);
  -- What was decided stays, and nothing new lands in the part that was played.
  if exists (
    select 1
    from jsonb_array_elements(v_log) with ordinality as a(e, n)
    left join jsonb_array_elements(p_log) with ordinality as b(e, n) on b.n = a.n
    where b.e is distinct from a.e
  ) or exists (
    select 1
    from jsonb_array_elements(p_log) with ordinality as b(e, n)
    where b.n > v_len and (b.e ->> 't')::integer < v_tick
  ) then
    return false;
  end if;
  update public.match_kickoffs set progress_tick = p_tick, manager_log = p_log
  where club_id = p_club_id and fixture_id = p_fixture_id;
  return true;
end;
$$;

revoke all on function public.save_match_progress(uuid, uuid, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.save_match_progress(uuid, uuid, integer, jsonb) to service_role;

create table if not exists public.club_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_club_id uuid not null references public.clubs (id) on delete cascade,
  reported_club_id uuid not null references public.clubs (id) on delete cascade,
  reason text not null check (reason in ('name', 'cheating', 'other')),
  details text not null default '' check (char_length(details) <= 300),
  created_at timestamptz not null default now(),
  closed_at timestamptz
);

create unique index if not exists club_reports_one_open
  on public.club_reports (reporter_club_id, reported_club_id) where closed_at is null;

create table if not exists public.app_admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);

create table if not exists public.blocked_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  reason text not null check (char_length(reason) between 3 and 300),
  created_at timestamptz not null default now()
);

create table if not exists public.admin_log (
  id bigint generated always as identity primary key,
  admin_id uuid references auth.users (id) on delete set null,
  action text not null,
  club_id uuid,
  note text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists public.email_changes (
  user_id uuid primary key references auth.users (id) on delete cascade,
  new_email text not null,
  token_hash text not null unique,
  expires_at timestamptz not null
);

alter table public.club_reports enable row level security;
alter table public.app_admins enable row level security;
alter table public.blocked_accounts enable row level security;
alter table public.admin_log enable row level security;
alter table public.email_changes enable row level security;

revoke all on public.club_reports, public.app_admins, public.blocked_accounts, public.admin_log,
  public.email_changes from public, anon, authenticated, service_role;
grant select, insert, update on public.club_reports to service_role;
grant select on public.app_admins to service_role;
grant select, insert, update, delete on public.blocked_accounts to service_role;
grant select, insert on public.admin_log to service_role;
grant select, insert, update, delete on public.email_changes to service_role;

-- The new name everywhere other clubs see it.
create or replace function public.admin_rename_club(p_club_id uuid, p_name text, p_short text)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.clubs set name = p_name, short_name = p_short where id = p_club_id;
  if not found then
    return false;
  end if;
  update public.human_league_seats
  set display_name = p_name, short_name = p_short where ref_id = p_club_id::text;
  update public.human_broadcasts
  set home_name = p_name, home_short = p_short where home_id = p_club_id::text;
  update public.human_broadcasts
  set away_name = p_name, away_short = p_short where away_id = p_club_id::text;
  update public.human_league_history h
  set standings = (
    select jsonb_agg(
      case when r ->> 'id' = p_club_id::text
        then jsonb_set(r, '{name}', to_jsonb(p_name)) else r end
      order by n
    )
    from jsonb_array_elements(h.standings) with ordinality as x(r, n)
  )
  where h.standings @> jsonb_build_array(jsonb_build_object('id', p_club_id::text));
  update public.rival_challenges
  set challenger_name = p_name, challenger_short = p_short where challenger_club_id = p_club_id;
  update public.rival_challenges
  set rival_name = p_name, rival_short = p_short where rival_club_id = p_club_id;
  update public.club_matches set opponent_name = p_name where opponent_club_id = p_club_id::text;
  update public.fixtures set match_note = null
  where opponent_club_id = p_club_id::text and match_note is not null;
  return true;
end;
$$;

-- A blocked account is out at once, not when its session runs out.
create or replace function public.admin_end_sessions(p_user_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.sessions where user_id = p_user_id;
$$;

revoke all on function public.admin_rename_club(uuid, text, text),
  public.admin_end_sessions(uuid) from public, anon, authenticated;
grant execute on function public.admin_rename_club(uuid, text, text),
  public.admin_end_sessions(uuid) to service_role;

select cron.schedule(
  'lf-account-cleanup',
  '55 3 * * *',
  $job$
    delete from public.email_changes where expires_at < now();
    delete from public.club_reports where closed_at < now() - interval '1 year';
    delete from public.admin_log where created_at < now() - interval '1 year';
  $job$
);

notify pgrst, 'reload schema';
