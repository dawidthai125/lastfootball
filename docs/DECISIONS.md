# Architectural Decisions — Last Football

## Cel dokumentu

Najważniejsze decyzje architektoniczne. **Nie łamać bez AUDIT + Owner GO.**

## Aktualny stan

Decyzje poniżej obowiązują po LFE Architecture Freeze i GDD Faza 2 (część).

## Decyzje

### D1 — Monorepo z izolowanym LFE

**Dlaczego:** silnik musi być testowalny headless, bez UI/DB.  
**Zasada:** `packages/lfe` nie importuje React/Next/Supabase.

### D2 — `createMatch()` jedyny oficjalny entry meczu

**Dlaczego:** jeden kontrakt dla app (EPIC-6).  
**Zasada:** app nie woła `createSimulation` / deep systems w produkcji.

### D3 — `MatchSession` jedyna publiczna fasada

**Dlaczego:** ukrywa pipeline, bus, SM.  
**Zasada:** nowe możliwości = metody sesji lub komendy, nie wyciek INTERNAL.

### D4 — Commands jako ścieżka mutacji

**Dlaczego:** UI, AI, testy, replay — wspólny tor (EPIC-5).  
**Zasada:** nie mutować `MatchState` z komponentów React.

### D5 — State machine = SSOT faz

**Dlaczego:** deterministyczne lifecycle (EPIC-3).  
**Zasada:** tabele przejść INTERNAL; UI czyta `phase` ze stanu.

### D6 — Domain manager ≠ domain meczu

**Dlaczego:** inne lifecycle i pola (`packages/domain` vs `lfe/match/domain`).  
**Zasada:** nie scalać typów „dla wygody”.

### D7 — Architecture Freeze PUBLIC API v1

**Dlaczego:** stabilny kontrakt przed gameplay.  
**Zasada:** nowe PUBLIC tylko z aktualizacją freeze + Owner GO.  
**Źródło:** [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md)

### D8 — GDD jest SSOT produktu

**Dlaczego:** gameplay i UI wynikają z designu, nie odwrotnie.  
**Zasada:** Faza design = docs-only; liczby ekonomiczne później (§26).

### D9 — Match-centric core loop

**Dlaczego:** sesje 5–15 min, hub-first (GDD §3).  
**Zasada:** nie budować „dashboard-first” managera bez meczu.

### D10 — Domain factories transitional

**Dlaczego:** dziś app składa lineup przez factories LFE.  
**Cel:** app podaje `MatchSessionConfig`; silnik buduje modele.  
**Zasada:** nie rozrastać PUBLIC factories bez planu migracji.

### D11 — `getWorld()` jest ADVANCED

**Dlaczego:** wycieka world container.  
**Zasada:** UI używa `getMatchState` + `getSpatialState`.

### D12 — Physics / Rules = Future; AI/Engine shipped post-freeze

**Historyczne (freeze EPIC-1…7):** Physics / AI / Rules = future, stuby RESERVED.  
**Aktualizacja (2026-07-23):** Match AI + Match Engine + Gameplay Foundation = **DONE** (`0.9.1-match-ai01`). Physics i pełne Rules nadal FUTURE (Owner GO). Canvas/Replay = web, poza LFE.  
**Zasada:** nie udawaj gotowości w `status` bez implementacji; nie mutuj Engine przy EPIC-ach UI.

### D13 — First Match przed Hubem

**Dlaczego:** domknięcie emocji meczu przed domem menedżera (LFE-MATCH-01).  
**Zasada:** `/hub` tylko gdy `clubs.first_match_completed_at` ustawione; NEW_CLUB ≠ render Hub.  
**Wyjątek vs GDD §5.10:** udokumentowany w `platform/` + `AI/DECISIONS.md`.

### D14 — Hub EARLY_CLUB = decision screen

**Dlaczego:** GDD §23 + ochrona przed mid-season FOMO (LFE-HUB-01).  
**Zasada:** `resolveHubPhase` / `resolvePrimaryCta` SSOT; zero `dashboardMock` mid-season na EARLY_CLUB.

### D15 — Fixtures DB = SSOT terminarza ligowego (Thin) · CLOSED

