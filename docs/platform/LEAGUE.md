# Platform — League

## Cel

Terminarz i tabela ligowa (Thin). Hub konsumuje next match + chip pozycji.

## SSOT

| Fakt       | Źródło                                                                |
| ---------- | --------------------------------------------------------------------- |
| Terminarz  | tabela `fixtures` → `FixtureDto`                                      |
| Next match | `getNextFixture` (`status=upcoming`)                                  |
| Opponent   | `opponent_club_id` + katalog AI                                       |
| Generator  | `ensureClubFixtures` — **3** mecze, idempotent                        |
| Tabela     | **wyłącznie** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` |
| AI↔AI      | deterministyczny derive (bez Match Engine, bez standings DB)          |
| Chip       | `resolvePlayerLeaguePositionLabel(table)`                             |

First Match (`id=first`) **nie** jest wierszem `fixtures`.

## UI

- `/league` — tylko resolver.
- Hub: Primary CTA next match; Nav Liga open na `SEASON`.

## Decyzje

D15 (fixtures) · D17 (table) — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Pełny kalendarz 11, standings DB, playoff.

## Kod

`lib/fixtures/*` · `lib/league/*`

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
