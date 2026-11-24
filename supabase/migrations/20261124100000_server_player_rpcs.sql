-- D128, before the deploy: the service role may call the two squad functions.
do $$
declare
  f text;
  d text;
  n text;
begin
  foreach f in array array[
    'public.apply_match_development(uuid,text,jsonb)',
    'public.complete_training_session(uuid,date,jsonb)'
  ]
  loop
    d := pg_get_functiondef(f::regprocedure);
    if position('service_role' in d) > 0 then
      continue;
    end if;
    n := replace(
      replace(
        d,
        'if v_uid is null then',
        'if v_uid is null and coalesce(auth.role(), '''') <> ''service_role'' then'
      ),
      'if v_club.owner_id is distinct from v_uid then',
      'if v_uid is not null and v_club.owner_id is distinct from v_uid then'
    );
    if n = d or position('v_uid is not null and' in n) = 0 then
      raise exception 'unexpected body of %', f;
    end if;
    execute n;
    execute format('grant execute on function %s to service_role', f::regprocedure);
  end loop;
end;
$$;

-- Rest between match days: the day of the last energy write.
alter table public.players
  add column if not exists energy_on date not null default ((now() at time zone 'utc')::date);

create or replace function public.lf_stamp_energy()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.energy_on := (now() at time zone 'utc')::date;
  return new;
end;
$$;

drop trigger if exists lf_stamp_energy on public.players;
create trigger lf_stamp_energy
  before update of energy on public.players
  for each row execute function public.lf_stamp_energy();
