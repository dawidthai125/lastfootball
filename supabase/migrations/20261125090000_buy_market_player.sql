-- A market purchase in one transaction. Two fast requests could both pay, because the row that
-- says "bought" was written last.
create or replace function public.buy_market_player(
  p_club_id uuid,
  p_market_id text,
  p_amount integer,
  p_max_roster integer,
  p_player jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_cash integer;
  v_open boolean;
  v_key text := 'buy:' || p_market_id;
  v_player_id text := p_player ->> 'id';
  v_deal record;
begin
  if p_amount is null or p_amount < 0 or v_player_id is null then
    raise exception 'purchase out of range';
  end if;
  select cash_balance, transfer_window_open into v_cash, v_open
  from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  select player_id, amount into v_deal
  from public.transfer_deals where club_id = p_club_id and idempotency_key = v_key;
  if found then
    return jsonb_build_object(
      'ok', true, 'already', true, 'player_id', v_deal.player_id, 'amount', v_deal.amount
    );
  end if;
  if not v_open then
    return jsonb_build_object('ok', false, 'reason', 'window');
  end if;
  if v_cash < p_amount then
    return jsonb_build_object('ok', false, 'reason', 'cash');
  end if;
  if (
    select count(*) from public.players
    where club_id = p_club_id and departed_at is null and not academy_track
  ) >= p_max_roster then
    return jsonb_build_object('ok', false, 'reason', 'roster');
  end if;

  insert into public.players (
    id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status,
    nationality, origin, joined_at, version
  ) values (
    v_player_id, p_club_id, p_player ->> 'name', (p_player ->> 'shirt_number')::integer,
    p_player ->> 'pos', p_player ->> 'role', false, false, (p_player ->> 'age')::integer,
    (p_player ->> 'skill')::integer, (p_player ->> 'potential')::integer, 'READY', 'POL',
    case when p_amount = 0 then 'free' else 'bought' end, now(), 1
  );
  update public.clubs set cash_balance = v_cash - p_amount where id = p_club_id;
  if p_amount > 0 then
    insert into public.finance_movements (club_id, category, label, amount)
    values (p_club_id, 'transfer_buy', 'Transfer: ' || (p_player ->> 'name'), -p_amount);
  end if;
  insert into public.transfer_deals (
    club_id, kind, player_id, market_id, amount, idempotency_key, completed_at
  ) values (p_club_id, 'buy', v_player_id, p_market_id, p_amount, v_key, now());

  return jsonb_build_object('ok', true, 'player_id', v_player_id, 'amount', p_amount);
end;
$$;

revoke all on function public.buy_market_player(uuid, text, integer, integer, jsonb)
  from public, anon, authenticated;
grant execute on function public.buy_market_player(uuid, text, integer, integer, jsonb)
  to service_role;
