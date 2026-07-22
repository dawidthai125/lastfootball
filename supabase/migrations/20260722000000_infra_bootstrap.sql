-- Infra bootstrap migration (no business tables).
-- SSOT for future schema: supabase/migrations/
--
-- RLS strategy (to be applied on every business table in Epic-1+):
-- 1. ENABLE ROW LEVEL SECURITY on all tables containing user/team data
-- 2. Deny by default; add explicit policies for SELECT/INSERT/UPDATE/DELETE
-- 3. Prefer auth.uid() ownership checks; never trust client-sent user_id alone
-- 4. Service role bypasses RLS — use only in trusted server/cron/edge contexts
-- 5. Public reads only via dedicated policies or SECURITY DEFINER RPCs

create extension if not exists "pgcrypto";

-- Placeholder marker for infra readiness checks (safe, non-sensitive).
create table if not exists public.infra_meta (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

alter table public.infra_meta enable row level security;

-- Read-only for authenticated users (ops smoke); no writes from clients.
create policy "infra_meta_select_authenticated"
  on public.infra_meta
  for select
  to authenticated
  using (true);

insert into public.infra_meta (key, value)
values ('bootstrap', 'ready')
on conflict (key) do update set value = excluded.value, updated_at = now();
