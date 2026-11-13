-- Club tempo habit. 0 keeps kickoff tempo at 50. Cap 8 is kickoff 66.
-- Trained by technique sessions. Cash and wages are unchanged.

alter table public.clubs
  add column if not exists style_tempo integer not null default 0;

alter table public.clubs
  drop constraint if exists clubs_style_tempo_check;

alter table public.clubs
  add constraint clubs_style_tempo_check
  check (style_tempo between 0 and 8);
