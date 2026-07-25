# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + nego + incoming AI + listing + **Live H2H**) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt           | Źródło                                                                                  |
| -------------- | --------------------------------------------------------------------------------------- |
| UI rynku       | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                        |
| Okno           | `clubs.transfer_window_open`                                                            |
| Listing        | `players.transfer_listed_at` (NULL = nie listed); List/Unlist; okno **nie** czyści      |
| Live podaż     | `players WHERE transfer_listed_at IS NOT NULL` (inne kluby) — **brak** tabeli listingów |
| Sell settle    | **`completeTransferSell`** — instant void **lub** live leg                              |
| Buy settle     | **`completeTransferBuy`** — seed catalogue **lub** live leg                             |
| Live atomowość | RPC `complete_live_h2h_transfer` (wywoływane tylko z buy/sell live)                     |
| Ask / fee      | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE` (jeden snapshot na Live op)           |
| Envelope       | `resolveTransferEnvelope(cash)`                                                         |
| Buy nego       | `resolveNegotiationStep` (BUY only)                                                     |
| Seller nego    | `resolveSellerNegotiationStep` (Incoming S2 only)                                       |
| Incoming AI    | `resolveIncomingOffers` — listed + eligible                                             |
| Środki         | `cash_balance` = SSOT salda                                                             |

## Live H2H Thin (LFE-TRANSFERS-06)

- Human↔Human; brak AI clubs.
- Instant Buy @ **100% ask**; brak pending / timeout.
- `players.id` **niezmienne**; move = zmiana `club_id` + clear listed (bez DEPARTED).
- Seed Catalogue pozostaje fallbackiem.
- Brak `completeLiveTransfer()` — settlement tylko przez buy/sell (source `live`).

## Seller negotiation Thin (LFE-TRANSFERS-05 S2)

- Incoming only; Instant Sell = 100% ask bez nego.
- Reuse `NEGOTIATION_THIN`; pure `resolveSellerNegotiationStep`.

## Listing Thin (LFE-TRANSFERS-04)

- `transfer_listed_at`; Incoming / Live tylko listed.

## Poza Thin

AI clubs · pending/timeout/inbox · Live nego · custom ask · 2+ counters · envelope ratio ≠ 1 · Instant Sell nego.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-26 — LFE-TRANSFERS-06 CLOSE
