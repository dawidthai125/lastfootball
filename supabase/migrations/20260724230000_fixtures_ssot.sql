-- LFE-LEAGUE-01 Thin A: fixtures SSOT (club-scoped league calendar).
-- Opponent identity = opponent_club_id (catalog id in app code), not free-text name.

create table if not exists public.fixtures (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  matchday integer not null,
  competition text not null default 'league',
  opponent_club_id text not null,
  is_home boolean not null default true,
  status text not null default 'scheduled',
  home_score integer null,
  away_score integer null,
  played_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint fixtures_matchday_positive check (matchday >= 1),
  constraint fixtures_status_check check (status in ('scheduled', 'upcoming', 'played')),
  constraint fixtures_competition_check check (competition in ('league')),
  constraint fixtures_club_matchday_unique unique (club_id, matchday),
  constraint fixtures_scores_when_played check (
    (status <> 'played')
    or (home_score is not null and away_score is not null and played_at is not null)
  )
);

create index if not exists fixtures_club_id_idx on public.fixtures (club_id);
create index if not exists fixtures_club_status_idx on public.fixtures (club_id, status);

alter table public.fixtures enable row level security;

create policy "fixtures_select_own"
  on public.fixtures
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "fixtures_insert_own"
  on public.fixtures
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "fixtures_update_own"
  on public.fixtures
  for update
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  )
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "fixtures_delete_own"
  on public.fixtures
  for delete
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );
