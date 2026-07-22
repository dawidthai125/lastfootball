# LFE package layout

```
packages/lfe/src/
  index.ts          # public API
  status.ts         # foundation status report
  core/             # clock, rng, seed (stub)
  world/            # pitch, entities (stub)
  physics/          # ball, collisions (stub)
  ai/               # tactics decisions (stub)
  rules/            # fouls, restarts (stub)
  match/            # session placeholder
  events/           # event stream (stub)
  input/            # MatchInput DTO (stub)
```

## Public API (foundation)

- `LFE_VERSION`, `LFE_STATUS`
- `getEngineStatus()` → module readiness report
- `createMatch(input)` → stub handle (throws on `runToEnd`)

Simulation logic is intentionally absent.
