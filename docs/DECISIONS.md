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
**Zasada:** tabela `fixtures` + `opponent_club_id` (katalog AI); First Match poza tabelą; **jedyny plan** = `planClubFixtures`; `LEAGUE_FIXTURE_COUNT = 22` (LFE-LEAGUE-04 · double RR); MD1–11 identity = LEAGUE-03; `ensureClubFixtures` = insert / top-up (bez nadpisu MD istniejących).  
**Źródło:** LFE-LEAGUE-01…03; kalendarz 22 — LFE-LEAGUE-04 (feat `9027baf`).  
**Uwaga:** faza Hub `SEASON` (S1) — LFE-LEAGUE-02 / D17. GDD §10 home+away = **22** (D28).

### D16 — Squad seed SSOT (do czasu tabeli players) · SUPERSEDED by D19

**Dlaczego:** Primary CTA / mecze wymagały spójnego XI bez `@/data/squad`.  
**Zasada (historyczna):** `resolveClubSquad(club)` / `seedStarterSquad` — deterministyczny seed.  
**Źródło:** LFE-LEAGUE-01.  
**Status:** **SUPERSEDED** przez **D19** (LFE-PLAYERS-01) — seed nie jest już runtime SSOT.

### D17 — League table = pure derive (`resolveLeagueTable`) · CLOSED

**Dlaczego:** tabela musi być wspólna dla `/league`, Hub chip i przyszłych modułów bez drugiej SSOT.  
**Zasada:** `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` jest **jedynym** źródłem tabeli; brak standings DB; AI↔AI = **double RR** derive (nie Match Engine); Hub → `SEASON` gdy S1; kalendarz gracza = **22** fixtures (`planClubFixtures` / top-up — LFE-LEAGUE-04).  
**Źródło:** LFE-LEAGUE-02; count 22 / AI double RR — LFE-LEAGUE-04 (feat `9027baf`).

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
**Poza Thin:** edycja XI (poza Match Path), pensje z cash; pełny model atrybutów / XP / Academy — poza D21/D22.  
**Źródło:** LFE-PLAYERS-01 (prod `0b960b5`; prettier `d43fa3d`); **potential** = D22 / PLAYERS-02.  
**Uwaga:** Training mutuje `status` + `skill` (D21) z ceiling `potential` (D22); Match development mutuje `skill` (D22); atrybuty UI = derive(skill); UI potential = **pasma only**.

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
**Hardening (LFE-TRANSFERS-09):** TD-01/TD-02 CLOSED — SQL helpers `derive_transfer_fee_thin` / `is_allowed_transfer_amount_thin` + Vitest parity gate; Live Instant/Accept = **jeden** settle invoke; publiczne API = Buy/Sell (D38); brak zmian semantyki produktu.  
**Poza Thin:** AI clubs, Instant Sell nego, custom ask, **2+ counters**, buyer Counter, timeout / AI pending inbox, escrow, ratio ≠ 1, stored envelope, `completeLiveTransfer()`.
**Źródło:** LFE-TRANSFERS-01; E1; N1 (`8d9d772`); Incoming (`4f69b5d`); Listing (`de23db6`); Seller nego (`4b58507`); Live Instant (`8824793`); Pending (`be95006`); Counter — LFE-TRANSFERS-08; Hardening — LFE-TRANSFERS-09 (`e6885dc`).  
**Uwaga:** licznik played współdzielony z Training przez `hasPlayedUnlock` (D21). **§26 = SSOT liczb fee; D20 = SSOT implementacji rynku.**

### D21 — Team training Thin + Depth (`resolveClubTraining`) · CLOSED

**Dlaczego:** trening nie może być mockiem; musi mutować trwałą kadrę, mieć 1 slot / dzień bez grind backlogu, oraz dawać czytelny Thin depth (skill + XI gate) bez farmy i bez LFE.
**Zasada:**

