# Last Football — Documentation SSOT

## Cel

Indeks dokumentacji. **Punkt startowy:** root [`AGENTS.md`](../AGENTS.md) → [`AI/START_HERE.md`](./AI/START_HERE.md).

## Aktualny stan

| Warstwa              | Stan                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------- |
| **Feature baseline** | `10de062` — LFE-TRAINING-01 FULLY CLOSED                                                  |
| Production           | https://lastfootball.vercel.app                                                           |
| Platform             | Onboarding · First Match · Hub SEASON · League · Finance · Players · Transfers · Training |
| LFE / Match UI       | EPIC-1…7 · Live Bridge · Canvas · Replay · Post Match · Ratings                           |
| GDD                  | GDD-01…15 CLOSED · next: Owner (GDD-16+ / §26 / …)                                        |
| Infra                | Supabase `anoeimngwptucjdugjme` · Vercel · CI GREEN                                       |

## Jak czytać (AI)

1. [`AI/START_HERE.md`](./AI/START_HERE.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`AI/ARCHITECTURE_RULES.md`](./AI/ARCHITECTURE_RULES.md)
4. [`AI/ARCHITECTURE_PRINCIPLES.md`](./AI/ARCHITECTURE_PRINCIPLES.md)
5. [`AI/COMMON_PATTERNS.md`](./AI/COMMON_PATTERNS.md)
6. [`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md)
7. [`AI/ENGINEERING_GUIDE.md`](./AI/ENGINEERING_GUIDE.md)
8. Platform / LFE / GDD wg zadania

## Mapa dokumentów

### AI

| Dokument                                                         | Opis                    |
| ---------------------------------------------------------------- | ----------------------- |
| [AI/START_HERE.md](./AI/START_HERE.md)                           | Onboarding              |
| [AI/CURRENT_BASELINE.md](./AI/CURRENT_BASELINE.md)               | Feature baseline vs tip |
| [AI/ARCHITECTURE_RULES.md](./AI/ARCHITECTURE_RULES.md)           | Warstwy + SSOT          |
| [AI/ARCHITECTURE_PRINCIPLES.md](./AI/ARCHITECTURE_PRINCIPLES.md) | Filozofia               |
| [AI/COMMON_PATTERNS.md](./AI/COMMON_PATTERNS.md)                 | Wzorcę                  |
| [AI/EPIC_WORKFLOW.md](./AI/EPIC_WORKFLOW.md)                     | Pipeline                |
| [AI/ENGINEERING_GUIDE.md](./AI/ENGINEERING_GUIDE.md)             | Praktyka CI/commit      |
| [AI/PROJECT_STATE.md](./AI/PROJECT_STATE.md)                     | Done/next (AI)          |
| [AI/DECISIONS.md](./AI/DECISIONS.md)                             | Indeks decyzji          |
| [AI-HANDOFF.md](./AI-HANDOFF.md)                                 | Alias → START_HERE      |

### Status (jedna lista EPIC = ROADMAP)

| Dokument                                                              | Opis                                     |
| --------------------------------------------------------------------- | ---------------------------------------- |
| [ROADMAP.md](./ROADMAP.md)                                            | **SSOT listy DONE/PLANNED**              |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)                              | Skrót „gdzie jesteśmy” (linkuje ROADMAP) |
| [HANDOFF.md](./HANDOFF.md) / [MASTER_HANDOFF.md](./MASTER_HANDOFF.md) | Przekazanie                              |

### Platform

| Dokument                                                     | Opis                   |
| ------------------------------------------------------------ | ---------------------- |
| [platform/HUB.md](./platform/HUB.md)                         | Fazy / CTA / unlock    |
| [platform/LEAGUE.md](./platform/LEAGUE.md)                   | Fixtures + tabela      |
| [platform/FINANCE.md](./platform/FINANCE.md)                 | Kasa                   |
| [platform/PLAYERS.md](./platform/PLAYERS.md)                 | Kadra                  |
| [platform/TRANSFERS.md](./platform/TRANSFERS.md)             | Rynek                  |
| [platform/TRAINING.md](./platform/TRAINING.md)               | Trening                |
| [platform/FIRST_MATCH.md](./platform/FIRST_MATCH.md)         | Tunel pierwszego meczu |
| [platform/ONBOARDING_FLOW.md](./platform/ONBOARDING_FLOW.md) | Landing → klub         |

### Process / architecture

[WORKFLOW.md](./WORKFLOW.md) · [RELEASE_PROCESS.md](./RELEASE_PROCESS.md) · [ARCHITECTURE.md](./ARCHITECTURE.md) · [DECISIONS.md](./DECISIONS.md) · [CODING_STANDARDS.md](./CODING_STANDARDS.md)

### LFE / Match UI / GDD / Ops

[`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md) · [`game-design/`](./game-design/) · [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md) · [`DEV_SETUP.md`](./DEV_SETUP.md)

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

## Last updated

2026-07-25 — LFE-TRAINING-01 CLOSE
