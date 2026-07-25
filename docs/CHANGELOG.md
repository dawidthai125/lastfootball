# Changelog (docs SSOT index)

## Cel dokumentu

Historia istotnych zmian projektu widziana z perspektywy dokumentacji SSOT.  
SzczegĂłĹ‚y Keep-a-Changelog: takĹĽe root [`CHANGELOG.md`](../CHANGELOG.md).

## Aktualny stan

Production feature baseline **`8824793`** (LFE-TRANSFERS-06) â€” tip may be docs after feat.

---

## [2026-07-26] â€” LFE-TRANSFERS-06 Â· CLOSED

### Product

- Live H2H Instant Buy @ 100% ask â€” Humanâ†”Human; brak AI clubs / pending / timeout
- PodaĹĽ = `players.transfer_listed_at`; brak tabeli listingĂłw; `players.id` niezmienne
- Atomowy RPC `complete_live_h2h_transfer`; settlement tylko `completeTransferBuy`/`Sell` (source live)
- Seed Catalogue = fallback; UI tylko `resolveTransferMarket` (`liveListings`)
- Feature baseline â†’ **`8824793`** (LFE-TRANSFERS-06)

---

## [2026-07-26] â€” LFE-TRANSFERS-05 Â· CLOSED

### Product

- Seller negotiation Thin (Incoming S2): `resolveSellerNegotiationStep` pure; reuse NEGOTIATION_THIN
- Instant Sell @ 100% ask â€” bez nego; `resolveNegotiationStep` pozostaje BUY-only
- Settlement: `completeTransferSell(agreedAmount)` + `isAllowedAgreedAmount`; idempotentne
- PeĹ‚na rewalidacja przed settle (ask / allow-list / eligibility / listed / window / roster / GK)
- Brak nowych tabel / pending / timeoutĂłw; UI tylko `resolveTransferMarket`
- Feature baseline â†’ **`4b58507`** (LFE-TRANSFERS-05)

---

## [2026-07-26] â€” LFE-TRANSFERS-04 Â· CLOSED

### Product

- `players.transfer_listed_at` â€” List/Unlist (idempotent); brak nowych tabel
- Ask listingu = `deriveTransferFee`; Instant Sell zostaje
- Incoming tylko dla listed; shared `isTransferSellEligible`
- `completeTransferSell` czyĹ›ci `transfer_listed_at`; okno nie czyĹ›ci listy
- UI tylko `resolveTransferMarket` (`listedPlayers` + flag `listed`)
- Feature baseline â†’ **`de23db6`** (LFE-TRANSFERS-04)

---

## [2026-07-25] â€” LFE-TRANSFERS-03 Â· CLOSED

### Product

- Derived AIâ†’player offers (`resolveIncomingOffers`) â€” persistence C; brak migracji / pending / timeout / inbox
- Oferta = **100%** `deriveTransferFee`; Accept / Reject only
- Accept â†’ `completeTransferSell` (bez `agreedAmount`); peĹ‚na rewalidacja w settlement
- Stabilne `offerId` = `in-{clubTag}-{playerId}`
- Feature baseline â†’ **`4f69b5d`** (LFE-TRANSFERS-03)

---

## [2026-07-25] â€” LFE-TRANSFERS-02-N1 Â· CLOSED

### Product

- Stateless buy negotiation Thin â€” brak migracji / pending DB / timeoutĂłw
- Pure `resolveNegotiationStep`: Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta
- Settlement: `completeTransferBuy(agreedAmount)` + peĹ‚na rewalidacja (ask / envelope / window / roster / funds)
- SSOT: `cash_balance`; ask = `deriveTransferFee`; envelope = `resolveTransferEnvelope`
- Sell bez zmian (instant @ fee)
- Feature baseline â†’ **`8d9d772`** (LFE-TRANSFERS-02-N1)

---

## [2026-07-25] â€” LFE-TRANSFERS-02-E1 Â· CLOSED

### Product

- `ECONOMY_THIN.ENVELOPE_RATIO = 1` â†’ envelope === cash (Thin)
- **Jedyny** wzĂłr: `resolveTransferEnvelope(cashBalance)` â€” brak lokalnego `cash Ă— ratio`
- `/finance`, `resolveTransferMarket`, `completeTransferBuy` konsumujÄ… wyĹ‚Ä…cznie ten helper
- Brak migracji / kolumny / tabeli; cash = SSOT salda; Negotiation poza scope
- Feature baseline â†’ **`0fad4a9`** (LFE-TRANSFERS-02-E1)

---

## [2026-07-25] â€” LFE-LEAGUE-03 Â· CLOSED

### Product

