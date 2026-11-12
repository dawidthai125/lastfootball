-- Player truth: attribute groups, energy, form, wages, cards and injuries.
-- Existing skill is copied into every group so no squad is rerolled.

alter table public.players
  add column if not exists attr_attack integer,
  add column if not exists attr_passing integer,
  add column if not exists attr_defense integer,
  add column if not exists attr_physical integer,
  add column if not exists attr_goalkeeping integer,
  add column if not exists energy integer,
  add column if not exists form integer,
  add column if not exists wage integer,
  add column if not exists suspension_matches integer,
  add column if not exists recent_ratings integer[];

update public.players
set
  attr_attack = coalesce(attr_attack, skill),
  attr_passing = coalesce(attr_passing, skill),
  attr_defense = coalesce(attr_defense, skill),
  attr_physical = coalesce(attr_physical, skill),
  attr_goalkeeping = coalesce(attr_goalkeeping, skill),
  energy = coalesce(
    energy,
    case status
      when 'INJURED' then 25
      when 'TIRED' then 42
      when 'SUSPENDED' then 50
      else least(89, greatest(70, 70 + skill / 5))
    end
  ),
  form = coalesce(form, least(95, greatest(20, 35 + round(skill * 0.5)::int))),
  wage = coalesce(wage, 1200 + skill * 35 + greatest(0, 32 - age) * 50),
  suspension_matches = coalesce(suspension_matches, 0),
  recent_ratings = coalesce(recent_ratings, '{}'::integer[]);

alter table public.players alter column attr_attack set default 50;
alter table public.players alter column attr_passing set default 50;
alter table public.players alter column attr_defense set default 50;
alter table public.players alter column attr_physical set default 50;
alter table public.players alter column attr_goalkeeping set default 50;
alter table public.players alter column energy set default 80;
alter table public.players alter column form set default 60;
alter table public.players alter column wage set default 0;
alter table public.players alter column suspension_matches set default 0;
alter table public.players alter column recent_ratings set default '{}'::integer[];

alter table public.players alter column attr_attack set not null;
alter table public.players alter column attr_passing set not null;
alter table public.players alter column attr_defense set not null;
alter table public.players alter column attr_physical set not null;
alter table public.players alter column attr_goalkeeping set not null;
alter table public.players alter column energy set not null;
alter table public.players alter column form set not null;
alter table public.players alter column wage set not null;
alter table public.players alter column suspension_matches set not null;
alter table public.players alter column recent_ratings set not null;

alter table public.players drop constraint if exists players_attr_attack_check;
alter table public.players drop constraint if exists players_attr_passing_check;
alter table public.players drop constraint if exists players_attr_defense_check;
alter table public.players drop constraint if exists players_attr_physical_check;
alter table public.players drop constraint if exists players_attr_goalkeeping_check;
alter table public.players drop constraint if exists players_energy_check;
alter table public.players drop constraint if exists players_form_check;
alter table public.players drop constraint if exists players_wage_check;
alter table public.players drop constraint if exists players_suspension_matches_check;

alter table public.players
  add constraint players_attr_attack_check check (attr_attack between 1 and 99);
alter table public.players
  add constraint players_attr_passing_check check (attr_passing between 1 and 99);
alter table public.players
  add constraint players_attr_defense_check check (attr_defense between 1 and 99);
alter table public.players
  add constraint players_attr_physical_check check (attr_physical between 1 and 99);
alter table public.players
  add constraint players_attr_goalkeeping_check check (attr_goalkeeping between 1 and 99);
alter table public.players
  add constraint players_energy_check check (energy between 0 and 100);
alter table public.players
  add constraint players_form_check check (form between 20 and 95);
alter table public.players
  add constraint players_wage_check check (wage >= 0);
alter table public.players
  add constraint players_suspension_matches_check check (suspension_matches >= 0);

create or replace function public.players_fill_truth()
returns trigger
language plpgsql
as $$
begin
  if new.attr_attack is null then new.attr_attack := new.skill; end if;
  if new.attr_passing is null then new.attr_passing := new.skill; end if;
  if new.attr_defense is null then new.attr_defense := new.skill; end if;
  if new.attr_physical is null then new.attr_physical := new.skill; end if;
  if new.attr_goalkeeping is null then new.attr_goalkeeping := new.skill; end if;
  if new.energy is null then
    new.energy := case new.status
      when 'INJURED' then 25
      when 'TIRED' then 42
      when 'SUSPENDED' then 50
      else least(89, greatest(70, 70 + new.skill / 5))
    end;
  end if;
  if new.form is null then
    new.form := least(95, greatest(20, 35 + round(new.skill * 0.5)::int));
  end if;
  if new.wage is null then
    new.wage := 1200 + new.skill * 35 + greatest(0, 32 - new.age) * 50;
  end if;
  if new.suspension_matches is null then new.suspension_matches := 0; end if;
  if new.recent_ratings is null then new.recent_ratings := '{}'::integer[]; end if;
  return new;
end;
$$;

drop trigger if exists players_fill_truth on public.players;
create trigger players_fill_truth
  before insert on public.players
  for each row
  execute function public.players_fill_truth();

create or replace function public.complete_training_session(
  p_club_id uuid,
  p_training_on date,
  p_updates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_club public.clubs%rowtype;
  v_item jsonb;
  v_player_id text;
  v_status text;
  v_skill integer;
  v_changed integer := 0;
  v_rows integer;
  v_attack integer;
  v_passing integer;
  v_defense integer;
  v_physical integer;
  v_gk integer;
  v_energy integer;
  v_form integer;
  v_susp integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_club_id is null or p_training_on is null then
    return jsonb_build_object('ok', false, 'error', 'Brak danych treningu.');
  end if;

  if p_updates is null or jsonb_typeof(p_updates) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe aktualizacje kadry.');
  end if;

  select * into v_club from public.clubs where id = p_club_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  if v_club.owner_id is distinct from v_uid then
    return jsonb_build_object('ok', false, 'error', 'Brak dostępu do klubu.');
  end if;

  if v_club.last_training_on is not distinct from p_training_on then
    return jsonb_build_object('ok', true, 'skipped', true, 'changed_count', 0);
  end if;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_status := v_item->>'status';
    v_skill := (v_item->>'skill')::integer;
    if v_player_id is null or v_status is null or v_skill is null then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy wiersz aktualizacji.');
    end if;
    if v_status not in ('READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED') then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy status zawodnika.');
    end if;
    if v_skill < 1 or v_skill > 99 then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy skill zawodnika.');
    end if;
    if v_item ? 'attr_attack' and ((v_item->>'attr_attack')::integer < 1 or (v_item->>'attr_attack')::integer > 99) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy atrybut zawodnika.');
    end if;
    if v_item ? 'energy' and ((v_item->>'energy')::integer < 0 or (v_item->>'energy')::integer > 100) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa energia zawodnika.');
    end if;
    if v_item ? 'form' and ((v_item->>'form')::integer < 20 or (v_item->>'form')::integer > 95) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa forma zawodnika.');
    end if;
  end loop;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_status := v_item->>'status';
    v_skill := (v_item->>'skill')::integer;
    v_attack := case when v_item ? 'attr_attack' then (v_item->>'attr_attack')::integer else null end;
    v_passing := case when v_item ? 'attr_passing' then (v_item->>'attr_passing')::integer else null end;
    v_defense := case when v_item ? 'attr_defense' then (v_item->>'attr_defense')::integer else null end;
    v_physical := case when v_item ? 'attr_physical' then (v_item->>'attr_physical')::integer else null end;
    v_gk := case when v_item ? 'attr_goalkeeping' then (v_item->>'attr_goalkeeping')::integer else null end;
    v_energy := case when v_item ? 'energy' then (v_item->>'energy')::integer else null end;
    v_form := case when v_item ? 'form' then (v_item->>'form')::integer else null end;
    v_susp := case when v_item ? 'suspension_matches' then (v_item->>'suspension_matches')::integer else null end;

    update public.players
    set status = v_status,
        skill = least(v_skill, potential),
        attr_attack = coalesce(v_attack, attr_attack),
        attr_passing = coalesce(v_passing, attr_passing),
        attr_defense = coalesce(v_defense, attr_defense),
        attr_physical = coalesce(v_physical, attr_physical),
        attr_goalkeeping = coalesce(v_gk, attr_goalkeeping),
        energy = coalesce(v_energy, energy),
        form = coalesce(v_form, form),
        suspension_matches = coalesce(v_susp, suspension_matches)
    where id = v_player_id
      and club_id = p_club_id
      and departed_at is null
      and potential >= least(v_skill, potential);

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'Nie udało się zaktualizować zawodnika.');
    end if;
    v_changed := v_changed + 1;
  end loop;

  update public.clubs set last_training_on = p_training_on where id = p_club_id;

  return jsonb_build_object('ok', true, 'skipped', false, 'changed_count', v_changed);
end;
$$;

create or replace function public.apply_match_development(
  p_club_id uuid,
  p_match_key text,
  p_updates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_club public.clubs%rowtype;
  v_item jsonb;
  v_player_id text;
  v_skill integer;
  v_status text;
  v_changed integer := 0;
  v_rows integer;
  v_ratings integer[];
  v_rating jsonb;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_club_id is null or p_match_key is null or length(trim(p_match_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Brak danych rozwoju.');
  end if;

  if p_updates is null or jsonb_typeof(p_updates) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe aktualizacje kadry.');
  end if;

  select * into v_club from public.clubs where id = p_club_id for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  if v_club.owner_id is distinct from v_uid then
    return jsonb_build_object('ok', false, 'error', 'Brak dostępu do klubu.');
  end if;

  if exists (
    select 1 from public.match_development_log
    where club_id = p_club_id and match_key = p_match_key
  ) then
    return jsonb_build_object('ok', true, 'skipped', true, 'changed_count', 0);
  end if;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_skill := (v_item->>'skill')::integer;
    if v_player_id is null or v_skill is null then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy wiersz aktualizacji.');
    end if;
    if v_skill < 1 or v_skill > 99 then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy skill zawodnika.');
    end if;
    if v_item ? 'status' and (v_item->>'status') not in ('READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED') then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy status zawodnika.');
    end if;
    if v_item ? 'energy' and ((v_item->>'energy')::integer < 0 or (v_item->>'energy')::integer > 100) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa energia zawodnika.');
    end if;
    if v_item ? 'form' and ((v_item->>'form')::integer < 20 or (v_item->>'form')::integer > 95) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa forma zawodnika.');
    end if;
    if v_item ? 'recent_ratings' then
      if jsonb_typeof(v_item->'recent_ratings') <> 'array' or jsonb_array_length(v_item->'recent_ratings') > 5 then
        return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe oceny zawodnika.');
      end if;
    end if;
  end loop;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_skill := (v_item->>'skill')::integer;
    v_status := case when v_item ? 'status' then v_item->>'status' else null end;
    v_ratings := null;
    if v_item ? 'recent_ratings' then
      v_ratings := '{}'::integer[];
      for v_rating in select * from jsonb_array_elements(v_item->'recent_ratings')
      loop
        v_ratings := v_ratings || (v_rating::text)::integer;
      end loop;
    end if;

    update public.players
    set skill = least(v_skill, potential),
        status = coalesce(v_status, status),
        attr_attack = coalesce((v_item->>'attr_attack')::integer, attr_attack),
        attr_passing = coalesce((v_item->>'attr_passing')::integer, attr_passing),
        attr_defense = coalesce((v_item->>'attr_defense')::integer, attr_defense),
        attr_physical = coalesce((v_item->>'attr_physical')::integer, attr_physical),
        attr_goalkeeping = coalesce((v_item->>'attr_goalkeeping')::integer, attr_goalkeeping),
        energy = coalesce((v_item->>'energy')::integer, energy),
        form = coalesce((v_item->>'form')::integer, form),
        suspension_matches = coalesce((v_item->>'suspension_matches')::integer, suspension_matches),
        recent_ratings = coalesce(v_ratings, recent_ratings)
    where id = v_player_id
      and club_id = p_club_id
      and departed_at is null
      and potential >= least(v_skill, potential);

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'Nie udało się zaktualizować zawodnika.');
    end if;
    v_changed := v_changed + 1;
  end loop;

  insert into public.match_development_log (club_id, match_key)
  values (p_club_id, p_match_key);

  return jsonb_build_object('ok', true, 'skipped', false, 'changed_count', v_changed);
end;
$$;

revoke all on function public.apply_match_development(uuid, text, jsonb) from public;
grant execute on function public.apply_match_development(uuid, text, jsonb) to authenticated;
grant execute on function public.complete_training_session(uuid, date, jsonb) to authenticated;

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
      'wages'
    )
  );

create unique index if not exists finance_movements_fixture_wages_unique
  on public.finance_movements (fixture_id)
  where fixture_id is not null and category = 'wages';
