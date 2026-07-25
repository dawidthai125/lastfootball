# AI — START HERE

## Cel

Onboarding dla **ChatGPT / Cursor Agent** bez historii czatu i bez czytania całej historii git.

## Kolejność czytania (obowiązkowa)

| #   | Dokument                                                     | Po co                                          |
| --- | ------------------------------------------------------------ | ---------------------------------------------- |
| 1   | **Ten plik**                                                 | mapa + zakazy                                  |
| 2   | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)               | co jest na produkcji (feature baseline vs tip) |
| 3   | [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)           | granice warstw + SSOT map                      |
| 4   | [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) | filozofia (SSOT / Thin / Resolver…)            |
| 5   | [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md)                 | wzorce (resolver, seed, pure vs IO)            |
| 6   | [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md)                     | AUDIT→…→CI→CLOSE                               |
| 7   | [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md)             | praktyka commit/CI/prettier                    |
| 8   | Task-specific (poniżej)                                      | tylko zakres EPIC-u                            |

Opcjonalnie głębiej: [`PROJECT_STATE.md`](./PROJECT_STATE.md) · [`../HANDOFF.md`](../HANDOFF.md) · [`../MASTER_HANDOFF.md`](../MASTER_HANDOFF.md).

### Gdy zadanie dotyczy…

| Temat                        | Czytaj                                                                                                      |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **Training (next)**          | GDD §8 · [`../platform/PLAYERS.md`](../platform/PLAYERS.md) · D19 · Principles + Patterns                   |
| Onboarding / auth / klub     | [`../platform/ONBOARDING_FLOW.md`](../platform/ONBOARDING_FLOW.md)                                          |
| First Match                  | [`../platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md)                                                  |
| Hub                          | [`../platform/HUB.md`](../platform/HUB.md)                                                                  |
| Liga                         | [`../platform/LEAGUE.md`](../platform/LEAGUE.md)                                                            |
| Finanse                      | [`../platform/FINANCE.md`](../platform/FINANCE.md)                                                          |
| Kadra                        | [`../platform/PLAYERS.md`](../platform/PLAYERS.md)                                                          |
| Transfery                    | [`../platform/TRANSFERS.md`](../platform/TRANSFERS.md) · D20                                                |
| Match Live / Canvas / Replay | [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)                                                |
| Silnik LFE                   | [`../lfe/README.md`](../lfe/README.md) · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) |
| Produkt / GDD                | [`../game-design/README.md`](../game-design/README.md)                                                      |
| Release                      | [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md)                                                            |

Indeks: [`../README.md`](../README.md).

---

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

---

## Czego NIE robić

| Zakaz                                     | Dlaczego             |
| ----------------------------------------- | -------------------- |
| Commit / push bez **Owner GO**            | polityka projektu    |
| Force-push / rewrite `main`               | historia produkcyjna |
| Kod w EPIC-u docs-only                    | scope                |
| Engine w Canvas / Replay / Post Match     | granica warstw       |
| Mutacja `MatchState` z React UI           | CommandBus only      |
| Duplikacja logiki LFE w `apps/web`        | ZERO DUPLICATE       |
| Runtime mock (rynek/kasa/tabela/Hub FOMO) | NO RUNTIME MOCKS     |
| Nowy docs gdy treść już istnieje          | SSOT FIRST           |
| Commit `.env` / sekretów                  | bezpieczeństwo       |

---

## Zasady twarde (skrót)

Pełna filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md).

1. SSOT FIRST · REUSE FIRST · ZERO DUPLICATE
2. RESOLVER FIRST · PURE BEFORE IO · THIN SLICE
3. SEED != RUNTIME · NO RUNTIME MOCKS
4. Hub = decyzja · First Match przed Hubem · `createMatch()` entry LFE

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
