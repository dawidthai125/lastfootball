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

| Fakt            | SSOT / kontrakt                                                                                        |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Potential SSOT  | kolumna `players.potential` (1…99; check `potential ≥ skill`)                                          |
| Generacja (B)   | `resolvePlayerPotential` = `max(skill, seedPotentialCeiling(id, age))` — deterministyczny seed         |
| Match (PRIMARY) | pure `applyMatchDevelopmentEffects` — tylko starterzy; +1 max; **K_MATCH=5**; skill ≤ potential        |
| Persist         | RPC `apply_match_development` + `match_development_log` (idempotent per `match_key`)                   |
| Training        | D21 respektuje potential (TS + SQL clamp)                                                              |
| Fee             | **bez zmian** — `deriveTransferFee(skill, age)`                                                        |
| Age             | pure `applySeasonAgeEffects` · **wired** Confirm N+1 (H-AGE · **D122**) — supersedes „brak auto age++” |
| Presentation    | pasma only (Niski / Średni / Wysoki / Bardzo wysoki); Squad + Player Card + Post Match signals         |
| LFE             | **zero zmian**                                                                                         |

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
**Dopisek 2026-11-10:** tabela liczy pary AI↔AI tylko dla kolejek, które menedżer już rozegrał (`planAiMatchesForPlayedWeeks`). Po 22 kolejkach zbiór par = `planAiVsAiMatches`. D28 zostaje CLOSED.  
**Dopisek 2026-11-23:** wynik AI↔AI = gole Poissona z siły klubu (`aiTableStrength`), seed `ai-v3` = sezon + para u gospodarza (zastępuje `ai-v2`). Sezon i liga zawsze z `club.seasonNumber` / `club.leagueTier`; zamknięcie sezonu N liczy tabelę z N. Nadal derive, bez Match Engine i standings DB.

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

### D40 — Fake Production Rule · CLOSED

**Dlaczego:** Atrapy na odblokowanych ekranach niszczą zaufanie i SSOT.  
**Zasada:** Produkcja nie może udawać realnych spraw / unread / raportów bez faktu domenowego.

### D41 — Brak runtime mocków w modułach odblokowanych · CLOSED

**Dlaczego:** Nav `open` + mock lista = fałszywy SSOT.  
**Zasada:** Jeśli pozycja menu jest odblokowana, UI nie serwuje hardcoded / `dashboardMock` list produktowych.

### D42 — Messages Are Derived · CLOSED

**Dlaczego:** GDD §21.1a — wiadomość = skutek, nigdy przyczyna.  
**Zasada:** Inbox wyłącznie derive z istniejących faktów domeny (Thin: E1–E3).

### D43 — One Event → Many Views · CLOSED

**Dlaczego:** Duplikat źródeł → drift Overlay vs skrzynka.  
**Zasada:** Ten sam `ClubMessagesDto` napędza `/messages` i Overlay powiadomień.

### D44 — UI nie sortuje / nie filtruje wiadomości · CLOSED

**Zasada:** Kolejność i komplet listy = wyłącznie `resolveClubMessages`.

### D45 — `resolveClubMessages` = jedyne źródło danych UI wiadomości · CLOSED

**Zasada:** Zakaz drugiego buildera list / MOCK_NOTIFICATIONS / MessagesPreview.

### D46 — Messages Thin: brak DB / workflow / drugiego procesu ofert · CLOSED

**Zasada:** Brak tabel · migracji · mark-as-read · Accept/Reject w skrzynce · nego/settle poza Transferami.

**Źródło D40–D46:** LFE-MESSAGES-01 (feat `800ed0d`).

### D47 — Club Is Identity, Not Progression · CLOSED

**Dlaczego:** `/club` nie może stać się grindem poziomu / XP.  
**Zasada:** Surface klubu = tożsamość + kontekst; zakaz UI progresji §6 (liczby · progi · silnik).

### D48 — Profile Is Composition · CLOSED

**Dlaczego:** Drift przy wielu builderach karty klubu.  
**Zasada:** `ClubProfileDto` = kompozycja istniejących faktów (`ClubDto` · starter · cash · tabela); zero drugiego modelu.

### D49 — No Staff on Club Profile · CLOSED

**Dlaczego:** Personel Future na odblokowanym `/club` = fałszywy SSOT.  
**Zasada:** Brak sekcji Personel / asystent / skaut / „wkrótce” na karcie klubu.

### D50 — ClubProfileView Presentation Only · CLOSED

**Dlaczego:** Logika w View → duplikat reguł.  
**Zasada:** View renderuje wyłącznie `ClubProfileDto` — bez resolve / format / STARTER.

### D51 — `resolveClubProfile` = jedyne źródło DTO `/club` · CLOSED

**Dlaczego:** PlaceholderPage + bezpośrednie ClubDto w page = Fake Production.  
**Zasada:** Jedyny feed UI = `resolveClubProfile`; zakaz PlaceholderPage / „Podgląd UI” na `/club`.

**Źródło D47–D51:** LFE-CLUB-01 (feat `36ba9be`).

### D52 — Soft Lock Must Never Leak Fake Production · CLOSED

**Dlaczego:** Soft-lock w nav + atrapy na deep-linku = fałszywy SSOT ekonomii / infrastruktury.  
**Zasada:** Surface soft-lockowana nie może serwować Fake Production (€, partnerów, frekwencji, „Podgląd UI” udającego produkt).

### D63 — Route Access Must Match Navigation Access · CLOSED

**Dlaczego:** Nav `soft_locked` + otwarty deep-link = rozjazd kontraktu dostępu.  
**Zasada:** Stan access route ≡ `resolveNavAccess` / `isModuleSoftLocked` dla tego samego `NavItem.id` i ctx.

### D64 — PlaceholderPage Is Not An Access Mechanism · CLOSED

**Dlaczego:** PlaceholderPage / „Podgląd UI” mylone z odblokowanym produktem.  
**Zasada:** Soft-lock **nie** używa PlaceholderPage jako mechanizmu dostępu.

### D65 — SoftLockState Is The Canonical Locked Surface · CLOSED

**Dlaczego:** Spójność Training/Academy/Scouting vs permanent locks.  
**Zasada:** Kanoniczna powierzchnia locked na route = `SoftLockState` (bez fałszywego „Odblokuj”).

### D66 — Route Gate Must Be Generic · CLOSED

**Dlaczego:** Per-page ify access → drift przy nowych pozycjach nav.  
**Zasada:** Jeden generyczny gate; nowy soft-lock = wpis w `FLAT_NAV` + reguła w `unlock` — **bez** zmiany gate.

### D67 — Route Gate Must Be Transparent · CLOSED

**Dlaczego:** Nested match path / trasy poza nav nie mogą być przypadkowo lockowane.  
**Zasada:** Pathname poza `FLAT_NAV` = pass-through; gate bez logiki domenowej.

**Źródło D52 · D63–D67:** LFE-SOFTLOCK-01 (feat `46f7caa`).

### D68 — Lifecycle Before Systems · CLOSED

**Dlaczego:** Sponsors/Board/ekonomia bez końca sezonu = systemy bez cyklu.  
**Zasada:** Najpierw domknięcie lifecycle sezonu (kontrakt → potem kod); dopiero potem systemy zależne.

### D69 — Season End Is An Event Pipeline · CLOSED

**Dlaczego:** Pojedynczy ekran z side-effectami → niedeterminizm i scope creep.  
**Zasada:** Season End = uporządkowany ciąg zdarzeń o stałej kolejności.

### D70 — Trigger Owns Lifecycle · CLOSED