**Dlaczego:** Hub po First Match potrzebuje kolejnego meczu bez mid-season mock.  
**Zasada:** tabela `fixtures` + `opponent_club_id` (katalog AI); First Match poza tabelą; **jedyny plan** = `planClubFixtures`; `LEAGUE_FIXTURE_COUNT = 11` (LFE-LEAGUE-03); `ensureClubFixtures` = insert / deterministyczny top-up (bez nadpisu played/upcoming).  
**Źródło:** LFE-LEAGUE-01 (prod `b5b64a3`); kalendarz 11 — LFE-LEAGUE-03.  
**Uwaga:** faza Hub `SEASON` (S1) — LFE-LEAGUE-02 / D17. Thin vs GDD §10: 11 ≠ 22.

### D16 — Squad seed SSOT (do czasu tabeli players) · SUPERSEDED by D19

**Dlaczego:** Primary CTA / mecze wymagały spójnego XI bez `@/data/squad`.  
**Zasada (historyczna):** `resolveClubSquad(club)` / `seedStarterSquad` — deterministyczny seed.  
**Źródło:** LFE-LEAGUE-01.  
**Status:** **SUPERSEDED** przez **D19** (LFE-PLAYERS-01) — seed nie jest już runtime SSOT.

### D17 — League table = pure derive (`resolveLeagueTable`) · CLOSED

**Dlaczego:** tabela musi być wspólna dla `/league`, Hub chip i przyszłych modułów bez drugiej SSOT.  
**Zasada:** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` jest **jedynym** źródłem tabeli; brak standings DB; AI↔AI = deterministyczny derive (nie Match Engine); Hub → `SEASON` gdy S1 (`first_match` + fixtures); kalendarz gracza = **11** fixtures (`planClubFixtures` / top-up — LFE-LEAGUE-03).  
**Źródło:** LFE-LEAGUE-02 (prod `71ce442`); count 11 — LFE-LEAGUE-03.

### D18 — Club cash SSOT + `resolveClubFinance` (Finance Thin) · CLOSED

**Dlaczego:** finanse na ścieżce produktowej nie mogą być mockiem; Hub i `/finance` potrzebują jednej kasy.  
**Zasada:** `clubs.cash_balance` = jedyne SSOT salda; `finance_movements` = historia; **`resolveClubFinance()` → `ClubFinanceDto`** = jedyny kontrakt UI (UI nie czyta DB bezpośrednio); seed przy create club; nagroda W/D/L tylko przy pierwszym przejściu fixture → `played`; Finanse odblokowane na `SEASON`.  
**Liczby (SSOT produktu):** GDD **§26** — starter / W/D/L / waluta / `TRANSFER_FEE`.  
**Kod (GDD-§26B CLOSED):** `ECONOMY_THIN` zsynchronizowany ze §26; jedno `CURRENCY`; fee coeffs w `ECONOMY_THIN.TRANSFER_FEE`.  
**Poza Thin:** pensje, bilety, sponsorzy, transfer **envelope**, negotiation.  
**Źródło:** LFE-ECONOMY-01 (prod `a70cf81`); sync liczb GDD-§26B.  
**Uwaga:** Transfery cash-only (bez envelope) — **D20** / LFE-TRANSFERS-01. **§26 = SSOT liczb; D18 = SSOT implementacji finansów.**

### D19 — Players table SSOT + `resolveClubSquad` · CLOSED

**Dlaczego:** kadra musi być trwała przed Transfers/Training; seed runtime uniemożliwiał mutacje.  
**Zasada:** tabela **`players`** = jedyne SSOT zawodników klubu gracza; **`resolveClubSquad(club, rows)` → `SquadDto`** = jedyny kontrakt UI; `listClubPlayers` = I/O; seed (`seedClubRoster` / `seedStarterSquad`) **wyłącznie** create / backfill / testy; AI = `seedBotSquad` / `seedOpponentSquad` (poza `players`); **brak fallbacku do seeda** przy pustej bazie → `SquadUnavailableError`; id starter **`s-{tag}-…`**; buy **`t-{tag}-…`** (D20); **`version` default 1**; status domenowy **`READY` | `INJURED` | `SUSPENDED` | `TIRED` | `DEPARTED`** (lokalizacja w UI; aktywna kadra bez `DEPARTED`).  
**Poza Thin:** edycja XI, `potential`, pensje z cash; rozwój `skill` z treningu → D21 poza.  
**Źródło:** LFE-PLAYERS-01 (prod `0b960b5`; prettier `d43fa3d`).  
**Uwaga:** Training mutuje `status` (D21) — bez osobnej tabeli kadry.

### D20 — Transfer market Thin + `resolveTransferMarket` · CLOSED

**Dlaczego:** rynek nie może być mockiem; musi mutować `players` + kasę atomowo i być sterowany oknem transferowym.  
**Zasada:**

| Fakt                  | SSOT / kontrakt                                                                                                                                 |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Kadra                 | `players` (D19) — deal buy/sell mutuje wiersze                                                                                                  |
| UI rynku              | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto`                                                                                |
| Okno                  | `clubs.transfer_window_open` (ustawiane gdy played ≥ `UNLOCK_AFTER_PLAYED=2`)                                                                   |
| Środki                | `clubs.cash_balance` + `finance_movements` — **SSOT salda**; envelope = **derive** (`resolveTransferEnvelope`, Thin ratio 1) — nie druga waluta |
| Ledger deal           | `transfer_deals` (idempotency_key + audit + `completed_at`)                                                                                     |
| Odejście              | `status=DEPARTED` + `departed_at` — **bez** fizycznego DELETE                                                                                   |
| Buy ids               | `t-{tag}-…`                                                                                                                                     |
| Fee                   | **derive** (`deriveTransferFee`) — brak trwałego `market_value`                                                                                 |
| Katalog AI / listingi | `seedTransferCatalogue()` (deterministyczny; ids `m-{tag}-…`)                                                                                   |

