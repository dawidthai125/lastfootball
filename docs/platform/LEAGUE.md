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
| Liczba     | `LEAGUE_FIXTURE_COUNT = 11` (single RR vs 11 AI)                      |
| Tabela     | **wyłącznie** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` |
| AI↔AI      | deterministyczny derive (bez Match Engine, bez standings DB)          |
| Chip       | `resolvePlayerLeaguePositionLabel(table)`                             |

First Match (`id=first`) **nie** jest wierszem `fixtures`.

### Top-up (LFE-LEAGUE-03)

- Brakujące matchday z `planClubFixtures` — **bez** nowego planu, **bez** nadpisu istniejących.
- Identity MD4–11 = to, co pełny plan 11 miałby od początku (prefiks MD1–3 = legacy 3).
- Nie zmienia statusów `played` / istniejącego `upcoming`.
- Gdy brak `upcoming` (np. krótkie 3 rozegrane) → najniższy brakujący MD = `upcoming`.

## UI

- `/league` — tylko resolver.
- Hub: Primary CTA next match; Nav Liga open na `SEASON`.

## Decyzje

D15 (fixtures) · D17 (table) — [`../DECISIONS.md`](../DECISIONS.md).  
Thin vs GDD §10: **11** fixtures (single RR), nie pełne **22** (home+away) — Future.

## Poza Thin

Pełne 22 kolejki, standings DB, playoff, awans/spadek runtime.

## Kod

`lib/fixtures/*` · `lib/league/*`

## Last updated

2026-07-25 — LFE-LEAGUE-03 CLOSE
