-- LFE-TRANSFERS-09: TD-01 fee/allow-list helpers + TD-02-ready RPC bodies.
-- No schema changes (no tables/columns). CREATE OR REPLACE functions only.
--
-- TRANSFER_FEE_SSOT: SKILL_MULT=2000 AGE_BONUS=1500 AGE_REF=30 FLOOR=25000 ROUND=1000
-- NEGOTIATION_THIN_SSOT: LOW=90 NORMAL=100 HIGH=110 COUNTER=95
-- Parity gate (Vitest) asserts these markers match ECONOMY_THIN / NEGOTIATION_THIN.

create or replace function public.derive_transfer_fee_thin(p_skill integer, p_age integer)
returns integer
language sql
immutable
parallel safe
as $$
  -- TRANSFER_FEE_SSOT body (must match ECONOMY_THIN.TRANSFER_FEE)
  select greatest(
    25000,
    (round((p_skill * 2000 + greatest(0, 30 - p_age) * 1500) / 1000.0) * 1000)::integer
  );
$$;

create or replace function public.is_allowed_transfer_amount_thin(p_ask integer, p_amount integer)
returns boolean
language sql
immutable
parallel safe
as $$
  -- NEGOTIATION_THIN_SSOT body (must match NEGOTIATION_THIN presets)
  select p_amount in (
    round((p_ask * 90)::numeric / 100)::integer,
    round((p_ask * 100)::numeric / 100)::integer,
    round((p_ask * 110)::numeric / 100)::integer,
    round((p_ask * 95)::numeric / 100)::integer
  );
$$;

revoke all on function public.derive_transfer_fee_thin(integer, integer) from public;
revoke all on function public.is_allowed_transfer_amount_thin(integer, integer) from public;

comment on function public.derive_transfer_fee_thin(integer, integer) is
  'LFE-TRANSFERS-09: sole SQL transfer fee (parity with ECONOMY_THIN.TRANSFER_FEE).';
comment on function public.is_allowed_transfer_amount_thin(integer, integer) is
  'LFE-TRANSFERS-09: sole SQL allow-list (parity with NEGOTIATION_THIN).';

