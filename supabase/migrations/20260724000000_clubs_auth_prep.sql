-- P2 Auth prep: one club per manager (filled by Club Wizard in P3).
-- Empty table = authenticated user without club → /welcome.

create table if not exists public.clubs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  short_name text not null,
  created_at timestamptz not null default now(),
  constraint clubs_owner_id_unique unique (owner_id),
  constraint clubs_short_name_len check (char_length(short_name) between 2 and 5)
);

create index if not exists clubs_owner_id_idx on public.clubs (owner_id);

alter table public.clubs enable row level security;

create policy "clubs_select_own"
  on public.clubs
  for select
  to authenticated
  using (owner_id = (select auth.uid()));

create policy "clubs_insert_own"
  on public.clubs
  for insert
  to authenticated
  with check (owner_id = (select auth.uid()));

create policy "clubs_update_own"
  on public.clubs
  for update
  to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "clubs_delete_own"
  on public.clubs
  for delete
  to authenticated
  using (owner_id = (select auth.uid()));
