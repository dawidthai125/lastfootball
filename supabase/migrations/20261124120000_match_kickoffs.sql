-- D130: what the live view started from. The server replays exactly this, so a lineup,
-- training or transfer made during the match cannot change the result on screen.
create table if not exists public.match_kickoffs (
  id uuid primary key default gen_random_uuid(),
  fixture_id uuid not null references public.fixtures (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  started_at timestamptz not null default now(),
  snapshot jsonb not null
);

create index if not exists match_kickoffs_fixture_idx
  on public.match_kickoffs (fixture_id, started_at desc);

create index if not exists match_kickoffs_club_idx on public.match_kickoffs (club_id);

-- Server only: row level security without policies, and no grants.
alter table public.match_kickoffs enable row level security;
revoke all on public.match_kickoffs from anon, authenticated;
grant select, insert, delete on public.match_kickoffs to service_role;
