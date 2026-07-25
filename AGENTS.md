# AGENTS.md — Last Football

**Start here** if you are a Cursor Agent, ChatGPT, or any AI working on this repo.

## Read first (in order)

1. [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md) — onboarding map
2. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — feature baseline vs tip
3. [`docs/AI/ARCHITECTURE_RULES.md`](docs/AI/ARCHITECTURE_RULES.md)
4. [`docs/AI/ARCHITECTURE_PRINCIPLES.md`](docs/AI/ARCHITECTURE_PRINCIPLES.md)
5. [`docs/AI/COMMON_PATTERNS.md`](docs/AI/COMMON_PATTERNS.md)
6. [`docs/AI/EPIC_WORKFLOW.md`](docs/AI/EPIC_WORKFLOW.md)
7. [`docs/AI/ENGINEERING_GUIDE.md`](docs/AI/ENGINEERING_GUIDE.md)
8. Task-specific platform / LFE / GDD docs (from START_HERE)

## Hard rules (never violate)

- **Do not** commit or push without explicit **Owner GO**.
- **Do not** rely on chat history — only `docs/` + code.
- **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**.
- **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED != RUNTIME**.
- Match mutations only via LFE `CommandBus` / session API.
- Canvas / Replay never call Engine or mutate `MatchState`.
- Hub is a **decision screen**, not a mid-season dashboard.
- First Hub unlock: `clubs.first_match_completed_at`.
- Domain UI only via resolvers (`resolveLeagueTable`, `resolveClubFinance`, `resolveClubSquad`, `resolveTransferMarket`, `resolveClubTraining`, …).

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
