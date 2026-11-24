-- One open match per club: the newest start replaces the one before it.
drop index if exists public.match_kickoffs_club_idx;
create unique index if not exists match_kickoffs_one_per_club
  on public.match_kickoffs (club_id);
grant update on public.match_kickoffs to service_role;
