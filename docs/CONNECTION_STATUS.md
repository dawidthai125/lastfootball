# Connection status — 2026-07-25

## GitHub — PASS

| Check           | Result                                                             |
| --------------- | ------------------------------------------------------------------ |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git`                 |
| Branch baseline | `main` @ **`a70cf81`** (LFE-ECONOMY-01 CLOSED)                     |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN (run 30133551607) |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |
| Status  | **PRODUCTION VERIFIED · GREEN**                 |
| Deploy  | Production Ready · sha `a70cf81`                |

## Supabase — PASS

| Check      | Result                                                                        |
| ---------- | ----------------------------------------------------------------------------- |
| Project    | `lastfootball` · ref **`anoeimngwptucjdugjme`**                               |
| Rebind     | LFE-INFRA-01                                                                  |
| Migrations | infra · clubs · first_match · fixtures · **`cash_balance` / finance applied** |
| RLS        | clubs + fixtures + finance_movements owner policies                           |
| Types      | `apps/web/src/types/database.ts` (cash + finance_movements)                   |
| Auth URLs  | prod + localhost allowlist                                                    |

## Product smoke (verified)

Landing → Auth gates · Hub SEASON · `/league` · `/finance` routes live · DB cash backfill 100000 · CI + Vercel — PASS (2026-07-25).  
LFE-ECONOMY-01 **CLOSED**.

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat
3. Optional: Owner spot-check zalogowany Hub chip Kasa ≡ `/finance` po meczu

## Last updated

2026-07-25 — LFE-ECONOMY-01 CLOSE
