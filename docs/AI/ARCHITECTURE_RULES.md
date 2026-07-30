# AI — Architecture Rules

## Cel

Twarde reguły architektoniczne dla implementacji. Nie łamać bez AUDIT + Owner GO.

## Warstwy

```
apps/web (Next.js UI + routing + Supabase clients)
    ↓ consumes
packages/lfe (headless Match Engine — no React/DOM/Supabase)
packages/domain (shared manager DTOs)
supabase/ (Auth + Postgres migrations)
```

## Match SSOT (LFE)

1. **`createMatch()` → `MatchSession`** — jedyny oficjalny entry meczu.
2. **`MatchState` + `EventBus`** — SSOT stanu i zdarzeń.
3. Mutacje tylko przez **CommandBus** / oficjalne API sesji.
4. **Canvas / Replay** czytają `MatchCanvasReadModel` — **nigdy** nie wołają Engine i nie mutują stanu.
5. **Live Bridge** (`LiveMatchRuntime`) spina LIVE pulse → buffer → Canvas; REPLAY odtwarza buffer.
6. First Match używa `createSessionFromFirstMatch(club, ourXi)` → ten sam `createMatch` (bez zmiany kontraktów silnika).

## Product SSOT (platform)

| Fakt               | SSOT                                                         |
| ------------------ | ------------------------------------------------------------ |
| Tożsamość klubu    | tabela `clubs` → `ClubDto`                                   |
| Odblokowanie Hub   | `clubs.first_match_completed_at`                             |
| Faza Hub           | `resolveHubPhase(club)` wyłącznie                            |
| Sesja Hub          | `resolveHubSession(phase, next, lastPlayed)`                 |
| Primary CTA Hub    | `resolvePrimaryCta(phase, session, ctx)` wyłącznie           |
| Daily Goal Hub     | `resolveClubDailyGoal(...)` → `ClubDailyGoalDto \| null`     |
| Achievements UI    | `resolveClubAchievements(...)` → `ClubAchievementsDto`       |
| Ranking UI         | `resolveClubRanking(...)` → `ClubRankingDto`                 |
| Terminarz ligowy   | `fixtures` → `FixtureDto` / `getNextFixture`                 |
| Saldo kasy         | `clubs.cash_balance`                                         |
| Historia finansów  | `finance_movements`                                          |
| Finance UI         | `resolveClubFinance(...)` → `ClubFinanceDto` wyłącznie       |
| Kadra (wiersze)    | tabela `players`                                             |
| Squad UI           | `resolveClubSquad(club, rows)` → `SquadDto` wyłącznie        |
| Academy UI         | `resolveClubAcademy(club, rows, phase)` → `AcademyDto`       |
| Scouting UI        | `resolveClubScouting(...)` → `ScoutingDto` wyłącznie         |
| Shortlist prefs    | `scout_shortlist` `(club_id, player_id)` → `players.id` only |
| Okno transferów    | `clubs.transfer_window_open`                                 |
| Transfer market UI | `resolveTransferMarket(...)` → `TransferMarketDto` wyłącznie |
| Transfer deals     | `transfer_deals` (idempotency + audit)                       |
| Pending H2H        | `transfer_offers` (Live; Thin presets + 1× Counter)          |
| Training UI        | `resolveClubTraining(...)` → `TrainingDto` wyłącznie         |
| Training day       | `clubs.last_training_on`                                     |
| Played unlock      | `hasPlayedUnlock(playedCount, threshold)`                    |
| Routing post-auth  | `getPostAuthPath` + middleware (club + first match)          |

## Hub rules (LFE-HUB-01)

- Hub dostępny **dopiero** po First Match.
- Hub = **ekran decyzji**, nie dashboard analytics.
- Dokładnie **1 Primary CTA**.
- Progressive disclosure — głębokie moduły soft-lock („wkrótce”); Liga + Finanse + **Akademia** + **Skauting** open na `SEASON`; **Transfery** gdy `SEASON` **i** `transfer_window_open`; **Trening** gdy `SEASON` **i** played ≥ 2.
- EARLY_CLUB: zero mid-season mock (`dashboardMock` / kolejka 12 / Top 4).

## Daily Goal rules (LFE-DAILY-01 / D25 / GDD §20)

