# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + nego + AI incoming + listing + Live H2H Instant + **Pending Offers**) na bazie `players` + kasy.

## SSOT

| Fakt                 | Źródło                                                |
| -------------------- | ----------------------------------------------------- |
| UI                   | wyłącznie `resolveTransferMarket`                     |
| Listing / Live podaż | `players.transfer_listed_at`                          |
| Pending H2H          | **`transfer_offers`** (jedyna tabela ofert)           |
| Ask                  | `deriveTransferFee`                                   |
| Kwoty pending        | `NEGOTIATION_THIN` allow-list                         |
| Settlement           | `completeTransferBuy` / `completeTransferSell` (live) |
| Cash                 | `cash_balance`                                        |

## Pending H2H (LFE-TRANSFERS-07)

- Instant Buy (06) równolegle.
- Create / Reject / Withdraw — tylko `transfer_offers` (bez cash/players/deals).
- Accept → live settle + `accepted` + **superseded** pozostałych pending (ta sama TX).
- Instant / Unlist → supersede pending w tej samej TX.
- Brak escrow / timeout / AI pending.
- Snapshot `amount` + `ask_at_create` immutable po Create.
- Accept: re-derive fee tylko do walidacji allow-list; settle @ `offer.amount`.
- Brak środków przy Accept → oferta zostaje `pending`.

## Live Instant (LFE-TRANSFERS-06)

- Human↔Human Instant @ 100% ask; `players.id` stałe; RPC `complete_live_h2h_transfer`.

## Poza Thin

Escrow · timeout · H2H counter rounds · AI pending · custom ask · `completeLiveTransfer()`.

## Last updated

2026-07-26 — LFE-TRANSFERS-07 CLOSE
