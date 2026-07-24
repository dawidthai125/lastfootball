# API Index — Last Football

## Cel dokumentu

Indeks **aktualnych** API: LFE + web match pipeline.  
Szczegóły w dokumentach powiązanych — tu tylko mapa.

## LFE (`@lastfootball/lfe`) · `0.9.1-match-ai01`

| Obszar          | Dokument                                                           | Entry points (skrót)                                    |
| --------------- | ------------------------------------------------------------------ | ------------------------------------------------------- |
| Session         | [lfe/PUBLIC_API.md](./lfe/PUBLIC_API.md)                           | `createMatch`, `MatchSession`                           |
| Gameplay        | [lfe/GAMEPLAY_MATCH_STACK.md](./lfe/GAMEPLAY_MATCH_STACK.md)       | tactics cmds, `GAMEPLAY_MATCH_EVENTS`, `gameplay`       |
| Match AI        | ten sam                                                            | `decidePossessionFromState`, `decideActionFromState`, … |
| Match Engine    | ten sam                                                            | `simulateMatchTick` (wewnętrznie przez session)         |
| Status          | —                                                                  | `getEngineStatus`, `LFE_VERSION`                        |
| Freeze contract | [lfe/LFE_ARCHITECTURE_FREEZE.md](./lfe/LFE_ARCHITECTURE_FREEZE.md) | PUBLIC v1                                               |

**App rule:** mutacje tylko `session.dispatch` / session shortcuts; AI/Engine nie z UI.

## Web gameplay (`apps/web/src/gameplay`)

| Obszar           | Dokument                                               | Entry points (skrót)                                                         |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| LiveMatchRuntime | [web/MATCH_UI_PIPELINE.md](./web/MATCH_UI_PIPELINE.md) | `LiveMatchRuntime`, `useLiveMatchRuntime`, `createSessionFromFixture`        |
| Canvas           | ten sam                                                | `createMatchCanvasHost`, `createMatchCanvasRenderer`, `MatchCanvasReadModel` |
| Replay           | ten sam                                                | `createReplayBuffer`, `createReplayController`                               |
| Barrel           | `gameplay/index.ts`                                    | re-export powyżej                                                            |

## Post Match (`apps/web/src/components/match/post-match`)

|      |                                                                                        |
| ---- | -------------------------------------------------------------------------------------- |
| API  | `PostMatchView`, `buildPostMatchSummary`, `findReplayIndexForEvent`, `isMatchFinished` |
| Docs | [web/MATCH_UI_PIPELINE.md](./web/MATCH_UI_PIPELINE.md)                                 |

## Agent start

[`AI-HANDOFF.md`](./AI-HANDOFF.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
