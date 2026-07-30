# Changelog (docs SSOT index)

## Cel dokumentu

Historia istotnych zmian projektu widziana z perspektywy dokumentacji SSOT.  
SzczegÃ³Åy Keep-a-Changelog: takÅ¼e root [`CHANGELOG.md`](../CHANGELOG.md).

## Aktualny stan

**Production Baseline (UI P0):** **`54d0724`** (LFE-UI-IMPL-06).  
**Domain feature baseline:** **`46f7caa`** (LFE-SOFTLOCK-01).
**Presentation tip:** **`9fd14fc`** (LFE-UI-MOTION-01).
**Documentation tip:** **`089b2d3`** — LFE-SOFTLOCK-01 CLOSE (pin)
Master handoff: [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md).

---

## [2026-07-30] â LFE-SOFTLOCK-01 Â· CLOSED

### Product

- Generyczny `SoftLockRouteGate` â route access â¡ nav (`resolveNavAccess` / `isModuleSoftLocked` Â· `FLAT_NAV`).
- Kanoniczna powierzchnia locked = `SoftLockState` (D65); pass-through poza nav (D67).
- Strip Fake Production z `/sponsors` Â· `/board` Â· `/stadium` (D52 Â· D64).
- Domain tip â **`46f7caa`** Â· D52 Â· D63âD67 CLOSED Â· style Prettier **`90be8f2`**.

### Docs

- Sync SSOT: DECISIONS Â· HANDOFF Â· ROADMAP Â· CHANGELOG Â· baseline Â· status Â· EPIC_INDEX Â· AI_QUICK_START.

## [2026-07-30] â LFE-CLUB-01 Â· CLOSED

### Product

- `resolveClubProfile` derive only Â· Composition z ClubDto Â· starter Â· cash Â· league position
- `/club` bez PlaceholderPage / âPodglÄd UIâ / personelu / silnika Â§6
- `ClubProfileView` = presentation only (D50)
- Domain tip â **`36ba9be`** Â· D47âD51 CLOSED
- CI GREEN Â· PRODUCTION VERIFIED

### Docs

- Sync CLUB Â· CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· DECISIONS D47âD51 Â· EPIC_INDEX

---

## [2026-07-30] â LFE-MESSAGES-01 Â· CLOSED

### Product

- `resolveClubMessages` derive only (E1âE3) Â· brak DB / workflow / Accept
- `/messages` + Overlay = ta sama `ClubMessagesDto` (D43)
- UsuniÄte runtime mocki: hardcoded inbox Â· MessagesPreview Â· MOCK_NOTIFICATIONS Â· staÅy badge
- Domain tip â **`800ed0d`** Â· D40âD46 CLOSED
- CI GREEN Â· PRODUCTION VERIFIED

### Docs

- Sync MESSAGES Â· CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· DECISIONS D40âD46 Â· EPIC_INDEX

---

## [2026-07-30] â LFE-TRANSFERS-09 Â· CLOSED

### Product

- TD-01 CLOSED: SQL helpers `derive_transfer_fee_thin` / `is_allowed_transfer_amount_thin` + Vitest parity gate
- TD-02 CLOSED: Live Instant/Accept = jeden settle invoke (Single Settlement Path)
- D38: publiczne API Buy/Sell + RPC Args bez breaking change
- Domain tip â **`e6885dc`** Â· migracja `20260730150000_transfer_fee_parity_helpers.sql` na prod
- CI GREEN Â· PRODUCTION VERIFIED Â· TD-03+ pozostaje P2

### Docs

- Sync TRANSFER_ARCHITECTURE Â· CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· DECISIONS D38 Â· EPIC_INDEX

---

## [2026-07-30] â LFE-LEAGUE-04 Â· CLOSED

### Product

- Kalendarz ligowy **22** kolejki (double RR Â· GDD Â§10)
- `planClubFixtures` Â· MD1â11 identity LEAGUE-03 Â· MD12â22 rewanÅ¼e Â· top-up istniejÄcych klubÃ³w
- AIâAI double RR w `planAiVsAiMatches` (seed `ai-v2`)
- Domain tip â **`9027baf`** Â· D28 Â· brak migracji schematu
- CI GREEN Â· PRODUCTION VERIFIED Â· next **Transfers hardening READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· LEAGUE Â· DECISIONS Â· EPIC_INDEX

---

## [2026-07-30] â LFE-RANKING-01 Â· CLOSED

### Product

