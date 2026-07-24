# Platform — Hub (LFE-HUB-01 + LFE-LEAGUE-01/02 + LFE-ECONOMY-01)

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.

## State Machine

| Phase        | Hub render?                  | Warunek (S1)                                 |
| ------------ | ---------------------------- | -------------------------------------------- |
| `NEW_CLUB`   | **Nie** — First Match tunnel | `!first_match_completed_at`                  |
| `EARLY_CLUB` | **Tak**                      | first match done **i** brak fixtures         |
| `SEASON`     | **Tak** (ten sam layout)     | first match done **i** `fixtures.length > 0` |
| `PLAYOFF`    | Future                       | faza playoff                                 |
| `OFFSEASON`  | Future                       | międzysezonie                                |

**Resolver fazy (jedyny):** `resolveHubPhase(club, { hasFixtures })`.

**Sesja Hub:** `resolveHubSession(phase, nextFixture, lastPlayed)` → `matchday` | `post_match` | `idle` (EARLY_CLUB **i** SEASON).

**Primary CTA (jedyny):** `resolvePrimaryCta(phase, session, { nextFixture })` — przy `matchday` → `/match/{fixtureId}` (identycznie EARLY_CLUB / SEASON).

## Fixtures SSOT (LFE-LEAGUE-01)

| Fakt             | SSOT                                           |
| ---------------- | ---------------------------------------------- |
| Terminarz ligowy | tabela `fixtures` → `FixtureDto`               |
| Next match       | `getNextFixture` (`status=upcoming`)           |
| Opponent id      | `opponent_club_id` + katalog AI w kodzie       |
| Generator        | `ensureClubFixtures` — **3** mecze, idempotent |

First Match (`id=first`) **nie** jest wierszem `fixtures`.

## League table SSOT (LFE-LEAGUE-02)

| Fakt         | SSOT                                                                  |
| ------------ | --------------------------------------------------------------------- |
| Tabela       | **wyłącznie** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` |
| AI↔AI        | deterministyczny derive (bez Match Engine, bez standings DB)          |
| Chip pozycji | `resolvePlayerLeaguePositionLabel(table)` — jedna linia               |
| UI `/league` | konsumuje tylko resolver                                              |

## Finance SSOT (LFE-ECONOMY-01)

| Fakt           | SSOT                                                       |
| -------------- | ---------------------------------------------------------- |
| Saldo          | `clubs.cash_balance`                                       |
| Historia       | `finance_movements`                                        |
| UI kontrakt    | **wyłącznie** `resolveClubFinance(...)` → `ClubFinanceDto` |
| Chip kasy      | jedna linia na Hubie (SEASON); **bez** trendu              |
| Unlock Finanse | Nav + Secondary open na `SEASON`                           |
| Stałe Thin     | `ECONOMY_THIN` — **tymczasowe do GDD §26**                 |

## Decision layout (EARLY_CLUB + SEASON)

Jeden wspólny layout (`EarlyClubHub`) — bez osobnego SeasonHub:

1. Hero — Club DTO
2. Last Match Strip — First Match copy **lub** ostatni played fixture
3. **Exactly 1** Primary CTA — mecz (upcoming) lub „Zobacz skład”
4. ≤5 Secondary (Terminarz; **Tabela** + **Finanse** open na SEASON)
5. Lekki status (IV liga, pozycja, **kasa**, stadion, kolejka)
6. Jedna wiadomość zarządu

## Progressive unlock (shell)

**EARLY_CLUB open:** Panel, Klub, Kadra, Terminarz, Wiadomości, Profil, Ustawienia, Osiągnięcia, Status.  
**SEASON dodatkowo open:** Liga, **Finanse**.  
Soft-lock: Trening, Akademia, Skauting, Transfery, Sponsorzy, Zarząd, Stadion (+ Liga/Finanse na EARLY_CLUB).

Implementacja: `resolveNavAccess(itemId, phase)` + `hasFixtures` z `ClubProvider` (game layout).

## Zakazane

Kolejka 12 FOMO, Top 4 fiction, trening peer-CTA, „okno transferowe”, kontuzje mid-season, `dashboardMock` / `sessionChrome` na ścieżce Hub / `/league` / `/finance`, standings DB, UI czytające saldo bezpośrednio z DB.

## Powiązania

Kod: `components/hub/EarlyClubHub.tsx` · `lib/hub/*` · `lib/fixtures/*` · `lib/league/*` · `lib/finance/*` · shell layout.  
GDD: §23 · §10 · §14 (kategorie; liczby → §26).

## Last updated

2026-07-25 — LFE-ECONOMY-01 CLOSE
