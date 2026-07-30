# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Docs (LFE-SCOUTING-01 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · Domain tip `93fd6d5` · next **LFE-DAILY-01 READY FOR AUDIT**
- Kontrakt: `scout_shortlist` = wyłącznie `(club_id, player_id)` → `players.id`; shortlista bez wpływu na AI/rynek/transfery/potencjał/symulację

### Added (shipped on `main` — LFE-SCOUTING-01)

- `resolveClubScouting` · `scout_shortlist` · `/scouting` UI · REUSE market + potential · private shortlist

### Docs (GDD-22 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · tip `f871ca8` · content `09b85e7` · next **LFE-SCOUTING-01 READY FOR AUDIT**

### Docs (GDD-21 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · tip `c24efef` · content `bf07a44` · next **GDD-22 READY FOR AUDIT**

### Docs (LFE-ACADEMY-01 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · D23 · tip Domain `9c6fe86` · next **M2.5**

### Added (shipped on `main` — LFE-ACADEMY-01)

- `academy_track` / `promoted_at` · `resolveClubAcademy` · Intake/Promote · `/academy` UI · senior filters

### Docs (GDD-19 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · tip `2c619ca` · next EPIC = **GDD-21 READY FOR AUDIT**

### Docs (GDD-18 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · tip `4dedd71` · next EPIC = **GDD-19 READY FOR AUDIT**

### Docs (LFE-UI-MOTION-01 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · presentation tip `9fd14fc` · next EPIC = GDD-17+

### Added (shipped on `main` — LFE-UI-MOTION-01)

- Shared `motion.css` · Hub enter/press · Match Goal/Final overlay · Guide §8

### Docs (GDD-17 CLOSE)

- Sync HANDOFF · CURRENT_BASELINE · PROJECT_STATUS · ROADMAP · tip `2595cc9` · next EPIC = LFE-UI-MOTION-01 / GDD-17+

### Docs (GDD-16 FIX CLOSE)

- Prettier GDD §16 / ROADMAP · sync HANDOFF · tip `4805f7e` · next EPIC = GDD-17

### Docs (LFE-PLAYERS-02 CLOSE)

- Sync D22 · PLAYERS.md · TRAINING.md · ROADMAP · CURRENT_BASELINE · PROJECT_STATUS · HANDOFF · CHANGELOG
- Domain feature baseline → `cd222ba` (Player Development Thin)
- Documentation tip → `fa0848b` (superseded by GDD-16 tip `4805f7e`)
- Operacyjne: migracja `players.potential` + RPC `apply_match_development` na prod

### Added (shipped on `main` — LFE-PLAYERS-02)

- `players.potential` SSOT (wariant B: max(skill, seeded)); UI pasma only
- Match development PRIMARY: +1 · K_MATCH=5 · starters · atomic RPC `apply_match_development`
- Training-02 ceiling vs potential; age hook only (no auto age++)
- Transfer fee unchanged (`deriveTransferFee(skill, age)`)

### Docs (LFE-TRAINING-02 CLOSE)

- Sync D21 · TRAINING.md · ROADMAP · CURRENT_BASELINE · PROJECT_STATUS · HANDOFF · CHANGELOG
- Domain feature baseline → `5e6c2ad` (Training Depth)
- Operacyjne: Migracja Supabase RPC `complete_training_session` musi zostać zastosowana na środowisku produkcyjnym

### Added (shipped on `main` — LFE-TRAINING-02)

- Training Depth: skill progression Thin on `players.skill` (anti-farm: +1 / K=3 / ceiling ≥85 high-only)
- Atomic RPC `complete_training_session` (status + skill + `last_training_on`)
- XI Gate: INJURED/SUSPENDED hard block; TIRED warning ≥4; kick-off hard fail (no LFE coupling)
- Session feedback: trained · tired · regenerated · +skill

### Docs (LFE-HANDOFF-01)

