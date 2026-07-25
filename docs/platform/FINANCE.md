# Platform — Finance

## Cel

Kasa klubu i historia ruchów (Finance Thin).

## SSOT

| Fakt     | Źródło                                                            |
| -------- | ----------------------------------------------------------------- |
| Saldo    | `clubs.cash_balance`                                              |
| Historia | `finance_movements`                                               |
| UI       | **wyłącznie** `resolveClubFinance(...)` → `ClubFinanceDto`        |
| Unlock   | Nav / Secondary Finanse na `SEASON`                               |
| Chip Hub | jedna linia kasy (SEASON); bez trendu                             |
| Stałe    | `ECONOMY_THIN` — wartości = GDD **§26** (CURRENCY + TRANSFER_FEE) |

## Zachowanie Thin

- Seed `STARTER_CASH` przy create club.
- Nagroda W/D/L tylko przy pierwszym `fixture` → `played`.
- Kategorie m.in. `starter`, `match_reward`, `transfer_buy`, `transfer_sell`.
- **§26 = SSOT liczb**; **D18 = SSOT implementacji**.

## Decyzje

D18 — [`../DECISIONS.md`](../DECISIONS.md). GDD §26 — [`../game-design/GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md).

## Poza Thin

Pensje, bilety, sponsorzy, envelope.

## Kod

`lib/finance/*` · `/finance`

## Last updated

2026-07-25 — GDD-§26B CLOSE
