-- A new season deletes the club's fixtures. The cascade took every rival result with them,
-- for both clubs, and an open challenge lost its match.
alter table public.rival_challenges alter column fixture_id drop not null;
alter table public.rival_challenges drop constraint rival_challenges_fixture_id_fkey;
alter table public.rival_challenges
  add constraint rival_challenges_fixture_id_fkey
  foreign key (fixture_id) references public.fixtures (id) on delete set null;

-- The player's session still has to name a fixture when a challenge starts.
create or replace function public.lf_guard_challenges()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'UPDATE' then
      raise exception 'challenge results are written by the server' using errcode = '42501';
    end if;
    if new.status <> 'open' or new.home_score is not null or new.away_score is not null then
      raise exception 'a challenge starts open' using errcode = '42501';
    end if;
    if new.fixture_id is null then
      raise exception 'a challenge needs a match' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

-- Same as board_prestige_tasks, except that open challenges stay playable.
CREATE OR REPLACE FUNCTION public.clear_season_fixtures(p_club_id uuid, p_season integer, p_token uuid, p_played integer, p_history jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
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
  delete from public.fixtures
  where club_id = p_club_id and not (competition = 'challenge' and status <> 'played');
  return true;
end;
$function$

;
