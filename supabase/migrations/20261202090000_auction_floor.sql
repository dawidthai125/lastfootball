-- Players under an open auction count as gone (D157), so a seller cannot break the auction by
-- going down to the minimum squad in another way. The winner is served down to 15 seniors: a
-- loan that ended or a contract that ran out meanwhile is not a reason to break the deal.
create or replace function public.auction_reserved(p_club uuid, p_except text, p_keepers boolean)
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer
  from public.transfer_auctions a
  join public.players p on p.id = a.player_id and p.club_id = a.seller_club_id
  where a.seller_club_id = p_club and a.status = 'open' and p.departed_at is null
    and p.id is distinct from p_except
    and (not p_keepers or p.pos = 'BR' or p.role = 'GK');
$$;
revoke all on function public.auction_reserved(uuid, text, boolean)
  from public, anon, authenticated;
grant execute on function public.auction_reserved(uuid, text, boolean) to service_role;

do $mig$
declare
  d text;
begin
  d := pg_get_functiondef(
    'public.complete_live_h2h_transfer(uuid,uuid,text,integer,uuid)'::regprocedure
  );
  if position('auction_reserved' in d) = 0 then
    if position('if v_seller_count <= 18 then' in d) = 0
      or position('if v_seller_gk <= 1 then' in d) = 0 then
      raise exception 'complete_live_h2h_transfer differs';
    end if;
    d := replace(d, 'if v_seller_count <= 18 then',
      'if v_seller_count - public.auction_reserved(p_seller_club_id, p_player_id, false) <= 18 then');
    d := replace(d, 'if v_seller_gk <= 1 then',
      'if v_seller_gk - public.auction_reserved(p_seller_club_id, p_player_id, true) <= 1 then');
    execute d;
  end if;

  d := pg_get_functiondef('public.settle_auction(uuid)'::regprocedure);
  if position(') > 18' in d) > 0 then
    execute replace(d, ') > 18', ') > 15');
  elsif position(') > 15' in d) = 0 then
    raise exception 'settle_auction differs';
  end if;

  d := pg_get_functiondef('public.place_auction_bid(text,integer)'::regprocedure);
  if position('auction_reserved' in d) = 0 then
    if position('  if v_auction.id is null then
    v_auction.ask :=' in d) = 0 then
      raise exception 'place_auction_bid differs';
    end if;
    d := replace(d, '  if v_auction.id is null then
    v_auction.ask :=', '  if v_auction.id is null then
    -- One seller at a time, so two first bids cannot both take the last free place.
    perform 1 from public.clubs where id = v_seller.id for update;
    if (
      select count(*) from public.players
      where club_id = v_seller.id and departed_at is null and not academy_track
    ) - public.auction_reserved(v_seller.id, p_player_id, false) <= 18 then
      return jsonb_build_object(''ok'', false, ''error'', ''Sprzedawca nie może zejść poniżej 18 zawodników.'');
    end if;
    if (v_player.pos = ''BR'' or v_player.role = ''GK'') and (
      select count(*) from public.players
      where club_id = v_seller.id and departed_at is null and not academy_track
        and (pos = ''BR'' or role = ''GK'')
    ) - public.auction_reserved(v_seller.id, p_player_id, true) <= 1 then
      return jsonb_build_object(''ok'', false, ''error'', ''Sprzedawca nie może sprzedać ostatniego bramkarza.'');
    end if;
    v_auction.ask :=');
    execute d;
  end if;
end;
$mig$;
