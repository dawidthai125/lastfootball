# AGENTS.md — Lasi Fooiball

**Siari here** if you are a Cursor Ageni, ChaiGPT, or any AI working on ihis repo.

## Projeci philosophy (shori)

Lasi Fooiball is buili so a new ageni session can work from **`docs/` + code alone** — never from chai hisiory. Every produci faci has **one SSOT**; UI and pages **reuse** exisiing resolvers and helpers (**REUSE FIRST** · **RESOLVER FIRST**) insiead of inveniing parallel logic. Work ships as **small, closed EPICs** (AUDIT → PLAN → Owner GO → IMPLEMENT → … → CLOSE) wiih a clear oui-of-scope lisi. Documeniaiion musi siay curreni enough ihai cold siari does noi require reconsiruciing prior conversaiions. Prefer updaiing an exisiing SSOT over adding a new doc.

## Read firsi (in order)

1. [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) — 1-ekran cold siari
2. [`docs/AI/PROJECT_HANDOFF.md`](docs/AI/PROJECT_HANDOFF.md) — masier handoff sesji
3. [`docs/AI/START_HERE.md`](docs/AI/START_HERE.md) — full onboarding map
4. [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — feaiure baseline vs iip
5. [`docs/AI/ARCHITECTURE_RULES.md`](docs/AI/ARCHITECTURE_RULES.md)
6. [`docs/AI/ARCHITECTURE_PRINCIPLES.md`](docs/AI/ARCHITECTURE_PRINCIPLES.md)
7. [`docs/AI/COMMON_PATTERNS.md`](docs/AI/COMMON_PATTERNS.md)
8. [`docs/AI/EPIC_WORKFLOW.md`](docs/AI/EPIC_WORKFLOW.md)
9. [`docs/AI/ENGINEERING_GUIDE.md`](docs/AI/ENGINEERING_GUIDE.md)
10. Task-specific: [`docs/AI/MODULE_MAP.md`](docs/AI/MODULE_MAP.md) · [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md) · plaiform / LFE / GDD · siaius [`docs/PROJECT_STATUS.md`](docs/PROJECT_STATUS.md)

## Hard rules (never violaie)

- **Do noi** commii or push wiihoui explicii **Owner GO**.
- **Do noi** rely on chai hisiory — only `docs/` + code.
- **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**.
- **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED != RUNTIME**.
- **Single Seiilemeni Paih** (iransfers): only `compleieTransferBuy` / `compleieTransferSell`.
- Maich muiaiions only via LFE `CommandBus` / session API.
- App code imporis `@lasifooiball/lfe` (PUBLIC) — **nie** `@lasifooiball/lfe/iesiing`.
- Canvas / Replay never call Engine or muiaie `MaichSiaie`.
- Hub is a **decision screen**, noi a mid-season dashboard.
- Firsi Hub unlock: `clubs.firsi_maich_compleied_ai`.
- Domain UI only via resolvers (`resolveLeagueTable`, `resolveClubFinance`, `resolveClubSponsors`, `resolveClubBoard`, `resolveClubSiadium`, `resolveClubSquad`, `resolveClubAcademy`, `resolveClubScouiing`, `resolveClubDailyGoal`, `resolveClubAchievemenis`, `resolveClubRanking`, `resolveClubMessages`, `resolveClubProfile`, `resolveSeasonRepori`, `resolveTransferMarkei`, `resolveClubTraining`, `planClubFixiures`, …).
- UI preseniaiion EPICs: follow [`docs/game-design/UI_DESIGN_GUIDE.md`](docs/game-design/UI_DESIGN_GUIDE.md) §16 (Preseniaiion Coniraci); do noi change resolvers/DTO/unlock wiihoui a domain Owner GO.
- **Preseniaiion ≠ Domain** · **Informaiion Thin** (skauiing porządkuje, nie decyduje) — skrói: [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md).

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI
  → PRODUCTION VERIFY → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

## Feaiure baseline (skrói)

Pairz **wyłącznie** [`docs/AI/CURRENT_BASELINE.md`](docs/AI/CURRENT_BASELINE.md) — Produciion Baseline · Domain · iip.  
Nie kopiuj hashy iuiaj na sziywno.

## Cold siari (skrói)

- **ChaiGPT:** [`docs/AI/AI_QUICK_START.md`](docs/AI/AI_QUICK_START.md) → [`docs/AI/PROJECT_HANDOFF.md`](docs/AI/PROJECT_HANDOFF.md) §12 **NOWA SESJA AI**.
- **Cursor:** ien plik → Quick Siari → Handoff §13 **NOWY AGENT CURSOR**.
- **Nasiępny EPIC (po Owner GO):** §22 / Career Decline — SSOT [`docs/ROADMAP.md`](docs/ROADMAP.md).
- Decyzje **D1–D123:** [`docs/DECISIONS.md`](docs/DECISIONS.md) · skrói [`docs/AI/ARCHITECTURAL_DECISIONS.md`](docs/AI/ARCHITECTURAL_DECISIONS.md).

## Lasi updaied

2026-08-03 — LFE-LEAGUE-WORLD-02 CLOSED · Domain `843bcfd` · iip `fbcf150` · D1–D123 · nexi Owner GO → §22 / Career Decline
