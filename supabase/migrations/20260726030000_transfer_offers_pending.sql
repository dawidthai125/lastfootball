-- LFE-TRANSFERS-07: Live H2H Pending Offers (transfer_offers only).
-- Instant Buy (06) stays; Accept/Instant/Unlist supersede pending in same TX.

create table if not exists public.transfer_offers (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  seller_club_id uuid not null references public.clubs (id) on delete cascade,
  buyer_club_id uuid not null references public.clubs (id) on delete cascade,
  amount integer not null check (amount > 0),
  ask_at_create integer not null check (ask_at_create > 0),
  status text not null default 'pending',
  idempotency_key text not null,
  created_at timestamptz not null default now(),
  resolved_at timestamptz null,
  constraint transfer_offers_status_check check (
    status in ('pending', 'accepted', 'rejected', 'withdrawn', 'superseded')
  ),
  constraint transfer_offers_parties_distinct check (seller_club_id <> buyer_club_id),
  constraint transfer_offers_idempotency_unique unique (idempotency_key)
);

create unique index if not exists transfer_offers_one_pending_buyer_player
  on public.transfer_offers (buyer_club_id, player_id)
  where status = 'pending';

create index if not exists transfer_offers_seller_pending_idx
  on public.transfer_offers (seller_club_id, status)
  where status = 'pending';

create index if not exists transfer_offers_player_pending_idx
  on public.transfer_offers (player_id, status)
  where status = 'pending';

alter table public.transfer_offers enable row level security;

drop policy if exists "transfer_offers_select_party" on public.transfer_offers;
create policy "transfer_offers_select_party"
  on public.transfer_offers
  for select
  to authenticated
  using (
    buyer_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
    or seller_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  );

drop policy if exists "transfer_offers_insert_buyer" on public.transfer_offers;
create policy "transfer_offers_insert_buyer"
  on public.transfer_offers
  for insert
  to authenticated
  with check (
    status = 'pending'
    and buyer_club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid()))
  );

-- Updates go through security definer RPCs (reject/withdraw/accept/supersede).

-- Supersede all pending offers for a player (same TX as Accept / Instant / Unlist).
create or replace function public.supersede_pending_transfer_offers(p_player_id text)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count integer;
begin
  update public.transfer_offers
  set status = 'superseded', resolved_at = now()
  where player_id = p_player_id
    and status = 'pending';
  get diagnostics v_count = row_count;
  return v_count;
end;
$$;

revoke all on function public.supersede_pending_transfer_offers(text) from public;
grant execute on function public.supersede_pending_transfer_offers(text) to authenticated;

