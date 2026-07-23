# LFE — Public API (summary)

## Cel dokumentu

Szybki skrót warstw API. **Pełny kontrakt:** [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md).

## Aktualny stan

Kontrakt PUBLIC API v1 **zamrożony**.  
`packages/lfe/src/index.ts` nadal **przeeksponowany** (dług implementacyjny) — aplikacja powinna trzymać się kontraktu, nie „wszystkiego co się importuje”.

## Opis działania

### PUBLIC (zalecane dla app)

- `createMatch`, `MatchSession`, `MatchSessionConfig`, `SessionStatus`
- `MatchInput`, `MatchResult`, `MatchEvent`
- Status: `getEngineStatus`, `LFE_VERSION`, …
- Domain **types** + **transitional** factories (`createPlayer`, `createLineup`, …)
- Thin command types + factories
- Spatial read: `getSpatialState`, `MatchSpatialState`, `Position`, …
- `LfeConfig`, `DeepPartial`, `DEFAULT_LFE_CONFIG`, `LogLevel`

**Metody sesji PUBLIC:** `start/pause/resume/stop/dispose`, `dispatch`, `step/run`, `getMatchState`, `getSpatialState`, `getEvents`, `snapshots` / `latestSnapshot`

### ADVANCED

- `getWorld()`, `context()` / `MatchSessionContext`
- World/runtime **types**, formation layout helpers, `Vec2`, …

### TESTING

- `createSimulation`, systems, SM tables/`apply*`, bus wiring, `resetCommandIdSeq`, …

### INTERNAL

- Implementacje simulation/core/commands/SM/session build

### DEPRECATED

- `MatchHandle`, `session.ts` shim, `Seed`/`ClockState`, `runToEnd`

### RESERVED

- `physics/`, `ai/`, `rules/`, `ecs/`, `utils/`

### EXPERIMENTAL

- Wszystko oznaczone jako eksperyment — brak stabilności

## Najważniejsze decyzje

- Oficjalny entry = tylko `createMatch`.
- Factories domain = transitional.
- Nie promuj TESTING → PUBLIC bez AUDIT.

## Powiązania

[LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md) · [ENGINE_OVERVIEW.md](./ENGINE_OVERVIEW.md) · [`../DECISIONS.md`](../DECISIONS.md)

## Last updated

2026-07-23
