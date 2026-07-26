# Last Football — Documentation SSOT

## Cel

Indeks dokumentacji. **Punkt startowy:** root [`AGENTS.md`](../AGENTS.md) → [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) → [`AI/START_HERE.md`](./AI/START_HERE.md).

## Aktualny stan

| Warstwa               | Stan                                                                                     |
| --------------------- | ---------------------------------------------------------------------------------------- |
| **Feature baseline**  | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) — `9b1c575` (LFE-TRANSFERS-08)      |
| **Documentation tip** | `4a0b3ee` — LFE-DOCS-UX-03 (nie zmienia feature baseline)                                |
| **Status projektu**   | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) (SSOT)                                        |
| Production            | https://lastfootball.vercel.app                                                          |
| Platform              | Onboarding · First Match · Hub · League · Finance · Players · Transfers 01…08 · Training |
| LFE / Match UI        | EPIC-1…7 · Live Bridge · Canvas · Replay · Post Match · Ratings                          |
| GDD                   | GDD-01…15 · §26 CLOSED · next: Owner (GDD-16+)                                           |
| UI Presentation       | Guide §16 Contract · UI Evolution 01/02 · postmortem REFERENCE                           |
| Infra                 | Supabase `anoeimngwptucjdugjme` · Vercel · CI GREEN                                      |

## Jak czytać (AI)

1. [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md)
2. [`AI/START_HERE.md`](./AI/START_HERE.md)
3. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
4. [`AI/ARCHITECTURE_RULES.md`](./AI/ARCHITECTURE_RULES.md)
5. [`AI/ARCHITECTURE_PRINCIPLES.md`](./AI/ARCHITECTURE_PRINCIPLES.md)
6. [`AI/COMMON_PATTERNS.md`](./AI/COMMON_PATTERNS.md)
7. [`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md)
8. [`AI/ENGINEERING_GUIDE.md`](./AI/ENGINEERING_GUIDE.md)
9. [`AI/MODULE_MAP.md`](./AI/MODULE_MAP.md) · [`AI/EPIC_INDEX.md`](./AI/EPIC_INDEX.md)
10. Platform / LFE / GDD wg zadania

## Mapa dokumentów

### AI

| Dokument                                                         | Opis                    |
| ---------------------------------------------------------------- | ----------------------- |
| [AI/AI_QUICK_START.md](./AI/AI_QUICK_START.md)                   | Cold start 1 ekran      |
| [AI/START_HERE.md](./AI/START_HERE.md)                           | Onboarding map          |
| [AI/CURRENT_BASELINE.md](./AI/CURRENT_BASELINE.md)               | Feature baseline vs tip |
| [AI/MODULE_MAP.md](./AI/MODULE_MAP.md)                           | Katalogi / moduły       |
| [AI/EPIC_INDEX.md](./AI/EPIC_INDEX.md)                           | Indeks EPIC             |
| [AI/ARCHITECTURE_RULES.md](./AI/ARCHITECTURE_RULES.md)           | Warstwy + SSOT          |
| [AI/ARCHITECTURE_PRINCIPLES.md](./AI/ARCHITECTURE_PRINCIPLES.md) | Filozofia               |
| [AI/COMMON_PATTERNS.md](./AI/COMMON_PATTERNS.md)                 | Wzorce                  |
| [AI/EPIC_WORKFLOW.md](./AI/EPIC_WORKFLOW.md)                     | Pipeline + Owner GO     |
| [AI/ENGINEERING_GUIDE.md](./AI/ENGINEERING_GUIDE.md)             | Praktyka CI/commit      |
| [AI/PROJECT_STATE.md](./AI/PROJECT_STATE.md)                     | Done/next (AI)          |
| [AI/DECISIONS.md](./AI/DECISIONS.md)                             | Indeks decyzji          |
| [AI-HANDOFF.md](./AI-HANDOFF.md)                                 | Alias → START_HERE      |

### Status (jedna lista EPIC = ROADMAP)

| Dokument                                                              | Opis                        |
| --------------------------------------------------------------------- | --------------------------- |
| [ROADMAP.md](./ROADMAP.md)                                            | **SSOT** listy DONE/PLANNED |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)                              | **SSOT** statusu projektu   |
| [HANDOFF.md](./HANDOFF.md) / [MASTER_HANDOFF.md](./MASTER_HANDOFF.md) | Alias / mapa handoff        |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)                          | REFERENCE — opis produktu   |

### Platform

| Dokument                                                                 | Opis                    |
| ------------------------------------------------------------------------ | ----------------------- |
| [platform/HUB.md](./platform/HUB.md)                                     | Fazy / CTA / unlock     |
| [platform/LEAGUE.md](./platform/LEAGUE.md)                               | Fixtures + tabela       |
| [platform/FINANCE.md](./platform/FINANCE.md)                             | Kasa                    |
| [platform/PLAYERS.md](./platform/PLAYERS.md)                             | Kadra                   |
| [platform/TRANSFERS.md](./platform/TRANSFERS.md)                         | Rynek (skrót SSOT)      |
| [platform/TRANSFER_ARCHITECTURE.md](./platform/TRANSFER_ARCHITECTURE.md) | Settlement / RPC / dług |
| [platform/TRAINING.md](./platform/TRAINING.md)                           | Trening                 |
| [platform/FIRST_MATCH.md](./platform/FIRST_MATCH.md)                     | Tunel pierwszego meczu  |
| [platform/ONBOARDING_FLOW.md](./platform/ONBOARDING_FLOW.md)             | Landing → klub          |

### Process / architecture

[WORKFLOW.md](./WORKFLOW.md) · [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DECISIONS.md](./DECISIONS.md) · [CODING_STANDARDS.md](./CODING_STANDARDS.md)

### LFE / Match UI / GDD / Ops

[`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md) · [`game-design/`](./game-design/) · [`game-design/UI_DESIGN_GUIDE.md`](./game-design/UI_DESIGN_GUIDE.md) (§16 Contract) · [`game-design/LFE-UX-POSTMORTEM-01.md`](./game-design/LFE-UX-POSTMORTEM-01.md) (REFERENCE) · [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md) · [`DEV_SETUP.md`](./DEV_SETUP.md)

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Last updated

2026-07-26 — AI-DOCS-SYNC-01