-- Counter RPC — fee/allow-list via helpers (no inline formula).
create or replace function public.counter_live_transfer_offer(
  p_offer_id uuid,
  p_current_amount integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_offer public.transfer_offers%rowtype;
  v_player record;
  v_ask integer;
  v_rows integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_offer_id is null or p_current_amount is null or p_current_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa kontrpropozycja.');
  end if;

  select * into v_offer
  from public.transfer_offers
  where id = p_offer_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono oferty.');
  end if;

  if not exists (
    select 1 from public.clubs c where c.id = v_offer.seller_club_id and c.owner_id = v_uid
  ) then
    return jsonb_build_object('ok', false, 'error', 'Brak uprawnień sprzedawcy.');
  end if;

  -- Idempotent: already countered at same amount.
  if v_offer.status = 'pending'
     and v_offer.phase = 'countered'
     and v_offer.current_amount is not distinct from p_current_amount then
    return jsonb_build_object(
      'ok', true,
      'offer_id', v_offer.id,
      'phase', 'countered',
      'current_amount', v_offer.current_amount
    );
  end if;

  if v_offer.status is distinct from 'pending' then
    return jsonb_build_object('ok', false, 'error', 'Oferta nie jest aktywna.');
  end if;

  if v_offer.phase is distinct from 'opening' then
    return jsonb_build_object('ok', false, 'error', 'Kontrpropozycja już złożona.');
  end if;

  select * into v_player
  from public.players
  where id = v_offer.player_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono zawodnika.');
  end if;

  if v_player.club_id is distinct from v_offer.seller_club_id then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie należy już do sprzedawcy.');
  end if;

  if v_player.departed_at is not null or v_player.status = 'DEPARTED' then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik niedostępny.');
  end if;

  if v_player.transfer_listed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście transferowej.');
  end if;

  v_ask := public.derive_transfer_fee_thin(v_player.skill, v_player.age);
  if not public.is_allowed_transfer_amount_thin(v_ask, p_current_amount) then
    return jsonb_build_object('ok', false, 'error', 'Kwota poza pasmem negocjacji.');
  end if;

  update public.transfer_offers
  set
    current_amount = p_current_amount,
    phase = 'countered',
    last_actor = 'seller'
  where id = p_offer_id
    and status = 'pending'
    and phase = 'opening';

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    return jsonb_build_object('ok', false, 'error', 'Nie udało się złożyć kontrpropozycji.');
  end if;

  return jsonb_build_object(
    'ok', true,
    'offer_id', p_offer_id,
    'phase', 'countered',
    'current_amount', p_current_amount
  );
end;
$$;

revoke all on function public.counter_live_transfer_offer(uuid, integer) from public;
grant execute on function public.counter_live_transfer_offer(uuid, integer) to authenticated;

-- Settle RPC — fee/allow-list via helpers; Args unchanged (D38).
create or replace function public.complete_live_h2h_transfer(
  p_buyer_club_id uuid,
  p_seller_club_id uuid,
  p_player_id text,
  p_agreed_amount integer,
  p_accept_offer_id uuid default null
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
  v_buyer_count integer;
  v_seller_count integer;
  v_seller_gk integer;
  v_is_gk boolean;
  v_shirt integer;
  v_now timestamptz := now();
  v_buy_key text := 'live-buy:' || p_player_id;
  v_sell_key text := 'live-sell:' || p_player_id;
  v_existing_buy public.transfer_deals%rowtype;
  v_offer public.transfer_offers%rowtype;
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

  if p_agreed_amount is null or p_agreed_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa kwota.');
  end if;

  select * into v_buyer from public.clubs where id = p_buyer_club_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu kupującego.');
  end if;

  select * into v_seller from public.clubs where id = p_seller_club_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu sprzedawcy.');
  end if;

  -- Instant: caller = buyer.
  -- Accept opening: caller = seller. Accept countered: caller = buyer.
  if p_accept_offer_id is null then
    if v_buyer.owner_id is distinct from v_uid then
      return jsonb_build_object('ok', false, 'error', 'Brak uprawnień kupującego.');
    end if;
  end if;

  select * into v_existing_buy
  from public.transfer_deals
  where club_id = p_buyer_club_id and idempotency_key = v_buy_key;

  if found then
    perform public.supersede_pending_transfer_offers(p_player_id);
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

  if p_accept_offer_id is not null then
    select * into v_offer
    from public.transfer_offers
    where id = p_accept_offer_id
    for update;

    if not found then
      return jsonb_build_object('ok', false, 'error', 'Nie znaleziono oferty.');
    end if;

    if v_offer.status is distinct from 'pending' then
      return jsonb_build_object('ok', false, 'error', 'Oferta nie jest aktywna.');
    end if;

    if v_offer.player_id is distinct from p_player_id
       or v_offer.seller_club_id is distinct from p_seller_club_id
       or v_offer.buyer_club_id is distinct from p_buyer_club_id then
      return jsonb_build_object('ok', false, 'error', 'Oferta nie pasuje do transferu.');
    end if;

    if v_offer.current_amount is distinct from p_agreed_amount then
      return jsonb_build_object('ok', false, 'error', 'Kwota oferty niezgodna.');
    end if;

    if v_offer.phase = 'opening' then
      if v_seller.owner_id is distinct from v_uid then
        return jsonb_build_object('ok', false, 'error', 'Tylko sprzedawca może zaakceptować ofertę.');
      end if;
    elsif v_offer.phase = 'countered' then
      if v_buyer.owner_id is distinct from v_uid then
        return jsonb_build_object('ok', false, 'error', 'Tylko kupujący może zaakceptować kontrpropozycję.');
      end if;
    else
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowa faza oferty.');
    end if;
  end if;

  select * into v_player
  from public.players
  where id = p_player_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono zawodnika.');
  end if;

  if v_player.club_id is distinct from p_seller_club_id then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie należy już do sprzedawcy.');
  end if;

  if v_player.departed_at is not null or v_player.status = 'DEPARTED' then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik niedostępny.');
  end if;

  if v_player.transfer_listed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście transferowej.');
  end if;

  v_ask := public.derive_transfer_fee_thin(v_player.skill, v_player.age);
  if not public.is_allowed_transfer_amount_thin(v_ask, p_agreed_amount) then
    return jsonb_build_object('ok', false, 'error', 'Kwota poza pasbem negocjacji.');
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

  if v_buyer.cash_balance < p_agreed_amount then
    return jsonb_build_object('ok', false, 'error', 'Za mało środków w kasie kupującego.');
  end if;

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
  set cash_balance = cash_balance - p_agreed_amount
  where id = p_buyer_club_id;

  update public.clubs
  set cash_balance = cash_balance + p_agreed_amount
  where id = p_seller_club_id;

  insert into public.finance_movements (club_id, category, label, amount, fixture_id)
  values
    (p_buyer_club_id, 'transfer_buy', 'Transfer Live: ' || v_player.name, -p_agreed_amount, null),
    (p_seller_club_id, 'transfer_sell', 'Sprzedaż Live: ' || v_player.name, p_agreed_amount, null);

  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values
    (p_buyer_club_id, 'buy', p_player_id, null, p_agreed_amount, v_buy_key, v_now),
    (p_seller_club_id, 'sell', p_player_id, null, p_agreed_amount, v_sell_key, v_now);

  if p_accept_offer_id is not null then
    update public.transfer_offers
    set status = 'accepted', resolved_at = v_now
    where id = p_accept_offer_id and status = 'pending';
  end if;

  perform public.supersede_pending_transfer_offers(p_player_id);

  return jsonb_build_object(
    'ok', true,
    'player_id', p_player_id,
    'amount', p_agreed_amount
  );
exception
  when unique_violation then
    select * into v_existing_buy
    from public.transfer_deals
    where club_id = p_buyer_club_id and idempotency_key = v_buy_key;
    if found then
      perform public.supersede_pending_transfer_offers(p_player_id);
      return jsonb_build_object(
        'ok', true,
        'player_id', v_existing_buy.player_id,
        'amount', v_existing_buy.amount
      );
    end if;
    return jsonb_build_object('ok', false, 'error', 'Konflikt transferu — odśwież.');
end;
$$;

revoke all on function public.complete_live_h2h_transfer(uuid, uuid, text, integer, uuid) from public;
grant execute on function public.complete_live_h2h_transfer(uuid, uuid, text, integer, uuid) to authenticated;

comment on function public.counter_live_transfer_offer(uuid, integer) is
  'Seller 1× counter; fee via derive_transfer_fee_thin; FOR UPDATE; mutates current_amount/phase/last_actor only.';
comment on function public.complete_live_h2h_transfer(uuid, uuid, text, integer, uuid) is
  'Live H2H settle; fee via derive_transfer_fee_thin; Accept auth by phase; supersede pending.';
