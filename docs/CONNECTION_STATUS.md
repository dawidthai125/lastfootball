# Connection status — 2026-07-25

## GitHub — PASS

| Check           | Result                                                             |
| --------------- | ------------------------------------------------------------------ |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git`                 |
| Branch baseline | `main` @ **`71ce442`** (LFE-LEAGUE-02 CLOSED)                      |
| CI              | Format · Typecheck · Lint · Test · Build — GREEN (run 30131256323) |

## Vercel — PASS

| Check   | Result                                          |
| ------- | ----------------------------------------------- |
| Project | `dawidthai125s-projects/lastfootball`           |
| Live    | https://lastfootball.vercel.app                 |
| Aliases | lastfootball.pl · www.lastfootball.pl           |
| Env     | Supabase URL + anon + service_role (Production) |
| Status  | **PRODUCTION VERIFIED · GREEN**                 |
| Deploy  | `dpl_4LjfkBA565U8m7EuqvjpQp7kgFpq` · sha `71ce442` · Ready |

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

Landing → Auth gates · First Match path · Hub SEASON · Primary next match · `/league` route live · CI + Vercel — PASS (2026-07-25).  
LFE-LEAGUE-02 **CLOSED**.

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat
3. Optional: Owner spot-check zalogowanego Hub SEASON → chip ≡ tabela → Liga

## Last updated

2026-07-25 — LFE-LEAGUE-02 CLOSE
