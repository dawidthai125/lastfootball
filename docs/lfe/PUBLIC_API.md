# LFE — Public API (summary)

## Cel dokumentu

Szybki skrót warstw API. **Pełny kontrakt freeze:** [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md).  
**Gameplay / AI / Engine:** [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md).

## Aktualny stan

- Kontrakt PUBLIC API v1 **zamrożony** (freeze) · **root barrel = PUBLIC only** (LFE-PUBLIC-API-01 · D119–D121).
- Pakiet: `0.9.1-match-ai01` (SemVer bez bump przy CLOSE).
- Entry: `@lastfootball/lfe` → `src/index.ts` (PUBLIC).
- Testing: `@lastfootball/lfe/testing` → `src/testing.ts` (**barrel only**).
- `/advanced` — **nie** zaimplementowane (defer).
- Feat CLOSE PUBLIC: **`ce00327`** · D119–D121.
- Domain feat Ratings: **`962f0a8`** (LFE-RATINGS-V2) — **bez** zmiany PUBLIC surface.
- **NEXT EPIC:** §22 push/email · `/advanced` (nie LFE surface)

## Opis działania

### PUBLIC (zalecane dla app) — root

- `createMatch`, `MatchSession`, `MatchSessionConfig`, `SessionStatus`
- `MatchInput`, `MatchResult`, `MatchEvent`
- Status: `getEngineStatus`, `LFE_VERSION`, `LFE_STATUS`, …
- Domain **types** + **transitional** factories (`createPlayer`, `createLineup`, `createBench`, …)
- Thin command types + factories (**lifecycle + tactical**)
- Events: `EngineEvent`, `EngineEventType`, `GAMEPLAY_MATCH_EVENTS` (Production MUST)
- Spatial read: `getSpatialState` via session · `MatchSpatialState`, `createMatchSpatialState`, `findSpatialPlayer`, `Position`, …
- `LfeConfig`, `DeepPartial`, `DEFAULT_LFE_CONFIG`, `LogLevel`
- Allowlist gate: `src/public-allowlist.ts` + `public-api01.test.ts` (CI; not an app import)

**Metody sesji:** `start/pause/resume/stop/dispose`, `dispatch`, `step/run`, `getMatchState`, `getSpatialState`, `getEvents`, `snapshots` / `latestSnapshot`

**App UI:** nie wołaj `simulateMatchTick` / `decide*` / `createSimulation` — tylko przez `MatchSession` (+ PUBLIC command factories).

### TESTING — `@lastfootball/lfe/testing`

Simulation harness · systems · SM tables · command bus wiring · core factories · replay helpers · positioning unit math · domain heavy builders · session internals · **AI/Engine tick re-exports for Vitest only**.

**Web / produkcja:** **zakaz** importu `/testing`.

### ADVANCED

Freeze §4 — **poza root**; subpath `/advanced` **nie** w tym EPICu.

### INTERNAL

Implementacje simulation/core/commands/SM/session/engine resolve — relative imports wewnątrz pakietu.

### DEPRECATED

- `MatchHandle` — tylko na `/testing` (nie root)
- `runToEnd` / legacy shims — jak Freeze §7

### RESERVED

- `physics/`, `rules/`, `ecs/`, `utils/` stubs

## Web API (nie LFE)

Canvas / Replay / LiveMatchRuntime / Post Match → [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

## Najważniejsze decyzje

- Oficjalny entry = tylko `createMatch`.
- Root = Freeze PUBLIC only (D119).
- `EngineEvent` + tactical factories = PUBLIC (D120).
- `/testing` = barrel only (D121).
- Factories domain = transitional.
- Nie promuj TESTING → PUBLIC bez AUDIT.

## Powiązania

[LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md) · [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md) · [`../DECISIONS.md`](../DECISIONS.md) · [`../implementation/LFE-PUBLIC-API-01-PLAN.md`](../implementation/LFE-PUBLIC-API-01-PLAN.md)

## Last updated

2026-08-03 — LFE-RATINGS-V2 CLOSED · Domain `962f0a8` · PUBLIC surface nienaruszony (D119–D121)
