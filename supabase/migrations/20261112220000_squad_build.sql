-- Squad build: one coach, hidden academy ceiling, auction on listed players,
-- stadium levels. Cash still cannot go below zero (existing clubs check).
-- Category list is a superset, including wages, so a later player_truth apply
-- must not be the only writer of this check.

alter table public.clubs
  add column if not exists coach_group text;

alter table public.clubs
  drop constraint if exists clubs_coach_group_check;

alter table public.clubs
  add constraint clubs_coach_group_check
  check (
    coach_group is null
    or coach_group in ('attack', 'passing', 'defense', 'physical', 'goalkeeping')
  );

alter table public.clubs
  add column if not exists stands_level integer not null default 0;

alter table public.clubs
  add column if not exists pitch_level integer not null default 0;

alter table public.clubs
  add column if not exists training_center_level integer not null default 0;

alter table public.clubs
  drop constraint if exists clubs_stands_level_check;

alter table public.clubs
  add constraint clubs_stands_level_check
  check (stands_level between 0 and 3);

alter table public.clubs
  drop constraint if exists clubs_pitch_level_check;

alter table public.clubs
  add constraint clubs_pitch_level_check
  check (pitch_level between 0 and 3);

alter table public.clubs
  drop constraint if exists clubs_training_center_level_check;

alter table public.clubs
  add constraint clubs_training_center_level_check
  check (training_center_level between 0 and 3);

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
      'coach_hire'
    )
  );

create table if not exists public.scout_reports (
  id uuid primary key default gen_random_uuid(),
  club_id uuid not null references public.clubs (id) on delete cascade,
  player_id text not null,
  band text not null,
  created_at timestamptz not null default now(),
  constraint scout_reports_band_check check (band in ('low', 'medium', 'high', 'elite')),
  constraint scout_reports_club_player_unique unique (club_id, player_id)
);

alter table public.scout_reports enable row level security;

drop policy if exists "scout_reports_select_own" on public.scout_reports;

create policy "scout_reports_select_own"
  on public.scout_reports
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.clubs c
      where c.id = scout_reports.club_id
        and c.owner_id = auth.uid()
    )
  );

create table if not exists public.transfer_auctions (
  id uuid primary key default gen_random_uuid(),
  player_id text not null,
  seller_club_id uuid not null references public.clubs (id) on delete cascade,
  ask integer not null check (ask > 0),
  status text not null default 'open',
  winner_club_id uuid null references public.clubs (id),
  settled_amount integer null check (settled_amount is null or settled_amount > 0),
  created_at timestamptz not null default now(),
  settled_at timestamptz null,
  constraint transfer_auctions_status_check check (status in ('open', 'settled', 'withdrawn'))
);

create unique index if not exists transfer_auctions_one_open_player
  on public.transfer_auctions (player_id)
  where status = 'open';

create table if not exists public.transfer_auction_bids (
  id uuid primary key default gen_random_uuid(),
  auction_id uuid not null references public.transfer_auctions (id) on delete cascade,
  club_id uuid not null references public.clubs (id) on delete cascade,
  amount integer not null check (amount > 0),
  created_at timestamptz not null default now()
);

alter table public.transfer_auctions enable row level security;
alter table public.transfer_auction_bids enable row level security;

drop policy if exists "transfer_auctions_select_auth" on public.transfer_auctions;

create policy "transfer_auctions_select_auth"
  on public.transfer_auctions
  for select
  to authenticated
  using (true);

drop policy if exists "transfer_auction_bids_select_auth" on public.transfer_auction_bids;

create policy "transfer_auction_bids_select_auth"
  on public.transfer_auction_bids
  for select
  to authenticated
  using (true);

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

  select * into v_club from public.clubs where owner_id = v_uid;
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

  v_pot := public.lf_resolve_player_potential(v_player.skill, v_player.id, v_player.age);
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

