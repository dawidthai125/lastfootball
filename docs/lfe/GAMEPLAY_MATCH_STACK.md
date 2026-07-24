# LFE — Gameplay / Match AI / Match Engine

## Cel dokumentu

Opis warstwy gameplay po EPIC-1…7: **Gameplay Foundation**, **Match AI**, **Match Engine**.

## Aktualny stan

| Moduł               | Status  | Wersja pakietu     |
| ------------------- | ------- | ------------------ |
| Gameplay Foundation | ✅ DONE | `0.9.1-match-ai01` |
| Match AI            | ✅ DONE | ten sam            |
| Match Engine        | ✅ DONE | ten sam            |

`LFE_VERSION` / `packages/lfe/package.json` = `0.9.1-match-ai01`.

---

## Przepływ

```
MatchSession.run / step
  → Simulation pipeline
      → MatchEngineSystem (GAMEPLAY priority)
          → simulateMatchTick(MatchState, rng, …)
              → Match AI decidePossession / decideAction  (read MatchState)
              → Engine rolls RNG, updates score/stats, emits EventBus events
  → MatchState (SSOT)
  → EventBus history
```

**Zasada:** AI **decyduje** (prawdopodobieństwa); Engine **wykonuje** (RNG + mutacja stanu + emit). UI nigdy nie woła AI/Engine bezpośrednio — tylko `MatchSession`.

---

## 1. Gameplay Foundation

### Odpowiedzialność

- Słownik zdarzeń meczowych (`GAMEPLAY_MATCH_EVENTS`).
- `MatchTactics` na `MatchState`.
- Komendy taktyczne (pressing, tempo, width, mentality, …).
- Notatki fasady `gameplay` (types-only).

### Wejścia / wyjścia

- **In:** CommandBus tactical commands, session create.
- **Out:** zaktualizowany `MatchState.tactics`, eventy `TACTICS_CHANGE` / match vocab.

### Pliki

- `packages/lfe/src/match/domain/tactics.ts`
- `packages/lfe/src/match/domain/match-state.ts` (pole `tactics`)
- `packages/lfe/src/events/types.ts` (`GAMEPLAY_MATCH_EVENTS`)
- `packages/lfe/src/commands/match/tactical-*.ts`
- `packages/lfe/src/gameplay/*`

### Public API (skrót)

- `createMatchTactics` / `DEFAULT_MATCH_TACTICS`
- `GAMEPLAY_MATCH_EVENTS`
- `createSetPressingCommand`, `createSetTempoCommand`, …
- `import { gameplay } from '@lastfootball/lfe'`

---

## 2. Match AI

### Odpowiedzialność

Czyste decyzje: szanse posiadania i akcji (atak / strzał / gol / faul / róg) na podstawie taktyki, wyniku, fazy, siły składu.

### Wejścia / wyjścia

- **In:** `MatchState` (read-only).
- **Out:** `MatchAiPossessionDecision`, `MatchAiActionDecision` (prawdopodobieństwa).
- **Nie:** mutacja stanu, RNG execution.

### Pliki

- `packages/lfe/src/ai/types.ts`, `context.ts`, `decide.ts`, `styles.ts`
- `packages/lfe/src/ai/index.ts`
- `packages/lfe/src/ai/match-ai01.test.ts`

### Public API

- `buildMatchAiContext`, `decidePossessionFromState`, `decideActionFromState`, …

---

## 3. Match Engine

### Odpowiedzialność

Jeden tick gry: zegar połowy, possession roll, resolve akcji, lifecycle half/end, emity EventBus.

### Wejścia / wyjścia

- **In:** `MatchState`, `Rng`, half durations.
- **Out:** nowy `MatchState`, `MatchEngineEmit[]`, lifecycle events.
- **Depends:** Match AI (`resolve.ts` importuje `../../ai`).

### Pliki

- `packages/lfe/src/match/engine/{clock,tick,resolve,index}.ts`
- `packages/lfe/src/simulation/systems/match-engine-system.ts`
- test: `match-engine01.test.ts`

### Public API

- `simulateMatchTick`, `advanceMatchClock`, typy `MatchEngineTickInput` / `Result`

---

## 4. Player Match Data (LFE-PLAYER-MATCH-DATA-01)

### Odpowiedzialność

- Inicjalizacja `MatchState.statistics.players` dla całego rosteru.
- Deterministyczna atrybucja `playerId` (bez RNG) dla `GOAL` / `SHOT` / `FOUL`.
- Bump `PlayerStatistics`: `goals`, `shots`, `foulsCommitted`.
- `TeamStatistics` i drabina RNG — bez zmian.

### Pliki

- `packages/lfe/src/match/engine/attribute-player.ts`
- `packages/lfe/src/match/engine/resolve.ts`
- `packages/lfe/src/match/domain/statistics.ts`
- test: `player-match-data01.test.ts`

### Poza zakresem

Assists, minutesPlayed, Ratings, UI.

---

## Status modułów (`getEngineStatus`)

Ready m.in.: `gameplay-foundation`, `match-engine`, `match-ai`, `ai`.  
Nadal stub: `physics`, `rules`, `ecs`.

---

## Czego nie robić

- Nie obchodzić AI „na sztywno” w Engine bez EPIC.
- Nie wołać `simulateMatchTick` z React — tylko przez session/simulation.
- Nie traktować spatial kickoff jako pełnej fizyki.
- Nie dodawać `rng.next()` w atrybucji zawodnika.

## Powiązania

[`CURRENT_STATUS.md`](./CURRENT_STATUS.md) · [`MATCH_FLOW.md`](./MATCH_FLOW.md) · [`ENGINE_PIPELINE.md`](./ENGINE_PIPELINE.md) · [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

## Last updated

2026-07-24 — LFE-PLAYER-MATCH-DATA-01
