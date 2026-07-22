# Deployment

## Vercel (production host)

### Project settings (dashboard)

| Setting          | Value                                                   |
| ---------------- | ------------------------------------------------------- |
| Framework Preset | Next.js                                                 |
| Root Directory   | `.` (repo root — npm workspaces)                        |
| Install Command  | `npm install` (or leave default; `vercel.json` sets it) |
| Build Command    | `npm run build -w @lastfootball/web`                    |
| Output Directory | **leave empty** (Next.js handled by Vercel)             |
| Node.js Version  | 22.x                                                    |
| Region           | `fra1` (Frankfurt) — set in `vercel.json`               |

### Git integration

| Branch                      | Deployment     |
| --------------------------- | -------------- |
| `main`                      | **Production** |
| `develop`, `feature/*`, PRs | **Preview**    |

Vercel creates Preview Deployments automatically when the GitHub app is connected. No custom deploy workflow is required for Preview/Production if Git integration is ON.

### Environment variables

Set in Vercel → Project → Settings → Environment Variables.

| Variable                        | Production         | Preview               | Development          |
| ------------------------------- | ------------------ | --------------------- | -------------------- |
| `NEXT_PUBLIC_APP_URL`           | prod URL           | preview URL (or omit) | localhost            |
| `NEXT_PUBLIC_SUPABASE_URL`      | ✓                  | ✓                     | optional local       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✓                  | ✓                     | optional local       |
| `SUPABASE_SERVICE_ROLE_KEY`     | ✓ (secret)         | optional              | local only if needed |
| `CRON_SECRET`                   | ✓ when cron exists | optional              | optional             |
| `NEXT_TELEMETRY_DISABLED`       | `1`                | `1`                   | `1`                  |

Never put service-role keys in `NEXT_PUBLIC_*`.

### Cache

- Next.js build cache: managed by Vercel
- Do not set a custom Output Directory (breaks Next.js deploy)
- `npm ci` in CI uses lockfile for reproducible installs

### Headers / security

Configured in:

- `vercel.json` — HSTS, frame deny, nosniff, referrer, permissions-policy
- `apps/web/next.config.ts` — CSP + duplicate baseline headers

### Manual deploy (optional)

```bash
npx vercel          # preview
npx vercel --prod   # production (requires auth)
```

## Supabase

1. Create project (prefer EU region near `fra1`)
2. `npx supabase link --project-ref <ref>`
3. `npx supabase db push`
4. Copy API URL + anon key into Vercel envs
5. Auth → URL config: site URL + redirect `https://<domain>/auth/callback`

## Release to production

1. PR `develop` → `main` (CI green)
2. Merge
3. Vercel Production deploy
4. Tag `vX.Y.Z` on `main` (triggers release workflow verify)
5. Update `CHANGELOG.md`
