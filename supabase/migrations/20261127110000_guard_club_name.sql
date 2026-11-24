-- D150, after the code that founds clubs on the server.
-- The name filter runs on the server, so a player's session may not write names past it.
create or replace function public.lf_guard_club_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      raise exception 'clubs are founded by the server' using errcode = '42501';
    end if;
    if new.name is distinct from old.name or new.short_name is distinct from old.short_name then
      raise exception 'protected club name' using errcode = '42501';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists lf_guard_club_name on public.clubs;
create trigger lf_guard_club_name
  before insert or update on public.clubs
  for each row execute function public.lf_guard_club_name();
