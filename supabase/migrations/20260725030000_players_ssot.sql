-- LFE-PLAYERS-01 Thin Slice: players table = club roster SSOT.

create table if not exists public.players (
  id text primary key,
  club_id uuid not null references public.clubs (id) on delete cascade,
  name text not null,
  shirt_number integer not null,
  pos text not null,
  role text not null,
  starter boolean not null default false,
  captain boolean not null default false,
  age integer not null,
  skill integer not null,
  status text not null default 'READY',
  nationality text not null default 'POL',
  version integer not null default 1,
  created_at timestamptz not null default now(),
  constraint players_shirt_number_pos check (shirt_number between 1 and 99),
  constraint players_age_pos check (age between 15 and 50),
  constraint players_skill_pos check (skill between 1 and 99),
  constraint players_version_pos check (version >= 1),
  constraint players_status_check check (
    status in ('READY', 'INJURED', 'SUSPENDED', 'TIRED')
  ),
  constraint players_club_shirt_unique unique (club_id, shirt_number)
);

create index if not exists players_club_id_idx on public.players (club_id);
create index if not exists players_club_starter_idx on public.players (club_id, starter);

alter table public.players enable row level security;

create policy "players_select_own"
  on public.players
  for select
  to authenticated
  using (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

create policy "players_insert_own"
  on public.players
  for insert
  to authenticated
  with check (
    club_id in (
      select c.id from public.clubs c where c.owner_id = (select auth.uid())
    )
  );

-- Backfill starter roster (18) for clubs without players — same ids as seedClubRoster.
do $$
declare
  r record;
  tag text;
  xi_names text[] := array[
    'M. Nowak', 'K. Baran', 'P. Lis', 'A. Sowa', 'M. Kowalik',
    'A. Wróbel', 'D. Kapitan', 'T. Marek', 'R. Lew', 'K. Biały', 'J. Czarny'
  ];
  xi_numbers int[] := array[1, 2, 4, 5, 3, 6, 8, 7, 10, 11, 9];
  xi_pos text[] := array['BR', 'PO', 'ŚO', 'ŚO', 'LO', 'ŚP', 'ŚP', 'PN', 'ŚP', 'PN', 'N'];
  xi_role text[] := array['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'LW', 'ST'];
  bench_names text[] := array[
    'O. Bramka', 'S. Bok', 'W. Stoper', 'E. Skrzydło', 'U. Pomoc', 'I. Napast', 'Y. Lewy'
  ];
  bench_numbers int[] := array[12, 13, 14, 15, 16, 17, 18];
  bench_pos text[] := array['BR', 'PO', 'ŚO', 'PN', 'ŚP', 'N', 'LO'];
  bench_role text[] := array['GK', 'RB', 'CB', 'RW', 'CM', 'ST', 'LB'];
  i int;
  shirt int;
begin
  for r in
    select c.id
    from public.clubs c
    where not exists (select 1 from public.players p where p.club_id = c.id)
  loop
    tag := substr(replace(r.id::text, '-', ''), 1, 8);
    if tag is null or tag = '' then
      tag := 'club';
    end if;

    for i in 1..11 loop
      shirt := xi_numbers[i];
      insert into public.players (
        id, club_id, name, shirt_number, pos, role, starter, captain,
        age, skill, status, nationality, version
      ) values (
        's-' || tag || '-' || (i - 1),
        r.id,
        xi_names[i],
        shirt,
        xi_pos[i],
        xi_role[i],
        true,
        (i = 7),
        22 + (shirt % 12),
        55 + (shirt % 20),
        'READY',
        'POL',
        1
      )
      on conflict (id) do nothing;
    end loop;

    for i in 1..7 loop
      shirt := bench_numbers[i];
      insert into public.players (
        id, club_id, name, shirt_number, pos, role, starter, captain,
        age, skill, status, nationality, version
      ) values (
        's-' || tag || '-b' || (i - 1),
        r.id,
        bench_names[i],
        shirt,
        bench_pos[i],
        bench_role[i],
        false,
        false,
        22 + (shirt % 12),
        55 + (shirt % 20),
        'READY',
        'POL',
        1
      )
      on conflict (id) do nothing;
    end loop;
  end loop;
end $$;
