-- Account deletion, first steps, invitations and simple return statistics (D142).

alter table public.finance_movements
  drop constraint if exists finance_movements_category_check;
alter table public.finance_movements
  add constraint finance_movements_category_check check (
    category in (
      'starter', 'match_reward', 'transfer_buy', 'transfer_sell', 'sponsor_base', 'sponsor_bonus',
      'email_confirm', 'wages', 'scout_report', 'ticket_income', 'stadium_build', 'coach_hire',
      'season_goal', 'physio_hire', 'assistant_hire', 'board_task', 'academy_build',
      'academy_upkeep', 'academy_training', 'starter_reward'
    )
  );

-- Days an account played. No address, device or page: only the day. Goes with the account.
create table if not exists public.account_activity (
  user_id uuid not null references auth.users (id) on delete cascade,
  day date not null,
  primary key (user_id, day)
);

create table if not exists public.club_starter_rewards (
  club_id uuid primary key references public.clubs (id) on delete cascade,
  claimed_at timestamptz not null default now()
);

create table if not exists public.club_invites (
  club_id uuid primary key references public.clubs (id) on delete cascade,
  code text not null unique check (code ~ '^[A-Za-z0-9_-]{10,24}$'),
  created_at timestamptz not null default now()
);

create table if not exists public.club_invite_uses (
  invited_club_id uuid primary key references public.clubs (id) on delete cascade,
  inviter_club_id uuid not null references public.clubs (id) on delete cascade,
  created_at timestamptz not null default now(),
  check (invited_club_id <> inviter_club_id)
);

create index if not exists club_invite_uses_inviter_idx
  on public.club_invite_uses (inviter_club_id);

alter table public.account_activity enable row level security;
alter table public.club_starter_rewards enable row level security;
alter table public.club_invites enable row level security;
alter table public.club_invite_uses enable row level security;

-- Server only: no policies, no grants for a player session.
revoke all on public.account_activity, public.club_starter_rewards, public.club_invites,
  public.club_invite_uses from public, anon, authenticated;
grant select, insert on public.account_activity, public.club_invites, public.club_invite_uses
  to service_role;

create or replace function public.starter_progress(p_club_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'played', (c.season_number - 1) * 22 + (
      select count(*) from public.fixtures f
      where f.club_id = c.id and f.competition = 'league' and f.status = 'played'
    ),
    'trained', c.last_training_on is not null,
    'intake', exists (select 1 from public.academy_intakes a where a.club_id = c.id),
    'claimed', exists (select 1 from public.club_starter_rewards r where r.club_id = c.id)
  )
  from public.clubs c
  where c.id = p_club_id
$$;

create or replace function public.claim_starter_reward(
  p_club_id uuid,
  p_amount integer,
  p_label text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_progress jsonb;
begin
  if p_amount is null or p_amount < 1 or p_amount > 10000 then
    raise exception 'starter reward out of range';
  end if;
  perform 1 from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  v_progress := public.starter_progress(p_club_id);
  if (v_progress ->> 'claimed')::boolean then
    return jsonb_build_object('ok', true, 'already', true);
  end if;
  if (v_progress ->> 'played')::integer < 3
    or not (v_progress ->> 'trained')::boolean
    or not (v_progress ->> 'intake')::boolean then
    return jsonb_build_object('ok', false, 'reason', 'steps');
  end if;
  insert into public.club_starter_rewards (club_id) values (p_club_id);
  update public.clubs set cash_balance = cash_balance + p_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'starter_reward', p_label, p_amount);
  return jsonb_build_object('ok', true);
end;
$$;

-- Removes the club of an account. What other clubs keep loses its name. The account itself is
-- deleted by the caller right after; a club that is gone already is not an error.
create or replace function public.delete_manager_club(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_club uuid;
begin
  select id into v_club from public.clubs where owner_id = p_user_id for update;
  if not found then
    return false;
  end if;

  update public.transfer_auctions set winner_club_id = null where winner_club_id = v_club;
  delete from public.fixtures
  where competition = 'challenge' and status <> 'played' and opponent_club_id = v_club::text;
  update public.fixtures set match_note = null
  where opponent_club_id = v_club::text and match_note is not null;

  update public.human_league_seats
  set display_name = 'Klub usunięty', short_name = 'USU' where ref_id = v_club::text;
  update public.human_broadcasts
  set home_name = 'Klub usunięty', home_short = 'USU' where home_id = v_club::text;
  update public.human_broadcasts
  set away_name = 'Klub usunięty', away_short = 'USU' where away_id = v_club::text;
  update public.human_league_history h
  set standings = (
    select jsonb_agg(
      case when r ->> 'id' = v_club::text
        then jsonb_set(r, '{name}', '"Klub usunięty"'::jsonb) else r end
      order by n
    )
    from jsonb_array_elements(h.standings) with ordinality as x(r, n)
  )
  where h.standings @> jsonb_build_array(jsonb_build_object('id', v_club::text));

  delete from public.clubs where id = v_club;
  return true;
end;
$$;

-- Counts only, never a person. Test clubs are left out by id.
create or replace function public.player_report(p_skip uuid[] default '{}')
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  with people as (
    select u.id, (u.created_at at time zone 'Europe/Warsaw')::date as born, c.id as club,
      c.first_match_completed_at is not null as opened, c.last_training_on is not null as trained,
      coalesce(c.season_number, 1) as season,
      coalesce((c.season_number - 1) * 22, 0) + (
        select count(*) from public.fixtures f
        where f.club_id = c.id and f.competition = 'league' and f.status = 'played'
      ) as played
    from auth.users u
    left join public.clubs c on c.owner_id = u.id
    where c.id is null or not (c.id = any (p_skip))
  ),
  today as (select (now() at time zone 'Europe/Warsaw')::date as d),
  back as (
    select p.id, p.born,
      exists (
        select 1 from public.account_activity a where a.user_id = p.id and a.day = p.born + 1
      ) as d1,
      exists (
        select 1 from public.account_activity a
        where a.user_id = p.id and a.day between p.born + 7 and p.born + 13
      ) as d7
    from people p
  )
  select jsonb_build_object(
    'konta', (select count(*) from people),
    'kluby', (select count(*) from people where club is not null),
    'mecz_otwarcia', (select count(*) from people where opened),
    'mecz_1', (select count(*) from people where played >= 1),
    'mecz_2', (select count(*) from people where played >= 2),
    'trening', (select count(*) from people where trained),
    'mecz_5', (select count(*) from people where played >= 5),
    'sezon_2', (select count(*) from people where season >= 2),
    'wrocili_po_1_dniu', (select count(*) from back where d1),
    'liczeni_po_1_dniu', (select count(*) from back, today where born + 1 < d),
    'wrocili_po_7_dniach', (select count(*) from back where d7),
    'liczeni_po_7_dniach', (select count(*) from back, today where born + 13 < d),
    'aktywni_7_dni', (
      select count(distinct a.user_id) from public.account_activity a
      join people p on p.id = a.user_id, today where a.day > d - 7
    ),
    'zaproszeni', (select count(*) from public.club_invite_uses)
  )
$$;

revoke all on function public.starter_progress(uuid),
  public.claim_starter_reward(uuid, integer, text),
  public.delete_manager_club(uuid),
  public.player_report(uuid[])
  from public, anon, authenticated;
grant execute on function public.starter_progress(uuid),
  public.claim_starter_reward(uuid, integer, text),
  public.delete_manager_club(uuid),
  public.player_report(uuid[])
  to service_role;
