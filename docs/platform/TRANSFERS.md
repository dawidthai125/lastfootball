# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + nego + AI incoming + listing + Live H2H Instant + Pending + **1× Counter**) na bazie `players` + kasy.

## SSOT

| Fakt                  | Źródło                                                |
| --------------------- | ----------------------------------------------------- |
| UI                    | wyłącznie `resolveTransferMarket`                     |
| Listing / Live podaż  | `players.transfer_listed_at`                          |
| Pending / Counter H2H | **`transfer_offers`** (jedyna tabela ofert)           |
| Ask                   | `deriveTransferFee`                                   |
| Kwoty                 | `NEGOTIATION_THIN` allow-list (90/95/100/110%)        |
| Opening snapshot      | `opening_amount` (immutable)                          |
| Settlement amount     | `current_amount`                                      |
| Settlement            | `completeTransferBuy` / `completeTransferSell` (live) |
| Cash                  | `cash_balance`                                        |

## Counter H2H (LFE-TRANSFERS-08)

- 1 Counter na ofertę — wyłącznie **Seller**; po Counter **Accept = Buyer**.
- Counter mutuje tylko `current_amount`, `phase`, `last_actor` (RPC `FOR UPDATE`).
- Po Counter: Accept / Reject / Withdraw / Superseded.
- Instant Buy (06) + Pending Create (07) równolegle.
- Brak escrow / timeout / AI H2H / `completeLiveTransfer()`.

## Pending H2H (LFE-TRANSFERS-07)

- Create / Reject / Withdraw — tylko `transfer_offers` (bez cash/players/deals).
- Accept (opening) → seller settle @ `current_amount` + superseded.
- Instant / Unlist → supersede pending w tej samej TX.

## Live Instant (LFE-TRANSFERS-06)

- Human↔Human Instant @ 100% ask; `players.id` stałe; RPC `complete_live_h2h_transfer`.

## Poza Thin

Escrow · timeout · 2+ counters · buyer Counter · AI H2H · custom ask · `completeLiveTransfer()`.

## Last updated

2026-07-26 — LFE-TRANSFERS-08 CLOSE
