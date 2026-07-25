# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Docs (LFE-TRAINING-01 CLOSE)

- Status / baseline sync: LFE-TRAINING-01 CLOSED · prod `10de062` · D21 · `platform/TRAINING.md`

### Added (shipped on `main` — LFE-TRAINING-01)

- Team training Thin Slice: `resolveClubTraining()` sole UI contract; no training mocks
- `clubs.last_training_on` SSOT (UTC date); 1 session / calendar day
- Status-only effects on `players` (no skill / roster size changes); no LFE changes
- Shared played unlock helper (`hasPlayedUnlock`) reused by Transfers ensure
- Nav Training open on SEASON when played ≥ 2

### Docs (AI-DOCS-HYGIENE-01)

- Documentation hygiene: principles, patterns, engineering guide, split platform docs, unified workflow (+CI), README sync

### Added (shipped on `main` — LFE-TRANSFERS-01)

- Transfer Thin Slice: `resolveTransferMarket()` sole UI contract; no market mocks
- `clubs.transfer_window_open` SSOT; unlock after 2 played fixtures (Thin vs GDD K11)
- Atomic buy/sell on `players` + `cash_balance` + `finance_movements` + `transfer_deals`
- Buy ids `t-{tag}-…`; sell = `DEPARTED` + `departed_at` (no delete); fee = derive
- Catalogue via `seedTransferCatalogue()`; cash-only (no envelope / negotiation)

### Docs (LFE-PLAYERS-01 CLOSE)

- Status / baseline sync: LFE-PLAYERS-01 CLOSED · prod `0b960b5` · D19

### Added (shipped on `main` — LFE-PLAYERS-01)

- Club roster SSOT (`players` table) + RLS + starter backfill
- `resolveClubSquad(club, rows)` → `SquadDto` (sole UI contract; no runtime seed fallback)
- Deterministic ids `s-{tag}-…`; `version` default `1`; status `READY|INJURED|SUSPENDED|TIRED`
- Seed only for create/backfill/tests; AI bots via `seedBotSquad` / `seedOpponentSquad`
- First Match + league XI from DB; `/squad` + `/players/[id]` from resolver

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

- Initial monorepo scaffold
