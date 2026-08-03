# Changelog (docs SSOT index)

## Cel dokumentu

Historia istotnych zmian projektu widziana z perspektywy dokumentacji SSOT.  
Szczegóły Keep-a-Changelog: także root [`CHANGELOG.md`](../CHANGELOG.md).

## Aktualny stan

**Production Baseline (UI P0):** **`54d0724`** (LFE-UI-IMPL-06).  
**Domain feature baseline:** **`843bcfd`** (LFE-LEAGUE-WORLD-02).  
**Prior Domain:** **`6a54722`** (LFE-AGE-01).  
**Presentation tip:** **`9fd14fc`** (LFE-UI-MOTION-01).  
**Documentation tip:** **`DOCS_TIP`** — LFE-LEAGUE-WORLD-02 DOCS CLOSE  
Master handoff: [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md).

---

## [2026-08-03] — LFE-LEAGUE-WORLD-02 · CLOSED

### Product

- League Strength Profile per `league_tier` · AI opponent skills ∈ band · DB `players.skill` → LFE `PlayerSkills` Thin Adapter · D123 (supersedes D92).
- Domain tip → **`843bcfd`** · D123 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji · poza Match Engine / LFE PUBLIC).

### Docs

- Sync SSOT LEAGUE-WORLD-02 CLOSE · HANDOFF · baseline · status · PLAYERS · stack note · next **Owner GO → §22 / Career Decline**.

## [2026-08-03] — LFE-AGE-01 · CLOSED

### Product

- Season Age++ Thin (H-AGE): wire `applySeasonAgeEffects` przy `confirmStartNextSeason` · persist age(+ soft skill regress @32) · D122.
- Domain tip → **`6a54722`** · D122 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji · poza Match Engine / LFE package).

### Docs

- Sync SSOT AGE-01 CLOSE · HANDOFF · baseline · status · PLAYERS · Season End H-AGE · next **Owner GO → League World / §22 / Career Decline**.

## [2026-08-03] — LFE-RATINGS-V2 · CLOSED

### Product

- LFE internal: deterministyczne `assists` (0|1 / gol) · `minutesPlayed` (XI + SUB · displayMinute).
- Web: `computePlayerRatings` v2 · `PlayerRatingView` · Post Match meta `G · A · min`.
- Domain tip → **`962f0a8`** · D119–D121 **nienaruszone** · CI GREEN · PRODUCTION VERIFIED (brak migracji · brak nowych PUBLIC exportów).

### Docs

- Sync SSOT RATINGS-V2 CLOSE · HANDOFF · baseline · status · roadmap · stack match · next **Owner GO → §22 push / `/advanced`**.

## [2026-07-31] — LFE-PUBLIC-API-01 · CLOSED

### Product

- Root `@lastfootball/lfe` = Freeze PUBLIC only (allowlist + gate test).
- `@lastfootball/lfe/testing` barrel only · `/advanced` defer · version `0.9.1-match-ai01` (bez bump).
- Domain tip → **`ce00327`** · D119–D121 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji).

### Docs

- Sync SSOT PUBLIC-API-01 CLOSE · HANDOFF · baseline · status · roadmap · next **Owner GO → Ratings v2**.

## [2026-07-31] — LFE-TRANSFERS-10 / TD-03+ · CLOSED

### Product

- Organizational split: `actions.ts` barrel → `actions-seed` / `actions-listing` / `actions-live-instant` / `actions-live-offers`.
- Sole `displayPos` in `lib/transfers/display-pos.ts` (LO/ŚO → OB).
- Zero market semantics / SQL / DTO / RPC / UI / Finance / Match Engine change.
- Domain tip → **`9424dd8`** · D116–D118 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji).

### Docs

- Sync SSOT TRANSFERS-10 CLOSE · HANDOFF · baseline · status · roadmap · next **Owner GO → Zawężenie LFE PUBLIC exports**.

## [2026-07-31] — LFE-STADIUM-01 · CLOSED

### Product

- Stadium Information Thin: `resolveClubStadium` · StadiumView · qualitative attendance.
- Pure derive · zero persist · `/stadium` open SEASON+OFFSEASON (D111) · no Ticket Economy (D112) · Confirm Primary.
- Domain tip → **`82a164d`** · D109–D115 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji).

### Docs

- Sync SSOT Stadium CLOSE · HANDOFF · baseline · status · roadmap · next **TD-03+**.

## [2026-07-31] — LFE-BOARD-01 · CLOSED

### Product

- Board Information Thin: `resolveClubBoard` · BoardView · H-BOARD non-blocking.
- Pure derive · zero persist · `/board` open SEASON+OFFSEASON (D105) · Stadium locked · Confirm Primary (D104).
- Domain tip → **`75c190d`** · D102–D108 CLOSED · CI GREEN · PRODUCTION VERIFIED (brak migracji).

### Docs

- Sync SSOT Board CLOSE · HANDOFF · baseline · status · roadmap · kolejka **STADIUM**.

## [2026-07-31] — LFE-SPONSORS-01 · CLOSED

### Product

