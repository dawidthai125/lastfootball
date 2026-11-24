-- Sale to a computer club in one transaction (D158). Two sales at once could go below the
-- minimum squad, and a failure in the middle could leave a player sold and not paid.
create or replace function public.sell_market_player(
  p_club_id uuid,
  p_player_id text,
  p_amount integer,
  p_min_roster integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_club public.clubs%rowtype;
  v_player public.players%rowtype;
  v_key text := 'sell:' || p_player_id;
  v_deal record;
begin
  if p_amount is null or p_amount < 0 or p_amount > 10000000 then
    raise exception 'sale out of range';
  end if;
  select * into v_club from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;
  select player_id, amount into v_deal
  from public.transfer_deals where club_id = p_club_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object('ok', true, 'already', true, 'amount', v_deal.amount);
  end if;
  if not v_club.transfer_window_open then
    return jsonb_build_object('ok', false, 'reason', 'window');
  end if;

  select * into v_player from public.players where id = p_player_id for update;
  if not found or v_player.club_id <> p_club_id or v_player.departed_at is not null
    or v_player.academy_track or v_player.on_loan or v_player.loaned_in then
    return jsonb_build_object('ok', false, 'reason', 'player');
  end if;
  if exists (
    select 1 from public.transfer_auctions where player_id = p_player_id and status = 'open'
  ) then
    return jsonb_build_object('ok', false, 'reason', 'auction');
  end if;
  if (
    select count(*) from public.players
    where club_id = p_club_id and departed_at is null and not academy_track
  ) - public.auction_reserved(p_club_id, p_player_id, false) <= p_min_roster then
    return jsonb_build_object('ok', false, 'reason', 'roster');
  end if;
  if (v_player.pos = 'BR' or v_player.role = 'GK') and (
    select count(*) from public.players
    where club_id = p_club_id and departed_at is null and not academy_track
      and (pos = 'BR' or role = 'GK')
  ) - public.auction_reserved(p_club_id, p_player_id, true) <= 1 then
    return jsonb_build_object('ok', false, 'reason', 'keeper');
  end if;

  update public.players
  set status = 'DEPARTED', departed_at = now(), starter = false, captain = false,
      set_piece = false, transfer_listed_at = null
  where id = p_player_id;
  update public.clubs set cash_balance = cash_balance + p_amount where id = p_club_id;
  insert into public.finance_movements (club_id, category, label, amount)
  values (p_club_id, 'transfer_sell', 'Sprzedaż: ' || v_player.name, p_amount);
  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values (p_club_id, 'sell', p_player_id, null, p_amount, v_key, now());
  return jsonb_build_object('ok', true, 'amount', p_amount);
end;
$$;

-- One individual session of the club a day, as the page says. False = it is taken.
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
    select 1 from public.players where club_id = p_club_id and last_individual_on = p_today
  ) then
    return false;
  end if;
  update public.players set last_individual_on = p_today
  where id = p_player_id and club_id = p_club_id and departed_at is null and not academy_track;
  return found;
end;
$$;

revoke all on function
  public.sell_market_player(uuid, text, integer, integer),
  public.claim_individual_training(uuid, text, date)
from public, anon, authenticated;
grant execute on function
  public.sell_market_player(uuid, text, integer, integer),
  public.claim_individual_training(uuid, text, date)
to service_role;

notify pgrst, 'reload schema';
