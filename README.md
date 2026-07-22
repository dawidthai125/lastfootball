# Last Football Engine (LFE)

Browser football manager foundation — **Next.js 15 · TypeScript · Supabase · Vercel**.

> Foundation + infrastructure bootstrap. No match simulation or business UI yet.

## Monorepo

| Path              | Role                               |
| ----------------- | ---------------------------------- |
| `apps/web`        | Next.js App Router shell           |
| `packages/lfe`    | Last Football Engine (stubs)       |
| `packages/domain` | Shared DTOs (no I/O)               |
| `supabase/`       | Auth/DB/Storage/Realtime/Edge prep |
| `docs/`           | Architecture, ops, security        |

## Quick start

```bash
npm install
cp .env.example apps/web/.env.local
npm run dev
```

- Home: http://localhost:3000
- Engine status: http://localhost:3000/status

Full setup: [`docs/DEV_SETUP.md`](docs/DEV_SETUP.md)

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run dev`       | Next.js (Turbopack)          |
| `npm run build`     | Production build             |
| `npm run typecheck` | TypeScript across workspaces |
| `npm run lint`      | ESLint (web)                 |
| `npm test`          | Vitest (LFE smoke)           |
| `npm run validate`  | Full local CI gate           |
| `npm run format`    | Prettier                     |

## Ops docs

- [Developer setup](docs/DEV_SETUP.md)
- [Environment](docs/ENVIRONMENT.md)
- [Infrastructure](docs/INFRASTRUCTURE.md)
- [Deployment](docs/DEPLOYMENT.md)
- [Security](docs/SECURITY.md)
- [GitHub checklist](docs/GITHUB.md)
- [Contributing](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)

## Vercel

- Region: `fra1`
- Deploy from **repository root** (workspaces)
- Env: see `docs/ENVIRONMENT.md` / `docs/DEPLOYMENT.md`
