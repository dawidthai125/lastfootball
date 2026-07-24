# Last Football

Browser football manager — **Next.js 15 · TypeScript · Supabase · Vercel · LFE**.

## Czym jest projekt?

Przeglądarkowy manager piłkarski z własnym silnikiem meczu **LFE** (`@lastfootball/lfe`).  
Produktowy SSOT: [`docs/game-design/GAME_DESIGN_DOCUMENT.md`](docs/game-design/GAME_DESIGN_DOCUMENT.md).  
Kontrakt silnika: [`docs/lfe/LFE_ARCHITECTURE_FREEZE.md`](docs/lfe/LFE_ARCHITECTURE_FREEZE.md).

> **Nowy ChatGPT / Cursor:** zacznij od [`AGENTS.md`](AGENTS.md) → [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md). Nie potrzebujesz historii czatu.

**Production:** https://lastfootball.vercel.app · baseline docs: [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md)

## Jak uruchomić?

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev
```

- Home: http://localhost:3000
- Engine status: http://localhost:3000/status
- Prod: https://lastfootball.vercel.app

Pełny setup: [`docs/DEV_SETUP.md`](docs/DEV_SETUP.md)

## Architektura (skrót)

| Path | Role |
| --- | --- |
| `apps/web` | Next.js — onboarding, Hub EARLY_CLUB, match UI |
| `packages/lfe` | Last Football Engine (`0.9.1-match-ai01`) |
| `packages/domain` | Shared manager DTOs |
| `supabase/` | Auth/DB migrations |
| `docs/` | **Documentation SSOT** |

## Od czego zacząć?

1. [`AGENTS.md`](AGENTS.md) / [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md)
2. [`docs/HANDOFF.md`](docs/HANDOFF.md) · [`docs/MASTER_HANDOFF.md`](docs/MASTER_HANDOFF.md)
3. [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)
4. Platform flows: [`docs/platform/`](docs/platform/)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Next.js (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript workspaces |
| `npm run lint` | ESLint (web) |
| `npm test` | Vitest (LFE) |
| `npm run validate` | Full local CI gate |
| `npm run format` | Prettier |

## Ops

- [Developer setup](docs/DEV_SETUP.md) · [Environment](docs/ENVIRONMENT.md) · [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md) · [Docs changelog](docs/CHANGELOG.md)
