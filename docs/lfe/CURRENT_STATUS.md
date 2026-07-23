# LFE — Current Status

## Cel dokumentu

Status implementacji EPIC-ów silnika.

## Aktualny stan

Wszystkie EPIC-1…7 **ukończone i na `main`**. Freeze APPROVED. Brak aktywnego EPIC gameplay.

## Status EPIC

| EPIC   | Nazwa               | Status   | Notatka                                          |
| ------ | ------------------- | -------- | ------------------------------------------------ |
| EPIC-1 | Foundation          | **DONE** | tick, clock, rng, events, scheduler, world, loop |
| EPIC-2 | Match Domain        | **DONE** | czyste modele danych                             |
| EPIC-3 | Match State Machine | **DONE** | lifecycle SSOT                                   |
| EPIC-4 | Simulation Systems  | **DONE** | builtin pipeline                                 |
| EPIC-5 | Command System      | **DONE** | bus + match commands                             |
| EPIC-6 | Match Session       | **DONE** | `createMatch` façade                             |
| EPIC-7 | Positioning         | **DONE** | spatial read, bez fizyki                         |

## Moduły (status.ts — skrót)

| Ready                                                                                                                                   | Stub / Future      |
| --------------------------------------------------------------------------------------------------------------------------------------- | ------------------ |
| core, rng, events, scheduler, world, simulation, replay, config, match-domain, SM, systems, commands, match session, positioning, input | physics, ai, rules |

## Następne (nie rozpoczęte)

- Physics / ball movement
- AI
- Rules
- Zawężenie public `index.ts` do freeze
- Subpath exports `advanced` / `testing`

## Najważniejsze decyzje

Nie startować Physics bez Owner GO i bez aktualizacji tego statusu.

## Powiązania

[README.md](./README.md) · epic1…epic7 docs · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)

## Last updated

2026-07-23