- Sponsors Thin: `club_sponsor_contracts` · `resolveClubSponsors` · claim bonus · H-SPONSORS renewal.
- Base payout raz w `confirmStartNextSeason` · finance ledger only (`sponsor_base` / `sponsor_bonus`).
- `/sponsors` open SEASON+OFFSEASON (D99) · Board/Stadium locked · Confirm Primary (D98).
- Domain tip → **`17eb8ba`** · D95–D101 CLOSED · CI GREEN · PRODUCTION VERIFIED (+ migracja).

### Docs

- Sync SSOT Sponsors CLOSE · HANDOFF · baseline · status · roadmap · kolejka **BOARD → STADIUM**.

## [2026-07-31] — LFE-PROMOTION-01 · CLOSED

### Product

- Promotion Thin: `clubs.league_tier` · `resolveLeagueTierLabel` · `resolvePromotionOutcome` · `applyLeagueTierOutcome`.
- Raport OFFSEASON = outcome derive (D91); mutacja tier tylko Confirm N+1 (D90).
- Same AI opponent world (D92) · floor IV / ceiling I (D93) · baraże OUT (D94).
- Domain tip → **`fa06c53`** · D88–D94 CLOSED · CI GREEN · PRODUCTION VERIFIED (+ migracja).

### Docs

- Sync SSOT Promotion CLOSE · HANDOFF · baseline · status · roadmap · kolejka **SPONSORS → BOARD → STADIUM**.

## [2026-07-31] — AI HANDOFF · docs-only

### Docs

- Cold-start sync: HANDOFF §12–§13 · Quick Start · START_HERE · baseline · status · roadmap kolejka **PROMOTION → SPONSORS → BOARD → STADIUM**.
- Soft-locki aktywne udokumentowane · pętla gameplay klub→sezon→N+1 · D1–D87 pointer SSOT.
- Domain tip bez zmian: `024e827` · zero kodu / migracji (superseded by PROMOTION-01).

## [2026-07-31] — LFE-SEASON-END-01 · CLOSED

### Product

- Lifecycle Thin: trigger 22/22 → Season Closed → `OFFSEASON` → raport read-only → Confirm N+1.
- Persist `clubs.season_number` / `season_phase` (AC-10/11) · reseed wyłącznie `planClubFixtures` (D80).
- Unlock OFFSEASON = SEASON parity (D79) · hooki no-op (D83) · brak Promotion/Sponsors/Board/age++.
- Domain tip → **`024e827`** · style Prettier **`06fd86b`** · D78–D87 CLOSED.

### Docs

- Sync SSOT Season End kod (CLOSE; tip pin follows).

## [2026-07-30] — GDD-SEASON-END-01 · CLOSED

### Docs

- Kontrakt Season End Thin: [`game-design/GDD-SEASON-END-01.md`](./game-design/GDD-SEASON-END-01.md) (SSOT · D77).
- Pointer §10.12 / §10.13 / §10.20 w `GAME_DESIGN_DOCUMENT.md`.
- Decyzje **D68–D77** CLOSED · P23 · brak kodu / migracji (D74 · D76).
- Awans/spadek OUT Thin (D73) · pipeline · hooki · AC-8/AC-9.

## [2026-07-30] — LFE-SOFTLOCK-01 · CLOSED

### Product

- Generyczny `SoftLockRouteGate` — route access ≡ nav (`resolveNavAccess` / `isModuleSoftLocked` · `FLAT_NAV`).
- Kanoniczna powierzchnia locked = `SoftLockState` (D65); pass-through poza nav (D67).
- Strip Fake Production z `/sponsors` · `/board` · `/stadium` (D52 · D64).
- Domain tip → **`46f7caa`** · D52 · D63–D67 CLOSED · style Prettier **`90be8f2`**.

### Docs

- Sync SSOT soft-lock (prior CLOSE).

## [2026-07-30] — LFE-CLUB-01 · CLOSED

### Product

- `resolveClubProfile` derive only · Composition z ClubDto · starter · cash · league position
- `/club` bez PlaceholderPage / „Podgląd UI” / personelu / silnika §6
- `ClubProfileView` = presentation only (D50)
- Domain tip → **`36ba9be`** · D47–D51 CLOSED
- CI GREEN · PRODUCTION VERIFIED

### Docs

- Sync CLUB · CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · DECISIONS D47–D51 · EPIC_INDEX

---

## [2026-07-30] — LFE-MESSAGES-01 · CLOSED

### Product

- `resolveClubMessages` derive only (E1–E3) · brak DB / workflow / Accept
- `/messages` + Overlay = ta sama `ClubMessagesDto` (D43)
- Usunięte runtime mocki: hardcoded inbox · MessagesPreview · MOCK_NOTIFICATIONS · stały badge
- Domain tip → **`800ed0d`** · D40–D46 CLOSED
- CI GREEN · PRODUCTION VERIFIED

### Docs

- Sync MESSAGES · CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · DECISIONS D40–D46 · EPIC_INDEX

---

## [2026-07-30] — LFE-TRANSFERS-09 · CLOSED

### Product

- TD-01 CLOSED: SQL helpers `derive_transfer_fee_thin` / `is_allowed_transfer_amount_thin` + Vitest parity gate
- TD-02 CLOSED: Live Instant/Accept = jeden settle invoke (Single Settlement Path)
- D38: publiczne API Buy/Sell + RPC Args bez breaking change
- Domain tip → **`e6885dc`** · migracja `20260730150000_transfer_fee_parity_helpers.sql` na prod
- CI GREEN · PRODUCTION VERIFIED · TD-03+ pozostaje P2

