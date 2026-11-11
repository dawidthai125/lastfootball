-- Async rivalry: one manager plays both real squads. No live protocol.
-- League rows stay competition = league. Challenge matchdays start at 201.

alter table public.fixtures drop constraint if exists fixtures_competition_check;

alter table public.fixtures
  add constraint fixtures_competition_check check (competition in ('league', 'cup', 'challenge'));

create table if not exists public.rival_challenges (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null unique references public.fixtures (id) on delete cascade,
  challenger_club_id uuid not null references public.clubs (id) on delete cascade,
  challenger_name text not null,
  challenger_short text not null,
  rival_club_id uuid not null references public.clubs (id) on delete cascade,
  rival_name text not null,
  rival_short text not null,
  status text not null default 'open',
  home_score integer null,
  away_score integer null,
  played_at timestamptz null,
  created_at timestamptz not null default now(),
  constraint rival_challenges_distinct check (challenger_club_id <> rival_club_id),
  constraint rival_challenges_status_check check (status in ('open', 'played')),
  constraint rival_challenges_scores_when_played check (
    status <> 'played'
    or (home_score is not null and away_score is not null and played_at is not null)
  )
);

create unique index if not exists rival_challenges_one_open
  on public.rival_challenges (challenger_club_id, rival_club_id)
  where status = 'open';

create index if not exists rival_challenges_rival_idx
  on public.rival_challenges (rival_club_id, created_at desc);

alter table public.rival_challenges enable row level security;

create policy "rival_challenges_select_party"
  on public.rival_challenges
  for select
  to authenticated
  using (
    challenger_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
    or rival_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  );

create policy "rival_challenges_insert_challenger"
  on public.rival_challenges
  for insert
  to authenticated
  with check (
    challenger_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  );

create policy "rival_challenges_update_challenger"
  on public.rival_challenges
  for update
  to authenticated
  using (
    challenger_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  )
  with check (
    challenger_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  );

create or replace function public.list_rival_clubs()
returns table (id uuid, name text, short_name text)
language sql
stable
security definer
set search_path = public
as $$
  select c.id, c.name, c.short_name
  from public.clubs c
  where c.owner_id is distinct from (select auth.uid())
  order by c.name;
$$;

create or replace function public.rival_match_squad(p_club_id uuid)
returns table (
  id text,
  name text,
  shirt_number integer,
  pos text,
  role text,
  starter boolean,
  captain boolean,
  age integer,
  skill integer,
  status text
)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, p.name, p.shirt_number, p.pos, p.role, p.starter, p.captain, p.age, p.skill, p.status
  from public.players p
  where p.club_id = p_club_id
    and p.departed_at is null
    and coalesce(p.academy_track, false) = false
    and exists (
      select 1
      from public.rival_challenges rc
      join public.clubs me on me.id = rc.challenger_club_id
      where me.owner_id = (select auth.uid())
        and rc.rival_club_id = p_club_id
        and rc.status = 'open'
    );
$$;

grant execute on function public.list_rival_clubs() to authenticated;
grant execute on function public.rival_match_squad(uuid) to authenticated;
