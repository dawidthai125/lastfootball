# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + buy nego + incoming AI + player listing) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt          | Źródło                                                                                |
| ------------- | ------------------------------------------------------------------------------------- |
| UI rynku      | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                      |
| Okno          | `clubs.transfer_window_open`                                                          |
| Listing       | `players.transfer_listed_at` (NULL = nie listed); List/Unlist; okno **nie** czyści    |
| Sell / Accept | **`completeTransferSell`** — jedyny settlement; po sell → `transfer_listed_at = NULL` |
| Ask / fee     | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE`                                     |
| Envelope      | `resolveTransferEnvelope(cash)`                                                       |
| Buy nego      | `resolveNegotiationStep`                                                              |
| Incoming AI   | `resolveIncomingOffers` — **tylko** listed + `isTransferSellEligible`                 |
| Kwalifikacja  | **`isTransferSellEligible`** — List / Sell / Incoming                                 |
| Środki        | `cash_balance` = SSOT salda                                                           |

## Listing Thin (LFE-TRANSFERS-04)

- Migracja: `transfer_listed_at timestamptz null` — bez nowych tabel.
- Cena = 100% fee; brak custom ask / sell nego.
- Instant Sell zostaje; Incoming tylko dla listed.
- List/Unlist idempotentne.

## Poza Thin

Sell negotiation · custom ask · 2+ counters · pending/timeout/inbox · live market DB · envelope ratio ≠ 1.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-26 — LFE-TRANSFERS-04 CLOSE
