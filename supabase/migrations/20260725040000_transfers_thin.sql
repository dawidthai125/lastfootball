-- LFE-TRANSFERS-01 Thin Slice: transfer window, departed players, deals ledger.

alter table public.clubs
  add column if not exists transfer_window_open boolean not null default false;

alter table public.players
  add column if not exists departed_at timestamptz null;

alter table public.players
  drop constraint if exists players_status_check;

alter table public.players
  add constraint players_status_check check (
    status in ('READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED')
  );

create index if not exists players_club_active_idx
  on public.players (club_id)
  where departed_at is null;

drop policy if exists "players_update_own" on public.players;

create policy "players_update_own"
  on public.players
  for update
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  )
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

alter table public.finance_movements
  drop constraint if exists finance_movements_category_check;

alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in ('starter', 'match_reward', 'transfer_buy', 'transfer_sell')
  );

create table if not exists public.transfer_deals (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  kind text not null,
  player_id text not null,
  market_id text null,
  amount integer not null,
  idempotency_key text not null,
  completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint transfer_deals_kind_check check (kind in ('buy', 'sell')),
  constraint transfer_deals_club_idempotency_unique unique (club_id, idempotency_key)
);

create index if not exists transfer_deals_club_completed_idx
  on public.transfer_deals (club_id, completed_at desc);

alter table public.transfer_deals enable row level security;

create policy "transfer_deals_select_own"
  on public.transfer_deals
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "transfer_deals_insert_own"
  on public.transfer_deals
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );
