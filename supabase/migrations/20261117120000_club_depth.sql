-- Morale, stored contract, personality, set piece, physio, assistant, press, individual day.

create or replace function public.personality_from_id(p_id text)
returns text
language plpgsql
immutable
as $$
declare
  v_hash bigint := 0;
  v_i integer;
  v_code integer;
begin
  if p_id is null then
    return 'spokojny';
  end if;
  for v_i in 1..char_length(p_id) loop
    v_code := ascii(substr(p_id, v_i, 1));
    v_hash := mod(v_hash * 33 + v_code, 4294967296);
  end loop;
  if mod(v_hash, 3) = 1 then
    return 'lider';
  elsif mod(v_hash, 3) = 2 then
    return 'wybuchowy';
  end if;
  return 'spokojny';
end;
$$;

alter table public.players
  add column if not exists morale integer,
  add column if not exists contract_until date,
  add column if not exists release_clause integer,
  add column if not exists personality text,
  add column if not exists set_piece boolean,
  add column if not exists last_individual_on date;

update public.players
set morale = coalesce(morale, 60),
    contract_until = coalesce(contract_until, date '2028-06-30'),
    release_clause = coalesce(release_clause, 100000 + skill * 5000),
    personality = coalesce(personality, public.personality_from_id(id)),
    set_piece = coalesce(set_piece, false);

alter table public.players alter column morale set default 60;
alter table public.players alter column morale set not null;
alter table public.players alter column contract_until set default date '2028-06-30';
alter table public.players alter column contract_until set not null;
alter table public.players alter column release_clause set default 0;
alter table public.players alter column release_clause set not null;
alter table public.players alter column personality set default 'spokojny';
alter table public.players alter column personality set not null;
alter table public.players alter column set_piece set default false;
alter table public.players alter column set_piece set not null;

alter table public.players drop constraint if exists players_morale_check;
alter table public.players
  add constraint players_morale_check check (morale between 0 and 100);

alter table public.players drop constraint if exists players_personality_check;
alter table public.players
  add constraint players_personality_check
  check (personality in ('spokojny', 'lider', 'wybuchowy'));

alter table public.players drop constraint if exists players_release_clause_check;
alter table public.players
  add constraint players_release_clause_check check (release_clause >= 0);

create unique index if not exists players_one_set_piece
  on public.players (club_id)
  where set_piece and departed_at is null;

alter table public.clubs
  add column if not exists physio boolean not null default false;

alter table public.clubs
  add column if not exists assistant_group text;

alter table public.clubs drop constraint if exists clubs_assistant_group_check;
alter table public.clubs
  add constraint clubs_assistant_group_check
  check (
    assistant_group is null
    or assistant_group in ('attack', 'passing', 'defense', 'physical', 'goalkeeping')
  );

alter table public.fixtures
  add column if not exists press_tone text;

alter table public.fixtures drop constraint if exists fixtures_press_tone_check;
alter table public.fixtures
  add constraint fixtures_press_tone_check
  check (press_tone is null or press_tone in ('praise', 'calm', 'criticize'));

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
      'assistant_hire'
    )
  );

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
  if new.injury_matches is null then new.injury_matches := 0; end if;
  if new.recent_ratings is null then new.recent_ratings := '{}'::integer[]; end if;
  if new.morale is null then new.morale := 60; end if;
  if new.contract_until is null then new.contract_until := date '2028-06-30'; end if;
  if new.release_clause is null then new.release_clause := 100000 + new.skill * 5000; end if;
  if new.personality is null then new.personality := public.personality_from_id(new.id); end if;
  if new.set_piece is null then new.set_piece := false; end if;
  return new;
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
    if v_item ? 'injury_matches' and ((v_item->>'injury_matches')::integer < 0 or (v_item->>'injury_matches')::integer > 4) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa kontuzja zawodnika.');
    end if;
    if v_item ? 'morale' and ((v_item->>'morale')::integer < 0 or (v_item->>'morale')::integer > 100) then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe morale zawodnika.');
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
        injury_matches = coalesce((v_item->>'injury_matches')::integer, injury_matches),
        recent_ratings = coalesce(v_ratings, recent_ratings),
        morale = coalesce((v_item->>'morale')::integer, morale)
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
