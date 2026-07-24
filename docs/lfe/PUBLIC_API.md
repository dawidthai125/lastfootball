# LFE — Public API (summary)

## Cel dokumentu

Szybki skrót warstw API. **Pełny kontrakt freeze:** [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md).  
**Gameplay / AI / Engine:** [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md).

## Aktualny stan

- Kontrakt PUBLIC API v1 **zamrożony** (freeze).
- Pakiet: `0.9.1-match-ai01`.
- `packages/lfe/src/index.ts` **przeeksponowany** (dług) — app powinna preferować `createMatch` + typy/komendy z kontraktu.
- Eksporty **AI / Match Engine / gameplay** istnieją w barrelu jako rozszerzenie po MATCH-AI/ENGINE — nie były częścią freeze v1 jako „zalecane PUBLIC”.

## Opis działania

### PUBLIC (zalecane dla app)

- `createMatch`, `MatchSession`, `MatchSessionConfig`, `SessionStatus`
- `MatchInput`, `MatchResult`, `MatchEvent`
- Status: `getEngineStatus`, `LFE_VERSION`, …
- Domain **types** + **transitional** factories
- Thin command types + factories (w tym taktyczne)
- Spatial read: `getSpatialState`, `MatchSpatialState`, `Position`, …
- `LfeConfig`, `DeepPartial`, `DEFAULT_LFE_CONFIG`, `LogLevel`
- `GAMEPLAY_MATCH_EVENTS`, `import { gameplay } from '@lastfootball/lfe'`

**Metody sesji:** `start/pause/resume/stop/dispose`, `dispatch`, `step/run`, `getMatchState`, `getSpatialState`, `getEvents`, `snapshots` / `latestSnapshot`

### Rozszerzenia barrel (używane przez Engine wewnętrznie / testy)

| Obszar       | Eksporty (skrót)                                                                |
| ------------ | ------------------------------------------------------------------------------- |
| Match Engine | `simulateMatchTick`, `advanceMatchClock`, `DISPLAY_MINUTES_PER_HALF`, typy tick |
| Match AI     | `buildMatchAiContext`, `decidePossession*`, `decideAction*`, typy decyzji       |
| Gameplay     | namespace `gameplay`                                                            |

**App UI:** nie wołaj `simulateMatchTick` / `decide*` bezpośrednio — tylko przez `MatchSession`.

### ADVANCED

- `getWorld()`, `context()` / `MatchSessionContext`
- World/runtime **types**, formation layout helpers, `Vec2`, …

### TESTING

- `createSimulation`, systems, SM tables/`apply*`, bus wiring, `resetCommandIdSeq`, …

### INTERNAL

- Implementacje simulation/core/commands/SM/session/engine resolve

### DEPRECATED

- `MatchHandle`, `session.ts` shim, `Seed`/`ClockState`, `runToEnd`

### RESERVED (nadal stub)

- `physics/`, `rules/`, `ecs/`, `utils/`

> **Uwaga:** katalog `ai/` był RESERVED w freeze; **MATCH-AI-01** dodał działający moduł. Traktuj jako zaimplementowane rozszerzenie — aktualizacja freeze wymaga AUDIT + Owner GO.

### EXPERIMENTAL

- Wszystko oznaczone jako eksperyment — brak stabilności

## Web API (nie LFE)

Canvas / Replay / LiveMatchRuntime / Post Match → [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

## Najważniejsze decyzje

- Oficjalny entry = tylko `createMatch`.
- Factories domain = transitional.
- Nie promuj TESTING → PUBLIC bez AUDIT.

## Powiązania

[LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md) · [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [`../DECISIONS.md`](../DECISIONS.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