- Master handoff AI: `docs/AI/PROJECT_HANDOFF.md` (15 sekcji · cold start &lt; 5 min)
- Sync baseline / status / roadmap / EPIC index / README / AGENTS po Landing · Branding · Auth UX
- Presentation tip pinned: `9dc834a` (LFE-AUTH-UX-01); Production UI P0 `54d0724`; Domain TRANSFERS-08 (superseded by TRAINING-02)

### Added (shipped on `main` — LFE-AUTH-UX-01)

- Auth UX redesign: Login Modal na Landing (blur · ESC · outside · focus trap)
- Premium marketing header (wyższy · większe logo · mocniejsze CTA Zaloguj)
- `/login` i `/register` jako AuthStage z Tunnel hero — spójne z Landing / Night Pitch Office
- Presentation-only: bez zmian logiki auth · tokenów · World Art · brandingu

### Added (shipped on `main` — LFE-BRANDING-01B)

- Brand refresh K1+K3: geometryczny monogram LF + wordmark `LASTFOOTBALL` (bez spacji)
- Pełny pakiet logo: `logo*.svg`, `monogram.svg`, `favicon.svg/.ico`, `apple-touch-icon.png`, `icon-192.png`, `icon-512.png`, `social-preview.png`
- Wdrożenie brandingu w Landing/Header/Auth/Hub/Nav + metadata (`icons`, OpenGraph, Twitter) + `manifest.ts`
- Usunięcie legacy „złotego CSS-kwadratu” z chrome marketingowego

### Docs (AI-DOCS-SYNC-01)

- ROADMAP / CHANGELOG sync: UI Evolution 01–02 · DOCS-UX-03
- CURRENT_BASELINE documentation tip `4a0b3ee` (feature hash unchanged)
- PROJECT_STATUS = canonical project status; handoff aliases

### Docs (LFE-DOCS-UX-03)

- UI Presentation Contract in `UI_DESIGN_GUIDE` §16; postmortem REFERENCE
- HUB daily-loop docs sync; AI Presentation Pattern

### Docs (LFE-UI-EVOLUTION-01 / 02)

- Decision-first Hub → Finance screens; daily manager loop (presentation only)

### Docs (AI-DOCS-CONSOLIDATION-02)

- AI Quick Start · Module Map · EPIC Index · Transfer Architecture
- Stale baseline pointers synced to CURRENT_BASELINE (feature hash unchanged: 9b1c575)

### Added (shipped on `main` — LFE-TRANSFERS-08)

- Live H2H Counter Offers: 1× seller→buyer; Accept after Counter = buyer
- `opening_amount` immutable; settle @ `current_amount` only; Counter RPC FOR UPDATE
- No escrow / timeout / AI H2H / completeLiveTransfer()

### Added (shipped on `main` — LFE-TRANSFERS-07)

- Live H2H Pending Offers: `transfer_offers`; Create / Accept / Reject / Withdraw
- Instant Buy (06) parallel; Accept/Instant/Unlist supersede pending in same TX
- Settlement only via `completeTransferBuy` / `completeTransferSell`; no escrow / timeout / AI pending

### Added (shipped on `main` — LFE-TRANSFERS-04)

- Player transfer listing: `players.transfer_listed_at`; List/Unlist idempotent
- Incoming offers only for listed players; shared `isTransferSellEligible`
- `completeTransferSell` clears listing; ask = deriveTransferFee only

### Added (shipped on `main` — LFE-TRANSFERS-03)

- Derived AI incoming offers Thin: `resolveIncomingOffers` (pure; 100% ask; Accept/Reject)
- Accept settles via `completeTransferSell` only; no migrations / pending / inbox
- Stable offer ids `in-{clubTag}-{playerId}`

### Added (shipped on `main` — LFE-TRANSFERS-02-N1)

- Stateless buy negotiation Thin: `resolveNegotiationStep` (pure; Low 90% / Normal 100% / High 110%; Counter 95%)
- One counter only; no pending DB / timeouts / migrations
- `completeTransferBuy(agreedAmount)` with full revalidation vs ask + envelope
- Sell remains instant at fee

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