**Dlaczego:** Ręczne „zamknij sezon” omija SSOT kalendarza.  
**Zasada:** Tylko trigger 22/22 `played` (mecze ligowe klubu gracza) startuje pipeline.

### D71 — Report Before Consequences · CLOSED

**Dlaczego:** Konsekwencje przed uznaniem niszczą łuk emocjonalny i mieszają hooki.  
**Zasada:** Raport sezonu **przed** konsekwencjami i przed efektami hooków.

### D72 — Hooks Before Features · CLOSED

**Dlaczego:** Mini-GDD Sponsors/Board w Season End = naruszenie Thin.  
**Zasada:** Hook = moment · Owner EPIC · cel; bez specyfikacji feature / UX / kwot.

### D73 — Promotion Is Not Part Of Season End Thin · CLOSED

**Dlaczego:** Awans/spadek w pierwszym slice = scope piramidy lig.  
**Zasada:** Season End Thin **nie** zmienia szczebla ligowego.

### D74 — Documentation Before Lifecycle · CLOSED

**Dlaczego:** Kod lifecycle bez kontraktu → drift vs GDD §10.  
**Zasada:** Brak IMPLEMENT lifecycle bez zamkniętego GDD-SEASON-END-01.

### D75 — Lifecycle Is Deterministic · CLOSED

**Dlaczego:** RNG zamknięcia / kategorii wyniku = niespójny SSOT.  
**Zasada:** Ten sam stan wejściowy → ten sam przebieg pipeline; zero RNG zamknięcia.

### D76 — Contract Before Code · CLOSED

**Dlaczego:** PLAN/IMPLEMENT przed kontraktem produktowym.  
**Zasada:** Kontrakt GDD Thin przed jakimkolwiek PLAN/IMPLEMENT kodu Season End.

### D77 — GDD-SEASON-END-01 Is Season End Thin SSOT · CLOSED

**Dlaczego:** Duplikacja reguł w §10.12/10.13 vs plik EPICu.  
**Zasada:** SSOT kontraktu Thin = `docs/game-design/GDD-SEASON-END-01.md`; §10.12 / §10.13 / §10.20 = pointer.

**Źródło D68–D77:** GDD-SEASON-END-01 (docs CLOSE).

### D78 — Season Closed Is An Idempotent Domain Fact · CLOSED

**Dlaczego:** Podwójne zamknięcie / UI-only close → drift lifecycle.  
**Zasada:** Season Closed = jeden fakt domeny (`season_phase=offseason`) na przebieg 22; idempotentny zapis.

### D79 — Offseason Unlock Parity With Season · CLOSED

**Dlaczego:** Fallthrough `return 'open'` odblokowałby Sponsors/Board/Stadium.  
**Zasada:** Soft-lock nav OFFSEASON = parity z SEASON (D52 · SoftLockRouteGate).

### D80 — Sole Calendar Planner Remains planClubFixtures · CLOSED

**Dlaczego:** Drugi planner = ZERO DUPLICATE / drift vs D28.  
**Zasada:** Season N+1 reseed **wyłącznie** przez istniejący `planClubFixtures` (+ clear slate).

### D81 — Season Report Is Pure Resolve · CLOSED

**Dlaczego:** Raport z atrap / osobnego standings DB = Fake Production.  
**Zasada:** Raport = pure `resolveSeasonReport` z tabeli ligowej (I10 · Information Thin).

### D82 — New Season Starts Only After Player Confirm · CLOSED

**Dlaczego:** Auto N+1 bez uznania łamie D71 / player agency.  
**Zasada:** Start Season N+1 tylko po świadomym Confirm gracza.

### D83 — Season End Hooks Are No-Op In Thin · CLOSED

**Dlaczego:** age++ / Sponsors / Board w lifecycle = scope systems (D68 · D72).  
**Zasada (oryginał SEASON-END-01):** Hooki = no-op do czasu Owner EPIC.  
**Supersede częściowy:** H-AGE → **D122** (wired); H-SPONSORS / H-BOARD / H-PROMOTION = osobne CLOSED EPICi (nie no-op).

### D84 — Season Report Uses Existing Facts Only · CLOSED

**Dlaczego:** Narracja bez faktów domeny = Fake Production.  
**Zasada:** Raport / highlighty wyłącznie z istniejących faktów (tabela · bilans · strefa).

### D85 — Confirm Is The Sole Path To Season N+1 · CLOSED

**Dlaczego:** Alternatywne ścieżki N+1 omijają pipeline.  
**Zasada:** Jedyna mutacja do N+1 = `confirmStartNextSeason` (po OFFSEASON).

### D86 — Season Report Is Read-Only · CLOSED

**Dlaczego:** Mutacje w raporcie mieszają uznanie z konsekwencjami.  
**Zasada:** `SeasonReportView` = presentation read-only; Confirm = osobna akcja.

### D87 — Offseason Phase Persists Until Confirm · CLOSED

**Dlaczego:** Faza tylko w pamięci sesji → regres AC-10/11 po refresh.  
**Zasada:** `clubs.season_phase=offseason` trzyma OFFSEASON + raport do Confirm; po N+1 `in_season` ⇒ raport nie wraca (AC-10 · AC-11).

**Źródło D78–D87:** LFE-SEASON-END-01 (feat `024e827`).

### D88 — League Tier Is Club SSOT · CLOSED

**Dlaczego:** Hardcoded „IV liga” uniemożliwia awans jako fakt domenowy.  
**Zasada:** Szczebel = `clubs.league_tier` → `ClubDto.leagueTier`; UI etykiet tylko przez `resolveLeagueTierLabel`.

### D89 — Promotion Outcome Is Derived · CLOSED

**Dlaczego:** RNG / ręczny awans niszczy SSOT tabeli.  
**Zasada:** `resolvePromotionOutcome(table, tier)` = pure derive; zero RNG.

### D90 — Single Tier Mutation Point · CLOSED

**Dlaczego:** Mutacja tier w close/report/UI = drift lifecycle.  
**Zasada:** Jedyna mutacja `league_tier` = ścieżka `confirmStartNextSeason` (po OFFSEASON).

### D91 — Report Shows Outcome Before Persist · CLOSED

**Dlaczego:** Konsekwencje przed uznaniem łamią D71.  
**Zasada:** Raport OFFSEASON pokazuje outcome z derive; persist tier dopiero przy Confirm.

### D92 — Thin Same Opponent World · SUPERSEDED by D123

**Dlaczego:** Pełna piramida AI = scope poza Thin.  
**Zasada (historyczna):** Promotion Thin zmienia wyłącznie szczebel klubu i etykiety; skład ligi i siła AI bez zmian.  
**Status:** **SUPERSEDED** przez **D123** (LFE-LEAGUE-WORLD-02) — tier wybiera League Strength Profile; AI skills ∈ pasmo; league MatchSession mapuje `players.skill`.

### D93 — Floor And Ceiling · CLOSED

**Dlaczego:** Spadek z IV / awans z I bez reguły = niespójny świat.  
**Zasada:** Liga IV = brak spadku; Liga I = brak awansu (mistrz/wicemistrz = etykieta stay).

### D94 — No Playoffs In Thin · CLOSED

**Dlaczego:** Baraże komplikują kalendarz i UX poza Thin.  
**Zasada:** Awans/spadek wyłącznie automatyczny z miejsc 1–2 / 11–12; baraże OUT.

**Źródło D88–D94:** GDD-PROMOTION-01 / LFE-PROMOTION-01 (feat `fa06c53`).

### D95 — One Base Sponsor Contract · CLOSED

**Dlaczego:** Multi-slot / marketplace = poza Thin.  
**Zasada:** Dokładnie jeden aktywny kontrakt na klub; SSOT = `club_sponsor_contracts`.

