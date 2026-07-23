# Last Football — Documentation SSOT

## Cel dokumentu

Indeks dokumentacji projektu. **To jest punkt startowy** dla nowego Chatu / Cursor / developera.

## Aktualny stan

Dokumentacja produktowa (GDD Faza 2 częściowo), silnik LFE (EPIC-1…7 + Architecture Freeze), infrastruktura monorepo (Next.js + Supabase + Vercel) — **na `main`**.

## Jak czytać (kolejność)

1. [`HANDOFF.md`](./HANDOFF.md) — szybki start kontekstu
2. [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md) — czym jest projekt
3. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) — gdzie jesteśmy
4. [`ARCHITECTURE.md`](./ARCHITECTURE.md) — jak jest zbudowany
5. [`lfe/README.md`](./lfe/README.md) — silnik meczu
6. [`game-design/README.md`](./game-design/README.md) — design produktu

## Mapa dokumentów

| Dokument                                       | Opis                                           |
| ---------------------------------------------- | ---------------------------------------------- |
| [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)   | Wizja, stack, granice                          |
| [PROJECT_STATUS.md](./PROJECT_STATUS.md)       | Etap, done / in progress / next                |
| [ROADMAP.md](./ROADMAP.md)                     | Completed → Future                             |
| [ARCHITECTURE.md](./ARCHITECTURE.md)           | System + przepływ danych                       |
| [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) | Katalogi PUBLIC / INTERNAL                     |
| [CODING_STANDARDS.md](./CODING_STANDARDS.md)   | Konwencje kodu                                 |
| [WORKFLOW.md](./WORKFLOW.md)                   | AUDIT → RELEASE, role                          |
| [RELEASE_PROCESS.md](./RELEASE_PROCESS.md)     | Commity, push, rollback                        |
| [DECISIONS.md](./DECISIONS.md)                 | Decyzje architektoniczne (nie łamać bez AUDIT) |
| [CHANGELOG.md](./CHANGELOG.md)                 | Historia zmian dokumentacyjna / release        |
| [HANDOFF.md](./HANDOFF.md)                     | Przekazanie kontekstu nowemu agentowi          |

### LFE

| Dokument                                                           | Opis                           |
| ------------------------------------------------------------------ | ------------------------------ |
| [lfe/README.md](./lfe/README.md)                                   | Indeks silnika                 |
| [lfe/ENGINE_OVERVIEW.md](./lfe/ENGINE_OVERVIEW.md)                 | Warstwy i granice              |
| [lfe/PUBLIC_API.md](./lfe/PUBLIC_API.md)                           | PUBLIC / INTERNAL / DEPRECATED |
| [lfe/MATCH_FLOW.md](./lfe/MATCH_FLOW.md)                           | createMatch → koniec           |
| [lfe/ENGINE_PIPELINE.md](./lfe/ENGINE_PIPELINE.md)                 | Pipeline tekstowy              |
| [lfe/CURRENT_STATUS.md](./lfe/CURRENT_STATUS.md)                   | EPIC-1…7                       |
| [lfe/LFE_ARCHITECTURE_FREEZE.md](./lfe/LFE_ARCHITECTURE_FREEZE.md) | **Kontrakt API v1**            |
| [lfe/overview.md](./lfe/overview.md)                               | Layout pakietu + epic notes    |

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

Nowy agent **nie** powinien polegać na starym czacie. Czyta `HANDOFF.md`, potem status i architekturę, potem LFE freeze / GDD w zależności od zadania.

## Najważniejsze decyzje

- GDD = SSOT produktu; LFE freeze = SSOT kontraktu silnika.
- `createMatch()` → `MatchSession` = jedyny oficjalny entry meczu.
- Brak gameplay Physics/AI do czasu osobnego EPIC + GO Ownera.

## Powiązania

Root [`README.md`](../README.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md) · root [`CHANGELOG.md`](../CHANGELOG.md)

## Last updated

2026-07-23
