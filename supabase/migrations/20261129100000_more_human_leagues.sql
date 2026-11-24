-- Liga ludzi: as many leagues as the clubs need (D154). Every league has its own calendar.
-- season_number is unique across leagues, so broadcasts, fixtures and history need no league.
alter table public.human_league drop constraint if exists human_league_singleton;
alter table public.human_league alter column id drop default;
alter table public.human_league
  add column if not exists cycle integer not null default 1 check (cycle >= 1);
update public.human_league set cycle = season_number where cycle <> season_number;
create unique index if not exists human_league_season_number_key
  on public.human_league (season_number);

alter table public.human_league_seats
  add column if not exists league_id integer not null default 1
  references public.human_league (id) on delete cascade;
alter table public.human_league_seats drop constraint if exists human_league_seats_pkey;
alter table public.human_league_seats add primary key (league_id, slot);
alter table public.human_league_seats drop constraint if exists human_league_seats_ref_id_key;
create unique index if not exists human_league_seats_league_ref_key
  on public.human_league_seats (league_id, ref_id);
create unique index if not exists human_league_seats_one_per_club
  on public.human_league_seats (ref_id) where kind = 'human';

alter table public.human_league_history
  add column if not exists league_id integer not null default 1,
  add column if not exists cycle integer;
update public.human_league_history set cycle = season where cycle is null;
alter table public.human_league_history alter column cycle set not null;

