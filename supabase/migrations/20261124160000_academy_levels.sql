-- D134 (LFE-ACADEMY-02): academy level, stored intake offers, daily junior training, upkeep.
-- Additive; run it before the deploy, in one transaction. The deployed code keeps working:
-- settle_fixture still answers the old ten named arguments with no upkeep.

alter table public.clubs
  add column if not exists academy_level smallint not null default 0;

alter table public.clubs drop constraint if exists clubs_academy_level_check;
alter table public.clubs
  add constraint clubs_academy_level_check check (academy_level between 0 and 3);

-- Its own trigger: the existing guards stay as they are.
create or replace function public.lf_guard_academy_level()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.academy_level <> 0 then
      raise exception 'club starts from the starter state' using errcode = '42501';
    end if;
  elsif new.academy_level is distinct from old.academy_level then
    raise exception 'protected club column' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_academy_level on public.clubs;
create trigger lf_guard_academy_level
  before insert or update on public.clubs
  for each row execute function public.lf_guard_academy_level();

-- lf_guard_players refuses every column outside its list, so these are protected already.
alter table public.players
  add column if not exists senior_matches integer not null default 0,
  add column if not exists academy_trained_on date,
  add column if not exists academy_gain smallint not null default 0,
  add column if not exists academy_gain_season integer;

alter table public.players drop constraint if exists players_senior_matches_check;
alter table public.players
  add constraint players_senior_matches_check check (senior_matches >= 0);
alter table public.players drop constraint if exists players_academy_gain_check;
alter table public.players
  add constraint players_academy_gain_check check (academy_gain between 0 and 6);

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
      'board_task',
      'academy_build',
      'academy_upkeep',
      'academy_training'
    )
  );

-- One row per intake. Candidates are stored when it opens, so a reload shows the same ones.
create table if not exists public.academy_intakes (
  club_id uuid not null references public.clubs (id) on delete cascade,
  seq integer not null check (seq >= 1),
  candidates jsonb not null check (jsonb_typeof(candidates) = 'array'),
  status text not null default 'open' check (status in ('open', 'taken', 'declined')),
  taken_index integer,
  created_at timestamptz not null default now(),
  primary key (club_id, seq)
);

create unique index if not exists academy_intakes_one_open
  on public.academy_intakes (club_id) where status = 'open';

-- Server only: stored candidates carry the potential number.
alter table public.academy_intakes enable row level security;
revoke all on public.academy_intakes from public, anon, authenticated, service_role;
grant select on public.academy_intakes to service_role;