- Ranking Information Thin: `resolveClubRanking` Â· sezonowe porÃ³wnanie klubÃ³w na `/rankings`
- Input = `resolveLeagueTable` Â· wÅasny DTO Â· bez points/WDL/goals/ELO Â· pasma via UI_COPY (D29)
- Domain tip â **`bf86749`** Â· D27 Â· brak migracji
- CI GREEN Â· PRODUCTION VERIFIED Â· next **Full 22-fixture season READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· ARCHITECTURE_RULES Â· DECISIONS Â· MODULE_MAP Â· EPIC_INDEX Â· QUICK_START

---

## [2026-07-30] â LFE-ACHIEVEMENTS-01 Â· CLOSED

### Product

- Achievements Information Thin: `resolveClubAchievements` Â· historia kamieni na `/achievements`
- Derive only Â· immutable history Â· brak XP / score / ekonomii Â· â  Ranking Â· â  Daily Â· â  Â§6
- Domain tip â **`3915be9`** Â· D26 Â· brak migracji
- CI GREEN Â· PRODUCTION VERIFIED Â· next **LFE-RANKING-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· ARCHITECTURE_RULES Â· DECISIONS Â· MODULE_MAP Â· EPIC_INDEX Â· QUICK_START

---

## [2026-07-30] â LFE-DAILY-01 Â· CLOSED

### Product

- Daily Goal Thin: `resolveClubDailyGoal` Â· sugestia Information Thin na Hubie pod Primary
- Derive only Â· Primary CTA nadrzÄdny Â· brak persist / Quest Engine / mutacji / ekonomii
- Domain tip â **`73e1361`** Â· D25 Â· brak migracji
- CI GREEN Â· PRODUCTION VERIFIED Â· next **LFE-ACHIEVEMENTS-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· HUB Â· ARCHITECTURE_RULES Â· DECISIONS Â· MODULE_MAP Â· EPIC_INDEX Â· QUICK_START

---

## [2026-07-30] â LFE-SCOUTING-01 Â· CLOSED

### Product

- Scouting Information Thin: `resolveClubScouting` Â· prywatna shortlista Â· REUSE `resolveTransferMarket` + potential
- `scout_shortlist` = wyÅÄcznie `(club_id, player_id)` â `players.id` â **nie** drugi model zawodnika
- Shortlista **nie** wpÅywa na AI, rynek, transfery, potencjaÅ ani symulacjÄ
- Domain tip â **`93fd6d5`** Â· migracja `20260730140000_scout_shortlist.sql` na prod
- CI GREEN Â· PRODUCTION VERIFIED Â· next **LFE-DAILY-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· ARCHITECTURE_RULES Â· PLAYERS Â· EPIC_INDEX Â· QUICK_START

---

## [2026-07-30] â GDD-22 Â· CLOSED

### Docs

- Â§22 Powiadomienia Thin w `GAME_DESIGN_DOCUMENT.md` (polityka alertÃ³w Â· zaproszenie â  wymuszenie Â· opt-out â  utrata info Â· Soft FOMO Â· opt-in Â· dedup; â  Â§21; push/email/SDK = Future)
- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· EPIC_INDEX Â· QUICK_START Â· game-design
- Documentation tip â **`f871ca8`** (CLOSE sync; content `09b85e7`)
- CI GREEN Â· PRODUCTION VERIFIED Â· brak zmian kodu aplikacji
- Next: **LFE-SCOUTING-01** (pÃ³Åºniej CLOSED)

---

## [2026-07-30] â GDD-21 Â· CLOSED

### Docs

- Â§21 WiadomoÅci Thin w `GAME_DESIGN_DOCUMENT.md` (inbox Â· skutek zdarzenia Â· Transfery SSOT ofert Â· CTA do istniejÄcych ekranÃ³w; â  push/Â§22)
- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· EPIC_INDEX Â· QUICK_START Â· game-design README
- Documentation tip â **`c24efef`** (CLOSE sync; content `bf07a44`)
- CI GREEN Â· PRODUCTION VERIFIED Â· brak zmian kodu aplikacji
- Next: **GDD-22 READY FOR AUDIT**

---

## [2026-07-30] â LFE-ACADEMY-01 Â· CLOSED

### Product

- Academy Thin A: `players.academy_track` / `promoted_at` Â· `resolveClubAcademy` Â· Intake (max 3) Â· Promote
- Senior filters w squad / training / transfers / match development Â· nav open SEASON
- Domain tip â **`9c6fe86`** Â· D23 Â· migracja `20260730120000_academy_track.sql` na prod
- CI GREEN Â· PRODUCTION VERIFIED Â· next **M2.5**

### Docs

