-- D143: goals and assists per match, an archive of results, prizes of the human league.

-- Results outlive the fixtures, which a new season deletes. Friendlies are not kept.
create table if not exists public.club_matches (
  club_id uuid not null references public.clubs (id) on delete cascade,
  match_id uuid not null,
  season_number integer not null,
  league_tier text not null,
  competition text not null,
  matchday integer not null,
  opponent_club_id text not null,
  -- Only for clubs of other players. The catalog names the rest.
  opponent_name text,
  is_home boolean not null,
  home_score integer not null,
  away_score integer not null,
  played_at timestamptz not null,
  primary key (club_id, match_id)
);

-- Own players who played, and opponents with a goal or an assist.
create table if not exists public.match_player_stats (
  club_id uuid not null,
  match_id uuid not null,
  team text not null,
  player_id text not null,
  player_name text not null,
  goals integer not null default 0 check (goals between 0 and 40),
  assists integer not null default 0 check (assists between 0 and 40),
  primary key (club_id, match_id, team, player_id),
  foreign key (club_id, match_id)
    references public.club_matches (club_id, match_id) on delete cascade
);

alter table public.club_matches enable row level security;
alter table public.match_player_stats enable row level security;

drop policy if exists "club_matches_select_own" on public.club_matches;
create policy "club_matches_select_own" on public.club_matches for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

drop policy if exists "match_player_stats_select_own" on public.match_player_stats;
create policy "match_player_stats_select_own" on public.match_player_stats for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

revoke all on public.club_matches, public.match_player_stats from anon, authenticated;
grant select on public.club_matches, public.match_player_stats to authenticated;

create or replace view public.player_season_stats
with (security_invoker = true) as
select s.club_id, m.season_number, m.competition, s.team, s.player_id,
  max(s.player_name) as player_name,
  count(*)::integer as matches,
  sum(s.goals)::integer as goals,
  sum(s.assists)::integer as assists
from public.match_player_stats s
join public.club_matches m on m.club_id = s.club_id and m.match_id = s.match_id
group by s.club_id, m.season_number, m.competition, s.team, s.player_id;

revoke all on public.player_season_stats from anon, authenticated;
grant select on public.player_season_stats to authenticated;
grant select on public.player_season_stats to service_role;

create or replace function public.archive_club_match()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.club_matches (
    club_id, match_id, season_number, league_tier, competition, matchday, opponent_club_id,
    opponent_name, is_home, home_score, away_score, played_at
  )
  select new.club_id, new.id, coalesce(c.season_number, 1), coalesce(c.league_tier, 'iv'),
    new.competition, new.matchday, new.opponent_club_id,
    (select o.name from public.clubs o where o.id::text = new.opponent_club_id),
    new.is_home, new.home_score, new.away_score, coalesce(new.played_at, now())
  from public.clubs c
  where c.id = new.club_id and new.home_score is not null and new.away_score is not null
  on conflict do nothing;
  return null;
end;
$$;

revoke all on function public.archive_club_match() from public, anon, authenticated;

drop trigger if exists archive_club_match on public.fixtures;
create trigger archive_club_match
  after update of status on public.fixtures
  for each row
  when (new.status = 'played' and old.status is distinct from 'played'
    and new.competition <> 'challenge')
  execute function public.archive_club_match();

insert into public.club_matches (
  club_id, match_id, season_number, league_tier, competition, matchday, opponent_club_id,
  opponent_name, is_home, home_score, away_score, played_at
)
select f.club_id, f.id, coalesce(c.season_number, 1), coalesce(c.league_tier, 'iv'), f.competition,
  f.matchday, f.opponent_club_id,
  (select o.name from public.clubs o where o.id::text = f.opponent_club_id),
  f.is_home, f.home_score, f.away_score, coalesce(f.played_at, f.created_at)
from public.fixtures f
join public.clubs c on c.id = f.club_id
where f.status = 'played' and f.competition <> 'challenge'
  and f.home_score is not null and f.away_score is not null
on conflict do nothing;

-- A deleted club leaves no name behind.
create or replace function public.forget_club_name()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.club_matches set opponent_name = 'Klub usunięty'
  where opponent_club_id = old.id::text;
  return null;
end;
$$;

revoke all on function public.forget_club_name() from public, anon, authenticated;

