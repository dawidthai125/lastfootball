# Web — Match UI Pipeline (Canvas · Replay · Post Match)

## Cel dokumentu

Dokumentacja warstwy **aplikacji** (`apps/web`) dla przebiegu meczu Live → Canvas → Replay → Post Match.

**Nie** jest częścią pakietu `@lastfootball/lfe`.

## Aktualny stan

| Moduł                      | Status                           |
| -------------------------- | -------------------------------- |
| LiveMatchRuntime + bridge  | ✅ DONE (na `main` od RELEASE C) |
| Canvas Renderer 2D         | ✅ DONE (sprawdź WT / commit)    |
| Replay Buffer + Controller | ✅ DONE (sprawdź WT / commit)    |
| Post Match UI              | ✅ DONE (sprawdź WT / commit)    |

---

## Przepływ danych

```mermaid
flowchart TD
  PM[Pre Match UI] --> CSF[createSessionFromFixture]
  CSF --> CM[createMatch LFE]
  CM --> LMR[LiveMatchRuntime]
  LMR -->|session.run LIVE| ENG[Match Engine + AI]
  ENG --> MS[MatchState]
  ENG --> EB[EventBus]
  LMR --> RM[MatchCanvasReadModel]
  RM --> BUF[ReplayBuffer.append]
  RM -->|source=live| CV[Canvas Renderer]
  BUF --> RC[ReplayController]
  RC -->|source=replay| CV
  MS --> END{MATCH_END / FINISHED}
  END --> POST[Post Match View]
  POST -->|seek event tick| RC
```

---

## Moduły

### LiveMatchRuntime

|                      |                                                                                                                                                                                                                            |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Odpowiedzialność** | Sesja LFE, pulse symulacji, snapshot UI, CommandBus z UI, zapis Replay, tryb LIVE/REPLAY                                                                                                                                   |
| **Wejścia**          | `Fixture`, `LiveMatchBundle`                                                                                                                                                                                               |
| **Wyjścia**          | `LiveMatchSnapshot`, `canvasHost.present`, replay API                                                                                                                                                                      |
| **Pliki**            | `apps/web/src/gameplay/live-match-runtime.ts`, `use-live-match-runtime.ts`, `create-session-from-fixture.ts`                                                                                                               |
| **API**              | `getSnapshot`, `subscribe`, `dispatchUiCommand`, `startSimulation`/`stopSimulation`, `enterReplay`/`exitReplay`, `replayPlay`/`Pause`/`Stop`/`Seek`/`SeekRatio`/`SetSpeed`, `getPlaybackSource`, `replayBuffer`, `dispose` |

### Canvas Host + Renderer

|                      |                                                                                                             |
| -------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Odpowiedzialność** | Host DOM `#lf-match-canvas-root`; renderer 2D boisko/zawodnicy/piłka; FX EventBus; tryby `live` \| `replay` |
| **Wejścia**          | `MatchCanvasReadModel` (read-only)                                                                          |
| **Wyjścia**          | piksele Canvas (brak mutacji stanu)                                                                         |
| **Zależności**       | typy LFE (`MatchState`, `MatchSpatialState`, `EngineEvent`) — **bez** Engine/AI                             |
| **Pliki**            | `canvas-host.ts`, `gameplay/canvas/*`                                                                       |
| **API**              | `createMatchCanvasHost`, `createMatchCanvasRenderer`, `present`, `setPlaybackMode`                          |

### Replay

|                      |                                                                       |
| -------------------- | --------------------------------------------------------------------- |
| **Odpowiedzialność** | Ring buffer klatek; play/pause/stop/seek/speed; **bez** `session.run` |
| **Wejścia**          | kolejne `MatchCanvasReadModel` z LIVE                                 |
| **Wyjścia**          | `onPresent(model)` → Canvas                                           |
| **Pliki**            | `apps/web/src/gameplay/replay/*`                                      |
| **API**              | `createReplayBuffer`, `createReplayController`                        |

### Post Match

|                      |                                                                     |
| -------------------- | ------------------------------------------------------------------- |
| **Odpowiedzialność** | Raport po końcu: wynik, gole, timeline, stats; skok do Replay       |
| **Wejścia**          | `MatchState` + events (+ buffer do seek)                            |
| **Wyjścia**          | UI; wywołania istniejącego Replay API                               |
| **Pliki**            | `apps/web/src/components/match/post-match/*`                        |
| **API**              | `buildPostMatchSummary`, `findReplayIndexForEvent`, `PostMatchView` |

### LiveMatchFoundation

Orkiestracja UI Live + montaż Canvas + panel Replay + przełączenie na Post Match po `FINISHED` / `MATCH_END`.

---

## Publiczne typy (web)

```ts
MatchCanvasReadModel = {
  matchId,
  matchState,
  spatial,
  tick,
  events,
};
```

---

## Ograniczenia

- Spatial kickoff + presentation derive (nie pełna fizyka).
- Replay tylko RAM.
- Post Match bez ocen zawodników / backendu.

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) · [`../AI-HANDOFF.md`](../AI-HANDOFF.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
