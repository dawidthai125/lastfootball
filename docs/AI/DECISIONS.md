# AI — Decisions (index)

## Cel

Szybki indeks decyzji dla Agenta. Pełna lista historyczna: [`../DECISIONS.md`](../DECISIONS.md).

## Kiedy czytać

Przed PLAN / IMPLEMENT — sprawdź, czy decyzja Ownera już istnieje (D18–D28, P\*).

## Platform / product (2026)

| ID   | Decyzja                                                                                                                     | Źródło                                      |
| ---- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| P1   | Produkcyjny routing klubu = tabela `clubs`, nie `user_metadata`                                                             | LFE-PLATFORM-01                             |
| P2   | First Match tunnel **przed** Hubem; Hub dopiero po `first_match_completed_at`                                               | LFE-MATCH-01                                |
| P3   | `first_match_completed_at` = jedyne SSOT ukończenia pierwszego meczu                                                        | LFE-MATCH-01                                |
| P4   | First Match = synthetic fixture `id=first`; XI z `players` (DB) + AI bot seed                                               | LFE-MATCH-01 / PLAYERS-01                   |
| P5   | Hub EARLY_CLUB = ekran decyzji; mid-season mock usunięty z tej ścieżki                                                      | LFE-HUB-01 / GDD §23                        |
| P6   | `resolveHubPhase` / `resolvePrimaryCta` = SSOT fazy i Primary CTA                                                           | LFE-HUB-01                                  |
| P7   | Progressive disclosure: Liga + Finanse + **Akademia** + **Skauting** open na `SEASON`; Transfery gdy `transfer_window_open` | LFE-HUB-01 / TRANSFERS / ACADEMY / SCOUTING |
| P8   | Supabase prod/dev = project `anoeimngwptucjdugjme`                                                                          | LFE-INFRA-01                                |
| P9   | `fixtures` + `planClubFixtures` = SSOT terminarza; `LEAGUE_FIXTURE_COUNT=22` double RR + top-up · **CLOSED**                | LFE-LEAGUE-01→04 (= D15/D28)                |
| P10  | `players` + `resolveClubSquad(rows)` = SSOT kadry; seed ≠ runtime · **CLOSED**                                              | LFE-PLAYERS-01 (= D19)                      |
| P10b | `players.potential` + match development Thin · pasma UI · RPC atomic · **CLOSED**                                           | LFE-PLAYERS-02 (= D22)                      |
| P10c | `academy_track` + `resolveClubAcademy` · Intake/Promote Thin · max 3 · **CLOSED**                                           | LFE-ACADEMY-01 (= D23)                      |
| P10d | `resolveClubScouting` + `scout_shortlist` refs only · Information Thin · **CLOSED**                                         | LFE-SCOUTING-01 (= D24)                     |
| P10e | `resolveClubDailyGoal` derive only · Primary > Daily · Information Thin · **CLOSED**                                        | LFE-DAILY-01 (= D25)                        |
| P10f | `resolveClubAchievements` derive · immutable history · Information Thin · **CLOSED**                                        | LFE-ACHIEVEMENTS-01 (= D26)                 |
| P10g | `resolveClubRanking` table input · własny DTO · bez ELO/points surface · **CLOSED**                                         | LFE-RANKING-01 (= D27)                      |
| P11  | `resolveLeagueTable` = jedyne źródło tabeli; Hub `SEASON` via S1; brak standings DB · CLOSED                                | LFE-LEAGUE-02                               |
| P12  | `cash_balance` + `finance_movements` + `resolveClubFinance` = Finance Thin; stałe §26 · **CLOSED**                          | LFE-ECONOMY-01 (= D18)                      |
| P13  | `resolveTransferMarket` + window + deals · cash-only · **CLOSED**                                                           | LFE-TRANSFERS-01 (= D20)                    |
| P14  | `resolveClubTraining` + `last_training_on` + status **+ skill** Thin · XI Gate · RPC · **CLOSED**                           | LFE-TRAINING-01/02 (= D21)                  |
| P15  | Envelope = derive (`resolveTransferEnvelope`, ratio 1) — nie kolumna DB                                                     | LFE-TRANSFERS-02-E1                         |
| P16  | Buy nego Thin = pure `resolveNegotiationStep` (stateless)                                                                   | LFE-TRANSFERS-02-N1                         |
| P17  | Incoming AI = derive; seller nego S2; Instant Sell @ 100% ask                                                               | LFE-TRANSFERS-03…05                         |
| P18  | Listing = `transfer_listed_at`; Live Instant @ 100%; `players.id` stałe na Live                                             | LFE-TRANSFERS-04…06                         |
| P19  | Pending H2H = `transfer_offers`; Instant równolegle; supersede w TX                                                         | LFE-TRANSFERS-07                            |
| P20  | 1× Counter seller→buyer; `opening_amount` / `current_amount`; Accept po Counter = buyer; Single Settlement Path             | LFE-TRANSFERS-08                            |
| P21  | GDD §26 = SSOT liczb; D18/D20 = SSOT implementacji                                                                          | GDD-§26A/B                                  |

## Engine (trwałe)

Patrz D1–D10 w [`../DECISIONS.md`](../DECISIONS.md): monorepo LFE izolowany, `createMatch`, CommandBus, Freeze v1, GDD SSOT produktu, Canvas/Replay read-only.

## Status

**ACTIVE** · pełne opisy w [`../DECISIONS.md`](../DECISIONS.md)

## Last updated

2026-07-30 — LFE-LEAGUE-04 · D28 / P9