- Sync CURRENT_BASELINE Â· HANDOFF Â· PROJECT_STATUS Â· ROADMAP Â· ARCHITECTURE_RULES Â· DECISIONS Â· PLAYERS Â· EPIC_INDEX Â· QUICK_START

---

## [2026-07-30] â GDD-19 Â· CLOSED

### Docs

- Â§19 OsiÄgniÄcia Thin w `GAME_DESIGN_DOCUMENT.md` (kamienie / historia; â  Â§6 / Â§18; Â§20 hook â  katalog; bez XP/progÃ³w)
- Sync CURRENT_DESIGN Â· game-design ROADMAP/README Â· handoff / baseline / PROJECT_STATUS / ROADMAP
- Documentation tip â **`2c619ca`** (CLOSE sync; content `fcbbe3c`)
- CI GREEN Â· PRODUCTION VERIFIED Â· brak zmian kodu aplikacji
- Next: **GDD-21 READY FOR AUDIT**

---

## [2026-07-30] â GDD-18 Â· CLOSED

### Docs

- Â§18 Ranking Thin w `GAME_DESIGN_DOCUMENT.md` (sezonowy ranking klubÃ³w; â  Â§6 / Â§10 / Â§17; Â§19 OUT; bez liczb/ELO)
- Sync CURRENT_DESIGN Â· game-design ROADMAP/README Â· handoff / baseline / PROJECT_STATUS / ROADMAP
- Documentation tip â **`4dedd71`** (CLOSE sync; content `84b7f4d` Â· prettier `a8236df`)
- CI GREEN Â· PRODUCTION VERIFIED Â· brak zmian kodu aplikacji
- Next: **GDD-19 READY FOR AUDIT**

---

## [2026-07-30] â LFE-UI-MOTION-01 Â· CLOSED

### Presentation

- Shared CSS motion Thin (`styles/motion.css`) Â· Hub decision enter / Primary press Â· Match Goal/Final overlay
- Guide Â§8 Motion kontrakt Â· ZERO DUPLICATE Â· reduced-motion Â· CSS-only
- Presentation tip â **`9fd14fc`**
- CI GREEN Â· PRODUCTION VERIFIED Â· bez zmian domeny / resolverÃ³w / LFE

---

## [2026-07-29] â GDD-17 Â· CLOSED

### Docs

- Â§17 Skauting Information Thin B w `GAME_DESIGN_DOCUMENT.md` (system informacji; shortlista prywatna; D19/D20/D22 bez zmian)
- Sync CURRENT_DESIGN Â· game-design ROADMAP/README Â· handoff / baseline / PROJECT_STATUS
- Documentation tip â **`2595cc9`**
- CI GREEN Â· PRODUCTION VERIFIED Â· brak zmian kodu aplikacji

---

## [2026-07-29] â GDD-16 Â· CLOSED

### Docs

- Â§16 Akademia Thin A (Intake + Promote) w `GAME_DESIGN_DOCUMENT.md`
- Sync CURRENT_DESIGN Â· game-design ROADMAP Â· PLAYERS.md
- Documentation tip â **`4805f7e`**

---

## [2026-07-29] â LFE-PLAYERS-02 Â· CLOSED

### Product

- Player Development Thin: `players.potential` + match growth (PRIMARY) + training ceiling
- Domain tip â **`cd222ba`**
- Operacyjne: Migracja `20260729120000_player_potential_development.sql` na prod

### Docs

- D22 Â· PLAYERS.md Â· TRAINING.md Â· ROADMAP Â· CURRENT_BASELINE Â· PROJECT_STATUS Â· HANDOFF Â· CHANGELOG
- Documentation tip â **`fa0848b`**

---

## [2026-07-29] â LFE-TRAINING-02 Â· CLOSED

### Product

- Training Depth: skill Thin + XI Gate + atomic RPC `complete_training_session`
- Domain tip â **`5e6c2ad`**
- Operacyjne: Migracja Supabase RPC `complete_training_session` musi zostaÄ zastosowana na Årodowisku produkcyjnym

### Docs

- D21 Depth Â· TRAINING.md Â· ROADMAP Â· CURRENT_BASELINE Â· PROJECT_STATUS Â· HANDOFF Â· CHANGELOG

---

## [2026-07-29] â LFE-HANDOFF-01 Â· CLOSED

### Docs

- Master handoff AI: `docs/AI/PROJECT_HANDOFF.md`
- Sync baseline / status / roadmap / EPIC index po Landing Â· Branding Â· Auth UX
- Presentation tip = `9dc834a`; Production UI P0 bez zmian

---

## [2026-07-29] â LFE-AUTH-UX-01 Â· CLOSED

### Product / UX