-- Clubs that played, trained or were founded since the moment. Blocked accounts take no seat.
create or replace function public.human_active_clubs(p_since timestamptz)
returns table (id uuid, name text, short_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.name, c.short_name, c.created_at
  from public.clubs c
  where c.owner_id is not null
    and not exists (select 1 from public.blocked_accounts b where b.user_id = c.owner_id)
    and (
      c.created_at >= p_since
      or c.last_training_on >= (p_since at time zone 'utc')::date
      or exists (
        select 1 from public.fixtures f
        where f.club_id = c.id and f.status = 'played' and f.played_at >= p_since
      )
    );
$$;

-- Seats every active club that has none. Only leagues before their first match change.
create or replace function public.human_league_sync(
  p_since timestamptz,
  p_today date,
  p_start date,
  p_bots jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row record;
  v_bot jsonb;
  v_slot integer;
  v_league integer;
  v_waiting uuid[] := '{}';
  v_id integer;
  v_n integer;
begin
  perform pg_advisory_xact_lock(hashtext('human_league'));
  if jsonb_array_length(p_bots) < 11 then
    raise exception 'not enough bots';
  end if;

  create temporary table if not exists lf_active (
    id text primary key, name text, short_name text, created_at timestamptz
  ) on commit drop;
  delete from pg_temp.lf_active where true;
  insert into pg_temp.lf_active
  select a.id::text, a.name, a.short_name, a.created_at from public.human_active_clubs(p_since) a;

  -- Nobody came to the first day: the league starts again.
  update public.human_league set season_key = p_start where not frozen and season_key < p_today;

  -- A league without one active club closes.
  delete from public.human_league l
  where not l.frozen and not exists (
    select 1 from public.human_league_seats s
    join pg_temp.lf_active a on a.id = s.ref_id
    where s.league_id = l.id and s.kind = 'human'
  );
  -- Places of inactive clubs go to bots.
  for v_row in
    select s.league_id, s.slot
    from public.human_league_seats s
    join public.human_league l on l.id = s.league_id
    where not l.frozen and s.kind = 'human'
      and not exists (select 1 from pg_temp.lf_active a where a.id = s.ref_id)
    order by s.league_id, s.slot
  loop
    select b into v_bot
    from jsonb_array_elements(p_bots) b
    where not exists (
      select 1 from public.human_league_seats x
      where x.league_id = v_row.league_id and x.ref_id = b ->> 'id'
    )
    limit 1;
    update public.human_league_seats
    set kind = 'bot', ref_id = v_bot ->> 'id', display_name = v_bot ->> 'name',
        short_name = v_bot ->> 'shortName'
    where league_id = v_row.league_id and slot = v_row.slot;
  end loop;

  -- Two half-empty leagues become one while both are still open.
  for v_row in
    select l.id, (
      select count(*) from public.human_league_seats s
      where s.league_id = l.id and s.kind = 'human'
    ) as clubs
    from public.human_league l
    where not l.frozen
    order by l.id desc
  loop
    if v_row.clubs <= (
      select count(*) from public.human_league_seats s
      join public.human_league l on l.id = s.league_id
      where not l.frozen and l.id < v_row.id and s.kind = 'bot'
    ) then
      delete from public.human_league where id = v_row.id;
    end if;
  end loop;

  -- Oldest club first, into the fullest open league.
  for v_row in
    select a.* from pg_temp.lf_active a
    where not exists (
      select 1 from public.human_league_seats s where s.kind = 'human' and s.ref_id = a.id
    )
    order by a.created_at, a.id
  loop
    v_league := null;
    select s.league_id, min(s.slot) into v_league, v_slot
    from public.human_league_seats s
    join public.human_league l on l.id = s.league_id
    where not l.frozen and s.kind = 'bot'
    group by s.league_id
    order by count(*), s.league_id
    limit 1;
    if v_league is null then
      v_waiting := v_waiting || v_row.id::uuid;
    else
      update public.human_league_seats
      set kind = 'human', ref_id = v_row.id, display_name = v_row.name,
          short_name = v_row.short_name
      where league_id = v_league and slot = v_slot;
    end if;
  end loop;

  -- A new league from two waiting clubs, or from one when there is no league at all.
  while cardinality(v_waiting) >= 2
    or (cardinality(v_waiting) = 1 and not exists (select 1 from public.human_league))
  loop
    select min(n) into v_id
    from generate_series(1, (select count(*)::integer + 1 from public.human_league)) n
    where not exists (select 1 from public.human_league l where l.id = n);
    insert into public.human_league (id, season_key, season_number, cycle, frozen)
    values (
      v_id,
      p_start,
      greatest(
        coalesce((select max(season_number) from public.human_league), 0),
        coalesce((select max(season) from public.human_league_history), 0),
        coalesce((select max(season) from public.human_broadcasts), 0)
      ) + 1,
      coalesce(
        (select max(h.cycle) from public.human_league_history h where h.league_id = v_id), 0
      ) + 1,
      false
    );
    v_n := least(12, cardinality(v_waiting));
    insert into public.human_league_seats (league_id, slot, kind, ref_id, display_name, short_name)
    select v_id, w.n - 1, 'human', a.id, a.name, a.short_name
    from unnest(v_waiting[1:v_n]) with ordinality w(club, n)
    join pg_temp.lf_active a on a.id = w.club::text;
    insert into public.human_league_seats (league_id, slot, kind, ref_id, display_name, short_name)
    select v_id, v_n + b.n - 1, 'bot', b.bot ->> 'id', b.bot ->> 'name', b.bot ->> 'shortName'
    from jsonb_array_elements(p_bots) with ordinality b(bot, n)
    where b.n <= 12 - v_n;
    v_waiting := v_waiting[v_n + 1:];
  end loop;
end;
$$;

-- The first locked line-up closes the seats of that league season.
create or replace function public.freeze_human_league(p_season integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform pg_advisory_xact_lock(hashtext('human_league'));
  update public.human_league set frozen = true where season_number = p_season and not frozen;
end;
$$;

-- League of a club with its twelve seats, and how many leagues and clubs there are.
create or replace function public.human_league_of(p_club uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'leagues', (select count(*) from public.human_league),
    'clubs', (select count(*) from public.human_league_seats where kind = 'human'),
    'league', (
      select to_jsonb(l) || jsonb_build_object('seats', (
        select jsonb_agg(
          jsonb_build_object(
            'slot', s.slot, 'kind', s.kind, 'id', s.ref_id, 'name', s.display_name,
            'shortName', s.short_name
          ) order by s.slot
        )
        from public.human_league_seats s where s.league_id = l.id
      ))
      from public.human_league l
      join public.human_league_seats me on me.league_id = l.id
      where me.kind = 'human' and me.ref_id = p_club::text
    )
  );
$$;

-- Leagues whose season and break are over.
create or replace function public.human_leagues_due(p_today date)
returns table (id integer, season_key date, season_number integer)
language sql
stable
security definer
set search_path = ''
as $$
  select l.id, l.season_key, l.season_number
  from public.human_league l
  where l.frozen and l.season_key + 25 <= p_today
  order by l.id;
$$;

create or replace function public.roll_human_league(p_season integer, p_key date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.human_league
  set season_key = p_key, frozen = false, cycle = cycle + 1,
      season_number = greatest(
        (select max(season_number) from public.human_league),
        coalesce((select max(season) from public.human_league_history), 0),
        coalesce((select max(season) from public.human_broadcasts), 0)
      ) + 1
  where season_number = p_season and season_key + 21 < p_key;
  if found then
    -- Placeholders of this league season only: other leagues play on.
    delete from public.fixtures
    where competition = 'human' and status <> 'played'
      and matchday / 100 = case when p_season <= 1 then 3 else 1000 + p_season end;
  end if;
  return (
    select jsonb_build_object(
      'season_key', season_key, 'season_number', season_number, 'frozen', frozen
    )
    from public.human_league
    order by (season_key = p_key) desc, id
    limit 1
  );
end;
$$;

create or replace function public.close_human_season(
  p_season integer,
  p_key date,
  p_standings jsonb,
  p_awards jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_league public.human_league%rowtype;
  v_saved integer := 0;
  v_award record;
begin
  perform pg_advisory_xact_lock(hashtext('human_league'));
  select * into v_league from public.human_league
  where season_number = p_season for update;
  if found and jsonb_typeof(p_standings) = 'array' and v_league.season_key + 21 < p_key then
    insert into public.human_league_history (
      season, season_key, standings, awards, league_id, cycle
    )
    values (
      p_season, v_league.season_key, p_standings, p_awards, v_league.id, v_league.cycle
    )
    on conflict (season) do nothing;
    get diagnostics v_saved = row_count;
  end if;
  if v_saved = 1 and jsonb_typeof(p_awards) = 'array' then
    for v_award in
      select x.club_id, x.place, x.amount
      from jsonb_to_recordset(p_awards) as x(club_id uuid, place integer, amount integer)
      where x.amount between 1 and 100000
      order by x.club_id
    loop
      update public.clubs set cash_balance = cash_balance + v_award.amount
      where id = v_award.club_id;
      if found then
        insert into public.finance_movements (club_id, category, label, amount)
        values (
          v_award.club_id, 'human_prize',
          'Liga ludzi ' || v_league.id || ', sezon ' || v_league.cycle || ': miejsce '
            || v_award.place,
          v_award.amount
        );
      end if;
    end loop;
  end if;
  return public.roll_human_league(p_season, p_key);
end;
$$;

-- Same function as before; the rounds of every running league season stay.
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
  -- Human matchdays are 300 + round in season 1, then 100000 + season * 100 + round.
  delete from public.fixtures f
  where f.club_id = p_club_id
    and not (f.competition = 'challenge' and f.status <> 'played')
    and not (f.competition = 'human' and exists (
      select 1 from public.human_league h
      where f.matchday / 100 = case when h.season_number <= 1 then 3 else 1000 + h.season_number end
    ));
  return true;
end;
$$;

revoke all on function
  public.human_active_clubs(timestamptz),
  public.human_league_sync(timestamptz, date, date, jsonb),
  public.freeze_human_league(integer),
  public.human_league_of(uuid),
  public.human_leagues_due(date)
from public, anon, authenticated;
grant execute on function
  public.human_league_sync(timestamptz, date, date, jsonb),
  public.freeze_human_league(integer),
  public.human_league_of(uuid),
  public.human_leagues_due(date)
to service_role;

notify pgrst, 'reload schema';