### D96 — Sponsors UI Sole Resolver · CLOSED

**Dlaczego:** Ad-hoc UI z wierszy DB = drift.  
**Zasada:** UI Sponsors wyłącznie przez `resolveClubSponsors`.

### D97 — Sponsor Cash Via Finance Ledger · CLOSED

**Dlaczego:** Drugi wallet niszczy D18.  
**Zasada:** Payout/bonus → `cash_balance` + `finance_movements` only.

### D98 — H-SPONSORS Non-Blocking · CLOSED

**Dlaczego:** Renewal jako Primary blokuje lifecycle.  
**Zasada:** Confirm N+1 = Primary; renewal = secondary; auto-renew przy Confirm gdy brak Accept.

### D99 — Soft Unlock Sponsors Only · CLOSED

**Dlaczego:** Unlock Board/Stadium „przy okazji”.  
**Zasada:** `/sponsors` open SEASON+OFFSEASON; Board/Stadium remain soft-locked.

### D100 — No Marketplace No Quest · CLOSED

**Dlaczego:** Scope creep §15 Future.  
**Zasada:** Brak marketplace, negocjacji, Quest Engine, mid-season change.

### D101 — Flat Renewal Band Thin · CLOSED

**Dlaczego:** Prestiż §6 nie istnieje w Thin.  
**Zasada:** Auto-renew / Accept zachowują ten sam brand i kwoty Thin.

**Źródło D95–D101:** GDD-SPONSORS-01 / LFE-SPONSORS-01 (feat `17eb8ba`).

### D102 — Board UI Sole Resolver · CLOSED

**Dlaczego:** Ad-hoc UI / stub bez DTO = drift.  
**Zasada:** UI Board wyłącznie przez `resolveClubBoard`.

### D103 — Board Information Thin · CLOSED

**Dlaczego:** Mutacje z `/board` tworzą system zarządzania.  
**Zasada:** Pure derive · zero zapisu stanu Board · zero Server Actions Board.

### D104 — H-BOARD Non-Blocking · CLOSED

**Dlaczego:** Board jako Primary blokuje lifecycle.  
**Zasada:** Confirm N+1 = Primary; Board = Information Thin (secondary / nav).

### D105 — Soft Unlock Board Only · CLOSED

**Dlaczego:** Unlock Stadium „przy okazji”.  
**Zasada:** `/board` open SEASON+OFFSEASON; `/stadium` remain soft-locked. (D99: Sponsors already open.)

### D106 — No Prestige Engine · SUPERSEDED BY D131

**Dlaczego:** Silnik §6 Prestige/Reputacja = poza Thin.  
**Zasada:** Brak numeric Prestige/Reputation; Board nie liczy §6.

### D107 — No Quest No Club Mgmt · SUPERSEDED BY D131 (zadania zarządu; zarządzanie klubem z Board dalej OUT)

**Dlaczego:** Quest / zarządzanie klubem = scope creep.  
**Zasada:** Brak Quest Engine · brak systemu zarządzania klubem z Board.

### D108 — Derive From Season Facts · CLOSED

**Dlaczego:** RNG / osobny score Board.  
**Zasada:** Wejście = tabela + `resolveSeasonReport` (+ phase); zero RNG.

**Źródło D102–D108:** GDD-BOARD-01 / LFE-BOARD-01 (feat `75c190d`).

### D109 — Stadium UI Sole Resolver · CLOSED

**Dlaczego:** Stub / ad-hoc UI bez DTO = drift i Fake Production.  
**Zasada:** UI Stadium wyłącznie przez `resolveClubStadium`.

### D110 — Stadium Information Thin · CLOSED

**Dlaczego:** Mutacje / persist tworzą system infrastruktury.  
**Zasada:** Pure derive · zero zapisu stanu Stadium · zero Server Actions Stadium.

### D111 — Soft Unlock Stadium Only · CLOSED

**Dlaczego:** Unlock „przy okazji” innych domen.  
**Zasada:** `/stadium` open SEASON+OFFSEASON; Sponsors/Board bez zmian (D99/D105).

### D112 — No Ticket Economy Thin · SUPERSEDED BY D126

**Dlaczego:** Bilety → kasa = osobny tor ekonomii (§14.9 / §26 Future).  
**Zasada:** Brak Ticket Economy · brak nowych kategorii `finance_movements`.

### D113 — Qualitative Attendance Only · CLOSED

**Dlaczego:** Liczbowa frekwencja / RNG = Fake Production lub silnik.  
**Zasada:** Pasmo jakościowe; brak home played → `unknown`; zero % pojemności.

### D114 — Starter Package Stadium Facts · CLOSED

**Dlaczego:** Drugi preset nazwy/pojemności = drift vs Club.  
**Zasada:** Nazwa + pojemność wyłącznie z `STARTER_PACKAGE`.

### D115 — No Match Engine Coupling · CLOSED

**Dlaczego:** LFE `Stadium` / Canvas ≠ produkt `/stadium`.  
**Zasada:** Zero wpływu na Match Engine, wynik meczu, PreMatch UI, Canvas.

**Źródło D109–D115:** GDD-STADIUM-01 / LFE-STADIUM-01 (feat `82a164d`).

### D116 — Transfer Actions Organizational Split Only · CLOSED

**Dlaczego:** Gruby monolit `actions.ts` utrudnia review bez zmiany API.  
**Zasada:** Split `actions.ts` → `actions-*.ts` + barrel re-export; **zero** zmian nazw / sygnatur Public Server Actions; **zero** zmian semantyki rynku.

### D117 — Transfer displayPos Sole Helper · CLOSED

**Dlaczego:** Cztery lokalne kopie `displayPos` w `lib/transfers/` = dryft LO/ŚO→OB.  
**Zasada:** Jedyna definicja = `lib/transfers/display-pos.ts`; dedup **tylko** w module transfers (squad/academy/scouting OUT).

### D118 — No Transfer Dispatcher / Registry / Service Locator · CLOSED

**Dlaczego:** Nowe warstwy orkiestracji przy TD-03+ = scope creep i ryzyko drugiej ścieżki settle.  
**Zasada:** Brak Dispatcher / Registry / Service Locator; Single Settlement Path bez zmian; shared guards tylko przy realnej deduplikacji.

**Źródło D116–D118:** LFE-TRANSFERS-10 / TD-03+ · feat **`9424dd8`** · PLAN [`implementation/LFE-TRANSFERS-10-PLAN.md`](./implementation/LFE-TRANSFERS-10-PLAN.md) · PRODUCTION VERIFY PASS.

### D119 — LFE Root Barrel = Freeze PUBLIC Only · CLOSED

**Dlaczego:** `index.ts` over-export = drift vs Architecture Freeze.  
**Zasada:** Root `@lastfootball/lfe` eksportuje wyłącznie Freeze PUBLIC Contract (po korekcie Production MUST).

### D120 — EngineEvent + Tactical Factories Are PUBLIC · CLOSED

**Dlaczego:** Produkcyjny match UI (Live / Canvas / Post) wymaga `EngineEvent` i tactical command factories.  
**Zasada:** Te symbole są PUBLIC (Freeze §3.6 / §3.6A); nie wracają do ADVANCED bez migracji Web.

### D121 — LFE Testing Subpath Barrel Only · CLOSED

**Dlaczego:** Harness / Vitest potrzebuje simulation/SM/AI bez zaśmiecania PUBLIC.  
**Zasada:** `@lastfootball/lfe/testing` = wyłącznie barrel re-export · zero logiki · Web nie importuje `/testing`. `/advanced` poza zakresem LFE-PUBLIC-API-01.

