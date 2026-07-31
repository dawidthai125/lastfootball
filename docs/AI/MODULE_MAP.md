# AI — Module Map

## Cel

Mapa katalogów i relacji modułów — „gdzie szukać kodu”.

## Kiedy czytać

Przed IMPLEMENT / AUDIT nowego obszaru; onboarding developera.

## Powiązane

[`AI_QUICK_START.md`](./AI_QUICK_START.md) · [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md) · [`../PROJECT_STRUCTURE.md`](../PROJECT_STRUCTURE.md) · [`../architecture/DEPENDENCIES.md`](../architecture/DEPENDENCIES.md)

## Monorepo

```
lastfootball/
├── apps/web/          # Next.js 15 — platform UI + match pipeline
├── packages/lfe/      # Headless match engine (PUBLIC API frozen)
├── packages/domain/   # Shared domain (thin)
├── supabase/          # Migrations + Edge Functions
└── docs/              # SSOT dokumentacji
```

## `apps/web` — domeny platformy

| Domenа        | Resolver UI (SSOT)                                                   | Kod (głównie)                    | Docs                                                                                                                     |
| ------------- | -------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Hub           | `resolveHubPhase` / `resolvePrimaryCta` / **`resolveClubDailyGoal`** | `lib/hub/`                       | [`platform/HUB.md`](../platform/HUB.md) · D25                                                                            |
| Osiągnięcia   | **`resolveClubAchievements`**                                        | `lib/achievements/`              | GDD §19 · D26                                                                                                            |
| Ranking       | **`resolveClubRanking`**                                             | `lib/ranking/`                   | GDD §18 · D27 · input = `resolveLeagueTable`                                                                             |
| Liga          | `resolveLeagueTable` · `resolveLeagueTierLabel` / promotion outcome  | `lib/league/` · `lib/fixtures/`  | [`platform/LEAGUE.md`](../platform/LEAGUE.md) · [`GDD-PROMOTION-01`](../game-design/GDD-PROMOTION-01.md)                 |
| Finanse       | `resolveClubFinance`                                                 | `lib/finance/`                   | [`platform/FINANCE.md`](../platform/FINANCE.md)                                                                          |
| Sponsorzy     | **`resolveClubSponsors`**                                            | `lib/sponsors/`                  | [`GDD-SPONSORS-01`](../game-design/GDD-SPONSORS-01.md) · D95–D101 · ledger = finance                                     |
| Zarząd        | **`resolveClubBoard`**                                               | `lib/board/`                     | [`GDD-BOARD-01`](../game-design/GDD-BOARD-01.md) · D102–D108 · Information Thin · no persist                             |
| Kadra         | `resolveClubSquad`                                                   | `lib/squad/`                     | [`platform/PLAYERS.md`](../platform/PLAYERS.md)                                                                          |
| Akademia      | `resolveClubAcademy`                                                 | `lib/academy/`                   | [`platform/PLAYERS.md`](../platform/PLAYERS.md) (Academy Thin A)                                                         |
| Skauting      | `resolveClubScouting`                                                | `lib/scouting/`                  | [`platform/PLAYERS.md`](../platform/PLAYERS.md) (Scouting Thin B) · D24                                                  |
| Transfery     | `resolveTransferMarket`                                              | `lib/transfers/`                 | [`platform/TRANSFERS.md`](../platform/TRANSFERS.md) · [`TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md) |
| Wiadomości    | **`resolveClubMessages`**                                            | `lib/messages/`                  | [`platform/MESSAGES.md`](../platform/MESSAGES.md) · D40–D46                                                              |
| Klub (profil) | **`resolveClubProfile`**                                             | `lib/club/resolve-club-profile`  | [`platform/CLUB.md`](../platform/CLUB.md) · D47–D51                                                                      |
| Trening       | `resolveClubTraining`                                                | `lib/training/`                  | [`platform/TRAINING.md`](../platform/TRAINING.md)                                                                        |
| Auth / klub   | session + club DTO                                                   | `lib/auth/`, `lib/club/`         | [`platform/ONBOARDING_FLOW.md`](../platform/ONBOARDING_FLOW.md)                                                          |
| First Match   | tunnel + `first_match_completed_at`                                  | `lib/first-match/`               | [`platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md)                                                                  |
| Match Live UI | session bind — nie Engine                                            | `gameplay/`, `components/match/` | [`web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)                                                                |

## Relacje (skrót)

```
Hub CTA ──► /matches | /transfers | /training | /league | /finance | /academy | /scouting
Daily Goal ──► resolveClubDailyGoal (derive) ──► istniejące trasy (suggestion; Primary nadrzędny)
Achievements ──► resolveClubAchievements (derive history) ──► /achievements
Messages ──► resolveClubMessages (derive E1–E3) ──► /messages + Overlay (ta sama DTO)
Club ──► resolveClubProfile (compose identity) ──► /club
League ──► planClubFixtures (22) → ensureClubFixtures → resolveLeagueTable ──► /league
Ranking ──► resolveLeagueTable → resolveClubRanking ──► /rankings
complete-fixture ──► cash reward + ensureTransferWindow + match development (RPC)
transfers settle ──► players + cash_balance + finance_movements + transfer_deals
training ──► players.status + players.skill (≤ potential) + clubs.last_training_on (RPC)
academy ──► players.academy_track / promoted_at (Intake + Promote; D23)
scouting ──► resolveClubScouting + scout_shortlist refs (club_id, player_id) → players.id (D24)
Live match ──► LFE MatchSession / CommandBus (nie z Canvas)
```

## LFE (`packages/lfe`)

Entry: `createMatch` / session / CommandBus.  
Freeze: [`../lfe/LFE_ARCHITECTURE_FREEZE.md`](../lfe/LFE_ARCHITECTURE_FREEZE.md) · API: [`../lfe/PUBLIC_API.md`](../lfe/PUBLIC_API.md).

**Zakaz:** Canvas / Replay / Post Match nie wołają Engine i nie mutują `MatchState`.

## Supabase

| Obszar     | Tabele / RPC (skrót)                                                                      |
| ---------- | ----------------------------------------------------------------------------------------- |
| Klub       | `clubs` (`cash_balance`, `transfer_window_open`, `last_training_on`, …)                   |
| Kadra      | `players` (`potential`, `transfer_listed_at`, `departed_at`, `academy_track`, status)     |
| Shortlista | `scout_shortlist` — wyłącznie `(club_id, player_id)` → `players.id` (preferencje; D24)    |
| Rozwój     | `match_development_log` · RPC `apply_match_development` · RPC `complete_training_session` |
| Liga       | `fixtures`                                                                                |
| Finanse    | `finance_movements`                                                                       |
| Transfery  | `transfer_deals`, `transfer_offers`, RPC live H2H                                         |

## Status

**ACTIVE** · 2026-07-31 — LFE-PROMOTION-01 CLOSED · Domain `fa06c53`
