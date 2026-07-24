# LFE — Engine Overview

## Cel dokumentu

Opis silnika LFE: warstwy, odpowiedzialności, granice.

## Aktualny stan

Silnik: EPIC-1…7 + **Gameplay Foundation** + **Match AI** + **Match Engine** · `0.9.1-match-ai01`.  
**Bez** Physics (kinematycznej) i pełnych Rules.  
Canvas / Replay UI = konsumenty w `apps/web`.

## Opis działania — warstwy

| Warstwa                                                | Odpowiedzialność                                                      |
| ------------------------------------------------------ | --------------------------------------------------------------------- |
| **Session**                                            | Fasada meczu: lifecycle sesji, dispatch, step/run, read models        |
| **Commands**                                           | Walidacja + intencjonalne mutacje + eventy (w tym taktyczne)          |
| **State machine**                                      | Fazy meczu (kickoff → play → HT → … → finished)                       |
| **Simulation**                                         | Tick loop + system pipeline                                           |
| **Match Engine**                                       | Tick sim: zegar połowy, possession/action resolve, score/stats, emits |
| **Match AI**                                           | Czyste decyzje (prawdopodobieństwa) — Engine wykonuje RNG             |
| **Gameplay**                                           | Event vocab + tactics + tactical commands                             |
| **Domain**                                             | Czyste dane meczu (Match, Player, Lineup, MatchState, …)              |
| **Positioning**                                        | Layout / spawn / zones / spatial snapshot (bez fizyki)                |
| **Core runtime**                                       | Clock, time controller, tick engine, logger                           |
| **RNG / Events / Scheduler / World / Replay / Config** | Determinizm, bus, jobs, świat, world-snapshots, config                |
| **RESERVED / stub**                                    | physics, rules, ecs                                                   |

## Granice

- **IN:** seed, składy, settings, komendy, tick advancement.
- **OUT:** React, DOM, Supabase, sieć, ekonomia GDD, Canvas DOM.
- **Renderer** jest konsumentem w web — nie częścią LFE.

## Najważniejsze decyzje

- Headless + determinism first.
- Session owns orchestration.
- Engine → AI hard dependency.
- Freeze definiuje bazowy kontrakt; rozszerzenia AI/Engine dokumentuj w PUBLIC_API / GAMEPLAY_MATCH_STACK.

## Powiązania

[PUBLIC_API.md](./PUBLIC_API.md) · [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [MATCH_FLOW.md](./MATCH_FLOW.md) · [ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