**Źródło D119–D121:** LFE-PUBLIC-API-01 · feat **`ce00327`** · PLAN [`implementation/LFE-PUBLIC-API-01-PLAN.md`](./implementation/LFE-PUBLIC-API-01-PLAN.md) · PRODUCTION VERIFY PASS · DOCS CLOSE.

### D122 — Season Age++ Wired at Confirm N+1 (H-AGE) · CLOSED

**Dlaczego:** H-AGE no-op blokował retencję kariery; pure `applySeasonAgeEffects` już istniało (D22).  
**Zasada:** Jedyny produktowy age++ = `confirmStartNextSeason` → Season Transition step **H-AGE** (`runSeasonTransitionHAge`); REUSE pure; scope = non-departed `players` klubu gracza (w tym `academy_track`); soft regress wyłącznie przez `DEVELOPMENT_THIN.AGE_REGRESS_FROM`; fail-closed + revert przy fail otwarcia sezonu.  
**OUT:** Retirement · Prime · Youth Depth · world-age AI · migracje schematu · LFE/Match Engine / Settlement.  
**Superseduje:** „brak auto age++ w produkcie” (D22 Age line · D83 age no-op).  
**Supersede częściowy:** Decline Depth Thin → **D124** (Career Phase · Growth Gate · pasma regress).

**Źródło D122:** LFE-AGE-01 · feat **`6a54722`** · PLAN [`implementation/LFE-AGE-01-PLAN.md`](./implementation/LFE-AGE-01-PLAN.md) · CI GREEN · PRODUCTION VERIFY PASS · DOCS CLOSE.

### D123 — Tier-Aware League Strength World · CLOSED

**Dlaczego:** D92 (same opponent world) czyni awans kosmetycznym; retencja S2+ wymaga trudności per szczebel.  
**Zasada:** `league_tier` wybiera `LeagueStrengthProfile` (`minSkill`/`maxSkill`, kontrakt rozszerzalny); AI seed skills ∈ pasmo (deterministyczny hash); league MatchSession mapuje `players.skill` → LFE `PlayerSkills` przez Thin Adapter `mapPlayerSkillToLfeSkills` (uniform); katalog nazw Thin B bez wymogu 4× content; kalendarz 22 REUSE; brak LFE PUBLIC / migracji / Match Engine.  
**OUT:** Variant A katalogi · baraże · First Match redesign · multi-attribute skill map · world-age AI.  
**Superseduje:** **D92** Thin Same Opponent World.

**Źródło D123:** LFE-LEAGUE-WORLD-02 · feat **`843bcfd`** · PLAN [`implementation/LFE-LEAGUE-WORLD-02-PLAN.md`](./implementation/LFE-LEAGUE-WORLD-02-PLAN.md) · CI GREEN · PRODUCTION VERIFY PASS · DOCS CLOSE.

### D124 — Career Phase as Derived Domain Concept · CLOSED

**Dlaczego:** Schyłek i peak muszą być czytelne w UI i bramkować rozwój bez drugiego modelu danych i bez kolumn DB.  
**Zasada:** `CareerPhase` = pure derive z faktów domeny (Thin: `age`; kontrakt `CareerPhaseInput` rozszerzalny); UI i Growth Gate czytają wyłącznie `resolveCareerPhase` / `resolveGrowthCoefficient`; zero persist `career_phase`; AGE tick nadal H-AGE; Decline Depth Thin = pasma regress (`decline` −1 · `late` −2) + malejący współczynnik growth (nie hard ban); jedna ścieżka age dla całego rosteru (w tym `academy_track`); brak Retirement/Prime/Youth Depth w tym EPICu.  
**OUT:** Retirement · Prime buff · minutes/morale regress · Youth Depth · migracje · LFE PUBLIC / Match Engine.

**Źródło D124:** LFE-CAREER-DECLINE-01 · feat **`3c01baa`** · PLAN [`implementation/LFE-CAREER-DECLINE-01-PLAN.md`](./implementation/LFE-CAREER-DECLINE-01-PLAN.md) · CI GREEN · PRODUCTION VERIFY PASS · DOCS CLOSE.

### D125 — In-App Invitation Layer (Composition Thin) · CLOSED

**Dlaczego:** GDD §22 wymaga soft remind in-app bez push/email; Overlay „notifications” myliło się ze skrzynką §21 (D43).  
**Zasada:** Jedyny SSOT zaproszeń in-app UI = `resolveClubInvitations` → `ClubInvitationsDto` (≤1); pure composition z `ClubMessagesDto` (`priority: 'decision'`) + Hub Primary matchday; **nie** drugi inbox i **nie** SSOT decyzji; dismiss wyłącznie `sessionStorage` w presentation host; zero migracji / Web Push / Email; LFE/PUBLIC nienaruszone; nazewnictwo kodu = Invitation (nie Notification\*); Overlay chrome kind = `messages` (D43 peek).  
**OUT:** Web Push · Email · preferencje DB · E1 info-as-invite · mutacje z toastu · zmiana D40–D46 poza rename Overlay → messages.  
**Relacja:** §22 polityka · §21 Messages (D40–D46) · §23 Hub Primary nadrzędny.

**Źródło D125:** LFE-NOTIFICATIONS-01 · feat **`54ae7b3`** · style `cb1511e` · PLAN [`implementation/LFE-NOTIFICATIONS-01-PLAN.md`](./implementation/LFE-NOTIFICATIONS-01-PLAN.md) · CI GREEN · PRODUCTION VERIFY PASS · DOCS CLOSE.

### D126 — Match Economy: wages, tickets, unpaid wages · Owner GO 2026-11-23

**Dlaczego:** Klub ze środka tabeli tracił ok. 6 700 EUR na meczu i kończył z zerem ok. 17. kolejki, a zero kasy nic nie zmieniało. D112 nie opisywało już stanu kodu.  
**Zasada:** Bilety → kasa działają (`ticket_income`, trybuny 0–3) i zastępują D112. Nagrody i bilety pokrywają pensje wg GDD §26.8; pensje zapisane w `players.wage` bez zmian. Nagroda rośnie z ligą o połowę kroku `LEAGUE_RUNG_MULT`; liga ludzi = stawka IV ligi; puchar i wyzwania bez nagrody, pensje jak dotąd; wyzwania bez biletów. Niepełna wypłata obniża morale seniorów (1..8) przez `nextMorale`. Komunikat i ostrzeżenie = derive `ClubFinanceDto.wageNote` z ruchu `wages` (Hub · Finanse · Wiadomości).  
**OUT:** migracje · dług klubu · nagrody pucharowe · zmiana pensji.

### D127 — Wynik i kasa należą do serwera · Owner GO 2026-11-23

**Dlaczego:** Wynik ligi, pucharu i wyzwania przychodził z przeglądarki, a RLS pozwalał sesji gracza wpisać kasę, wynik i poziom ligi we własnym klubie. Zapisy kasy nadpisywały się przy równoczesnych akcjach.  
**Zasada:** Przeglądarka wysyła tylko decyzje (`managerLog`) i ustawienie. `authoritativeManagerScore` buduje tę samą sesję z bazy i odtwarza mecz; jej wynik jest oficjalny. Kasę zapisuje wyłącznie `club-cash.ts` (compare-and-set, service role po sprawdzeniu właściciela). Triggery `lf_guard_*` odrzucają z sesji gracza: kasę, ligę, sezon, poziomy, sztab, nastrój kibiców, terminarz i wyniki, kontrakty sponsora, wyniki wyzwań. Funkcje SECURITY DEFINER działają dalej. Nieudane rozliczenie otwiera mecz ponownie.  
**OUT:** ochrona `players` (skill, energia) i pierwszego meczu — osobny EPIC.