### Docs

- Sync TRANSFER_ARCHITECTURE · CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · DECISIONS D38 · EPIC_INDEX

---

## [2026-07-30] — LFE-LEAGUE-04 · CLOSED

### Product

- Kalendarz ligowy **22** kolejki (double RR · GDD §10)
- `planClubFixtures` · MD1–11 identity LEAGUE-03 · MD12–22 rewanże · top-up istniejących klubów
- AI↔AI double RR w `planAiVsAiMatches` (seed `ai-v2`)
- Domain tip → **`9027baf`** · D28 · brak migracji schematu
- CI GREEN · PRODUCTION VERIFIED · next **Transfers hardening READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · LEAGUE · DECISIONS · EPIC_INDEX

---

## [2026-07-30] — LFE-RANKING-01 · CLOSED

### Product

- Ranking Information Thin: `resolveClubRanking` · sezonowe porównanie klubów na `/rankings`
- Input = `resolveLeagueTable` · własny DTO · bez points/WDL/goals/ELO · pasma via UI_COPY (D29)
- Domain tip → **`bf86749`** · D27 · brak migracji
- CI GREEN · PRODUCTION VERIFIED · next **Full 22-fixture season READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · ARCHITECTURE_RULES · DECISIONS · MODULE_MAP · EPIC_INDEX · QUICK_START

---

## [2026-07-30] — LFE-ACHIEVEMENTS-01 · CLOSED

### Product

- Achievements Information Thin: `resolveClubAchievements` · historia kamieni na `/achievements`
- Derive only · immutable history · brak XP / score / ekonomii · ≠ Ranking · ≠ Daily · ≠ §6
- Domain tip → **`3915be9`** · D26 · brak migracji
- CI GREEN · PRODUCTION VERIFIED · next **LFE-RANKING-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · ARCHITECTURE_RULES · DECISIONS · MODULE_MAP · EPIC_INDEX · QUICK_START

---

## [2026-07-30] — LFE-DAILY-01 · CLOSED

### Product

- Daily Goal Thin: `resolveClubDailyGoal` · sugestia Information Thin na Hubie pod Primary
- Derive only · Primary CTA nadrzędny · brak persist / Quest Engine / mutacji / ekonomii
- Domain tip → **`73e1361`** · D25 · brak migracji
- CI GREEN · PRODUCTION VERIFIED · next **LFE-ACHIEVEMENTS-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · HUB · ARCHITECTURE_RULES · DECISIONS · MODULE_MAP · EPIC_INDEX · QUICK_START

---

## [2026-07-30] — LFE-SCOUTING-01 · CLOSED

### Product

- Scouting Information Thin: `resolveClubScouting` · prywatna shortlista · REUSE `resolveTransferMarket` + potential
- `scout_shortlist` = wyłącznie `(club_id, player_id)` → `players.id` — **nie** drugi model zawodnika
- Shortlista **nie** wpływa na AI, rynek, transfery, potencjał ani symulację
- Domain tip → **`93fd6d5`** · migracja `20260730140000_scout_shortlist.sql` na prod
- CI GREEN · PRODUCTION VERIFIED · next **LFE-DAILY-01 READY FOR AUDIT**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · ARCHITECTURE_RULES · PLAYERS · EPIC_INDEX · QUICK_START

---

## [2026-07-30] — GDD-22 · CLOSED

### Docs

- §22 Powiadomienia Thin w `GAME_DESIGN_DOCUMENT.md` (polityka alertów · zaproszenie ≠ wymuszenie · opt-out ≠ utrata info · Soft FOMO · opt-in · dedup; ≠ §21; push/email/SDK = Future)
- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · EPIC_INDEX · QUICK_START · game-design
- Documentation tip → **`f871ca8`** (CLOSE sync; content `09b85e7`)
- CI GREEN · PRODUCTION VERIFIED · brak zmian kodu aplikacji
- Next: **LFE-SCOUTING-01** (później CLOSED)

---

## [2026-07-30] — GDD-21 · CLOSED

### Docs

- §21 Wiadomości Thin w `GAME_DESIGN_DOCUMENT.md` (inbox · skutek zdarzenia · Transfery SSOT ofert · CTA do istniejących ekranów; ≠ push/§22)
- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · EPIC_INDEX · QUICK_START · game-design README
- Documentation tip → **`c24efef`** (CLOSE sync; content `bf07a44`)
- CI GREEN · PRODUCTION VERIFIED · brak zmian kodu aplikacji
- Next: **GDD-22 READY FOR AUDIT**

---

## [2026-07-30] — LFE-ACADEMY-01 · CLOSED

### Product

- Academy Thin A: `players.academy_track` / `promoted_at` · `resolveClubAcademy` · Intake (max 3) · Promote
- Senior filters w squad / training / transfers / match development · nav open SEASON
- Domain tip → **`9c6fe86`** · D23 · migracja `20260730120000_academy_track.sql` na prod
- CI GREEN · PRODUCTION VERIFIED · next **M2.5**

### Docs

