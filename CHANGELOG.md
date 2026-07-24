# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Docs (LFE-ECONOMY-01 CLOSE — awaiting Owner GO docs commit)

- Status / baseline sync: LFE-ECONOMY-01 CLOSED · prod `a70cf81`

### Added (shipped on `main` — LFE-ECONOMY-01)

- Club cash SSOT (`clubs.cash_balance`) + `finance_movements` ledger
- `resolveClubFinance()` → `ClubFinanceDto` (sole UI contract)
- Seed on club create; match reward on first `completeFixture` → `played`
- `/finance` without mocks; Finanse unlock + Hub cash chip on `SEASON`
- Temporary Thin constants pending GDD §26 (`ECONOMY_THIN`)

### Added (shipped on `main` — LFE-LEAGUE-02)

- League table pure derive (`resolveLeagueTable` → `LeagueTableDto`)
- Hub phase `SEASON` (S1) + Nav Liga unlock + position chip
- `/league` fed exclusively by resolver (no standings DB / mock)

### Added (shipped on `main` — LFE-LEAGUE-01)

- Fixtures SSOT (`fixtures` table + RLS + `opponent_club_id`)
- Next-match Hub Primary CTA + Match Pipeline reuse + `completeFixture`
- Squad SSOT (`resolveClubSquad`) replacing product use of `@/data/squad`

> Pełna chronologia: [`docs/CHANGELOG.md`](./docs/CHANGELOG.md).

## [0.1.0] - 2026-07-23

### Added

- Public UI baseline (LFE-UI-IMPL-01…05): App Shell, Design Tokens, Panel, Kadra, Zawodnik, Terminarz, Pre Match, Live Match foundation
- IA navigation map and stub routes for remaining club modules
- Verification captures under `docs/verification/`

### Notes (0.1.0 baseline)

- W momencie tagu 0.1.0: brak pełnego Canvas/post-match w tym wpisie Keep-a-Changelog.
- **Aktualnie na `main`:** Canvas · Replay · Post Match · Live Bridge · Player Match Data — patrz `docs/CHANGELOG.md` / `docs/AI-HANDOFF.md`.

## [0.0.1] - 2026-07-21

### Added

- Foundation monorepo: Next.js 15 app, `@lastfootball/lfe`, `@lastfootball/domain`
- Engine status page (`/status`)
- Baseline CI (format, typecheck, lint, build)
- Vercel region `fra1` config
- Supabase client stubs
