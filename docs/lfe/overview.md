# LFE package layout

```
packages/lfe/src/
  index.ts              # public API
  status.ts             # module readiness report
  config/               # ticks/sec, snapshot limits, log level
  core/                 # tick engine, game clock, time controller, logger
  rng/                  # seeded Mulberry32
  events/               # event bus
  scheduler/            # tick / seconds / match-minute jobs
  world/                # single World State (slots still unbound to MatchState)
  simulation/           # headless loop + EPIC-4 systems pipeline
    systems/            # Clock, Scheduler, Lifecycle, Event, Replay
  replay/               # per-tick snapshots
  math/                 # Vec2 helpers
  ecs/                  # reserved (stub)
  utils/                # pure helpers
  match/
    domain/             # EPIC-2 match domain model (data only)
    state-machine/      # EPIC-3 lifecycle SSOT
    positioning/        # EPIC-7 spatial model (no physics)
    session/            # EPIC-6 MatchSession + createMatch
    session.ts          # re-export createMatch
    types.ts            # MatchInput / Handle
  commands/             # EPIC-5 command bus + match commands
  physics/              # stub — no ball physics yet
  ai/                   # stub
  rules/                # stub
  input/                # MatchInput re-export
```

## Public API

### EPIC-1

- `createSimulation({ seed, config? })`
- `createRng`, `createEventBus`, `createScheduler`, …

### EPIC-2

- Match domain: `createMatchModel`, `createMatchState`, `createPlayer`, `createTeam`, `createLineup`, …
- `MatchInput` uses `Lineup` / `Bench` / `Player`

### EPIC-3

- `applyLifecycleEvent`, `transitionMatchState`, `STATE_DEFINITIONS`, `TRANSITION_RULES`
- `MatchState.phase` ∈ `MatchLifecycleState`

### EPIC-4

- `SimulationSystem` + `SystemPriority` + `SimulationPipeline`
- Built-ins: Clock → Scheduler → Lifecycle → Event → Replay

### EPIC-5

- `Command` / `CommandBus` / `CommandHandler` / `CommandResult`
- `sim.dispatch(...)` — wspólna ścieżka dla AI, UI, botów, testów

### EPIC-6

- `createMatch(config)` → `MatchSession` (jedyny publiczny entry meczu)
- `start` / `pause` / `resume` / `dispatch` / `stop` / `dispose`

### EPIC-7

- `Position`, `FormationLayout`, `SpawnPoints`, `PitchGrid`, `Zones`, `distanceCalculator`
- `session.getSpatialState()` — kickoff layout z formacji

### Still stubbed

- Pełna logika gry (physics / AI / ball movement) — kolejne EPIC-i

## Tick pipeline

`update → systems → events → snapshot → next`

Default rate: **20 ticks / second**.

## Boundaries

- No React / Next / Supabase imports
- No Physics / AI / movement implementation
- Canvas remains a future dumb renderer
