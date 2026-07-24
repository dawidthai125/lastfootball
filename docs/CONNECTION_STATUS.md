# Connection status — 2026-07-24

## GitHub — PASS

| Check           | Result                                                             |
| --------------- | ------------------------------------------------------------------ |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git`                 |
| Branch baseline | `main` @ **`b5b64a3`** (LFE-LEAGUE-01 CLOSED)                      |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN (run 30129165236) |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |
| Status  | **PRODUCTION VERIFIED · GREEN**                 |

## Supabase — PASS

| Check      | Result                                                 |
| ---------- | ------------------------------------------------------ |
| Project    | `lastfootball` · ref **`anoeimngwptucjdugjme`**        |
| Rebind     | LFE-INFRA-01                                           |
| Migrations | infra · clubs · first_match · **`fixtures` applied**   |
| RLS        | clubs + fixtures owner policies                        |
| Types      | `apps/web/src/types/database.ts` (includes `fixtures`) |
| Auth URLs  | prod + localhost allowlist                             |

## Product smoke (verified)

Landing → Auth gates · First Match path · Hub EARLY_CLUB · fixtures SSOT + completeFixture promote — PASS (2026-07-24).  
LFE-LEAGUE-01 **CLOSED**.

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat
3. Optional: Owner spot-check zalogowanego Hub → mecz #2 w UI

## Last updated

2026-07-24 — LFE-LEAGUE-01 CLOSE
