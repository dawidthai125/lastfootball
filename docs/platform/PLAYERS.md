# Platform — Players (Squad)

## Cel

Trwała kadra klubu gracza (Players Thin) + **Player Development Thin** (GDD §7 wycinek): `potential` + wzrost skill z meczu (primary) i treningu (supporting).

**UI naming:** ekran `/squad` w produkcie = **Kadra**; **Skład** = XI meczowy (nie label nav `/squad`).  
Glosariusz: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.6.

## SSOT

| Fakt              | Źródło                                                                                        |
| ----------------- | --------------------------------------------------------------------------------------------- |
| Wiersze           | tabela `players`                                                                              |
| UI                | **wyłącznie** `resolveClubSquad(club, rows)` → `SquadDto`                                     |
| IO                | `listClubPlayers` (aktywna kadra; bez `DEPARTED`)                                             |
| Skill             | `players.skill` (1…99)                                                                        |
| Potential         | `players.potential` (1…99; `potential ≥ skill`) — wariant B: `max(skill, seeded)`             |
| Potential UI      | **tylko pasmo** (`potentialLabel`: Niski / Średni / Wysoki / Bardzo wysoki) — **bez liczby**  |
| Match development | pure `applyMatchDevelopmentEffects` + RPC `apply_match_development` (atomowo; idempotent log) |
| Starter ids       | `s-{tag}-…`                                                                                   |
| Buy ids           | `t-{tag}-…` (Transfers)                                                                       |
| Version           | default `1`                                                                                   |
| Status            | `READY` \| `INJURED` \| `SUSPENDED` \| `TIRED` \| `DEPARTED`                                  |

## Development Thin (LFE-PLAYERS-02)

| Ścieżka             | Reguła                                                                                   |
| ------------------- | ---------------------------------------------------------------------------------------- |
| Generacja potential | Deterministyczny seed (id+age) → `potential = max(skill, seeded)`                        |
| Match (PRIMARY)     | Tylko starterzy; max +1 skill / gracz / mecz; **K_MATCH=5**; `skill` nigdy > `potential` |
| Persist meczu       | `apply_match_development(club, match_key, updates)` + `match_development_log`            |
| Training            | LFE-TRAINING-02 respektuje ceiling `potential` (TS + clamp w RPC)                        |
| Transfer fee        | **bez zmian** — `deriveTransferFee(skill, age)` only                                     |
| Age                 | Hook pure `applySeasonAgeEffects` / `onSeasonEnd` — **brak** auto `age++` w produkcie    |
| LFE                 | **zero zmian**                                                                           |

## Seed

- Create / backfill / testy: `seedClubRoster` / inserts **z** `potential`.
- Runtime: **zakaz** fallbacku do seeda → `SquadUnavailableError`.
- AI: `seedBotSquad` / `seedOpponentSquad` (poza tabelą gracza).

## Decyzje

D19 · **D22** — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Academy / talenty · career history · XP · attribute DB · numeric potential w UI · auto season-end age · morale numeric.

## UI (presentation)

Ekran `/squad` = decision-first; Player Card (`/players/[id]`) pokazuje **pasmo** potencjału.  
Post Match: sygnały `+1 umiejętność` (nazwy), bez liczby potential.  
Szczegóły: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

## Kod

`lib/squad/*` (`potential.ts`, `match-development.ts`, `apply-match-development.ts`, `season-age.ts`) · `/squad` · `/players/[id]` · complete fixture / first-match  
Migracja: `supabase/migrations/20260729120000_player_potential_development.sql`

## Operacyjne

> Migracja `players.potential` + RPC `apply_match_development` musi zostać zastosowana na środowisku produkcyjnym.

## Last updated

2026-07-29 — LFE-PLAYERS-02
