# Contributing — Last Football

## Branch strategy

| Branch      | Purpose                                                       |
| ----------- | ------------------------------------------------------------- |
| `main`      | Production — protected, deploy to Production on Vercel        |
| `develop`   | Integration — protected (soft), Preview deploys               |
| `feature/*` | Short-lived work from `develop`                               |
| `fix/*`     | Bugfixes from `develop` (or hotfix from `main`)               |
| `release/*` | Optional freeze before tagging                                |
| `hotfix/*`  | Urgent production fixes from `main` → merge back to `develop` |

### Flow

1. Branch from `develop`: `feature/short-name`
2. Open PR → `develop` (CI must pass)
3. Periodically: PR `develop` → `main` for production release
4. Tag release on `main`: `vX.Y.Z`

## Commit conventions (Conventional Commits)

```
<type>(optional-scope): <description>

[optional body]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`

**Scopes (examples):** `web`, `lfe`, `domain`, `supabase`, `ci`, `docs`, `security`

**Examples:**

- `feat(lfe): add match input validation`
- `fix(web): correct supabase cookie refresh`
- `chore(ci): add vitest smoke job`
- `docs: update deployment checklist`

Breaking changes: append `!` after type/scope or add `BREAKING CHANGE:` in body.

## Semantic versioning

| Bump      | When                                         |
| --------- | -------------------------------------------- |
| **MAJOR** | Breaking public API (LFE contracts, env, DB) |
| **MINOR** | Backward-compatible features                 |
| **PATCH** | Fixes, docs, infra without API change        |

Until `1.0.0`, `0.x` may include breaking changes in MINOR with clear CHANGELOG notes.

## CHANGELOG workflow

1. During PRs: add bullets under `## [Unreleased]` in `CHANGELOG.md`
2. On release: move Unreleased → `## [X.Y.Z] - YYYY-MM-DD`, bump package versions if needed
3. Create git tag `vX.Y.Z` on `main`

## Pull requests

- One concern per PR when possible
- CI green required (`format`, `typecheck`, `lint`, `test`, `build`)
- No secrets in diff
- Do not implement game logic in infra/docs-only PRs
