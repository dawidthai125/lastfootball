# Developer setup

## Prerequisites

- Node.js **≥ 20** (22 recommended; CI uses 22)
- npm 10+
- Git
- Optional: [Supabase CLI](https://supabase.com/docs/guides/cli), [Vercel CLI](https://vercel.com/docs/cli), [GitHub CLI](https://cli.github.com/)

## Clone & install

```bash
git clone <repo-url> lastfootball
cd lastfootball
git checkout develop
npm install
cp .env.example apps/web/.env.local
npm run dev
```

- App: http://localhost:3000
- Engine status: http://localhost:3000/status

## Common commands

| Command             | Description                              |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Next.js Turbopack                        |
| `npm run build`     | Production build                         |
| `npm run typecheck` | TS across workspaces                     |
| `npm run lint`      | ESLint (web)                             |
| `npm test`          | Vitest (LFE smoke)                       |
| `npm run format`    | Prettier write                           |
| `npm run validate`  | format + typecheck + lint + test + build |

## Branch workflow

See `CONTRIBUTING.md`. Short version:

```bash
git checkout develop
git pull
git checkout -b feature/my-change
# ... work ...
npm run validate
git push -u origin HEAD
# open PR → develop
```

## Supabase local (optional)

```bash
npx supabase start
npx supabase db reset
# copy API URL + anon key from CLI output into apps/web/.env.local
```

## IDE

- TypeScript workspace: open repo root
- Format on save: Prettier
- Do not commit secrets or `node_modules`

## Architecture SSOT

Do not redesign the monorepo layout. Read:

- `docs/architecture/foundation.md`
- Architecture Review (chat) — Next.js + LFE package boundaries
