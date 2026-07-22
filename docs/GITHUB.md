# GitHub setup checklist

Manual steps after pushing this repository (cannot be applied from local alone).

## 1. Create remote & push

```bash
gh repo create lastfootball --private --source=. --remote=origin
git push -u origin main
git push -u origin develop
```

## 2. Branch protection — `main` (required)

Settings → Branches → Add rule for `main`:

- [x] Require a pull request before merging
- [x] Require status checks to pass: **CI / quality**
- [x] Require branches to be up to date before merging
- [x] Do not allow bypassing the above settings (admins included, if solo: optional)
- [x] Restrict who can push (empty = via PR only)
- [ ] Allow force pushes — **OFF**
- [ ] Allow deletions — **OFF**

## 3. Branch protection — `develop` (recommended)

Same as `main`, optionally allow maintainers to merge faster.

## 4. Repository settings

- [x] Actions: allow GitHub Actions
- [x] Dependabot alerts: ON
- [x] Secret scanning: ON (if available on plan)
- [x] Push protection for secrets: ON

## 5. Vercel Git integration

- Connect repo in Vercel
- Production branch: `main`
- Preview: all other branches / PRs
- Root Directory: repository root (npm workspaces)
- See `docs/DEPLOYMENT.md`