- Login Modal na Landing Â· AuthStage `/login` `/register` Â· premium header
- Presentation tip â **`9dc834a`** (bez zmian Domain / World Art / tokenÃ³w)

---

## [2026-07-29] â LFE-BRANDING-01B Â· CLOSED

### Product / UX

- Logo K1+K3 Â· favicons Â· OG Â· BrandLogo Â· `1fbd6b5`

---

## [2026-07-29] â LFE-LANDING-01 Â· CLOSED

### Product / UX

- Marketing Landing redesign Â· Tunnel hero Â· `ffa20c6`

---

## [2026-07-29] â LFE-DOCS-BASELINE-01 Â· CLOSED

### Docs

- Sync `PROJECT_STATUS` Â· `CURRENT_BASELINE` Â· `ROADMAP` Â· `implementation/README` po UI P0
- Oficjalny **Production Baseline** = `54d0724` (IMPL-06); Domain = TRANSFERS-08 bez zmian

---

## [2026-07-29] â LFE-UI-IMPL-06 Â· CLOSED

### Product / UX

- Live â Post fidelity (HF-MCH-04/05/07/08) Â· responsive stage Â· HT banner Â· decision-first Post
- Production Baseline â **`54d0724`**

---

## [2026-07-29] â LFE-UI-IMPL-06A Â· CLOSED

### Product / UX

- Desktop Hub width Â· hero Â· instant nav tooltips Â· `00b2c2a`

---

## [2026-07-29] â LFE-CONTENT-PASS-01 Â· CLOSED

### Product / UX

- Shared `UI_COPY` glossary Â· Kadra â  SkÅad Â· Hub exit copy Â· `50ddf1a`

---

## [2026-07-29] â LFE-UI-IMPL-05 Â· CLOSED

### Product / UX

- Match XI / skÅad SCR-SQD-04 Â· `47340fe`

---

## [2026-07-29] â LFE-UI-IMPL-04 Â· CLOSED

### Product / UX

- Shell polish Â· icon rail Â· soft-lock modal Â· typography Â· `d9bb5b6`

---

## [2026-07-29] â LFE-UI-IMPL-03 Â· CLOSED

### Product / UX

- Core Domains P0 (Squad/Training/Transfers/Finance) + shared states Â· `d850f0e`

---

## [2026-07-29] â LFE-DOCS-SYNC-01 Â· CLOSED

### Docs

- Design SSOT + world-art verification w repo Â· `27badbc`

---

## [2026-07-29] â LFE-UI-IMPL-02 Â· CLOSED

### Product / UX

- Match Path Tunnel â VS â Pre â Live â Goal â Final â Post Â· `769ce4a`

---

## [2026-07-29] â LFE-UI-IMPL-01 Â· CLOSED

### Product / UX

- Shell + Hub Night Pitch Office Â· `282cfc9`

---

## [2026-07-26] â LFE-UI-EVOLUTION-01 Â· CLOSED

### Docs / UX

- Decision-first presentation: Hub, Shell, Transfers, Kick-Off, Training, Squad, Finance
- Presentation only â bez zmian DTO / resolverÃ³w / unlock / settlement

---

## [2026-07-26] â LFE-UI-EVOLUTION-02 Â· CLOSED

### Docs / UX

- Daily manager loop: Hub secondary Â· soft-links Â· Mobile Variant A Â· SSOT âKadraâ
- Tip feature UI: `a2aff01` (nie zmienia feature baseline TRANSFERS-08)

---

## [2026-07-26] â LFE-DOCS-UX-03 Â· CLOSED

### Docs

- UI Presentation Contract = SSOT w `UI_DESIGN_GUIDE` Â§16
- AI Patterns skrÃ³t Â· HUB sync Â· postmortem REFERENCE
- Documentation tip: `4a0b3ee` (feature baseline bez zmian)

---

## [2026-07-26] â AI-DOCS-CONSOLIDATION-02 Â· CLOSED

### Docs

- Cold start: `AI_QUICK_START` Â· `MODULE_MAP` Â· `EPIC_INDEX` Â· `TRANSFER_ARCHITECTURE`
- Sync stale baseline pointers (HANDOFF / STATUS / README) â `CURRENT_BASELINE`
- Principles: **Single Settlement Path**; Thin Slice example = Transfers 01â¦08
- Feature baseline **bez zmiany** (`9b1c575`)

---

## [2026-07-26] â LFE-TRANSFERS-08 Â· CLOSED

### Product

