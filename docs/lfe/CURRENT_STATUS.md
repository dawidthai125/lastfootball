# LFE — Current Status

## Cel dokumentu

Status implementacji EPIC-ów i modułów silnika.

## Aktualny stan

|                         |                                                                          |
| ----------------------- | ------------------------------------------------------------------------ |
| **Package**             | `0.9.1-match-ai01`                                                       |
| **EPIC-1…7**            | ✅ DONE (na `main`)                                                      |
| **Gameplay Foundation** | ✅ DONE                                                                  |
| **Match AI**            | ✅ DONE                                                                  |
| **Match Engine**        | ✅ DONE                                                                  |
| **Architecture Freeze** | APPROVED · root = PUBLIC only · **LFE-PUBLIC-API-01 CLOSED** (`ce00327`) |

> Ten plik = **tylko silnik LFE**. Platforma (First Match / Hub) → [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../platform/`](../platform/).  
> Domain feat **`962f0a8`** (LFE-RATINGS-V2) · PUBLIC **`ce00327`** (D119–D121) · **NEXT** = Owner GO (§22 push / `/advanced`).

## Status EPIC / stack

| ID                       | Nazwa               | Status                         |
| ------------------------ | ------------------- | ------------------------------ |
| EPIC-1                   | Foundation          | **DONE**                       |
| EPIC-2                   | Match Domain        | **DONE**                       |
| EPIC-3                   | Match State Machine | **DONE**                       |
| EPIC-4                   | Simulation Systems  | **DONE**                       |
| EPIC-5                   | Command System      | **DONE**                       |
| EPIC-6                   | Match Session       | **DONE**                       |
| EPIC-7                   | Positioning         | **DONE**                       |
| GAMEPLAY-01              | Gameplay Foundation | **DONE**                       |
| MATCH-AI-01              | Match AI            | **DONE**                       |
| MATCH-ENGINE-01          | Match Engine        | **DONE**                       |
| LFE-PLAYER-MATCH-DATA-01 | Player Match Data   | **DONE** (`4d43661` na `main`) |
| **LFE-RATINGS-V2**       | Assists / minutes   | **DONE** (`962f0a8` na `main`) |

## Moduły (`getEngineStatus()` — skrót)

| Ready ✅                                                                                     | Stub / Future ⬜                |
| -------------------------------------------------------------------------------------------- | ------------------------------- |
| core, rng, events, scheduler, world, simulation, replay (LFE snapshot), config               | **physics**, **rules**, **ecs** |
| match-domain, SM, systems, commands, match session, positioning, input                       |                                 |
| **gameplay-foundation**, **match-engine**, **match-ai**, **ai**                              |                                 |
| **player match stats** (`statistics.players` · goals/shots/fouls · **assists/minutes** Thin) |                                 |

`EngineStatus` nadal raportuje `'foundation'` (historyczna etykieta statusu — nie mylić z „tylko EPIC-1”).

## Następne (poza silnikiem / LFE)

- Web match pipeline (Canvas / Replay / Post Match / Live Bridge / **Player Ratings v2**) — **DONE**
- Physics / pełne Rules — **FUTURE** (Owner GO)
- Subpath exports `advanced` — **PLANNED** (Owner GO)
- Ratings v2 (assists / minutes) — **DONE** (`962f0a8`)
- Zawężenie public `index.ts` do freeze — **DONE** (LFE-PUBLIC-API-01 · feat `ce00327`)

## Najważniejsze decyzje

- Engine **hard-depends** on AI (`resolve.ts`).
- Player attribution = deterministyczna (`attribute-player.ts`), **bez** dodatkowego RNG.
- Nie startować Physics bez Owner GO.
- Canvas / Replay / Post Match żyją w **`apps/web`**, nie w LFE.
- App → `@lastfootball/lfe` only · harness → `/testing` (D119–D121).

## Powiązania

[GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [README.md](./README.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../AI-HANDOFF.md`](../AI-HANDOFF.md)

## Last updated

2026-08-03 — LFE-RATINGS-V2 CLOSED · feat `962f0a8` · D119–D121 nienaruszone
