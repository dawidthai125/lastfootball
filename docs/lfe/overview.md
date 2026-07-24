# LFE package layout

```
packages/lfe/src/
  index.ts              # public API barrel (over-export vs freeze)
  status.ts             # module readiness · LFE_VERSION
  config/               # ticks/sec, snapshot limits, log level
  core/                 # tick engine, game clock, time controller, logger
  rng/                  # seeded Mulberry32
  events/               # event bus + GAMEPLAY_MATCH_EVENTS
  scheduler/            # tick / seconds / match-minute jobs
  world/                # World State container
  simulation/           # headless loop + systems pipeline
    systems/            # Clock, Scheduler, Lifecycle, MatchEngine, Event, Replay
  replay/               # per-tick world snapshots (≠ web Replay UI)
  math/                 # Vec2 helpers
  gameplay/             # GAMEPLAY-01 facade notes
  match/
    domain/             # EPIC-2 (+ tactics on MatchState)
    state-machine/      # EPIC-3 lifecycle SSOT
    positioning/        # EPIC-7 spatial (no physics)
    engine/             # MATCH-ENGINE-01 tick resolve
    session/            # EPIC-6 MatchSession + createMatch
    session.ts          # re-export createMatch
    types.ts            # MatchInput / Handle
  commands/             # EPIC-5 + tactical commands
  ai/                   # MATCH-AI-01 decisions (Engine depends)
  physics/              # stub
  rules/                # stub
  ecs/                  # reserved stub
  utils/                # pure helpers
  input/                # MatchInput re-export
```

## Public API (skrót)

- Entry: `createMatch(config)` → `MatchSession`
- Session: start/pause/resume/dispatch/step/run/stop/dispose + reads
- Gameplay: tactics commands, `GAMEPLAY_MATCH_EVENTS`, `gameplay` namespace
- Engine/AI (barrel): `simulateMatchTick`, `decidePossession*`, … — prefer session for app
- Status: `getEngineStatus`, `LFE_VERSION` = `0.9.1-match-ai01`

Pełniej: [`PUBLIC_API.md`](./PUBLIC_API.md) · [`GAMEPLAY_MATCH_STACK.md`](./GAMEPLAY_MATCH_STACK.md)

## Tick pipeline

```
Clock → Scheduler → Lifecycle → MatchEngineSystem → Event → Replay(snapshot)
```

Default rate: **20 ticks / second**.

## Still stubbed

- Physics (ball kinematics)
- Full Rules
- ECS

## Boundaries

- LFE: no React / DOM / Supabase
- Canvas / Replay UI: `apps/web/src/gameplay/*`

## Powiązania

[`CURRENT_STATUS.md`](./CURRENT_STATUS.md) · [`ENGINE_OVERVIEW.md`](./ENGINE_OVERVIEW.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
