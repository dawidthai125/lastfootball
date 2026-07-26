# AGENTS.md — Last Football

**Start here** if you are a Cursor Agent, ChatGPT, or any AI working on this repo.

## Project philosophy (short)

Last Football is built so a new agent session can work from **`docs/` + code alone** — never from chat history. Every product fact has **one SSOT**; UI and pages **reuse** existing resolvers and helpers (**REUSE FIRST** · **RESOLVER FIRST**) instead of inventing parallel logic. Work ships as **small, closed EPICs** (AUDIT → PLAN → Owner GO → IMPLEMENT → … → CLOSE) with a clear out-of-scope list. Documentation must stay current enough that cold start does not require reconstructing prior conversations. Prefer updating an existing SSOT over adding a new doc.

## Read first (in order)

1. [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) — 1-ekran cold start
2. [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md) — full onboarding map
3. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — feature baseline vs tip
4. [`docs/AI/ARCHITECTURE_RULES.md`](docs/AI/ARCHITECTURE_RULES.md)
5. [`docs/AI/ARCHITECTURE_PRINCIPLES.md`](docs/AI/ARCHITECTURE_PRINCIPLES.md)
6. [`docs/AI/COMMON_PATTERNS.md`](docs/AI/COMMON_PATTERNS.md)
7. [`docs/AI/EPIC_WORKFLOW.md`](docs/AI/EPIC_WORKFLOW.md)
8. [`docs/AI/ENGINEERING_GUIDE.md`](docs/AI/ENGINEERING_GUIDE.md)
9. Task-specific: [`docs/AI/MODULE_MAP.md`](docs/AI/MODULE_MAP.md) · platform / LFE / GDD · status [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)

## Hard rules (never violate)

- **Do not** commit or push without explicit **Owner GO**.
- **Do not** rely on chat history — only `docs/` + code.
- **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**.
- **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED != RUNTIME**.
- **Single Settlement Path** (transfers): only `completeTransferBuy` / `completeTransferSell`.
- Match mutations only via LFE `CommandBus` / session API.
- Canvas / Replay never call Engine or mutate `MatchState`.
- Hub is a **decision screen**, not a mid-season dashboard.
- First Hub unlock: `clubs.first_match_completed_at`.
- Domain UI only via resolvers (`resolveLeagueTable`, `resolveClubFinance`, `resolveClubSquad`, `resolveTransferMarket`, `resolveClubTraining`, …).
- UI presentation EPICs: follow [`docs/game-design/UI_DESIGN_GUIDE.md`](docs/game-design/UI_DESIGN_GUIDE.md) §16 (Presentation Contract); do not change resolvers/DTO/unlock without a domain Owner GO.

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Feature baseline (skrót)

Patrz **wyłącznie** [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — nie kopiuj hashy tutaj na sztywno.

## Last updated

2026-07-26 — AI-DOCS-SYNC-01
