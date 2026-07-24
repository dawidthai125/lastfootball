# Last Football — Documentation SSOT

## Cel dokumentu

Indeks dokumentacji projektu. **To jest punkt startowy** dla nowego Chatu / Cursor / developera.

## Aktualny stan

| Warstwa   | Stan                                                                       |
| --------- | -------------------------------------------------------------------------- |
| LFE       | EPIC-1…7 + Gameplay + AI + Engine + Player Match Data · `0.9.1-match-ai01` |
| Web match | Live Bridge + Canvas + Replay + Post Match na `main`                       |
| GDD       | Faza 2 częściowo (§6 skeleton)                                             |
| Infra     | Next.js + Supabase + Vercel · CI zielony                                   |

## Jak czytać (kolejność)

1. [`AI-HANDOFF.md`](./AI-HANDOFF.md) — **handbook agenta** (pełny; reguły + pipeline + workflow)
2. [`HANDOFF.md`](./HANDOFF.md) — szybki start
3. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — gdzie jesteśmy
4. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — jak jest zbudowany
5. [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md) — silnik gameplay
6. [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md) — Canvas / Replay / Post Match / Bridge
7. [`WORKFLOW.md`](./WORKFLOW.md) · [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) · [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md)
8. [`game-design/README.md`](./game-design/README.md) — design produktu

## Mapa dokumentów

| Dokument                                       | Opis                                  |
| ---------------------------------------------- | ------------------------------------- |
| [AI-HANDOFF.md](./AI-HANDOFF.md)               | Agent handbook (SSOT startowy)        |
| [HANDOFF.md](./HANDOFF.md)                     | Krótki handoff                        |
| [API.md](./API.md)                             | Indeks API LFE + web match            |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)   | Wizja, stack, granice                 |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)       | Etap, done / in progress / next       |
| [ROADMAP.md](./ROADMAP.md)                     | DONE / IN PROGRESS / PLANNED / FUTURE |
| [ARCHITECTURE.md](./ARCHITECTURE.md)           | System + przepływ danych              |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Katalogi PUBLIC / INTERNAL            |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md)   | Konwencje kodu                        |
| [WORKFLOW.md](./WORKFLOW.md)                   | AUDIT → RELEASE, role                 |
| [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)     | Commity, push, rollback               |
| [DECISIONS.md](./DECISIONS.md)                 | Decyzje architektoniczne              |
| [CHANGELOG.md](./CHANGELOG.md)                 | Historia docs / release               |

### LFE

| Dokument                                                           | Opis                             |
| ------------------------------------------------------------------ | -------------------------------- |
| [lfe/README.md](./lfe/README.md)                                   | Indeks silnika                   |
| [lfe/GAMEPLAY_MATCH_STACK.md](./lfe/GAMEPLAY_MATCH_STACK.md)       | Gameplay / AI / Engine           |
| [lfe/ENGINE_OVERVIEW.md](./lfe/ENGINE_OVERVIEW.md)                 | Warstwy i granice                |
| [lfe/PUBLIC_API.md](./lfe/PUBLIC_API.md)                           | PUBLIC / INTERNAL / rozszerzenia |
| [lfe/MATCH_FLOW.md](./lfe/MATCH_FLOW.md)                           | createMatch → koniec             |
| [lfe/ENGINE_PIPELINE.md](./lfe/ENGINE_PIPELINE.md)                 | Pipeline tekstowy                |
| [lfe/CURRENT_STATUS.md](./lfe/CURRENT_STATUS.md)                   | Status EPIC + modułów            |
| [lfe/LFE_ARCHITECTURE_FREEZE.md](./lfe/LFE_ARCHITECTURE_FREEZE.md) | **Kontrakt API v1**              |
| [lfe/overview.md](./lfe/overview.md)                               | Layout pakietu + epic notes      |

### Web match

| Dokument                                               | Opis                                |
| ------------------------------------------------------ | ----------------------------------- |
| [web/MATCH_UI_PIPELINE.md](./web/MATCH_UI_PIPELINE.md) | Live / Canvas / Replay / Post Match |

### Game Design

| Dokument                                                                     | Opis               |
| ---------------------------------------------------------------------------- | ------------------ |
| [game-design/README.md](./game-design/README.md)                             | Indeks GDD         |
| [game-design/CURRENT_DESIGN.md](./game-design/CURRENT_DESIGN.md)             | Co jest wypełnione |
| [game-design/ROADMAP.md](./game-design/ROADMAP.md)                           | Kolejne etapy GDD  |
| [game-design/GAME_DESIGN_DOCUMENT.md](./game-design/GAME_DESIGN_DOCUMENT.md) | **SSOT produktu**  |
| [game-design/UI_DESIGN_GUIDE.md](./game-design/UI_DESIGN_GUIDE.md)           | Zasady UI          |

### Architecture / Ops

| Dokument                                                             | Opis                 |
| -------------------------------------------------------------------- | -------------------- |
| [architecture/SYSTEM_OVERVIEW.md](./architecture/SYSTEM_OVERVIEW.md) | Widok systemu        |
| [architecture/DEPENDENCIES.md](./architecture/DEPENDENCIES.md)       | Zależności pakietów  |
| [architecture/foundation.md](./architecture/foundation.md)           | Foundation notes     |
| [DEV_SETUP.md](./DEV_SETUP.md)                                       | Uruchomienie lokalne |
| [ENVIRONMENT.md](./ENVIRONMENT.md)                                   | Env vars             |
| [DEPLOYMENT.md](./DEPLOYMENT.md)                                     | Vercel               |
| [SECURITY.md](./SECURITY.md)                                         | Security             |
| [GITHUB.md](./GITHUB.md)                                             | GitHub checklist     |

## Opis działania

Nowy agent **nie** powinien polegać na starym czacie. Czyta `AI-HANDOFF.md` / `HANDOFF.md`, potem status i architekturę, potem LFE / web match / GDD w zależności od zadania.

## Najważniejsze decyzje

- GDD = SSOT produktu; LFE freeze = SSOT kontraktu silnika.
- `createMatch()` → `MatchSession` = jedyny oficjalny entry meczu.
- Canvas / Replay tylko read / nagrane dane.
- Physics / pełne Rules = FUTURE (Owner GO).

## Powiązania

Root [`README.md`](../README.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md) · chronologia docs: [`CHANGELOG.md`](./CHANGELOG.md) (root `CHANGELOG.md` = starsze release notes UI 0.1.0)

## Last updated

2026-07-24 — AI-DOCS-CONSOLIDATION-01
