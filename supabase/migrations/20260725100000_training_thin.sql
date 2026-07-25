-- LFE-TRAINING-01 Thin Slice: last training day on club (UTC date).

alter table public.clubs
  add column if not exists last_training_on date null;

comment on column public.clubs.last_training_on is
  'UTC calendar date of last completed team training session (LFE-TRAINING-01).';
