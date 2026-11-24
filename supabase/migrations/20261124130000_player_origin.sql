-- D133: where a player came from and since when. Null = part of the starting squad.
alter table public.players
  add column if not exists origin text,
  add column if not exists joined_at timestamptz;

alter table public.players drop constraint if exists players_origin_check;
alter table public.players
  add constraint players_origin_check
  check (origin is null or origin in ('academy', 'free', 'bought', 'loan'));

update public.players
set origin = 'academy', joined_at = coalesce(joined_at, promoted_at, created_at)
where origin is null and (academy_track or promoted_at is not null or id like 'a-%');

update public.players
set origin = 'loan', joined_at = coalesce(joined_at, created_at)
where origin is null and loaned_in;

-- A move between clubs (instant, offer, auction) starts a new stay as a bought player.
create or replace function public.lf_stamp_player_move()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.club_id is distinct from old.club_id then
    new.origin := 'bought';
    new.joined_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists lf_stamp_player_move on public.players;
create trigger lf_stamp_player_move
  before update of club_id on public.players
  for each row execute function public.lf_stamp_player_move();
