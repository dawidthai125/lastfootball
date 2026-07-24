-- LFE-MATCH-01: SSOT for First Match Experience completion.

alter table public.clubs
  add column if not exists first_match_completed_at timestamptz null;
