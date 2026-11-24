-- Final standings of a closed season, and seats for clubs that still play.
create table if not exists public.human_league_history (
  season integer primary key check (season >= 1),
  season_key date not null,
  standings jsonb not null,
  closed_at timestamptz not null default now()
);

alter table public.human_league_history enable row level security;

drop policy if exists "human_history_select" on public.human_league_history;
create policy "human_history_select"
  on public.human_league_history
  for select
  to authenticated
  using (true);

revoke insert, update, delete, truncate on public.human_league_history from anon, authenticated;

-- Same rollover as before, with the standings in the same transaction.
create or replace function public.close_human_season(
  p_season integer,
  p_key date,
  p_standings jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_old date;
begin
  select season_key into v_old from public.human_league
  where id = 1 and season_number = p_season for update;
  if found and jsonb_typeof(p_standings) = 'array' and v_old + 21 < p_key then
    insert into public.human_league_history (season, season_key, standings)
    values (p_season, v_old, p_standings)
    on conflict (season) do nothing;
  end if;
  return public.roll_human_league(p_season, p_key);
end;
$$;

revoke all on function public.close_human_season(integer, date, jsonb)
  from public, anon, authenticated;
grant execute on function public.close_human_season(integer, date, jsonb) to service_role;

-- Twelve oldest clubs that played, trained or were founded since the given moment.
create or replace function public.human_league_clubs(p_since timestamptz)
returns table (id uuid, name text, short_name text, created_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, c.name, c.short_name, c.created_at
  from public.clubs c
  where c.created_at >= p_since
    or c.last_training_on >= (p_since at time zone 'utc')::date
    or exists (
      select 1 from public.fixtures f
      where f.club_id = c.id and f.status = 'played' and f.played_at >= p_since
    )
  order by c.created_at, c.id
  limit 12
$$;

revoke all on function public.human_league_clubs(timestamptz) from public, anon, authenticated;
grant execute on function public.human_league_clubs(timestamptz) to service_role;
