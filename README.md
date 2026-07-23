# Last Football

Browser football manager — **Next.js 15 · TypeScript · Supabase · Vercel · LFE**.

## Czym jest projekt?

Przeglądarkowy manager piłkarski z własnym silnikiem meczu **LFE** (`@lastfootball/lfe`).  
Produktowy SSOT: [`docs/game-design/GAME_DESIGN_DOCUMENT.md`](docs/game-design/GAME_DESIGN_DOCUMENT.md).  
Kontrakt silnika: [`docs/lfe/LFE_ARCHITECTURE_FREEZE.md`](docs/lfe/LFE_ARCHITECTURE_FREEZE.md).

> **Nowy ChatGPT / Cursor:** zacznij od [`docs/HANDOFF.md`](docs/HANDOFF.md) — nie potrzebujesz starego czatu.

## Jak uruchomić?

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev
```

- Home: http://localhost:3000  
- Engine status: http://localhost:3000/status  

Pełny setup: [`docs/DEV_SETUP.md`](docs/DEV_SETUP.md)

## Jak wygląda architektura?

Monorepo:

| Path | Role |
|------|------|
| `apps/web` | Next.js App Router shell |
| `packages/lfe` | Last Football Engine (EPIC-1…7) |
| `packages/domain` | Shared manager DTOs |
| `supabase/` | Auth/DB prep |
| `docs/` | **Documentation SSOT** |

Szczegóły: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)

## Od czego zacząć?

1. [`docs/HANDOFF.md`](docs/HANDOFF.md)  
2. [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)  
3. [`docs/README.md`](docs/README.md) — indeks całej dokumentacji  

## Jakie dokumenty przeczytać najpierw?

| Cel | Dokumenty |
|-----|-----------|
| Kontekst projektu | HANDOFF → PROJECT_OVERVIEW → PROJECT_STATUS |
| Silnik | `docs/lfe/README.md` → Architecture Freeze → PUBLIC_API |
| Produkt | `docs/game-design/README.md` → GDD |
| Praca / release | WORKFLOW → RELEASE_PROCESS → DECISIONS |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Next.js (Turbopack) |
| `npm run build` | Production build |
| `npm run typecheck` | TypeScript workspaces |
| `npm run lint` | ESLint (web) |
| `npm test` | Vitest (LFE) |
| `npm run validate` | Full local CI gate |
| `npm run format` | Prettier |

## Ops docs

- [Developer setup](docs/DEV_SETUP.md) · [Environment](docs/ENVIRONMENT.md) · [Infrastructure](docs/INFRASTRUCTURE.md)  
- [Deployment](docs/DEPLOYMENT.md) · [Security](docs/SECURITY.md) · [GitHub](docs/GITHUB.md)  
- [Contributing](CONTRIBUTING.md) · [Changelog](CHANGELOG.md) · [Docs changelog](docs/CHANGELOG.md)

## Vercel

- Region: `fra1` · Deploy from **repository root** · Env: `docs/ENVIRONMENT.md`
