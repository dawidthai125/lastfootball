# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt        | Źródło                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| UI rynku    | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                 |
| Okno        | `clubs.transfer_window_open`                                                     |
| Unlock okna | played fixtures ≥ `UNLOCK_AFTER_PLAYED=2` (Thin vs GDD K11)                      |
| Deal        | `players` + `cash_balance` + `finance_movements` + `transfer_deals`              |
| Ledger      | `transfer_deals` (idempotency + `completed_at`)                                  |
| Sell        | `DEPARTED` + `departed_at` (bez DELETE)                                          |
| Fee         | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE` (GDD §26); brak `market_value` |
| Envelope    | **derive** `resolveTransferEnvelope(cash)` — jedyny wzór; brak kolumny DB        |
| Katalog     | `seedTransferCatalogue()` (`m-{tag}-…`)                                          |
| Środki      | `cash_balance` = SSOT salda; envelope = przydział (Thin ratio 1)                 |
| Waluta UI   | `ECONOMY_THIN.CURRENCY`                                                          |

## Unlock Nav

Transfery open gdy `SEASON` **i** `transfer_window_open`.

## Decyzje

D20 — [`../DECISIONS.md`](../DECISIONS.md). Liczby fee — GDD §26. Envelope — LFE-TRANSFERS-02-E1.

## Poza Thin

Negotiation, potential, live market DB, envelope ratio ≠ 1, stored envelope column.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-25 — LFE-TRANSFERS-02-E1 CLOSE
