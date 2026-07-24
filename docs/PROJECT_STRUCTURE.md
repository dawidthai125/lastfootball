# Project Structure — Last Football

## Cel dokumentu

Opis katalogów monorepo: rola, PUBLIC vs INTERNAL.

## Aktualny stan

Struktura: foundation + LFE EPIC-1…7 + Gameplay/AI/Engine + web match pipeline + docs SSOT.

## Opis katalogów

| Ścieżka                                                                                            | Rola                                                    | Widoczność                                     |
| -------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------------------------------- |
| `apps/web/`                                                                                        | Next.js UI / BFF shell                                  | **PUBLIC** (app)                               |
| `apps/web/src/app/`                                                                                | App Router pages                                        | PUBLIC                                         |
| `apps/web/src/gameplay/`                                                                           | LiveMatchRuntime, canvas-host, **canvas/**, **replay/** | App INTERNAL API                               |
| `apps/web/src/components/match/`                                                                   | Live UI, **post-match/**                                | App UI                                         |
| `packages/lfe/`                                                                                    | Last Football Engine                                    | Pakiet PUBLIC; wnętrze INTERNAL wg freeze      |
| `packages/lfe/src/index.ts`                                                                        | Barrel eksportów                                        | PUBLIC surface (za szeroki vs freeze)          |
| `packages/lfe/src/match/session/`                                                                  | MatchSession                                            | PUBLIC (przez fasadę)                          |
| `packages/lfe/src/match/engine/`                                                                   | Match Engine tick                                       | INTERNAL (+ barrel export)                     |
| `packages/lfe/src/ai/`                                                                             | Match AI decisions                                      | INTERNAL (+ barrel export)                     |
| `packages/lfe/src/gameplay/`                                                                       | Gameplay facade notes                                   | PUBLIC namespace                               |
| `packages/lfe/src/match/domain/`                                                                   | Model meczu                                             | Typy PUBLIC; heavy builders → TESTING/INTERNAL |
| `packages/lfe/src/match/state-machine/`                                                            | Fazy meczu                                              | INTERNAL (+ TESTING)                           |
| `packages/lfe/src/match/positioning/`                                                              | Spatial                                                 | Read model PUBLIC                              |
| `packages/lfe/src/commands/`                                                                       | Command bus + tactical                                  | Thin PUBLIC                                    |
| `packages/lfe/src/simulation/`                                                                     | Tick + systems (+ MatchEngineSystem)                    | INTERNAL / TESTING                             |
| `packages/lfe/src/core/`, `rng/`, `events/`, `scheduler/`, `world/`, `replay/`, `config/`, `math/` | Runtime                                                 | INTERNAL (typy częściowo ADVANCED)             |
| `packages/lfe/src/physics/`, `rules/`, `ecs/`, `utils/`                                            | Stub / reserved                                         | **RESERVED**                                   |
| `packages/domain/`                                                                                 | DTO manager-facing                                      | PUBLIC dla app                                 |
| `supabase/`                                                                                        | Migracje, config, typy                                  | INTERNAL ops                                   |
| `docs/`                                                                                            | Dokumentacja SSOT                                       | PUBLIC                                         |
| `docs/web/`                                                                                        | Match UI pipeline docs                                  | PUBLIC                                         |
| `.github/`                                                                                         | CI workflows                                            | INTERNAL ops                                   |

## PUBLIC vs INTERNAL (reguła)

- **PUBLIC (app):** import z `@lastfootball/lfe` — nie deep path.
- **Web gameplay:** import z `apps/web/src/gameplay` (lokalny barrel).
- **INTERNAL LFE:** poza kontraktem freeze.
- **Docs:** zawsze czytelne; nie są runtime API.

## Najważniejsze decyzje

- Monorepo workspaces npm.
- Silnik izolowany od UI/DB.
- Canvas/Replay poza `packages/lfe`.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`lfe/overview.md`](./lfe/overview.md) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