| Fakt          | SSOT / kontrakt                                                                                   |
| ------------- | ------------------------------------------------------------------------------------------------- |
| UI            | **wyłącznie** `resolveClubTraining(...)` → `TrainingDto`                                          |
| Skutki        | `players.status` + `players.skill` — bez insert/delete; bez XP / OVR; **skill ≤ potential** (D22) |
| Persist       | RPC `complete_training_session` (atomowo status + skill + `last_training_on`)                     |
| Dzień sesji   | `clubs.last_training_on` (`date` UTC)                                                             |
| Unlock        | played ≥ `TRAINING_THIN.UNLOCK_AFTER_PLAYED=2` (derive; nav `trainingUnlocked`)                   |
| Shared helper | `hasPlayedUnlock` / `countPlayedInList` / `countClubPlayedFixtures`                               |
| Efekty        | pure `applyTrainingSessionEffects` (regen / light / normal / high + skill Thin vs potential)      |
| Anti-farm     | max +1 skill / gracz / sesja; K=3; soft ceiling ≥85 tylko `high`; mecz > trening                  |
| XI Gate       | INJURED/SUSPENDED hard block; TIRED OK + warning ≥4; kick-off hard fail                           |
| LFE           | **bez zmian** Match Engine / PUBLIC API (brak skill/fatigue w seedzie)                            |

**Thin wyjątek vs GDD §8.4:** dzień = **UTC date**, nie timezone gracza (brak SSOT TZ).  
**Poza Thin:** trening indywidualny, plany, buff taktyczny, koszt cash (§26), XP, attribute DB, kontuzje treningowe, morale numeric, mapowanie skill→LFE.  
**Źródło:** LFE-TRAINING-01 (prod `10de062`); **LFE-TRAINING-02** Depth (prod `5e6c2ad`); ceiling potential = D22.  
**Operacyjne:** Migracja Supabase RPC `complete_training_session` musi zostać zastosowana na środowisku produkcyjnym.

### D22 — Player Development Thin (`potential` + match growth) · CLOSED

**Dlaczego:** GDD §7 wymaga ceiling rozwoju i primary path z meczu bez farmy treningowej i bez LFE.  
**Zasada:**

| Fakt            | SSOT / kontrakt                                                                                 |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Potential SSOT  | kolumna `players.potential` (1…99; check `potential ≥ skill`)                                   |
| Generacja (B)   | `resolvePlayerPotential` = `max(skill, seedPotentialCeiling(id, age))` — deterministyczny seed  |
| Match (PRIMARY) | pure `applyMatchDevelopmentEffects` — tylko starterzy; +1 max; **K_MATCH=5**; skill ≤ potential |
| Persist         | RPC `apply_match_development` + `match_development_log` (idempotent per `match_key`)            |
| Training        | D21 respektuje potential (TS + SQL clamp)                                                       |
| Fee             | **bez zmian** — `deriveTransferFee(skill, age)`                                                 |
| Age             | pure `applySeasonAgeEffects` + `onSeasonEnd` hook — **brak** auto age++ w produkcie             |
| Presentation    | pasma only (Niski / Średni / Wysoki / Bardzo wysoki); Squad + Player Card + Post Match signals  |
| LFE             | **zero zmian**                                                                                  |

**Poza Thin:** talents · career/dev history · XP · morale · attribute DB · numeric potential UI · Physics/ECS.  
**Źródło:** LFE-PLAYERS-02 (prod `cd222ba`).  
**Operacyjne:** Migracja `20260729120000_player_potential_development.sql` musi zostać zastosowana na prod.  
**Academy:** osobna decyzja **D23** (ten sam `players` / potential — bez drugiego OVR).

### D23 — Academy Thin A (`academy_track` · Intake + Promote) · CLOSED

**Dlaczego:** GDD §16 Thin A wymaga opcjonalnego naboru i promocji bez drugiej tabeli zawodników i bez academy OVR.  
**Zasada:**

