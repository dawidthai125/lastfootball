# Foundation — implementation notes

> **Historyczny snapshot (2026-07-21).** Aktualny stan: [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../AI-HANDOFF.md`](../AI-HANDOFF.md).  
> Non-goals poniżej dotyczą **fazy foundation** — Canvas / AI / Engine są już wdrożone później.

**Mode:** FOUNDATION IMPLEMENTATION  
**Date:** 2026-07-21

## What shipped

- npm workspaces monorepo (`apps/*`, `packages/*`)
- `apps/web` — Next.js 15.5 (patched), React 19, Tailwind CSS 4, ESLint + Prettier
- Supabase browser/server clients (`@supabase/ssr`) — optional env
- `packages/lfe` — module folder scaffold + `getEngineStatus()`
- `packages/domain` — placeholder DTOs
- GitHub Actions CI (format, typecheck, lint, build)
- `vercel.json` (region `fra1`)
- `/status` — engine status page (no game logic)

## Explicit non-goals (this phase)

- Match simulation / physics / AI
- Squad, training, league, transfers UI
- Auth flows, RLS policies, DB schema
- Canvas renderer

## Next phases (from Architecture Review)

1. ~~Extract real LFE contracts + deterministic headless tests~~ → **EPIC-1 done** (`docs/lfe/epic1-foundation.md`)
2. ~~Match domain model~~ → **EPIC-2 done** (`docs/lfe/epic2-match-domain.md`)
3. ~~Match state machine~~ → **EPIC-3 done** (`docs/lfe/epic3-state-machine.md`)
4. ~~Simulation systems~~ → **EPIC-4 done** (`docs/lfe/epic4-simulation-systems.md`)
5. ~~Match commands~~ → **EPIC-5 done** (`docs/lfe/epic5-commands.md`)
6. ~~Match session~~ → **EPIC-6 done** (`docs/lfe/epic6-match-session.md`)
7. ~~Match positioning~~ → **EPIC-7 done** (`docs/lfe/epic7-positioning.md`)
8. Supabase schema: teams / players
9. Later LFE epics: physics · AI · ball movement
10. Port manager parity from Hercules prototype

## Product design (Faza 2)

- GDD skeleton: `docs/game-design/GAME_DESIGN_DOCUMENT.md` (GDD-01)
- UI principles: `docs/game-design/UI_DESIGN_GUIDE.md`
