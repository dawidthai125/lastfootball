-- Club pressing habit. 0 keeps kickoff pressing at 50. Cap 8 is kickoff 66.
-- Trained by tactics sessions. Cash and wages are unchanged.

alter table public.clubs
  add column if not exists style_pressing integer not null default 0;

alter table public.clubs
  drop constraint if exists clubs_style_pressing_check;

alter table public.clubs
  add constraint clubs_style_pressing_check
  check (style_pressing between 0 and 8);