- Hub konsumuje **tylko** `resolveClubDailyGoal()` jako sugestię warstwy 2 — **nie** Primary.
- Derive only: zakaz tabel quest/daily, cronów, nagród, mutacji domeny.
- **Primary CTA > Daily Goal** zawsze; matchday sync z kierunkiem meczu.
- ≠ `resolveSecondaryCtas` (daily **loop** nawigacji UI Evolution-02).
- REUSE: Hub session/Primary · fixtures · `last_training_on` + `utcDateString` · unlock treningu.
- Poza Thin: Quest Engine · persist/claim · streaki · nagrody §26 · inbox/push jako zależność.

## League calendar rules (LFE-LEAGUE-04 / D28 / GDD §10)

- `LEAGUE_FIXTURE_COUNT = 22` — jedyny SSOT długości sezonu.
- Jedyny planner = `planClubFixtures`; MD1–11 = identity LEAGUE-03; MD12–22 = rewanże.
- Top-up tylko brakujące MD; zero przebudowy istniejących wierszy.
- AI↔AI w tabeli = double RR (`planAiVsAiMatches`); nie Match Engine.
- OUT: Season End · awans/spadek · schedulery.

## Ranking rules (LFE-RANKING-01 / D27 / GDD §18)

- `/rankings` konsumuje **tylko** `resolveClubRanking()` — sezonowe porównanie klubów.
- Input = `LeagueTableDto` z `resolveLeagueTable` — **nie** druga logika punktów.
- DTO/UI **bez** points · W/D/L · bramek · ELO; pasma = enum; copy = `UI_COPY` (D29).
- ≠ tabela ligowa · ≠ §6 · ≠ Achievements · bieżący sezon only · derive only.

## Achievements rules (LFE-ACHIEVEMENTS-01 / D26 / GDD §19)

- `/achievements` konsumuje **tylko** `resolveClubAchievements()` — historia Information Thin.
- Derive only z faktów domeny; **zakaz** persist / XP / Achievement Score / ekonomii.
- Historia **immutable** względem trwałych faktów; ≠ Ranking · ≠ Daily Goal · ≠ §6.
- Poza Thin: katalog ID · fog discovery · muzeum · nagrody §26.

## Players rules (LFE-PLAYERS-01 / D19)

- Runtime klubu gracza **nigdy** nie woła `seedClubRoster` / `seedStarterSquad`.
- Seed = create / backfill / testy; AI = `seedBotSquad` / `seedOpponentSquad`.
- Pusta baza → `SquadUnavailableError` (bez fallbacku do seeda).
- Odejście = `DEPARTED` + `departed_at` (bez DELETE) — D20.
- Training mutuje `status` + `skill` (D21 / TRAINING-02) — bez drugiej tabeli kadry; atrybuty UI = derive(skill).
- Senior roster = `filterSeniorPlayers` (`academy_track = false`) — D23.

## Academy rules (LFE-ACADEMY-01 / D23)

- `/academy` konsumuje **tylko** `resolveClubAcademy()` — brak mocków poziomów/budżetu.
- Jedyny model = `players` + `academy_track` / `promoted_at` — zakaz drugiej tabeli / youth OVR.
- Intake max 3 perspektyw; Promote bez buffa skill/potential; potential = D22.
- Squad / Training / Transfers / Match development: **tylko filtr** `academy_track` — zero logiki akademii w tych resolverach.
- Poza Thin: poziomy akademii · cash-gate · trening akademii · auto-promote.

## Scouting rules (LFE-SCOUTING-01 / GDD §17 Thin B)

- `/scouting` konsumuje **tylko** `resolveClubScouting()` — porządkuje fakty; **nie** ocenia zawodnika za gracza.
- Jedyny model zawodnika = `players` (D19). REUSE: `resolveTransferMarket` · potential pasma · filtry Academy/senior.
- `scout_shortlist` = **wyłącznie** relacja `(club_id, player_id)` → `players.id` — **nie** drugi model zawodnika (brak skill/potential/score).
- Shortlista = prywatna organizacja pracy menedżera — **zero** wpływu na AI, rynek, transfery, potencjał, symulację.
- Poza Thin: fog · regiony · misje · koszty · personel · `scout_score` / AI ranking.

## Transfers rules (LFE-TRANSFERS-01 / D20 + E1/N1)

