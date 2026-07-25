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
| Routing post-auth  | `getPostAuthPath` + middleware (club + first match)          |

## Hub rules (LFE-HUB-01)

- Hub dostępny **dopiero** po First Match.
- Hub = **ekran decyzji**, nie dashboard analytics.
- Dokładnie **1 Primary CTA**.
- Progressive disclosure — głębokie moduły soft-lock („wkrótce”); Liga + Finanse open na `SEASON`; **Transfery** open gdy `SEASON` **i** `transfer_window_open`.
- EARLY_CLUB: zero mid-season mock (`dashboardMock` / kolejka 12 / Top 4).

## Players rules (LFE-PLAYERS-01 / D19)

- Runtime klubu gracza **nigdy** nie woła `seedClubRoster` / `seedStarterSquad`.
- Seed = create / backfill / testy; AI = `seedBotSquad` / `seedOpponentSquad`.
- Pusta baza → `SquadUnavailableError` (bez fallbacku do seeda).
- Odejście = `DEPARTED` + `departed_at` (bez DELETE) — D20.

## Transfers rules (LFE-TRANSFERS-01 / D20)

- `/transfers` konsumuje **tylko** `resolveTransferMarket()` — brak mocków rynku.
- Deal buy/sell: atomowa sekwencja na `players` + `cash_balance` + `finance_movements` + `transfer_deals`.
- Cash-only — **bez** envelope.
- Fee = derive (`deriveTransferFee`) — brak trwałego `market_value`.
- Buy ids = `t-{tag}-…`; katalog listingów = `seedTransferCatalogue()` (także dla AI).
- Unlock okna: `UNLOCK_AFTER_PLAYED=2` (Thin wyjątek vs GDD K11).
- Poza Thin: negotiation, potential, Training.

## REUSE FIRST / ZERO DUPLICATE

- Najpierw znajdź istniejący moduł / helper / API.
- Nie kopiuj logiki Engine/AI/statystyk do `apps/web`.
- Nie twórz drugiego SSOT dla tego samego faktu.

## GDD vs implementacja

- **GDD** = SSOT intencji produktu ([`GAME_DESIGN_DOCUMENT.md`](../game-design/GAME_DESIGN_DOCUMENT.md)).
- Świadomy wyjątek onboardingu: GDD §5.10 sugeruje Hub „nowy klub” przed meczem; **produkt live** używa First Match tunnel przed Hubem (LFE-MATCH-01). Dokumentuj wyjątek, nie „naprawiaj” GDD w kodzie bez Owner GO.
- Stałe ekonomii Thin (`ECONOMY_THIN`) są **tymczasowe** do GDD §26 (D18).
- Unlock okna transferów po 2 played = Thin wyjątek vs GDD K11 (D20).

Pełna lista decyzji: [`../DECISIONS.md`](../DECISIONS.md) · [`DECISIONS.md`](./DECISIONS.md).  
Filozofia: [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) · wzorce: [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md).

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
