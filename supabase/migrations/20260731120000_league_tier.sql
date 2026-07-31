-- LFE-PROMOTION-01: club league tier SSOT (D88).
-- Default iv = starter league; floor of the Thin pyramid.

alter table public.clubs
  add column if not exists league_tier text not null default 'iv';

alter table public.clubs
  drop constraint if exists clubs_league_tier_check;

alter table public.clubs
  add constraint clubs_league_tier_check
  check (league_tier in ('iv', 'iii', 'ii', 'i'));

comment on column public.clubs.league_tier is
  'LFE-PROMOTION-01: league rung SSOT (iv→i). Labels via resolveLeagueTierLabel; AI catalog unchanged (D92).';
