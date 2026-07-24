# AI — Current Baseline (Production)

## Cel

Jedyny szybki SSOT: **co jest wdrożone na produkcji teraz**.

## Production

| Pole | Wartość |
| --- | --- |
| URL | https://lastfootball.vercel.app |
| Alias | https://lastfootball.pl |
| Branch | `main` |
| Baseline commit | `b6b92dce1fc9e0bf75fb48cc82a1e5ad570a327a` |
| Baseline message | `feat(hub): rebuild EARLY_CLUB decision Hub (LFE-HUB-01)` |
| Verified | 2026-07-24 — CI GREEN + Vercel Ready + prod smoke PASS |

> Zawsze potwierdź lokalnie: `git log -1 --oneline` (może być nowszy commit po tym dokumencie).

## Stack

- Next.js 15 (App Router) · TypeScript · Turbopack/dev
- Supabase Auth + Postgres (project ref `anoeimngwptucjdugjme`)
- Vercel Production
- LFE `@lastfootball/lfe` · `0.9.1-match-ai01`

## Player path (verified)

```
Landing → Register/Login → Welcome → Club Wizard → Reveal
  → First Match Intro → Prematch (/match/first) → Live → Post Match
  → Welcome LF → Hub EARLY_CLUB → Primary „Zobacz skład”
```

## Critical SSOT columns / modules

| SSOT | Gdzie |
| --- | --- |
| Club identity | `clubs` → `ClubDto` |
| Hub unlock | `clubs.first_match_completed_at` |
| Hub phase | `resolveHubPhase(club)` |
| Hub Primary CTA | `resolvePrimaryCta(phase, session)` |
| First match session | `createSessionFromFirstMatch(club)` |
| Match engine entry | `createMatch()` → `MatchSession` |

## Done product EPICs (on `main`)

- **LFE-PLATFORM-01** P1–P3 — Landing, Auth, Club Wizard, Club DTO
- **LFE-INFRA-01** — Supabase rebind `anoeimngwptucjdugjme`
- **LFE-MATCH-01** — First Match Experience tunnel
- **LFE-HUB-01** — EARLY_CLUB decision Hub + shell unlocks

Plus earlier: LFE engine EPIC-1…7, Live Bridge, Canvas, Replay, Post Match, Ratings, GDD-01…15.

## Not on production (do not assume)

- Live league DB / season table as Hub truth
- Economy / transfers / scouting systems
- Mid-season Hub dashboard (removed from EARLY_CLUB)
- Physics / full rules

## Last updated

2026-07-24 — LFE-DOCS-01 · baseline `b6b92dc`
