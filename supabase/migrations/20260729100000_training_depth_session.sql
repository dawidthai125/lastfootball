-- LFE-TRAINING-02: atomic team training session (status + skill + last_training_on).
-- Pure growth rules live in TS (applyTrainingSessionEffects); this RPC only applies a diff.

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

  select *
  into v_club
  from public.clubs
  where id = p_club_id
  for update;

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

    update public.players
    set status = v_status,
        skill = v_skill
    where id = v_player_id
      and club_id = p_club_id
      and departed_at is null;

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'Nie udało się zaktualizować zawodnika.');
    end if;

    v_changed := v_changed + 1;
  end loop;

  update public.clubs
  set last_training_on = p_training_on
  where id = p_club_id;

  return jsonb_build_object(
    'ok', true,
    'skipped', false,
    'changed_count', v_changed
  );
end;
$$;

revoke all on function public.complete_training_session(uuid, date, jsonb) from public;
grant execute on function public.complete_training_session(uuid, date, jsonb) to authenticated;