### D128 — Kadra i księga należą do serwera · Owner GO 2026-11-23

**Dlaczego:** RLS pozwalał sesji gracza zmienić skill, energię i pensje własnych zawodników oraz wpisać ruchy finansowe, więc wynik serwera (D127) dało się obejść.  
**Zasada:** `lf_guard_players` przepuszcza z sesji gracza tylko `starter`, `captain`, `set_piece`, `shirt_number`. Resztę pisze `serverDb(session)` po sprawdzeniu właściciela i zawsze z filtrem `club_id`. `apply_match_development` i `complete_training_session` wykonuje tylko service role. `finance_movements` i `transfer_deals` = tylko serwer. Odpoczynek: `players.energy_on` stempluje trigger, `restedEnergy` to czysty derive (5 / dzień).  
**OUT:** oferty transferowe i aukcje (własne funkcje SQL z kontrolą kwot).

### D129 — Głębia meczu: morale, fakty meczowe, puchar, start kadry · Owner GO 2026-11-23

**Dlaczego:** Morale nie działało w silniku, sędzia/pogoda/frekwencja były stałym tekstem, puchar AI losował wyniki bez siły, a ławka nowego klubu była lepsza od jedenastki.  
**Zasada:** Duch zawodnika = `70 + ((forma − 65) + (morale − 60)) / 2` (`teamSpiritFromSeed`), bez morale = 70 = `DEFAULT_PLAYER_CONDITION`. Silnik: ±6% ataku i gola przy ±30 pkt (`MATCH_BALANCE.MORALE_*`). Wszystko z tych samych seedów co `authoritativeManagerScore` (D127). Fakty meczowe = pure derive z fixture (`resolveMatchFacts`), bez wpływu na silnik i bez zapisu; liczbowa frekwencja ≤ miejsca zastępuje tu D113. Puchar AI↔AI = `scoreFromStrength` (seed: sezon + runda), min. 6 pkt przewagi klubu z wyższej ligi; rywal już wylosowany przez menedżera zachowuje awans. `buildStarterPlayerInserts` tylko permutuje skill w pozycji.  
**OUT:** odpoczynek między kolejkami (energia) · migracje · istniejące kluby.

### D130 — Zamrożony początek meczu · pasma rywali · Owner GO 2026-11-24

**Dlaczego:** Serwer odtwarzał mecz ze stanu na koniec, więc zmiana kadry w trakcie dawała inny wynik niż na ekranie. Nowy klub w IV lidze wygrywał ok. 2/3 meczów.  
**Zasada:** Strona live zapisuje `match_kickoffs` (tylko service role, jeden wiersz na klub; ostatnie wejście zastępuje poprzednie, każdy rozliczony mecz go kasuje). Serwer sam czyta kopię, klient jej nie wskazuje. `authoritativeManagerScore` odtwarza z kopii ważnej 6 h razem z rywalem AI; role i rozwój po meczu biorą jedenastkę z tej samej kopii. Sprzedany lub wypożyczony w trakcie = mecz od nowa. Bez kopii działa ścieżka D127. Liga ludzi zostaje na swoich zamkniętych składach. Pasma `LeagueStrengthProfile`: IV 47–63, III 53–69, II 59–75, I 66–82.

### D132 — Powiadomienia push i e-mail · Owner GO 2026-11-24

**Dlaczego:** §22 miał tylko zaproszenia w grze. Menedżer poza grą nie wiedział o meczu, ofercie ani wyzwaniu.  
**Zasada:** Wszystko domyślnie wyłączone. Rodzaje: `matchday` (17:00–19:59, tylko przy aktywności w ostatnich 14 dniach), `human_round` (17:15–17:59; klub z kolejką na dziś; klub z zaległą kolejką zamiast 18:00 słyszy o zaległości, najwyżej raz na 7 dni, póki jest aktywny), `offer` (oferta albo kontra, gdy decyzja jest po stronie klubu, zawodnik jest nadal wystawiony przez sprzedawcę, a kwota do rozliczenia; jedna sprawa = zawodnik i kupujący), `challenge` (rywal rozegrał wyzwanie). Cisza 22:00–8:00 czasu warszawskiego. Najwyżej 2 dziennie na kanał i jedno na sprawę. Plan = czysta funkcja `planNotifications`. Wysyłkę zleca `pg_cron` co 30 min do adresu z wiersza `notify_url` (token z bazy albo `CRON_SECRET`); bez wiersza nic nie robi. Najdłużej czekający menedżer idzie pierwszy. Wpis w `notification_log` powstaje przed wysyłką (dedup). Klucze VAPID serwer tworzy sam i trzyma w `server_secrets` (tylko service role). Push: tylko znane serwery push, do 5 urządzeń, treść bez danych osobowych. Push nie czeka dłużej niż do końca swojej sprawy i nigdy poza 22:00; wylogowanie usuwa urządzenie. Strażnik `lf_guard_transfer_offer` sprawdza każdą ofertę z sesji gracza (najwyżej 10 otwartych na klub). E-mail: Resend, do 2 na sekundę, tylko adres z `confirmed_email_hash` równym obecnemu (starsze potwierdzenia muszą kliknąć link jeszcze raz), wypisanie bez logowania (GET pyta, POST wypisuje). Bez tabel, kluczy albo dostawcy funkcja jest ukryta lub „niedostępna”. Powiadomienie nie zmienia niczego w domenie. Zastępuje zakaz `lib/notifications` z D125; zaproszenia w grze zostają osobno w `lib/invitations`.  
**OUT:** SMS · przypomnienia o treningu i zadaniach · treści AI · bieżąca minuta meczu.

### D131 — Prestiż klubu i zadania zarządu · Owner GO 2026-11-24

**Dlaczego:** Sukces sportowy nie zostawał w historii klubu, a ekran Zarządu tylko opisywał tabelę. Zastępuje D106 i D107, zawęża D103 i D101.  
**Zasada:** `club_season_history` i `club_board_task_claims` pisze tylko serwer, właściciel czyta. Prestiż 0..100 = pure derive (`resolvePrestige`) z historii, ligi, pucharu i zadań; działa wyłącznie na wycenę sponsora przy odnowieniu (0..+10%, `sponsorFromCrowd`), nigdy na mecz. Zadania: jedno na kolejki 1–5, 6–10, 11–15, 16–20, wybór i postęp = derive z meczów ligowych; porażka nic nie kosztuje. Wypłata = `claim_board_task` (claim + kasa + księga w jednej transakcji, service role). W przerwie odbiór wymaga 22 rozegranych meczów sezonu. `confirmStartNextSeason` bierze blokadę klubu (`club_season_starts`, wygasa po 5 min), wypłaca nieodebrane zadania, a `clear_season_fixtures` zapisuje sezon i kasuje terminarz w jednej transakcji; każdy błąd, także wypłaty, zatrzymuje start (zawęża D104). Powtórzony start bierze awans lub spadek z zapisanego sezonu, a niepełny terminarz nie zmienia ligi. Bez tabel ekrany ukrywają funkcję, a start sezonu czeka. Liczby: GDD §26.8.  
**OUT:** Reputacja · wydawanie prestiżu · kary · losowanie zadań od nowa · zadanie jako Primary na Hubie.

### D134 — Akademia 02: poziomy, wybór kandydata, trening · Owner GO 2026-11-24

