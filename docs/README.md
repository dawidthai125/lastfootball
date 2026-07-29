# Last Football — Documentation SSOT

## Cel

Indeks dokumentacji. **Punkt startowy:** root [`AGENTS.md`](../AGENTS.md) → [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) → [`AI/START_HERE.md`](./AI/START_HERE.md).

## Aktualny stan

| Warstwa                     | Stan                                                                                             |
| --------------------------- | ------------------------------------------------------------------------------------------------ |
| **Production Baseline**     | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) — `54d0724` (LFE-UI-IMPL-06 · UI P0)        |
| **Domain feature baseline** | `cd222ba` — LFE-PLAYERS-02 (Player Development Thin)                                             |
| **Presentation tip**        | `9fd14fc` — LFE-UI-MOTION-01 (Hub/Match motion Thin)                                             |
| **Documentation tip**       | `4dedd71` — GDD-18 Ranking Thin (sezonowy ranking klubów)                            |
| **Master handoff**          | [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md)                                               |
| **Status projektu**         | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) (SSOT)                                                |
| Production                  | https://lastfootball.vercel.app                                                                  |
| Platform                    | Onboarding · First Match · Hub · League · Finance · **Players Dev** · Transfers · Training Depth |
| LFE / Match UI              | EPIC-1…7 · Live · Canvas · Replay · Post · Match Path immersive                                  |
| GDD                         | GDD-01…**18** Thin · §26 CLOSED · next: **GDD-19 READY FOR AUDIT**                               |
| UI Presentation             | Guide §16 · §8 Motion · **UI P0** · **MOTION-01** · Landing · Branding · Auth UX                 |
| Impl notes                  | [`implementation/`](./implementation/)                                                           |
| Infra                       | Supabase `anoeimngwptucjdugjme` · Vercel · CI GREEN                                              |

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
| [AI/PROJECT_HANDOFF.md](./AI/PROJECT_HANDOFF.md)                 | **Master handoff** AI   |
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

2026-07-30 — GDD-18 CLOSE
