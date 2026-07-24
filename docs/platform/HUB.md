# Platform — Hub (LFE-HUB-01 + LFE-LEAGUE-01)

## Cel

Hub = **ekran decyzji** (GDD §23), nie dashboard mid-season.

## State Machine

| Phase        | Hub render?                  | Warunek                                  |
| ------------ | ---------------------------- | ---------------------------------------- |
| `NEW_CLUB`   | **Nie** — First Match tunnel | `!first_match_completed_at`              |
| `EARLY_CLUB` | **Tak (MVP Thin A)**         | first match done; fixtures SSOT optional |
| `SEASON`     | Future (full league slice)   | nie używane w LFE-LEAGUE-01 Thin A       |
| `PLAYOFF`    | Future                       | faza playoff                             |
| `OFFSEASON`  | Future                       | międzysezonie                            |

**Resolver fazy (jedyny):** `resolveHubPhase(club)` — semantyka bez zmian (Thin A = zawsze `EARLY_CLUB` po First Match).

**Sesja Hub:** `resolveHubSession(phase, nextFixture, lastPlayed)` → `matchday` | `post_match` | `idle`.

**Primary CTA (jedyny):** `resolvePrimaryCta(phase, session, { nextFixture })` — przy `matchday` → `/match/{fixtureId}`.

## Fixtures SSOT (LFE-LEAGUE-01)

| Fakt             | SSOT                                       |
| ---------------- | ------------------------------------------ |
| Terminarz ligowy | tabela `fixtures` → `FixtureDto`           |
| Next match       | `getNextFixture` (`status=upcoming`)       |
| Opponent id      | `opponent_club_id` + katalog AI w kodzie   |
| Generator        | `ensureClubFixtures` — 3 mecze, idempotent |

First Match (`id=first`) **nie** jest wierszem `fixtures`.

## EARLY_CLUB layout

1. Hero — Club DTO
2. Last Match Strip — First Match copy **lub** ostatni played fixture
3. **Exactly 1** Primary CTA — mecz (upcoming) lub „Zobacz skład”
4. ≤5 Secondary (Terminarz **open** gdy fixtures istnieją)
5. Lekki status (IV liga, stadion, kolejka)
6. Jedna wiadomość zarządu

## Progressive unlock (shell)

Open: Panel, Klub, Kadra, **Terminarz**, Wiadomości, Profil, Ustawienia, Osiągnięcia, Status.  
Soft-lock: Liga, Trening, Akademia, Skauting, Transfery, Finanse, Sponsorzy, Zarząd, Stadion.

Implementacja: `resolveNavAccess(itemId, phase)`.

## Zakazane na EARLY_CLUB

Kolejka 12 FOMO, Top 4, tabela punktowa, recent results fiction, finanse € mid, trening peer-CTA, „okno transferowe”, kontuzje mid-season, `dashboardMock` / `sessionChrome` na ścieżce Hub.

## Powiązania

Kod: `components/hub/EarlyClubHub.tsx` · `lib/hub/*` · `lib/fixtures/*` · shell layout.  
GDD: §23 (z wyjątkiem Hub-before-match → tunnel).

## Last updated

2026-07-24 — LFE-LEAGUE-01