revoke all on function public.buy_scout_report(text) from public;
grant execute on function public.buy_scout_report(text) to authenticated;

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
  v_ask integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sesja wygasła.');
  end if;
  if p_amount is null or p_amount <= 0 or p_amount <> trunc(p_amount) then
    return jsonb_build_object('ok', false, 'error', 'Zła kwota.');
  end if;

  select * into v_buyer from public.clubs where owner_id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  select * into v_player from public.players where id = p_player_id for update;
  if not found or v_player.departed_at is not null or v_player.transfer_listed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście.');
  end if;

  if v_player.club_id = v_buyer.id then
    return jsonb_build_object('ok', false, 'error', 'Nie licytujesz własnego zawodnika.');
  end if;

  select * into v_seller from public.clubs where id = v_player.club_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Brak klubu sprzedawcy.');
  end if;

  if not v_buyer.transfer_window_open or not v_seller.transfer_window_open then
    return jsonb_build_object('ok', false, 'error', 'Okno transferowe jest zamknięte.');
  end if;

  v_ask := public.derive_transfer_fee_thin(v_player.skill, v_player.age);

  select * into v_auction
  from public.transfer_auctions
  where player_id = p_player_id and status = 'open'
  for update;

  if not found then
    insert into public.transfer_auctions (player_id, seller_club_id, ask)
    values (p_player_id, v_player.club_id, v_ask)
    returning * into v_auction;
  end if;

  if v_auction.seller_club_id is distinct from v_player.club_id then
    return jsonb_build_object('ok', false, 'error', 'Licytacja nie pasuje do klubu.');
  end if;

  select max(amount) into v_high
  from public.transfer_auction_bids
  where auction_id = v_auction.id;

  if p_amount < v_auction.ask then
    return jsonb_build_object('ok', false, 'error', 'Kwota jest niższa od ceny wywoławczej.');
  end if;
  if v_high is not null and p_amount < v_high + 1000 then
    return jsonb_build_object('ok', false, 'error', 'Podbicie musi być wyższe o co najmniej 1000.');
  end if;
  if v_buyer.cash_balance < p_amount then
    return jsonb_build_object('ok', false, 'error', 'Za mało środków w kasie.');
  end if;

  insert into public.transfer_auction_bids (auction_id, club_id, amount)
  values (v_auction.id, v_buyer.id, p_amount);

  return jsonb_build_object('ok', true, 'amount', p_amount);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'Ktoś właśnie wszedł do licytacji. Odśwież.');
end;
$$;

revoke all on function public.place_auction_bid(text, integer) from public;
grant execute on function public.place_auction_bid(text, integer) to authenticated;

