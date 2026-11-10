-- Puchar Krajowy: one real cup fixture per round, matchday 101–104.
-- League rows stay competition = league. Unique (club_id, matchday) is unchanged.

alter table public.fixtures drop constraint if exists fixtures_competition_check;

alter table public.fixtures
  add constraint fixtures_competition_check check (competition in ('league', 'cup'));
