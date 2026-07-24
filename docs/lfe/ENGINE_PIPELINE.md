# LFE — Engine Pipeline

## Cel dokumentu

Tekstowy diagram orkiestracji silnika (od wejścia do konsumentów UI).

## Aktualny stan

Pipeline EPIC-1…7 + **MatchEngineSystem** (AI + Engine) działa headless.  
**Renderer Canvas** jest w `apps/web` (konsument read-modeli) — nie w LFE.

## Opis działania

```
createMatch(config)
        │
        ▼
   MatchSession
        │
        ├── start / pause / resume / stop / dispose
        │
        ├── dispatch(Command) ──► CommandBus ──► Handlers
        │                              │
        │                              ├── mutate MatchState / World
        │                              └── emit EngineEvents
        │
        ├── step() / run(ticks)
        │        │
        │        ▼
        │   Simulation tick
        │        │
        │        ▼
        │   Systems pipeline
        │   Clock → Scheduler → Lifecycle(SM)
        │        → MatchEngineSystem (GAMEPLAY)
        │             → simulateMatchTick
        │                  → Match AI (decide)
        │                  → Engine (RNG + mutate + emits)
        │        → Event → Replay (world snapshot buffer)
        │
        ├── getMatchState()      ──► LiveMatchRuntime / Post Match
        ├── getSpatialState()    ──► Canvas derive (kickoff + presentation)
        ├── getEvents()          ──► Canvas FX / Report / Post Match
        └── snapshots()          ──► LFE debug replay (≠ web Replay UI)
```

### Web consumers (poza LFE)

```
LiveMatchRuntime
  → MatchCanvasReadModel
  → Canvas Renderer (LIVE) + ReplayBuffer
  → ReplayController (REPLAY) → Canvas
  → Post Match
```

### State Machine

```
MatchLifecycleState (phase SSOT)
  apply via commands + lifecycle system
  UI reads phase from MatchState — does not own tables
```

## Najważniejsze decyzje

- Kolejność systems = SSOT priorytetów (EPIC-4 + MatchEngine).
- LFE Replay snapshot ≠ web ring-buffer Replay.
- Canvas nigdy nie importuje Engine/AI.

## Powiązania

[MATCH_FLOW.md](./MATCH_FLOW.md) · [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [ENGINE_OVERVIEW.md](./ENGINE_OVERVIEW.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
