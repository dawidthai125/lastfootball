-- LFE-SPONSORS-01: one base sponsor contract per club (D95) + finance categories.

alter table public.finance_movements
  drop constraint if exists finance_movements_category_check;

alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in (
      'starter',
      'match_reward',
      'transfer_buy',
      'transfer_sell',
      'sponsor_base',
      'sponsor_bonus'
    )
  );

create table if not exists public.club_sponsor_contracts (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  brand_key text not null default 'local-partner',
  brand_name text not null default 'Partner Lokalny',
  season_number integer not null default 1,
  base_amount integer not null,
  bonus_amount integer not null,
  goal_kind text not null default 'top_half',
  goal_target integer not null default 6,
  bonus_claimed_at timestamptz null,
  base_paid_season_number integer null,
  renewal_accepted_at timestamptz null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint club_sponsor_contracts_club_id_unique unique (club_id),
  constraint club_sponsor_contracts_season_number_check check (season_number >= 1),
  constraint club_sponsor_contracts_base_amount_check check (base_amount >= 0),
  constraint club_sponsor_contracts_bonus_amount_check check (bonus_amount >= 0),
  constraint club_sponsor_contracts_goal_kind_check check (goal_kind in ('top_half')),
  constraint club_sponsor_contracts_goal_target_check check (goal_target >= 1)
);

create index if not exists club_sponsor_contracts_club_id_idx
  on public.club_sponsor_contracts (club_id);

comment on table public.club_sponsor_contracts is
  'LFE-SPONSORS-01: sole SSOT for Thin base sponsor contract (D95).';

alter table public.club_sponsor_contracts enable row level security;

create policy "club_sponsor_contracts_select_own"
  on public.club_sponsor_contracts
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "club_sponsor_contracts_insert_own"
  on public.club_sponsor_contracts
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "club_sponsor_contracts_update_own"
  on public.club_sponsor_contracts
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
