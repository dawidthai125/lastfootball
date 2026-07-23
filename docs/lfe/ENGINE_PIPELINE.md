# LFE — Engine Pipeline

## Cel dokumentu

Tekstowy diagram orkiestracji silnika (od wejścia do renderu).

## Aktualny stan

Pipeline EPIC-1…7 działa headless. **Renderer = przyszły konsument** (niezaimplementowany w LFE).

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
        │   Clock → Scheduler → Lifecycle(SM) → Event → Replay
        │        │
        │        ▼
        │   Event flush + Snapshot buffer
        │
        ├── getMatchState()      ──► UI / future Renderer
        ├── getSpatialState()    ──► UI / future Canvas
        ├── getEvents()          ──► Report
        └── snapshots()          ──► Replay / debug
```

### State Machine (w Lifecycle system / komendach)

```
MatchLifecycleState (phase SSOT)
  apply via commands + lifecycle system
  UI reads phase from MatchState — does not own tables
```

### Renderer (Future)

```
React / Canvas
  reads session read-models
  sends commands only through session.dispatch / shortcuts
  NEVER imports simulation internals
```

## Najważniejsze decyzje

- Kolejność systems jest SSOT priorytetów (EPIC-4).
- Replay jest częścią ticka, nie osobnym trybem app.

## Powiązania

[MATCH_FLOW.md](./MATCH_FLOW.md) · [ENGINE_OVERVIEW.md](./ENGINE_OVERVIEW.md) · epic4-simulation-systems.md

## Last updated

2026-07-23
