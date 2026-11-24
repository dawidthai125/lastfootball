-- D159: whole-game audit.

-- 1. A new player got the column default before players_fill_truth could derive his own
--    personality and clause, so everyone bought, found or recruited was calm with clause 0.
alter table public.players alter column personality drop default;
alter table public.players alter column release_clause drop default;
update public.players
set personality = public.personality_from_id(id), release_clause = 100000 + skill * 5000
where release_clause = 0;

-- 2. Writes a player's session may make. Everything else goes through the server.
drop policy if exists "clubs_delete_own" on public.clubs;
drop policy if exists "clubs_insert_own" on public.clubs;
drop policy if exists "fixtures_insert_own" on public.fixtures;
drop policy if exists "fixtures_update_own" on public.fixtures;
drop policy if exists "fixtures_delete_own" on public.fixtures;
drop policy if exists "players_insert_own" on public.players;
drop policy if exists "finance_movements_insert_own" on public.finance_movements;
drop policy if exists "transfer_deals_insert_own" on public.transfer_deals;
drop policy if exists "club_sponsor_contracts_insert_own" on public.club_sponsor_contracts;
drop policy if exists "club_sponsor_contracts_update_own" on public.club_sponsor_contracts;
drop policy if exists "rival_challenges_insert_challenger" on public.rival_challenges;
drop policy if exists "rival_challenges_update_challenger" on public.rival_challenges;

revoke insert, update, delete on
  public.clubs, public.players, public.fixtures, public.finance_movements, public.transfer_deals,
  public.club_sponsor_contracts, public.rival_challenges, public.transfer_offers
from anon, authenticated;
revoke update on public.scout_shortlist from anon, authenticated;
grant update (press_line, press_shape) on public.clubs to authenticated;
grant update (starter, captain, set_piece, shirt_number) on public.players to authenticated;
grant insert on public.transfer_offers to authenticated;

-- 3. The database names both clubs and numbers the offer, so nobody can type them.
do $mig$
declare
  d text;