**Thin wyjątek vs GDD K11:** unlock po **2** rozegranych meczach ligowych (`TRANSFERS_THIN.UNLOCK_AFTER_PLAYED`), nie pełne reguły okna z GDD.  
**Liczby fee (SSOT produktu):** GDD **§26**; kod: `deriveTransferFee` ← `ECONOMY_THIN.TRANSFER_FEE` (GDD-§26B CLOSED).  
**Envelope (LFE-TRANSFERS-02-E1):** `ECONOMY_THIN.ENVELOPE_RATIO = 1` → envelope === cash; **jedyny** wzór w `resolveTransferEnvelope()`; brak migracji/kolumny.  
**Negotiation (LFE-TRANSFERS-02-N1):** buy-only; **pure** `resolveNegotiationStep` (Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta); settlement `completeTransferBuy(agreedAmount)` z pełną rewalidacją; **stateless** — brak pending DB / timeoutów / migracji.  
**Incoming (LFE-TRANSFERS-03):** **pure** `resolveIncomingOffers` (derive C); Accept / Reject; Accept → sell settlement.  
**Listing (LFE-TRANSFERS-04):** `players.transfer_listed_at`; List/Unlist idempotentne; ask = fee; Incoming **tylko listed**; shared `isTransferSellEligible`; sell clears listed; okno nie czyści listy; UI tylko `resolveTransferMarket`.  
**Seller nego (LFE-TRANSFERS-05 S2):** Incoming only; **pure** `resolveSellerNegotiationStep` (reuse NEGOTIATION_THIN); Instant Sell @ 100% ask bez nego; settlement `completeTransferSell(agreedAmount)` + `isAllowedAgreedAmount`; pełna rewalidacja przed settle; idempotentne.  
**Live H2H (LFE-TRANSFERS-06):** Human↔Human; podaż = listed `players`; Instant Buy @ 100% ask; `players.id` stałe; atomowy RPC z buy/sell live; brak AI clubs/tabeli listingów; seed catalogue = fallback; brak `completeLiveTransfer()`.  
**Pending H2H (LFE-TRANSFERS-07):** jedyna tabela `transfer_offers`; Instant równolegle; kwoty NEGOTIATION_THIN; wielu buyerów pending; Accept/Instant/Unlist supersede w TX; Create/Reject/Withdraw bez mutacji cash/players/deals; brak escrow/timeout/AI pending; settle wyłącznie `completeTransferBuy`/`Sell`.  
**Counter H2H (LFE-TRANSFERS-08):** 1× Counter wyłącznie Seller; po Counter Accept = Buyer; `opening_amount` immutable; `current_amount` jedyna kwota settle; Counter mutuje tylko amount/phase/last_actor (RPC `FOR UPDATE`); Reject opening=seller / countered=buyer; brak escrow/timeout/AI H2H / 2+ counters.  
**Poza Thin:** AI clubs, Instant Sell nego, custom ask, **2+ counters**, buyer Counter, timeout / AI pending inbox, potential, escrow, ratio ≠ 1, stored envelope, `completeLiveTransfer()`.  
**Źródło:** LFE-TRANSFERS-01; E1; N1 (`8d9d772`); Incoming (`4f69b5d`); Listing (`de23db6`); Seller nego (`4b58507`); Live Instant (`8824793`); Pending (`be95006`); Counter — LFE-TRANSFERS-08.  
**Uwaga:** licznik played współdzielony z Training przez `hasPlayedUnlock` (D21). **§26 = SSOT liczb fee; D20 = SSOT implementacji rynku.**