- Live H2H Counter Offers â 1Ã sellerâbuyer; Accept po Counter = buyer
- `opening_amount` immutable; settle wyÅÄcznie @ `current_amount`
- Counter RPC `FOR UPDATE` mutuje tylko `current_amount` / `phase` / `last_actor`
- Settlement tylko `completeTransferBuy`/`Sell`; brak escrow / timeout / AI H2H / `completeLiveTransfer()`
- Feature baseline â **`9b1c575`** (LFE-TRANSFERS-08)

---

## [2026-07-26] â LFE-TRANSFERS-07 Â· CLOSED

### Product

- Live H2H Pending Offers â `transfer_offers`; Instant Buy (06) rÃ³wnolegle
- Create / Reject / Withdraw â tylko oferty (bez cash / players / deals)
- Accept â settle @ snapshot `amount` + `accepted` + superseded pozostaÅych (ta sama TX)
- Instant Buy / Unlist â supersede wszystkich pending gracza (ta sama TX)
- Kwoty = NEGOTIATION_THIN allow-list; brak escrow / timeout / AI pending / `completeLiveTransfer()`
- Feature baseline â **`be95006`** (LFE-TRANSFERS-07)

---

## [2026-07-26] â LFE-TRANSFERS-06 Â· CLOSED

### Product

- Live H2H Instant Buy @ 100% ask â HumanâHuman; brak AI clubs / pending / timeout
- PodaÅ¼ = `players.transfer_listed_at`; brak tabeli listingÃ³w; `players.id` niezmienne
- Atomowy RPC `complete_live_h2h_transfer`; settlement tylko `completeTransferBuy`/`Sell` (source live)
- Seed Catalogue = fallback; UI tylko `resolveTransferMarket` (`liveListings`)
- Feature baseline â **`8824793`** (LFE-TRANSFERS-06)

---

## [2026-07-26] â LFE-TRANSFERS-05 Â· CLOSED

### Product

- Seller negotiation Thin (Incoming S2): `resolveSellerNegotiationStep` pure; reuse NEGOTIATION_THIN
- Instant Sell @ 100% ask â bez nego; `resolveNegotiationStep` pozostaje BUY-only
- Settlement: `completeTransferSell(agreedAmount)` + `isAllowedAgreedAmount`; idempotentne
- PeÅna rewalidacja przed settle (ask / allow-list / eligibility / listed / window / roster / GK)
- Brak nowych tabel / pending / timeoutÃ³w; UI tylko `resolveTransferMarket`
- Feature baseline â **`4b58507`** (LFE-TRANSFERS-05)

---

## [2026-07-26] â LFE-TRANSFERS-04 Â· CLOSED

### Product

- `players.transfer_listed_at` â List/Unlist (idempotent); brak nowych tabel
- Ask listingu = `deriveTransferFee`; Instant Sell zostaje
- Incoming tylko dla listed; shared `isTransferSellEligible`
- `completeTransferSell` czyÅci `transfer_listed_at`; okno nie czyÅci listy
- UI tylko `resolveTransferMarket` (`listedPlayers` + flag `listed`)
- Feature baseline â **`de23db6`** (LFE-TRANSFERS-04)

---

## [2026-07-25] â LFE-TRANSFERS-03 Â· CLOSED

### Product

- Derived AIâplayer offers (`resolveIncomingOffers`) â persistence C; brak migracji / pending / timeout / inbox
- Oferta = **100%** `deriveTransferFee`; Accept / Reject only
- Accept â `completeTransferSell` (bez `agreedAmount`); peÅna rewalidacja w settlement
- Stabilne `offerId` = `in-{clubTag}-{playerId}`
- Feature baseline â **`4f69b5d`** (LFE-TRANSFERS-03)

---

## [2026-07-25] â LFE-TRANSFERS-02-N1 Â· CLOSED

### Product

- Stateless buy negotiation Thin â brak migracji / pending DB / timeoutÃ³w
- Pure `resolveNegotiationStep`: Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta
- Settlement: `completeTransferBuy(agreedAmount)` + peÅna rewalidacja (ask / envelope / window / roster / funds)
- SSOT: `cash_balance`; ask = `deriveTransferFee`; envelope = `resolveTransferEnvelope`
- Sell bez zmian (instant @ fee)
- Feature baseline â **`8d9d772`** (LFE-TRANSFERS-02-N1)

---

## [2026-07-25] â LFE-TRANSFERS-02-E1 Â· CLOSED

### Product

