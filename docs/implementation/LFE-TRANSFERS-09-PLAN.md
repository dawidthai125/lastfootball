# LFE-TRANSFERS-09 — PLAN (Transfers Hardening · TD-01 + TD-02)

**EPIC:** LFE-TRANSFERS-09  
**Typ:** Domain hardening — parity fee/nego TS↔SQL · single live RPC invoke  
**Data:** 2026-07-30  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · TRANSFERS-01…08 CLOSED · D20  
**Status PLAN:** CLOSED · EPIC LFE-TRANSFERS-09 FULLY CLOSED (feat `e6885dc` · PRODUCTION VERIFY PASS · DOCS CLOSE)  
**Baseline wejścia:** tip `39817db` · Domain LEAGUE-04 `9027baf` · transfers baseline feature `9b1c575`  
**Domain feat:** `e6885dc`

---

## 0. Cel

Usunąć dług P1 rynku transferowego **bez** zmiany semantyki produktu (D20 / GDD):

1. **TD-01** — wyeliminować drift formuły fee + allow-list negotiation między TS (`ECONOMY_THIN` / `NEGOTIATION_THIN`) a SQL (RPC live / counter).
2. **TD-02** — Live Instant / Accept: **jeden** invoke settlement (nie sell+buy → 2× RPC), przy zachowaniu **Single Settlement Path**.

**Zasada nadrzędna (Owner freeze)**

> LFE-TRANSFERS-09 = wyłącznie hardening TD-01 + TD-02. Nie jest EPICem nowych reguł rynku, escrow ani zmian GDD.

---

## 1. Zamrożone decyzje Ownera (nienaruszalne)

| #   | Decyzja                                                                                     |
| --- | ------------------------------------------------------------------------------------------- |
| 1   | Scope = **tylko TD-01 + TD-02** (TD-03+ OUT)                                                |
| 2   | Zachować **Single Settlement Path** (`completeTransferBuy` / `completeTransferSell`)        |
| 3   | **Nie** tworzyć drugiej ścieżki settlement (`completeLiveTransfer()` zakazane)              |
| 4   | Docelowo **jeden entrypoint** invoke do RPC live na settle (jedno wywołanie z orkiestracji) |
| 5   | Wyeliminować możliwość driftu TS ↔ SQL dla fee i negotiation presets                        |
| 6   | Obowiązkowy **parity gate** (wspólna definicja / generowanie / testy)                       |
| 7   | Dopuszczalny refaktor SQL/RPC **bez** zmian schematu                                        |
| 8   | **Brak** nowych tabel / kolumn                                                              |
| 9   | **Brak** zmian GDD i semantyki produktu                                                     |
| 10  | **Brak** escrow · timeoutów · buyer Counter · AI negotiation                                |
| 11  | SSOT FIRST · REUSE FIRST · ZERO DUPLICATE LOGIC · Single Settlement Path                    |

---

## 2. Zakres Thin (IN)

| #   | Element                                                                                                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------- |
| 1   | SQL: **jedna** definicja helperów fee + allow-list (REUSE w `complete_live_h2h_transfer` + `counter_live_transfer_offer`)    |
| 2   | Nowa migracja **CREATE OR REPLACE** funkcji (bez ALTER TABLE / nowych relacji)                                               |
| 3   | Parity gate CI: wartości `ECONOMY_THIN.TRANSFER_FEE` + `NEGOTIATION_THIN` **===** literały / kontrakt SQL helperów           |
| 4   | Live Instant (`buyLiveTransferPlayer`): **jeden** call `completeTransferBuy` **lub** `completeTransferSell` (live) — nie oba |
| 5   | Live Accept (`acceptLiveTransferOffer`): **jeden** call settle — nie sell+buy                                                |
| 6   | Idempotencja RPC (`live-buy:{playerId}` / `live-sell:{…}`) **nienaruszona**                                                  |
| 7   | Regresja testów transfers-01…08 + nowe testy 09 (parity + single-invoke kontrakt)                                            |
| 8   | Aktualizacja `TRANSFER_ARCHITECTURE.md` (TD-01/02 → CLOSED) + PROJECT_STATE / ROADMAP / CHANGELOG — **tylko w DOCS CLOSE**   |

---

## 3. Zakres OUT (twarde)

- TD-03+ (gruby `actions.ts`, dedup `displayPos`, cleanup stub roster **jako cel** — stub może zniknąć ubocznie przy single-invoke, bez osobnego EPICu cleanup)
- Escrow · timeout · 2+ counters · buyer Counter · AI H2H · custom ask · envelope ≠ 1
- Zmiana unlock okna / fee zależne od potential / nowe presetty %
- Match Engine · Hub Primary · Ranking · League · Finance D18 (poza skutkiem settle bez zmiany reguł)
- Nowe tabele / kolumny · zmiana sygnatury publicznej RPC **wymagająca** nowych Args (preferencja: zachować `complete_live_h2h_transfer` Args)
- `completeLiveTransfer()` / trzeci publiczny settle helper
- Zmiana semantyki Instant @ 100% ask · Counter 95% · seed buy/sell

