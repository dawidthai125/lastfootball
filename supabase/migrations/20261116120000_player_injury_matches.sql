-- Injury length in matches. Separate from suspension_matches. Default 0, cap 4.

alter table public.players
  add column if not exists injury_matches integer;

update public.players
set injury_matches = coalesce(injury_matches, 0);

alter table public.players alter column injury_matches set default 0;
alter table public.players alter column injury_matches set not null;

alter table public.players drop constraint if exists players_injury_matches_check;
alter table public.players
  add constraint players_injury_matches_check check (injury_matches between 0 and 4);

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
