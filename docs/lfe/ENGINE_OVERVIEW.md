# LFE — Engine Overview

## Cel dokumentu

Opis silnika LFE: warstwy, odpowiedzialności, granice.

## Aktualny stan

Silnik gotowy do konsumowania przez app na poziomie session/spatial/commands. **Bez** Physics/AI/Rules gameplay.

## Opis działania — warstwy

| Warstwa | Odpowiedzialność |
|---------|------------------|
| **Session** | Fasada meczu: lifecycle sesji, dispatch, step/run, read models |
| **Commands** | Walidacja + intencjonalne mutacje + eventy |
| **State machine** | Fazy meczu (kickoff → play → HT → … → finished) |
| **Simulation** | Tick loop + system pipeline |
| **Domain** | Czyste dane meczu (Match, Player, Lineup, …) |
| **Positioning** | Layout / spawn / zones / spatial snapshot (bez fizyki) |
| **Core runtime** | Clock, time controller, tick engine, logger |
| **RNG / Events / Scheduler / World / Replay / Config** | Determinizm, bus, jobs, kontener świata, snapshoty, config |
| **RESERVED** | physics, ai, rules, ecs |

## Granice

- **IN:** seed, składy, settings, komendy, tick advancement.  
- **OUT:** React, DOM, Supabase, sieć, ekonomia GDD, Canvas.  
- **Renderer** (przyszły) jest konsumentem — nie częścią LFE.

## Najważniejsze decyzje

- Headless + determinism first.  
- Session owns orchestration.  
- Freeze definiuje co wolno eksportować.

## Powiązania

[PUBLIC_API.md](./PUBLIC_API.md) · [MATCH_FLOW.md](./MATCH_FLOW.md) · [ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md) · [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md)

## Last updated

2026-07-23