**Dlaczego:** Akademia bez kosztów i wyboru kończyła się hurtową sprzedażą juniorów. Zmienia liczby D23 i D133, zawęża „poza Thin” z D23.  
**Zasada:** Liczby tylko w `lib/academy/levels.ts` (GDD §26.8). `clubs.academy_level` 0..3 pisze serwer (strażnik `lf_guard_academy_level`), rozbudowa = `upgrade_academy` (poziom z przycisku, kasa i księga w jednej transakcji). Nabór = wiersz `academy_intakes` (tylko serwer): kandydaci z klubu i numeru naboru, zapisani przy otwarciu, więc odświeżenie nic nie losuje; czas czekania liczy się od otwarcia, także po odmowie. `take_academy_candidate` sprawdza ofertę, miejsca i numery (też zajęte przez odeszłych) i dodaje juniora raz. `train_academy_junior`: kasa, księga i +1 do grupy w jednej transakcji; skill bez zmian, jak w treningu indywidualnym. Utrzymanie: `settle_fixture` czyta poziom pod blokadą klubu i bierze kwotę z `p_upkeep_by_level` (po pensjach, kasa nigdy poniżej 0). `players.senior_matches` rośnie w `apply_match_development` raz na mecz za występ w jedenastce; odrzucony wiersz cofa całość. Junior, który przed startem sezonu ma 19 lat, odchodzi (`openNextSeasonAfterDeparture`, z cofnięciem); `players.aged_for_season` pilnuje jednego roku na koniec sezonu. Limity kadry 22/18/bramkarz liczą seniorów, także w H2H i licytacji. Numer koszulki jest zajęty tylko, póki zawodnik jest w klubie; wracający dostaje wolny. Nieznane fakty ceny (`saleUnknown`) albo inna cena niż pokazana wstrzymują sprzedaż. `lf_stamp_player_move` zostawia `academy` i `free`. `aiSaleAsk`: 10 / 25 / 50% dla academy, 10% dla free. Pasmo wybranego juniora zostaje znane bez raportu skauta. Bez migracji działa stara akademia (poziom 0).  
**OUT:** auto-promote · mecze młodzieżowe · academy OVR · gwiazdki · liczenie zmienników.

### D133 — Uczciwa sprzedaż i rytm naboru · Owner GO 2026-11-24

**Dlaczego:** Darmowy nabór bez limitu i sprzedaż juniora, wolnego agenta lub wypożyczonego za pełną cenę dawały nieograniczoną kasę.  
**Zasada:** `players.origin` (academy · free · bought · loan; null = start) i `joined_at`. `saleBlock`: wypożyczeni nigdy, nowi po 7 dniach. `aiSaleAsk`: 10% ceny dla academy i free; handel między menedżerami bez zmian. Nabór co 7 dni (`intakeWaitDays`), liczony z całej historii klubu. Zmiana klubu stempluje trigger `lf_stamp_player_move`.

## Najważniejsze decyzje (meta)

### D135 — Poprawki po próbie sezonu · 2026-11-24

1. Odblokowania (trening, transfery) liczą zamknięte sezony: nowy sezon niczego nie zamyka z powrotem.
2. Start sezonu nie kasuje wyników rywalizacji; otwarte wyzwanie przechodzi do nowego sezonu (`keep_rival_results`).
3. Karne: podsumowanie mówi, kto je wygrał; dopisany gol nie jest golem meczu.
4. Pozycja w tabeli pojawia się dopiero po pierwszym meczu ligowym sezonu.

### D136 — Początek sezonu, nagrody pucharu, sponsor, skład · Owner GO 2026-11-24

1. Start sezonu: energia 100, kontuzje wyleczone, nikt nie jest zmęczony. Zawieszenie zostaje.
2. Puchar płaci za rundę (IV liga): awans 12 000 / 14 000 / 17 000, zwycięstwo w finale 30 000; udział 4000, przegrany finał 10 000. Wyższe ligi jak w §26.4.
3. Start sezonu wypłaca nieodebrany bonus sponsora. Baza pierwszego kontraktu wpływa raz, po meczu ligowym.
4. „Ustaw skład” pokazuje energię i ma „Najlepsza jedenastka” (4-4-2, umiejętność pomniejszona o brak energii).
5. Drabinka pucharu nie pokazuje rund, które jeszcze się nie otworzyły. Zmienia tylko widok.

### D137 — Mecze Ligi ludzi nie znikają przy nowym sezonie klubu · 2026-11-24

Liga ludzi ma własny kalendarz. Start sezonu klubu zostawia jej mecze (`human_league_season`), więc rozegranej kolejki nie da się zagrać ani rozliczyć drugi raz. Oba kluby i zapis wyniku liczą ten sam mecz: jedna zasada energii, stałe fragmenty obu stron, boisko i styl gospodarza zamrożone ze składem (`human_broadcasts.home_setup`). Mecz Ligi ludzi nie zajmuje dnia ligi i pucharu. Zapowiedź końca kariery liczy wiek po starcie sezonu.

### D138 — Liga ludzi: sezony, tabela, nowe kluby · Owner GO 2026-11-24

1. Sezon ma 22 kolejki. Potem 3 dni na zaległe mecze i automatyczny start kolejnego (`roll_human_league`, raz, tylko serwer).
2. Między sezonami miejsca są otwarte do 18:00 pierwszej kolejki; wolne biorą nowe kluby, resztę boty. Nadal 12 miejsc, od najstarszego klubu.
3. Tabela: mecz z klubem gracza liczy się, gdy ktoś go rozegrał; dwa boty grają same po oknie 18:00–21:00.
4. Niedostępny zawodnik w jedenastce nie blokuje meczu obu klubom: przy zamknięciu składów zastępuje go najlepszy wolny.
5. Wyniki poprzednich sezonów zostają (`human_broadcasts.season`). Przy starcie znikają tylko nierozegrane mecze.

### D139 — Kontrakty w sezonach klubu · Owner GO 2026-11-24

1. `players.contract_season` = ostatni sezon umowy. Obecni zawodnicy: obecny sezon + 1–3, rozłożone, więc nikt nie odchodzi po sezonie, który trwa. Transfer i awans z akademii: obecny sezon + 2.
2. Rozmowa jest otwarta w dwóch ostatnich sezonach umowy i przedłuża do końca sezonu + 2.
3. Start sezonu: bez przedłużenia zawodnik odchodzi za darmo. Zarząd zatrzymuje na sezon, za żądaną pensję, gdy zostałoby mniej niż 14 seniorów albo żaden bramkarz. Najpierw odchodzą najsłabsi.
4. Wiadomości: ostatni sezon umowy i lista, kto odszedł. Raport sezonu mówi, kto odejdzie.
5. `departed_reason`: sprzedaż i koniec wypożyczenia nie są już pokazywane jako koniec kariery.

### D140 — Liga ludzi: koniec sezonu i aktywność; zapisy kasy · Owner GO 2026-11-24

1. Przy starcie nowego sezonu nierozegrany mecz klubu gracza z botem to 0:3, mecz dwóch nieobecnych klubów się nie liczy, boty grają między sobą jak w tabeli. Bez nagród i kar. Tabela końcowa zostaje (`human_league_history`).
2. Miejsce dostaje klub, który w ostatnich 14 dniach grał, trenował albo powstał. Pozostałe miejsca biorą boty.
3. Zakup z rynku to jedna transakcja (`buy_market_player`). Rozbudowa stadionu wymaga poziomu, który gracz widział.

### D141 — Wyzwanie jako mecz towarzyski · Owner GO 2026-11-24

Wyzwanie: jedno na dzień (czas warszawski), własny zegar, nie zajmuje dnia ligi i pucharu. Bez nagrody, pensji i utrzymania akademii. Energia, kontuzje, kartki, rozwój i kibice liczą się jak w meczu.

