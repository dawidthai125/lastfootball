# Platform — Transfers

## Cel

Rynek transferowy Thin (buy/sell + buy nego + derived AI incoming offers) na bazie `players` + kasy + derived envelope.

## SSOT

| Fakt        | Źródło                                                                                 |
| ----------- | -------------------------------------------------------------------------------------- |
| UI rynku    | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                       |
| Okno        | `clubs.transfer_window_open`                                                           |
| Unlock okna | played fixtures ≥ `UNLOCK_AFTER_PLAYED=2` (Thin vs GDD K11)                            |
| Deal        | `players` + `cash_balance` + `finance_movements` + `transfer_deals`                    |
| Ledger      | `transfer_deals` (idempotency + `completed_at`)                                        |
| Sell        | `DEPARTED` + `departed_at` (bez DELETE); instant @ fee **lub** Accept oferty AI        |
| Ask / fee   | `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE` (GDD §26); brak `market_value`       |
| Envelope    | **derive** `resolveTransferEnvelope(cash)` — jedyny wzór; brak kolumny DB              |
| Buy nego    | **pure** `resolveNegotiationStep` — stateless                                          |
| Incoming AI | **pure** `resolveIncomingOffers` — derive C; offer = **100% ask**; Accept/Reject       |
| Settlement  | buy: `completeTransferBuy(agreedAmount)`; sell/incoming Accept: `completeTransferSell` |
| Katalog     | `seedTransferCatalogue()` (`m-{tag}-…`)                                                |
| Środki      | `cash_balance` = SSOT salda; envelope = przydział (Thin ratio 1)                       |
| Waluta UI   | `ECONOMY_THIN.CURRENCY`                                                                |

## Incoming Offers Thin (LFE-TRANSFERS-03)

- Derive C — brak migracji / tabel / timeoutów / inbox.
- Kwota = **100%** `deriveTransferFee`.
- Accept → `completeTransferSell` (bez `agreedAmount`); Reject → no-op.
- Stabilne `offerId` = `in-{clubTag}-{playerId}`.

## Negotiation Thin (LFE-TRANSFERS-02-N1)

- **Buy only.** Instant sell @ fee pozostaje.
- Presets vs ask: Low **90%**, Normal **100%**, High **110%**; Counter **95%**.

## Unlock Nav

Transfery open gdy `SEASON` **i** `transfer_window_open`.

## Decyzje

D20 — [`../DECISIONS.md`](../DECISIONS.md). Fee — GDD §26. Envelope — E1. Nego — N1. Incoming — TRANSFERS-03.

## Poza Thin

Sell negotiation · 2+ counters · pending DB / timeout / inbox · potential · live market DB · envelope ratio ≠ 1 · stored envelope.

## Kod

`lib/transfers/*` · `/transfers`

## Last updated

2026-07-25 — LFE-TRANSFERS-03 CLOSE
