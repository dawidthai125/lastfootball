-- The scout reads the stored potential (D155). The estimate from the current age was wrong for
-- a player who grew older since he was created. The club is locked, so one report is paid once.
create or replace function public.buy_scout_report(p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_club public.clubs%rowtype;
  v_player public.players%rowtype;
  v_existing public.scout_reports%rowtype;
  v_pot integer;
  v_band text;
  v_label text;
  v_fee integer := 2000;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sesja wygasła.');
  end if;
  if p_player_id is null or length(p_player_id) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Brak zawodnika.');
  end if;

  select * into v_club from public.clubs where owner_id = v_uid for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  select * into v_existing
  from public.scout_reports
  where club_id = v_club.id and player_id = p_player_id;

  if found then
    v_label := case v_existing.band
      when 'elite' then 'Bardzo wysoki'
      when 'high' then 'Wysoki'
      when 'medium' then 'Średni'
      else 'Niski'
    end;
    return jsonb_build_object(
      'ok', true,
      'already', true,
      'band', v_existing.band,
      'label', v_label
    );
  end if;

  select * into v_player from public.players where id = p_player_id;
  if not found or v_player.departed_at is not null then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono zawodnika.');
  end if;

  v_pot := v_player.potential;
  if v_pot >= 88 then
    v_band := 'elite';
    v_label := 'Bardzo wysoki';
  elsif v_pot >= 78 then
    v_band := 'high';
    v_label := 'Wysoki';
  elsif v_pot >= 68 then
    v_band := 'medium';
    v_label := 'Średni';
  else
    v_band := 'low';
    v_label := 'Niski';
  end if;

  if v_club.cash_balance < v_fee then
    return jsonb_build_object('ok', false, 'error', 'Za mało środków na raport.');
  end if;

  update public.clubs
  set cash_balance = cash_balance - v_fee
  where id = v_club.id;

  insert into public.finance_movements (club_id, category, label, amount, fixture_id)
  values (v_club.id, 'scout_report', 'Raport skauta', -v_fee, null);

  insert into public.scout_reports (club_id, player_id, band)
  values (v_club.id, p_player_id, v_band);

  return jsonb_build_object('ok', true, 'already', false, 'band', v_band, 'label', v_label);
end;
$$;

revoke all on function public.buy_scout_report(text) from public, anon;
grant execute on function public.buy_scout_report(text) to authenticated;
