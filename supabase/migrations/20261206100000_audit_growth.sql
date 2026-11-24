-- D159: whole-game audit, third round: growth, money steps of the season start, contracts.

-- 1. The engine reads the groups, the player sees the skill: they move together (D123, D124).
--    The change comes on top of what the same write did to a group, e.g. a trained one.
--    Never above the potential. A group trained on its own (D134) does not touch the skill.
create or replace function public.lf_move_group(p_value integer, p_delta integer, p_potential integer)
returns integer
language sql
immutable
set search_path = ''
as $$
  select case
    when p_delta > 0 then greatest(p_value, least(99, p_potential, p_value + p_delta))
    else greatest(1, p_value + p_delta)
  end;
$$;

create or replace function public.lf_move_groups()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_delta integer := new.skill - old.skill;
begin
  new.attr_attack := public.lf_move_group(new.attr_attack, v_delta, new.potential);
  new.attr_passing := public.lf_move_group(new.attr_passing, v_delta, new.potential);
  new.attr_defense := public.lf_move_group(new.attr_defense, v_delta, new.potential);
  new.attr_physical := public.lf_move_group(new.attr_physical, v_delta, new.potential);
  new.attr_goalkeeping := public.lf_move_group(new.attr_goalkeeping, v_delta, new.potential);
  return new;
end;
$$;

drop trigger if exists lf_move_groups on public.players;
create trigger lf_move_groups
  before update of skill on public.players
  for each row
  when (new.skill is distinct from old.skill)
  execute function public.lf_move_groups();

-- Growth of the past. A new player starts with every group at his skill and training raises
-- single groups, so the lowest one tells how much is missing. A second run changes nothing.
-- Skill lost with age cannot be told from trained groups, so those players keep theirs.
with gap as (
  select id,
    skill - least(attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping) as d
  from public.players
)
update public.players p
set attr_attack = public.lf_move_group(p.attr_attack, gap.d, p.potential),
    attr_passing = public.lf_move_group(p.attr_passing, gap.d, p.potential),
    attr_defense = public.lf_move_group(p.attr_defense, gap.d, p.potential),
    attr_physical = public.lf_move_group(p.attr_physical, gap.d, p.potential),
    attr_goalkeeping = public.lf_move_group(p.attr_goalkeeping, gap.d, p.potential)
from gap
where gap.id = p.id and gap.d > 0;

do $mig$
declare
  d text;
