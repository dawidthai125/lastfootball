-- D131: season history, board tasks, their payout and the season start lock.
-- Additive; run it before the deploy.

create table if not exists public.club_season_history (
  club_id uuid not null references public.clubs (id) on delete cascade,
  season_number integer not null check (season_number >= 1),
  league_tier text not null check (league_tier in ('iv', 'iii', 'ii', 'i')),
  position integer not null check (position >= 1),
  table_size integer not null check (table_size >= 1),
  points integer not null check (points >= 0),
  won integer not null check (won >= 0),
  drawn integer not null check (drawn >= 0),
  lost integer not null check (lost >= 0),
  goals_for integer not null check (goals_for >= 0),
  goals_against integer not null check (goals_against >= 0),
  -- 0 = no cup tie, 1..4 = last round reached, 5 = cup won.
  cup_round_reached integer not null default 0 check (cup_round_reached between 0 and 5),
  outcome text not null check (outcome in ('promote', 'stay', 'relegate')),
  created_at timestamptz not null default now(),
  primary key (club_id, season_number)
);

create table if not exists public.club_board_task_claims (
  club_id uuid not null references public.clubs (id) on delete cascade,
  season_number integer not null check (season_number >= 1),
  block integer not null check (block between 1 and 4),
  kind text not null,
  amount integer not null check (amount > 0),
  claimed_at timestamptz not null default now(),
  primary key (club_id, season_number, block)
);

-- One season start per club at a time. Server only.
create table if not exists public.club_season_starts (
  club_id uuid primary key references public.clubs (id) on delete cascade,
  token uuid not null,
  started_at timestamptz not null default now()
);

alter table public.club_season_starts enable row level security;
revoke all on public.club_season_starts from public, anon, authenticated, service_role;

-- The owner reads, only the SQL functions below write.
alter table public.club_season_history enable row level security;
alter table public.club_board_task_claims enable row level security;

revoke all on public.club_season_history, public.club_board_task_claims
  from public, anon, authenticated, service_role;
grant select on public.club_season_history, public.club_board_task_claims to authenticated;
grant select on public.club_season_history, public.club_board_task_claims to service_role;

drop policy if exists club_season_history_select_own on public.club_season_history;
create policy club_season_history_select_own on public.club_season_history
  for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

drop policy if exists club_board_task_claims_select_own on public.club_board_task_claims;
create policy club_board_task_claims_select_own on public.club_board_task_claims
  for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

alter table public.finance_movements
  drop constraint if exists finance_movements_category_check;

alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in (
      'starter',
      'match_reward',
      'transfer_buy',
      'transfer_sell',
      'sponsor_base',
      'sponsor_bonus',
      'email_confirm',
      'wages',
      'scout_report',
      'ticket_income',
      'stadium_build',
      'coach_hire',
      'season_goal',
      'physio_hire',
      'assistant_hire',
      'board_task'
    )
  );

-- Claim, cash and ledger in one transaction. The app checks the owner and the completion first.
create or replace function public.claim_board_task(
  p_club_id uuid,
  p_season integer,
  p_block integer,
  p_kind text,
  p_amount integer,
  p_label text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season integer;
  v_phase text;
begin
  if p_amount is null or p_amount < 1 or p_amount > 10000 then
    raise exception 'board task reward out of range';
  end if;

  select season_number, season_phase into v_season, v_phase
  from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  if exists (
    select 1 from public.club_board_task_claims
    where club_id = p_club_id and season_number = p_season and block = p_block
  ) then
    return jsonb_build_object('applied', false);
  end if;
  if v_season is distinct from p_season or exists (
    select 1 from public.club_season_history
    where club_id = p_club_id and season_number = p_season
  ) then
    raise exception 'season is closed';
  end if;
  -- Between seasons only the 22 finished matches count, never a half-started next season.
  if v_phase <> 'in_season' and not exists (
    select 1 from public.fixtures
    where club_id = p_club_id and competition = 'league'
    having count(*) = 22 and count(*) filter (where status = 'played') = 22
  ) then
    raise exception 'season is not complete';
  end if;

  insert into public.club_board_task_claims (club_id, season_number, block, kind, amount)
  values (p_club_id, p_season, p_block, p_kind, p_amount);
  update public.clubs set cash_balance = cash_balance + p_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'board_task', p_label, p_amount);

  return jsonb_build_object('applied', true);
end;
$$;

revoke all on function public.claim_board_task(uuid, integer, integer, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.claim_board_task(uuid, integer, integer, text, integer, text)
  to service_role;

-- The lock token, or null when another request holds it or the club moved on.
create or replace function public.begin_season_start(p_club_id uuid, p_season integer)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_token uuid;
begin
  perform 1 from public.clubs
  where id = p_club_id and season_phase = 'offseason' and season_number = p_season
  for update;
  if not found then
    return null;
  end if;

  insert into public.club_season_starts as held (club_id, token)
  values (p_club_id, gen_random_uuid())
  on conflict (club_id) do update
    set token = excluded.token, started_at = now()
    where held.started_at < now() - interval '5 minutes'
  returning token into v_token;
  return v_token;
end;
$$;

create or replace function public.end_season_start(p_club_id uuid, p_token uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.club_season_starts where club_id = p_club_id and token = p_token;
$$;

-- The season record and the fixture delete land together, so a stored season means its
-- fixtures are gone. Refused when the lock, the season or the results moved.
create or replace function public.clear_season_fixtures(
  p_club_id uuid,
  p_season integer,
  p_token uuid,
  p_played integer,
  p_history jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- settle_fixture locks the club first as well, so no result lands in between.
  perform 1 from public.clubs
  where id = p_club_id and season_phase = 'offseason' and season_number = p_season
  for update;
  if not found or not exists (
    select 1 from public.club_season_starts where club_id = p_club_id and token = p_token
  ) then
    raise exception 'season start moved';
  end if;
  if p_played is distinct from (
    select count(*)::integer from public.fixtures
    where club_id = p_club_id and status = 'played'
  ) then
    raise exception 'results moved';
  end if;

  if p_history is not null and jsonb_typeof(p_history) = 'object' then
    insert into public.club_season_history (
      club_id, season_number, league_tier, position, table_size, points, won, drawn, lost,
      goals_for, goals_against, cup_round_reached, outcome
    )
    select
      p_club_id, p_season, h.league_tier, h.position, h.table_size, h.points, h.won, h.drawn,
      h.lost, h.goals_for, h.goals_against, h.cup_round_reached, h.outcome
    from jsonb_to_record(p_history) as h(
      league_tier text, position integer, table_size integer, points integer, won integer,
      drawn integer, lost integer, goals_for integer, goals_against integer,
      cup_round_reached integer, outcome text
    )
    on conflict (club_id, season_number) do nothing;
  end if;
  delete from public.fixtures where club_id = p_club_id;
  return true;
end;
$$;

revoke all on function public.begin_season_start(uuid, integer),
  public.end_season_start(uuid, uuid),
  public.clear_season_fixtures(uuid, integer, uuid, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.begin_season_start(uuid, integer),
  public.end_season_start(uuid, uuid),
  public.clear_season_fixtures(uuid, integer, uuid, integer, jsonb)
  to service_role;
