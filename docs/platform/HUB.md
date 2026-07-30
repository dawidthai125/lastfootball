# Platform — Hub

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.  
Prezentacja (Hero / CTA / daily loop / Kadra): [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.  
**Daily Goal (§20):** [`../implementation/LFE-DAILY-01-PLAN.md`](../implementation/LFE-DAILY-01-PLAN.md) · D25.

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
**Daily Goal (sugestia §20):** `resolveClubDailyGoal(...)` — pure derive · ≤1 · może `null` · **nie** Primary.  
**Secondary (daily loop UI):** `resolveSecondaryCtas(phase, { hasFixtures, trainingUnlocked, transferWindowOpen })` — access via `resolveNavAccess`.

## Decision layout (EARLY_CLUB + SEASON)

Jeden layout (`EarlyClubHub`) — decision-first (LFE-UI-EVOLUTION-01A / 02 · LFE-DAILY-01):

1. **Decision Banner** — najbliższy mecz / last match / first-match strip
2. **Exactly 1** Primary CTA
3. **Daily Goal Thin** — opcjonalna sugestia „Dziś warto” **pod** Primary (Information Thin; Guide §16)
4. Kompaktowa tożsamość klubu
5. ≤5 Secondary — **daily loop** nawigacji (poniżej)
6. Lekki status (liga, pozycja, kasa, …)
7. Jedna wiadomość zarządu

### Primary CTA

| Warunek                         | Label            | href          |
| ------------------------------- | ---------------- | ------------- |
| `matchday` + `nextFixture`      | Przygotuj mecz   | `/match/{id}` |
| Fallback (idle / brak upcoming) | **Zobacz kadrę** | `/squad`      |

### Daily Goal Thin (LFE-DAILY-01 / D25 / GDD §20)

| Reguła                                           | Wartość                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Resolver                                         | **tylko** `resolveClubDailyGoal` (pure derive)                     |
| Persist / Quest Engine / cron / ekonomia         | **Zakaz**                                                          |
| Priorytet                                        | **Primary CTA > Daily Goal** zawsze                                |
| Matchday                                         | Sugestia zsynchronizowana z kierunkiem meczu (`syncedWithPrimary`) |
| Idle + trening odblokowany + brak sesji UTC dziś | Sugestia `/training`                                               |
| Soft-lock treningu                               | Brak sugestii treningu                                             |
| Deep-link                                        | Tylko istniejące trasy                                             |
| ≠                                                | `resolveSecondaryCtas` (daily **loop** nawigacji)                  |

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

FOMO kolejki 12, Top 4 fiction, peer-CTA treningu, fikcyjne okno transferowe, `dashboardMock` na Hub, UI omijające resolvery domen, nowe reguły unlock „pod UI”, elevacja Daily Goal do Primary, Quest Engine / persist celów dnia.

## Kod

`components/hub/*` · `lib/hub/*` (`resolveClubDailyGoal`) · shell nav (`MobileNav`, TopBar)

## Last updated

2026-07-30 — LFE-DAILY-01 (Daily Goal Thin · D25)
