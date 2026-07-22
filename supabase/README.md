# Supabase — Last Football

## Services (planned)

| Service        | Status                   | Notes                                          |
| -------------- | ------------------------ | ---------------------------------------------- |
| Auth           | Prepared (`config.toml`) | Email auth first; OAuth later                  |
| Postgres       | Bootstrap migration only | `infra_meta` + RLS enabled                     |
| Storage        | Enabled in config        | Buckets created in Epic+ (avatars, club media) |
| Realtime       | Enabled in config        | Match events / presence later                  |
| Edge Functions | Stub `health`            | No business functions yet                      |

## RLS strategy (SSOT)

1. **Default deny** — RLS on for every table with user data
2. **Policies explicit** — per operation, least privilege
3. **Ownership** — `auth.uid()` / membership joins; never trust body `user_id` alone
4. **Service role** — server/cron/edge only; never `NEXT_PUBLIC_`
5. **Public data** — separate policies or `SECURITY DEFINER` RPCs

See migration: `migrations/20260722000000_infra_bootstrap.sql`

## Local

```bash
npx supabase start
npx supabase db reset   # applies migrations + seed
```

## Remote

1. Create project in Supabase Dashboard (EU preferred — align with Vercel `fra1`)
2. `npx supabase link --project-ref <ref>`
3. `npx supabase db push`
4. Copy URL + anon key to Vercel / `.env.local`
