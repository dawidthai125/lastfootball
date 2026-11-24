-- D132: opt-in notifications (web push and e-mail). Server-only tables: row level security
-- without policies and no grants for players. Additive and safe to run twice.

create table if not exists public.notification_prefs (
  user_id uuid primary key references auth.users (id) on delete cascade,
  push_enabled boolean not null default false,
  email_enabled boolean not null default false,
  kind_matchday boolean not null default false,
  kind_human_round boolean not null default false,
  kind_offer boolean not null default false,
  kind_challenge boolean not null default false,
  unsubscribe_token_hash text,
  -- Any change, also the unsubscribe link.
  updated_at timestamptz not null default now(),
  -- Last choice made in the game itself. Counts as activity; unsubscribing does not.
  chosen_at timestamptz not null default now(),
  -- Scheduler cursor: the longest waiting manager goes first.
  last_processed_at timestamptz
);

create index if not exists notification_prefs_turn_idx
  on public.notification_prefs (last_processed_at nulls first, user_id)
  where push_enabled or email_enabled;

create unique index if not exists notification_prefs_unsubscribe_idx
  on public.notification_prefs (unsubscribe_token_hash)
  where unsubscribe_token_hash is not null;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null unique check (char_length(endpoint) <= 1024),
  p256dh text not null check (char_length(p256dh) <= 128),
  auth text not null check (char_length(auth) <= 64),
  failure_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_idx
  on public.push_subscriptions (user_id, created_at desc);

-- One row per sent notification. The unique key is the claim taken before sending.
create table if not exists public.notification_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('matchday', 'human_round', 'offer', 'challenge', 'test')),
  ref text not null check (char_length(ref) <= 120),
  channel text not null check (channel in ('push', 'email')),
  sent_at timestamptz not null default now(),
  constraint notification_log_claim unique (user_id, kind, ref, channel)
);

create index if not exists notification_log_user_sent_idx
  on public.notification_log (user_id, sent_at desc);

create index if not exists notification_log_sent_idx on public.notification_log (sent_at);

-- SHA-256 of the address that was really proven by the link. Rows confirmed before this column
-- (and the November backfill) have none, so they get no letters until the address is proven.
alter table public.manager_email_status
  add column if not exists confirmed_email_hash text;

-- VAPID pair, scheduler token and URL, and the key for unsubscribe links. Never leaves the server.
create table if not exists public.server_secrets (
  name text primary key,
  value text not null,
  created_at timestamptz not null default now()
);

alter table public.notification_prefs enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.notification_log enable row level security;
alter table public.server_secrets enable row level security;

revoke all on public.notification_prefs from public, anon, authenticated;
revoke all on public.push_subscriptions from public, anon, authenticated;
revoke all on public.notification_log from public, anon, authenticated;
revoke all on public.server_secrets from public, anon, authenticated, service_role;

grant select, insert, update, delete on public.notification_prefs to service_role;
grant select, insert, update, delete on public.push_subscriptions to service_role;
grant select, insert, update, delete on public.notification_log to service_role;
-- Insert-if-absent and read only: the server can never overwrite a key.
grant select, insert on public.server_secrets to service_role;

-- The scheduler token is born here and only the database and the server read it.
-- pgcrypto sits in schema extensions on Supabase and in public elsewhere.
do $$
declare
  v_schema text;
begin
  if exists (select 1 from public.server_secrets where name = 'notify_token') then
    return;
  end if;
  select n.nspname into v_schema
  from pg_catalog.pg_extension e
  join pg_catalog.pg_namespace n on n.oid = e.extnamespace
  where e.extname = 'pgcrypto';
  if v_schema is null then
    raise exception 'pgcrypto is missing';
  end if;
  execute format(
    'insert into public.server_secrets (name, value)
     values (''notify_token'', encode(%I.gen_random_bytes(32), ''hex''))
     on conflict (name) do nothing',
    v_schema
  );
end;
$$;
