-- D160: a club always has a way out of injuries and bans.

-- 1. Days without a match shorten an injury and a ban. The app derives it (servedAbsence).
alter table public.players add column if not exists absence_on date;
-- Energy is written by every match, so nothing of the club was played after that day.
update public.players set absence_on = energy_on where absence_on is null;
alter table public.players
  alter column absence_on set default ((now() at time zone 'utc')::date);
alter table public.players alter column absence_on set not null;

-- Every match save writes injury_matches: the match counted for this day.
create or replace function public.lf_stamp_absence()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.absence_on := (now() at time zone 'utc')::date;
  return new;
end;
$$;

-- A training saves the derived status: what the days already served must not come back.
create or replace function public.lf_clear_absence()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'DEPARTED' then
    return new;
  end if;
  new.absence_on := (now() at time zone 'utc')::date;
  if new.status <> 'INJURED' then
    new.injury_matches := 0;
  end if;
  if new.status in ('READY', 'TIRED') and old.status in ('SUSPENDED', 'DEPARTED') then
    new.suspension_matches := 0;
  end if;
  return new;
end;
$$;

drop trigger if exists lf_stamp_absence on public.players;
create trigger lf_stamp_absence
  before update of injury_matches on public.players
  for each row execute function public.lf_stamp_absence();

drop trigger if exists lf_clear_absence on public.players;
create trigger lf_clear_absence
  before update of status on public.players
  for each row when (new.status is distinct from old.status)
  execute function public.lf_clear_absence();

-- Same rule as servedAbsence in lib/squad/rest.ts, for reads inside the database.
create or replace function public.lf_status_today(
  p_status text,
  p_injury integer,
  p_ban integer,
  p_since date
)
returns text
language sql
stable
set search_path = ''
as $$
  select case
    when p_status = 'INJURED' and d.days < greatest(1, p_injury) then 'INJURED'
    when p_status = 'INJURED' and d.days - greatest(1, p_injury) < p_ban then 'SUSPENDED'
    when p_status = 'SUSPENDED' and d.days < greatest(1, p_ban) then 'SUSPENDED'
    when p_status in ('INJURED', 'SUSPENDED') then 'READY'
    else p_status
  end
  from (
    select greatest(0, (now() at time zone 'utc')::date - p_since - 1) as days
  ) d;
$$;

revoke all on function public.lf_stamp_absence() from public, anon, authenticated;
revoke all on function public.lf_clear_absence() from public, anon, authenticated;
revoke all on function public.lf_status_today(text, integer, integer, date)
  from public, anon, authenticated;
grant execute on function public.lf_stamp_absence() to service_role;
grant execute on function public.lf_clear_absence() to service_role;
grant execute on function public.lf_status_today(text, integer, integer, date) to service_role;

-- 2. The emergency junior: free, never for sale, only while no legal eleven exists.
alter table public.players drop constraint if exists players_origin_check;
alter table public.players add constraint players_origin_check
  check (origin is null or origin in ('academy', 'free', 'bought', 'loan', 'emergency'));

create or replace function public.call_emergency_junior(
  p_club_id uuid,
  p_player jsonb,
  p_max_roster integer
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_season integer;
  v_seniors integer;
  v_free integer;
  v_keepers integer;
  v_shirt integer;
  v_prefix text := 'e-' || replace(p_club_id::text, '-', '') || '-';
  v_id text;
  v_pos text := p_player ->> 'pos';
  v_role text := p_player ->> 'role';
begin
  if p_max_roster is null or v_pos is null or v_role is null then
    raise exception 'emergency junior out of range';
  end if;
  select season_number into v_season from public.clubs where id = p_club_id for update;
  if not found then
    raise exception 'club not found';
  end if;

  select count(*),
    count(*) filter (where p.fit),
    count(*) filter (where p.fit and p.pos = 'BR')
  into v_seniors, v_free, v_keepers
  from (
    select q.pos,
      public.lf_status_today(q.status, q.injury_matches, q.suspension_matches, q.absence_on)
        in ('READY', 'TIRED')
      and not q.on_loan
      and (q.intl_absent_until is null
        or q.intl_absent_until < (now() at time zone 'utc')::date) as fit
    from public.players q
    where q.club_id = p_club_id and q.departed_at is null and not q.academy_track
  ) p;
  if v_free >= 11 and v_keepers > 0 then
    return jsonb_build_object('ok', false, 'reason', 'not_needed');
  end if;
  if v_seniors >= p_max_roster then
    return jsonb_build_object('ok', false, 'reason', 'roster');
  end if;
  if v_keepers = 0 then
    v_pos := 'BR';
    v_role := 'GK';
  elsif v_pos = 'BR' or v_role = 'GK' then
    v_pos := 'ŚP';
    v_role := 'CM';
  end if;

  select n into v_shirt
  from generate_series(1, 99) as n
  where not exists (
    select 1 from public.players p
    where p.club_id = p_club_id and p.shirt_number = n and p.departed_at is null
  )
  order by (n < 40), n
  limit 1;
  if v_shirt is null then
    return jsonb_build_object('ok', false, 'reason', 'shirt');
  end if;
  select v_prefix || (count(*) + 1) into v_id
  from public.players p where starts_with(p.id, v_prefix);

  insert into public.players (
    id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status,
    nationality, origin, joined_at, version, wage, contract_season
  ) values (
    v_id, p_club_id, p_player ->> 'name', v_shirt, v_pos, v_role, false, false,
    (p_player ->> 'age')::integer, (p_player ->> 'skill')::integer,
    (p_player ->> 'potential')::integer, 'READY', 'POL', 'emergency', now(), 1,
    (p_player ->> 'wage')::integer, coalesce(v_season, 1)
  );
  return jsonb_build_object('ok', true, 'name', p_player ->> 'name', 'pos', v_pos);
end;
$$;

revoke all on function public.call_emergency_junior(uuid, jsonb, integer)
  from public, anon, authenticated;
grant execute on function public.call_emergency_junior(uuid, jsonb, integer) to service_role;
