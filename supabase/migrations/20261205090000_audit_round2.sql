-- D159: whole-game audit, second round.

-- 1. A bought player ages at the end of his new club's season and may train there today.
create or replace function public.lf_stamp_player_move()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.club_id is distinct from old.club_id then
    new.origin := case when old.origin in ('academy', 'free') then old.origin else 'bought' end;
    new.joined_at := now();
    new.aged_for_season := null;
    new.last_individual_on := null;
  end if;
  return new;
end;
$$;

-- 2. The individual session of the day belongs to the club, also after the player is sold.
alter table public.clubs add column if not exists last_individual_on date;

create or replace function public.claim_individual_training(
  p_club_id uuid,
  p_player_id text,
  p_today date
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if exists (
    select 1 from public.clubs where id = p_club_id and last_individual_on = p_today
  ) or exists (
    select 1 from public.players where club_id = p_club_id and last_individual_on = p_today
  ) then
    return false;
  end if;
  update public.players set last_individual_on = p_today
  where id = p_player_id and club_id = p_club_id and departed_at is null and not academy_track;
  if not found then
    return false;
  end if;
  update public.clubs set last_individual_on = p_today where id = p_club_id;
  return true;
end;
$$;

-- The whole session in one step. p_seen: the player as he was read, a moved one is not written.
create or replace function public.train_individual(
  p_club_id uuid,
  p_player_id text,
  p_today date,
  p_group text,
  p_value integer,
  p_energy integer,
  p_status text,
  p_seen jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_seen is null or p_today is null or p_group is null or p_group not in
    ('attack', 'passing', 'defense', 'physical', 'goalkeeping')
  then
    raise exception 'individual training out of range';
  end if;
  perform 1 from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  if exists (
    select 1 from public.clubs where id = p_club_id and last_individual_on = p_today
  ) or exists (
    select 1 from public.players where club_id = p_club_id and last_individual_on = p_today
  ) then
    return 'taken';
  end if;
  update public.players p
  set attr_attack = case when p_group = 'attack' then p_value else p.attr_attack end,
      attr_passing = case when p_group = 'passing' then p_value else p.attr_passing end,
      attr_defense = case when p_group = 'defense' then p_value else p.attr_defense end,
      attr_physical = case when p_group = 'physical' then p_value else p.attr_physical end,
      attr_goalkeeping = case when p_group = 'goalkeeping' then p_value else p.attr_goalkeeping end,
      energy = p_energy,
      status = p_status,
      last_individual_on = p_today
  where p.id = p_player_id and p.club_id = p_club_id and p.departed_at is null
    and not p.academy_track and to_jsonb(p) @> p_seen;
  if not found then
    return 'moved';
  end if;
  update public.clubs set last_individual_on = p_today where id = p_club_id;
  return 'ok';
end;
$$;

-- 3. Tone and morale land together, and morale moves by a difference.
create or replace function public.save_press_tone(
  p_club_id uuid,
  p_fixture_id uuid,
  p_tone text,
  p_delta integer
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_last uuid;
begin
  if p_delta is null then
    raise exception 'press conference out of range';
  end if;
  perform 1 from public.clubs where id = p_club_id for update;
  -- Only the last match: older ones without a conference do not add up.
  select id into v_last
  from public.fixtures
  where club_id = p_club_id and status = 'played'
  order by played_at desc
  limit 1;
  if v_last is distinct from p_fixture_id then
    return 'none';
  end if;
  update public.fixtures set press_tone = p_tone
  where id = p_fixture_id and club_id = p_club_id and press_tone is null;
  if found and p_delta <> 0 then
    update public.players
    set morale = greatest(0, least(100, morale + p_delta))
    where club_id = p_club_id and departed_at is null;
  end if;
  return 'ok';
end;
$$;

do $mig$
declare
  d text;
  v_where text := '      and potential >= least(v_skill, potential);';
  v_seen text := '      and to_jsonb(players) @> coalesce(v_item -> ''seen'', ''{}''::jsonb)
      and potential >= least(v_skill, potential);';
begin
  -- 4. A failed training changes nobody, and neither training nor a match writes over a player
  --    who moved since he was read ("seen" in his row, absent in older callers).
  d := pg_get_functiondef('public.complete_training_session(uuid,date,jsonb)'::regprocedure);
  if position('''seen''' in d) = 0 then
    if position(v_where in d) = 0 or position(
      '      return jsonb_build_object(''ok'', false, ''error'', ''Nie udało się zaktualizować zawodnika.'');'
      in d) = 0
    then
      raise exception 'complete_training_session differs';
    end if;
    d := replace(d, v_where, v_seen);
    d := replace(d,
      '      return jsonb_build_object(''ok'', false, ''error'', ''Nie udało się zaktualizować zawodnika.'');',
      '      raise exception ''Nie udało się zaktualizować zawodnika.''
        using errcode = case when v_item ? ''seen'' then ''LFOLD'' else ''P0001'' end;');
    execute d;
  end if;

  d := pg_get_functiondef('public.apply_match_development(uuid,text,jsonb)'::regprocedure);
  if position('''seen''' in d) = 0 then
    if position(v_where in d) = 0
      or position('      raise exception ''Nie udało się zaktualizować zawodnika.'';' in d) = 0
    then
      raise exception 'apply_match_development differs';
    end if;
    d := replace(d, v_where, v_seen);
    d := replace(d, '      raise exception ''Nie udało się zaktualizować zawodnika.'';',
      '      raise exception ''Nie udało się zaktualizować zawodnika.''
        using errcode = case when v_item ? ''seen'' then ''LFOLD'' else ''P0001'' end;');
    execute d;
  end if;

  -- 5. One match a Warsaw day, also for two saves at once. League and cup share a day, a
  --    challenge and the human league have their own.
  d := pg_get_functiondef(
    'public.settle_fixture(uuid,uuid,integer,integer,integer,text,integer,integer,text,text,jsonb,text,text)'::regprocedure
  );
  if position('LFDAY' in d) = 0 then
    if position('    raise exception ''fixture is not open'';
  end if;
' in d) = 0 then
      raise exception 'settle_fixture differs';
    end if;
    d := replace(d, '    raise exception ''fixture is not open'';
  end if;
', '    raise exception ''fixture is not open'';
  end if;
  if exists (
    select 1 from public.fixtures f
    where f.club_id = p_club_id and f.status = ''played''
      and case when f.competition = ''cup'' then ''league'' else f.competition end
        = case when v_competition = ''cup'' then ''league'' else v_competition end
      and (f.played_at at time zone ''Europe/Warsaw'')::date
        = (now() at time zone ''Europe/Warsaw'')::date
  ) then
    raise exception ''match day taken'' using errcode = ''LFDAY'';
  end if;
');
    execute d;
  end if;

  -- 6. Offers show the new name of a renamed club.
  d := pg_get_functiondef('public.admin_rename_club(uuid,text,text)'::regprocedure);
  if position('transfer_offers' in d) = 0 then
    if position('  return true;' in d) = 0 then
      raise exception 'admin_rename_club differs';
    end if;
    d := replace(d, '  return true;',
      '  update public.transfer_offers
  set buyer_label = coalesce(nullif(p_short, ''''), p_name) where buyer_club_id = p_club_id;
  update public.transfer_offers
  set seller_label = coalesce(nullif(p_short, ''''), p_name) where seller_club_id = p_club_id;
  return true;');
    execute d;
  end if;
end;
$mig$;

-- 7. The squad limit is counted under the club lock, like a purchase.
create or replace function public.promote_academy_player(
  p_club_id uuid,
  p_player_id text,
  p_max_roster integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_name text;
begin
  perform 1 from public.clubs where id = p_club_id for update;
  if not found or p_max_roster is null then
    raise exception 'club not found';
  end if;
  if (
    select count(*) from public.players
    where club_id = p_club_id and departed_at is null and not academy_track
  ) >= p_max_roster then
    return jsonb_build_object('ok', false, 'reason', 'roster');
  end if;
  update public.players
  set academy_track = false, promoted_at = now(), origin = 'academy', joined_at = now(),
      starter = false, transfer_listed_at = null
  where id = p_player_id and club_id = p_club_id and academy_track and departed_at is null
  returning name into v_name;
  if not found then
    return jsonb_build_object('ok', false, 'reason', 'player');
  end if;
  return jsonb_build_object('ok', true, 'name', v_name);
end;
$$;

create or replace function public.take_incoming_loan(
  p_club_id uuid,
  p_player jsonb,
  p_max_roster integer,
  p_max_loans integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_open boolean;
  v_count integer;
  v_loans integer;
begin
  if p_max_roster is null or p_max_loans is null then
    raise exception 'loan out of range';
  end if;
  select transfer_window_open into v_open from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  select count(*), count(*) filter (where loaned_in) into v_count, v_loans
  from public.players
  where club_id = p_club_id and departed_at is null and not academy_track;
  if v_count >= p_max_roster then
    return jsonb_build_object('ok', false, 'reason', 'roster');
  end if;
  if v_loans >= p_max_loans then
    return jsonb_build_object('ok', false, 'reason', 'loans');
  end if;
  if not v_open or exists (
    select 1 from public.players
    where club_id = p_club_id and departed_at is null and loaned_in
      and name = p_player ->> 'name' and loan_partner_label = p_player ->> 'loan_partner_label'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'offer');
  end if;
  insert into public.players (
    id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status,
    nationality, origin, joined_at, version, wage, loaned_in, loan_partner_label, loan_until,
    on_loan
  ) values (
    p_player ->> 'id', p_club_id, p_player ->> 'name', (p_player ->> 'shirt_number')::integer,
    p_player ->> 'pos', p_player ->> 'role', false, false, (p_player ->> 'age')::integer,
    (p_player ->> 'skill')::integer, (p_player ->> 'potential')::integer, 'READY', 'POL',
    'loan', now(), 1, (p_player ->> 'wage')::integer, true, p_player ->> 'loan_partner_label',
    (p_player ->> 'loan_until')::date, false
  );
  return jsonb_build_object('ok', true);
end;
$$;

-- 8. A winner deleted outside the game does not keep his auctions from going.
alter table public.transfer_auctions
  drop constraint if exists transfer_auctions_winner_club_id_fkey;
alter table public.transfer_auctions
  add constraint transfer_auctions_winner_club_id_fkey
  foreign key (winner_club_id) references public.clubs (id) on delete set null;

-- 9. One captain, one taker, a shirt swap that lands whole. Row level security limits them to
--    the caller's club. The club lock makes two tabs wait for each other.
create or replace function public.set_club_captain(p_club_id uuid, p_player_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.clubs where id = p_club_id for update;
  update public.players set captain = false
  where club_id = p_club_id and captain and id <> p_player_id;
  update public.players set captain = true
  where id = p_player_id and club_id = p_club_id and departed_at is null;
  if not found then
    raise exception 'player not found';
  end if;
  return true;
end;
$$;

create or replace function public.set_club_set_piece(p_club_id uuid, p_player_id text)
returns boolean
language plpgsql
set search_path = ''
as $$
begin
  perform 1 from public.clubs where id = p_club_id for update;
  update public.players set set_piece = false
  where club_id = p_club_id and set_piece and id <> p_player_id;
  update public.players set set_piece = true
  where id = p_player_id and club_id = p_club_id and departed_at is null and pos <> 'BR';
  if not found then
    raise exception 'player not found';
  end if;
  return true;
end;
$$;

-- The steps of planShirtAssignment, in order.
create or replace function public.save_shirt_numbers(p_club_id uuid, p_updates jsonb)
returns boolean
language plpgsql
set search_path = ''
as $$
declare
  v_item jsonb;
begin
  perform 1 from public.clubs where id = p_club_id for update;
  for v_item in select value from jsonb_array_elements(p_updates)
  loop
    update public.players set shirt_number = (v_item ->> 'shirtNumber')::integer
    where id = v_item ->> 'id' and club_id = p_club_id and departed_at is null;
    if not found then
      raise exception 'player not found';
    end if;
  end loop;
  return true;
end;
$$;

revoke all on function
  public.train_individual(uuid, text, date, text, integer, integer, text, jsonb),
  public.save_press_tone(uuid, uuid, text, integer),
  public.promote_academy_player(uuid, text, integer),
  public.take_incoming_loan(uuid, jsonb, integer, integer)
from public, anon, authenticated;
grant execute on function
  public.train_individual(uuid, text, date, text, integer, integer, text, jsonb),
  public.save_press_tone(uuid, uuid, text, integer),
  public.promote_academy_player(uuid, text, integer),
  public.take_incoming_loan(uuid, jsonb, integer, integer)
to service_role;
revoke all on function
  public.set_club_captain(uuid, text),
  public.set_club_set_piece(uuid, text),
  public.save_shirt_numbers(uuid, jsonb)
from public, anon;
grant execute on function
  public.set_club_captain(uuid, text),
  public.set_club_set_piece(uuid, text),
  public.save_shirt_numbers(uuid, jsonb)
to authenticated, service_role;

notify pgrst, 'reload schema';
