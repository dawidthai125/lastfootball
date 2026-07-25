# Platform — Finance

## Cel

Kasa klubu i historia ruchów (Finance Thin).

## SSOT

| Fakt     | Źródło                                                     |
| -------- | ---------------------------------------------------------- |
| Saldo    | `clubs.cash_balance`                                       |
| Historia | `finance_movements`                                        |
| UI       | **wyłącznie** `resolveClubFinance(...)` → `ClubFinanceDto` |
| Unlock   | Nav / Secondary Finanse na `SEASON`                        |
| Chip Hub | jedna linia kasy (SEASON); bez trendu                      |
| Stałe    | `ECONOMY_THIN` — tymczasowe do GDD §26                     |

## Zachowanie Thin

- Seed `STARTER_CASH` przy create club.
- Nagroda W/D/L tylko przy pierwszym `fixture` → `played`.
- Kategorie m.in. `starter`, `match_reward`, `transfer_buy`, `transfer_sell`.

## Decyzje

D18 — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Pensje, bilety, sponsorzy, envelope.

## Kod

`lib/finance/*` · `/finance`

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