### D21 — Team training Thin + `resolveClubTraining` · CLOSED

**Dlaczego:** trening nie może być mockiem; musi mutować trwałą kadrę i mieć 1 slot / dzień bez grind backlogu.  
**Zasada:**

| Fakt          | SSOT / kontrakt                                                                 |
| ------------- | ------------------------------------------------------------------------------- |
| UI            | **wyłącznie** `resolveClubTraining(...)` → `TrainingDto`                        |
| Skutki        | tylko `players.status` — **bez** `skill`, bez insert/delete                     |
| Dzień sesji   | `clubs.last_training_on` (`date` UTC)                                           |
| Unlock        | played ≥ `TRAINING_THIN.UNLOCK_AFTER_PLAYED=2` (derive; nav `trainingUnlocked`) |
| Shared helper | `hasPlayedUnlock` / `countPlayedInList` / `countClubPlayedFixtures`             |
| Efekty        | pure `applyTrainingSessionEffects` (regen / light / normal / high)              |
| LFE           | **bez zmian** Match Engine / PUBLIC API                                         |

**Thin wyjątek vs GDD §8.4:** dzień = **UTC date**, nie timezone gracza (brak SSOT TZ).  
**Poza Thin:** trening indywidualny, plany, buff taktyczny, koszt cash (§26), wzrost skill, filtr XI po statusie.  
**Źródło:** LFE-TRAINING-01 (prod `10de062`).

## Najważniejsze decyzje (meta)

Każde złamanie D1–D21 wymaga **AUDIT** i aktualizacji tego pliku + freeze/GDD/platform docs.  
**GDD-§26B (2026-07-25):** kod zsynchronizowany ze §26 (`ECONOMY_THIN` + `TRANSFER_FEE` + jedno CURRENCY).  
**LFE-TRANSFERS-02-E1 (2026-07-25):** envelope = derive (`resolveTransferEnvelope`, ratio 1); cash = SSOT.  
**LFE-TRANSFERS-02-N1 (2026-07-25):** stateless buy negotiation Thin; `resolveNegotiationStep` pure; settlement na `agreedAmount`.  
**LFE-TRANSFERS-03 (2026-07-25):** derived AI incoming offers; Accept → `completeTransferSell`; 100% ask.  
**LFE-TRANSFERS-04 (2026-07-26):** `transfer_listed_at`; List/Unlist; Incoming tylko listed.  
**LFE-TRANSFERS-05 (2026-07-26):** seller nego S2 na Incoming; `resolveSellerNegotiationStep`; `completeTransferSell(agreedAmount)`.  
**LFE-TRANSFERS-06 (2026-07-26):** Live H2H Instant @ 100% ask; atomic RPC; `players.id` stałe.  
**LFE-TRANSFERS-07 (2026-07-26):** Pending H2H `transfer_offers`; Thin presets; supersede; brak escrow/timeout.  
**LFE-TRANSFERS-08 (2026-07-26):** 1× H2H Counter seller→buyer; `opening_amount` / `current_amount`; Accept auth by phase.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md) · [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) · [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)

## Last updated

2026-07-26 — AI-DOCS-CONSOLIDATION-02 · LFE-TRANSFERS-08
