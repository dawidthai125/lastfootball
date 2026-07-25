# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell) na bazie `players` + kasy.

## SSOT

| Fakt        | Źródło                                                              |
| ----------- | ------------------------------------------------------------------- |
| UI rynku    | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`    |
| Okno        | `clubs.transfer_window_open`                                        |
| Unlock okna | played fixtures ≥ `UNLOCK_AFTER_PLAYED=2` (Thin vs GDD K11)         |
| Deal        | `players` + `cash_balance` + `finance_movements` + `transfer_deals` |
| Ledger      | `transfer_deals` (idempotency + `completed_at`)                     |
| Sell        | `DEPARTED` + `departed_at` (bez DELETE)                             |
| Fee         | derive (`deriveTransferFee`) — brak trwałego `market_value`         |
| Katalog     | `seedTransferCatalogue()` (`m-{tag}-…`)                             |
| Środki      | cash-only (bez envelope)                                            |

## Unlock Nav

Transfery open gdy `SEASON` **i** `transfer_window_open`.

## Decyzje

D20 — [`../DECISIONS.md`](../DECISIONS.md).

## Poza Thin

Negotiation, envelope, potential, Training, live market DB.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
