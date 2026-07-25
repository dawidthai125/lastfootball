# HANDOFF — Last Football

## Cel

**Krótki start** (1 ekran). Pełne: [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md).  
AI: [`AI/START_HERE.md`](./AI/START_HERE.md) · [`AGENTS.md`](../AGENTS.md).

## Stan

|                      |                                              |
| -------------------- | -------------------------------------------- |
| **Feature baseline** | `10de062` · LFE-TRAINING-01 FULLY CLOSED     |
| **Prod**             | https://lastfootball.vercel.app              |
| **Next**             | Owner wybiera — [`ROADMAP.md`](./ROADMAP.md) |
| **CI**               | Format → … → Secret scan                     |

## Czytaj

1. [`AI/START_HERE.md`](./AI/START_HERE.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`AI/ARCHITECTURE_PRINCIPLES.md`](./AI/ARCHITECTURE_PRINCIPLES.md) · [`AI/COMMON_PATTERNS.md`](./AI/COMMON_PATTERNS.md)
4. [`platform/`](./platform/) wg zadania (Training → [`platform/TRAINING.md`](./platform/TRAINING.md))

## Pipeline

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Twarde

Owner GO na commit/push · Hub = decyzja · Resolvery UI · SEED != RUNTIME · Canvas/Replay read-only.

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
