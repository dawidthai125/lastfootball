# Web — Match UI Pipeline (Canvas · Replay · Post Match)

## Cel dokumentu

Dokumentacja warstwy **aplikacji** (`apps/web`) dla przebiegu meczu Live → Canvas → Replay → Post Match.

**Nie** jest częścią pakietu `@lastfootball/lfe`.

## Aktualny stan

| Moduł                          | Status          | Notatka                               |
| ------------------------------ | --------------- | ------------------------------------- |
| LiveMatchRuntime + Live Bridge | ✅ `main`       | + first-match session path            |
| Canvas Renderer 2D             | ✅ `main`       |                                       |
| Replay Buffer + Controller     | ✅ `main`       |                                       |
| Post Match UI + Ratings        | ✅ `main`       |                                       |
| First Match entry              | ✅ LFE-MATCH-01 | `/match/first` · Club DTO             |
| Return to Hub                  | ✅ LFE-HUB-01   | EARLY_CLUB after `completeFirstMatch` |

Entry points:

- Mock/season fixtures: `createSessionFromFixture`
- First Match: `createSessionFromFirstMatch(club)` → same LFE `createMatch`

---

## Przepływ danych

```mermaid
flowchart TD
  PM[Pre Match UI] --> CSF{first match?}
  CSF -->|yes| CFM[createSessionFromFirstMatch]
  CSF -->|no| FIX[createSessionFromFixture]
  CFM --> CM[createMatch LFE]
  FIX --> CM
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
  POST -->|first match| WEL[Welcome LF → Hub EARLY_CLUB]
  POST -->|seek event tick| RC
```

---

## Moduły

### LiveMatchRuntime

|                      |                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Odpowiedzialność** | Sesja LFE, pulse symulacji, snapshot UI, CommandBus z UI, zapis Replay, tryb LIVE/REPLAY                                                          |
| **Wejścia**          | `Fixture`, `LiveMatchBundle`                                                                                                                      |
| **Wyjścia**          | `LiveMatchSnapshot`, `canvasHost.present`, replay API                                                                                             |
| **Pliki**            | `apps/web/src/gameplay/live-match-runtime.ts`, `use-live-match-runtime.ts`, `create-session-from-fixture.ts`, `lib/first-match/create-session.ts` |

| **API** | `getSnapshot`, `subscribe`, `dispatchUiCommand`, `startSimulation`/`stopSimulation`, `enterReplay`/`exitReplay`, `replayPlay`/`Pause`/`Stop`/`Seek`/`SeekRatio`/`SetSpeed`, `getPlaybackSource`, `replayBuffer`, `dispose` |

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

|                      |                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------- |
| **Odpowiedzialność** | Raport po końcu: wynik, gole, timeline, stats, **oceny XI + MVP**; skok do Replay           |
| **Wejścia**          | `MatchState` + events (+ buffer do seek)                                                    |
| **Wyjścia**          | UI; wywołania istniejącego Replay API                                                       |
| **Pliki**            | `apps/web/src/components/match/post-match/*`                                                |
| **API**              | `buildPostMatchSummary`, `computePlayerRatings`, `findReplayIndexForEvent`, `PostMatchView` |

### LiveMatchFoundation

Orkiestracja UI Live:

- montaż Canvas (`createMatchCanvasRenderer` → `canvasHost.attachRenderer`)
- panel Replay (seek / play / speed) przez API `LiveMatchRuntime`
- otwarcie **Post Match** po `FINISHED` / `MATCH_END`
- seek z timeline Post Match → `findReplayIndexForEvent` + `replaySeek`

Plik: `apps/web/src/components/match/LiveMatchFoundation.tsx`.

### Live Bridge (zasada)

`LiveMatchRuntime` jest **jedynym** miejscem, które w LIVE woła `session.run`, buduje `MatchCanvasReadModel`, robi `replayBuffer.append` i `canvasHost.present`.  
W REPLAY **nie** woła Engine — tylko controller + `present` nagranych modeli.

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
- Player Ratings = pure derive w Post Match (skala 1.0–10.0, XI obu drużyn, MVP); bez assists/minutes w formule v1.

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) · [`../platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md) · [`../AI/START_HERE.md`](../AI/START_HERE.md)

## Last updated

2026-07-24 — LFE-DOCS-01
