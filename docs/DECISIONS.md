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

### D15 — Fixtures DB = SSOT terminarza ligowego (Thin A) · CLOSED

**Dlaczego:** Hub po First Match potrzebuje kolejnego meczu bez mid-season mock.  
**Zasada:** tabela `fixtures` + `opponent_club_id` (katalog AI); First Match poza tabelą; generator Thin A = 3 fixtures.  
**Źródło:** LFE-LEAGUE-01 (prod `b5b64a3`).  
**Uwaga:** faza Hub `SEASON` (S1) — LFE-LEAGUE-02 / D17.

### D16 — Squad seed SSOT (do czasu tabeli players) · SUPERSEDED by D19

**Dlaczego:** Primary CTA / mecze wymagały spójnego XI bez `@/data/squad`.  
**Zasada (historyczna):** `resolveClubSquad(club)` / `seedStarterSquad` — deterministyczny seed.  
**Źródło:** LFE-LEAGUE-01.  
**Status:** **SUPERSEDED** przez **D19** (LFE-PLAYERS-01) — seed nie jest już runtime SSOT.

### D17 — League table = pure derive (`resolveLeagueTable`) · CLOSED

**Dlaczego:** tabela musi być wspólna dla `/league`, Hub chip i przyszłych modułów bez drugiej SSOT.  
**Zasada:** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` jest **jedynym** źródłem tabeli; brak standings DB; AI↔AI = deterministyczny derive (nie Match Engine); Hub → `SEASON` gdy S1 (`first_match` + fixtures); generator nadal 3 fixtures.  
**Źródło:** LFE-LEAGUE-02 (prod `71ce442`).

### D18 — Club cash SSOT + `resolveClubFinance` (Finance Thin) · CLOSED

**Dlaczego:** finanse na ścieżce produktowej nie mogą być mockiem; Hub i `/finance` potrzebują jednej kasy.  
**Zasada:** `clubs.cash_balance` = jedyne SSOT salda; `finance_movements` = historia; **`resolveClubFinance()` → `ClubFinanceDto`** = jedyny kontrakt UI (UI nie czyta DB bezpośrednio); seed przy create club; nagroda W/D/L tylko przy pierwszym przejściu fixture → `played`; Finanse odblokowane na `SEASON`.  
**Tymczasowe stałe Thin** (`ECONOMY_THIN`) do czasu GDD **§26**: `STARTER_CASH=100000`, `REWARD_WIN=5000`, `REWARD_DRAW=2500`, `REWARD_LOSS=1000` (waluta Thin: EUR).  
**Poza Thin:** pensje, bilety, sponsorzy, transfer **envelope**, negotiation.  
**Źródło:** LFE-ECONOMY-01 (prod `a70cf81`).  
**Uwaga:** Transfery cash-only (bez envelope) — **D20** / LFE-TRANSFERS-01.

### D19 — Players table SSOT + `resolveClubSquad` · CLOSED

**Dlaczego:** kadra musi być trwała przed Transfers/Training; seed runtime uniemożliwiał mutacje.  
**Zasada:** tabela **`players`** = jedyne SSOT zawodników klubu gracza; **`resolveClubSquad(club, rows)` → `SquadDto`** = jedyny kontrakt UI; `listClubPlayers` = I/O; seed (`seedClubRoster` / `seedStarterSquad`) **wyłącznie** create / backfill / testy; AI = `seedBotSquad` / `seedOpponentSquad` (poza `players`); **brak fallbacku do seeda** przy pustej bazie → `SquadUnavailableError`; id starter **`s-{tag}-…`**; buy **`t-{tag}-…`** (D20); **`version` default 1**; status domenowy **`READY` | `INJURED` | `SUSPENDED` | `TIRED` | `DEPARTED`** (lokalizacja w UI; aktywna kadra bez `DEPARTED`).  
**Poza Thin:** Training, edycja XI, `potential`, pensje z cash.  
**Źródło:** LFE-PLAYERS-01 (prod `0b960b5`; prettier `d43fa3d`).

### D20 — Transfer market Thin + `resolveTransferMarket` · CLOSED

**Dlaczego:** rynek nie może być mockiem; musi mutować `players` + kasę atomowo i być sterowany oknem transferowym.  
**Zasada:**

| Fakt | SSOT / kontrakt |
| ---- | --------------- |
| Kadra | `players` (D19) — deal buy/sell mutuje wiersze |
| UI rynku | **wyłącznie** `resolveTransferMarket(...)` → `TransferMarketDto` |
| Okno | `clubs.transfer_window_open` (ustawiane gdy played ≥ `UNLOCK_AFTER_PLAYED=2`) |
| Środki | tylko `clubs.cash_balance` + `finance_movements` (`transfer_buy` / `transfer_sell`) — **bez envelope** |
| Ledger deal | `transfer_deals` (idempotency_key + audit + `completed_at`) |
| Odejście | `status=DEPARTED` + `departed_at` — **bez** fizycznego DELETE |
| Buy ids | `t-{tag}-…` |
| Fee | **derive** (`deriveTransferFee`) — brak trwałego `market_value` |
| Katalog AI / listingi | `seedTransferCatalogue()` (deterministyczny; ids `m-{tag}-…`) |

**Thin wyjątek vs GDD K11:** unlock po **2** rozegranych meczach ligowych (`TRANSFERS_THIN.UNLOCK_AFTER_PLAYED`), nie pełne reguły okna z GDD.  
**Poza Thin:** negotiation, envelope, potential, Training, live market DB.  
**Źródło:** LFE-TRANSFERS-01 (prod `393a43c`; prettier `7c0ce7f`).

## Najważniejsze decyzje (meta)

Każde złamanie D1–D20 wymaga **AUDIT** i aktualizacji tego pliku + freeze/GDD/platform docs.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md) · [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) · [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)

## Last updated

2026-07-25 — LFE-TRANSFERS-01 CLOSE
