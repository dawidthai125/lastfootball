# LFE — Match Flow

## Cel dokumentu

Opis przebiegu meczu od `createMatch()` do zakończenia sesji (i mostu do web UI).

## Aktualny stan

Flow sesji + **Match Engine / AI** na ticku działa (`0.9.1-match-ai01`).  
Web: LiveMatchRuntime → Canvas → Replay → Post Match (poza LFE).

## Opis działania

### 1. Build config

Aplikacja składa `MatchSessionConfig` (lub `createSessionFromFixture` w web):

- seed, team IDs, names
- `players`, `homeLineup` / `awayLineup`, benches
- tactics (Gameplay Foundation)
- opcjonalnie `engine` (`DeepPartial<LfeConfig>`), `logger`

### 2. Create

```ts
const session = createMatch(config);
```

Buduje model meczu, simulation (w tym **MatchEngineSystem**), command bus, spatial kickoff snapshot.

### 3. Start / Kickoff

```ts
session.start();
session.dispatch(createKickoffCommand(...));
```

### 4. Play (Live)

```ts
session.run(n); // lub step() w pętli UI
```

Na ticku:

```
Clock → Scheduler → Lifecycle → MatchEngineSystem
  → simulateMatchTick → Match AI decide* → Engine RNG + mutate
→ Event → Replay(snapshot world LFE)
```

UI czyta: `getMatchState()`, `getSpatialState()`, `getEvents()`.

### 5. Live control

- `pause` / `resume`
- komendy taktyczne (pressing, tempo, …) przez CommandBus
- koniec / abandon / walkover

### 6. End → Report (web)

- terminal lifecycle / `MATCH_END`
- web: **Post Match** z EventBus + MatchState
- opcjonalnie **Replay** seek (web buffer, nie LFE `snapshots`)

### Mapowanie na GDD §9

| GDD    | Implementacja                                                       |
| ------ | ------------------------------------------------------------------- |
| Pre    | fixture + createMatch + lineup UI                                   |
| Live   | LiveMatchRuntime + Canvas LIVE                                      |
| Report | Post Match (+ Replay)                                               |
| Hub    | po First Match → EARLY_CLUB (`resolveHubPhase`); nie „dispose only” |

## Najważniejsze decyzje

- UI nie omija sesji.
- Tempo meczu = `run`/`step`.
- Web Replay ≠ LFE world snapshot buffer (osobne warstwy).
- First Match: `createSessionFromFirstMatch` → ten sam `createMatch`.

## Powiązania

[ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md) · [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md) · [`../platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md)

## Last updated

2026-07-24 — LFE-DOCS-01
