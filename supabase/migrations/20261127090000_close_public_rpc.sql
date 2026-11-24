-- D150: the offer cleanup checked nobody, so anyone could cancel pending offers of any player.
-- Only other database functions call it, with the owner's rights.
revoke execute on function public.supersede_pending_transfer_offers(text)
  from public, anon, authenticated;

-- The rest works for a signed-in manager only. Nobody needs it without a session.
do $$
declare
  f regprocedure;
begin
  for f in
    select p.oid::regprocedure
    from pg_proc p
    where p.pronamespace = 'public'::regnamespace
      and p.proname in (
        'buy_scout_report', 'complete_auction_transfer', 'complete_live_h2h_transfer',
        'counter_live_transfer_offer', 'list_live_transfer_listings', 'list_rival_clubs',
        'place_auction_bid', 'reject_transfer_offer', 'rival_match_squad',
        'unlist_transfer_player', 'withdraw_auction', 'withdraw_transfer_offer'
      )
  loop
    execute format('revoke execute on function %s from public, anon', f);
    execute format('grant execute on function %s to authenticated, service_role', f);
  end loop;
end;
$$;

notify pgrst, 'reload schema';
