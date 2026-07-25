# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + buy/seller nego + incoming AI + listing) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt         | Źródło                                                                              |
| ------------ | ----------------------------------------------------------------------------------- |
| UI rynku     | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                    |
| Okno         | `clubs.transfer_window_open`                                                        |
| Listing      | `players.transfer_listed_at` (NULL = nie listed); List/Unlist; okno **nie** czyści  |
| Sell settle  | **`completeTransferSell(agreedAmount)`** — jedyny settlement; po sell → listed NULL |
| Ask / fee    | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE`                                   |
| Envelope     | `resolveTransferEnvelope(cash)`                                                     |
| Buy nego     | `resolveNegotiationStep` (BUY only)                                                 |
| Seller nego  | `resolveSellerNegotiationStep` (Incoming S2 only)                                   |
| Incoming AI  | `resolveIncomingOffers` — **tylko** listed + `isTransferSellEligible`               |
| Kwalifikacja | **`isTransferSellEligible`** — List / Sell / Incoming                               |
| Środki       | `cash_balance` = SSOT salda                                                         |

## Seller negotiation Thin (LFE-TRANSFERS-05 S2)

- Zakres: **Incoming Offers** only. Instant Sell = **100% ask**, bez nego.
- Reuse `NEGOTIATION_THIN`: Low 90 / Counter 95 / Normal 100 / High 110.
- Pure `resolveSellerNegotiationStep` — bez czasu / RNG / efektów ubocznych.
- `resolveNegotiationStep` pozostaje wyłącznie BUY.
- Opening AI = deterministyczny preset; Counter gracza tylko vs AI Low → 95% ask.
- Settlement: `completeTransferSell(agreedAmount)` + `isAllowedAgreedAmount`; idempotentne `sell:{playerId}`.
- Brak nowych tabel / pending / timeoutów.

## Listing Thin (LFE-TRANSFERS-04)

- Migracja: `transfer_listed_at timestamptz null` — bez nowych tabel.
- Ask listingu = fee; Incoming tylko dla listed.
- Instant Sell zostaje; List/Unlist idempotentne.

## Poza Thin

Custom ask · 2+ counters · pending/timeout/inbox · live market DB · envelope ratio ≠ 1 · Instant Sell nego.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-26 — LFE-TRANSFERS-05 CLOSE
