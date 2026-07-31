# LFE-TRANSFERS-10 — PLAN (TD-03+ · Transfers P2)

**EPIC:** LFE-TRANSFERS-10 (alias **TD-03+**)  
**Typ:** Domain hardening / refactor · **bez** semantyki produktu  
**Data:** 2026-07-31  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · Owner **GO IMPLEMENT**  
**Status PLAN:** CLOSED (kontrakt IMPLEMENT) · D116–D118  
**Baseline wejścia:** tip `c1cccc4` · Domain `82a164d` · Docs pin `26105a7` · D1–D115  
**SSOT długu:** [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md)

---

## 0. Cel

Usunąć dług P2 rynku transferowego **bez** zmiany zachowania produktu:

1. **Modularny podział** `actions.ts` — organizacja kodu.
2. **Dedup `displayPos`** — jedna implementacja w obrębie `lib/transfers/` (4 kopie → 1).
3. **Aktualizacja** `TRANSFER_ARCHITECTURE.md` (TD-03+ → CLOSED po ship).

**Zasada nadrzędna (Owner freeze)**

> TD-03+ / LFE-TRANSFERS-10 = wyłącznie refactor organizacyjny + dedup lokalny. Nie jest EPICem nowych reguł rynku, UI, Finance ani Match.

---

## 1. Owner LOCK (wiążące)

| #   | LOCK                                                                                         |
| --- | -------------------------------------------------------------------------------------------- |
| 1   | **Brak** zmian semantyki rynku (D20 / GDD / nego / settle / window)                          |
| 2   | **Single Settlement Path** = jedyna ścieżka (`completeTransferBuy` / `completeTransferSell`) |
| 3   | **Brak** SQL i migracji                                                                      |
| 4   | **Brak** zmian DTO (`TransferMarketDto` i pokrewne)                                          |
| 5   | **Brak** zmian kontraktu RPC (Args / nazwy / zachowanie)                                     |
| 6   | **Brak** zmian Public API Server Actions (nazwy + sygnatury exportów z `actions` / barrel)   |
| 7   | Split `actions.ts` = **wyłącznie organizacyjny** (re-export / move body)                     |
| 8   | **Nie** twórz Dispatcher / Registry / Service Locator                                        |
| 9   | `displayPos` dedup **tylko** w `lib/transfers/` (squad/academy/scouting OUT)                 |
| 10  | Shared guards **tylko** jeśli rzeczywiście eliminują duplikację                              |
| 11  | `complete-deal.ts` **bez** zmian logiki biznesowej                                           |
| 12  | **Brak** zmian UI produktu (`TransfersView` / Guide presentation)                            |
| 13  | **Brak** zmian Finance (D18 / ledger / envelope)                                             |
| 14  | **Brak** zmian Match Engine / LFE / fixtures unlock logic                                    |
| 15  | **Zakaz** `completeLiveTransfer()` / drugiej ścieżki settle                                  |

---

## 2. Contract First

### Artefakty (M0)

| Artefakt                                       | Rola                             |
| ---------------------------------------------- | -------------------------------- |
| `docs/implementation/LFE-TRANSFERS-10-PLAN.md` | SSOT PLAN Thin (ten plik)        |
| `docs/platform/TRANSFER_ARCHITECTURE.md`       | TD-03+ status · warstwy po split |
| `docs/DECISIONS.md` **D116–D118**              | Decyzje hardening                |

**Bez** nowego `GDD-*` produktowego — brak nowej mechaniki.

### Kontrakt publiczny (nietykalny)

```
TransfersView / forms
  → buyTransferPlayer | sellTransferPlayer | respondIncomingOffer
  → setTransferListing
  → buyLiveTransferPlayer | createLiveTransferOffer | acceptLiveTransferOffer
  → counterLiveTransferOffer | rejectLiveTransferOffer | withdrawLiveTransferOffer
       ↓ (bez zmian nazw / FormData / return types)
  completeTransferBuy | completeTransferSell
```

Po split: te same `export async function …` osiągalne z **`@/lib/transfers/actions`** — barrel re-export.

### Kontrakt `displayPos` (transfers only)

```ts
// lib/transfers/display-pos.ts
export function displayPos(pos: string): string;
// LO / ŚO → 'OB'; else passthrough
```

Konsumenci: `resolve-transfer-market.ts` · `resolve-incoming-offers.ts` · `resolve-live-listings.ts` · `resolve-live-h2h-offers.ts`.

---