- Sync CURRENT_BASELINE · HANDOFF · PROJECT_STATUS · ROADMAP · ARCHITECTURE_RULES · DECISIONS · PLAYERS · EPIC_INDEX · QUICK_START

---

## [2026-07-30] — GDD-19 · CLOSED

### Docs

- §19 Osiągnięcia Thin w `GAME_DESIGN_DOCUMENT.md` (kamienie / historia; ≠ §6 / §18; §20 hook ≠ katalog; bez XP/progów)
- Sync CURRENT_DESIGN · game-design ROADMAP/README · handoff / baseline / PROJECT_STATUS / ROADMAP
- Documentation tip → **`2c619ca`** (CLOSE sync; content `fcbbe3c`)
- CI GREEN · PRODUCTION VERIFIED · brak zmian kodu aplikacji
- Next: **GDD-21 READY FOR AUDIT**

---

## [2026-07-30] — GDD-18 · CLOSED

### Docs

- §18 Ranking Thin w `GAME_DESIGN_DOCUMENT.md` (sezonowy ranking klubów; ≠ §6 / §10 / §17; §19 OUT; bez liczb/ELO)
- Sync CURRENT_DESIGN · game-design ROADMAP/README · handoff / baseline / PROJECT_STATUS / ROADMAP
- Documentation tip → **`4dedd71`** (CLOSE sync; content `84b7f4d` · prettier `a8236df`)
- CI GREEN · PRODUCTION VERIFIED · brak zmian kodu aplikacji
- Next: **GDD-19 READY FOR AUDIT**

---

## [2026-07-30] — LFE-UI-MOTION-01 · CLOSED

### Presentation

- Shared CSS motion Thin (`styles/motion.css`) · Hub decision enter / Primary press · Match Goal/Final overlay
- Guide §8 Motion kontrakt · ZERO DUPLICATE · reduced-motion · CSS-only
- Presentation tip → **`9fd14fc`**
- CI GREEN · PRODUCTION VERIFIED · bez zmian domeny / resolverów / LFE

---

## [2026-07-29] — GDD-17 · CLOSED

### Docs

- §17 Skauting Information Thin B w `GAME_DESIGN_DOCUMENT.md` (system informacji; shortlista prywatna; D19/D20/D22 bez zmian)
- Sync CURRENT_DESIGN · game-design ROADMAP/README · handoff / baseline / PROJECT_STATUS
- Documentation tip → **`2595cc9`**
- CI GREEN · PRODUCTION VERIFIED · brak zmian kodu aplikacji

---

## [2026-07-29] — GDD-16 · CLOSED

### Docs

- §16 Akademia Thin A (Intake + Promote) w `GAME_DESIGN_DOCUMENT.md`
- Sync CURRENT_DESIGN · game-design ROADMAP · PLAYERS.md
- Documentation tip → **`4805f7e`**

---

## [2026-07-29] — LFE-PLAYERS-02 · CLOSED

### Product

- Player Development Thin: `players.potential` + match growth (PRIMARY) + training ceiling
- Domain tip → **`cd222ba`**
- Operacyjne: Migracja `20260729120000_player_potential_development.sql` na prod

### Docs

- D22 · PLAYERS.md · TRAINING.md · ROADMAP · CURRENT_BASELINE · PROJECT_STATUS · HANDOFF · CHANGELOG
- Documentation tip → **`fa0848b`**

---

## [2026-07-29] — LFE-TRAINING-02 · CLOSED

### Product

- Training Depth: skill Thin + XI Gate + atomic RPC `complete_training_session`
- Domain tip → **`5e6c2ad`**
- Operacyjne: Migracja Supabase RPC `complete_training_session` musi zostać zastosowana na środowisku produkcyjnym

### Docs

- D21 Depth · TRAINING.md · ROADMAP · CURRENT_BASELINE · PROJECT_STATUS · HANDOFF · CHANGELOG

---

## [2026-07-29] — LFE-HANDOFF-01 · CLOSED

### Docs

- Master handoff AI: `docs/AI/PROJECT_HANDOFF.md`
- Sync baseline / status / roadmap / EPIC index po Landing · Branding · Auth UX
- Presentation tip = `9dc834a`; Production UI P0 bez zmian

---

## [2026-07-29] — LFE-AUTH-UX-01 · CLOSED

### Product / UX

- Login Modal na Landing · AuthStage `/login` `/register` · premium header
- Presentation tip → **`9dc834a`** (bez zmian Domain / World Art / tokenów)

---

## [2026-07-29] — LFE-BRANDING-01B · CLOSED

### Product / UX

- Logo K1+K3 · favicons · OG · BrandLogo · `1fbd6b5`

---

## [2026-07-29] — LFE-LANDING-01 · CLOSED

### Product / UX

- Marketing Landing redesign · Tunnel hero · `ffa20c6`

---

## [2026-07-29] — LFE-DOCS-BASELINE-01 · CLOSED

### Docs

- Sync `PROJECT_STATUS` · `CURRENT_BASELINE` · `ROADMAP` · `implementation/README` po UI P0
- Oficjalny **Production Baseline** = `54d0724` (IMPL-06); Domain = TRANSFERS-08 bez zmian

---

## [2026-07-29] — LFE-UI-IMPL-06 · CLOSED

### Product / UX

