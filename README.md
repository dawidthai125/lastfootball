# Last Football

Browser football manager — **Next.js 15 · TypeScript · Supabase · Vercel · LFE**.

## Czym jest projekt?

Przeglądarkowy manager piłkarski z własnym silnikiem meczu **LFE** (`@lastfootball/lfe`).  
Produktowy SSOT: [`docs/game-design/GAME_DESIGN_DOCUMENT.md`](docs/game-design/GAME_DESIGN_DOCUMENT.md).  
Kontrakt silnika: [`docs/lfe/LFE_ARCHITECTURE_FREEZE.md`](docs/lfe/LFE_ARCHITECTURE_FREEZE.md).

> **Nowy ChatGPT / Cursor:** [`AGENTS.md`](AGENTS.md) → [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) → [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md). Nie potrzebujesz historii czatu.

**Production:** https://lastfootball.vercel.app  
**Feature baseline:** patrz [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) (LFE-TRANSFERS-08)

## Stan produktu (skrót)

Onboarding · First Match · Hub (`EARLY_CLUB` / `SEASON`) · League · Finance · Players SSOT · Transfers Thin (Instant + Pending + 1× Counter) · Training Thin · Match Live (Canvas / Replay / Post Match).

**Next recommended EPIC:** Owner wybiera — [`docs/ROADMAP.md`](docs/ROADMAP.md).

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

| Path              | Role                                                                |
| ----------------- | ------------------------------------------------------------------- |
| `apps/web`        | Platform UI (Hub, liga, finanse, kadra, transfery) + match pipeline |
| `packages/lfe`    | Match engine (`0.9.1-match-ai01`)                                   |
| `packages/domain` | Shared DTOs                                                         |
| `supabase/`       | Auth + migrations                                                   |
| `docs/`           | Documentation SSOT                                                  |

Domeny platformy: [`docs/platform/`](docs/platform/) · wzorce AI: [`docs/AI/COMMON_PATTERNS.md`](docs/AI/COMMON_PATTERNS.md).

## Od czego zacząć?

1. [`AGENTS.md`](AGENTS.md) / [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md)
2. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md)
3. [`docs/ROADMAP.md`](docs/ROADMAP.md)
4. Indeks: [`docs/README.md`](docs/README.md)

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Scripts

| Command                           | Description           |
| --------------------------------- | --------------------- |
| `npm run dev`                     | Next.js (Turbopack)   |
| `npm run build`                   | Production build      |
| `npm run typecheck`               | TypeScript workspaces |
| `npm run lint`                    | ESLint (web)          |
| `npm test`                        | Vitest (LFE)          |
| `npm run validate`                | Full local CI gate    |
| `npm run format` / `format:check` | Prettier              |

## Ops

- [Developer setup](docs/DEV_SETUP.md) · [Environment](docs/ENVIRONMENT.md) · [Deployment](docs/DEPLOYMENT.md)
- [Contributing](CONTRIBUTING.md) · [Docs changelog](docs/CHANGELOG.md)