begin
  -- 2. Both sides of a challenge are built from the groups.
  if position('attr_attack' in pg_get_functiondef('public.rival_match_squad(uuid)'::regprocedure)) = 0
  then
    drop function public.rival_match_squad(uuid);
    create function public.rival_match_squad(p_club_id uuid)
    returns table (
      id text,
      name text,
      shirt_number integer,
      pos text,
      role text,
      starter boolean,
      captain boolean,
      age integer,
      skill integer,
      status text,
      attr_attack integer,
      attr_passing integer,
      attr_defense integer,
      attr_physical integer,
      attr_goalkeeping integer
    )
    language sql
    stable
    security definer
    set search_path = public
    as $$
      select p.id, p.name, p.shirt_number, p.pos, p.role, p.starter, p.captain, p.age, p.skill,
        public.lf_status_today(p.status, p.injury_matches, p.suspension_matches, p.absence_on),
        p.attr_attack, p.attr_passing, p.attr_defense, p.attr_physical, p.attr_goalkeeping
      from public.players p
      where p.club_id = p_club_id
        and p.departed_at is null
        and coalesce(p.academy_track, false) = false
        and not p.on_loan
        and (p.intl_absent_until is null or p.intl_absent_until < (now() at time zone 'utc')::date)
        and exists (
          select 1
          from public.rival_challenges rc
          join public.clubs me on me.id = rc.challenger_club_id
          where me.owner_id = (select auth.uid())
            and rc.rival_club_id = p_club_id
            and rc.status = 'open'
        );
    $$;
    revoke all on function public.rival_match_squad(uuid) from public, anon;
    grant execute on function public.rival_match_squad(uuid) to authenticated, service_role;
  end if;

  -- 3. A player bought on the market signs for this season and two more, like any transfer (D139).
  d := pg_get_functiondef('public.buy_market_player(uuid,text,integer,integer,jsonb)'::regprocedure);
  if position('contract_season' in d) = 0 then
    if position('    nationality, origin, joined_at, version
  ) values (' in d) = 0
      or position('else ''bought'' end, now(), 1
  );' in d) = 0
    then
      raise exception 'buy_market_player differs';
    end if;
    d := replace(d, '    nationality, origin, joined_at, version
  ) values (', '    nationality, origin, joined_at, version, contract_season
  ) values (');
    d := replace(d, 'else ''bought'' end, now(), 1
  );', 'else ''bought'' end, now(), 1,
    (select c.season_number + 2 from public.clubs c where c.id = p_club_id)
  );');
    execute d;
  end if;
end;
$mig$;

-- 4. Mark, cash and ledger land together, so a lost reply is safe to repeat. False: paid before.
create or replace function public.pay_sponsor_bonus(
  p_club_id uuid,
  p_season integer,
  p_label text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amount integer;
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if not found or p_season is null or p_label is null then
    raise exception 'sponsor bonus out of range';
  end if;
  update public.club_sponsor_contracts
  set bonus_claimed_at = now(), updated_at = now()
  where club_id = p_club_id and season_number = p_season and bonus_claimed_at is null
  returning bonus_amount into v_amount;
  if not found then
    return false;
  end if;
  update public.clubs set cash_balance = cash_balance + v_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'sponsor_bonus', p_label, v_amount);
  return true;
end;
$$;

-- The base of the first contract, which no season start has paid (D136).
create or replace function public.pay_first_sponsor_base(
  p_club_id uuid,
  p_season integer,
  p_label text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_amount integer;
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if not found or p_season is null or p_label is null then
    raise exception 'sponsor base out of range';
  end if;
  update public.club_sponsor_contracts
  set base_paid_season_number = p_season
  where club_id = p_club_id and season_number = p_season and base_paid_season_number is null
  returning base_amount into v_amount;
  if not found then
    return false;
  end if;
  update public.clubs set cash_balance = cash_balance + v_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'sponsor_base', p_label, v_amount);
  return true;
end;
$$;

create or replace function public.renew_sponsor(
  p_club_id uuid,
  p_season integer,
  p_base integer,
  p_bonus integer,
  p_label text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if not found or p_season is null or p_base is null or p_base < 0 or p_bonus is null
    or p_label is null
  then
    raise exception 'sponsor renewal out of range';
  end if;
  update public.club_sponsor_contracts
  set season_number = p_season, base_amount = p_base, bonus_amount = p_bonus,
      bonus_claimed_at = null, renewal_accepted_at = null, base_paid_season_number = p_season,
      updated_at = now()
  where club_id = p_club_id and base_paid_season_number is distinct from p_season;
  if not found then
    return false;
  end if;
  update public.clubs set cash_balance = cash_balance + p_base where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'sponsor_base', p_label, p_base);
  return true;
end;
$$;

create or replace function public.pay_season_goal(
  p_club_id uuid,
  p_season integer,
  p_note text,
  p_amount integer,
  p_label text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_season is null or p_amount is null or p_amount < 0 or p_label is null then
    raise exception 'season goal out of range';
  end if;
  update public.clubs
  set season_goal_paid_for = p_season, season_goal_note = p_note,
      cash_balance = cash_balance + p_amount
  where id = p_club_id and season_phase = 'offseason'
    and season_goal_paid_for is distinct from p_season;
  if not found then
    return false;
  end if;
  if p_amount > 0 then
    insert into public.finance_movements (club_id, category, label, amount)
    values (p_club_id, 'season_goal', p_label, p_amount);
  end if;
  return true;
end;
$$;

revoke all on function
  public.lf_move_group(integer, integer, integer),
  public.lf_move_groups(),
  public.pay_sponsor_bonus(uuid, integer, text),
  public.pay_first_sponsor_base(uuid, integer, text),
  public.renew_sponsor(uuid, integer, integer, integer, text),
  public.pay_season_goal(uuid, integer, text, integer, text)
from public, anon, authenticated;
grant execute on function
  public.lf_move_group(integer, integer, integer),
  public.lf_move_groups(),
  public.pay_sponsor_bonus(uuid, integer, text),
  public.pay_first_sponsor_base(uuid, integer, text),
  public.renew_sponsor(uuid, integer, integer, integer, text),
  public.pay_season_goal(uuid, integer, text, integer, text)
to service_role;

notify pgrst, 'reload schema';
