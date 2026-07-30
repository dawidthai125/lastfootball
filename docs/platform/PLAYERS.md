# Platform — Players (Squad)

## Cel

Trwała kadra klubu gracza (Players Thin) + **Player Development Thin** (GDD §7 wycinek): `potential` + wzrost skill z meczu (primary) i treningu (supporting) + **Academy Thin A** (GDD §16): Intake + Promote na tym samym SSOT.

**UI naming:** ekran `/squad` w produkcie = **Kadra**; **Skład** = XI meczowy (nie label nav `/squad`).  
Glosariusz: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.6.

## SSOT

| Fakt              | Źródło                                                                            |
| ----------------- | --------------------------------------------------------------------------------- |
| Wiersze           | tabela `players`                                                                  |
| UI kadry          | **wyłącznie** `resolveClubSquad(club, rows)` → `SquadDto` (senior only)           |
| UI akademii       | **wyłącznie** `resolveClubAcademy(club, rows, phase)` → `AcademyDto`              |
| IO                | `listClubPlayers` (bez `DEPARTED`; obejmuje perspektywy — filtr w resolverach)    |
| Skill             | `players.skill` (1…99)                                                            |
| Potential         | `players.potential` (1…99; `potential ≥ skill`) — wariant B: `max(skill, seeded)` |
| Potential UI      | **tylko pasmo** (`potentialLabel`) — **bez liczby**                               |
| Academy track     | `players.academy_track` · `promoted_at` (D23)                                     |
| Match development | pure `applyMatchDevelopmentEffects` + RPC `apply_match_development` (senior only) |
| Starter ids       | `s-{tag}-…`                                                                       |
| Academy ids       | `a-{tag}-…`                                                                       |
| Buy ids           | `t-{tag}-…` (Transfers)                                                           |
| Version           | default `1`                                                                       |
| Status            | `READY` \| `INJURED` \| `SUSPENDED` \| `TIRED` \| `DEPARTED`                      |

## Development Thin (LFE-PLAYERS-02)

| Ścieżka             | Reguła                                                                                    |
| ------------------- | ----------------------------------------------------------------------------------------- |
| Generacja potential | Deterministyczny seed (id+age) → `potential = max(skill, seeded)`                         |
| Match (PRIMARY)     | Tylko starterzy senior; max +1 skill / gracz / mecz; **K_MATCH=5**; `skill` ≤ `potential` |
| Persist meczu       | `apply_match_development(club, match_key, updates)` + `match_development_log`             |
| Training            | LFE-TRAINING-02 respektuje ceiling `potential` (TS + clamp w RPC); senior only            |
| Transfer fee        | **bez zmian** — `deriveTransferFee(skill, age)` only                                      |
| Age                 | Hook pure `applySeasonAgeEffects` / `onSeasonEnd` — **brak** auto `age++` w produkcie     |
| LFE                 | **zero zmian**                                                                            |

## Academy Thin A (LFE-ACADEMY-01)

| Fakt       | Reguła                                                       |
| ---------- | ------------------------------------------------------------ |
| Model      | Ten sam `players` — zakaz drugiej tabeli / youth OVR         |
| Intake     | max **3** perspektywy · `academy_track=true` · potential D22 |
| Promote    | `academy_track=false` · `promoted_at=now()` · bez buffa      |
| Visibility | Perspektywy poza squad / XI / training / transfers           |
| Unlock     | soft-lock przed SEASON · open w SEASON                       |
| Migracja   | `supabase/migrations/20260730120000_academy_track.sql`       |

## Seed

- Create / backfill / testy: `seedClubRoster` / inserts **z** `potential` · `academy_track=false`.
- Runtime: **zakaz** fallbacku do seeda → `SquadUnavailableError`.
- AI: `seedBotSquad` / `seedOpponentSquad` (poza tabelą gracza).

## Decyzje

D19 · **D22** · **D23** — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin (kod)

Talenty · career history · XP · attribute DB · numeric potential w UI · auto season-end age · morale numeric · poziomy akademii · cash-gate · trening akademii.

## UI (presentation)

Ekran `/squad` = decision-first; `/academy` = Intake + lista perspektyw (pasma); Player Card (`/players/[id]`) pokazuje **pasmo** potencjału.  
Post Match: sygnały `+1 umiejętność` (nazwy), bez liczby potential.  
Szczegóły: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

## Kod

`lib/squad/*` · `lib/academy/*` · `/squad` · `/academy` · `/players/[id]` · complete fixture / first-match  
Migracje: `20260729120000_player_potential_development.sql` · `20260730120000_academy_track.sql`

## Operacyjne

> Migracje `players.potential` + RPC `apply_match_development` **oraz** `academy_track` / `promoted_at` zastosowane na prod.

## Last updated

2026-07-30 — LFE-ACADEMY-01 · D23
