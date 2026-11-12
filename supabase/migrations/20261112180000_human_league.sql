-- Liga ludzi. Does not rewrite the per-club AI season.
-- Fixture matchdays 301–322 stay clear of league 1–22, cup 101–104 and challenges 201+.

alter table public.fixtures drop constraint if exists fixtures_competition_check;

alter table public.fixtures
  add constraint fixtures_competition_check
  check (competition in ('league', 'cup', 'challenge', 'human'));

create table if not exists public.human_league (
  id integer primary key default 1,
  season_key date not null,
  frozen boolean not null default false,
  constraint human_league_singleton check (id = 1)
);

create table if not exists public.human_league_seats (
  slot integer primary key check (slot >= 0 and slot < 12),
  kind text not null check (kind in ('human', 'bot')),
  ref_id text not null unique,
  display_name text not null,
  short_name text not null
);

create table if not exists public.human_broadcasts (
  id uuid primary key default gen_random_uuid(),
  matchday integer not null check (matchday >= 1 and matchday <= 22),
  home_id text not null,
  away_id text not null,
  home_name text not null,
  away_name text not null,
  home_short text not null,
  away_short text not null,
  seed text not null,
  kickoff_on date not null,
  home_xi jsonb null,
  away_xi jsonb null,
  home_score integer null,
  away_score integer null,
  locked_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (matchday, home_id, away_id)
);

alter table public.human_league enable row level security;
alter table public.human_league_seats enable row level security;
alter table public.human_broadcasts enable row level security;

create policy "human_league_select"
  on public.human_league
  for select
  to authenticated
  using (true);

create policy "human_seats_select"
  on public.human_league_seats
  for select
  to authenticated
  using (true);

create policy "human_broadcasts_select"
  on public.human_broadcasts
  for select
  to authenticated
  using (true);
