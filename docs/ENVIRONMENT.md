# Environment

## Files

| File                    | Committed? | Purpose                      |
| ----------------------- | ---------- | ---------------------------- |
| `.env.example`          | yes        | SSOT contract (documented)   |
| `apps/web/.env.example` | yes        | App-local template           |
| `apps/web/.env.local`   | **no**     | Local overrides (gitignored) |
| Vercel Project Envs     | dashboard  | Preview + Production         |

## Validation

Runtime validation: `apps/web/src/config/env.ts` (Zod).

Rules:

- Empty strings treated as unset
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` must both be set or both omitted
- `SUPABASE_SERVICE_ROLE_KEY` and `CRON_SECRET` are server-only
- Invalid config throws at import time (fail fast)

## Variable reference

| Name                            | Public?       | Required prod?      | Description                              |
| ------------------------------- | ------------- | ------------------- | ---------------------------------------- |
| `NEXT_PUBLIC_APP_URL`           | yes           | recommended         | Canonical app URL                        |
| `NEXT_PUBLIC_SUPABASE_URL`      | yes           | yes (when using SB) | Supabase API URL                         |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes           | yes (when using SB) | Anon key (RLS applies)                   |
| `SUPABASE_SERVICE_ROLE_KEY`     | **no**        | for admin/cron      | Bypasses RLS                             |
| `CRON_SECRET`                   | **no**        | when cron exists    | Authorize cron routes                    |
| `NEXT_TELEMETRY_DISABLED`       | yes           | optional            | `1` recommended                          |
| `VERCEL_ENV`                    | set by Vercel | —                   | `production` / `preview` / `development` |

## Secrets policy

1. Never commit `.env`, `.env.local`, keys, PEMs
2. Never prefix service role with `NEXT_PUBLIC_`
3. Rotate keys if leaked
4. CI runs a basic `git grep` secret scan
5. Prefer Vercel/GitHub encrypted secrets for automation

## Local setup

```bash
cp .env.example apps/web/.env.local
# edit values, or leave Supabase empty for status-only local work
npm run dev
```
