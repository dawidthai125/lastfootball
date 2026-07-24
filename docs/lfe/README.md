# LFE Documentation Index

## Cel dokumentu

Punkt wejścia do dokumentacji silnika Last Football Engine (`@lastfootball/lfe`).

## Aktualny stan

|                                        |                          |
| -------------------------------------- | ------------------------ |
| **Version**                            | `0.9.1-match-ai01`       |
| **EPIC-1…7**                           | DONE                     |
| **Gameplay + Match AI + Match Engine** | DONE                     |
| **Architecture Freeze**                | APPROVED (PUBLIC API v1) |

## Opis działania

LFE to headless, deterministyczny silnik meczu. Aplikacja woła `createMatch` i steruje przez `MatchSession`. Tick: systems → **MatchEngineSystem** → Match AI decisions → Engine resolve → MatchState + EventBus.

**Canvas / Replay UI** nie są częścią LFE — zobacz [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md).

## Dokumenty

| Plik                                                       | Opis                                           |
| ---------------------------------------------------------- | ---------------------------------------------- |
| [GAMEPLAY_MATCH_STACK.md](./GAMEPLAY_MATCH_STACK.md)       | **Gameplay / AI / Engine** (aktualny stack)    |
| [ENGINE_OVERVIEW.md](./ENGINE_OVERVIEW.md)                 | Warstwy, odpowiedzialności, granice            |
| [PUBLIC_API.md](./PUBLIC_API.md)                           | PUBLIC / ADVANCED / TESTING / … + rozszerzenia |
| [MATCH_FLOW.md](./MATCH_FLOW.md)                           | Przebieg od createMatch do końca               |
| [ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md)                 | Diagram pipeline                               |
| [CURRENT_STATUS.md](./CURRENT_STATUS.md)                   | Status EPIC + modułów                          |
| [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md) | **Kontrakt zamrożony**                         |
| [overview.md](./overview.md)                               | Layout katalogów src                           |
| epic1…epic7 `*.md`                                         | Notatki historyczne per EPIC                   |

## Najważniejsze decyzje

Patrz freeze + [`../DECISIONS.md`](../DECISIONS.md).  
Nowe eksporty AI/Engine są **rozszerzeniem powierzchni** vs freeze — aplikacja preferuje `createMatch`; nie promuj TESTING → PUBLIC bez AUDIT.

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [`../AI-HANDOFF.md`](../AI-HANDOFF.md) · [`../HANDOFF.md`](../HANDOFF.md)

## Last updated

2026-07-23 — LFE-DOCS-SYNC-01