-- Reject one pending offer (seller only).
create or replace function public.reject_transfer_offer(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_offer public.transfer_offers%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  select * into v_offer from public.transfer_offers where id = p_offer_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono oferty.');
  end if;

  if not exists (
    select 1 from public.clubs c where c.id = v_offer.seller_club_id and c.owner_id = v_uid
  ) then
    return jsonb_build_object('ok', false, 'error', 'Brak uprawnień sprzedawcy.');
  end if;

  if v_offer.status = 'rejected' then
    return jsonb_build_object('ok', true, 'offer_id', v_offer.id, 'status', 'rejected');
  end if;

  if v_offer.status is distinct from 'pending' then
    return jsonb_build_object('ok', false, 'error', 'Oferta nie jest aktywna.');
  end if;

  update public.transfer_offers
  set status = 'rejected', resolved_at = now()
  where id = p_offer_id and status = 'pending';

  return jsonb_build_object('ok', true, 'offer_id', p_offer_id, 'status', 'rejected');
end;
$$;

revoke all on function public.reject_transfer_offer(uuid) from public;
grant execute on function public.reject_transfer_offer(uuid) to authenticated;

-- Withdraw one pending offer (buyer only).
create or replace function public.withdraw_transfer_offer(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_offer public.transfer_offers%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  select * into v_offer from public.transfer_offers where id = p_offer_id for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono oferty.');
  end if;

  if not exists (
    select 1 from public.clubs c where c.id = v_offer.buyer_club_id and c.owner_id = v_uid
  ) then
    return jsonb_build_object('ok', false, 'error', 'Brak uprawnień kupującego.');
  end if;

  if v_offer.status = 'withdrawn' then
    return jsonb_build_object('ok', true, 'offer_id', v_offer.id, 'status', 'withdrawn');
  end if;

  if v_offer.status is distinct from 'pending' then
    return jsonb_build_object('ok', false, 'error', 'Oferta nie jest aktywna.');
  end if;

  update public.transfer_offers
  set status = 'withdrawn', resolved_at = now()
  where id = p_offer_id and status = 'pending';

  return jsonb_build_object('ok', true, 'offer_id', p_offer_id, 'status', 'withdrawn');
end;
$$;

revoke all on function public.withdraw_transfer_offer(uuid) from public;
grant execute on function public.withdraw_transfer_offer(uuid) to authenticated;

-- Unlist + supersede pending (same TX).
create or replace function public.unlist_transfer_player(
  p_club_id uuid,
  p_player_id text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_player record;
  v_rows integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if not exists (
    select 1 from public.clubs c where c.id = p_club_id and c.owner_id = v_uid
  ) then
    return jsonb_build_object('ok', false, 'error', 'Brak uprawnień.');
  end if;

  select * into v_player
  from public.players
  where id = p_player_id
  for update;

  if not found or v_player.club_id is distinct from p_club_id then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono zawodnika.');
  end if;

  if v_player.transfer_listed_at is null then
    perform public.supersede_pending_transfer_offers(p_player_id);
    return jsonb_build_object('ok', true);
  end if;

  update public.players
  set transfer_listed_at = null
  where id = p_player_id
    and club_id = p_club_id
    and transfer_listed_at is not null;

  get diagnostics v_rows = row_count;
  perform public.supersede_pending_transfer_offers(p_player_id);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.unlist_transfer_player(uuid, text) from public;
grant execute on function public.unlist_transfer_player(uuid, text) to authenticated;

-- Drop old Instant-only signature before creating allow-list + offer Accept overload.
drop function if exists public.complete_live_h2h_transfer(uuid, uuid, text, integer);

-- Live H2H settle: agreed amount (NEGOTIATION_THIN allow-list) + optional accept offer + supersede.
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
  v_raw numeric;
  v_low integer;
  v_normal integer;
  v_high integer;
  v_counter integer;
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

  -- Instant: caller = buyer. Accept offer: caller = seller.
  if p_accept_offer_id is null then
    if v_buyer.owner_id is distinct from v_uid then
      return jsonb_build_object('ok', false, 'error', 'Brak uprawnień kupującego.');
    end if;
  else
    if v_seller.owner_id is distinct from v_uid then
      return jsonb_build_object('ok', false, 'error', 'Tylko sprzedawca może zaakceptować ofertę.');
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

    if v_offer.amount is distinct from p_agreed_amount then
      return jsonb_build_object('ok', false, 'error', 'Kwota oferty niezgodna.');
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

  -- Current ask — only for NEGOTIATION_THIN allow-list validation (AC).
  v_raw := v_player.skill * 2000 + greatest(0, 30 - v_player.age) * 1500;
  v_ask := greatest(25000, (round(v_raw / 1000.0) * 1000)::integer);
  v_low := round((v_ask * 90)::numeric / 100)::integer;
  v_normal := round((v_ask * 100)::numeric / 100)::integer;
  v_high := round((v_ask * 110)::numeric / 100)::integer;
  v_counter := round((v_ask * 95)::numeric / 100)::integer;

  if p_agreed_amount not in (v_low, v_normal, v_high, v_counter) then
    return jsonb_build_object('ok', false, 'error', 'Kwota poza pasmem negocjacji.');
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

  -- Funds fail: leave offer pending (no status change before this point for accept).
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

  -- Close all remaining pending for this player (Accept / Instant).
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

comment on table public.transfer_offers is
  'LFE-TRANSFERS-07 H2H pending offers; amount/ask_at_create immutable after create.';
comment on function public.complete_live_h2h_transfer(uuid, uuid, text, integer, uuid) is
  'Live H2H settle @ agreed (Thin allow-list); optional accept offer; supersede pending.';
