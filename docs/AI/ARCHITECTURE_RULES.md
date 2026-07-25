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
| Terminarz ligowy   | `fixtures` → `FixtureDto` / `getNextFixture`                 |
| Saldo kasy         | `clubs.cash_balance`                                         |
| Historia finansów  | `finance_movements`                                          |
| Finance UI         | `resolveClubFinance(...)` → `ClubFinanceDto` wyłącznie       |
| Kadra (wiersze)    | tabela `players`                                             |
| Squad UI           | `resolveClubSquad(club, rows)` → `SquadDto` wyłącznie        |
| Okno transferów    | `clubs.transfer_window_open`                                 |
| Transfer market UI | `resolveTransferMarket(...)` → `TransferMarketDto` wyłącznie |
| Transfer deals     | `transfer_deals` (idempotency + audit)                       |
| Training UI        | `resolveClubTraining(...)` → `TrainingDto` wyłącznie         |
| Training day       | `clubs.last_training_on`                                     |
| Played unlock      | `hasPlayedUnlock(playedCount, threshold)`                    |
| Routing post-auth  | `getPostAuthPath` + middleware (club + first match)          |

## Hub rules (LFE-HUB-01)

- Hub dostępny **dopiero** po First Match.
- Hub = **ekran decyzji**, nie dashboard analytics.
- Dokładnie **1 Primary CTA**.
- Progressive disclosure — głębokie moduły soft-lock („wkrótce”); Liga + Finanse open na `SEASON`; **Transfery** gdy `SEASON` **i** `transfer_window_open`; **Trening** gdy `SEASON` **i** played ≥ 2.
- EARLY_CLUB: zero mid-season mock (`dashboardMock` / kolejka 12 / Top 4).

## Players rules (LFE-PLAYERS-01 / D19)

- Runtime klubu gracza **nigdy** nie woła `seedClubRoster` / `seedStarterSquad`.
- Seed = create / backfill / testy; AI = `seedBotSquad` / `seedOpponentSquad`.
- Pusta baza → `SquadUnavailableError` (bez fallbacku do seeda).
- Odejście = `DEPARTED` + `departed_at` (bez DELETE) — D20.
- Training mutuje wyłącznie `status` (D21) — bez drugiej tabeli kadry.

## Transfers rules (LFE-TRANSFERS-01 / D20 + E1/N1)

- `/transfers` konsumuje **tylko** `resolveTransferMarket()` — brak mocków rynku.
- Deal buy/sell: atomowa sekwencja na `players` + `cash_balance` + `finance_movements` + `transfer_deals`.
- Cash = SSOT salda; envelope = **derive** `resolveTransferEnvelope` (ratio 1) — nie druga kasa.
- Fee / ask = **tylko** `deriveTransferFee` — brak trwałego `market_value`.
- Buy negotiation (N1): **pure** `resolveNegotiationStep` — Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta; **stateless** (bez pending DB).
- Settlement buy: `completeTransferBuy(agreedAmount)` po rewalidacji ask / envelope / window / roster / funds.
- Sell: instant @ fee (bez nego).
- Buy ids = `t-{tag}-…`; katalog listingów = `seedTransferCatalogue()` (także dla AI).
- Unlock okna: `UNLOCK_AFTER_PLAYED=2` (Thin wyjątek vs GDD K11); shared `hasPlayedUnlock` (D21).
- Poza Thin: sell nego, 2+ counters, potential, live market DB, ratio ≠ 1, stored envelope.

## Training rules (LFE-TRAINING-01 / D21)

- `/training` konsumuje **tylko** `resolveClubTraining()` — brak mocków.
- Mutacje: `players.status` + `clubs.last_training_on` — **bez** `skill` / insert/delete.
- 1 sesja / dzień UTC; unlock played ≥ 2; bez zmian LFE.
- Poza Thin: indywidualny, plany, cash cost, skill growth, filtr XI.

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

## Last updated

2026-07-25 — LFE-TRANSFERS-02-N1 CLOSE
