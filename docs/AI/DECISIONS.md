# AI — Decisions (index)

## Cel

Szybki indeks decyzji dla Agenta. Pełna lista historyczna: [`../DECISIONS.md`](../DECISIONS.md).

## Platform / product (2026)

| ID  | Decyzja                                                                                               | Źródło                        |
| --- | ----------------------------------------------------------------------------------------------------- | ----------------------------- |
| P1  | Produkcyjny routing klubu = tabela `clubs`, nie `user_metadata`                                       | LFE-PLATFORM-01               |
| P2  | First Match tunnel **przed** Hubem; Hub dopiero po `first_match_completed_at`                         | LFE-MATCH-01                  |
| P3  | `first_match_completed_at` = jedyne SSOT ukończenia pierwszego meczu                                  | LFE-MATCH-01                  |
| P4  | First Match = synthetic fixture `id=first`; XI z `players` (DB) + AI bot seed                         | LFE-MATCH-01 / PLAYERS-01     |
| P5  | Hub EARLY_CLUB = ekran decyzji; mid-season mock usunięty z tej ścieżki                                | LFE-HUB-01 / GDD §23          |
| P6  | `resolveHubPhase` / `resolvePrimaryCta` = SSOT fazy i Primary CTA                                     | LFE-HUB-01                    |
| P7  | Progressive disclosure: Liga + Finanse open na `SEASON`; Transfery gdy `transfer_window_open`         | LFE-HUB-01 / … / TRANSFERS-01 |
| P8  | Supabase prod/dev = project `anoeimngwptucjdugjme`                                                    | LFE-INFRA-01                  |
| P9  | `fixtures` + `opponent_club_id` = SSOT terminarza; Thin A generator = 3 fixtures                      | LFE-LEAGUE-01                 |
| P10 | `players` + `resolveClubSquad(rows)` = SSOT kadry; seed ≠ runtime · **CLOSED**                        | LFE-PLAYERS-01 (= D19)        |
| P11 | `resolveLeagueTable` = jedyne źródło tabeli; Hub `SEASON` via S1; brak standings DB · CLOSED          | LFE-LEAGUE-02                 |
| P12 | `cash_balance` + `finance_movements` + `resolveClubFinance` = Finance Thin; stałe do §26 · **CLOSED** | LFE-ECONOMY-01 (= D18)        |
| P13 | `resolveTransferMarket` + `transfer_window_open` + `transfer_deals` · cash-only · **CLOSED**          | LFE-TRANSFERS-01 (= D20)      |
| P14 | `resolveClubTraining` + `last_training_on` + status-only · shared `hasPlayedUnlock` · **CLOSED**      | LFE-TRAINING-01 (= D21)       |

## Engine (trwałe)

Patrz D1–D10 w [`../DECISIONS.md`](../DECISIONS.md): monorepo LFE izolowany, `createMatch`, CommandBus, Freeze v1, GDD SSOT produktu, Canvas/Replay read-only.

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
