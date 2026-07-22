# Infrastructure

## Overview

```
GitHub (main / develop)
    │
    ├─ GitHub Actions CI  → format, typecheck, lint, test, build, secret scan
    │
    └─ Vercel
           ├─ Production  ← main   (fra1)
           └─ Preview     ← PRs / develop
                  │
                  └─ Supabase (Auth, Postgres+RLS, Storage, Realtime, Edge)
```

## Components

| Layer          | Tool                    | Config                       |
| -------------- | ----------------------- | ---------------------------- |
| App            | Next.js 15 (`apps/web`) | `next.config.ts`             |
| Engine package | `@lastfootball/lfe`     | `packages/lfe`               |
| Domain DTOs    | `@lastfootball/domain`  | `packages/domain`            |
| Hosting        | Vercel                  | `vercel.json`                |
| DB / Auth      | Supabase                | `supabase/`                  |
| CI             | GitHub Actions          | `.github/workflows/`         |
| Env contract   | Zod                     | `apps/web/src/config/env.ts` |

## Environments

| Name       | Branch   | URL                     | Supabase                            |
| ---------- | -------- | ----------------------- | ----------------------------------- |
| Local      | —        | `http://localhost:3000` | local CLI or remote dev project     |
| Preview    | non-main | `*.vercel.app`          | shared preview project or branch DB |
| Production | `main`   | custom domain           | production project                  |

## Rate limiting (plan — not implemented yet)

| Surface              | Approach (Epic+)                             |
| -------------------- | -------------------------------------------- |
| Auth endpoints       | Supabase built-in + dashboard rate limits    |
| Server Actions / API | Vercel Firewall / Upstash Redis token bucket |
| Match finalize       | per-user + per-match idempotency keys        |
| Edge Functions       | Supabase + custom limits                     |

Until then: rely on platform defaults; no public mutation APIs in foundation.

## Observability (later)

- Vercel Analytics / Speed Insights (optional)
- Supabase logs + Auth logs
- Sentry (optional Epic+)

## Ownership boundaries

- **LFE** — no network, no secrets
- **Web** — only place for Supabase clients + headers
- **Migrations** — only place for schema/RLS SSOT