### D142 — Gotowość na graczy · Owner GO 2026-11-24

1. Usunięcie konta w Ustawieniach (hasło i słowo USUŃ): klub znika, konto znika, u innych zostaje „Klub usunięty”.
2. Pierwsze kroki na hubie: 3 mecze, trening, nabór. Nagroda 5000 € raz (`claim_starter_reward`).
3. Zaproszenie: link klubu, po założeniu klubu od razu otwarte wyzwanie z zapraszającym. Bez nagród.
4. Statystyki: tylko dni gry konta (`account_activity`) i zliczenia (`player_report`, tylko serwer).

### D143 — Statystyki, gablota, wiadomości o meczach, nagrody Ligi ludzi · Owner GO 2026-11-24

1. Strzelcy i asysty z tego samego odtworzenia meczu, które liczy wynik. Zapis w jednej transakcji z rozliczeniem (`settle_match`). Wyzwania się nie liczą.
2. Strzelec i asystent: waga roli × umiejętność (`goalWeight`, `assistWeight`). Wyniki meczów bez zmian: to nie jest losowanie meczu.
3. Gole klubów AI w tabeli strzelców wyprowadzone z tych samych wyników co tabela ligi. Zawodnicy rywali mają nazwiska (`opponentNames`).
4. Wyniki zostają w `club_matches` po skasowaniu terminarza. Rekordy z nich, trofea z `club_season_history` i nagród Ligi ludzi.
5. Wiadomości o wyzwaniu i Lidze ludzi są wyprowadzane (`resolveMatchEvents`), bez stanu przeczytania i bez wyniku nierozegranej kolejki.
6. Nagrody Ligi ludzi (`HUMAN_PRIZES`) płacone raz przy zamknięciu sezonu, klubom z co najmniej 11 własnymi kolejkami.
7. Nowy sezon klubu nie kasuje rozegranych kolejek trwającej Ligi ludzi (wcześniej można je było zagrać i dostać nagrodę drugi raz).

### D144 — Poczta kontaktowa · Owner GO 2026-11-24

kontakt@lastfootball.pl odbiera Resend (rekord MX). Harmonogram powiadomień przekazuje listy na adres z `CONTACT_FORWARD_TO` (tylko Vercel, nigdy w repo), najwyżej 25 na dobę. Zapisujemy wyłącznie identyfikatory przekazanych listów, na 7 dni.

### D145 — Notka po meczu bez zewnętrznego AI · Owner 2026-11-24

Dawid nie chce przekazywać danych graczy dostawcom z USA. Notka po meczu to zdanie z faktów meczu (`summary.why`), bez xAI, Groq i Gemini.

### D146 — Push wyłączony · Owner 2026-11-24

`PUSH_ENABLED = false`: przeglądarki dostarczają push przez firmy z USA. Zostają e-mail i wiadomości w grze. Vercel, Supabase, Resend i Turnstile zostają: serwery w UE, polityka wymienia firmy z USA i podstawę przekazania.

### D147 — Regulamin i polityka prywatności · Owner GO 2026-11-24

Treść w `/regulamin` i `/prywatnosc`, dane i terminy w `lib/legal.ts`. Każda nowa kategoria danych albo dostawca wymaga zmiany polityki w tym samym PR.

### D148 — Wiek przy rejestracji · Owner GO 2026-11-24

Pole „Mam ukończone 16 lat”, sprawdzane też na serwerze (`consentError`). Wieku nie zapisujemy.

### D149 — Listy konta przez pocztę gry · 2026-11-24

Potwierdzenie adresu i reset hasła wysyła Resend, nie domyślna poczta Supabase. Link z listu nic nie zużywa, dopóki człowiek nie kliknie w grze (skanery poczty). Reset ma hamulec `consume_reset_slot`; gdy hamulec nie odpowiada, listu nie ma.

### D150 — Gotowość A · Owner GO 2026-11-24

1. Mecz jest jeden: serwer zapamiętuje postęp (`match_kickoffs.progress_tick`, `manager_log`), powrót wznawia, a zapis wyniku musi zawierać zapamiętane decyzje. Niedokończony mecz idzie przed innym. Wyjątek: pierwszy mecz i zawodnik, który odszedł w trakcie.
2. Filtr nazw (`isNameAllowed`), klub zakłada serwer, sesja gracza nie zmienia nazwy. Zgłoszenia w Rywalizacji, panel `/admin` dla `app_admins`: zmiana nazwy i blokada z powodem wysyłanym do gracza.
3. Zmiana hasła i e-maila w Ustawieniach, nowe hasła od 8 znaków. Nowy adres działa po kliknięciu linku.
4. Funkcje RPC tylko dla zalogowanych; `supersede_pending_transfer_offers` tylko dla bazy.
5. `/jak-grac`, polskie strony błędów, `/status` tylko dla operatora. Z meczu usunięte instrukcje, które nic nie robiły.

### D151 — Pełne zasady meczu i talenty · Owner GO 2026-11-24

1. Silnik ma `MatchState.rules`. Z zasadami: faul może dać kartkę (druga żółta i czerwona zdejmują z boiska), karny albo wolny; spalone, gole po rożnych, kontuzje w meczu, zmęczenie z minutami. Balans bramek i strzałów bez zmian (`match-rules01.test.ts`).
2. Kontuzjowanego zastępuje od razu najlepszy rezerwowy w ramach 3 zmian; bez zmian drużyna gra w osłabieniu, bez żadnej ławki zawodnik zostaje. Kto zszedł, nie wraca.
3. Rywal komputerowy i obie strony Ligi ludzi robią zmiany same (`autoSides`). Rywal AI ma ławkę (`seedOpponentBench`), ławki Ligi ludzi są zamrożone w `home_setup`.
4. Kapitan (osobowość, wiek, talent) i wykonawca stałych fragmentów działają w silniku.
5. Pauzy i kontuzje po meczu pochodzą z meczu; energia spada według minut. Mecz otwarty wcześniej (kopia bez `rules: 2`, transmisja bez ławek) kończy się na starych zasadach.
6. Talenty (GDD 7.16): 0–2, stałe z id i pozycji (`talentsOf`), bez zapisu w bazie. Na rynku niewidoczne, bo id powstaje przy zakupie.

### D152 — Świat graczy · Owner GO 2026-11-24

1. Okno transferowe (GDD 12.2): przerwa i początek sezonu do 8. meczu, zima od 11. do 16. meczu ligowego; sezon 1 od 2. meczu. `isTransferWindowOpen`, zapis w `clubs.transfer_window_open`.
2. Ranking graczy: 30 dni, liga 3/1 razy waga ligi, puchar 4, Liga ludzi 6/2, wyzwania 0, zablokowani poza listą. RPC `player_ranking` tylko dla serwera.
3. Profil klubu `/clubs/[id]`: nazwa, herb, liga, bilans, 5 meczów, trofea, nazwiska pierwszego składu. Bez kasy, taktyki, umiejętności i właściciela. Polityka prywatności, rozdział 4, uzupełniona.

### D153 — Licytacja, karne, talenty na rynku · Owner GO 2026-11-24

1. Licytacja trwa 24 godziny od pierwszej oferty, najmniej 15 minut od ostatniej. Rozlicza ją `settle_due_auctions` (cron `lf-auctions` co 10 minut i wejście na Transfery). Wygrywa najwyższa oferta, którą klub nadal może zapłacić. Zamknięte w międzyczasie okno nie zmienia wyniku. Sprzedający nie przyjmuje ani nie cofa.
2. W trakcie licytacji zawodnika nie można sprzedać inaczej ani zdjąć z listy (`guard_auction_player`). Koniec umowy lub kariery kończy licytację bez sprzedaży.
3. Karne po dogrywce: pięć kolejek i dogrywka karnych, szansa z umiejętności strzelca i bramkarza (`rollShootOut`). Wynik meczu jak wcześniej: jeden gol dla zwycięzcy.
4. Id kupionego zawodnika wynika z pozycji rynku (`boughtPlayerId`), więc talenty widać przed zakupem.

