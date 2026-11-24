-- An auction ends by itself (D153): 24 hours after the first bid, at least 15 minutes after the
-- last one. The scheduler settles it. The seller neither accepts nor takes it back.
alter table public.transfer_auctions
  add column if not exists ends_at timestamptz not null default (now() + interval '24 hours');

create or replace function public.place_auction_bid(p_player_id text, p_amount integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_buyer public.clubs%rowtype;
  v_player public.players%rowtype;
  v_seller public.clubs%rowtype;
  v_auction public.transfer_auctions%rowtype;
  v_high integer;
  v_leader uuid;
  v_ends timestamptz;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sesja wygasła.');
  end if;
  if p_amount is null or p_amount <= 0 then
    return jsonb_build_object('ok', false, 'error', 'Zła kwota.');
  end if;

  select * into v_buyer from public.clubs where owner_id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  select * into v_player from public.players where id = p_player_id for update;
  if not found or v_player.departed_at is not null or v_player.transfer_listed_at is null
    or v_player.on_loan or v_player.loaned_in then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście.');
  end if;
  if v_player.club_id = v_buyer.id then
    return jsonb_build_object('ok', false, 'error', 'Nie licytujesz własnego zawodnika.');
  end if;

  select * into v_seller from public.clubs where id = v_player.club_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Brak klubu sprzedawcy.');
  end if;

  select * into v_auction
  from public.transfer_auctions
  where player_id = p_player_id and status = 'open'
  for update;

  if found then
    if v_auction.ends_at <= now() then
      return jsonb_build_object('ok', false, 'error', 'Licytacja już się skończyła.');
    end if;
    if v_auction.seller_club_id is distinct from v_player.club_id then
      return jsonb_build_object('ok', false, 'error', 'Licytacja nie pasuje do klubu.');
    end if;
  end if;
  if not v_buyer.transfer_window_open or not v_seller.transfer_window_open then
    return jsonb_build_object('ok', false, 'error', 'Okno transferowe jest zamknięte.');
  end if;
  if (
    select count(*) from public.players
    where club_id = v_buyer.id and departed_at is null and not academy_track
  ) >= 22 then
    return jsonb_build_object('ok', false, 'error', 'Twoja kadra jest pełna (max 22).');
  end if;

  if v_auction.id is null then
    v_auction.ask := public.derive_transfer_fee_thin(v_player.skill, v_player.age);
  else
    select b.club_id, b.amount into v_leader, v_high
    from public.transfer_auction_bids b
    where b.auction_id = v_auction.id
    order by b.amount desc, b.created_at
    limit 1;
  end if;

  if v_leader = v_buyer.id then
    return jsonb_build_object('ok', false, 'error', 'Twoja oferta już prowadzi.');
  end if;
  if p_amount < v_auction.ask then
    return jsonb_build_object('ok', false, 'error', 'Kwota jest niższa od ceny wywoławczej.');
  end if;
  if v_high is not null and p_amount < v_high + 1000 then
    return jsonb_build_object('ok', false, 'error', 'Podbicie musi być wyższe o co najmniej 1000.');
  end if;
  if v_buyer.cash_balance < p_amount then
    return jsonb_build_object('ok', false, 'error', 'Za mało środków w kasie.');
  end if;

  if v_auction.id is null then
    insert into public.transfer_auctions (player_id, seller_club_id, ask, ends_at)
    values (p_player_id, v_player.club_id, v_auction.ask, now() + interval '24 hours')
    returning * into v_auction;
  end if;
  insert into public.transfer_auction_bids (auction_id, club_id, amount)
  values (v_auction.id, v_buyer.id, p_amount);
  update public.transfer_auctions
  set ends_at = greatest(ends_at, now() + interval '15 minutes')
  where id = v_auction.id
  returning ends_at into v_ends;

  return jsonb_build_object('ok', true, 'amount', p_amount, 'ends_at', v_ends);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'Ktoś właśnie wszedł do licytacji. Odśwież.');
end;
$$;

revoke all on function public.place_auction_bid(text, integer) from public, anon;
grant execute on function public.place_auction_bid(text, integer) to authenticated;

-- The old way to end an auction by hand.
revoke execute on function public.complete_auction_transfer(text) from public, anon, authenticated;
revoke execute on function public.withdraw_auction(text) from public, anon, authenticated;

-- The best bid that still can be paid wins. A window that closed after the bid changes nothing.
create or replace function public.settle_auction(p_auction uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
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
      select 1 from public.players where club_id = v_winner and shirt_number = v_shirt
    ) then
      select n into v_shirt
      from generate_series(1, 99) n
      where not exists (
        select 1 from public.players where club_id = v_winner and shirt_number = n
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
$$;

-- One bad auction must not hold the others.
create or replace function public.settle_due_auctions()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id uuid;
  v_done integer := 0;
begin
  for v_id in
    select id from public.transfer_auctions
    where status = 'open' and ends_at <= now()
    order by ends_at
    limit 100
  loop
    begin
      if public.settle_auction(v_id) <> 'open' then
        v_done := v_done + 1;
      end if;
    exception
      when others then
        raise warning 'auction % not settled: %', v_id, sqlerrm;
    end;
  end loop;
  return v_done;
end;
$$;

revoke all on function public.settle_auction(uuid), public.settle_due_auctions()
  from public, anon, authenticated;
grant execute on function public.settle_due_auctions() to service_role;

-- While bids are in, a player session can neither sell him elsewhere nor take him off the list.
-- The server may (season start, contract end): the auction then ends without a sale.
create or replace function public.guard_auction_player()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(current_setting('lf.auction', true), '') = 'on' then
    return new;
  end if;
  if not exists (
    select 1 from public.transfer_auctions where player_id = old.id and status = 'open'
  ) then
    return new;
  end if;
  if auth.uid() is not null then
    raise exception 'Trwa licytacja tego zawodnika.';
  end if;
  update public.transfer_auctions
  set status = 'withdrawn', settled_at = now()
  where player_id = old.id and status = 'open';
  return new;
end;
$$;

revoke all on function public.guard_auction_player() from public, anon, authenticated;

drop trigger if exists guard_auction_player on public.players;
create trigger guard_auction_player
  before update on public.players
  for each row
  when (
    old.transfer_listed_at is not null
    and (
      new.transfer_listed_at is null
      or new.club_id is distinct from old.club_id
      or (new.departed_at is not null and old.departed_at is null)
    )
  )
  execute function public.guard_auction_player();

select cron.schedule('lf-auctions', '*/10 * * * *', 'select public.settle_due_auctions()');

notify pgrst, 'reload schema';
