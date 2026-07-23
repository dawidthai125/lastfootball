# LFE — Match Flow

## Cel dokumentu

Opis przebiegu meczu od `createMatch()` do zakończenia sesji.

## Aktualny stan

Flow sesji działa (EPIC-6). Fazy lifecycle (EPIC-3) + komendy (EPIC-5). Brak ruchu piłki / AI.

## Opis działania

### 1. Build config

Aplikacja (transitional) składa `MatchSessionConfig`:

- seed, team IDs, names
- `players`, `homeLineup` / `awayLineup`, benches
- opcjonalnie `engine` (`DeepPartial<LfeConfig>`), `logger`

### 2. Create

```ts
const session = createMatch(config);
// SessionStatus: created → ready (wewnętrznie wg implementacji)
```

Buduje model meczu, simulation, command bus, spatial kickoff snapshot.

### 3. Start

```ts
session.start(); // lub dispatch(createStartMatchCommand(...))
```

Komendy → lifecycle / world status.

### 4. Kickoff / play

```ts
session.dispatch(createKickoffCommand(...));
session.run(n); // lub step() w pętli UI/raf
```

Simulation tickuje; systems aktualizują clock/scheduler/lifecycle/events/replay.

### 5. Live control

- `pause` / `resume`
- kolejne komendy (end, abandon, walkover, …)
- UI czyta: `getMatchState()`, `getSpatialState()`, `getEvents()`

### 6. End

- komenda końca / terminal lifecycle state
- `stop()` / `dispose()`
- `MatchResult` / eventy pod Report (GDD §9)

### Mapowanie na GDD §9

| GDD    | LFE                                      |
| ------ | ---------------------------------------- |
| Pre    | config + createMatch + lineup            |
| Live   | start/run/dispatch + spatial/state reads |
| Report | events / result / snapshots              |
| Hub    | dispose → powrót do app                  |

## Najważniejsze decyzje

- UI nie omija sesji.
- Tempo meczu = `run`/`step`, nie osobny „god mode” mutujący stan.

## Powiązania

[ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md) · [PUBLIC_API.md](./PUBLIC_API.md) · [`../game-design/GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md) (§9)

## Last updated

2026-07-23
