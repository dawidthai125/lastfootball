-- LFE-TRANSFERS-06: Live H2H Instant Buy — atomic settlement (no listing table).
-- Source of supply: players.transfer_listed_at IS NOT NULL.

create index if not exists players_transfer_listed_idx
  on public.players (transfer_listed_at)
  where transfer_listed_at is not null and departed_at is null;

-- Authenticated users may read listed (active) players for the live market.
drop policy if exists "players_select_transfer_listed" on public.players;
create policy "players_select_transfer_listed"
  on public.players
  for select
  to authenticated
  using (
    transfer_listed_at is not null
    and departed_at is null
  );

-- Live market listings (no cash exposed) — security definer read.
create or replace function public.list_live_transfer_listings(p_exclude_club_id uuid)
returns table (
  player_id text,
  player_name text,
  pos text,
  role text,
  age integer,
  skill integer,
  shirt_number integer,
  seller_club_id uuid,
  seller_club_name text,
  seller_short_name text,
  seller_window_open boolean
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.name,
    p.pos,
    p.role,
    p.age,
    p.skill,
    p.shirt_number,
    c.id,
    c.name,
    c.short_name,
    c.transfer_window_open
  from public.players p
  join public.clubs c on c.id = p.club_id
  where p.transfer_listed_at is not null
    and p.departed_at is null
    and p.club_id is distinct from p_exclude_club_id
  order by p.id;
$$;

revoke all on function public.list_live_transfer_listings(uuid) from public;
grant execute on function public.list_live_transfer_listings(uuid) to authenticated;

-- Atomic Live H2H transfer @ ask snapshot (Instant 100%).
-- Updates: club_id (same player id), both cash_balance, transfer_deals×2,
-- finance_movements×2, transfer_listed_at = null. No DEPARTED.
create or replace function public.complete_live_h2h_transfer(
  p_buyer_club_id uuid,
  p_seller_club_id uuid,
  p_player_id text,
  p_ask_snapshot integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_buyer record;
  v_seller record;
  v_player record;
  v_ask integer;
  v_raw numeric;
  v_buyer_count integer;
  v_seller_count integer;
  v_seller_gk integer;
  v_is_gk boolean;
  v_shirt integer;
  v_now timestamptz := now();
  v_buy_key text := 'live-buy:' || p_player_id;
  v_sell_key text := 'live-sell:' || p_player_id;
  v_existing_buy public.transfer_deals%rowtype;
  v_rows integer;
  i integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_buyer_club_id is null or p_seller_club_id is null or p_player_id is null then
    return jsonb_build_object('ok', false, 'error', 'Brak danych transferu.');
  end if;

  if p_buyer_club_id = p_seller_club_id then
    return jsonb_build_object('ok', false, 'error', 'Nie możesz kupić własnego zawodnika.');
  end if;

  if p_ask_snapshot is null or p_ask_snapshot <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa kwota.');
  end if;

  select * into v_buyer from public.clubs where id = p_buyer_club_id;
  if not found or v_buyer.owner_id is distinct from v_uid then
    return jsonb_build_object('ok', false, 'error', 'Brak uprawnień kupującego.');
  end if;

  select * into v_seller from public.clubs where id = p_seller_club_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu sprzedawcy.');
  end if;

  -- Idempotency: buyer already settled this live buy.
  select * into v_existing_buy
  from public.transfer_deals
  where club_id = p_buyer_club_id and idempotency_key = v_buy_key;

  if found then
    return jsonb_build_object(
      'ok', true,
      'player_id', v_existing_buy.player_id,
      'amount', v_existing_buy.amount
    );
  end if;

  if not v_buyer.transfer_window_open then
    return jsonb_build_object('ok', false, 'error', 'Okno transferowe kupującego jest zamknięte.');
  end if;

  if not v_seller.transfer_window_open then
    return jsonb_build_object('ok', false, 'error', 'Okno transferowe sprzedawcy jest zamknięte.');
  end if;

  select * into v_player
  from public.players
  where id = p_player_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono zawodnika.');
  end if;

  -- Re-verify owner still equals seller (AC).
  if v_player.club_id is distinct from p_seller_club_id then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie należy już do sprzedawcy.');
  end if;

  if v_player.departed_at is not null or v_player.status = 'DEPARTED' then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik niedostępny.');
  end if;

  if v_player.transfer_listed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście transferowej.');
  end if;

  -- Single fee snapshot must match deriveTransferFee(skill, age) (ECONOMY_THIN).
  v_raw := v_player.skill * 2000 + greatest(0, 30 - v_player.age) * 1500;
  v_ask := greatest(25000, (round(v_raw / 1000.0) * 1000)::integer);

  if v_ask is distinct from p_ask_snapshot then
    return jsonb_build_object('ok', false, 'error', 'Ask nieaktualny — odśwież Transfery.');
  end if;

  select count(*)::integer into v_buyer_count
  from public.players
  where club_id = p_buyer_club_id and departed_at is null;

  if v_buyer_count >= 22 then
    return jsonb_build_object('ok', false, 'error', 'Kadra kupującego jest pełna (max 22).');
  end if;

  select count(*)::integer into v_seller_count
  from public.players
  where club_id = p_seller_club_id and departed_at is null;

  if v_seller_count <= 18 then
    return jsonb_build_object('ok', false, 'error', 'Sprzedawca nie może zejść poniżej 18 zawodników.');
  end if;

  v_is_gk := (v_player.pos = 'BR' or v_player.role = 'GK');
  if v_is_gk then
    select count(*)::integer into v_seller_gk
    from public.players
    where club_id = p_seller_club_id
      and departed_at is null
      and (pos = 'BR' or role = 'GK');
    if v_seller_gk <= 1 then
      return jsonb_build_object('ok', false, 'error', 'Sprzedawca nie może sprzedać ostatniego bramkarza.');
    end if;
  end if;

  if v_buyer.cash_balance < p_ask_snapshot then
    return jsonb_build_object('ok', false, 'error', 'Za mało środków w kasie kupującego.');
  end if;

  -- Free shirt on buyer club (unique club_id + shirt_number).
  v_shirt := v_player.shirt_number;
  if exists (
    select 1
    from public.players
    where club_id = p_buyer_club_id
      and shirt_number = v_shirt
      and id is distinct from p_player_id
  ) then
    v_shirt := null;
    for i in 1..99 loop
      if not exists (
        select 1 from public.players
        where club_id = p_buyer_club_id and shirt_number = i
      ) then
        v_shirt := i;
        exit;
      end if;
    end loop;
    if v_shirt is null then
      return jsonb_build_object('ok', false, 'error', 'Brak wolnego numeru koszulki.');
    end if;
  end if;

  -- Move player (id unchanged); clear listing; not DEPARTED.
  update public.players
  set
    club_id = p_buyer_club_id,
    shirt_number = v_shirt,
    starter = false,
    captain = false,
    transfer_listed_at = null
  where id = p_player_id
    and club_id = p_seller_club_id
    and transfer_listed_at is not null
    and departed_at is null;

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    return jsonb_build_object('ok', false, 'error', 'Nie udało się przenieść zawodnika.');
  end if;

  update public.clubs
  set cash_balance = cash_balance - p_ask_snapshot
  where id = p_buyer_club_id;

  update public.clubs
  set cash_balance = cash_balance + p_ask_snapshot
  where id = p_seller_club_id;

  insert into public.finance_movements (club_id, category, label, amount, fixture_id)
  values
    (p_buyer_club_id, 'transfer_buy', 'Transfer Live: ' || v_player.name, -p_ask_snapshot, null),
    (p_seller_club_id, 'transfer_sell', 'Sprzedaż Live: ' || v_player.name, p_ask_snapshot, null);

  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values
    (p_buyer_club_id, 'buy', p_player_id, null, p_ask_snapshot, v_buy_key, v_now),
    (p_seller_club_id, 'sell', p_player_id, null, p_ask_snapshot, v_sell_key, v_now);

  return jsonb_build_object(
    'ok', true,
    'player_id', p_player_id,
    'amount', p_ask_snapshot
  );
exception
  when unique_violation then
    -- Concurrent settle: treat as idempotent if buy deal exists.
    select * into v_existing_buy
    from public.transfer_deals
    where club_id = p_buyer_club_id and idempotency_key = v_buy_key;
    if found then
      return jsonb_build_object(
        'ok', true,
        'player_id', v_existing_buy.player_id,
        'amount', v_existing_buy.amount
      );
    end if;
    return jsonb_build_object('ok', false, 'error', 'Konflikt transferu — odśwież.');
end;
$$;

revoke all on function public.complete_live_h2h_transfer(uuid, uuid, text, integer) from public;
grant execute on function public.complete_live_h2h_transfer(uuid, uuid, text, integer) to authenticated;

comment on function public.complete_live_h2h_transfer is
  'LFE-TRANSFERS-06 atomic Live H2H Instant @ ask; players.id unchanged.';
