-- Liga ludzi gets seasons. Old broadcasts stay as the history of season 1.
alter table public.human_league
  add column if not exists season_number integer not null default 1 check (season_number >= 1);

alter table public.human_broadcasts
  add column if not exists season integer not null default 1 check (season >= 1);

alter table public.human_broadcasts
  drop constraint if exists human_broadcasts_matchday_home_id_away_id_key;
alter table public.human_broadcasts
  drop constraint if exists human_broadcasts_season_pair_key;
alter table public.human_broadcasts
  add constraint human_broadcasts_season_pair_key unique (season, matchday, home_id, away_id);

-- One caller rolls the league over. Seats open again, so new clubs can take bot seats.
-- Rows of matches nobody played are only placeholders of the closed season.
create or replace function public.roll_human_league(p_season integer, p_key date)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.human_league
  set season_number = season_number + 1, season_key = p_key, frozen = false
  where id = 1 and season_number = p_season and season_key + 21 < p_key;
  if found then
    delete from public.fixtures where competition = 'human' and status <> 'played';
  end if;
  -- The state after the call, whoever rolled: the page must not read it again.
  return (
    select jsonb_build_object(
      'season_key', season_key, 'season_number', season_number, 'frozen', frozen
    )
    from public.human_league
    where id = 1
  );
end;
$$;

revoke all on function public.roll_human_league(integer, date) from public, anon, authenticated;
grant execute on function public.roll_human_league(integer, date) to service_role;