-- The open offer when there is one, else a new one. The number must be the next one, so the
-- waiting time the app checked is the one of the last intake.
create or replace function public.open_academy_intake(
  p_club_id uuid,
  p_seq integer,
  p_candidates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last integer;
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  if exists (
    select 1 from public.academy_intakes where club_id = p_club_id and status = 'open'
  ) then
    return jsonb_build_object('ok', true, 'created', false);
  end if;
  select coalesce(max(seq), 0) into v_last
  from public.academy_intakes where club_id = p_club_id;
  if p_seq is distinct from v_last + 1 then
    return jsonb_build_object('ok', false, 'reason', 'moved');
  end if;
  if p_candidates is null or jsonb_typeof(p_candidates) <> 'array'
    or jsonb_array_length(p_candidates) not between 1 and 3
  then
    raise exception 'academy candidates out of range';
  end if;
  insert into public.academy_intakes (club_id, seq, candidates)
  values (p_club_id, p_seq, p_candidates);
  return jsonb_build_object('ok', true, 'created', true);
end;
$$;

-- The chosen candidate joins once. A repeat of the same choice answers with the same player.
create or replace function public.take_academy_candidate(
  p_club_id uuid,
  p_seq integer,
  p_index integer,
  p_slots integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_intake public.academy_intakes%rowtype;
  v_c jsonb;
  v_shirt integer;
begin
  if p_slots is null or p_index is null then
    raise exception 'academy choice out of range';
  end if;
  perform 1 from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  select * into v_intake from public.academy_intakes
  where club_id = p_club_id and seq = p_seq
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  v_c := case when p_index >= 0 then v_intake.candidates -> p_index end;
  if v_c is null then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;
  if v_intake.status = 'taken' and v_intake.taken_index = p_index then
    return jsonb_build_object('ok', true, 'applied', false, 'name', v_c ->> 'name');
  end if;
  if v_intake.status <> 'open' then
    return jsonb_build_object('ok', false, 'reason', 'closed');
  end if;

  if (
    select count(*) from public.players
    where club_id = p_club_id and academy_track and departed_at is null
  ) >= p_slots then
    return jsonb_build_object('ok', false, 'reason', 'slots');
  end if;

  -- 90..99 first, then the lowest free one. A number stays taken after a departure.
  select n into v_shirt
  from generate_series(1, 99) as n
  where not exists (
    select 1 from public.players p where p.club_id = p_club_id and p.shirt_number = n
  )
  order by (n < 90), n
  limit 1;
  if v_shirt is null then
    return jsonb_build_object('ok', false, 'reason', 'shirt');
  end if;

  insert into public.players (
    id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential,
    status, nationality, version, academy_track, origin, joined_at
  )
  values (
    v_c ->> 'id', p_club_id, v_c ->> 'name', v_shirt, v_c ->> 'pos', v_c ->> 'role',
    false, false, (v_c ->> 'age')::integer, (v_c ->> 'skill')::integer,
    (v_c ->> 'potential')::integer, 'READY', 'POL', 1, true, 'academy', now()
  );
  update public.academy_intakes
  set status = 'taken', taken_index = p_index
  where club_id = p_club_id and seq = p_seq;
  return jsonb_build_object('ok', true, 'applied', true, 'name', v_c ->> 'name');
end;
$$;

-- The waiting time counts from the opening, so a refusal brings no earlier intake.
create or replace function public.decline_academy_intake(p_club_id uuid, p_seq integer)
returns boolean
language sql
security definer
set search_path = ''
as $$
  update public.academy_intakes
  set status = 'declined'
  where club_id = p_club_id and seq = p_seq and status = 'open'
  returning true;
$$;

-- One junior a UTC day: +1 in one group, cash and ledger in one transaction.
create or replace function public.train_academy_junior(
  p_club_id uuid,
  p_player_id text,
  p_group text,
  p_cost integer,
  p_max_gain integer,
  p_max_age integer,
  p_label text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_today date := (now() at time zone 'utc')::date;
  v_cash integer;
  v_season integer;
  v_player public.players%rowtype;
  v_value integer;
  v_gain integer;
begin
  if p_cost is null or p_cost < 0 or p_max_gain is null or p_max_age is null then
    raise exception 'academy training out of range';
  end if;
  if p_group is null
    or p_group not in ('attack', 'passing', 'defense', 'physical', 'goalkeeping')
  then
    return jsonb_build_object('ok', false, 'reason', 'group');
  end if;
  select cash_balance, season_number into v_cash, v_season
  from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  if exists (
    select 1 from public.players where club_id = p_club_id and academy_trained_on = v_today
  ) then
    return jsonb_build_object('ok', false, 'reason', 'today');
  end if;

  select * into v_player from public.players
  where id = p_player_id and club_id = p_club_id and academy_track and departed_at is null
  for update;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'player');
  end if;
  if v_player.age > p_max_age then
    return jsonb_build_object('ok', false, 'reason', 'age');
  end if;
  v_gain := case
    when v_player.academy_gain_season is not distinct from v_season then v_player.academy_gain
    else 0
  end;
  if v_gain >= p_max_gain then
    return jsonb_build_object('ok', false, 'reason', 'season');
  end if;
  v_value := coalesce(
    case p_group
      when 'attack' then v_player.attr_attack
      when 'passing' then v_player.attr_passing
      when 'defense' then v_player.attr_defense
      when 'physical' then v_player.attr_physical
      else v_player.attr_goalkeeping
    end,
    v_player.skill
  ) + 1;
  if v_value > least(99, v_player.potential) then
    return jsonb_build_object('ok', false, 'reason', 'potential');
  end if;
  if v_cash < p_cost then
    return jsonb_build_object('ok', false, 'reason', 'cash');
  end if;

  update public.players
  set attr_attack = case when p_group = 'attack' then v_value else attr_attack end,
      attr_passing = case when p_group = 'passing' then v_value else attr_passing end,
      attr_defense = case when p_group = 'defense' then v_value else attr_defense end,
      attr_physical = case when p_group = 'physical' then v_value else attr_physical end,
      attr_goalkeeping = case when p_group = 'goalkeeping' then v_value else attr_goalkeeping end,
      academy_trained_on = v_today,
      academy_gain = v_gain + 1,
      academy_gain_season = v_season
  where id = p_player_id;
  update public.clubs set cash_balance = cash_balance - p_cost where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'academy_training', p_label, -p_cost);
  return jsonb_build_object('ok', true, 'name', v_player.name, 'gain', v_gain + 1);
end;
$$;

revoke all on function public.open_academy_intake(uuid, integer, jsonb),
  public.take_academy_candidate(uuid, integer, integer, integer),
  public.decline_academy_intake(uuid, integer),
  public.train_academy_junior(uuid, text, text, integer, integer, integer, text)
  from public, anon, authenticated;
grant execute on function public.open_academy_intake(uuid, integer, jsonb),
  public.take_academy_candidate(uuid, integer, integer, integer),
  public.decline_academy_intake(uuid, integer),
  public.train_academy_junior(uuid, text, text, integer, integer, integer, text)
  to service_role;

-- Upkeep joins the settlement. One function only, so the old named call stays unambiguous.
drop function if exists public.settle_fixture(
  uuid, uuid, integer, integer, integer, text, integer, integer, text, text
);

create or replace function public.settle_fixture(
  p_fixture_id uuid,
  p_club_id uuid,
  p_home integer,
  p_away integer,
  p_reward integer,
  p_reward_label text,
  p_tickets integer,
  p_wage_due integer,
  p_wage_label text,
  p_wage_short_label text,
  p_upkeep integer default 0,
  p_upkeep_label text default 'Utrzymanie akademii',
  p_upkeep_short_label text default 'Utrzymanie akademii niepełne, zabrakło'
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cash integer;
  v_status text;
  v_competition text;
  v_income integer := greatest(0, coalesce(p_reward, 0)) + greatest(0, coalesce(p_tickets, 0));
  v_due integer := greatest(0, coalesce(p_wage_due, 0));
  v_upkeep integer := greatest(0, coalesce(p_upkeep, 0));
  v_paid integer;
  v_upkeep_paid integer;
begin
  select cash_balance into v_cash from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  select status, competition into v_status, v_competition
  from public.fixtures
  where id = p_fixture_id and club_id = p_club_id
  for update;
  if not found then
    raise exception 'fixture not found';
  end if;

  if v_status = 'played' then
    select -amount into v_paid
    from public.finance_movements
    where fixture_id = p_fixture_id and club_id = p_club_id and category = 'wages'
    limit 1;
    return jsonb_build_object('applied', false, 'paid', coalesce(v_paid, v_due));
  end if;
  if v_status <> 'upcoming' then
    raise exception 'fixture is not open';
  end if;

  update public.fixtures
  set status = 'played', home_score = p_home, away_score = p_away, played_at = now()
  where id = p_fixture_id;

  -- Wages first, the academy takes what is left. Cash never goes below 0.
  v_paid := least(v_due, v_cash + v_income);
  v_upkeep_paid := least(v_upkeep, v_cash + v_income - v_paid);
  update public.clubs
  set cash_balance = v_cash + v_income - v_paid - v_upkeep_paid
  where id = p_club_id;

  if coalesce(p_reward, 0) > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (p_club_id, 'match_reward', p_reward_label, p_reward, p_fixture_id);
  end if;
  if v_due > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (
      p_club_id,
      'wages',
      case when v_paid < v_due
        then p_wage_short_label || ' ' || (v_due - v_paid)::text || ' €'
        else p_wage_label
      end,
      -v_paid,
      p_fixture_id
    );
  end if;
  if v_upkeep > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (
      p_club_id,
      'academy_upkeep',
      case when v_upkeep_paid < v_upkeep
        then p_upkeep_short_label || ' ' || (v_upkeep - v_upkeep_paid)::text || ' €'
        else p_upkeep_label
      end,
      -v_upkeep_paid,
      p_fixture_id
    );
  end if;
  if coalesce(p_tickets, 0) > 0 then
    insert into public.finance_movements (club_id, category, label, amount, fixture_id)
    values (p_club_id, 'ticket_income', 'Bilety', p_tickets, p_fixture_id);
  end if;

  if v_competition = 'league' then
    update public.fixtures
    set status = 'upcoming'
    where id = (
      select id from public.fixtures
      where club_id = p_club_id and competition = 'league' and status = 'scheduled'
      order by matchday
      limit 1
    );
  elsif v_competition = 'challenge' then
    update public.rival_challenges
    set status = 'played', home_score = p_home, away_score = p_away, played_at = now()
    where fixture_id = p_fixture_id and challenger_club_id = p_club_id;
  end if;

  return jsonb_build_object('applied', true, 'paid', v_paid, 'upkeep_paid', v_upkeep_paid);
end;
$$;

revoke all on function public.settle_fixture(
  uuid, uuid, integer, integer, integer, text, integer, integer, text, text, integer, text, text
) from public, anon, authenticated;
grant execute on function public.settle_fixture(
  uuid, uuid, integer, integer, integer, text, integer, integer, text, text, integer, text, text
) to service_role;

-- Matches in the starting eleven of the senior team, once per match key.
do $$
declare
  f constant text := 'public.apply_match_development(uuid,text,jsonb)';
  d text := pg_get_functiondef(f::regprocedure);
  v_old constant text := 'morale = coalesce((v_item->>''morale'')::integer, morale)';
  n text;
begin
  if position('senior_matches' in d) > 0 then
    return;
  end if;
  n := replace(
    d,
    v_old,
    v_old || ',
        senior_matches = senior_matches
          + case when coalesce((v_item->>''played'')::boolean, false) then 1 else 0 end'
  );
  if n = d then
    raise exception 'unexpected body of %', f;
  end if;
  execute n;
end;
$$;

notify pgrst, 'reload schema';
