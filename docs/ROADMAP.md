# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production feature baseline **`9b1c575`** (LFE-TRANSFERS-08 CLOSED).  
UI Evolution 01–02 · DOCS-UX-03 CLOSED (docs tip — patrz [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)).  
GDD-§26A/B · LEAGUE-03 · E1 · N1 · Incoming · Listing · Seller nego · Live H2H · Pending · Counter · Vercel Production.

---

## DONE ✅

| Item                                                   | Notatka                                                                                                    |
| ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------- |
| Monorepo + infra                                       | Next, Supabase, Vercel, CI                                                                                 |
| LFE EPIC-1…7                                           | Foundation → Positioning                                                                                   |
| LFE Architecture Freeze                                | PUBLIC API v1                                                                                              |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay                                                                                            |
| Asset Pack · UI Shell                                  | chrome                                                                                                     |
| Live Bridge · Canvas · Replay · Post Match · Ratings   | match UI pipeline                                                                                          |
| CI Prettier                                            | format gate                                                                                                |
| GDD-01…15                                              | §3–§15 + §20 + §23                                                                                         |
| **GDD-§26A**                                           | **CLOSED** · §26 SSOT liczb Thin (docs)                                                                    |
| **GDD-§26B**                                           | **CLOSED** · `ECONOMY_THIN` + `TRANSFER_FEE` + CURRENCY sync                                               |
| **LFE-PLATFORM-01** P1–P3                              | Landing · Auth · Club Wizard · Club DTO                                                                    |
| **LFE-INFRA-01**                                       | Supabase `anoeimngwptucjdugjme`                                                                            |
| **LFE-MATCH-01**                                       | First Match tunnel · `first_match_completed_at`                                                            |
| **LFE-HUB-01**                                         | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta`                                                       |
| **LFE-DOCS-01**                                        | Konsolidacja docs AI / handoff                                                                             |
| **LFE-LEAGUE-01** Thin A                               | **CLOSED** · fixtures SSOT · next match                                                                    |
| **LFE-LEAGUE-02**                                      | **CLOSED** · table derive · Hub SEASON · `/league` · chip                                                  |
| **LFE-LEAGUE-03**                                      | **CLOSED** · `LEAGUE_FIXTURE_COUNT=11` · top-up                                                            |
| **LFE-ECONOMY-01**                                     | **CLOSED** · cash SSOT · movements · `/finance` · SEASON                                                   |
| **LFE-PLAYERS-01**                                     | **CLOSED** · `players` SSOT · `resolveClubSquad` · D19                                                     |
| **LFE-TRANSFERS-01**                                   | **CLOSED** · market Thin · `resolveTransferMarket` · D20                                                   |
| **LFE-TRANSFERS-02-E1**                                | **CLOSED** · derived envelope (`resolveTransferEnvelope`, ratio 1)                                         |
| **LFE-TRANSFERS-02-N1**                                | **CLOSED** · stateless buy negotiation Thin                                                                |
| **LFE-TRANSFERS-03**                                   | **CLOSED** · derived AI incoming offers                                                                    |
| **LFE-TRANSFERS-04**                                   | **CLOSED** · player listing (`transfer_listed_at`)                                                         |
| **LFE-TRANSFERS-05**                                   | **CLOSED** · seller negotiation Thin (Incoming S2)                                                         |
| **LFE-TRANSFERS-06**                                   | **CLOSED** · Live H2H Instant Buy Thin                                                                     |
| **LFE-TRANSFERS-07**                                   | **CLOSED** · Live H2H Pending Offers Thin                                                                  |
| **LFE-TRANSFERS-08**                                   | **CLOSED** · Live H2H Counter Offers Thin (1× seller→buyer)                                                |
| **LFE-TRAINING-01**                                    | **CLOSED** · team training Thin · `resolveClubTraining` · D21                                              |
| **LFE-UI-EVOLUTION-01** (A–H)                          | **CLOSED** · decision-first Hub · Shell · Transfers · Kick-Off · Training · Squad · Finance (presentation) |
| **LFE-UI-EVOLUTION-02**                                | **CLOSED** · daily manager loop · Kadra SSOT · Mobile Variant A (presentation)                             |
| **LFE-DOCS-UX-03**                                     | **CLOSED** · UI Presentation Contract (Guide §16) · Patterns · HUB sync · postmortem REFERENCE             |

## IN PROGRESS 🔄

| Item | Notatka |
| ---- | ------- |
| —    | Brak    |

## PLANNED ⬜

| Item                             | Zależność                        |
| -------------------------------- | -------------------------------- |
| GDD-16+                          | Owner GO (docs)                  |
| Training depth (skill / XI gate) | po TRAINING-01 (D21 poza)        |
| Full 22-fixture season (opt.)    | po LEAGUE-03 · GDD §10 home+away |
| Zawężenie LFE PUBLIC exports     | chore                            |
| Ratings v2                       | bogatsze Player Match Data       |

## FUTURE

| Item                          | Notatka                     |
| ----------------------------- | --------------------------- |
| LFE Physics / full Rules      | RESERVED / częściowe eventy |
| ECS storage                   | RESERVED                    |
| Replay persist / video export | poza MVP                    |
| Mobile native                 | poza scope                  |

---

## Next Recommended EPIC

**Owner wybiera.** Kandydaci: GDD-16+ · Training depth · full 22 fixtures.  
Uzasadnienie: rynek Thin (Live Instant + Pending + 1× Counter + listing + nego) na produkcji.

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
- Kadra = `players`; UI tylko przez `resolveClubSquad` (D19); seed ≠ runtime.
- Transfery = `resolveTransferMarket` + `transfer_window_open` + `transfer_deals`; fee = derive ← `ECONOMY_THIN.TRANSFER_FEE` (D20).
- Trening = `resolveClubTraining` + `last_training_on` + status-only na `players`; shared `hasPlayedUnlock` (D21).
- **§26 = SSOT liczb**; **D18/D20 = SSOT implementacji**.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) (status kanoniczny) · [`AI/EPIC_INDEX.md`](./AI/EPIC_INDEX.md) · [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)

## Last updated

2026-07-26 — AI-DOCS-SYNC-01 · UI Evolution + DOCS-UX-03 w DONE
