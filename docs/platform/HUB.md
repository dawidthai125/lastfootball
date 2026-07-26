# Platform — Hub

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.  
Prezentacja (Hero / CTA / daily loop / Kadra): [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

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
**Secondary (daily):** `resolveSecondaryCtas(phase, { hasFixtures, trainingUnlocked, transferWindowOpen })` — access via `resolveNavAccess`.

## Decision layout (EARLY_CLUB + SEASON)

Jeden layout (`EarlyClubHub`) — decision-first (LFE-UI-EVOLUTION-01A / 02):

1. **Decision Banner** — najbliższy mecz / last match / first-match strip
2. **Exactly 1** Primary CTA
3. Kompaktowa tożsamość klubu
4. ≤5 Secondary — **daily loop** (poniżej)
5. Lekki status (liga, pozycja, kasa, …)
6. Jedna wiadomość zarządu

### Primary CTA

| Warunek                         | Label            | href          |
| ------------------------------- | ---------------- | ------------- |
| `matchday` + `nextFixture`      | Przygotuj mecz   | `/match/{id}` |
| Fallback (idle / brak upcoming) | **Zobacz kadrę** | `/squad`      |

### Secondary CTA — daily loop (max 5)

Kolejność (unlock-aware; soft-lock przez istniejące `resolveNavAccess`):

| #   | Label     | href         |
| --- | --------- | ------------ |
| 1   | Trening   | `/training`  |
| 2   | Kadra     | `/squad`     |
| 3   | Transfery | `/transfers` |
| 4   | Finanse   | `/finance`   |
| 5   | Terminarz | `/matches`   |

Demote z Hub daily (pozostają w left nav / Więcej): klub, wiadomość zarządu, tabela jako osobny secondary top-5 — nie w daily strip.

## Progressive unlock (shell)

| Faza                            | Open                                                                               |
| ------------------------------- | ---------------------------------------------------------------------------------- |
| EARLY_CLUB                      | Panel, Klub, Kadra, Terminarz, Wiadomości, Profil, Ustawienia, Osiągnięcia, Status |
| SEASON +                        | Liga, Finanse                                                                      |
| SEASON + `transfer_window_open` | Transfery                                                                          |
| SEASON + played ≥ 2             | Trening (`trainingUnlocked`)                                                       |

Soft-lock: Akademia, Skauting, Sponsorzy, Zarząd, Stadion (+ Liga/Finanse na EARLY_CLUB; Trening/Transfery do unlock).

`resolveNavAccess(itemId, phase, { transferWindowOpen, trainingUnlocked })`.

**Mobile daily (Variant A):** Hub · Trening · Kadra · Transfery · Więcej — szczegóły Guide §16.5.

## Domeny (SSOT poza tym plikiem)

| Domen           | Dokument                                                                     |
| --------------- | ---------------------------------------------------------------------------- |
| Liga / fixtures | [`LEAGUE.md`](./LEAGUE.md)                                                   |
| Finanse         | [`FINANCE.md`](./FINANCE.md)                                                 |
| Kadra           | [`PLAYERS.md`](./PLAYERS.md)                                                 |
| Transfery       | [`TRANSFERS.md`](./TRANSFERS.md)                                             |
| Trening         | [`TRAINING.md`](./TRAINING.md)                                               |
| First Match     | [`FIRST_MATCH.md`](./FIRST_MATCH.md)                                         |
| Match Live UI   | [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)                 |
| UI Contract     | [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16 |

## Zakazane

FOMO kolejki 12, Top 4 fiction, peer-CTA treningu, fikcyjne okno transferowe, `dashboardMock` na Hub, UI omijające resolvery domen, nowe reguły unlock „pod UI”.

## Kod

`components/hub/*` · `lib/hub/*` · shell nav (`MobileNav`, TopBar)

## Last updated

2026-07-26 — LFE-DOCS-UX-03 (sync po LFE-UI-EVOLUTION-02)
