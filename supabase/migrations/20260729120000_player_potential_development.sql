-- LFE-PLAYERS-02: players.potential SSOT + atomic match development RPC.
-- Potential generation (wariant B) mirrors apps/web/src/lib/squad/potential.ts.

create or replace function public.lf_hash_player_id(p_id text)
returns bigint
language plpgsql
immutable
strict
as $$
declare
  h bigint := 2166136261;
  i int;
  c int;
begin
  for i in 1 .. length(p_id) loop
    c := ascii(substr(p_id, i, 1));
    h := ((h # c) * 16777619) & 4294967295;
  end loop;
  return h;
end;
$$;

create or replace function public.lf_seed_potential_ceiling(p_id text, p_age integer)
returns integer
language plpgsql
immutable
strict
as $$
declare
  h bigint := public.lf_hash_player_id(p_id);
  base integer;
begin
  base := 62 + (h % 29)::integer;
  if p_age <= 21 then
    base := base + 4 + (h % 5)::integer;
  elsif p_age <= 24 then
    base := base + 2 + (h % 3)::integer;
  elsif p_age >= 32 then
    base := base - 2 - (h % 5)::integer;
  elsif p_age >= 28 then
    base := base - (h % 3)::integer;
  end if;
  return greatest(55, least(99, base));
end;
$$;

create or replace function public.lf_resolve_player_potential(
  p_skill integer,
  p_id text,
  p_age integer
)
returns integer
language sql
immutable
strict
as $$
  select greatest(
    1,
    least(
      99,
      greatest(p_skill, public.lf_seed_potential_ceiling(p_id, p_age))
    )
  );
$$;

alter table public.players
  add column if not exists potential integer;

update public.players
set potential = public.lf_resolve_player_potential(skill, id, age)
where potential is null;

alter table public.players
  alter column potential set not null;

alter table public.players
  drop constraint if exists players_potential_range;

alter table public.players
  add constraint players_potential_range check (potential between 1 and 99);

alter table public.players
  drop constraint if exists players_potential_gte_skill;

alter table public.players
  add constraint players_potential_gte_skill check (potential >= skill);

-- Idempotency for match development (fixture id or 'first-match').
create table if not exists public.match_development_log (
  club_id uuid not null references public.clubs (id) on delete cascade,
  match_key text not null,
  applied_at timestamptz not null default now(),
  primary key (club_id, match_key)
);

alter table public.match_development_log enable row level security;

create policy "match_development_log_select_own"
  on public.match_development_log
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

-- Atomic skill updates for match development (no partial player writes).
create or replace function public.apply_match_development(
  p_club_id uuid,
  p_match_key text,
  p_updates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_club public.clubs%rowtype;
  v_item jsonb;
  v_player_id text;
  v_skill integer;
  v_changed integer := 0;
  v_rows integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_club_id is null or p_match_key is null or length(trim(p_match_key)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Brak danych rozwoju.');
  end if;

  if p_updates is null or jsonb_typeof(p_updates) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe aktualizacje kadry.');
  end if;

  select *
  into v_club
  from public.clubs
  where id = p_club_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  if v_club.owner_id is distinct from v_uid then
    return jsonb_build_object('ok', false, 'error', 'Brak dostępu do klubu.');
  end if;

  if exists (
    select 1
    from public.match_development_log
    where club_id = p_club_id
      and match_key = p_match_key
  ) then
    return jsonb_build_object('ok', true, 'skipped', true, 'changed_count', 0);
  end if;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_skill := (v_item->>'skill')::integer;

    if v_player_id is null or v_skill is null then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy wiersz aktualizacji.');
    end if;

    if v_skill < 1 or v_skill > 99 then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy skill zawodnika.');
    end if;

    update public.players
    set skill = least(v_skill, potential)
    where id = v_player_id
      and club_id = p_club_id
      and departed_at is null
      and potential >= least(v_skill, potential);

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'Nie udało się zaktualizować zawodnika.');
    end if;

    v_changed := v_changed + 1;
  end loop;

  insert into public.match_development_log (club_id, match_key)
  values (p_club_id, p_match_key);

  return jsonb_build_object(
    'ok', true,
    'skipped', false,
    'changed_count', v_changed
  );
end;
$$;

revoke all on function public.apply_match_development(uuid, text, jsonb) from public;
grant execute on function public.apply_match_development(uuid, text, jsonb) to authenticated;

-- Training depth RPC: clamp skill to potential (LFE-TRAINING-02 + PLAYERS-02).
create or replace function public.complete_training_session(
  p_club_id uuid,
  p_training_on date,
  p_updates jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_club public.clubs%rowtype;
  v_item jsonb;
  v_player_id text;
  v_status text;
  v_skill integer;
  v_changed integer := 0;
  v_rows integer;
begin
  if v_uid is null then
    return jsonb_build_object('ok', false, 'error', 'Brak sesji.');
  end if;

  if p_club_id is null or p_training_on is null then
    return jsonb_build_object('ok', false, 'error', 'Brak danych treningu.');
  end if;

  if p_updates is null or jsonb_typeof(p_updates) <> 'array' then
    return jsonb_build_object('ok', false, 'error', 'Nieprawidłowe aktualizacje kadry.');
  end if;

  select *
  into v_club
  from public.clubs
  where id = p_club_id
  for update;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'Nie znaleziono klubu.');
  end if;

  if v_club.owner_id is distinct from v_uid then
    return jsonb_build_object('ok', false, 'error', 'Brak dostępu do klubu.');
  end if;

  if v_club.last_training_on is not distinct from p_training_on then
    return jsonb_build_object('ok', true, 'skipped', true, 'changed_count', 0);
  end if;

  for v_item in select * from jsonb_array_elements(p_updates)
  loop
    v_player_id := v_item->>'id';
    v_status := v_item->>'status';
    v_skill := (v_item->>'skill')::integer;

    if v_player_id is null or v_status is null or v_skill is null then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy wiersz aktualizacji.');
    end if;

    if v_status not in ('READY', 'INJURED', 'SUSPENDED', 'TIRED', 'DEPARTED') then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy status zawodnika.');
    end if;

    if v_skill < 1 or v_skill > 99 then
      return jsonb_build_object('ok', false, 'error', 'Nieprawidłowy skill zawodnika.');
    end if;

    update public.players
    set status = v_status,
        skill = least(v_skill, potential)
    where id = v_player_id
      and club_id = p_club_id
      and departed_at is null
      and potential >= least(v_skill, potential);

    get diagnostics v_rows = row_count;
    if v_rows = 0 then
      return jsonb_build_object('ok', false, 'error', 'Nie udało się zaktualizować zawodnika.');
    end if;

    v_changed := v_changed + 1;
  end loop;

  update public.clubs
  set last_training_on = p_training_on
  where id = p_club_id;

  return jsonb_build_object(
    'ok', true,
    'skipped', false,
    'changed_count', v_changed
  );
end;
$$;