create or replace function public.withdraw_auction(p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_seller public.clubs%rowtype;
  v_auction public.transfer_auctions%rowtype;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sesja wygasła.');
  end if;

  select * into v_seller from public.clubs where owner_id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  select * into v_auction
  from public.transfer_auctions
  where player_id = p_player_id and seller_club_id = v_seller.id and status = 'open'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie ma otwartej licytacji.');
  end if;

  update public.transfer_auctions
  set status = 'withdrawn', settled_at = now()
  where id = v_auction.id and status = 'open';

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.withdraw_auction(text) from public;
grant execute on function public.withdraw_auction(text) to authenticated;

create or replace function public.complete_auction_transfer(p_player_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_seller public.clubs%rowtype;
  v_buyer public.clubs%rowtype;
  v_player public.players%rowtype;
  v_auction public.transfer_auctions%rowtype;
  v_winner uuid;
  v_amount integer;
  v_buyer_count integer;
  v_seller_count integer;
  v_seller_gk integer;
  v_is_gk boolean;
  v_shirt integer;
  v_now timestamptz := now();
  v_buy_key text := 'auction-buy:' || p_player_id;
  v_sell_key text := 'auction-sell:' || p_player_id;
  v_existing public.transfer_deals%rowtype;
  v_rows integer;
  i integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Sesja wygasła.');
  end if;

  select * into v_seller from public.clubs where owner_id = v_uid;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  select * into v_existing
  from public.transfer_deals
  where club_id = v_seller.id and idempotency_key = v_sell_key;
  if found then
    return jsonb_build_object('ok', true, 'player_id', v_existing.player_id, 'amount', v_existing.amount);
  end if;

  select * into v_auction
  from public.transfer_auctions
  where player_id = p_player_id and seller_club_id = v_seller.id and status = 'open'
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie ma otwartej licytacji.');
  end if;

  select b.club_id, b.amount into v_winner, v_amount
  from public.transfer_auction_bids b
  where b.auction_id = v_auction.id
  order by b.amount desc, b.created_at desc
  limit 1;

  if v_winner is null or v_amount is null then
    return jsonb_build_object('ok', false, 'error', 'Nikt jeszcze nie licytował.');
  end if;

  if v_amount < v_auction.ask then
    return jsonb_build_object('ok', false, 'error', 'Oferta jest poniżej ceny.');
  end if;

  select * into v_buyer from public.clubs where id = v_winner for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Brak klubu kupującego.');
  end if;

  if not v_seller.transfer_window_open or not v_buyer.transfer_window_open then
    return jsonb_build_object('ok', false, 'error', 'Okno transferowe jest zamknięte.');
  end if;

  select * into v_player from public.players where id = p_player_id for update;
  if not found or v_player.club_id is distinct from v_seller.id then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie należy już do sprzedawcy.');
  end if;
  if v_player.departed_at is not null or v_player.transfer_listed_at is null then
    return jsonb_build_object('ok', false, 'error', 'Zawodnik nie jest na liście.');
  end if;

  select count(*)::integer into v_buyer_count
  from public.players
  where club_id = v_buyer.id and departed_at is null;
  if v_buyer_count >= 22 then
    return jsonb_build_object('ok', false, 'error', 'Kadra kupującego jest pełna (max 22).');
  end if;

  select count(*)::integer into v_seller_count
  from public.players
  where club_id = v_seller.id and departed_at is null;
  if v_seller_count <= 18 then
    return jsonb_build_object('ok', false, 'error', 'Nie zejdziesz poniżej 18 zawodników.');
  end if;

  v_is_gk := (v_player.pos = 'BR' or v_player.role = 'GK');
  if v_is_gk then
    select count(*)::integer into v_seller_gk
    from public.players
    where club_id = v_seller.id
      and departed_at is null
      and (pos = 'BR' or role = 'GK');
    if v_seller_gk <= 1 then
      return jsonb_build_object('ok', false, 'error', 'Nie sprzedasz ostatniego bramkarza.');
    end if;
  end if;

  if v_buyer.cash_balance < v_amount then
    return jsonb_build_object('ok', false, 'error', 'Kupujący nie ma już tych środków.');
  end if;

  v_shirt := v_player.shirt_number;
  if exists (
    select 1 from public.players
    where club_id = v_buyer.id and shirt_number = v_shirt and id is distinct from p_player_id
  ) then
    v_shirt := null;
    for i in 1..99 loop
      if not exists (
        select 1 from public.players where club_id = v_buyer.id and shirt_number = i
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
  set club_id = v_buyer.id,
      shirt_number = v_shirt,
      starter = false,
      captain = false,
      transfer_listed_at = null
  where id = p_player_id
    and club_id = v_seller.id
    and transfer_listed_at is not null
    and departed_at is null;

  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    return jsonb_build_object('ok', false, 'error', 'Nie udało się przenieść zawodnika.');
  end if;

  update public.clubs set cash_balance = cash_balance - v_amount where id = v_buyer.id;
  update public.clubs set cash_balance = cash_balance + v_amount where id = v_seller.id;

  insert into public.finance_movements (club_id, category, label, amount, fixture_id)
  values
    (v_buyer.id, 'transfer_buy', 'Licytacja: ' || v_player.name, -v_amount, null),
    (v_seller.id, 'transfer_sell', 'Licytacja: ' || v_player.name, v_amount, null);

  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values
    (v_buyer.id, 'buy', p_player_id, null, v_amount, v_buy_key, v_now),
    (v_seller.id, 'sell', p_player_id, null, v_amount, v_sell_key, v_now);

  update public.transfer_auctions
  set status = 'settled',
      winner_club_id = v_buyer.id,
      settled_amount = v_amount,
      settled_at = v_now
  where id = v_auction.id and status = 'open';

  perform public.supersede_pending_transfer_offers(p_player_id);

  return jsonb_build_object('ok', true, 'player_id', p_player_id, 'amount', v_amount);
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'error', 'Konflikt transferu — odśwież.');
end;
$$;

revoke all on function public.complete_auction_transfer(text) from public;
grant execute on function public.complete_auction_transfer(text) to authenticated;