---

## 4. Architektura

### 4.1 Single Settlement Path (bez zmian kontraktu)

```
UI / actions.ts
  → completeTransferBuy  |  completeTransferSell   ← JEDYNE publiczne entrypointy
       ↓ (source: 'live')
  invokeLiveH2hRpc (private)
       ↓
  RPC complete_live_h2h_transfer   ← atomowy settle obu stron
```

**Zakaz:** osobny eksport `completeLiveTransfer`.

### 4.2 TD-01 — Fee / allow-list parity

**SSOT liczb (TS):** już istnieje

- `ECONOMY_THIN.TRANSFER_FEE` → `deriveTransferFee`
- `NEGOTIATION_THIN` → `scaleAskAmount` / `isAllowedAgreedAmount`

**Problem dziś:** te same literały (`2000`, `1500`, `30`, `25000`, `1000`, `90/95/100/110`) zdublowane inline w SQL (`complete_live_h2h_transfer`, `counter_live_transfer_offer`).

**Rozwiązanie (PLAN):**

1. Nowa migracja wprowadza **dwa** (lub jeden pakiet) helperów SQL, np.:
   - `derive_transfer_fee_thin(p_skill int, p_age int) returns int`
   - `is_allowed_transfer_amount_thin(p_ask int, p_amount int) returns boolean`  
     (albo `list` + `IN` wewnątrz jednej funkcji)
2. `CREATE OR REPLACE` na:
   - `complete_live_h2h_transfer(...)`
   - `counter_live_transfer_offer(...)`  
     — **usuwa** inline formułę; woła helpery.
3. Helpery pozostają `SECURITY`-bezpieczne (używane tylko z RPC; opcjonalnie `REVOKE` od `authenticated` jeśli nie muszą być publiczne).
4. **Parity gate (obowiązkowy)** — Vitest (preferowane, REUSE runnera app):
   - assert: stałe TS === oczekiwane liczby GDD §26 / NEGOTIATION_THIN,
   - assert: treść **najnowszej** migracji / definicji helperów zawiera **te same** literały co `ECONOMY_THIN` / `NEGOTIATION_THIN` (read file + regex lub snapshot źródła SQL helpera w repo),
   - assert: dla macierzy `(skill, age)` wynik `deriveTransferFee` === wynik lustra formuły SQL (jedna funkcja-lustro w teście **albo** wyliczenie z tych samych stałych — ZERO trzeciej „produkcyjnej” kopii w app code).

**Alternatywa dopuszczalna (nie preferowana):** generator fragmentu SQL ze stałych TS w CI — tylko jeśli parity-test okaże się zbyt kruchy; nie jest wymagany na start.

**Nienaruszone:** walidacja allow-list po stronie TS przed RPC; SQL nadal **re-derive** ask z `players.skill/age` (nie ufa klientowi).

### 4.3 TD-02 — Jeden invoke live

**Problem dziś:** `buyLiveTransferPlayer` i `acceptLiveTransferOffer` wołają `completeTransferSell` **oraz** `completeTransferBuy` → RPC 2× (drugi idempotentny).

**Fakt:** obie gałęzie live wołają **ten sam** `invokeLiveH2hRpc` / RPC, który już atomowo rozlicza kupującego i sprzedawcę.

**Rozwiązanie (PLAN):**

| Flow                       | Po hardening                                                           |
| -------------------------- | ---------------------------------------------------------------------- |
| Instant Buy                | **Jeden** `completeTransferBuy({ source: 'live', … })`                 |
| Accept (opening = seller)  | **Jeden** `completeTransferSell({ source: 'live', acceptOfferId, … })` |
| Accept (countered = buyer) | **Jeden** `completeTransferBuy({ source: 'live', acceptOfferId, … })`  |

Uzasadnienie wyboru strony:

- Instant: actor = buyer → Buy (TS: cash / roster / window buy).
- Accept opening: actor = seller → Sell (TS: ask / allow-list / window sell); RPC i tak sprawdza buyer cash/roster.
- Accept countered: actor = buyer → Buy.

**Efekt uboczny dozwolony:** usunięcie stub roster (18× stub) z Accept — nie jest celem TD-03, lecz naturalną konsekwencją single-invoke gdy nie ma drugiego call Buy z fałszywą kadrą.

**Komentarze** w `actions.ts` / `TRANSFER_ARCHITECTURE`: zaktualizować opis „sell+buy → 2×” → „jeden invoke”.

### 4.4 Warstwa Thin IN / OUT (Information)

- **IN:** stałe + helpery SQL + orkiestracja invoke.
- **OUT:** copy UI, GDD tekst, nowe DTO rynku.

---

## 5. Kroki IMPLEMENT (kolejność)