| Fakt          | SSOT / kontrakt                                                                                         |
| ------------- | ------------------------------------------------------------------------------------------------------- |
| Model         | Wyłącznie `players` — zakaz `academy_players` / youth OVR                                               |
| Tor           | `players.academy_track` (bool) · `promoted_at` (nullable)                                               |
| UI            | **tylko** `resolveClubAcademy` → `AcademyDto`                                                           |
| Intake        | INSERT perspektywy · max **3** · ids `a-{tag}-…` · potential via `resolvePlayerPotential` (D22)         |
| Promote       | `academy_track=false` · `promoted_at=now()` — **bez** buffa skill/potential                             |
| Senior filter | `filterSeniorPlayers` — squad / XI / training / transfers / match development (tylko filtr, bez logiki) |
| Unlock nav    | soft-lock przed SEASON · **open** w SEASON                                                              |
| Presentation  | pasma potential only · brak poziomów akademii / budżetu                                                 |
| LFE           | **zero zmian**                                                                                          |

**Poza Thin:** poziomy ośrodka · cash-gate · trening akademii · auto-promote · inbox §21/§22.  
**Źródło:** LFE-ACADEMY-01 (feat `9c6fe86` · tip prior `4a516f3`).  
**Operacyjne:** Migracja `20260730120000_academy_track.sql` zastosowana na prod.  
**Skauting:** osobna decyzja **D24** (ten sam `players` — shortlista = refs only).

### D24 — Scouting Information Thin (`resolveClubScouting` · `scout_shortlist`) · CLOSED

**Dlaczego:** GDD §17 Thin B wymaga opcjonalnej warstwy informacji bez drugiego modelu zawodnika i bez oceny za gracza.  
**Zasada:**

| Fakt        | SSOT / kontrakt                                                                                    |
| ----------- | -------------------------------------------------------------------------------------------------- |
| Model       | Kandydaci wyłącznie z `players` (D19) — zakaz drugiego modelu / hidden players / youth scout table |
| UI          | **tylko** `resolveClubScouting` → `ScoutingDto`                                                    |
| REUSE       | `resolveTransferMarket` · potential pasma (D22) · filtry Academy/senior (D23) — bez forka fee/OVR  |
| Shortlista  | `scout_shortlist` = **wyłącznie** `(club_id, player_id)` → `players.id` (+ `created_at`)           |
| Persist     | Preferencje menedżera — **zero** kolumn skill / potential / scout_score / AI rank                  |
| Side-effect | Shortlista **nie** wpływa na AI, rynek, transfery, potencjał ani symulację                         |
| Rola Thin   | Skauting **porządkuje** informacje; **nie** ocenia zawodnika i **nie** podejmuje decyzji za gracza |
| Unlock nav  | soft-lock przed SEASON · **open** w SEASON                                                         |
| LFE         | **zero zmian**                                                                                     |

**Poza Thin:** fog · regiony · misje · koszty · personel · `scout_score` / AI ranking · hidden potential.  
**Źródło:** LFE-SCOUTING-01 (feat `93fd6d5` · tip docs `cae2323`).  
**Operacyjne:** Migracja `20260730140000_scout_shortlist.sql` zastosowana na prod.

### D25 — Daily Goal Thin (`resolveClubDailyGoal`) · CLOSED

**Dlaczego:** GDD §20 wymaga lekkiego haka „Co warto dziś zrobić?” bez Quest Engine i bez konkurencji z osią meczową / Primary CTA.  
**Zasada:**

| Fakt      | SSOT / kontrakt                                                                                             |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| UI / API  | **tylko** `resolveClubDailyGoal(...)` → `ClubDailyGoalDto \| null`                                          |
| Model     | **Derive only** — zakaz tabel `daily_*` / quest persist / claim                                             |
| REUSE     | `resolveHubSession` · `resolvePrimaryCta` · fixtures · `lastTrainingOn` · `utcDateString` · unlock treningu |
| Priorytet | **Primary CTA > Daily Goal** zawsze; sugestia nie elevuje się do Primary                                    |
| Matchday  | Sugestia zsynchronizowana z kierunkiem meczu (`syncedWithPrimary`)                                          |
| Mutacje   | **Zero** (brak cash / prestige / skill / fixtures / training RPC)                                           |
| Ekonomika | **Zero** nagród liczbowych / waluty zadań / cron / reset dnia                                               |
| ≠         | `resolveSecondaryCtas` (daily **loop** nawigacji UI) — nie mylić z §20                                      |
| LFE       | **zero zmian**                                                                                              |

