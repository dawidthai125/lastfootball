# AI — Quick Start (1 ekran)

## Cel

Natychmiastowy cold start ChatGPT / Cursor **bez** historii czatu.

## Kiedy czytać

**Pierwszy dokument** w nowej sesji — przed jakimkolwiek kodem. Potem: [`START_HERE.md`](./START_HERE.md) (pełna kolejność + mapa zadań).

## Stan produkcji (skrót)

|                     |                                                |
| ------------------- | ---------------------------------------------- |
| Production Baseline | **`54d0724`** — LFE-UI-IMPL-06 · UI P0 CLOSED  |
| Domain baseline     | **`9b1c575`** — LFE-TRANSFERS-08 (bez zmian)   |
| Documentation tip   | **`3918cf5`** — LFE-DOCS-BASELINE-01           |
| Prod                | https://lastfootball.vercel.app                |
| SSOT hash / tip     | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) |
| Status projektu     | [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) |

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
6. **UI / prezentacja / chrome:** obowiązuje [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) **§16 Presentation Contract** (nie kopiuj reguł tutaj)

## Czytaj dalej

Pełna kolejność obowiązkowa: [`START_HERE.md`](./START_HERE.md).  
Potem task-specific (Hub · Guide §16 · platform · LFE) z tabeli w START_HERE.

## Powiązane

[`../../AGENTS.md`](../../AGENTS.md) · [`START_HERE.md`](./START_HERE.md) · [`EPIC_INDEX.md`](./EPIC_INDEX.md) · [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)

## Status

**ACTIVE** · 2026-07-29 — LFE-DOCS-BASELINE-01
