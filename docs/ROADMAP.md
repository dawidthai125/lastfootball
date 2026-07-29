# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

**Production Baseline (UI P0):** **`54d0724`** — LFE-UI-IMPL-06 CLOSED.  
**Domain feature baseline:** **`cd222ba`** — LFE-PLAYERS-02 CLOSED (Player Development Thin).  
**Presentation tip:** **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin).  
Szczegóły tip / warstwy: [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · master: [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md).  
GDD-§26A/B · LEAGUE-03 · Transfers Thin · Training Depth · **Player Development (PLAYERS-02)** · **GDD-16** · **GDD-17** · **GDD-18** · **LFE-UI-MOTION-01** · Night Pitch Office UI P0 · Landing/Auth · Vercel Production.

---

## DONE ✅

| Item                                                   | Notatka                                                                                                       |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Monorepo + infra                                       | Next, Supabase, Vercel, CI                                                                                    |
| LFE EPIC-1…7                                           | Foundation → Positioning                                                                                      |
| LFE Architecture Freeze                                | PUBLIC API v1                                                                                                 |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay                                                                                               |
| Asset Pack · UI Shell                                  | chrome                                                                                                        |
| Live Bridge · Canvas · Replay · Post Match · Ratings   | match UI pipeline                                                                                             |
| CI Prettier                                            | format gate                                                                                                   |
| GDD-01…15                                              | §3–§15 + §20 + §23                                                                                            |
| **GDD-16**                                             | **CLOSED** · §16 Akademia Thin A (Intake + Promote) · docs `4805f7e`                                          |
| **GDD-17**                                             | **CLOSED** · §17 Skauting Information Thin B · docs `2595cc9` · CI GREEN · PRODUCTION VERIFIED                |
| **GDD-18**                                             | **CLOSED** · §18 Ranking Thin (sezonowy ranking klubów) · tip `4dedd71` · CI GREEN · PRODUCTION VERIFIED      |
| **GDD-§26A**                                           | **CLOSED** · §26 SSOT liczb Thin (docs)                                                                       |
| **GDD-§26B**                                           | **CLOSED** · `ECONOMY_THIN` + `TRANSFER_FEE` + CURRENCY sync                                                  |
| **LFE-PLATFORM-01** P1–P3                              | Landing · Auth · Club Wizard · Club DTO                                                                       |
| **LFE-INFRA-01**                                       | Supabase `anoeimngwptucjdugjme`                                                                               |
| **LFE-MATCH-01**                                       | First Match tunnel · `first_match_completed_at`                                                               |
| **LFE-HUB-01**                                         | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta`                                                          |
| **LFE-DOCS-01**                                        | Konsolidacja docs AI / handoff                                                                                |
| **LFE-LEAGUE-01** Thin A                               | **CLOSED** · fixtures SSOT · next match                                                                       |
| **LFE-LEAGUE-02**                                      | **CLOSED** · table derive · Hub SEASON · `/league` · chip                                                     |
| **LFE-LEAGUE-03**                                      | **CLOSED** · `LEAGUE_FIXTURE_COUNT=11` · top-up                                                               |
| **LFE-ECONOMY-01**                                     | **CLOSED** · cash SSOT · movements · `/finance` · SEASON                                                      |
| **LFE-PLAYERS-01**                                     | **CLOSED** · `players` SSOT · `resolveClubSquad` · D19                                                        |
| **LFE-PLAYERS-02**                                     | **CLOSED** · Player Development Thin · `potential` + match growth · D22 · `cd222ba`                           |
| **LFE-TRANSFERS-01**                                   | **CLOSED** · market Thin · `resolveTransferMarket` · D20                                                      |
| **LFE-TRANSFERS-02-E1**                                | **CLOSED** · derived envelope (`resolveTransferEnvelope`, ratio 1)                                            |
| **LFE-TRANSFERS-02-N1**                                | **CLOSED** · stateless buy negotiation Thin                                                                   |
| **LFE-TRANSFERS-03**                                   | **CLOSED** · derived AI incoming offers                                                                       |
| **LFE-TRANSFERS-04**                                   | **CLOSED** · player listing (`transfer_listed_at`)                                                            |
| **LFE-TRANSFERS-05**                                   | **CLOSED** · seller negotiation Thin (Incoming S2)                                                            |
| **LFE-TRANSFERS-06**                                   | **CLOSED** · Live H2H Instant Buy Thin                                                                        |
| **LFE-TRANSFERS-07**                                   | **CLOSED** · Live H2H Pending Offers Thin                                                                     |
| **LFE-TRANSFERS-08**                                   | **CLOSED** · Live H2H Counter Offers Thin (1× seller→buyer)                                                   |
| **LFE-TRAINING-01**                                    | **CLOSED** · team training Thin · `resolveClubTraining` · D21                                                 |
| **LFE-TRAINING-02**                                    | **CLOSED** · Training Depth · skill progression + XI Gate · RPC atomic · `5e6c2ad`                            |
| **LFE-UI-EVOLUTION-01** (A–H)                          | **CLOSED** · decision-first Hub · Shell · Transfers · Kick-Off · Training · Squad · Finance (presentation)    |
| **LFE-UI-EVOLUTION-02**                                | **CLOSED** · daily manager loop · Kadra SSOT · Mobile Variant A (presentation)                                |
| **LFE-DOCS-UX-03**                                     | **CLOSED** · UI Presentation Contract (Guide §16) · Patterns · HUB sync · postmortem REFERENCE                |
| **LFE-ART / WORLD-ART / HIFI / PROTO / PLAYTEST**      | **CLOSED** · Visual DNA · Style Lock · Hi-Fi · Proto · Playtest → GO impl                                     |
| **LFE-DOCS-SYNC-01**                                   | **CLOSED** · design SSOT + world-art verification w repo                                                      |
| **LFE-UI-IMPL-01**                                     | **CLOSED** · Shell + Hub Night Pitch Office · `282cfc9`                                                       |
| **LFE-UI-IMPL-02**                                     | **CLOSED** · Match Path Tunnel→Post · `769ce4a`                                                               |
| **LFE-UI-IMPL-03**                                     | **CLOSED** · Core Domains P0 + shared states · `d850f0e`                                                      |
| **LFE-UI-IMPL-04**                                     | **CLOSED** · Shell polish · nav · soft-lock · `d9bb5b6`                                                       |
| **LFE-UI-IMPL-05**                                     | **CLOSED** · Match XI / skład · `47340fe`                                                                     |
| **LFE-CONTENT-PASS-01**                                | **CLOSED** · `UI_COPY` microcopy · `50ddf1a`                                                                  |
| **LFE-UI-IMPL-06A**                                    | **CLOSED** · Desktop Hub layout · nav tooltips · `00b2c2a`                                                    |
| **LFE-UI-IMPL-06**                                     | **CLOSED** · Live → Post fidelity · **Production Baseline** `54d0724`                                         |
| **LFE-DOCS-BASELINE-01**                               | **CLOSED** · sync status / baseline / roadmap po UI P0                                                        |
| **LFE-LANDING-01**                                     | **CLOSED** · marketing home · Tunnel hero · `ffa20c6`                                                         |
| **LFE-BRANDING-01B**                                   | **CLOSED** · logo K1+K3 · favicons · OG · `1fbd6b5`                                                           |
| **LFE-AUTH-UX-01**                                     | **CLOSED** · Login Modal · AuthStage `/login` `/register` · prior presentation `9dc834a`                      |
| **LFE-UI-MOTION-01**                                   | **CLOSED** · Presentation motion Thin · Hub/Match · Guide §8 · **`9fd14fc`** · CI GREEN · PRODUCTION VERIFIED |
| **LFE-HANDOFF-01**                                     | **CLOSED** · master handoff AI · sync docs                                                                    |

## IN PROGRESS 🔄

| Item | Notatka |
| ---- | ------- |
| —    | Brak    |

## PLANNED ⬜

| Item                          | Zależność                        |
| ----------------------------- | -------------------------------- |
| **GDD-19** (§19 Osiągnięcia)  | **READY FOR AUDIT**              |
| GDD-17+ (pozostałe §20+ już filled; §21–22 / §24+) | Owner GO (kolejność) |
| LFE-ACADEMY-01 (kod)          | po GDD-16 · osobny AUDIT         |
| LFE-SCOUTING-01 (kod)         | po GDD-17 · osobny AUDIT         |
| LFE-RANKING-01 (kod)          | po GDD-18 · osobny AUDIT         |
| Full 22-fixture season (opt.) | po LEAGUE-03 · GDD §10 home+away |
| Zawężenie LFE PUBLIC exports  | chore                            |
| Ratings v2                    | bogatsze Player Match Data       |

## FUTURE

| Item                                              | Notatka                     |
| ------------------------------------------------- | --------------------------- |
| LFE Physics / full Rules                          | RESERVED / częściowe eventy |
| ECS storage                                       | RESERVED                    |
| Replay persist / video export                     | poza MVP                    |
| Mobile native                                     | poza scope                  |
| Individual training / XP / attribute DB / Academy | poza Thin Depth (D21/D22)   |

---

## Next Recommended EPIC

**GDD-19** (§19 Osiągnięcia) — **READY FOR AUDIT**.  
Alternatywy: full 22 fixtures · transfers hardening · LFE-ACADEMY-01 / LFE-SCOUTING-01 / LFE-RANKING-01 (kod) · Ratings v2.  
Domain tip: PLAYERS-02 `cd222ba`; Presentation tip: MOTION-01 `9fd14fc`; Documentation tip: GDD-18 `4dedd71`.

## Decyzje roadmapy

- Design (GDD) prowadzi produkt; implementacja może mieć udokumentowane wyjątki (First Match przed Hubem; unlock transferów/treningu po 2 played; dzień treningu = UTC; **kalendarz 11 ≠ GDD 22**).
- Hub = decyzja (§23), nie dashboard.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.
- Tabela ligowa = pure derive (`resolveLeagueTable`); brak standings DB (D17).
- Terminarz = `fixtures` + `planClubFixtures` + top-up (D15 / LFE-LEAGUE-03).
- Kasa = `cash_balance`; UI tylko przez `resolveClubFinance` (D18); **liczby = GDD §26**; kod = `ECONOMY_THIN` (§26B).
- Envelope = `resolveTransferEnvelope` (ratio 1 Thin) — nie kolumna DB (E1).
- Buy nego = `resolveNegotiationStep` pure / stateless (N1); settlement `agreedAmount`.
- Incoming AI = `resolveIncomingOffers` derive C; seller nego S2 (TRANSFERS-05).
- Listing = `transfer_listed_at`; Incoming tylko listed; shared sell eligibility (TRANSFERS-04).
- Seller nego = `resolveSellerNegotiationStep` pure; Instant Sell @ 100% ask; settle `completeTransferSell(agreedAmount)`.
- Live H2H = listed `players` innych klubów; Instant @ 100% ask; atomowy RPC; `players.id` stałe (TRANSFERS-06).
- Pending H2H = `transfer_offers`; NEGOTIATION_THIN presets; Accept/Instant/Unlist supersede; brak escrow/timeout; settle tylko buy/sell (TRANSFERS-07).
- Counter H2H = 1× seller→buyer; `opening_amount` immutable; settle @ `current_amount`; Accept po Counter = buyer (TRANSFERS-08).
- Kadra = `players` (+ `potential`); UI tylko przez `resolveClubSquad` (D19/D22); seed ≠ runtime; pasma potencjału only.
- Transfery = `resolveTransferMarket` + `transfer_window_open` + `transfer_deals`; fee = derive ← `ECONOMY_THIN.TRANSFER_FEE` (D20); fee **bez** potential.
- Trening = `resolveClubTraining` + `last_training_on` + `status` **+** `skill` Thin (anti-farm; skill ≤ potential); RPC `complete_training_session`; XI Gate INJURED/SUSPENDED hard; shared `hasPlayedUnlock` (D21 / TRAINING-02).
- Match development = PRIMARY growth · RPC `apply_match_development` · K_MATCH=5 · starters only (D22 / PLAYERS-02).
- **§18 Ranking Thin** = sezonowy ranking klubów (docs); ≠ §6 / §10 / §17; placeholder `/rankings` ≠ SSOT; kod = Future.
- **§26 = SSOT liczb**; **D18/D20 = SSOT implementacji**.
- **UI P0** = presentation Night Pitch Office (IMPL-01…06); **MOTION-01** = shared CSS motion Thin (Guide §8); nie zmienia Domain tip PLAYERS-02.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) (status kanoniczny) · [`AI/EPIC_INDEX.md`](./AI/EPIC_INDEX.md) · [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · [`implementation/`](./implementation/)

## Last updated

2026-07-30 — GDD-18 CLOSED · Documentation tip `4dedd71` · next **GDD-19 READY FOR AUDIT**