1. **Parity scaffold** — test `transfers-09-parity.test.ts` (najpierw RED lub GREEN na obecnym stanie z assertami stałych TS; po migracji — assert SQL).
2. **Migracja SQL** — helpery fee/allow-list + `CREATE OR REPLACE` RPC complete + counter (skopiuj ciało z `20260726040000_…` jako bazę; zamień inline formuły na helpery; **bez** zmian Args).
3. **TD-02 TS** — `actions.ts`: Instant / Accept → pojedynczy settle call; usuń zbędny drugi call + stub jeśli zbędny.
4. **Regresja** — `transfers-01…08` + ewentualne dostosowanie mocków RPC (oczekiwanie 1× `rpc` zamiast 2×).
5. **Typecheck / lint / test** lokalnie.
6. **COMMIT** (po GO) → **PUSH** → CI → PRODUCTION VERIFY (settle Instant + Accept na staging/prod wg checklisty Ownera).
7. **DOCS CLOSE** — `TRANSFER_ARCHITECTURE` TD-01/02 CLOSED · PROJECT_STATE · ROADMAP · CHANGELOG · HANDOFF (bez zmiany GDD).

---

## 6. Pliki (oczekiwany touch)

| Plik                                                              | Rola                                          |
| ----------------------------------------------------------------- | --------------------------------------------- |
| `supabase/migrations/<ts>_transfer_fee_parity_helpers.sql` (nowy) | Helpery + replace RPC                         |
| `apps/web/src/lib/transfers/actions.ts`                           | Single invoke Instant / Accept                |
| `apps/web/src/lib/transfers/complete-deal.ts`                     | Bez nowego public API; komentarze opcjonalnie |
| `apps/web/src/lib/transfers/transfers-09*.test.ts` (nowy)         | Parity + kontrakt single-invoke               |
| `docs/platform/TRANSFER_ARCHITECTURE.md`                          | DOCS CLOSE                                    |
| `docs/AI/PROJECT_STATE.md` · ROADMAP · CHANGELOG · HANDOFF        | DOCS CLOSE                                    |

**Bez zmian:** `derive-fee.ts` formuła · `NEGOTIATION_THIN` wartości · Match Engine · schema tables.

---

## 7. Acceptance Criteria

1. Zmiana `ECONOMY_THIN.TRANSFER_FEE` / `NEGOTIATION_THIN` **bez** aktualizacji SQL helperów → **parity gate RED** w CI.
2. W SQL produkcyjnym (po migracji) fee/allow-list **nie** są skopiowane inline w dwóch RPC — **jedna** definicja helperów.
3. Instant Live i Accept Live: **dokładnie jeden** invoke `complete_live_h2h_transfer` na udany settle (brak celowego double-call).
4. Publiczne settle API = wyłącznie `completeTransferBuy` / `completeTransferSell` (brak `completeLiveTransfer`).
5. Semantyka kwot / Instant 100% / Counter 95% / roster 18–22 / last GK — **bez zmian**.
6. Brak nowych tabel/kolumn; Args RPC settle bez breaking change dla klientów.
7. Istniejące testy transfers-01…08 GREEN (z ewentualnym updateem oczekiwań liczby RPC).
8. Po VERIFY: TD-01 i TD-02 oznaczone **CLOSED** w `TRANSFER_ARCHITECTURE.md`.

---

## 8. Ryzyka i mitygacja

| Ryzyko                                         | Mitygacja                                                          |
| ---------------------------------------------- | ------------------------------------------------------------------ |
| Migracja źle skopiuje ciało RPC                | Diff względem `20260726040000_…`; testy + ręczny Instant/Accept    |
| Single-invoke omija walidację TS jednej strony | RPC już waliduje obie strony; zachować TS checks po stronie actora |
| Parity regex kruchy                            | Pin na plik helperów / jednoznaczny marker `-- TRANSFER_FEE_SSOT`  |
| Drift historycznych migracji                   | Gate sprawdza **aktualną** definicję (najnowszy replace), nie 200  |

---

## 9. Test plan (IMPLEMENT / VERIFY)

- [ ] Unit: parity fee coeffs + % presets TS ↔ SQL source
- [ ] Unit: macierz skill/age → ask zgodny z `deriveTransferFee`
- [ ] Unit/integration (mock): Instant → `rpc` called once
- [ ] Unit/integration (mock): Accept opening / countered → `rpc` once
- [ ] Regresja: seed buy/sell · Incoming · Counter · Unlist · Reject/Withdraw
- [ ] Manual / prod: Instant @ 100% ask; Accept opening; Accept po Counter; idempotentny retry

---

## 10. Definition of Done

- AC 1–8 spełnione
- CI GREEN na tipie z featem
- PRODUCTION VERIFY PASS (live settle)
- DOCS CLOSE + pin (wg pipeline Ownera)
- **STOP** — brak kolejnego EPICu bez GO

---

## Last updated

2026-07-30 — PLAN DRAFT po Owner GO PLAN (LFE-TRANSFERS-09)
