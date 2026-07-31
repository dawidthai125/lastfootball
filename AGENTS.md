# AGENTS.md — Last Football

**Start here** if you are a Cursor Agent, ChatGPT, or any AI working on this repo.

## Project philosophy (short)

Last Football is built so a new agent session can work from **`docs/` + code alone** — never from chat history. Every product fact has **one SSOT**; UI and pages **reuse** existing resolvers and helpers (**REUSE FIRST** · **RESOLVER FIRST**) instead of inventing parallel logic. Work ships as **small, closed EPICs** (AUDIT → PLAN → Owner GO → IMPLEMENT → … → CLOSE) with a clear out-of-scope list. Documentation must stay current enough that cold start does not require reconstructing prior conversations. Prefer updating an existing SSOT over adding a new doc.

## Read first (in order)

1. [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) — 1-ekran cold start
2. [`docs/AI/PROJECT_HANDOFF.md`](docs/AI/PROJECT_HANDOFF.md) — master handoff sesji
3. [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md) — full onboarding map
4. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — feature baseline vs tip
5. [`docs/AI/ARCHITECTURE_RULES.md`](docs/AI/ARCHITECTURE_RULES.md)
6. [`docs/AI/ARCHITECTURE_PRINCIPLES.md`](docs/AI/ARCHITECTURE_PRINCIPLES.md)
7. [`docs/AI/COMMON_PATTERNS.md`](docs/AI/COMMON_PATTERNS.md)
8. [`docs/AI/EPIC_WORKFLOW.md`](docs/AI/EPIC_WORKFLOW.md)
9. [`docs/AI/ENGINEERING_GUIDE.md`](docs/AI/ENGINEERING_GUIDE.md)
10. Task-specific: [`docs/AI/MODULE_MAP.md`](docs/AI/MODULE_MAP.md) · [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md) · platform / LFE / GDD · status [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)

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
- Domain UI only via resolvers (`resolveLeagueTable`, `resolveClubFinance`, `resolveClubSponsors`, `resolveClubSquad`, `resolveClubAcademy`, `resolveClubScouting`, `resolveClubDailyGoal`, `resolveClubAchievements`, `resolveClubRanking`, `resolveClubMessages`, `resolveClubProfile`, `resolveSeasonReport`, `resolveTransferMarket`, `resolveClubTraining`, `planClubFixtures`, …).
- UI presentation EPICs: follow [`docs/game-design/UI_DESIGN_GUIDE.md`](docs/game-design/UI_DESIGN_GUIDE.md) §16 (Presentation Contract); do not change resolvers/DTO/unlock without a domain Owner GO.
- **Presentation ≠ Domain** · **Information Thin** (skauting porządkuje, nie decyduje) — skrót: [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md).

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI
  → PRODUCTION VERIFY → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

## Feature baseline (skrót)

Patrz **wyłącznie** [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — Production Baseline · Domain · tip.  
Nie kopiuj hashy tutaj na sztywno.

## Cold start (skrót)

- **ChatGPT:** [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) → [`docs/AI/PROJECT_HANDOFF.md`](docs/AI/PROJECT_HANDOFF.md) §12 **NOWA SESJA AI**.
- **Cursor:** ten plik → Quick Start → Handoff §13 **NOWY AGENT CURSOR**.
- **Następny EPIC (po Owner GO):** `LFE-BOARD-01` → `LFE-STADIUM-01` — SSOT [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Decyzje **D1–D101:** [`docs/DECISIONS.md`](docs/DECISIONS.md) · skrót [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md).

## Last updated

2026-07-31 — LFE-SPONSORS-01 CLOSED · Domain `17eb8ba` · D1–D101
