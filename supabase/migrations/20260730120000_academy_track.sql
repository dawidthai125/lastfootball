-- LFE-ACADEMY-01 Thin A: academy_track + promoted_at on players (single SSOT).
-- Prospects (academy_track = true) stay in players — no second table / OVR.

alter table public.players
  add column if not exists academy_track boolean not null default false;

alter table public.players
  add column if not exists promoted_at timestamptz null;

comment on column public.players.academy_track is
  'LFE-ACADEMY-01: true = youth prospect before Promote; false = senior roster.';

comment on column public.players.promoted_at is
  'LFE-ACADEMY-01: set on Promote from academy_track; null if never promoted from academy.';

create index if not exists players_club_academy_track_idx
  on public.players (club_id, academy_track)
  where departed_at is null;

-- Existing rows remain senior (default false). No backfill of prospects.
