# Connection status — 2026-07-22 (updated)

## GitHub — PASS

| Check           | Result                                             |
| --------------- | -------------------------------------------------- |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git` |
| Branches        | `main`, `develop`                                  |
| Protection      | CI required                                        |
| CI / Release    | active                                             |

## Vercel — PASS (custom DNS pending)

| Check                        | Result                                                                      |
| ---------------------------- | --------------------------------------------------------------------------- |
| Project                      | `dawidthai125s-projects/lastfootball`                                       |
| Live                         | https://lastfootball.vercel.app                                             |
| Env                          | telemetry, app URL, **Supabase URL + anon + service_role** (prod + preview) |
| Domain `www.lastfootball.pl` | Verified in Vercel; **DNS still NXDOMAIN** at registrar                     |

## Supabase — PASS

| Check              | Result                                                             |
| ------------------ | ------------------------------------------------------------------ |
| Project            | `lastfootball` · ref `ewgllyswhtlkdtiqsqrt` · Stockholm            |
| Link               | `supabase link` done                                               |
| Migrations         | `20260722000000_infra_bootstrap.sql` pushed                        |
| `infra_meta`       | row `bootstrap=ready` (service_role verified)                      |
| RLS                | enabled on `infra_meta`                                            |
| Types              | `apps/web/src/types/database.ts`                                   |
| Clients            | typed `Database` (browser / server / admin)                        |
| Auth URLs          | site `https://lastfootball.vercel.app` + allowlist localhost / www |
| Edge               | stub `supabase/functions/health` (not deployed yet)                |
| Storage / Realtime | enabled in project config                                          |

## CI/CD — PASS

GitHub Actions + Vercel Git Preview/Production.

## Owner remaining

1. DNS for `lastfootball.pl` (A `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com`)
2. Rotate secrets exposed in chat (access token + API keys) after smoke OK
3. Optional: `npx supabase functions deploy health`
