# Connection status — 2026-07-25

## GitHub — PASS

| Check           | Result                                                             |
| --------------- | ------------------------------------------------------------------ |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git`                 |
| Branch baseline | `main` @ **`0b960b5`** (LFE-PLAYERS-01 CLOSED; tip may be newer)   |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN (run 30136733629) |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |
| Status  | **PRODUCTION VERIFIED · GREEN**                 |
| Deploy  | Production Ready · sha `0b960b5` / `d43fa3d`    |

## Supabase — PASS

| Check      | Result                                                                              |
| ---------- | ----------------------------------------------------------------------------------- |
| Project    | `lastfootball` · ref **`anoeimngwptucjdugjme`**                                     |
| Rebind     | LFE-INFRA-01                                                                        |
| Migrations | infra · clubs · first_match · fixtures · cash/finance · **`players` applied**       |
| RLS        | clubs + fixtures + finance_movements + **players** owner policies                   |
| Types      | `apps/web/src/types/database.ts` (may lag `players` — inserts use cast until regen) |
| Auth URLs  | prod + localhost allowlist                                                          |

## Product smoke (verified)

Landing → Auth gates · Hub SEASON · `/league` · `/finance` · `/squad` · First Match/liga XI z DB · CI — PASS (2026-07-25).  
LFE-PLAYERS-01 **CLOSED**.

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat
3. Optional: regen Supabase `Database` types to include `players`

## Last updated

2026-07-25 — LFE-PLAYERS-01 CLOSE
