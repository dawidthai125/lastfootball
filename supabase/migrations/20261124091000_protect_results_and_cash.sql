-- D127: a player session may not write results, cash, league position or sponsor money.
-- The app writes them with the service role after checking the owner.
-- SECURITY DEFINER functions (transfers, auctions, scouting, email bonus) run as their
-- owner, so current_user is not 'authenticated' there and they keep working.

create or replace function public.lf_guard_clubs()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.cash_balance is distinct from 100000
      or new.first_match_completed_at is not null
      or new.season_number is distinct from 1
      or new.season_phase is distinct from 'in_season'
      or new.league_tier is distinct from 'iv'
      or new.stands_level <> 0
      or new.pitch_level <> 0
      or new.training_center_level <> 0
      or new.coach_group is not null
      or new.assistant_group is not null
      or new.physio
      or new.transfer_window_open
      or new.season_goal_paid_for is not null
    then
      raise exception 'club starts from the starter state' using errcode = '42501';
    end if;
    return new;
  end if;
  if new.id is distinct from old.id
    or new.owner_id is distinct from old.owner_id
    or new.cash_balance is distinct from old.cash_balance
    or new.season_number is distinct from old.season_number
    or new.season_phase is distinct from old.season_phase
    or new.league_tier is distinct from old.league_tier
    or new.stands_level is distinct from old.stands_level
    or new.pitch_level is distinct from old.pitch_level
    or new.training_center_level is distinct from old.training_center_level
    or new.coach_group is distinct from old.coach_group
    or new.assistant_group is distinct from old.assistant_group
    or new.physio is distinct from old.physio
    or new.fan_mood is distinct from old.fan_mood
    or new.transfer_window_open is distinct from old.transfer_window_open
    or new.season_goal_paid_for is distinct from old.season_goal_paid_for
    or new.season_goal_note is distinct from old.season_goal_note
  then
    raise exception 'protected club column' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_clubs on public.clubs;
create trigger lf_guard_clubs
  before insert or update on public.clubs
  for each row execute function public.lf_guard_clubs();

create or replace function public.lf_guard_fixtures()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user not in ('authenticated', 'anon') then
    return coalesce(new, old);
  end if;
  -- A deleted club cascades into its fixtures as the table owner, not as the player.
  if tg_op <> 'UPDATE' then
    raise exception 'fixtures are written by the server' using errcode = '42501';
  end if;
  if (to_jsonb(new) - 'match_note' - 'press_tone')
    is distinct from (to_jsonb(old) - 'match_note' - 'press_tone')
  then
    raise exception 'protected fixture column' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_fixtures on public.fixtures;
create trigger lf_guard_fixtures
  before insert or update or delete on public.fixtures
  for each row execute function public.lf_guard_fixtures();

create or replace function public.lf_guard_server_only()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    raise exception 'written by the server' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists lf_guard_sponsor_contracts on public.club_sponsor_contracts;
create trigger lf_guard_sponsor_contracts
  before insert or update or delete on public.club_sponsor_contracts
  for each row execute function public.lf_guard_server_only();

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
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_challenges on public.rival_challenges;
create trigger lf_guard_challenges
  before insert or update on public.rival_challenges
  for each row execute function public.lf_guard_challenges();

-- TRUNCATE ignores row level security and row triggers.
revoke truncate on public.clubs, public.fixtures, public.players, public.finance_movements,
  public.club_sponsor_contracts, public.rival_challenges from anon, authenticated;
