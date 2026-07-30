# Platform — League

## Cel

Terminarz i tabela ligowa (Thin). Hub konsumuje next match + chip pozycji.

## SSOT

| Fakt       | Źródło                                                                |
| ---------- | --------------------------------------------------------------------- |
| Terminarz  | tabela `fixtures` → `FixtureDto`                                      |
| Next match | `getNextFixture` (`status=upcoming`)                                  |
| Opponent   | `opponent_club_id` + katalog AI                                       |
| Plan       | **wyłącznie** `planClubFixtures(clubId)` (pure)                       |
| Ensure     | `ensureClubFixtures` — insert / **top-up** z tego samego planu        |
| Liczba     | `LEAGUE_FIXTURE_COUNT = 22` (double RR vs 11 AI · GDD §10)            |
| Runda 1    | MD1–11 — identity LEAGUE-03 (nigdy nie przebudowywane)                |
| Runda 2    | MD12–22 — rewanże (`!isHome`, ten sam opponent)                       |
| Tabela     | **wyłącznie** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` |
| AI↔AI      | **double RR** derive (bez Match Engine, bez standings DB)             |
| Chip       | `resolvePlayerLeaguePositionLabel(table)`                             |

First Match (`id=first`) **nie** jest wierszem `fixtures`.

### Top-up (LFE-LEAGUE-03 / LFE-LEAGUE-04)

- Brakujące matchday z `planClubFixtures` — **bez** nowego planu, **bez** nadpisu istniejących.
- Kluby z MD1–11: top-up wyłącznie **MD12–22**.
- Nie zmienia statusów `played` / istniejącego `upcoming`.
- Gdy brak `upcoming` → najniższy brakujący MD = `upcoming`.

## UI

- `/league` — tylko resolver.
- Hub: Primary CTA next match; Nav Liga open na `SEASON`.

## Decyzje

D15 (fixtures) · D17 (table) · **D28** (calendar 22 / double RR) — [`../DECISIONS.md`](../DECISIONS.md).  
GDD §10: **22** fixtures (home+away) — **CLOSED** w kodzie (LFE-LEAGUE-04).

## Poza Thin

Season End · awans/spadek runtime · 1 mecz/dzień · soft backlog · standings DB · playoff.

## Kod

`lib/fixtures/*` · `lib/league/*`

## Last updated

2026-07-30 — LFE-LEAGUE-04 CLOSE
