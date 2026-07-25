# Platform — Hub

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.

## State Machine

| Phase                   | Hub render?                  | Warunek (S1)                                 |
| ----------------------- | ---------------------------- | -------------------------------------------- |
| `NEW_CLUB`              | **Nie** — First Match tunnel | `!first_match_completed_at`                  |
| `EARLY_CLUB`            | **Tak**                      | first match done **i** brak fixtures         |
| `SEASON`                | **Tak** (ten sam layout)     | first match done **i** `fixtures.length > 0` |
| `PLAYOFF` / `OFFSEASON` | Future                       | —                                            |

**Jedyny resolver fazy:** `resolveHubPhase(club, { hasFixtures })`.  
**Sesja:** `resolveHubSession(phase, nextFixture, lastPlayed)` → `matchday` | `post_match` | `idle`.  
**Jedyny Primary CTA:** `resolvePrimaryCta(phase, session, { nextFixture })`.

## Decision layout (EARLY_CLUB + SEASON)

Jeden layout (`EarlyClubHub`):

1. Hero — Club DTO
2. Last Match Strip
3. **Exactly 1** Primary CTA
4. ≤5 Secondary (Terminarz; Tabela + Finanse na SEASON)
5. Lekki status (liga, pozycja, kasa, …)
6. Jedna wiadomość zarządu

## Progressive unlock (shell)

| Faza                            | Open                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| EARLY_CLUB                      | Panel, Klub, Kadra, Terminarz, Wiadomości, Profil, Ustawienia, Osiągnięcia, Status |
| SEASON +                        | Liga, Finanse                                                                      |
| SEASON + `transfer_window_open` | Transfery                                                                          |
| SEASON + played ≥ 2             | Trening (`trainingUnlocked`)                                                       |

Soft-lock: Akademia, Skauting, Sponsorzy, Zarząd, Stadion (+ Liga/Finanse na EARLY_CLUB; Trening/Transfery do unlock).

`resolveNavAccess(itemId, phase, { transferWindowOpen, trainingUnlocked })`.

## Domeny (SSOT poza tym plikiem)

| Domen           | Dokument                                                     |
| --------------- | ------------------------------------------------------------ |
| Liga / fixtures | [`LEAGUE.md`](./LEAGUE.md)                                   |
| Finanse         | [`FINANCE.md`](./FINANCE.md)                                 |
| Kadra           | [`PLAYERS.md`](./PLAYERS.md)                                 |
| Transfery       | [`TRANSFERS.md`](./TRANSFERS.md)                             |
| Trening         | [`TRAINING.md`](./TRAINING.md)                               |
| First Match     | [`FIRST_MATCH.md`](./FIRST_MATCH.md)                         |
| Match Live UI   | [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md) |

## Zakazane

FOMO kolejki 12, Top 4 fiction, peer-CTA treningu, fikcyjne okno transferowe, `dashboardMock` na Hub, UI omijające resolvery domen.

## Kod

`components/hub/*` · `lib/hub/*` · shell nav

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