begin
  d := pg_get_functiondef('public.lf_guard_transfer_offer()'::regprocedure);
  if position('lf_offer_key' in d) = 0 then
    if position('  new.created_at := now();' in d) = 0 then
      raise exception 'lf_guard_transfer_offer differs';
    end if;
    d := replace(d, '  new.created_at := now();', '  -- lf_offer_key
  new.ask_at_create := v_ask;
  select coalesce(nullif(c.short_name, ''''), c.name) into new.buyer_label
  from public.clubs c where c.id = new.buyer_club_id;
  select coalesce(nullif(c.short_name, ''''), c.name) into new.seller_label
  from public.clubs c where c.id = new.seller_club_id;
  select count(*) into v_open
  from public.transfer_offers o
  where o.buyer_club_id = new.buyer_club_id and o.player_id = new.player_id
    and o.status <> ''pending'';
  if v_open >= 5 then
    raise exception ''too many offers for the player'' using errcode = ''42501'';
  end if;
  new.idempotency_key := ''pending:'' || new.buyer_club_id::text || '':'' || new.player_id
    || case when v_open > 0 then '':'' || v_open::text else '''' end;
  new.created_at := now();');
    execute d;
  end if;

  -- 4. A direct purchase costs the full price, and both clubs are locked before the squads are
  --    counted (D158 closed the same race for sales to computer clubs).
  d := pg_get_functiondef(
    'public.complete_live_h2h_transfer(uuid,uuid,text,integer,uuid)'::regprocedure
  );
  if position('one deal at a time' in d) = 0 then
    if position('  select count(*)::integer into v_buyer_count' in d) = 0
      or position('  if not public.is_allowed_transfer_amount_thin(v_ask, p_agreed_amount) then' in d) = 0
    then
      raise exception 'complete_live_h2h_transfer differs';
    end if;
    d := replace(d,
      '  if not public.is_allowed_transfer_amount_thin(v_ask, p_agreed_amount) then',
      '  if p_accept_offer_id is null and p_agreed_amount is distinct from v_ask then
    return jsonb_build_object(''ok'', false, ''error'', ''Cena się zmieniła. Odśwież Transfery.'');
  end if;
  if not public.is_allowed_transfer_amount_thin(v_ask, p_agreed_amount) then');
    d := replace(d, '  select count(*)::integer into v_buyer_count',
      '  -- one deal at a time counts squads and cash
  perform 1 from public.clubs where id in (p_buyer_club_id, p_seller_club_id)
  order by id for update;
  select * into v_buyer from public.clubs where id = p_buyer_club_id;
  select * into v_seller from public.clubs where id = p_seller_club_id;
  if not v_buyer.transfer_window_open or not v_seller.transfer_window_open then
    return jsonb_build_object(''ok'', false, ''error'', ''Okno transferowe jest zamknięte.'');
  end if;

  select count(*)::integer into v_buyer_count');
    d := replace(d, 'Kwota poza pasbem negocjacji.', 'Kwota poza zakresem negocjacji.');
    execute d;
  end if;

  -- The player first, then the club: the order of bids, auctions and deals.
  d := pg_get_functiondef('public.sell_market_player(uuid,text,integer,integer)'::regprocedure);
  if position('player first' in d) = 0 then
    if position('  select * into v_club from public.clubs where id = p_club_id for update;' in d) = 0
    then
      raise exception 'sell_market_player differs';
    end if;
    d := replace(d, '  select * into v_club from public.clubs where id = p_club_id for update;',
      '  perform 1 from public.players where id = p_player_id for update; -- player first
  select * into v_club from public.clubs where id = p_club_id for update;');
    execute d;
  end if;
end;
$mig$;

-- 5. A player who is gone or off the market has no open offers. A rejected computer offer stays
--    rejected until he is listed again.
alter table public.players
  add column if not exists ai_offer_declined boolean not null default false;

create or replace function public.lf_player_off_market()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.transfer_offers
  set status = 'superseded', resolved_at = now()
  where player_id = new.id and status = 'pending';
  return null;
end;
$$;
revoke all on function public.lf_player_off_market() from public, anon, authenticated;

drop trigger if exists lf_player_off_market on public.players;
create trigger lf_player_off_market
  after update on public.players
  for each row
  when (
    -- A deal moves the player to another club and closes his offers itself.
    new.club_id = old.club_id and (
      (new.departed_at is not null and old.departed_at is null)
      or (new.transfer_listed_at is null and old.transfer_listed_at is not null)
    )
  )
  execute function public.lf_player_off_market();

create or replace function public.lf_reset_ai_offer()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.ai_offer_declined := false;
  return new;
end;
$$;
drop trigger if exists lf_reset_ai_offer on public.players;
create trigger lf_reset_ai_offer
  before update on public.players
  for each row
  when (new.transfer_listed_at is distinct from old.transfer_listed_at)
  execute function public.lf_reset_ai_offer();

update public.transfer_offers o
set status = 'superseded', resolved_at = now()
where o.status = 'pending' and not exists (
  select 1 from public.players p
  where p.id = o.player_id and p.club_id = o.seller_club_id and p.departed_at is null
    and p.transfer_listed_at is not null
);

-- 6. A challenged club does not field players who are away.
do $mig$
declare
  d text;
begin
  d := pg_get_functiondef('public.rival_match_squad(uuid)'::regprocedure);
  if position('intl_absent_until' in d) = 0 then
    if position('and coalesce(p.academy_track, false) = false' in d) = 0 then
      raise exception 'rival_match_squad differs';
    end if;
    d := replace(d, 'and coalesce(p.academy_track, false) = false',
      'and coalesce(p.academy_track, false) = false
    and not p.on_loan
    and (p.intl_absent_until is null or p.intl_absent_until < (now() at time zone ''utc'')::date)');
    execute d;
  end if;
  -- 7. The season start deletes fixtures, the archive of matches stays.
  d := pg_get_functiondef('public.human_active_clubs(timestamptz)'::regprocedure);
  if position('club_matches' in d) = 0 then
    if position('or exists (' in d) = 0 then
      raise exception 'human_active_clubs differs';
    end if;
    d := replace(d, 'or exists (', 'or exists (
        select 1 from public.club_matches m
        where m.club_id = c.id and m.played_at >= p_since
      )
      or exists (');
    execute d;
  end if;
end;
$mig$;

-- 8. Every account has an e-mail status from the first second. Without a row the game treats
--    the address as confirmed.
create or replace function public.lf_new_account()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.manager_email_status (user_id, deadline_at)
  values (new.id, now() + interval '5 days')
  on conflict do nothing;
  return null;
exception
  when others then
    raise warning 'e-mail status of a new account not created: %', sqlerrm;
    return null;
end;
$$;
revoke all on function public.lf_new_account() from public, anon, authenticated;
drop trigger if exists lf_new_account on auth.users;
create trigger lf_new_account
  after insert on auth.users
  for each row execute function public.lf_new_account();

-- 9. The eleven is saved in one statement. Row level security limits it to the caller's club.
create or replace function public.save_starting_xi(p_club_id uuid, p_player_ids text[])
returns integer
language sql
set search_path = ''
as $$
  with changed as (
    update public.players
    set starter = (id = any (p_player_ids))
    where club_id = p_club_id and departed_at is null
      and starter is distinct from (id = any (p_player_ids))
    returning 1
  )
  select count(*)::integer from changed;
$$;
revoke all on function public.save_starting_xi(uuid, text[]) from public, anon;
grant execute on function public.save_starting_xi(uuid, text[]) to authenticated, service_role;

notify pgrst, 'reload schema';
