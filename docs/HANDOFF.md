# HANDOFF — Last Football

## Cel

**Krótki start** (1 ekran). Pełne przekazanie: [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md).  
Agent AI: [`AI/START_HERE.md`](./AI/START_HERE.md) · root [`AGENTS.md`](../AGENTS.md).

## Stan (2026-07-24) — Production Verified

| Tor                | Stan                                                                       |
| ------------------ | -------------------------------------------------------------------------- |
| **Baseline**       | `b6b92dc` · LFE-HUB-01 · https://lastfootball.vercel.app                   |
| **Platform**       | Landing · Auth · Club Wizard · Club DTO · Supabase `anoeimngwptucjdugjme`  |
| **First Match**    | Tunnel → Prematch/Live/Post → Welcome LF · SSOT `first_match_completed_at` |
| **Hub**            | EARLY_CLUB decision screen · `resolveHubPhase` / `resolvePrimaryCta`       |
| **LFE / Match UI** | EPIC-1…7 + Live Bridge · Canvas · Replay · Post Match · Ratings            |
| **GDD**            | GDD-01…15 CLOSED                                                           |
| **CI**             | Format → Typecheck → Lint · Test · Build — zielony                         |

## Kolejność czytania

1. [`AI/START_HERE.md`](./AI/START_HERE.md) / [`AGENTS.md`](../AGENTS.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md)
4. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`ROADMAP.md`](./ROADMAP.md)
5. Task docs: [`platform/`](./platform/) · [`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Najbliższy cel

Owner wybiera kolejny EPIC (rekomendacje: **liga/fixtures SSOT**, GDD-16+, ekonomia).  
Przed startem: `AI/START_HERE.md` + AUDIT.

## Zasady twarde

- Commit / push tylko po **Owner GO**.
- Hub = decyzja (§23), nie dashboard mid-season.
- First Match **przed** Hubem.
- Canvas/Replay nie wołają Engine.
- REUSE FIRST · ZERO DUPLICATE · SSOT FIRST.

## Last updated

2026-07-24 — LFE-DOCS-01
