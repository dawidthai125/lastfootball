# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + stateless buy negotiation) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt        | Źródło                                                                           |
| ----------- | -------------------------------------------------------------------------------- |
| UI rynku    | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                 |
| Okno        | `clubs.transfer_window_open`                                                     |
| Unlock okna | played fixtures ≥ `UNLOCK_AFTER_PLAYED=2` (Thin vs GDD K11)                      |
| Deal        | `players` + `cash_balance` + `finance_movements` + `transfer_deals`              |
| Ledger      | `transfer_deals` (idempotency + `completed_at`)                                  |
| Sell        | `DEPARTED` + `departed_at` (bez DELETE); **instant** (bez nego)                  |
| Ask / fee   | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE` (GDD §26); brak `market_value` |
| Envelope    | **derive** `resolveTransferEnvelope(cash)` — jedyny wzór; brak kolumny DB        |
| Negotiation | **pure** `resolveNegotiationStep` — stateless; brak pending DB / timeoutów       |
| Settlement  | `completeTransferBuy(agreedAmount)` — gate na ask / envelope / window / roster   |
| Katalog     | `seedTransferCatalogue()` (`m-{tag}-…`)                                          |
| Środki      | `cash_balance` = SSOT salda; envelope = przydział (Thin ratio 1)                 |
| Waluta UI   | `ECONOMY_THIN.CURRENCY`                                                          |

## Negotiation Thin (LFE-TRANSFERS-02-N1)

- **Buy only.** Sell = instant @ fee.
- Presets vs ask: Low **90%**, Normal **100%**, High **110%**.
- AI: High/Normal → Accept; Low → Counter **95%** ask.
- Po kontrofencie: Accept / Reject (bez drugiej kontrofertę).
- Brak migracji, tabel, timeoutów, pending workflow.

## Unlock Nav

Transfery open gdy `SEASON` **i** `transfer_window_open`.

## Decyzje

D20 — [`../DECISIONS.md`](../DECISIONS.md). Liczby fee — GDD §26. Envelope — E1. Negotiation — N1.

## Poza Thin

Sell negotiation · AI→player offers · 2+ counters · potential · live market DB · envelope ratio ≠ 1 · stored envelope.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-25 — LFE-TRANSFERS-02-N1 CLOSE
