# Foundation — implementation notes

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

1. Extract real LFE contracts + deterministic headless tests
2. Supabase schema: teams / players
3. Port manager parity from Hercules prototype

## Import boundaries

- `packages/lfe` must not import React, Next, or Supabase
- `packages/domain` must not import `lfe` or `web`
- Only future `features/match` may orchestrate LFE ↔ DB
