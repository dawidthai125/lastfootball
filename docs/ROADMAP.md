# Roadmap â€” Last Football

## Cel

Mapa postÄ™pu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production feature baseline **`8824793`** (LFE-TRANSFERS-06 CLOSED).  
GDD-Â§26A/B Â· LEAGUE-03 Â· E1 Â· N1 Â· Incoming Â· Listing Â· Seller nego Â· Live H2H Â· Vercel Production.

---

## DONE âś…

| Item                                                      | Notatka                                                             |
| --------------------------------------------------------- | ------------------------------------------------------------------- |
| Monorepo + infra                                          | Next, Supabase, Vercel, CI                                          |
| LFE EPIC-1â€¦7                                            | Foundation â†’ Positioning                                          |
| LFE Architecture Freeze                                   | PUBLIC API v1                                                       |
| Gameplay Â· Match AI Â· Match Engine Â· Player Match Data | silnik gameplay                                                     |
| Asset Pack Â· UI Shell                                    | chrome                                                              |
| Live Bridge Â· Canvas Â· Replay Â· Post Match Â· Ratings  | match UI pipeline                                                   |
| CI Prettier                                               | format gate                                                         |
| GDD-01â€¦15                                               | Â§3â€“Â§15 + Â§20 + Â§23                                            |
| **GDD-Â§26A**                                             | **CLOSED** Â· Â§26 SSOT liczb Thin (docs)                           |
| **GDD-Â§26B**                                             | **CLOSED** Â· `ECONOMY_THIN` + `TRANSFER_FEE` + CURRENCY sync       |
| **LFE-PLATFORM-01** P1â€“P3                               | Landing Â· Auth Â· Club Wizard Â· Club DTO                          |
| **LFE-INFRA-01**                                          | Supabase `anoeimngwptucjdugjme`                                     |
| **LFE-MATCH-01**                                          | First Match tunnel Â· `first_match_completed_at`                    |
| **LFE-HUB-01**                                            | EARLY_CLUB Â· `resolveHubPhase` / `resolvePrimaryCta`               |
| **LFE-DOCS-01**                                           | Konsolidacja docs AI / handoff                                      |
| **LFE-LEAGUE-01** Thin A                                  | **CLOSED** Â· fixtures SSOT Â· next match                           |
| **LFE-LEAGUE-02**                                         | **CLOSED** Â· table derive Â· Hub SEASON Â· `/league` Â· chip       |
| **LFE-LEAGUE-03**                                         | **CLOSED** Â· `LEAGUE_FIXTURE_COUNT=11` Â· top-up                   |
| **LFE-ECONOMY-01**                                        | **CLOSED** Â· cash SSOT Â· movements Â· `/finance` Â· SEASON        |
| **LFE-PLAYERS-01**                                        | **CLOSED** Â· `players` SSOT Â· `resolveClubSquad` Â· D19           |
| **LFE-TRANSFERS-01**                                      | **CLOSED** Â· market Thin Â· `resolveTransferMarket` Â· D20         |
| **LFE-TRANSFERS-02-E1**                                   | **CLOSED** Â· derived envelope (`resolveTransferEnvelope`, ratio 1) |
| **LFE-TRANSFERS-02-N1**                                   | **CLOSED** Â· stateless buy negotiation Thin                        |
| **LFE-TRANSFERS-03**                                      | **CLOSED** Â· derived AI incoming offers                            |
| **LFE-TRANSFERS-04**                                      | **CLOSED** Â· player listing (`transfer_listed_at`)                 |
| **LFE-TRANSFERS-05**                                      | **CLOSED** Â· seller negotiation Thin (Incoming S2)                 |
| **LFE-TRANSFERS-06**                                      | **CLOSED** Â· Live H2H Instant Buy Thin                             |
| **LFE-TRAINING-01**                                       | **CLOSED** Â· team training Thin Â· `resolveClubTraining` Â· D21    |

## IN PROGRESS đź”„

| Item | Notatka |
| ---- | ------- |
| â€”  | Brak    |

## PLANNED â¬ś

| Item                             | ZaleĹĽnoĹ›Ä‡                       |
| -------------------------------- | ---------------------------------- |
| GDD-16+                          | Owner GO (docs)                    |
| Training depth (skill / XI gate) | po TRAINING-01 (D21 poza)          |
| Full 22-fixture season (opt.)    | po LEAGUE-03 Â· GDD Â§10 home+away |
| ZawÄ™ĹĽenie LFE PUBLIC exports   | chore                              |
| Ratings v2                       | bogatsze Player Match Data         |

## FUTURE

| Item                          | Notatka                       |
| ----------------------------- | ----------------------------- |
| LFE Physics / full Rules      | RESERVED / czÄ™Ĺ›ciowe eventy |
| ECS storage                   | RESERVED                      |
| Replay persist / video export | poza MVP                      |
| Mobile native                 | poza scope                    |

---

## Next Recommended EPIC

**Owner wybiera.** Kandydaci: GDD-16+ Â· Training depth Â· full 22 fixtures.  
Uzasadnienie: rynek Thin (envelope + buy nego + incoming AI) na produkcji.

## Decyzje roadmapy

- Design (GDD) prowadzi produkt; implementacja moĹĽe mieÄ‡ udokumentowane wyjÄ…tki (First Match przed Hubem; unlock transferĂłw/treningu po 2 played; dzieĹ„ treningu = UTC; **kalendarz 11 â‰  GDD 22**).
- Hub = decyzja (Â§23), nie dashboard.
- UI/Canvas nie omija `MatchSession` / CommandBus.
- Replay nigdy nie odpala Engine.
- Tabela ligowa = pure derive (`resolveLeagueTable`); brak standings DB (D17).
- Terminarz = `fixtures` + `planClubFixtures` + top-up (D15 / LFE-LEAGUE-03).
- Kasa = `cash_balance`; UI tylko przez `resolveClubFinance` (D18); **liczby = GDD Â§26**; kod = `ECONOMY_THIN` (Â§26B).
- Envelope = `resolveTransferEnvelope` (ratio 1 Thin) â€” nie kolumna DB (E1).
- Buy nego = `resolveNegotiationStep` pure / stateless (N1); settlement `agreedAmount`.
- Incoming AI = `resolveIncomingOffers` derive C; seller nego S2 (TRANSFERS-05).
- Listing = `transfer_listed_at`; Incoming tylko listed; shared sell eligibility (TRANSFERS-04).
- Seller nego = `resolveSellerNegotiationStep` pure; Instant Sell @ 100% ask; settle `completeTransferSell(agreedAmount)`.
- Live H2H = listed `players` innych klubĂłw; Instant @ 100% ask; atomowy RPC; `players.id` staĹ‚e (TRANSFERS-06).
- Kadra = `players`; UI tylko przez `resolveClubSquad` (D19); seed â‰  runtime.
- Transfery = `resolveTransferMarket` + `transfer_window_open` + `transfer_deals`; fee = derive â† `ECONOMY_THIN.TRANSFER_FEE` (D20).
- Trening = `resolveClubTraining` + `last_training_on` + status-only na `players`; shared `hasPlayedUnlock` (D21).
- **Â§26 = SSOT liczb**; **D18/D20 = SSOT implementacji**.

## PowiÄ…zania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) Â· [`AI/PROJECT_STATE.md`](./AI/PROJECT_STATE.md)

## Last updated

2026-07-26 â€” LFE-TRANSFERS-06 CLOSE
