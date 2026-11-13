-- Club width habit. 0 keeps kickoff width at 50. Cap 8 is kickoff 66.
-- Trained by physical sessions. Cash and wages are unchanged.

alter table public.clubs
  add column if not exists style_width integer not null default 0;

alter table public.clubs
  drop constraint if exists clubs_style_width_check;

alter table public.clubs
  add constraint clubs_style_width_check
  check (style_width between 0 and 8);
