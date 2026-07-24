# Connection status — 2026-07-24

## GitHub — PASS

| Check | Result |
| --- | --- |
| Remote `origin` | `https://github.com/dawidthai125/lastfootball.git` |
| Branch baseline | `main` @ `b6b92dc` (LFE-HUB-01) |
| CI | Format · Typecheck · Lint · Test · Build — GREEN |

## Vercel — PASS

| Check | Result |
| --- | --- |
| Project | `dawidthai125s-projects/lastfootball` |
| Live | https://lastfootball.vercel.app |
| Aliases | lastfootball.pl · www.lastfootball.pl |
| Env | Supabase URL + anon + service_role (Production) |

## Supabase — PASS

| Check | Result |
| --- | --- |
| Project | `lastfootball` · ref **`anoeimngwptucjdugjme`** |
| Rebind | LFE-INFRA-01 |
| Migrations | infra bootstrap · clubs auth/identity · **`first_match_completed_at`** |
| RLS | clubs owner policies |
| Types | `apps/web/src/types/database.ts` |
| Auth URLs | prod + localhost allowlist |

## Product smoke (verified)

Landing → Auth → Wizard → First Match → Hub EARLY_CLUB — PASS on production (2026-07-24).

## Owner remaining (ops)

1. DNS polish for custom domain if still pending at registrar
2. Rotate any secrets ever pasted in chat
3. Optional: deploy edge `health` function

## Last updated

2026-07-24 — LFE-DOCS-01
