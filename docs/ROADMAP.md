# Roadmap — Last Football

## Cel

Mapa postępu: **DONE / IN PROGRESS / PLANNED / FUTURE**.

## Aktualny stan

Production feature baseline **`4f69b5d`** (LFE-TRANSFERS-03 CLOSED).  
GDD-§26A/B · LEAGUE-03 · E1 · N1 CLOSED · Vercel Production.

---

## DONE ✅

| Item                                                   | Notatka                                                            |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| Monorepo + infra                                       | Next, Supabase, Vercel, CI                                         |
| LFE EPIC-1…7                                           | Foundation → Positioning                                           |
| LFE Architecture Freeze                                | PUBLIC API v1                                                      |
| Gameplay · Match AI · Match Engine · Player Match Data | silnik gameplay                                                    |
| Asset Pack · UI Shell                                  | chrome                                                             |
| Live Bridge · Canvas · Replay · Post Match · Ratings   | match UI pipeline                                                  |
| CI Prettier                                            | format gate                                                        |
| GDD-01…15                                              | §3–§15 + §20 + §23                                                 |
| **GDD-§26A**                                           | **CLOSED** · §26 SSOT liczb Thin (docs)                            |
| **GDD-§26B**                                           | **CLOSED** · `ECONOMY_THIN` + `TRANSFER_FEE` + CURRENCY sync       |
| **LFE-PLATFORM-01** P1–P3                              | Landing · Auth · Club Wizard · Club DTO                            |
| **LFE-INFRA-01**                                       | Supabase `anoeimngwptucjdugjme`                                    |
| **LFE-MATCH-01**                                       | First Match tunnel · `first_match_completed_at`                    |
| **LFE-HUB-01**                                         | EARLY_CLUB · `resolveHubPhase` / `resolvePrimaryCta`               |
| **LFE-DOCS-01**                                        | Konsolidacja docs AI / handoff                                     |
| **LFE-LEAGUE-01** Thin A                               | **CLOSED** · fixtures SSOT · next match                            |
| **LFE-LEAGUE-02**                                      | **CLOSED** · table derive · Hub SEASON · `/league` · chip          |
| **LFE-LEAGUE-03**                                      | **CLOSED** · `LEAGUE_FIXTURE_COUNT=11` · top-up                    |
| **LFE-ECONOMY-01**                                     | **CLOSED** · cash SSOT · movements · `/finance` · SEASON           |
| **LFE-PLAYERS-01**                                     | **CLOSED** · `players` SSOT · `resolveClubSquad` · D19             |
| **LFE-TRANSFERS-01**                                   | **CLOSED** · market Thin · `resolveTransferMarket` · D20           |
| **LFE-TRANSFERS-02-E1**                                | **CLOSED** · derived envelope (`resolveTransferEnvelope`, ratio 1) |
| **LFE-TRANSFERS-02-N1**                                | **CLOSED** · stateless buy negotiation Thin                        |
| **LFE-TRANSFERS-03**                                   | **CLOSED** · derived AI incoming offers (Accept/Reject @ 100% ask) |
| **LFE-TRAINING-01**                                    | **CLOSED** · team training Thin · `resolveClubTraining` · D21      |

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
Uzasadnienie: rynek Thin (envelope + buy nego + incoming AI) na produkcji.

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
- Incoming AI = `resolveIncomingOffers` derive C; Accept → `completeTransferSell` (TRANSFERS-03).
- Kadra = `players`; UI tylko przez `resolveClubSquad` (D19); seed ≠ runtime.
- Transfery = `resolveTransferMarket` + `transfer_window_open` + `transfer_deals`; fee = derive ← `ECONOMY_THIN.TRANSFER_FEE` (D20).
- Trening = `resolveClubTraining` + `last_training_on` + status-only na `players`; shared `hasPlayedUnlock` (D21).
- **§26 = SSOT liczb**; **D18/D20 = SSOT implementacji**.

## Powiązania

[`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`AI/PROJECT_STATE.md`](./AI/PROJECT_STATE.md)

## Last updated

2026-07-25 — LFE-TRANSFERS-03 CLOSE
