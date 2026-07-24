# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Production

| Pole             | Wartość                                                   |
| ---------------- | --------------------------------------------------------- |
| URL              | https://lastfootball.vercel.app                           |
| Alias            | https://lastfootball.pl                                   |
| Branch           | `main`                                                    |
| Baseline commit  | `b6b92dce1fc9e0bf75fb48cc82a1e5ad570a327a`                |
| Baseline message | `feat(hub): rebuild EARLY_CLUB decision Hub (LFE-HUB-01)` |
| Verified         | 2026-07-24 — CI GREEN + Vercel Ready + prod smoke PASS    |

> Zawsze potwierdź lokalnie: `git log -1 --oneline` (może być nowszy commit po tym dokumencie).  
> **LFE-LEAGUE-01** jest zaimplementowany lokalnie — **nie** jest jeszcze na produkcji do Owner GO commit/push + migracja `fixtures`.

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (project ref `anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified on prod / extended locally)

```
Landing → Register/Login → Welcome → Club Wizard → Reveal
  → First Match Intro → Prematch (/match/first) → Live → Post Match
  → Welcome LF → Hub EARLY_CLUB
  → (LEAGUE-01) Primary „Przygotuj mecz” → /match/{fixtureId} → Live → Post → Hub
```

## Critical SSOT columns / modules

| SSOT                 | Gdzie                                    |
| -------------------- | ---------------------------------------- |
| Club identity        | `clubs` → `ClubDto`                      |
| Hub unlock           | `clubs.first_match_completed_at`         |
| Hub phase            | `resolveHubPhase(club)`                  |
| Hub session          | `resolveHubSession(...)`                 |
| Hub Primary CTA      | `resolvePrimaryCta(phase, session, ctx)` |
| League fixtures      | `fixtures` → `FixtureDto`                |
| Squad                | `resolveClubSquad(club)`                 |
| First match session  | `createSessionFromFirstMatch(club)`      |
| League match session | `createSessionFromLeagueFixture`         |
| Match engine entry   | `createMatch()` → `MatchSession`         |

## Done product EPICs (on `main` + local LEAGUE-01)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Club Wizard, Club DTO
- **LFE-INFRA-01** — Supabase rebind `anoeimngwptucjdugjme`
- **LFE-MATCH-01** — First Match Experience tunnel
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell unlocks
- **LFE-DOCS-01** — docs consolidation
- **LFE-LEAGUE-01** Thin A — fixtures + next match CTA + squad SSOT (awaiting push)

## Not on production (do not assume)

- Live league table / SEASON Hub phase
- Economy / transfers / scouting systems
- Mid-season Hub dashboard (removed from EARLY_CLUB)
- Physics / full rules

## Last updated

2026-07-24 — LFE-LEAGUE-01 · prod baseline still `b6b92dc` until GO PUSH