- `/transfers` konsumuje **tylko** `resolveTransferMarket()` — brak mocków rynku.
- Deal buy/sell: atomowa sekwencja na `players` + `cash_balance` + `finance_movements` + `transfer_deals`.
- Cash = SSOT salda; envelope = **derive** `resolveTransferEnvelope` (ratio 1) — nie druga kasa.
- Fee / ask = **tylko** `deriveTransferFee` — brak trwałego `market_value`.
- Buy negotiation (N1): **pure** `resolveNegotiationStep` — Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta; **stateless** (bez pending DB).
- Incoming AI (TRANSFERS-03…05): **pure** `resolveIncomingOffers` — derive C; opening = NEGOTIATION_THIN % ask; listed + eligible only.
- Seller negotiation (TRANSFERS-05 S2): **pure** `resolveSellerNegotiationStep` — Counter tylko vs AI Low; Instant Sell @ 100% ask bez nego; **nie** rozszerza buy step.
- Listing (TRANSFERS-04): `players.transfer_listed_at`; List/Unlist; Incoming / Live tylko listed; shared `isTransferSellEligible`; sell clears listed.
- Live H2H (TRANSFERS-06): Instant Buy @ 100% ask; `players.id` niezmienne; atomowy `complete_live_h2h_transfer` tylko z `completeTransferBuy`/`Sell` (source live); seed catalogue = fallback; brak `completeLiveTransfer()`.
- Pending H2H (TRANSFERS-07): jedyna tabela `transfer_offers`; Instant równolegle; kwoty NEGOTIATION_THIN; Create/Reject/Withdraw bez cash/players/deals; Accept/Instant/Unlist supersede pending w tej samej TX; brak escrow/timeout/AI pending.
- Counter H2H (TRANSFERS-08): 1× Counter wyłącznie Seller; po Counter Accept = Buyer; `opening_amount` immutable; settle @ `current_amount`; Counter RPC `FOR UPDATE` mutuje tylko `current_amount`/`phase`/`last_actor`; Reject: opening→seller, countered→buyer.
- Settlement buy: `completeTransferBuy` (seed **lub** live) po rewalidacji.
- Settlement sell: `completeTransferSell` (instant void **lub** live) + `isAllowedAgreedAmount`.
- Buy ids seed = `t-{tag}-…`; katalog = `seedTransferCatalogue()` (fallback).
- Unlock okna: `UNLOCK_AFTER_PLAYED=2` (Thin wyjątek vs GDD K11); shared `hasPlayedUnlock` (D21).
- Poza Thin: AI clubs, Instant Sell nego, custom ask, 2+ counters, buyer Counter, timeout / AI pending inbox, escrow, potential, ratio ≠ 1, stored envelope, `completeLiveTransfer()`.

## Training rules (LFE-TRAINING-01/02 / D21)

- `/training` konsumuje **tylko** `resolveClubTraining()` — brak mocków.
- Mutacje: `players.status` + `players.skill` + `clubs.last_training_on` — atomowo via RPC `complete_training_session`.
- Efekty pure: `applyTrainingSessionEffects` (anti-farm: +1 / K=3 / ceiling ≥85 high-only).
- XI Gate: INJURED/SUSPENDED hard block; TIRED warning ≥4; kick-off hard fail (bez LFE skill/fatigue).
- 1 sesja / dzień UTC; unlock played ≥ 2; bez zmian LFE.
- Poza Thin: indywidualny, plany, cash cost, XP, potential, attribute DB, kontuzje treningowe.

## REUSE FIRST / ZERO DUPLICATE

- Najpierw znajdź istniejący moduł / helper / API.
- Nie kopiuj logiki Engine/AI/statystyk do `apps/web`.
- Nie twórz drugiego SSOT dla tego samego faktu.

## GDD vs implementacja

- **GDD** = SSOT intencji produktu ([`GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md)).
- Świadomy wyjątek onboardingu: GDD §5.10 sugeruje Hub „nowy klub” przed meczem; **produkt live** używa First Match tunnel przed Hubem (LFE-MATCH-01). Dokumentuj wyjątek, nie „naprawiaj” GDD w kodzie bez Owner GO.
- Stałe ekonomii Thin (`ECONOMY_THIN`, w tym `TRANSFER_FEE`) = GDD **§26** (D18/D20; GDD-§26B).
- Unlock okna transferów / treningu po 2 played = Thin (D20 / D21).
- Dzień treningu = UTC date (Thin vs GDD timezone gracza) — D21.

Pełna lista decyzji: [`../DECISIONS.md`](../DECISIONS.md) · [`DECISIONS.md`](./DECISIONS.md).  
Filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) · wzorce: [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md).  
Transfery (głębiej): [`../platform/TRANSFER_ARCHITECTURE.md`](../platform/TRANSFER_ARCHITECTURE.md).

## Last updated

2026-07-30 — LFE-LEAGUE-04 · D28