- Live → Post fidelity (HF-MCH-04/05/07/08) · responsive stage · HT banner · decision-first Post
- Production Baseline → **`54d0724`**

---

## [2026-07-29] — LFE-UI-IMPL-06A · CLOSED

### Product / UX

- Desktop Hub width · hero · instant nav tooltips · `00b2c2a`

---

## [2026-07-29] — LFE-CONTENT-PASS-01 · CLOSED

### Product / UX

- Shared `UI_COPY` glossary · Kadra ≠ Skład · Hub exit copy · `50ddf1a`

---

## [2026-07-29] — LFE-UI-IMPL-05 · CLOSED

### Product / UX

- Match XI / skład SCR-SQD-04 · `47340fe`

---

## [2026-07-29] — LFE-UI-IMPL-04 · CLOSED

### Product / UX

- Shell polish · icon rail · soft-lock modal · typography · `d9bb5b6`

---

## [2026-07-29] — LFE-UI-IMPL-03 · CLOSED

### Product / UX

- Core Domains P0 (Squad/Training/Transfers/Finance) + shared states · `d850f0e`

---

## [2026-07-29] — LFE-DOCS-SYNC-01 · CLOSED

### Docs

- Design SSOT + world-art verification w repo · `27badbc`

---

## [2026-07-29] — LFE-UI-IMPL-02 · CLOSED

### Product / UX

- Match Path Tunnel → VS → Pre → Live → Goal → Final → Post · `769ce4a`

---

## [2026-07-29] — LFE-UI-IMPL-01 · CLOSED

### Product / UX

- Shell + Hub Night Pitch Office · `282cfc9`

---

## [2026-07-26] — LFE-UI-EVOLUTION-01 · CLOSED

### Docs / UX

- Decision-first presentation: Hub, Shell, Transfers, Kick-Off, Training, Squad, Finance
- Presentation only — bez zmian DTO / resolverów / unlock / settlement

---

## [2026-07-26] — LFE-UI-EVOLUTION-02 · CLOSED

### Docs / UX

- Daily manager loop: Hub secondary · soft-links · Mobile Variant A · SSOT „Kadra”
- Tip feature UI: `a2aff01` (nie zmienia feature baseline TRANSFERS-08)

---

## [2026-07-26] — LFE-DOCS-UX-03 · CLOSED

### Docs

- UI Presentation Contract = SSOT w `UI_DESIGN_GUIDE` §16
- AI Patterns skrót · HUB sync · postmortem REFERENCE
- Documentation tip: `4a0b3ee` (feature baseline bez zmian)

---

## [2026-07-26] — AI-DOCS-CONSOLIDATION-02 · CLOSED

### Docs

- Cold start: `AI_QUICK_START` · `MODULE_MAP` · `EPIC_INDEX` · `TRANSFER_ARCHITECTURE`
- Sync stale baseline pointers (HANDOFF / STATUS / README) → `CURRENT_BASELINE`
- Principles: **Single Settlement Path**; Thin Slice example = Transfers 01…08
- Feature baseline **bez zmiany** (`9b1c575`)

---

## [2026-07-26] — LFE-TRANSFERS-08 · CLOSED

### Product

- Live H2H Counter Offers — 1× seller→buyer; Accept po Counter = buyer
- `opening_amount` immutable; settle wyłącznie @ `current_amount`
- Counter RPC `FOR UPDATE` mutuje tylko `current_amount` / `phase` / `last_actor`
- Settlement tylko `completeTransferBuy`/`Sell`; brak escrow / timeout / AI H2H / `completeLiveTransfer()`
- Feature baseline → **`9b1c575`** (LFE-TRANSFERS-08)

---

## [2026-07-26] — LFE-TRANSFERS-07 · CLOSED

### Product

- Live H2H Pending Offers — `transfer_offers`; Instant Buy (06) równolegle
- Create / Reject / Withdraw — tylko oferty (bez cash / players / deals)
- Accept → settle @ snapshot `amount` + `accepted` + superseded pozostałych (ta sama TX)
- Instant Buy / Unlist → supersede wszystkich pending gracza (ta sama TX)
- Kwoty = NEGOTIATION_THIN allow-list; brak escrow / timeout / AI pending / `completeLiveTransfer()`
- Feature baseline → **`be95006`** (LFE-TRANSFERS-07)

---

## [2026-07-26] — LFE-TRANSFERS-06 · CLOSED

### Product

- Live H2H Instant Buy @ 100% ask — Human↔Human; brak AI clubs / pending / timeout
- Podaż = `players.transfer_listed_at`; brak tabeli listingów; `players.id` niezmienne
- Atomowy RPC `complete_live_h2h_transfer`; settlement tylko `completeTransferBuy`/`Sell` (source live)
- Seed Catalogue = fallback; UI tylko `resolveTransferMarket` (`liveListings`)
- Feature baseline → **`8824793`** (LFE-TRANSFERS-06)

---

## [2026-07-26] — LFE-TRANSFERS-05 · CLOSED

### Product

- Seller negotiation Thin (Incoming S2): `resolveSellerNegotiationStep` pure; reuse NEGOTIATION_THIN
- Instant Sell @ 100% ask — bez nego; `resolveNegotiationStep` pozostaje BUY-only
- Settlement: `completeTransferSell(agreedAmount)` + `isAllowedAgreedAmount`; idempotentne
- Pełna rewalidacja przed settle (ask / allow-list / eligibility / listed / window / roster / GK)
- Brak nowych tabel / pending / timeoutów; UI tylko `resolveTransferMarket`
- Feature baseline → **`4b58507`** (LFE-TRANSFERS-05)