- `ECONOMY_THIN.ENVELOPE_RATIO = 1` â envelope === cash (Thin)
- **Jedyny** wzÃ³r: `resolveTransferEnvelope(cashBalance)` â brak lokalnego `cash Ã ratio`
- `/finance`, `resolveTransferMarket`, `completeTransferBuy` konsumujÄ wyÅÄcznie ten helper
- Brak migracji / kolumny / tabeli; cash = SSOT salda; Negotiation poza scope
- Feature baseline â **`0fad4a9`** (LFE-TRANSFERS-02-E1)

---

## [2026-07-25] â LFE-LEAGUE-03 Â· CLOSED

### Product

- `LEAGUE_FIXTURE_COUNT = 11` (single RR vs 11 AI catalog)
- Sole plan: `planClubFixtures` â no second generator
- `ensureClubFixtures` + pure `resolveFixtureTopUp` â deterministyczny top-up MD brakujÄcych
- Top-up identity = peÅny plan 11; brak nadpisu played/upcoming; unique `(club_id, matchday)`
- `resolveLeagueTable` / `completeFixture` / unlocki transfer+trening **bez zmian kontraktu**
- Thin vs GDD Â§10: 11 â  22 (Future)
- Feature baseline â **`617d3c2`** (LFE-LEAGUE-03)

---

## [2026-07-25] â GDD-Â§26B Â· CLOSED

### Code sync

- `ECONOMY_THIN` = GDD Â§26 (starter / W/D/L / CURRENCY)
- `ECONOMY_THIN.TRANSFER_FEE` â wspÃ³lne wspÃ³Åczynniki fee; `deriveTransferFee` tylko stÄd
- Jedno `CURRENCY` (usuniÄte z `TRANSFERS_THIN`)
- Testy `economy01` + `transfers01` zaktualizowane
- D18/D20 bez zmiany architektury; feature baseline pozostaje `10de062`

---

## [2026-07-25] â GDD-Â§26A Â· CLOSED

### Docs

- GDD Â§26 wypeÅniony: SSOT liczb Thin (Wariant A â promocja live)
- Waluta EUR Â· starter 100â¯000 Â· W/D/L 5â¯000 / 2â¯500 / 1â¯000 Â· fee derive (skill/age + floor 25â¯000)
- Jawne: Â§26 = SSOT produktu (liczby); D18/D20 = SSOT implementacji
- OUT: envelope, pensje, bilety, sponsorzy, Premium, soft/hard, training cash
- Sync kodu = **GDD-Â§26B** (nastÄpny etap); feature baseline pozostaje `10de062`

---

## [2026-07-25] â LFE-TRAINING-01 Â· CLOSED

### Product

- `resolveClubTraining()` â `TrainingDto` = jedyny kontrakt UI treningu
- `clubs.last_training_on` = SSOT dnia ostatniej sesji (UTC date)
- Mutacje tylko `players.status` (bez `skill`, bez zmian liczebnoÅci kadry)
- Unlock po 2 played; shared `hasPlayedUnlock` (reuse Transfers ensure)
- 1 sesja / dzieÅ UTC; `already_trained_today`; `/training` bez mockÃ³w
- **D21** CLOSED
- Prod commit `10de062`; migracja `20260725100000` applied; CI GREEN; Production Verify PASS

---

## [2026-07-25] â AI-DOCS-HYGIENE-01 Â· CLOSED

### Docs

- Unified pipeline: AUDITââ¦âPUSHâ**CI**âCLOSE
- `ARCHITECTURE_PRINCIPLES` Â· `COMMON_PATTERNS` Â· `ENGINEERING_GUIDE`
- Platform split: LEAGUE Â· FINANCE Â· PLAYERS Â· TRANSFERS; slim HUB
- Feature baseline vs documentation tip policy
- README + docs/README synced; status mirrors reduced (ROADMAP = EPIC list SSOT)

---

## [2026-07-25] â LFE-TRANSFERS-01 Â· CLOSED

### Product

- `resolveTransferMarket()` â `TransferMarketDto` = jedyny kontrakt UI rynku
- `clubs.transfer_window_open` = SSOT okna; unlock po 2 played (`UNLOCK_AFTER_PLAYED=2` â Thin vs GDD K11)
- Deal buy/sell: `players` + `cash_balance` + `finance_movements` + `transfer_deals` (`completed_at`)
- Buy ids `t-{tag}-â¦`; sell = `DEPARTED` + `departed_at` (bez DELETE); fee = derive (brak `market_value`)
- Katalog: `seedTransferCatalogue()`; cash-only (bez envelope / negotiation / potential / training)
- Nav Transfery open gdy `SEASON` + okno; `/transfers` bez mockÃ³w
- **D20** CLOSED
- Prod commit `393a43c`; prettier `7c0ce7f`; migracja applied; CI GREEN

---

