-- D128, after the deploy: a player session picks the team, nothing else.

revoke execute on function public.apply_match_development(uuid, text, jsonb)
  from public, anon, authenticated;
revoke execute on function public.complete_training_session(uuid, date, jsonb)
  from public, anon, authenticated;

create or replace function public.lf_guard_players()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_allowed constant text[] := array['starter', 'captain', 'set_piece', 'shirt_number'];
begin
  if current_user not in ('authenticated', 'anon') then
    return coalesce(new, old);
  end if;
  if tg_op <> 'UPDATE' then
    raise exception 'players are written by the server' using errcode = '42501';
  end if;
  if (to_jsonb(new) - v_allowed) is distinct from (to_jsonb(old) - v_allowed) then
    raise exception 'protected player column' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_players on public.players;
create trigger lf_guard_players
  before insert or update or delete on public.players
  for each row execute function public.lf_guard_players();

drop trigger if exists lf_guard_finance_movements on public.finance_movements;
create trigger lf_guard_finance_movements
  before insert or update or delete on public.finance_movements
  for each row execute function public.lf_guard_server_only();

drop trigger if exists lf_guard_transfer_deals on public.transfer_deals;
create trigger lf_guard_transfer_deals
  before insert or update or delete on public.transfer_deals
  for each row execute function public.lf_guard_server_only();

-- The onboarding flag and the daily training slot belong to the server as well.
create or replace function public.lf_guard_club_progress()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon')
    and (
      new.first_match_completed_at is distinct from old.first_match_completed_at
      or new.last_training_on is distinct from old.last_training_on
      or new.style_pressing is distinct from old.style_pressing
      or new.style_tempo is distinct from old.style_tempo
      or new.style_width is distinct from old.style_width
    )
  then
    raise exception 'protected club progress' using errcode = '42501';
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_club_progress on public.clubs;
create trigger lf_guard_club_progress
  before update on public.clubs
  for each row execute function public.lf_guard_club_progress();
