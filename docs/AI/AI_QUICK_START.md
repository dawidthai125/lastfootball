# AI — Quick Start (1 ekran)

## Cel

Natychmiastowy cold start ChatGPT / Cursor **bez** historii czatu.

## Kiedy czytać

**Pierwszy dokument** w nowej sesji — przed jakimkolwiek kodem. Potem: [`START_HERE.md`](./START_HERE.md).

## Stan produkcji (skrót)

|                  |                                                   |
| ---------------- | ------------------------------------------------- |
| Feature baseline | **`9b1c575`** — LFE-TRANSFERS-08 CLOSED           |
| Tip              | `git log -1` (może być `docs:` / `style:` nowszy) |
| Prod             | https://lastfootball.vercel.app                   |
| SSOT hash        | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)    |

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

**Bez Owner GO:** nie commit, nie push, nie IMPLEMENT poza PLAN.

## Twarde zasady

1. **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**
2. **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED ≠ RUNTIME**
3. Domain UI tylko przez resolvery (`resolveTransferMarket`, `resolveClubFinance`, …)
4. Match mutacje tylko LFE `CommandBus` / session
5. Transfer settle tylko `completeTransferBuy` / `completeTransferSell` (**Single Settlement Path**)

## Czytaj dalej (kolejność)

1. [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)
2. [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)
3. [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md)
4. Task: [`MODULE_MAP.md`](./MODULE_MAP.md) · platform / LFE / GDD z [`START_HERE.md`](./START_HERE.md)

## Powiązane

[`../AGENTS.md`](../../AGENTS.md) · [`START_HERE.md`](./START_HERE.md) · [`EPIC_INDEX.md`](./EPIC_INDEX.md)

## Status

**ACTIVE** · 2026-07-26 — AI-DOCS-CONSOLIDATION-02
