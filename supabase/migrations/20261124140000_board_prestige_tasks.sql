-- D131: season history, board tasks and their payout. Additive; safe before the deploy.

create table if not exists public.club_season_history (
  club_id uuid not null references public.clubs (id) on delete cascade,
  season_number integer not null check (season_number >= 1),
  league_tier text not null check (league_tier in ('iv', 'iii', 'ii', 'i')),
  position integer not null check (position >= 1),
  table_size integer not null check (table_size >= 1),
  points integer not null check (points >= 0),
  won integer not null check (won >= 0),
  drawn integer not null check (drawn >= 0),
  lost integer not null check (lost >= 0),
  goals_for integer not null check (goals_for >= 0),
  goals_against integer not null check (goals_against >= 0),
  -- 0 = no cup tie, 1..4 = last round reached, 5 = cup won.
  cup_round_reached integer not null default 0 check (cup_round_reached between 0 and 5),
  outcome text not null check (outcome in ('promote', 'stay', 'relegate')),
  created_at timestamptz not null default now(),
  primary key (club_id, season_number)
);

create table if not exists public.club_board_task_claims (
  club_id uuid not null references public.clubs (id) on delete cascade,
  season_number integer not null check (season_number >= 1),
  block integer not null check (block between 1 and 4),
  kind text not null,
  amount integer not null check (amount > 0),
  claimed_at timestamptz not null default now(),
  primary key (club_id, season_number, block)
);

-- The owner reads, only the server writes.
alter table public.club_season_history enable row level security;
alter table public.club_board_task_claims enable row level security;

revoke all on public.club_season_history, public.club_board_task_claims
  from public, anon, authenticated, service_role;
grant select on public.club_season_history, public.club_board_task_claims to authenticated;
grant select, insert on public.club_season_history to service_role;
grant select on public.club_board_task_claims to service_role;

drop policy if exists club_season_history_select_own on public.club_season_history;
create policy club_season_history_select_own on public.club_season_history
  for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

drop policy if exists club_board_task_claims_select_own on public.club_board_task_claims;
create policy club_board_task_claims_select_own on public.club_board_task_claims
  for select to authenticated
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

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
      'sponsor_bonus',
      'email_confirm',
      'wages',
      'scout_report',
      'ticket_income',
      'stadium_build',
      'coach_hire',
      'season_goal',
      'physio_hire',
      'assistant_hire',
      'board_task'
    )
  );

-- Claim, cash and ledger in one transaction. The app checks the owner and the completion first.
create or replace function public.claim_board_task(
  p_club_id uuid,
  p_season integer,
  p_block integer,
  p_kind text,
  p_amount integer,
  p_label text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season integer;
begin
  if p_amount is null or p_amount < 1 or p_amount > 10000 then
    raise exception 'board task reward out of range';
  end if;

  select season_number into v_season from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  if exists (
    select 1 from public.club_board_task_claims
    where club_id = p_club_id and season_number = p_season and block = p_block
  ) then
    return jsonb_build_object('applied', false);
  end if;
  if v_season is distinct from p_season or exists (
    select 1 from public.club_season_history
    where club_id = p_club_id and season_number = p_season
  ) then
    raise exception 'season is closed';
  end if;

  insert into public.club_board_task_claims (club_id, season_number, block, kind, amount)
  values (p_club_id, p_season, p_block, p_kind, p_amount);
  update public.clubs set cash_balance = cash_balance + p_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'board_task', p_label, p_amount);

  return jsonb_build_object('applied', true);
end;
$$;

revoke all on function public.claim_board_task(uuid, integer, integer, text, integer, text)
  from public, anon, authenticated;
grant execute on function public.claim_board_task(uuid, integer, integer, text, integer, text)
  to service_role;
