-- Transfers between managers (D156): a player can come back to a club he left, the set-piece
-- taker can move, a loaned player cannot. Numbers of players who left are free again.
CREATE OR REPLACE FUNCTION public.complete_live_h2h_transfer(p_buyer_club_id uuid, p_seller_club_id uuid, p_player_id text, p_agreed_amount integer, p_accept_offer_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- One deal, one key: a player may come back to a club, so the player alone is not enough.
  v_deal uuid := gen_random_uuid();
  v_buy_key text := 'live-buy:' || p_player_id || ':' || v_deal;
  v_sell_key text := 'live-sell:' || p_player_id || ':' || v_deal;
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

  -- A repeated click on a deal that just went through.
  select t.* into v_existing_buy
  from public.transfer_deals t
  join public.players p on p.id = t.player_id and p.club_id = t.club_id
  where t.club_id = p_buyer_club_id and t.player_id = p_player_id and t.kind = 'buy'
    and t.completed_at > now() - interval '10 minutes'
    and v_uid in (v_buyer.owner_id, v_seller.owner_id)
  limit 1;

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

  if v_player.on_loan or v_player.loaned_in then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik jest na wypożyczeniu.');
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
  where club_id = p_buyer_club_id and departed_at is null and not academy_track;

  if v_buyer_count >= 22 then
    return jsonb_build_object('ok', false, 'error', 'Kadra kupującego jest pełna (max 22).');
  end if;

  select count(*)::integer into v_seller_count
  from public.players
  where club_id = p_seller_club_id and departed_at is null and not academy_track;

  if v_seller_count <= 18 then
    return jsonb_build_object('ok', false, 'error', 'Sprzedawca nie może zejść poniżej 18 zawodników.');
  end if;

  v_is_gk := (v_player.pos = 'BR' or v_player.role = 'GK');
  if v_is_gk then
    select count(*)::integer into v_seller_gk
    from public.players
    where club_id = p_seller_club_id
      and departed_at is null
      and not academy_track and (pos = 'BR' or role = 'GK');
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
      and shirt_number = v_shirt and departed_at is null
      and id is distinct from p_player_id
  ) then
    v_shirt := null;
    for i in 1..99 loop
      if not exists (
        select 1 from public.players
        where club_id = p_buyer_club_id and shirt_number = i and departed_at is null
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
    set_piece = false,
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
    return jsonb_build_object('ok', false, 'error', 'Konflikt transferu — odśwież.');
end;
$function$;

CREATE OR REPLACE FUNCTION public.settle_auction(p_auction uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  v_auction public.transfer_auctions%rowtype;
  v_player public.players%rowtype;
  v_bid record;
  v_winner uuid;
  v_amount integer;
  v_shirt integer;
begin
  -- The same order as a bid: the player first, then the auction, then the clubs.
  select p.* into v_player
  from public.players p
  join public.transfer_auctions a on a.player_id = p.id
  where a.id = p_auction
  for update of p;

  select * into v_auction
  from public.transfer_auctions where id = p_auction and status = 'open' for update;
  if not found or v_auction.ends_at > now() then
    return 'open';
  end if;

  if v_player.id is not null
    and v_player.club_id = v_auction.seller_club_id
    and v_player.departed_at is null and v_player.transfer_listed_at is not null
    and not v_player.on_loan and not v_player.loaned_in
  then
    perform 1 from public.clubs
    where id = v_auction.seller_club_id
      or id in (select b.club_id from public.transfer_auction_bids b where b.auction_id = p_auction)
    order by id
    for update;

    if (
      select count(*) from public.players
      where club_id = v_auction.seller_club_id and departed_at is null and not academy_track
    ) > 18
      and not (
        (v_player.pos = 'BR' or v_player.role = 'GK')
        and (
          select count(*) from public.players
          where club_id = v_auction.seller_club_id and departed_at is null and not academy_track
            and (pos = 'BR' or role = 'GK')
        ) <= 1
      )
    then
      for v_bid in
        select b.club_id, max(b.amount) as amount
        from public.transfer_auction_bids b
        where b.auction_id = p_auction and b.club_id <> v_auction.seller_club_id
        group by b.club_id
        order by max(b.amount) desc, b.club_id
      loop
        if exists (
            select 1 from public.clubs
            where id = v_bid.club_id and cash_balance >= v_bid.amount
          )
          and (
            select count(*) from public.players
            where club_id = v_bid.club_id and departed_at is null and not academy_track
          ) < 22
        then
          v_winner := v_bid.club_id;
          v_amount := v_bid.amount;
          exit;
        end if;
      end loop;
    end if;
  end if;

  if v_winner is not null then
    v_shirt := v_player.shirt_number;
    if exists (
      select 1 from public.players where club_id = v_winner and shirt_number = v_shirt and departed_at is null
    ) then
      select n into v_shirt
      from generate_series(1, 99) n
      where not exists (
        select 1 from public.players where club_id = v_winner and shirt_number = n and departed_at is null
      )
      order by n
      limit 1;
    end if;
  end if;

  if v_winner is null or v_shirt is null then
    update public.transfer_auctions
    set status = 'withdrawn', settled_at = now() where id = p_auction;
    return 'withdrawn';
  end if;

  perform set_config('lf.auction', 'on', true);
  update public.players
  set club_id = v_winner, shirt_number = v_shirt, starter = false, captain = false,
      set_piece = false, transfer_listed_at = null
  where id = v_player.id;
  perform set_config('lf.auction', '', true);

  update public.clubs set cash_balance = cash_balance - v_amount where id = v_winner;
  update public.clubs set cash_balance = cash_balance + v_amount
  where id = v_auction.seller_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values
    (v_winner, 'transfer_buy', 'Licytacja: ' || v_player.name, -v_amount),
    (v_auction.seller_club_id, 'transfer_sell', 'Licytacja: ' || v_player.name, v_amount);
  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values
    (v_winner, 'buy', v_player.id, null, v_amount, 'auction-buy:' || p_auction, now()),
    (v_auction.seller_club_id, 'sell', v_player.id, null, v_amount, 'auction-sell:' || p_auction,
      now());
  update public.transfer_auctions
  set status = 'settled', winner_club_id = v_winner, settled_amount = v_amount, settled_at = now()
  where id = p_auction;
  perform public.supersede_pending_transfer_offers(v_player.id);
  return 'settled';
end;
$function$;

-- A loaned player is not for sale.
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
    p.id, p.name, p.pos, p.role, p.age, p.skill, p.shirt_number,
    c.id, c.name, c.short_name, c.transfer_window_open
  from public.players p
  join public.clubs c on c.id = p.club_id
  where p.transfer_listed_at is not null
    and p.departed_at is null
    and not p.on_loan and not p.loaned_in
    and not p.academy_track
    and p.club_id is distinct from p_exclude_club_id
  order by p.id;
$$;

-- Helpers without a fixed search path (database linter).
alter function public.lf_hash_player_id(text) set search_path = public, pg_temp;
alter function public.lf_seed_potential_ceiling(text, integer) set search_path = public, pg_temp;
alter function public.lf_resolve_player_potential(integer, text, integer)
  set search_path = public, pg_temp;
alter function public.derive_transfer_fee_thin(integer, integer) set search_path = public, pg_temp;
alter function public.is_allowed_transfer_amount_thin(integer, integer)
  set search_path = public, pg_temp;
alter function public.players_fill_truth() set search_path = public, pg_temp;
alter function public.personality_from_id(text) set search_path = public, pg_temp;

-- The API never needs these.
do $do$
declare
  t text;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('revoke truncate, references, trigger on public.%I from anon, authenticated', t);
    execute format('revoke insert, update, delete on public.%I from anon', t);
  end loop;
end;
$do$;
revoke insert, update, delete on
  public.human_league, public.human_league_seats, public.human_broadcasts,
  public.transfer_auctions, public.transfer_auction_bids, public.scout_reports,
  public.match_development_log, public.infra_meta
from authenticated;

-- A locked broadcast holds the squads of both clubs. Players read only what the pages show.
revoke select on public.human_broadcasts from anon, authenticated;
grant select (
  id, season, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed,
  kickoff_on, home_score, away_score, locked_at
) on public.human_broadcasts to authenticated;

create index if not exists transfer_auction_bids_auction_idx
  on public.transfer_auction_bids (auction_id);
create index if not exists transfer_auction_bids_club_idx
  on public.transfer_auction_bids (club_id);
create index if not exists transfer_auctions_seller_idx
  on public.transfer_auctions (seller_club_id);
create index if not exists transfer_auctions_winner_idx
  on public.transfer_auctions (winner_club_id);

alter policy "manager_email_status_select_own" on public.manager_email_status
  using ((select auth.uid()) = user_id);
alter policy "scout_reports_select_own" on public.scout_reports
  using (club_id in (select c.id from public.clubs c where c.owner_id = (select auth.uid())));

notify pgrst, 'reload schema';
