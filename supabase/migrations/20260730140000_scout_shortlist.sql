-- LFE-SCOUTING-01 Thin: private shortlist preferences (refs to players.id only).
-- Not a second player model — no skill / potential / score columns.

create table if not exists public.scout_shortlist (
  club_id uuid not null references public.clubs (id) on delete cascade,
  player_id text not null references public.players (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (club_id, player_id)
);

comment on table public.scout_shortlist is
  'LFE-SCOUTING-01: private manager shortlist — preference refs only (club_id, player_id).';

create index if not exists scout_shortlist_player_id_idx
  on public.scout_shortlist (player_id);

alter table public.scout_shortlist enable row level security;

create policy "scout_shortlist_select_own"
  on public.scout_shortlist
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "scout_shortlist_insert_own"
  on public.scout_shortlist
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "scout_shortlist_delete_own"
  on public.scout_shortlist
  for delete
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );
