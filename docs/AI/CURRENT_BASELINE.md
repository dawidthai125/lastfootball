# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Production

| Pole             | Wartość                                                                             |
| ---------------- | ----------------------------------------------------------------------------------- |
| URL              | https://lastfootball.vercel.app                                                     |
| Alias            | https://lastfootball.pl                                                             |
| Branch           | `main`                                                                              |
| Baseline commit  | `393a43c3ce884fbfa123891802841f4b7d60ffbc`                                          |
| Baseline message | `feat(transfers): implement Thin Slice transfer market (LFE-TRANSFERS-01)`          |
| Status           | **PRODUCTION VERIFIED · GREEN**                                                     |
| Verified         | 2026-07-25 — CI GREEN (feat + prettier `7c0ce7f`) + migracja transfers Thin applied |

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
  → Primary „Przygotuj mecz” → /match/{fixtureId} → Live → Post (+ linia nagrody) → completeFixture → Hub
  → /league ← resolveLeagueTable() · chip pozycji
  → /finance ← resolveClubFinance() · chip kasy (SEASON)
  → /squad ← resolveClubSquad(rows from players) · /players/{id}
  → /transfers ← resolveTransferMarket() gdy transfer_window_open (po 2 played)
```

## Critical SSOT columns / modules

| SSOT                 | Gdzie                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Club identity        | `clubs` → `ClubDto`                                               |
| Hub unlock           | `clubs.first_match_completed_at`                                  |
| Hub phase            | `resolveHubPhase(club, { hasFixtures })`                          |
| Hub session          | `resolveHubSession(...)`                                          |
| Hub Primary CTA      | `resolvePrimaryCta(phase, session, ctx)`                          |
| League fixtures      | `fixtures` → `FixtureDto`                                         |
| League table         | `resolveLeagueTable(club, fixtures)` → `LeagueTableDto`           |
| Club cash            | `clubs.cash_balance`                                              |
| Finance history      | `finance_movements`                                               |
| Finance UI           | `resolveClubFinance(...)` → `ClubFinanceDto` (jedyny kontrakt UI) |
| Club roster          | `players` (ids `s-{tag}-…` / buy `t-{tag}-…`, `version=1`)        |
| Squad UI             | `resolveClubSquad(club, rows)` → `SquadDto` (jedyny kontrakt UI)  |
| Transfer window      | `clubs.transfer_window_open`                                      |
| Transfer market UI   | `resolveTransferMarket(...)` → `TransferMarketDto` (jedyny)       |
| Transfer deals       | `transfer_deals` (idempotency + audit, `completed_at`)            |
| First match session  | `createSessionFromFirstMatch(club, ourXi)`                        |
| League match session | `createSessionFromLeagueFixture(club, fixture, ourXi)`            |
| Match engine entry   | `createMatch()` → `MatchSession`                                  |

## Done product EPICs (on `main`)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Club Wizard, Club DTO
- **LFE-INFRA-01** — Supabase rebind `anoeimngwptucjdugjme`
- **LFE-MATCH-01** — First Match Experience tunnel
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell unlocks
- **LFE-DOCS-01** — docs consolidation
- **LFE-LEAGUE-01** Thin A — **CLOSED** · fixtures + next match CTA
- **LFE-LEAGUE-02** — **CLOSED** · `resolveLeagueTable` · Hub `SEASON` (S1) · `/league` · position chip
- **LFE-ECONOMY-01** — **CLOSED** · Finance Thin Slice · `cash_balance` · `finance_movements` · `resolveClubFinance`
- **LFE-PLAYERS-01** — **CLOSED** · `players` SSOT · `resolveClubSquad` · D19
- **LFE-TRANSFERS-01** — **CLOSED** · Transfer Thin · `resolveTransferMarket` · D20

## Not on production (do not assume)

- Full 11-fixture calendar / standings DB
- Pensje · bilety · sponsorzy · transfer **envelope** · negotiation
- Edycja XI · `potential` · Training / player development formulas
- GDD §26 balance numbers (Thin constants are temporary — see D18 / D20)
- Mid-season Hub dashboard FOMO (decision layout retained)
- Physics / full rules

## Last updated

2026-07-25 — LFE-TRANSFERS-01 CLOSE · baseline `393a43c`
