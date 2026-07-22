# Security

## Current controls (foundation)

| Control                | Implementation                                    |
| ---------------------- | ------------------------------------------------- |
| Secrets in git         | `.gitignore` + CI basic scan                      |
| Env validation         | Zod (`config/env.ts`)                             |
| Security headers       | `vercel.json` + `next.config.ts`                  |
| CSP                    | Next config (tighten per Epic)                    |
| `X-Powered-By`         | Disabled                                          |
| RLS                    | Enabled on `infra_meta`; strategy documented      |
| Service role isolation | `admin.ts` server-only; no `NEXT_PUBLIC_`         |
| Auth flow              | Prepared in Supabase config; UI/callback in Epic+ |

## CORS

- Browser app talks to same-origin Next.js and Supabase HTTPS APIs
- No custom public REST CORS surface in foundation
- When Edge Functions / API routes are added: explicit allowlist of app origins only

## Auth flow (planned)

1. Supabase Auth (email magic link / password)
2. Next.js route `/auth/callback` exchanges code (SSR cookies via `@supabase/ssr`)
3. Middleware refreshes session on protected `(game)` routes
4. RLS enforces row access; Server Actions re-check session

Not implemented in this bootstrap (no game UI).

## Rate limiting (plan)

See `docs/INFRASTRUCTURE.md`. Priority when first mutation APIs ship.

## Checklist before production traffic

- [ ] Branch protection on `main`
- [ ] Supabase production project + migrations applied
- [ ] Vercel envs set (no service role in public)
- [ ] Auth site URL + redirects match domain
- [ ] CSP reviewed after adding third-party scripts
- [ ] Dependabot / secret scanning enabled on GitHub
