-- LFE-ECONOMY-01 Thin Slice: club cash SSOT + thin finance ledger.

alter table public.clubs
  add column if not exists cash_balance integer not null default 0;

alter table public.clubs
  drop constraint if exists clubs_cash_balance_nonneg;

alter table public.clubs
  add constraint clubs_cash_balance_nonneg check (cash_balance >= 0);

-- Backfill existing clubs to Thin starter (100000) when still at default 0.
update public.clubs
set cash_balance = 100000
where cash_balance = 0;

create table if not exists public.finance_movements (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  category text not null,
  label text not null,
  amount integer not null,
  fixture_id uuid null references public.fixtures (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint finance_movements_category_check check (
    category in ('starter', 'match_reward')
  )
);

create index if not exists finance_movements_club_id_idx
  on public.finance_movements (club_id);

create index if not exists finance_movements_club_created_idx
  on public.finance_movements (club_id, created_at desc);

-- One match reward per fixture (idempotency for completeFixture).
create unique index if not exists finance_movements_fixture_reward_unique
  on public.finance_movements (fixture_id)
  where fixture_id is not null and category = 'match_reward';

alter table public.finance_movements enable row level security;

create policy "finance_movements_select_own"
  on public.finance_movements
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "finance_movements_insert_own"
  on public.finance_movements
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

-- Starter movements for backfilled clubs (skip if already present).
insert into public.finance_movements (club_id, category, label, amount)
select
  c.id,
  'starter',
  'Kapitał startowy',
  100000
from public.clubs c
where not exists (
  select 1
  from public.finance_movements m
  where m.club_id = c.id and m.category = 'starter'
);