- `LEAGUE_FIXTURE_COUNT = 11` (single RR vs 11 AI catalog)
- Sole plan: `planClubFixtures` â€” no second generator
- `ensureClubFixtures` + pure `resolveFixtureTopUp` â€” deterministyczny top-up MD brakujÄ…cych
- Top-up identity = peĹ‚ny plan 11; brak nadpisu played/upcoming; unique `(club_id, matchday)`
- `resolveLeagueTable` / `completeFixture` / unlocki transfer+trening **bez zmian kontraktu**
- Thin vs GDD Â§10: 11 â‰  22 (Future)
- Feature baseline â†’ **`617d3c2`** (LFE-LEAGUE-03)

---

## [2026-07-25] â€” GDD-Â§26B Â· CLOSED

### Code sync

- `ECONOMY_THIN` = GDD Â§26 (starter / W/D/L / CURRENCY)
- `ECONOMY_THIN.TRANSFER_FEE` â€” wspĂłlne wspĂłĹ‚czynniki fee; `deriveTransferFee` tylko stÄ…d
- Jedno `CURRENCY` (usuniÄ™te z `TRANSFERS_THIN`)
- Testy `economy01` + `transfers01` zaktualizowane
- D18/D20 bez zmiany architektury; feature baseline pozostaje `10de062`

---

## [2026-07-25] â€” GDD-Â§26A Â· CLOSED

### Docs

- GDD Â§26 wypeĹ‚niony: SSOT liczb Thin (Wariant A â€” promocja live)
- Waluta EUR Â· starter 100â€Ż000 Â· W/D/L 5â€Ż000 / 2â€Ż500 / 1â€Ż000 Â· fee derive (skill/age + floor 25â€Ż000)
- Jawne: Â§26 = SSOT produktu (liczby); D18/D20 = SSOT implementacji
- OUT: envelope, pensje, bilety, sponsorzy, Premium, soft/hard, training cash
- Sync kodu = **GDD-Â§26B** (nastÄ™pny etap); feature baseline pozostaje `10de062`

---

## [2026-07-25] â€” LFE-TRAINING-01 Â· CLOSED

### Product

- `resolveClubTraining()` â†’ `TrainingDto` = jedyny kontrakt UI treningu
- `clubs.last_training_on` = SSOT dnia ostatniej sesji (UTC date)
- Mutacje tylko `players.status` (bez `skill`, bez zmian liczebnoĹ›ci kadry)
- Unlock po 2 played; shared `hasPlayedUnlock` (reuse Transfers ensure)
- 1 sesja / dzieĹ„ UTC; `already_trained_today`; `/training` bez mockĂłw
- **D21** CLOSED
- Prod commit `10de062`; migracja `20260725100000` applied; CI GREEN; Production Verify PASS

---

## [2026-07-25] â€” AI-DOCS-HYGIENE-01 Â· CLOSED

### Docs

- Unified pipeline: AUDITâ†’â€¦â†’PUSHâ†’**CI**â†’CLOSE
- `ARCHITECTURE_PRINCIPLES` Â· `COMMON_PATTERNS` Â· `ENGINEERING_GUIDE`
- Platform split: LEAGUE Â· FINANCE Â· PLAYERS Â· TRANSFERS; slim HUB
- Feature baseline vs documentation tip policy
- README + docs/README synced; status mirrors reduced (ROADMAP = EPIC list SSOT)

---

## [2026-07-25] â€” LFE-TRANSFERS-01 Â· CLOSED

### Product

- `resolveTransferMarket()` â†’ `TransferMarketDto` = jedyny kontrakt UI rynku
- `clubs.transfer_window_open` = SSOT okna; unlock po 2 played (`UNLOCK_AFTER_PLAYED=2` â€” Thin vs GDD K11)
- Deal buy/sell: `players` + `cash_balance` + `finance_movements` + `transfer_deals` (`completed_at`)
- Buy ids `t-{tag}-â€¦`; sell = `DEPARTED` + `departed_at` (bez DELETE); fee = derive (brak `market_value`)
- Katalog: `seedTransferCatalogue()`; cash-only (bez envelope / negotiation / potential / training)
- Nav Transfery open gdy `SEASON` + okno; `/transfers` bez mockĂłw
- **D20** CLOSED
- Prod commit `393a43c`; prettier `7c0ce7f`; migracja applied; CI GREEN

---

## [2026-07-25] â€” LFE-PLAYERS-01 Â· CLOSED

### Product

- Tabela `players` = SSOT kadry klubu gracza (RLS); ids `s-{tag}-â€¦`; `version` default `1`
- Status domenowy: `READY` | `INJURED` | `SUSPENDED` | `TIRED` (lokalizacja w UI)
- `resolveClubSquad(club, rows)` â†’ `SquadDto` = jedyny kontrakt UI; brak fallbacku do seeda
- Seed (`seedClubRoster`) tylko create/backfill/testy; AI = `seedBotSquad` / `seedOpponentSquad`
- First Match + liga: nasz XI z DB; `/squad` + `/players/[id]` z resolvera
- D16 superseded by **D19**
- Prod commit `0b960b5`; prettier `d43fa3d`; migracja applied; CI GREEN