drop trigger if exists forget_club_name on public.clubs;
create trigger forget_club_name
  after delete on public.clubs
  for each row execute function public.forget_club_name();

-- Settlement and player stats in one transaction. Stats that cannot be stored never block a result.
create or replace function public.settle_match(p_args jsonb, p_players jsonb)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_club uuid := (p_args ->> 'p_club_id')::uuid;
  v_match uuid := (p_args ->> 'p_fixture_id')::uuid;
  v_result jsonb;
begin
  v_result := public.settle_fixture(
    p_fixture_id => v_match,
    p_club_id => v_club,
    p_home => (p_args ->> 'p_home')::integer,
    p_away => (p_args ->> 'p_away')::integer,
    p_reward => (p_args ->> 'p_reward')::integer,
    p_reward_label => p_args ->> 'p_reward_label',
    p_tickets => (p_args ->> 'p_tickets')::integer,
    p_wage_due => (p_args ->> 'p_wage_due')::integer,
    p_wage_label => p_args ->> 'p_wage_label',
    p_wage_short_label => p_args ->> 'p_wage_short_label',
    p_upkeep_by_level => p_args -> 'p_upkeep_by_level',
    p_upkeep_label => p_args ->> 'p_upkeep_label',
    p_upkeep_short_label => p_args ->> 'p_upkeep_short_label'
  );
  if (v_result ->> 'applied')::boolean and jsonb_typeof(p_players) = 'array' then
    begin
      insert into public.match_player_stats (
        club_id, match_id, team, player_id, player_name, goals, assists
      )
      select m.club_id, m.match_id,
        case when x.mine then m.club_id::text else m.opponent_club_id end,
        x.id, left(x.name, 60), x.goals, x.assists
      from public.club_matches m
      cross join jsonb_to_recordset(p_players)
        as x(id text, name text, mine boolean, goals integer, assists integer)
      where m.club_id = v_club and m.match_id = v_match
      on conflict do nothing;
    exception when others then
      raise warning 'match stats not stored: %', sqlerrm;
    end;
  end if;
  return v_result;
end;
$$;

revoke all on function public.settle_match(jsonb, jsonb) from public, anon, authenticated;
grant execute on function public.settle_match(jsonb, jsonb) to service_role;

-- Both clubs read the players of the one shared match from here.
alter table public.human_broadcasts add column if not exists stats jsonb;

-- Place, matches played and money of every club that earned its place.
alter table public.human_league_history add column if not exists awards jsonb;

alter table public.finance_movements drop constraint if exists finance_movements_category_check;
alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in (
      'starter', 'match_reward', 'transfer_buy', 'transfer_sell', 'sponsor_base', 'sponsor_bonus',
      'email_confirm', 'wages', 'scout_report', 'ticket_income', 'stadium_build', 'coach_hire',
      'season_goal', 'physio_hire', 'assistant_hire', 'board_task', 'academy_build',
      'academy_upkeep', 'academy_training', 'starter_reward', 'human_prize'
    )
  );

-- The rollover of D140, with the awards paid in the same transaction, once per season.
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
  v_old date;
  v_saved integer := 0;
  v_award record;
begin
  select season_key into v_old from public.human_league
  where id = 1 and season_number = p_season for update;
  if found and jsonb_typeof(p_standings) = 'array' and v_old + 21 < p_key then
    insert into public.human_league_history (season, season_key, standings, awards)
    values (p_season, v_old, p_standings, p_awards)
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
          'Liga ludzi, sezon ' || p_season || ': miejsce ' || v_award.place, v_award.amount
        );
      end if;
    end loop;
  end if;
  return public.roll_human_league(p_season, p_key);
end;
$$;

revoke all on function public.close_human_season(integer, date, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.close_human_season(integer, date, jsonb, jsonb) to service_role;

-- A new club season used to delete the played rounds of the running human league. The club could
-- play and be paid for them again. Rounds of the running human season stay now.
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
  delete from public.fixtures
  where club_id = p_club_id
    and not (competition = 'challenge' and status <> 'played')
    and not (competition = 'human' and matchday / 100 = coalesce((
      select case when h.season_number <= 1 then 3 else 1000 + h.season_number end
      from public.human_league h where h.id = 1
    ), 3));
  return true;
end;
$$;

notify pgrst, 'reload schema';
