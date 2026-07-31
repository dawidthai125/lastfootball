# AI — START HERE

## Cel

Onboarding dla **ChatGPT / Cursor Agent / developera** bez historii czatu i bez czytania całej historii git.

## Ścieżki startu

| Rola                     | Ścieżka                                                                                                  |
| ------------------------ | -------------------------------------------------------------------------------------------------------- |
| **ChatGPT** (nowa sesja) | [`AI_QUICK_START.md`](./AI_QUICK_START.md) → [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md) → ten plik → … |
| **Cursor Agent**         | root [`AGENTS.md`](../../AGENTS.md) → Quick Start → Handoff → ten plik → …                               |
| **Developer**            | Quick Start → [`MODULE_MAP.md`](./MODULE_MAP.md) → [`../DEV_SETUP.md`](../DEV_SETUP.md) → platform docs  |

## Kolejność czytania (obowiązkowa dla AI)

| #   | Dokument                                                                | Po co                      |
| --- | ----------------------------------------------------------------------- | -------------------------- |
| 0   | [`AI_QUICK_START.md`](./AI_QUICK_START.md)                              | 1 ekran                    |
| 0b  | [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md)                            | master kontekst sesji      |
| 1   | **Ten plik**                                                            | mapa + zakazy              |
| 2   | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)                          | produkcja (feature vs tip) |
| 2b  | [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md)            | D19–D28 + Thin principles  |
| 3   | [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)                      | warstwy + SSOT map         |
| 4   | [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md)            | filozofia                  |
| 5   | [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md)                            | wzorce                     |
| 6   | [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md)                                | AUDIT→…→FULLY CLOSED       |
| 7   | [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md)                        | commit / CI / prettier     |
| 8   | [`MODULE_MAP.md`](./MODULE_MAP.md) · [`EPIC_INDEX.md`](./EPIC_INDEX.md) | gdzie kod / co zamknięte   |
| 9   | Task-specific (poniżej)                                                 | tylko zakres EPIC-u        |

Opcjonalnie: [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) (status SSOT) · [`PROJECT_STATE.md`](./PROJECT_STATE.md) (alias + otwarte decyzje) · [`../HANDOFF.md`](../HANDOFF.md) · [`../MASTER_HANDOFF.md`](../MASTER_HANDOFF.md).

### Gdy zadanie dotyczy…

| Temat                         | Czytaj                                                                                                                                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Transfery**                 | [`../platform/TRANSFERS.md`](../platform/TRANSFERS.md) · [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md) · D20                                                |
| Trening                       | GDD §8 · [`../platform/TRAINING.md`](../platform/TRAINING.md) · D21 · PLAYERS                                                                                                                |
| **Akademia**                  | GDD §16 · [`../platform/PLAYERS.md`](../platform/PLAYERS.md) (Academy) · D23 · [`../implementation/LFE-ACADEMY-01-PLAN.md`](../implementation/LFE-ACADEMY-01-PLAN.md)                        |
| **Skauting**                  | GDD §17 · PLAYERS (Scouting) · D24 · [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md) · [`../implementation/LFE-SCOUTING-01-PLAN.md`](../implementation/LFE-SCOUTING-01-PLAN.md) |
| Onboarding / auth / klub      | [`../platform/ONBOARDING_FLOW.md`](../platform/ONBOARDING_FLOW.md)                                                                                                                           |
| First Match                   | [`../platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md)                                                                                                                                   |
| Hub                           | [`../platform/HUB.md`](../platform/HUB.md) · Guide §16                                                                                                                                       |
| Liga                          | [`../platform/LEAGUE.md`](../platform/LEAGUE.md)                                                                                                                                             |
| Finanse                       | [`../platform/FINANCE.md`](../platform/FINANCE.md)                                                                                                                                           |
| Kadra                         | [`../platform/PLAYERS.md`](../platform/PLAYERS.md) · D19/D22                                                                                                                                 |
| **UI / prezentacja / chrome** | [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16 · Patterns _UI Presentation_ · opcjonalnie [postmortem](../game-design/LFE-UX-POSTMORTEM-01.md) (REFERENCE)     |
| Match Live / Canvas / Replay  | [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)                                                                                                                                 |
| Silnik LFE                    | [`../lfe/README.md`](../lfe/README.md) · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md)                                                                                  |
| Produkt / GDD                 | [`../game-design/README.md`](../game-design/README.md)                                                                                                                                       |
| Soft-lock / Sponsors/Board    | [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md) §9 · D52 · D63–D67 · D79                                                                                                                        |
| Season End                    | [`../game-design/GDD-SEASON-END-01.md`](../game-design/GDD-SEASON-END-01.md) · D68–D87 · HUB.md                                                                                              |
| Release                       | [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md)                                                                                                                                             |

Indeks: [`../README.md`](../README.md).

---

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI
  → PRODUCTION VERIFY → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

**Brak EPIC IN PROGRESS.** Oficjalna kolejka (po **Owner GO**, start od **AUDIT**):
`TD-03+`.
Szczegóły: [`PROJECT_HANDOFF.md`](./PROJECT_HANDOFF.md) §10–§13 · [`../ROADMAP.md`](../ROADMAP.md).

Szczegóły Owner GO: [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) · [`../WORKFLOW.md`](../WORKFLOW.md).

---

## Czego NIE robić

| Zakaz                                            | Dlaczego               |
| ------------------------------------------------ | ---------------------- |
| Commit / push bez **Owner GO**                   | polityka projektu      |
| Force-push / rewrite `main`                      | historia produkcyjna   |
| Kod w EPIC-u docs-only                           | scope                  |
| Engine w Canvas / Replay / Post Match            | granica warstw         |
| Mutacja `MatchState` z React UI                  | CommandBus only        |
| Duplikacja logiki LFE w `apps/web`               | ZERO DUPLICATE         |
| Runtime mock (rynek/kasa/tabela/Hub FOMO)        | NO RUNTIME MOCKS       |
| Drugi settle transferów (`completeLiveTransfer`) | Single Settlement Path |
| Drugi model zawodnika / scout_score jako SSOT    | D19 / D24              |
| Nowy docs gdy treść już istnieje                 | SSOT FIRST             |
| Commit `.env` / sekretów                         | bezpieczeństwo         |
| Poleganie na historii czatu                      | tylko `docs/` + kod    |

---

## Zasady twarde (skrót)

Pełna filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) · skrót D\*: [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md).

1. SSOT FIRST · REUSE FIRST · ZERO DUPLICATE
2. RESOLVER FIRST · PURE BEFORE IO · THIN SLICE
3. **Presentation ≠ Domain** · **Information Thin**
4. SEED != RUNTIME · NO RUNTIME MOCKS
5. Single Settlement Path (transfers)
6. Hub = decyzja · First Match przed Hubem · `createMatch()` entry LFE

## Last updated

2026-07-31 — LFE-TRANSFERS-10 CLOSED · next Owner GO → Zawężenie LFE PUBLIC exports
