-- Contracts run in club seasons. contract_until was one calendar date for everybody and did
-- nothing; it stays as it is. Nobody's contract ends in the season that is on now.
alter table public.players
  add column if not exists contract_season integer check (contract_season >= 1);

-- Why a player left, so the hub does not call a sale the end of a career.
alter table public.players
  add column if not exists departed_reason text
  check (departed_reason is null or departed_reason in ('retired', 'contract'));

-- Spread over three seasons, so a squad does not leave at once.
update public.players p
set contract_season = c.season_number + 1 + (hashtext(p.id) & 2147483647) % 3
from public.clubs c
where c.id = p.club_id and p.contract_season is null;

create or replace function public.lf_stamp_contract()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season integer;
begin
  if tg_op = 'INSERT' then
    if new.contract_season is not null then
      return new;
    end if;
  elsif new.club_id is not distinct from old.club_id
    and not (old.academy_track and not new.academy_track) then
    return new;
  end if;

  select c.season_number into v_season from public.clubs c where c.id = new.club_id;
  v_season := coalesce(v_season, 1);
  if tg_op = 'INSERT' then
    new.contract_season := v_season + 1 + (hashtext(new.id) & 2147483647) % 3;
  else
    -- A transfer or the first senior contract: this season and two more.
    new.contract_season := v_season + 2;
  end if;
  return new;
end;
$$;

revoke all on function public.lf_stamp_contract() from public, anon, authenticated;

drop trigger if exists lf_stamp_contract on public.players;
create trigger lf_stamp_contract
  before insert or update of club_id, academy_track on public.players
  for each row execute function public.lf_stamp_contract();
