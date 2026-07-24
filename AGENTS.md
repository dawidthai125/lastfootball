# AGENTS.md — Last Football

**Start here** if you are a Cursor Agent, ChatGPT, or any AI working on this repo.

## Read first (in order)

1. [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md) — reading order, hard rules, DoD
2. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — production baseline
3. [`docs/AI/PROJECT_STATE.md`](docs/AI/PROJECT_STATE.md) — what is done / next
4. [`docs/MASTER_HANDOFF.md`](docs/MASTER_HANDOFF.md) — full project transfer
5. Task-specific docs (platform / LFE / GDD) as linked from START_HERE

## Hard rules (never violate)

- **Do not** commit or push without explicit **Owner GO**.
- **Do not** rely on chat history — only `docs/` + code.
- **REUSE FIRST** · **ZERO DUPLICATE LOGIC** · **SSOT FIRST**.
- Match mutations only via LFE `CommandBus` / session API.
- Canvas / Replay never call Engine or mutate `MatchState`.
- Hub is a **decision screen** (`EARLY_CLUB`), not a mid-season dashboard.
- First Hub unlock requires `clubs.first_match_completed_at` (First Match tunnel).

## Workflow

`AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CLOSE`

Details: [`docs/AI/EPIC_WORKFLOW.md`](docs/AI/EPIC_WORKFLOW.md) · [`docs/WORKFLOW.md`](docs/WORKFLOW.md)

## Last updated

2026-07-24 — LFE-DOCS-01