## [2026-07-25] â LFE-PLAYERS-01 Â· CLOSED

### Product

- Tabela `players` = SSOT kadry klubu gracza (RLS); ids `s-{tag}-â¦`; `version` default `1`
- Status domenowy: `READY` | `INJURED` | `SUSPENDED` | `TIRED` (lokalizacja w UI)
- `resolveClubSquad(club, rows)` â `SquadDto` = jedyny kontrakt UI; brak fallbacku do seeda
- Seed (`seedClubRoster`) tylko create/backfill/testy; AI = `seedBotSquad` / `seedOpponentSquad`
- First Match + liga: nasz XI z DB; `/squad` + `/players/[id]` z resolvera
- D16 superseded by **D19**
- Prod commit `0b960b5`; prettier `d43fa3d`; migracja applied; CI GREEN

---

## [2026-07-25] â LFE-ECONOMY-01 Â· CLOSED

### Product

- `clubs.cash_balance` = SSOT salda; `finance_movements` = historia
- `resolveClubFinance()` â `ClubFinanceDto` = jedyny kontrakt UI (pole `currency`)
- Seed `STARTER_CASH=100000` przy create club; nagroda W/D/L przy pierwszym `played`
- `/finance` bez mocka; Nav/Secondary Finanse + Hub chip kasy na `SEASON`
- Post Match: jedna linia nagrody (league)
- StaÅe Thin tymczasowe do GDD Â§26 (`ECONOMY_THIN`)
- Prod commit `a70cf81`; migracja applied; CI + Vercel GREEN

---

## [2026-07-25] â LFE-LEAGUE-02 Â· CLOSED

### Product

- `resolveLeagueTable(club, fixtures)` â `LeagueTableDto` = jedyne ÅºrÃ³dÅo tabeli (brak standings DB)
- AIâAI = deterministyczny derive (nie Match Engine)
- Hub â `SEASON` via S1 (`first_match_completed` + `fixtures.length > 0`); jeden layout Hub
- `/league` zasilane wyÅÄcznie resolverem; Nav Liga open na SEASON
- Chip pozycji (jedna linia) z `resolvePlayerLeaguePositionLabel`
- Generator nadal 3 fixtures (bez zmian vs LEAGUE-01)
- Prod commit `71ce442`; CI + Vercel GREEN

---

## [2026-07-24] â LFE-LEAGUE-01 Thin A Â· CLOSED

### Product

- Tabela `fixtures` (RLS) + `opponent_club_id` katalog AI
- Generator 3 meczÃ³w (`ensureClubFixtures`) po First Match
- Hub Primary â âPrzygotuj meczâ / Match Pipeline reuse / `completeFixture`
- Squad SSOT (`resolveClubSquad`) â bez `@/data/squad` na ÅcieÅ¼ce produktowej
- Faza Hub pozostaje `EARLY_CLUB` (bez SEASON / tabeli ligowej)
- Prod commit `b5b64a3`; migracja applied; CI + Vercel GREEN

---

## [2026-07-24] â LFE-DOCS-01

### Docs

- Konsolidacja onboarding AI: `AGENTS.md`, `docs/AI/*`, `MASTER_HANDOFF.md`
- Platform docs: onboarding / first match / hub
- Sync status, roadmap, architecture, connection, decisions D13âD14
- Archive: historyczny `product/overview.md`

---

## [2026-07-24] â LFE-HUB-01 / LFE-MATCH-01 / LFE-PLATFORM-01 (code on main)

### Product

- First Match tunnel + `first_match_completed_at`
- Hub EARLY_CLUB decision screen
- Club Wizard + Club DTO + Supabase rebind

---

## [2026-07-24] â GDD-15

### Docs (SSOT FIRST)

- WypeÅniony Â§20 Zadania dzienne: opcjonalne; 1 cel dnia na Hubie
- Mecz > zadanie w dniu meczowym; soft FOMO; brak kar / obowiÄzkowego loginu / P2W
- Nagrody = kategorie (Â§14 / Â§19 / Â§26); bez liczb
- Cross-refs: Â§3.10, Â§23, Â§21, Â§22
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] â GDD-14

### Docs (SSOT FIRST)

- WypeÅniony Â§23 Panel gÅÃ³wny (Hub): ekran decyzji, nie dashboard
- DokÅadnie 1 Primary CTA; maksymalnie 5 Secondary CTA
- Hierarchia: mecz â zadanie dnia â status Â§6 â skrÃ³ty â pomocnicze
- Stany: nowy klub / dzieÅ meczowy / po meczu / idle
- Cross-refs: Â§3.11, Â§6.16, Â§9.15, Â§24
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] â GDD-13