---

## [2026-07-25] â€” LFE-ECONOMY-01 Â· CLOSED

### Product

- `clubs.cash_balance` = SSOT salda; `finance_movements` = historia
- `resolveClubFinance()` â†’ `ClubFinanceDto` = jedyny kontrakt UI (pole `currency`)
- Seed `STARTER_CASH=100000` przy create club; nagroda W/D/L przy pierwszym `played`
- `/finance` bez mocka; Nav/Secondary Finanse + Hub chip kasy na `SEASON`
- Post Match: jedna linia nagrody (league)
- StaĹ‚e Thin tymczasowe do GDD Â§26 (`ECONOMY_THIN`)
- Prod commit `a70cf81`; migracja applied; CI + Vercel GREEN

---

## [2026-07-25] â€” LFE-LEAGUE-02 Â· CLOSED

### Product

- `resolveLeagueTable(club, fixtures)` â†’ `LeagueTableDto` = jedyne ĹşrĂłdĹ‚o tabeli (brak standings DB)
- AIâ†”AI = deterministyczny derive (nie Match Engine)
- Hub â†’ `SEASON` via S1 (`first_match_completed` + `fixtures.length > 0`); jeden layout Hub
- `/league` zasilane wyĹ‚Ä…cznie resolverem; Nav Liga open na SEASON
- Chip pozycji (jedna linia) z `resolvePlayerLeaguePositionLabel`
- Generator nadal 3 fixtures (bez zmian vs LEAGUE-01)
- Prod commit `71ce442`; CI + Vercel GREEN

---

## [2026-07-24] â€” LFE-LEAGUE-01 Thin A Â· CLOSED

### Product

- Tabela `fixtures` (RLS) + `opponent_club_id` katalog AI
- Generator 3 meczĂłw (`ensureClubFixtures`) po First Match
- Hub Primary â†’ â€žPrzygotuj meczâ€ť / Match Pipeline reuse / `completeFixture`
- Squad SSOT (`resolveClubSquad`) â€” bez `@/data/squad` na Ĺ›cieĹĽce produktowej
- Faza Hub pozostaje `EARLY_CLUB` (bez SEASON / tabeli ligowej)
- Prod commit `b5b64a3`; migracja applied; CI + Vercel GREEN

---

## [2026-07-24] â€” LFE-DOCS-01

### Docs

- Konsolidacja onboarding AI: `AGENTS.md`, `docs/AI/*`, `MASTER_HANDOFF.md`
- Platform docs: onboarding / first match / hub
- Sync status, roadmap, architecture, connection, decisions D13â€“D14
- Archive: historyczny `product/overview.md`

---

## [2026-07-24] â€” LFE-HUB-01 / LFE-MATCH-01 / LFE-PLATFORM-01 (code on main)

### Product

- First Match tunnel + `first_match_completed_at`
- Hub EARLY_CLUB decision screen
- Club Wizard + Club DTO + Supabase rebind

---

## [2026-07-24] â€” GDD-15

### Docs (SSOT FIRST)

- WypeĹ‚niony Â§20 Zadania dzienne: opcjonalne; 1 cel dnia na Hubie
- Mecz > zadanie w dniu meczowym; soft FOMO; brak kar / obowiÄ…zkowego loginu / P2W
- Nagrody = kategorie (Â§14 / Â§19 / Â§26); bez liczb
- Cross-refs: Â§3.10, Â§23, Â§21, Â§22
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] â€” GDD-14

### Docs (SSOT FIRST)

- WypeĹ‚niony Â§23 Panel gĹ‚Ăłwny (Hub): ekran decyzji, nie dashboard
- DokĹ‚adnie 1 Primary CTA; maksymalnie 5 Secondary CTA
- Hierarchia: mecz â†’ zadanie dnia â†’ status Â§6 â†’ skrĂłty â†’ pomocnicze
- Stany: nowy klub / dzieĹ„ meczowy / po meczu / idle
- Cross-refs: Â§3.11, Â§6.16, Â§9.15, Â§24
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] â€” GDD-13

### Docs (SSOT FIRST)

- WypeĹ‚niony Â§6 RozwĂłj klubu: Poziom klubu Â· Reputacja Â· PrestiĹĽ
- ĹaĹ„cuch: sport â†’ prestiĹĽ â†’ reputacja â†’ atrakcyjnoĹ›Ä‡; Poziom = rozwĂłj organizacji
- Soft caps, unlocki jakoĹ›ciowe, stadion = Â§13 / rozbudowa Future
- Cross-refs w Â§7.17, Â§11.16, Â§12.8, Â§13.8, Â§15.8, Â§18, Â§19 (bez duplikacji definicji)
- Sync: `CURRENT_DESIGN`, `game-design/ROADMAP`, status, handoff

