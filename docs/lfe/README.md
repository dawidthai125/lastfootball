# LFE Documentation Index

## Cel dokumentu

Punkt wejścia do dokumentacji silnika Last Football Engine (`@lastfootball/lfe`).

## Aktualny stan

EPIC-1…7 **DONE**. Architecture Freeze **APPROVED**. Pakiet `0.7.0-epic7` na `main`.

## Opis działania

LFE to headless, deterministyczny silnik meczu. Aplikacja woła `createMatch` i steruje przez `MatchSession`.

## Dokumenty

| Plik                                                       | Opis                                                                          |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------- |
| [ENGINE_OVERVIEW.md](./ENGINE_OVERVIEW.md)                 | Warstwy, odpowiedzialności, granice                                           |
| [PUBLIC_API.md](./PUBLIC_API.md)                           | PUBLIC / ADVANCED / TESTING / INTERNAL / DEPRECATED / RESERVED / EXPERIMENTAL |
| [MATCH_FLOW.md](./MATCH_FLOW.md)                           | Przebieg od createMatch do końca                                              |
| [ENGINE_PIPELINE.md](./ENGINE_PIPELINE.md)                 | Diagram tekstowy pipeline                                                     |
| [CURRENT_STATUS.md](./CURRENT_STATUS.md)                   | Status EPIC-1…7                                                               |
| [LFE_ARCHITECTURE_FREEZE.md](./LFE_ARCHITECTURE_FREEZE.md) | **Kontrakt zamrożony**                                                        |
| [overview.md](./overview.md)                               | Layout katalogów src                                                          |
| epic1…epic7 `*.md`                                         | Notatki per EPIC                                                              |

## Najważniejsze decyzje

Patrz freeze + [`../DECISIONS.md`](../DECISIONS.md) (D2–D7, D10–D12).

## Powiązania

[`../ARCHITECTURE.md`](../ARCHITECTURE.md) · [`../HANDOFF.md`](../HANDOFF.md)

## Last updated

2026-07-23