### D154 — Wiele Lig ludzi · Owner GO 2026-11-24

1. Ligi otwierają się same: klub bez miejsca trafia do ligi, która jeszcze nie zaczęła, a gdy takiej nie ma, dwa czekające kluby otwierają nową (start następnego dnia). Resztę miejsc biorą boty.
2. Każda liga ma własny kalendarz (`human_league.id`). `season_number` jest unikalny między ligami, `cycle` to sezon ligi widoczny dla gracza.
3. Przed startem dwie niepełne ligi łączą się w jedną, liga bez aktywnego klubu znika, a liga, do której nikt nie przyszedł pierwszego dnia, startuje od nowa. Po pierwszym zamkniętym składzie miejsca są stałe do końca sezonu.
4. Całość w `human_league_sync` pod jedną blokadą. Zablokowane konta nie biorą miejsca.

### D155 — Nagrody Ligi ludzi i raport skauta · Owner GO 2026-11-24

1. Nagrody Ligi ludzi rosną z liczbą klubów graczy w lidze: pełne od 8, niżej proporcjonalnie (`humanPrizes`). Sezon trwający przy zmianie (numer 1) zachowuje obiecane kwoty.
2. Raport skauta czyta zapisany potencjał, a ekran pokazuje kupione pasmo. Wcześniej oba liczyły szacunek z bieżącego wieku, więc u starszego zawodnika mogły kłamać.

### D156 — Szukanie błędów · Owner GO 2026-11-24

1. Transfer między graczami: zawodnik może wrócić do klubu, z którego odszedł (klucz umowy był na zawodnika, więc drugi zakup kończył się „sukcesem” bez transferu), wykonawca stałych fragmentów może zmienić klub, wypożyczony nie jest na sprzedaż. Zawodnika z listy transferowej nie da się wypożyczyć.
2. Sesja gracza nie czyta wierszy cudzych zawodników (polityka `players_select_transfer_listed` usunięta): odczyt idzie przez serwer albo `list_live_transfer_listings`. Z `human_broadcasts` sesja widzi tylko kolumny, których używają ekrany.
3. Anon i sesja nie mają uprawnień, których API nie potrzebuje. Indeksy licytacji, stała ścieżka funkcji.
4. Kwoty zawsze z „€”, interfejs meczu i kreatora po polsku, jeden nagłówek h1 na ekranie.

Każde złamanie D1–D28 / D38 / D40–D52 / D63–D156 wymaga **AUDIT** i aktualizacji tego pliku + freeze/GDD/platform docs.
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
**LFE-MESSAGES-01 (2026-07-30):** `resolveClubMessages` derive E1–E3 (D40–D46); Overlay = ta sama DTO.  
**LFE-NOTIFICATIONS-01 (2026-08-04):** `resolveClubInvitations` composition Thin (D125); Overlay kind → `messages`; feat `54ae7b3`.
**LFE-CLUB-01 (2026-07-30):** `resolveClubProfile` identity Thin (D47–D51); brak silnika §6 / personelu.
**LFE-SOFTLOCK-01 (2026-07-30):** generyczny Route Gate + SoftLockState (D52 · D63–D67); strip Fake Production sponsors/board/stadium.
**GDD-SEASON-END-01 (2026-07-30):** Season End Thin kontrakt (D68–D77); SSOT `GDD-SEASON-END-01.md`; awans/spadek OUT.
**LFE-SEASON-END-01 (2026-07-31):** Season End Thin lifecycle kod (D78–D87); OFFSEASON · report · Confirm N+1 · feat `024e827`.
**GDD-PROMOTION-01 / LFE-PROMOTION-01 (2026-07-31):** Promotion Thin (D88–D94); `league_tier` · outcome derive · Confirm mutation · same AI world · feat `fa06c53` · PRODUCTION VERIFY.
**GDD-SPONSORS-01 / LFE-SPONSORS-01 (2026-07-31):** Sponsors Thin (D95–D101); `club_sponsor_contracts` · finance ledger · H-SPONSORS non-blocking · feat `17eb8ba` · PRODUCTION VERIFY.
**GDD-BOARD-01 / LFE-BOARD-01 (2026-07-31):** Board Information Thin (D102–D108); `resolveClubBoard` pure derive · no persist · H-BOARD non-blocking · feat `75c190d` · PRODUCTION VERIFY.
**GDD-STADIUM-01 / LFE-STADIUM-01 (2026-07-31):** Stadium Information Thin (D109–D115); `resolveClubStadium` pure derive · no persist · no Ticket Economy · no Match Engine · feat `82a164d` · PRODUCTION VERIFY.
**LFE-TRANSFERS-10 / TD-03+ (2026-07-31):** Transfer actions organizational split + `displayPos` sole helper (D116–D118); brak semantyki rynku / SQL / DTO / RPC · feat **`9424dd8`** · PRODUCTION VERIFY.
**LFE-PUBLIC-API-01 (2026-07-31):** Root barrel = Freeze PUBLIC only (D119–D121); `@lastfootball/lfe/testing` barrel · `/advanced` defer · feat **`ce00327`** · PRODUCTION VERIFY.
**LFE-AGE-01 (2026-08-03):** Season Age++ H-AGE wired Confirm N+1 (D122); Season Transition Pipeline step 1 · feat **`6a54722`** · PRODUCTION VERIFY.
**LFE-LEAGUE-WORLD-02 (2026-08-03):** Tier-aware League Strength Profile + player skill→MatchSession map (D123); supersedes D92 · feat **`843bcfd`** · PRODUCTION VERIFY.
**LFE-CAREER-DECLINE-01 (2026-08-03):** Career Phase derive + Growth Gate + banded seasonal regress (D124); feat **`3c01baa`** · PRODUCTION VERIFY.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md) · [`AI/ARCHITECTURAL_DECISIONS.md`](./AI/ARCHITECTURAL_DECISIONS.md) · [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) · [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) · [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md) · [`game-design/GDD-SEASON-END-01.md`](./game-design/GDD-SEASON-END-01.md) · [`game-design/GDD-PROMOTION-01.md`](./game-design/GDD-PROMOTION-01.md) · [`game-design/GDD-SPONSORS-01.md`](./game-design/GDD-SPONSORS-01.md) · [`game-design/GDD-BOARD-01.md`](./game-design/GDD-BOARD-01.md) · [`game-design/GDD-STADIUM-01.md`](./game-design/GDD-STADIUM-01.md) · [`implementation/LFE-TRANSFERS-10-PLAN.md`](./implementation/LFE-TRANSFERS-10-PLAN.md) · [`implementation/LFE-PUBLIC-API-01-PLAN.md`](./implementation/LFE-PUBLIC-API-01-PLAN.md) · [`implementation/LFE-AGE-01-PLAN.md`](./implementation/LFE-AGE-01-PLAN.md) · [`implementation/LFE-LEAGUE-WORLD-02-PLAN.md`](./implementation/LFE-LEAGUE-WORLD-02-PLAN.md) · [`implementation/LFE-CAREER-DECLINE-01-PLAN.md`](./implementation/LFE-CAREER-DECLINE-01-PLAN.md)

## Last updated

2026-08-03 — LFE-CAREER-DECLINE-01 FULLY CLOSED · feat `3c01baa` · D1–D124
