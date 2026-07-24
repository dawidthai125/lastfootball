# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Production

| Pole             | Wartość                                                                   |
| ---------------- | ------------------------------------------------------------------------- |
| URL              | https://lastfootball.vercel.app                                           |
| Alias            | https://lastfootball.pl                                                   |
| Branch           | `main`                                                                    |
| Baseline commit  | `b5b64a34130a472628ca8305ef9151139114588d`                                |
| Baseline message | `feat(league): add fixtures SSOT and next-match Hub loop (LFE-LEAGUE-01)` |
| Status           | **PRODUCTION VERIFIED · GREEN**                                           |
| Verified         | 2026-07-24 — CI GREEN + Vercel Ready + migracja `fixtures` + smoke        |

> Zawsze potwierdź lokalnie: `git log -1 --oneline` (może być nowszy commit docs-only po CLOSE).

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (project ref `anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Register/Login → Welcome → Club Wizard → Reveal
  → First Match Intro → Prematch (/match/first) → Live → Post Match
  → Welcome LF → Hub EARLY_CLUB
  → Primary „Przygotuj mecz” → /match/{fixtureId} → Live → Post → completeFixture → Hub
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

## Done product EPICs (on `main`)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Club Wizard, Club DTO
- **LFE-INFRA-01** — Supabase rebind `anoeimngwptucjdugjme`
- **LFE-MATCH-01** — First Match Experience tunnel
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell unlocks
- **LFE-DOCS-01** — docs consolidation
- **LFE-LEAGUE-01** Thin A — **CLOSED** · fixtures + next match CTA + squad SSOT

## Not on production (do not assume)

- Live league table / Hub phase `SEASON`
- Economy / transfers / scouting systems
- Mid-season Hub dashboard (removed from EARLY_CLUB)
- Physics / full rules

## Last updated

2026-07-24 — LFE-LEAGUE-01 CLOSE · baseline `b5b64a3`