**Poza Thin:** Quest Engine · Quest Log · streaki advanced · persist/claim · nagrody §26 · inbox/push jako zależność.  
**Źródło:** LFE-DAILY-01 (feat `73e1361`).  
**Operacyjne:** Brak nowych migracji.

### D26 — Achievements Information Thin (`resolveClubAchievements`) · CLOSED

**Dlaczego:** GDD §19 wymaga opcjonalnej warstwy historii kamieni bez XP, Achievement Score, ekonomii i bez redefinicji §6 / Rankingu.  
**Zasada:**

| Fakt     | SSOT / kontrakt                                                                      |
| -------- | ------------------------------------------------------------------------------------ |
| UI / API | **tylko** `resolveClubAchievements(...)` → `ClubAchievementsDto`                     |
| Model    | **Derive only** — zakaz tabel achievements / unlock persist / claim                  |
| REUSE    | `ClubDto` · `fixtures` · `countPlayedInList` — fakty First Match · played · training |
| Historia | **Immutable** względem trwałych faktów domeny                                        |
| Mutacje  | **Zero** (brak cash / §6 / skill / potential / LFE)                                  |
| ≠        | Ranking §18 · Daily Goal D25 · Quest Engine · XP · Achievement Score                 |
| LFE      | **zero zmian**                                                                       |

**Poza Thin:** katalog ID · XP · score · nagrody §26 · persist · fog discovery · muzeum.  
**Źródło:** LFE-ACHIEVEMENTS-01 (feat `3915be9`).  
**Operacyjne:** Brak nowych migracji.

### D27 — Ranking Information Thin (`resolveClubRanking`) · CLOSED

**Dlaczego:** GDD §18 wymaga opcjonalnej warstwy sezonowego porównania klubów bez ELO, bez redefinicji §6 i bez zastępowania tabeli ligowej (§10).  
**Zasada:**

| Fakt     | SSOT / kontrakt                                                                |
| -------- | ------------------------------------------------------------------------------ |
| UI / API | **tylko** `resolveClubRanking(...)` → `ClubRankingDto`                         |
| Input    | `LeagueTableDto` z **`resolveLeagueTable`** — wyłącznie input (ZERO DUPLICATE) |
| Model    | **Derive only** — zakaz tabel rankings / persist / migracji                    |
| Surface  | Własny DTO/UI — **bez** points · W/D/L · bramek jako głównego surface          |
| Zakaz    | ELO · Rating Score · XP · nowe metryki · zmiany §6                             |
| Copy     | Resolver **bez** tekstów UI (D29) — pasma opisuje `UI_COPY`                    |
| Nav      | `rankings` open od **EARLY_CLUB**                                              |
| Horyzont | Bieżący sezon only — nie historia                                              |
| ≠        | `/league` standings · Achievements D26 · Daily D25 · §6                        |
| LFE      | **zero zmian**                                                                 |

**Poza Thin:** all-time · ranking graczy · global/MP · ELO/§26 liczby · anti-abuse tech.  
**Źródło:** LFE-RANKING-01 (feat `bf86749`).  
**Operacyjne:** Brak nowych migracji.

### D28 — League calendar 22 · Double Round Robin (`LEAGUE_FIXTURE_COUNT`) · CLOSED

**Dlaczego:** GDD §10 wymaga 22 kolejek (home+away); Thin 11 był świadomym wyjątkiem LEAGUE-03.  
**Zasada:**

| Fakt    | SSOT / kontrakt                                                           |
| ------- | ------------------------------------------------------------------------- |
| Count   | **`LEAGUE_FIXTURE_COUNT = 22`**                                           |
| Planner | wyłącznie `planClubFixtures`                                              |
| MD1–11  | Identity LEAGUE-03 — **nigdy** nie przebudowywane                         |
| MD12–22 | Rewanże (`!isHome`, ten sam opponent)                                     |
| Top-up  | Istniejące kluby: tylko brakujące MD12–22                                 |
| AI↔AI   | `planAiVsAiMatches` **double RR** (seed `ai-v2`)                          |
| OUT     | Season End · awans/spadek · schedulery · Match Engine · migracje schematu |

