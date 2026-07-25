# Connection status — 2026-07-25

## GitHub — PASS

| Check           | Result                                                               |
| --------------- | -------------------------------------------------------------------- |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git`                   |
| Branch baseline | `main` @ **`393a43c`** (LFE-TRANSFERS-01 CLOSED; tip may be newer)   |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN (run 30148581783)   |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |
| Status  | **PRODUCTION VERIFIED · GREEN**                 |
| Deploy  | Production Ready · sha `393a43c` / `7c0ce7f`    |

## Supabase — PASS

| Check      | Result                                                                                          |
| ---------- | ----------------------------------------------------------------------------------------------- |
| Project    | `lastfootball` · ref **`anoeimngwptucjdugjme`**                                                 |
| Rebind     | LFE-INFRA-01                                                                                    |
| Migrations | … · players · **`20260725040000_transfers_thin` applied**                                       |
| RLS        | clubs + fixtures + finance_movements + players + **transfer_deals** owner policies              |
| Types      | `apps/web/src/types/database.ts` includes players / transfer_deals / `transfer_window_open`     |
| Auth URLs  | prod + localhost allowlist                                                                      |

## Product smoke (verified)

Landing → Auth · Hub SEASON · `/league` · `/finance` · `/squad` · `/transfers` (window) · CI — PASS (2026-07-25).  
LFE-TRANSFERS-01 **CLOSED**.

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat

## Last updated

2026-07-25 — LFE-TRANSFERS-01 CLOSE
