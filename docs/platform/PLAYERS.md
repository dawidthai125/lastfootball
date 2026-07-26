# Platform — Players (Squad)

## Cel

Trwała kadra klubu gracza (Players Thin).

**UI naming:** ekran `/squad` w produkcie = **Kadra**; **Skład** = XI meczowy (nie label nav `/squad`).  
Glosariusz: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.6.

## SSOT

| Fakt        | Źródło                                                       |
| ----------- | ------------------------------------------------------------ |
| Wiersze     | tabela `players`                                             |
| UI          | **wyłącznie** `resolveClubSquad(club, rows)` → `SquadDto`    |
| IO          | `listClubPlayers` (aktywna kadra; bez `DEPARTED`)            |
| Starter ids | `s-{tag}-…`                                                  |
| Buy ids     | `t-{tag}-…` (Transfers)                                      |
| Version     | default `1`                                                  |
| Status      | `READY` \| `INJURED` \| `SUSPENDED` \| `TIRED` \| `DEPARTED` |

## Seed

- Create / backfill / testy: `seedClubRoster` / inserts.
- Runtime: **zakaz** fallbacku do seeda → `SquadUnavailableError`.
- AI: `seedBotSquad` / `seedOpponentSquad` (poza tabelą gracza).

## Decyzje

D19 (D16 superseded) — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Edycja XI, `potential`, pensje; rozwój `skill` z treningu (D21 poza).

## UI (presentation)

Ekran `/squad` = decision-first (question-day); soft-link Trening.  
Szczegóły: [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16.

## Kod

`lib/squad/*` · `/squad` · `/players/[id]`

## Last updated

2026-07-26 — LFE-DOCS-UX-03
