-- D132: an offer asks another manager to act, so the database checks it before it counts.
-- The fee helpers are the ones the settlement uses, so only a payable offer gets in.

-- Security definer: the buyer's session cannot see every row this needs. A trigger function
-- cannot be called over the API, and the WHEN clause below still sees the caller's role.
create or replace function public.lf_guard_transfer_offer()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_skill integer;
  v_age integer;
  v_ask integer;
  v_open integer;
begin
  if new.status is distinct from 'pending'
    or new.phase is distinct from 'opening'
    or new.last_actor is distinct from 'buyer'
  then
    raise exception 'an offer starts as pending and opening' using errcode = '42501';
  end if;
  if new.seller_club_id = new.buyer_club_id then
    raise exception 'an offer needs two clubs' using errcode = '42501';
  end if;

  select p.skill, p.age into v_skill, v_age
  from public.players p
  where p.id = new.player_id
    and p.club_id = new.seller_club_id
    and p.transfer_listed_at is not null
    and p.departed_at is null;
  if not found then
    raise exception 'player is not on the market' using errcode = '42501';
  end if;

  v_ask := public.derive_transfer_fee_thin(v_skill, v_age);
  if new.opening_amount is distinct from new.current_amount
    or not public.is_allowed_transfer_amount_thin(v_ask, new.current_amount)
  then
    raise exception 'offer amount is not allowed' using errcode = '42501';
  end if;

  -- One insert of a buyer at a time, so ten parallel inserts cannot all see nine.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended('lf_offer:' || new.buyer_club_id::text, 0)
  );
  select count(*) into v_open
  from public.transfer_offers o
  where o.buyer_club_id = new.buyer_club_id and o.status = 'pending';
  if v_open >= 10 then
    raise exception 'too many open offers' using errcode = '42501';
  end if;

  new.created_at := now();
  new.resolved_at := null;
  return new;
end;
$$;

revoke all on function public.lf_guard_transfer_offer() from public, anon, authenticated;

drop trigger if exists lf_guard_transfer_offer on public.transfer_offers;
create trigger lf_guard_transfer_offer
  before insert on public.transfer_offers
  for each row
  when (current_user in ('authenticated', 'anon'))
  execute function public.lf_guard_transfer_offer();
