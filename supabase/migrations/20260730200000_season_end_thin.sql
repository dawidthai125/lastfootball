-- LFE-SEASON-END-01 — Season End Thin lifecycle state (D78 · AC-10).
-- season_phase = offseason persists across refresh until Confirm N+1 (D85).

alter table public.clubs
  add column if not exists season_number integer not null default 1;

alter table public.clubs
  add column if not exists season_phase text not null default 'in_season';

alter table public.clubs
  drop constraint if exists clubs_season_phase_check;

alter table public.clubs
  add constraint clubs_season_phase_check
  check (season_phase in ('in_season', 'offseason'));

alter table public.clubs
  drop constraint if exists clubs_season_number_check;

alter table public.clubs
  add constraint clubs_season_number_check
  check (season_number >= 1);

comment on column public.clubs.season_number is
  'LFE-SEASON-END-01: current season index (1-based). Increments only on Confirm N+1.';

comment on column public.clubs.season_phase is
  'LFE-SEASON-END-01: in_season | offseason. offseason = Season Closed until Confirm.';
