# Connection status — 2026-07-24

## GitHub — PASS

| Check           | Result                                             |
| --------------- | -------------------------------------------------- |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git` |
| Branch baseline | `main` @ `b6b92dc` (LFE-HUB-01)                    |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN   |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |

## Supabase — PASS

| Check      | Result                                                                                 |
| ---------- | -------------------------------------------------------------------------------------- |
| Project    | `lastfootball` · ref **`anoeimngwptucjdugjme`**                                        |
| Rebind     | LFE-INFRA-01                                                                           |
| Migrations | infra · clubs · first_match · **`fixtures` (LFE-LEAGUE-01 — apply before prod smoke)** |
| RLS        | clubs + fixtures owner policies                                                        |
| Types      | `apps/web/src/types/database.ts` (includes `fixtures`)                                 |
| Auth URLs  | prod + localhost allowlist                                                             |

## Product smoke (verified)

Landing → Auth → Wizard → First Match → Hub EARLY_CLUB — PASS on production (2026-07-24).  
**LEAGUE-01 path** (Hub → league match → complete → Hub): wymaga migracji `fixtures` + deploy.

## Owner remaining (ops)

1. Apply `supabase/migrations/20260724230000_fixtures_ssot.sql` to project `anoeimngwptucjdugjme`
2. GO COMMIT / PUSH LFE-LEAGUE-01
3. DNS polish for custom domain if still pending at registrar
4. Rotate any secrets ever pasted in chat

## Last updated

2026-07-24 — LFE-LEAGUE-01
