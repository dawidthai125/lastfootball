# Last Football — Documentation SSOT

## Cel

Indeks dokumentacji. **Punkt startowy** dla ChatGPT / Cursor / developera.

## Aktualny stan

| Warstwa    | Stan                                                         |
| ---------- | ------------------------------------------------------------ |
| Production | `b6b92dc` · https://lastfootball.vercel.app                  |
| Platform   | Landing · Auth · Club Wizard · First Match · Hub EARLY_CLUB  |
| LFE        | EPIC-1…7 + Gameplay + AI + Engine · `0.9.1-match-ai01`       |
| Web match  | Live Bridge · Canvas · Replay · Post Match · Ratings         |
| GDD        | GDD-01…15 CLOSED                                             |
| Infra      | Next + Supabase `anoeimngwptucjdugjme` + Vercel · CI zielony |

## Jak czytać (kolejność)

1. Root [`AGENTS.md`](../AGENTS.md) lub [`AI/START_HERE.md`](./AI/START_HERE.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`MASTER_HANDOFF.md`](./MASTER_HANDOFF.md) · [`HANDOFF.md`](./HANDOFF.md)
4. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`ROADMAP.md`](./ROADMAP.md)
5. Platform: [`platform/ONBOARDING_FLOW.md`](./platform/ONBOARDING_FLOW.md) · [`platform/FIRST_MATCH.md`](./platform/FIRST_MATCH.md) · [`platform/HUB.md`](./platform/HUB.md)
6. Match UI: [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)
7. LFE: [`lfe/README.md`](./lfe/README.md)
8. GDD: [`game-design/README.md`](./game-design/README.md)

## Mapa dokumentów

### Start / AI

| Dokument                                               | Opis                |
| ------------------------------------------------------ | ------------------- |
| [AI/START_HERE.md](./AI/START_HERE.md)                 | Handbook agenta     |
| [AI/CURRENT_BASELINE.md](./AI/CURRENT_BASELINE.md)     | Production baseline |
| [AI/PROJECT_STATE.md](./AI/PROJECT_STATE.md)           | Stan done/next      |
| [AI/ARCHITECTURE_RULES.md](./AI/ARCHITECTURE_RULES.md) | Reguły warstw       |
| [AI/EPIC_WORKFLOW.md](./AI/EPIC_WORKFLOW.md)           | AUDIT→CLOSE         |
| [AI/DECISIONS.md](./AI/DECISIONS.md)                   | Decyzje platformy   |
| [MASTER_HANDOFF.md](./MASTER_HANDOFF.md)               | Pełne przekazanie   |
| [HANDOFF.md](./HANDOFF.md)                             | Skrót               |
| [AI-HANDOFF.md](./AI-HANDOFF.md)                       | Alias → `AI/`       |

### Status / process

| Dokument                                     | Opis                     |
| -------------------------------------------- | ------------------------ |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)     | Gdzie jesteśmy           |
| [ROADMAP.md](./ROADMAP.md)                   | DONE / NEXT              |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) | Wizja / stack            |
| [ARCHITECTURE.md](./ARCHITECTURE.md)         | System                   |
| [WORKFLOW.md](./WORKFLOW.md)                 | Role + etapy             |
| [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)   | Commit / push / rollback |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md) | Konwencje                |
| [DECISIONS.md](./DECISIONS.md)               | ADR historyczne          |
| [CHANGELOG.md](./CHANGELOG.md)               | Historia docs            |

### Platform

| Dokument                                                     | Opis          |
| ------------------------------------------------------------ | ------------- |
| [platform/ONBOARDING_FLOW.md](./platform/ONBOARDING_FLOW.md) | Landing → Hub |
| [platform/FIRST_MATCH.md](./platform/FIRST_MATCH.md)         | LFE-MATCH-01  |
| [platform/HUB.md](./platform/HUB.md)                         | LFE-HUB-01    |

### LFE / Web match / GDD / Ops

Jak wcześniej: [`lfe/`](./lfe/), [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md), [`game-design/`](./game-design/), [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md), [`ENVIRONMENT.md`](./ENVIRONMENT.md), [`DEV_SETUP.md`](./DEV_SETUP.md), [`ARCHIVE/`](./ARCHIVE/).

## Last updated

2026-07-24 — LFE-DOCS-01
