-- Seed data for local/dev. No production secrets.
-- Business seeds arrive in later epics.

insert into public.infra_meta (key, value)
values ('environment', 'local')
on conflict (key) do update set value = excluded.value, updated_at = now();