---

## [2026-07-24] â€” LFE-PLAYER-RATINGS-01

### Web

- Pure derive ocen XI (1.0â€“10.0) + MVP w Post Match (`player-ratings.ts`)
- `PostMatchSummary.ratings` / `mvpPlayerId`; UI lista ocen + badge MVP
- Bez zmian LFE / Engine / Canvas / Replay

### Docs

- `MATCH_UI_PIPELINE`, status, roadmap, handoff, changelog

---

## [2026-07-24] â€” AI-DOCS-CONSOLIDATION-01

### Docs (bez nowych plikĂłw SSOT)

- Rozszerzony `AI-HANDOFF.md`: wolno/nie wolno, REUSE FIRST, workflow, raporty, WIP/docs
- `WORKFLOW.md`, `CODING_STANDARDS.md`, `RELEASE_PROCESS.md` â€” proces Agenta
- `web/MATCH_UI_PIPELINE.md` â€” status na `main` + Live Bridge
- Disclaimery: `product/overview.md`, `architecture/foundation.md`, root `CHANGELOG.md`

---

## [2026-07-24] â€” LFE-DOCS-SYNC-01

### Docs

- Synchronizacja statusu po wdroĹĽeniu Canvas / Replay / Post Match / Live Bridge
- `AI-HANDOFF.md`, `HANDOFF.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `lfe/CURRENT_STATUS.md`
- Nowe: `lfe/GAMEPLAY_MATCH_STACK.md`, `web/MATCH_UI_PIPELINE.md`, `API.md`

### Code on `main` (match pipeline)

|     | Hash      | Opis                                                    |
| --- | --------- | ------------------------------------------------------- |
| â€” | `4d43661` | feat(lfe): player match statistics and event playerId   |
| â€” | `fbbebea` | chore(ci): apply prettier across repository             |
| â€” | `d752d22` | feat(web): add match canvas renderer                    |
| â€” | `cf1d68c` | feat(web): add match replay buffer and controller       |
| â€” | `b25f479` | feat(web): add post-match summary and view              |
| â€” | `33618e9` | feat(web): wire live match canvas replay and post-match |

---

## [2026-07-24] â€” LFE-PLAYER-MATCH-DATA-01

### LFE

- `MatchState.statistics.players` inicjalizowane dla peĹ‚nego rosteru
- Deterministyczna atrybucja `attribute-player.ts` (bez RNG)
- Optional `playerId` na payloadach `GOAL` / `SHOT` / `FOUL`
- Bump `PlayerStatistics`: `goals`, `shots`, `foulsCommitted`
- `TeamStatistics` i drabina RNG bez zmian semantycznych

---

## [2026-07-23] â€” RELEASE Aâ€“C (gameplay + UI)

### Code on `main`

|     | Hash      | Opis                             |
| --- | --------- | -------------------------------- |
| A   | `e449400` | feat(lfe): gameplay stack 0.9.1  |
| B   | `4493687` | feat(web): UI refresh 0.9.1      |
| C   | `bfce09f` | feat(web): live match experience |

---

## [2026-07-23] â€” LFE Architecture Freeze release + GDD docs

### Added

- LFE EPIC-1â€¦7 (foundation â†’ positioning)
- `docs/lfe/LFE_ARCHITECTURE_FREEZE.md` (PUBLIC API v1)
- `docs/game-design/*` (GDD + UI guide)
- Docs SSOT suite (`PROJECT_*`, `HANDOFF`, LFE/GDD indexes)

### Commits (Aâ€“G)

| Commit | Hash (short) | Opis                                       |
| ------ | ------------ | ------------------------------------------ |
| A      | `735a7b2`    | feat(lfe): epic1 + systems                 |
| B      | `7c1960d`    | feat(lfe): epic2 domain                    |
| C      | `a4e6477`    | feat(lfe): epic3 state machine             |
| D      | `a0e2ed2`    | feat(lfe): epic5 commands                  |
| E      | `95501e4`    | feat(lfe): session + positioning + surface |
| F      | `3dd3029`    | docs(lfe): epics + freeze                  |
| G      | `5d37de9`    | docs(gdd): phase 2 SSOT                    |

---

## [2026-07-21] â€” Foundation / infra

- Monorepo Next.js + LFE stub + domain
- Supabase / Vercel / CI bootstrap

## NajwaĹĽniejsze decyzje

Changelog docs nie zastÄ™puje freeze ani GDD â€” tylko chronologia.

## PowiÄ…zania

Root [`CHANGELOG.md`](../CHANGELOG.md) Â· [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-25 â€” AI-DOCS-HYGIENE-01
