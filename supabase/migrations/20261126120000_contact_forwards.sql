-- D144: letters to kontakt@ that were passed on. Ids only, no content, removed after 7 days.
create table if not exists public.contact_forwards (
  email_id text primary key,
  created_at timestamptz not null default now()
);

alter table public.contact_forwards enable row level security;
revoke all on public.contact_forwards from public, anon, authenticated;
grant select, insert, delete on public.contact_forwards to service_role;

notify pgrst, 'reload schema';
