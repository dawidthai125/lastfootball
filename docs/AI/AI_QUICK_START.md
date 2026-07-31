# AI — Quick Start (1 ekran)

## Cel

Natychmiastowy cold start ChatGPT / Cursor **bez** historii czatu.

## Kiedy czytać

**Pierwszy dokument** w nowej sesji — przed jakimkolwiek kodem. Potem: [`START_HERE.md`](./START_HERE.md) (pełna kolejność + mapa zadań).

## Stan produkcji (skrót)

|                     |                                                          |
| ------------------- | -------------------------------------------------------- |
| Production Baseline | **`54d0724`** — LFE-UI-IMPL-06 · UI P0 CLOSED            |
| Domain baseline     | **`9424dd8`** — LFE-TRANSFERS-10 (TD-03+ · D116–D118)    |
| Presentation tip    | **`9fd14fc`** — LFE-UI-MOTION-01 (Hub/Match motion Thin) |
| Documentation tip   | CLOSE sync — tip pin follows                             |
| tip `main`          | po pin CLOSE                                             |
| Prod                | https://lastfootball.vercel.app                          |
| Master handoff      | [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md)             |
| Status projektu     | [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)           |

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI
  → PRODUCTION VERIFY → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

**Bez Owner GO:** nie commit, nie push, nie IMPLEMENT poza PLAN.

**Następny EPIC (kolejka Ownera):** `Zawężenie LFE PUBLIC exports`.
Handoff: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md) §12–§13.

## Twarde zasady

1. **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**
2. **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED ≠ RUNTIME**
3. Domain UI tylko przez resolvery (`resolveTransferMarket`, `resolveClubFinance`, `resolveClubSponsors`, `resolveClubBoard`, `resolveClubStadium`, `resolveClubAcademy`, `resolveClubScouting`, `resolveClubDailyGoal`, `resolveClubAchievements`, `resolveClubRanking`, `resolveClubMessages`, `resolveClubProfile`, `resolveSeasonReport`, `planClubFixtures`, …)
4. Match mutacje tylko LFE `CommandBus` / session
5. Transfer settle tylko `completeTransferBuy` / `completeTransferSell` (**Single Settlement Path**)
6. **UI / prezentacja / chrome:** obowiązuje [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) **§16 Presentation Contract** (nie kopiuj reguł tutaj)

## Czytaj dalej

Master kontekst sesji: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md).  
Pełna kolejność obowiązkowa: [`START_HERE.md`](./START_HERE.md).  
Potem task-specific (Hub · Guide §16 · platform · LFE) z tabeli w START_HERE.

## Powiązane

[`../../AGENTS.md`](../../AGENTS.md) · [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md) · [`START_HERE.md`](./START_HERE.md) · [`EPIC_INDEX.md`](./EPIC_INDEX.md) · [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md)

## Status

**ACTIVE** · 2026-07-31 — LFE-TRANSFERS-10 CLOSED · Domain `9424dd8` · next Owner GO → Zawężenie LFE PUBLIC exports