---

## [2026-07-26] — LFE-TRANSFERS-04 · CLOSED

### Product

- `players.transfer_listed_at` — List/Unlist (idempotent); brak nowych tabel
- Ask listingu = `deriveTransferFee`; Instant Sell zostaje
- Incoming tylko dla listed; shared `isTransferSellEligible`
- `completeTransferSell` czyści `transfer_listed_at`; okno nie czyści listy
- UI tylko `resolveTransferMarket` (`listedPlayers` + flag `listed`)
- Feature baseline → **`de23db6`** (LFE-TRANSFERS-04)

---

## [2026-07-25] — LFE-TRANSFERS-03 · CLOSED

### Product

- Derived AI→player offers (`resolveIncomingOffers`) — persistence C; brak migracji / pending / timeout / inbox
- Oferta = **100%** `deriveTransferFee`; Accept / Reject only
- Accept → `completeTransferSell` (bez `agreedAmount`); pełna rewalidacja w settlement
- Stabilne `offerId` = `in-{clubTag}-{playerId}`
- Feature baseline → **`4f69b5d`** (LFE-TRANSFERS-03)

---

## [2026-07-25] — LFE-TRANSFERS-02-N1 · CLOSED

### Product

- Stateless buy negotiation Thin — brak migracji / pending DB / timeoutów
- Pure `resolveNegotiationStep`: Low 90% / Normal 100% / High 110%; Counter 95%; jedna kontroferta
- Settlement: `completeTransferBuy(agreedAmount)` + pełna rewalidacja (ask / envelope / window / roster / funds)
- SSOT: `cash_balance`; ask = `deriveTransferFee`; envelope = `resolveTransferEnvelope`
- Sell bez zmian (instant @ fee)
- Feature baseline → **`8d9d772`** (LFE-TRANSFERS-02-N1)

---

## [2026-07-25] — LFE-TRANSFERS-02-E1 · CLOSED

### Product

- `ECONOMY_THIN.ENVELOPE_RATIO = 1` → envelope === cash (Thin)
- **Jedyny** wzór: `resolveTransferEnvelope(cashBalance)` — brak lokalnego `cash × ratio`
- `/finance`, `resolveTransferMarket`, `completeTransferBuy` konsumują wyłącznie ten helper
- Brak migracji / kolumny / tabeli; cash = SSOT salda; Negotiation poza scope
- Feature baseline → **`0fad4a9`** (LFE-TRANSFERS-02-E1)

---

## [2026-07-25] — LFE-LEAGUE-03 · CLOSED

### Product

- `LEAGUE_FIXTURE_COUNT = 11` (single RR vs 11 AI catalog)
- Sole plan: `planClubFixtures` — no second generator
- `ensureClubFixtures` + pure `resolveFixtureTopUp` — deterministyczny top-up MD brakujących
- Top-up identity = pełny plan 11; brak nadpisu played/upcoming; unique `(club_id, matchday)`
- `resolveLeagueTable` / `completeFixture` / unlocki transfer+trening **bez zmian kontraktu**
- Thin vs GDD §10: 11 ≠ 22 (Future)
- Feature baseline → **`617d3c2`** (LFE-LEAGUE-03)

---

## [2026-07-25] — GDD-§26B · CLOSED

### Code sync

- `ECONOMY_THIN` = GDD §26 (starter / W/D/L / CURRENCY)
- `ECONOMY_THIN.TRANSFER_FEE` — wspólne współczynniki fee; `deriveTransferFee` tylko stąd
- Jedno `CURRENCY` (usunięte z `TRANSFERS_THIN`)
- Testy `economy01` + `transfers01` zaktualizowane
- D18/D20 bez zmiany architektury; feature baseline pozostaje `10de062`

---

## [2026-07-25] — GDD-§26A · CLOSED

### Docs

- GDD §26 wypełniony: SSOT liczb Thin (Wariant A — promocja live)
- Waluta EUR · starter 100 000 · W/D/L 5 000 / 2 500 / 1 000 · fee derive (skill/age + floor 25 000)
- Jawne: §26 = SSOT produktu (liczby); D18/D20 = SSOT implementacji
- OUT: envelope, pensje, bilety, sponsorzy, Premium, soft/hard, training cash
- Sync kodu = **GDD-§26B** (następny etap); feature baseline pozostaje `10de062`

---

## [2026-07-25] — LFE-TRAINING-01 · CLOSED

### Product

- `resolveClubTraining()` → `TrainingDto` = jedyny kontrakt UI treningu
- `clubs.last_training_on` = SSOT dnia ostatniej sesji (UTC date)
- Mutacje tylko `players.status` (bez `skill`, bez zmian liczebności kadry)
- Unlock po 2 played; shared `hasPlayedUnlock` (reuse Transfers ensure)
- 1 sesja / dzień UTC; `already_trained_today`; `/training` bez mocków
- **D21** CLOSED
- Prod commit `10de062`; migracja `20260725100000` applied; CI GREEN; Production Verify PASS

