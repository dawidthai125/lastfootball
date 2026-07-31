# Platform — Transfer Architecture

## Cel

Głębszy kontrakt architektury rynku transferowego (po LFE-TRANSFERS-01…10).  
**SSOT produktowy skrót:** [`TRANSFERS.md`](./TRANSFERS.md).

## Kiedy czytać

AUDIT / PLAN / IMPLEMENT EPIC-ów transferowych; onboarding przed zmianą settle / ofert.

## Powiązane

[`TRANSFERS.md`](./TRANSFERS.md) · [`../DECISIONS.md`](../DECISIONS.md) D20 · D116–D118 · [`../AI/ARCHITECTURE_RULES.md`](../AI/ARCHITECTURE_RULES.md) · kod: `apps/web/src/lib/transfers/` · PLAN: [`../implementation/LFE-TRANSFERS-10-PLAN.md`](../implementation/LFE-TRANSFERS-10-PLAN.md)

## Status

**ACTIVE** · Domain hardening **`e6885dc`** (LFE-TRANSFERS-09 CLOSED) · feature market **`9b1c575`** (LFE-TRANSFERS-08)  
**LFE-TRANSFERS-10 / TD-03+:** **CLOSED** · feat **`9424dd8`** · D116–D118 · PLAN [`../implementation/LFE-TRANSFERS-10-PLAN.md`](../implementation/LFE-TRANSFERS-10-PLAN.md) · PRODUCTION VERIFY PASS

---

## Single Settlement Path

**Jedyna** ścieżka mutacji dealu:

| Wejście TS             | Gałąź            | Efekt                               |
| ---------------------- | ---------------- | ----------------------------------- |
| `completeTransferBuy`  | seed             | insert `t-{tag}-…` + cash + deals   |
| `completeTransferBuy`  | `source: 'live'` | RPC `complete_live_h2h_transfer`    |
| `completeTransferSell` | instant          | `DEPARTED` + credit + clear listing |
| `completeTransferSell` | `source: 'live'` | ten sam RPC live                    |

**Zakaz:** `completeLiveTransfer()`, drugi settle helper, escrow hold.

**Live Instant / Accept (LFE-TRANSFERS-09 · TD-02 CLOSED):** dokładnie **jeden** invoke `completeTransferBuy` **lub** `completeTransferSell` (live) → jeden RPC. Idempotencja `live-buy:{playerId}` pozostaje.

**Fee / allow-list SQL (TD-01 CLOSED):** `derive_transfer_fee_thin` · `is_allowed_transfer_amount_thin` — parity gate Vitest vs `ECONOMY_THIN` / `NEGOTIATION_THIN`.

---

## Warstwy

```
TransfersView (client actions)
    ↓
actions.ts (barrel re-export · Public API · bez `'use server'` — dyrektywa na `actions-*.ts`)
    ↓
actions-seed.ts | actions-listing.ts | actions-live-instant.ts | actions-live-offers.ts
    ↓
complete-deal.ts  |  RPC counter/reject/withdraw/unlist
    ↓
players · cash_balance · finance_movements · transfer_deals · transfer_offers
```

UI **tylko** z `resolveTransferMarket` (page ładuje wiersze + oferty).

**displayPos (D117):** sole helper `lib/transfers/display-pos.ts` — LO / ŚO → OB; konsumenci: market / incoming / live listings / live H2H resolvers.

**M2 shared guards:** SKIP — club `select` lists różnią się między actions; extract nie usuwałby duplikacji bez ryzyka zmiany zachowania (D118).

**Nota Next.js:** plik z `'use server'` nie może re-eksportować (`export { … } from`); barrel bez dyrektywy, prawdziwe actions w modułach.

---

## `transfer_offers` (H2H)

| Kolumna          | Rola                     |
| ---------------- | ------------------------ |
| `opening_amount` | immutable po Create      |
| `current_amount` | jedyna kwota settle      |
| `phase`          | `opening` \| `countered` |
| `last_actor`     | `buyer` \| `seller`      |
| `ask_at_create`  | snapshot ask przy Create |

**Przepływ Thin:** Create (buyer) → Seller Accept **lub** Counter (1×) → po Counter: Buyer Accept / Reject / Withdraw. Instant / Unlist → supersede wszystkich pending gracza w TX.

---

## NEGOTIATION_THIN

Presety: **90 / 95 / 100 / 110%** ask (`deriveTransferFee`).

| Kontekst         | Maszyna                        | Persistencja |
| ---------------- | ------------------------------ | ------------ |
| Seed buy (N1)    | `resolveNegotiationStep`       | stateless UI |
| AI Incoming (S2) | `resolveSellerNegotiationStep` | stateless    |
| Live H2H         | phase na `transfer_offers`     | DB           |

**REUSE:** % przez te same helpery. **Nie scalać** trzech maszyn bez zmiany produktu.

---

## RPC (live)

| RPC                                                 | Mutuje                                                           |
| --------------------------------------------------- | ---------------------------------------------------------------- |
| `complete_live_h2h_transfer`                        | players.club_id, cash, movements, deals, offer accept, supersede |
| `counter_live_transfer_offer`                       | tylko `current_amount`, `phase`, `last_actor` (FOR UPDATE)       |
| `reject_transfer_offer` / `withdraw_transfer_offer` | status oferty                                                    |
| `unlist_transfer_player`                            | listing + supersede                                              |
| `list_live_transfer_listings`                       | read                                                             |

---

## Świadome kompromisy / dług

| ID     | Priorytet | Temat                                                      | Status                                                |
| ------ | --------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| TD-01  | P1        | Fee + allow-list SQL ↔ TS drift                            | **CLOSED** · LFE-TRANSFERS-09 (`e6885dc`)             |
| TD-02  | P1        | Double-invoke live RPC (sell+buy)                          | **CLOSED** · LFE-TRANSFERS-09 (`e6885dc`)             |
| TD-03+ | P2        | gruby `actions.ts`, `displayPos` ×4 (stub Accept usunięty) | **CLOSED** · LFE-TRANSFERS-10 (`9424dd8` · D116–D118) |

**Poza Thin:** escrow · timeout · AI H2H · 2+ counters · buyer Counter · custom ask · `completeLiveTransfer()`.

## Last updated

2026-07-31 — LFE-TRANSFERS-10 / TD-03+ CLOSED · feat `9424dd8` · D116–D118
