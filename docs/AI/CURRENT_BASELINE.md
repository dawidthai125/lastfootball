# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Production

| Pole             | Wartość                                                                      |
| ---------------- | ---------------------------------------------------------------------------- |
| URL              | https://lastfootball.vercel.app                                              |
| Alias            | https://lastfootball.pl                                                      |
| Branch           | `main`                                                                       |
| Baseline commit  | `71ce442b386f00063bfe81458dbf2eeeb5d75945`                                   |
| Baseline message | `feat(league): implement league table derive and season hub (LFE-LEAGUE-02)` |
| Status           | **PRODUCTION VERIFIED · GREEN**                                              |
| Verified         | 2026-07-25 — CI GREEN + Vercel Ready + smoke routes `/hub` `/league`         |

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
  → Welcome LF → Hub (EARLY_CLUB → SEASON gdy fixtures)
  → Primary „Przygotuj mecz” → /match/{fixtureId} → Live → Post → completeFixture → Hub
  → /league ← resolveLeagueTable() · chip pozycji = tabela
```

## Critical SSOT columns / modules

| SSOT                 | Gdzie                                                   |
| -------------------- | ------------------------------------------------------- |
| Club identity        | `clubs` → `ClubDto`                                     |
| Hub unlock           | `clubs.first_match_completed_at`                        |
| Hub phase            | `resolveHubPhase(club, { hasFixtures })`                |
| Hub session          | `resolveHubSession(...)`                                |
| Hub Primary CTA      | `resolvePrimaryCta(phase, session, ctx)`                |
| League fixtures      | `fixtures` → `FixtureDto`                               |
| League table         | `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` |
| Squad                | `resolveClubSquad(club)`                                |
| First match session  | `createSessionFromFirstMatch(club)`                     |
| League match session | `createSessionFromLeagueFixture`                        |
| Match engine entry   | `createMatch()` → `MatchSession`                        |

## Done product EPICs (on `main`)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Club Wizard, Club DTO
- **LFE-INFRA-01** — Supabase rebind `anoeimngwptucjdugjme`
- **LFE-MATCH-01** — First Match Experience tunnel
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell unlocks
- **LFE-DOCS-01** — docs consolidation
- **LFE-LEAGUE-01** Thin A — **CLOSED** · fixtures + next match CTA + squad SSOT
- **LFE-LEAGUE-02** — **CLOSED** · `resolveLeagueTable` · Hub `SEASON` (S1) · `/league` · position chip

## Not on production (do not assume)

- Full 11-fixture calendar / standings DB
- Economy / transfers / scouting systems
- Mid-season Hub dashboard FOMO (decision layout retained)
- Physics / full rules

## Last updated

2026-07-25 — LFE-LEAGUE-02 CLOSE · baseline `71ce442`