---

## [2026-07-25] — AI-DOCS-HYGIENE-01 · CLOSED

### Docs

- Unified pipeline: AUDIT→…→PUSH→**CI**→CLOSE
- `ARCHITECTURE_PRINCIPLES` · `COMMON_PATTERNS` · `ENGINEERING_GUIDE`
- Platform split: LEAGUE · FINANCE · PLAYERS · TRANSFERS; slim HUB
- Feature baseline vs documentation tip policy
- README + docs/README synced; status mirrors reduced (ROADMAP = EPIC list SSOT)

---

## [2026-07-25] — LFE-TRANSFERS-01 · CLOSED

### Product

- `resolveTransferMarket()` → `TransferMarketDto` = jedyny kontrakt UI rynku
- `clubs.transfer_window_open` = SSOT okna; unlock po 2 played (`UNLOCK_AFTER_PLAYED=2` — Thin vs GDD K11)
- Deal buy/sell: `players` + `cash_balance` + `finance_movements` + `transfer_deals` (`completed_at`)
- Buy ids `t-{tag}-…`; sell = `DEPARTED` + `departed_at` (bez DELETE); fee = derive (brak `market_value`)
- Katalog: `seedTransferCatalogue()`; cash-only (bez envelope / negotiation / potential / training)
- Nav Transfery open gdy `SEASON` + okno; `/transfers` bez mocków
- **D20** CLOSED
- Prod commit `393a43c`; prettier `7c0ce7f`; migracja applied; CI GREEN

---

## [2026-07-25] — LFE-PLAYERS-01 · CLOSED

### Product

- Tabela `players` = SSOT kadry klubu gracza (RLS); ids `s-{tag}-…`; `version` default `1`
- Status domenowy: `READY` | `INJURED` | `SUSPENDED` | `TIRED` (lokalizacja w UI)
- `resolveClubSquad(club, rows)` → `SquadDto` = jedyny kontrakt UI; brak fallbacku do seeda
- Seed (`seedClubRoster`) tylko create/backfill/testy; AI = `seedBotSquad` / `seedOpponentSquad`
- First Match + liga: nasz XI z DB; `/squad` + `/players/[id]` z resolvera
- D16 superseded by **D19**
- Prod commit `0b960b5`; prettier `d43fa3d`; migracja applied; CI GREEN

---

## [2026-07-25] — LFE-ECONOMY-01 · CLOSED

### Product

- `clubs.cash_balance` = SSOT salda; `finance_movements` = historia
- `resolveClubFinance()` → `ClubFinanceDto` = jedyny kontrakt UI (pole `currency`)
- Seed `STARTER_CASH=100000` przy create club; nagroda W/D/L przy pierwszym `played`
- `/finance` bez mocka; Nav/Secondary Finanse + Hub chip kasy na `SEASON`
- Post Match: jedna linia nagrody (league)
- Stałe Thin tymczasowe do GDD §26 (`ECONOMY_THIN`)
- Prod commit `a70cf81`; migracja applied; CI + Vercel GREEN

---

## [2026-07-25] — LFE-LEAGUE-02 · CLOSED

### Product

- `resolveLeagueTable(club, fixtures)` → `LeagueTableDto` = jedyne źródło tabeli (brak standings DB)
- AI↔AI = deterministyczny derive (nie Match Engine)
- Hub → `SEASON` via S1 (`first_match_completed` + `fixtures.length > 0`); jeden layout Hub
- `/league` zasilane wyłącznie resolverem; Nav Liga open na SEASON
- Chip pozycji (jedna linia) z `resolvePlayerLeaguePositionLabel`
- Generator nadal 3 fixtures (bez zmian vs LEAGUE-01)
- Prod commit `71ce442`; CI + Vercel GREEN

---

## [2026-07-24] — LFE-LEAGUE-01 Thin A · CLOSED

### Product

- Tabela `fixtures` (RLS) + `opponent_club_id` katalog AI
- Generator 3 meczów (`ensureClubFixtures`) po First Match
- Hub Primary → „Przygotuj mecz” / Match Pipeline reuse / `completeFixture`
- Squad SSOT (`resolveClubSquad`) — bez `@/data/squad` na ścieżce produktowej
- Faza Hub pozostaje `EARLY_CLUB` (bez SEASON / tabeli ligowej)
- Prod commit `b5b64a3`; migracja applied; CI + Vercel GREEN

---

## [2026-07-24] — LFE-DOCS-01

### Docs

- Konsolidacja onboarding AI: `AGENTS.md`, `docs/AI/*`, `MASTER_HANDOFF.md`
- Platform docs: onboarding / first match / hub
- Sync status, roadmap, architecture, connection, decisions D13–D14
- Archive: historyczny `product/overview.md`

---

## [2026-07-24] — LFE-HUB-01 / LFE-MATCH-01 / LFE-PLATFORM-01 (code on main)

### Product

- First Match tunnel + `first_match_completed_at`
- Hub EARLY_CLUB decision screen
- Club Wizard + Club DTO + Supabase rebind

---

## [2026-07-24] — GDD-15

### Docs (SSOT FIRST)

