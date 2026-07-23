# Project Structure — Last Football

## Cel dokumentu

Opis katalogów monorepo: rola, PUBLIC vs INTERNAL.

## Aktualny stan

Struktura zgodna z foundation + LFE EPIC-1…7 + docs SSOT.

## Opis katalogów

| Ścieżka | Rola | Widoczność |
|---------|------|------------|
| `apps/web/` | Next.js UI / BFF shell | **PUBLIC** (app) |
| `apps/web/src/app/` | App Router pages | PUBLIC |
| `packages/lfe/` | Last Football Engine | Pakiet PUBLIC; wnętrze INTERNAL wg freeze |
| `packages/lfe/src/index.ts` | Barrel eksportów | PUBLIC surface (obecnie za szeroki vs freeze) |
| `packages/lfe/src/match/session/` | MatchSession | PUBLIC (przez fasadę) |
| `packages/lfe/src/match/domain/` | Model meczu | Typy PUBLIC; heavy builders → TESTING/INTERNAL |
| `packages/lfe/src/match/state-machine/` | Fazy meczu | INTERNAL (+ TESTING) |
| `packages/lfe/src/match/positioning/` | Spatial | Read model PUBLIC; grid/zones → ADVANCED/TESTING |
| `packages/lfe/src/commands/` | Command bus | Thin PUBLIC; bus wiring INTERNAL |
| `packages/lfe/src/simulation/` | Tick + systems | INTERNAL / TESTING |
| `packages/lfe/src/core/`, `rng/`, `events/`, `scheduler/`, `world/`, `replay/`, `config/`, `math/` | Runtime | INTERNAL (typy częściowo ADVANCED) |
| `packages/lfe/src/physics/`, `ai/`, `rules/`, `ecs/`, `utils/` | Stub / reserved | **RESERVED** |
| `packages/domain/` | DTO manager-facing | PUBLIC dla app; nie model LFE |
| `supabase/` | Migracje, config, typy | INTERNAL ops + generated |
| `docs/` | Dokumentacja SSOT | PUBLIC (ludzie/agenci) |
| `docs/game-design/` | GDD SSOT produktu | PUBLIC |
| `docs/lfe/` | Silnik SSOT | PUBLIC |
| `.github/` | CI workflows | INTERNAL ops |
| `.vercel/` | Vercel project link | INTERNAL ops |

## PUBLIC vs INTERNAL (reguła)

- **PUBLIC (app):** import z `@lastfootball/lfe` zgodnie z [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) / freeze — nie deep path `packages/lfe/src/simulation/...`.  
- **INTERNAL:** wszystko w LFE poza kontraktem freeze.  
- **Docs:** zawsze czytelne; nie są runtime API.

## Najważniejsze decyzje

- Monorepo workspaces npm.  
- Silnik izolowany od UI/DB.  
- Docs w `docs/` jako SSOT rozmów agentów.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`lfe/overview.md`](./lfe/overview.md) · root `package.json` workspaces

## Last updated

2026-07-23