### Docs (SSOT FIRST)

- WypeÅniony Â§6 RozwÃ³j klubu: Poziom klubu Â· Reputacja Â· PrestiÅ¼
- ÅaÅcuch: sport â prestiÅ¼ â reputacja â atrakcyjnoÅÄ; Poziom = rozwÃ³j organizacji
- Soft caps, unlocki jakoÅciowe, stadion = Â§13 / rozbudowa Future
- Cross-refs w Â§7.17, Â§11.16, Â§12.8, Â§13.8, Â§15.8, Â§18, Â§19 (bez duplikacji definicji)
- Sync: `CURRENT_DESIGN`, `game-design/ROADMAP`, status, handoff

---

## [2026-07-24] â LFE-PLAYER-RATINGS-01

### Web

- Pure derive ocen XI (1.0â10.0) + MVP w Post Match (`player-ratings.ts`)
- `PostMatchSummary.ratings` / `mvpPlayerId`; UI lista ocen + badge MVP
- Bez zmian LFE / Engine / Canvas / Replay

### Docs

- `MATCH_UI_PIPELINE`, status, roadmap, handoff, changelog

---

## [2026-07-24] â AI-DOCS-CONSOLIDATION-01

### Docs (bez nowych plikÃ³w SSOT)

- Rozszerzony `AI-HANDOFF.md`: wolno/nie wolno, REUSE FIRST, workflow, raporty, WIP/docs
- `WORKFLOW.md`, `CODING_STANDARDS.md`, `RELEASE_PROCESS.md` â proces Agenta
- `web/MATCH_UI_PIPELINE.md` â status na `main` + Live Bridge
- Disclaimery: `product/overview.md`, `architecture/foundation.md`, root `CHANGELOG.md`

---

## [2026-07-24] â LFE-DOCS-SYNC-01

### Docs

- Synchronizacja statusu po wdroÅ¼eniu Canvas / Replay / Post Match / Live Bridge
- `AI-HANDOFF.md`, `HANDOFF.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `lfe/CURRENT_STATUS.md`
- Nowe: `lfe/GAMEPLAY_MATCH_STACK.md`, `web/MATCH_UI_PIPELINE.md`, `API.md`

### Code on `main` (match pipeline)

|     | Hash      | Opis                                                    |
| --- | --------- | ------------------------------------------------------- |
| â   | `4d43661` | feat(lfe): player match statistics and event playerId   |
| â   | `fbbebea` | chore(ci): apply prettier across repository             |
| â   | `d752d22` | feat(web): add match canvas renderer                    |
| â   | `cf1d68c` | feat(web): add match replay buffer and controller       |
| â   | `b25f479` | feat(web): add post-match summary and view              |
| â   | `33618e9` | feat(web): wire live match canvas replay and post-match |

---

## [2026-07-24] â LFE-PLAYER-MATCH-DATA-01

### LFE

- `MatchState.statistics.players` inicjalizowane dla peÅnego rosteru
- Deterministyczna atrybucja `attribute-player.ts` (bez RNG)
- Optional `playerId` na payloadach `GOAL` / `SHOT` / `FOUL`
- Bump `PlayerStatistics`: `goals`, `shots`, `foulsCommitted`
- `TeamStatistics` i drabina RNG bez zmian semantycznych

---

## [2026-07-23] â RELEASE AâC (gameplay + UI)

### Code on `main`

|     | Hash      | Opis                             |
| --- | --------- | -------------------------------- |
| A   | `e449400` | feat(lfe): gameplay stack 0.9.1  |
| B   | `4493687` | feat(web): UI refresh 0.9.1      |
| C   | `bfce09f` | feat(web): live match experience |

---

## [2026-07-23] â LFE Architecture Freeze release + GDD docs

### Added

- LFE EPIC-1â¦7 (foundation â positioning)
- `docs/lfe/LFE_ARCHITECTURE_FREEZE.md` (PUBLIC API v1)
- `docs/game-design/*` (GDD + UI guide)
- Docs SSOT suite (`PROJECT_*`, `HANDOFF`, LFE/GDD indexes)

### Commits (AâG)

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

## [2026-07-21] â Foundation / infra

- Monorepo Next.js + LFE stub + domain
- Supabase / Vercel / CI bootstrap

## NajwaÅ¼niejsze decyzje

Changelog docs nie zastÄpuje freeze ani GDD â tylko chronologia.

## PowiÄzania

Root [`CHANGELOG.md`](../CHANGELOG.md) Â· [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-25 â AI-DOCS-HYGIENE-01