- Wypełniony §20 Zadania dzienne: opcjonalne; 1 cel dnia na Hubie
- Mecz > zadanie w dniu meczowym; soft FOMO; brak kar / obowiązkowego loginu / P2W
- Nagrody = kategorie (§14 / §19 / §26); bez liczb
- Cross-refs: §3.10, §23, §21, §22
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] — GDD-14

### Docs (SSOT FIRST)

- Wypełniony §23 Panel główny (Hub): ekran decyzji, nie dashboard
- Dokładnie 1 Primary CTA; maksymalnie 5 Secondary CTA
- Hierarchia: mecz → zadanie dnia → status §6 → skróty → pomocnicze
- Stany: nowy klub / dzień meczowy / po meczu / idle
- Cross-refs: §3.11, §6.16, §9.15, §24
- Sync: CURRENT_DESIGN, roadmapy, status, handoff

---

## [2026-07-24] — GDD-13

### Docs (SSOT FIRST)

- Wypełniony §6 Rozwój klubu: Poziom klubu · Reputacja · Prestiż
- Łańcuch: sport → prestiż → reputacja → atrakcyjność; Poziom = rozwój organizacji
- Soft caps, unlocki jakościowe, stadion = §13 / rozbudowa Future
- Cross-refs w §7.17, §11.16, §12.8, §13.8, §15.8, §18, §19 (bez duplikacji definicji)
- Sync: `CURRENT_DESIGN`, `game-design/ROADMAP`, status, handoff

---

## [2026-07-24] — LFE-PLAYER-RATINGS-01

### Web

- Pure derive ocen XI (1.0–10.0) + MVP w Post Match (`player-ratings.ts`)
- `PostMatchSummary.ratings` / `mvpPlayerId`; UI lista ocen + badge MVP
- Bez zmian LFE / Engine / Canvas / Replay

### Docs

- `MATCH_UI_PIPELINE`, status, roadmap, handoff, changelog

---

## [2026-07-24] — AI-DOCS-CONSOLIDATION-01

### Docs (bez nowych plików SSOT)

- Rozszerzony `AI-HANDOFF.md`: wolno/nie wolno, REUSE FIRST, workflow, raporty, WIP/docs
- `WORKFLOW.md`, `CODING_STANDARDS.md`, `RELEASE_PROCESS.md` — proces Agenta
- `web/MATCH_UI_PIPELINE.md` — status na `main` + Live Bridge
- Disclaimery: `product/overview.md`, `architecture/foundation.md`, root `CHANGELOG.md`

---

## [2026-07-24] — LFE-DOCS-SYNC-01

### Docs

- Synchronizacja statusu po wdrożeniu Canvas / Replay / Post Match / Live Bridge
- `AI-HANDOFF.md`, `HANDOFF.md`, `PROJECT_STATUS.md`, `ROADMAP.md`, `lfe/CURRENT_STATUS.md`
- Nowe: `lfe/GAMEPLAY_MATCH_STACK.md`, `web/MATCH_UI_PIPELINE.md`, `API.md`

### Code on `main` (match pipeline)

|     | Hash      | Opis                                                    |
| --- | --------- | ------------------------------------------------------- |
| —   | `4d43661` | feat(lfe): player match statistics and event playerId   |
| —   | `fbbebea` | chore(ci): apply prettier across repository             |
| —   | `d752d22` | feat(web): add match canvas renderer                    |
| —   | `cf1d68c` | feat(web): add match replay buffer and controller       |
| —   | `b25f479` | feat(web): add post-match summary and view              |
| —   | `33618e9` | feat(web): wire live match canvas replay and post-match |

---

## [2026-07-24] — LFE-PLAYER-MATCH-DATA-01

### LFE

- `MatchState.statistics.players` inicjalizowane dla pełnego rosteru
- Deterministyczna atrybucja `attribute-player.ts` (bez RNG)
- Optional `playerId` na payloadach `GOAL` / `SHOT` / `FOUL`
- Bump `PlayerStatistics`: `goals`, `shots`, `foulsCommitted`
- `TeamStatistics` i drabina RNG bez zmian semantycznych

---

## [2026-07-23] — RELEASE A–C (gameplay + UI)

### Code on `main`

|     | Hash      | Opis                             |
| --- | --------- | -------------------------------- |
| A   | `e449400` | feat(lfe): gameplay stack 0.9.1  |
| B   | `4493687` | feat(web): UI refresh 0.9.1      |
| C   | `bfce09f` | feat(web): live match experience |

---

## [2026-07-23] — LFE Architecture Freeze release + GDD docs

### Added

- LFE EPIC-1…7 (foundation → positioning)
- `docs/lfe/LFE_ARCHITECTURE_FREEZE.md` (PUBLIC API v1)
- `docs/game-design/*` (GDD + UI guide)
- Docs SSOT suite (`PROJECT_*`, `HANDOFF`, LFE/GDD indexes)

### Commits (A–G)

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

## [2026-07-21] — Foundation / infra

- Monorepo Next.js + LFE stub + domain
- Supabase / Vercel / CI bootstrap

## Najważniejsze decyzje

Changelog docs nie zastępuje freeze ani GDD — tylko chronologia.

## Powiązania

Root [`CHANGELOG.md`](../CHANGELOG.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)

## Last updated

2026-07-31 — LFE-PUBLIC-API-01 CLOSED · Domain `ce00327`