**Źródło:** LFE-LEAGUE-04 (feat `9027baf`).  
**Operacyjne:** Brak migracji schematu (`unique(club_id, matchday)` już pozwala na MD12–22).

### D38 — Transfer public API compatibility (Buy/Sell + live RPC Args) · CLOSED

**Dlaczego:** Hardening TD-01/02 nie może łamać klientów UI / Single Settlement Path.  
**Zasada:**

| Fakt              | SSOT / kontrakt                                                               |
| ----------------- | ----------------------------------------------------------------------------- |
| Public settle API | wyłącznie `completeTransferBuy` / `completeTransferSell`                      |
| Zakaz             | `completeLiveTransfer()` / druga ścieżka settlement                           |
| Live RPC Args     | `complete_live_h2h_transfer` — bez breaking change Args                       |
| Fee SQL           | `derive_transfer_fee_thin` / `is_allowed_transfer_amount_thin` (parity vs TS) |
| Live orkiestracja | Instant → Buy; Accept opening → Sell; Accept countered → Buy (1× RPC)         |

**Źródło:** LFE-TRANSFERS-09 (feat `e6885dc`).  
**Operacyjne:** Migracja `20260730150000_transfer_fee_parity_helpers.sql` na prod.

## Najważniejsze decyzje (meta)

Każde złamanie D1–D28 / D38 wymaga **AUDIT** i aktualizacji tego pliku + freeze/GDD/platform docs.
**GDD-§26B (2026-07-25):** kod zsynchronizowany ze §26 (`ECONOMY_THIN` + `TRANSFER_FEE` + jedno CURRENCY).  
**LFE-TRANSFERS-02-E1 (2026-07-25):** envelope = derive (`resolveTransferEnvelope`, ratio 1); cash = SSOT.  
**LFE-TRANSFERS-02-N1 (2026-07-25):** stateless buy negotiation Thin; `resolveNegotiationStep` pure; settlement na `agreedAmount`.  
**LFE-TRANSFERS-03 (2026-07-25):** derived AI incoming offers; Accept → `completeTransferSell`; 100% ask.  
**LFE-TRANSFERS-04 (2026-07-26):** `transfer_listed_at`; List/Unlist; Incoming tylko listed.  
**LFE-TRANSFERS-05 (2026-07-26):** seller nego S2 na Incoming; `resolveSellerNegotiationStep`; `completeTransferSell(agreedAmount)`.  
**LFE-TRANSFERS-06 (2026-07-26):** Live H2H Instant @ 100% ask; atomic RPC; `players.id` stałe.  
**LFE-TRANSFERS-07 (2026-07-26):** Pending H2H `transfer_offers`; Thin presets; supersede; brak escrow/timeout.  
**LFE-TRANSFERS-08 (2026-07-26):** 1× H2H Counter seller→buyer; `opening_amount` / `current_amount`; Accept auth by phase.  
**LFE-PLAYERS-02 (2026-07-29):** `players.potential` + match development Thin (D22); Training ceiling vs potential.  
**LFE-ACADEMY-01 (2026-07-30):** `academy_track` + Intake/Promote Thin (D23); senior filters; `resolveClubAcademy`.  
**LFE-SCOUTING-01 (2026-07-30):** `resolveClubScouting` + `scout_shortlist` refs only (D24); Information Thin.  
**LFE-DAILY-01 (2026-07-30):** `resolveClubDailyGoal` derive only (D25); Primary > Daily Goal.  
**LFE-ACHIEVEMENTS-01 (2026-07-30):** `resolveClubAchievements` Information Thin (D26); immutable history.
**LFE-RANKING-01 (2026-07-30):** `resolveClubRanking` Information Thin (D27); table input only.
**LFE-LEAGUE-04 (2026-07-30):** calendar 22 · double RR (D28); top-up MD12–22.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md) · [`AI/ARCHITECTURAL_DECISIONS.md`](./AI/ARCHITECTURAL_DECISIONS.md) · [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) · [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)

## Last updated

2026-07-30 — LFE-LEAGUE-04 · D28