## 3. Modularny podział `actions.ts`

| Moduł                     | Odpowiedzialność                              | Eksporty                                                            |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------------- |
| `actions-seed.ts`         | Seed buy / sell / incoming respond            | `buyTransferPlayer` · `sellTransferPlayer` · `respondIncomingOffer` |
| `actions-listing.ts`      | List / Unlist                                 | `setTransferListing`                                                |
| `actions-live-instant.ts` | Live Instant Buy                              | `buyLiveTransferPlayer`                                             |
| `actions-live-offers.ts`  | Create / Accept / Counter / Reject / Withdraw | pozostałe live offer actions                                        |
| `actions.ts`              | **Barrel re-export only**                     | te same 10 exportów                                                 |

**M2 (opcjonalnie):** `actions-shared.ts` tylko gdy extract naprawdę usuwa duplikację **bez** zmiany `select`/zachowania. Jeśli selecty klubów różnią się między actions — **SKIP**.

**Zasada:** move code · zero behavior diff · `transfers-09` single-invoke assertions nadal GREEN.

---

## 4. Acceptance Criteria

| ID    | Kryterium                                                                               |
| ----- | --------------------------------------------------------------------------------------- |
| AC-1  | Semantyka rynku / D20 / D38 bez zmian (regresja transfers-01…09 GREEN)                  |
| AC-2  | Single Settlement Path: tylko Buy/Sell; brak `completeLiveTransfer`                     |
| AC-3  | Zero migracji SQL / zero zmian schematu / zero zmian RPC Args                           |
| AC-4  | Zero zmian DTO (`types.ts` TransferMarket* bez diff semantyki)                          |
| AC-5  | Public Server Action **nazwy + sygnatury** dostępne jak dziś z dotychczasowych importów |
| AC-6  | `actions.ts` nie jest już monolitkiem logiki (barrel / thin + moduły)                   |
| AC-7  | Dokładnie **jedna** definicja `displayPos` w `lib/transfers/`; 4 pliki importują        |
| AC-8  | Brak zmian w `TransfersView` / presentation UI                                          |
| AC-9  | Brak zmian Finance / Match Engine / fixtures unlock                                     |
| AC-10 | Format · typecheck · lint · test · build GREEN                                          |

---

## 5. Milestones M0–M6

| M      | Zakres                                                                                        |
| ------ | --------------------------------------------------------------------------------------------- |
| **M0** | Contract: ten PLAN · ID EPICu · LOCKi · D116–D118 · pointer TRANSFER_ARCHITECTURE IN PROGRESS |
| **M1** | `display-pos.ts` + podmiana 4 resolverów + test                                               |
| **M2** | Shared guards opcjonalnie (lub SKIP z uzasadnieniem)                                          |
| **M3** | Split actions → `actions-*.ts` + barrel                                                       |
| **M4** | Gate tests: transfers-09 + 01…08 regresja                                                     |
| **M5** | `TRANSFER_ARCHITECTURE.md` sync (warstwy + TD-03+ CLOSED draft)                               |
| **M6** | VERIFY full web gates                                                                         |

**Uwaga DOCS CLOSE (później):** ROADMAP / baseline / CHANGELOG / HANDOFF — **nie** w IMPLEMENT bez osobnego GO CLOSE.

---

## 6. IN / OUT

### IN

- Dedup `displayPos` w `lib/transfers/`
- Organizacyjny split `actions.ts` + re-export publicznych actions
- Opcjonalnie `actions-shared.ts`
- Aktualizacja `TRANSFER_ARCHITECTURE.md`
- Regresja testów transfers
- Implementation PLAN doc (M0) · D116–D118

### OUT

- Zmiany semantyki / GDD / DTO / RPC / SQL / migracje
- Zmiany Public API (rename / remove / new required params)
- Zmiany UI produktu · Finance · Match Engine
- Escrow · timeout · 2+ counters · buyer Counter · AI H2H · custom ask
- Dedup `displayPos` poza `lib/transfers/`
- Redesign `complete-deal.ts`
- Dispatcher / Registry / Service Locator
- Nowe reguły rynku

---

## 7. Pipeline

```
OWNER GO IMPLEMENT → M0…M6 → VERIFY → GO COMMIT → PUSH → CI → PRODUCTION VERIFY → DOCS CLOSE
```

## Last updated

2026-07-31 — LFE-TRANSFERS-10 PLAN CLOSED · Owner GO IMPLEMENT · D116–D118
