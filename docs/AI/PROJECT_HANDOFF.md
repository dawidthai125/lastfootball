# PROJECT HANDOFF — Last Football

**EPIC:** AI-HANDOFF-02 (docs-only · cold start)  
**Etap:** PROJECT HANDOFF & AI ONBOARDING  
**Status:** ACTIVE — master handoff dla nowej sesji ChatGPT / Cursor  
**Data:** 2026-07-31

> **Cel:** cold start nowej sesji AI w **&lt; 5 minut** — wyłącznie z `docs/` + kodu.  
> **Nie** zastępuje SSOT statusu / baseline / listy EPIC — **łączy** je w jeden dokument startowy.  
> Hashe i listy źródłowe: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../ROADMAP.md`](../ROADMAP.md).

---

## 1. Aktualny baseline

| Pole                            | Wartość                                                                                                                                                                                       |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Production Version**          | UI P0 + SoftLock + Club + Messages + League 22 + Transfers 10 + Season End + **Age++** + Promotion + Sponsors + Board + Stadium + **LFE PUBLIC** + **Ratings v2** + GDD-16…**22** + MOTION-01 |
| **Production Baseline (UI P0)** | `54d0724` — **LFE-UI-IMPL-06** (Live → Post fidelity)                                                                                                                                         |
| **Domain feature baseline**     | `6a54722` — **LFE-AGE-01** (Season Age++ Thin · H-AGE · Confirm N+1 · D122)                                                                                                                   |
| **Presentation tip**            | `9fd14fc` — **LFE-UI-MOTION-01** (Hub/Match presentation motion Thin)                                                                                                                         |
| **Documentation tip**           | **`fcd871d`** — LFE-AGE-01 DOCS CLOSE                                                                                                                                                         |
| **tip `main`**                  | **`1934e7f`** — pin tip (Documentation tip = `fcd871d`)                                                                                                                                       |
| **Branch**                      | `main`                                                                                                                                                                                        |
| **Status**                      | PRODUCTION VERIFIED · CI GREEN · **LFE-AGE-01 FULLY CLOSED** · D1–D122 · next **Owner GO → League World / §22 / Career Decline**                                                              |

| **Production URL** | https://lastfootball.vercel.app |
| **Alias** | https://lastfootball.pl |
| **CI Status** | GREEN wymagane na tip `main` (Format · Typecheck · Lint · Test · Build) |

```bash
git log -1 --oneline                    # tip (docs pin)
git log -1 --oneline 6a54722            # Domain AGE-01
git log -1 --oneline 962f0a8            # Prior Domain RATINGS-V2
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline ce00327            # Prior Domain PUBLIC-API-01
git log -1 --oneline 9424dd8            # Prior Domain TRANSFERS-10
git log -1 --oneline 82a164d            # Prior Domain STADIUM-01
git log -1 --oneline 75c190d            # Prior Domain BOARD-01
git log -1 --oneline 17eb8ba            # Prior Domain SPONSORS-01
git log -1 --oneline fa06c53            # Prior Domain PROMOTION-01
git log -1 --oneline 024e827            # Prior Domain SEASON-END-01
git log -1 --oneline 46f7caa            # Prior Domain SOFTLOCK-01
git log -1 --oneline 36ba9be            # Prior Domain CLUB-01
git log -1 --oneline 800ed0d            # Prior Domain MESSAGES-01
git log -1 --oneline e6885dc            # Prior Domain TRANSFERS-09
git log -1 --oneline 9027baf            # Prior Domain LEAGUE-04
git log -1 --oneline bf86749            # Prior Domain RANKING-01
git log -1 --oneline 3915be9            # Prior Domain ACHIEVEMENTS-01
git log -1 --oneline 73e1361            # Prior Domain DAILY-01
git log -1 --oneline 93fd6d5            # Prior Domain SCOUTING-01
git log -1 --oneline 9c6fe86            # Prior Domain ACADEMY-01
git log -1 --oneline 9fd14fc            # LFE-UI-MOTION-01 presentation tip
```

**Prod deploy:** Vercel Production śledzi `main` (Domain PUBLIC-API-01 `ce00327` · presentation MOTION-01 `9fd14fc`).

**Operacyjne:** Migracje Supabase na prod: training · potential/match dev · **`academy_track`** · **`scout_shortlist`** · **fee parity helpers** · **`season_number` / `season_phase`** · **`league_tier`** · **`club_sponsor_contracts`** (SPONSORS-01) — zastosowane.  
**LFE-SOFTLOCK-01 / LFE-MESSAGES-01 / LFE-CLUB-01 / LFE-BOARD-01 / LFE-STADIUM-01 / LFE-TRANSFERS-10 / LFE-PUBLIC-API-01:** brak migracji (gate / derive / org refactor / package surface only).  
`scout_shortlist` = wyłącznie `(club_id, player_id)` → `players.id` (nie drugi model); shortlista bez wpływu na AI/rynek/transfery/potencjał/symulację.  
Promotion Thin: etykiety + szczebel; **skład ligi / siła AI bez zmian** (D92).  
Sponsors Thin: 1 kontrakt · finance ledger · H-SPONSORS non-blocking (D95–D101).  
Board Thin: `resolveClubBoard` · Information Thin · no persist · H-BOARD non-blocking (D102–D108).  
Stadium Thin: `resolveClubStadium` · Information Thin · no persist · no Ticket Economy · no Match Engine (D109–D115).  
Transfers-10 / TD-03+: actions organizational split + `displayPos` sole helper · D116–D118 · Single Settlement Path nienaruszony.  
**LFE-PUBLIC-API-01:** root `@lastfootball/lfe` = Freeze PUBLIC only · `@lastfootball/lfe/testing` barrel · `/advanced` defer · D119–D121 · feat `ce00327`.

---

## 2. Co zostało ukończone

### Platforma / gameplay Thin

| EPIC                                           | Skrót                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth · klub · First Match · Hub EARLY_CLUB/SEASON                                      |
| LFE-LEAGUE-01…03                               | Fixtures · tabela · Thin 11 (pre-04)                                                   |
| **LFE-LEAGUE-04**                              | **Full 22** · double RR · top-up MD12–22 · D28 · `9027baf`                             |
| LFE-ECONOMY-01                                 | Cash Thin · `/finance` (D18)                                                           |
| LFE-PLAYERS-01 · **LFE-PLAYERS-02**            | Kadra `players` + **Development Thin** (potential · match) (D19/D22)                   |
| **LFE-ACADEMY-01**                             | **Academy Thin A** · Intake + Promote · `academy_track` (D23) · `9c6fe86`              |
| **LFE-SCOUTING-01**                            | **Scouting Information Thin** · `resolveClubScouting` · shortlist refs · `93fd6d5`     |
| **LFE-DAILY-01**                               | **Daily Goal Thin** · `resolveClubDailyGoal` derive · D25 · `73e1361`                  |
| **LFE-ACHIEVEMENTS-01**                        | **Achievements Information Thin** · `resolveClubAchievements` · D26 · `3915be9`        |
| **LFE-RANKING-01**                             | **Ranking Information Thin** · `resolveClubRanking` · D27 · `bf86749`                  |
| LFE-TRANSFERS-01…08                            | Rynek → listing → nego → Instant → Pending → **1× Counter** (D20)                      |
| **LFE-TRANSFERS-09**                           | **Hardening** TD-01/TD-02 · fee parity · single live settle · D38 · `e6885dc`          |
| **LFE-TRANSFERS-10**                           | **TD-03+** · actions split · `displayPos` sole · D116–D118 · `9424dd8`                 |
| **LFE-PUBLIC-API-01**                          | **Package Surface** · root PUBLIC · `/testing` barrel · D119–D121 · `ce00327`          |
| **LFE-RATINGS-V2**                             | **Ratings formula v2** · assists / minutesPlayed · `962f0a8`                           |
| **LFE-AGE-01**                                 | **Season Age++ Thin** · H-AGE · Confirm N+1 · D122 · `6a54722`                         |
| **LFE-MESSAGES-01**                            | **Messages Thin** · `resolveClubMessages` E1–E3 · D40–D46 · `800ed0d`                  |
| **LFE-CLUB-01**                                | **Club identity Thin** · `resolveClubProfile` · D47–D51 · `36ba9be`                    |
| **LFE-SOFTLOCK-01**                            | **Route soft-lock gate** · SoftLockState · D52 · D63–D67 · `46f7caa`                   |
| **GDD-SEASON-END-01**                          | **Season End Thin** · D68–D77 · SSOT `GDD-SEASON-END-01.md` · docs only                |
| **LFE-SEASON-END-01**                          | **Season End Thin lifecycle** · OFFSEASON · report · Confirm N+1 · D78–D87 · `024e827` |
| **GDD-PROMOTION-01**                           | **Promotion Thin kontrakt** · D88–D94 · SSOT `GDD-PROMOTION-01.md`                     |
| **LFE-PROMOTION-01**                           | **Promotion Thin** · `league_tier` · outcome · Confirm · D88–D94 · `fa06c53`           |
| **GDD-SPONSORS-01**                            | **Sponsors Thin kontrakt** · D95–D101 · SSOT `GDD-SPONSORS-01.md`                      |
| **LFE-SPONSORS-01**                            | **Sponsors Thin** · ledger · H-SPONSORS · D95–D101 · `17eb8ba`                         |
| **GDD-BOARD-01**                               | **Board Thin kontrakt** · D102–D108 · SSOT `GDD-BOARD-01.md`                           |
| **LFE-BOARD-01**                               | **Board Information Thin** · `resolveClubBoard` · H-BOARD · D102–D108 · `75c190d`      |
| **GDD-STADIUM-01**                             | **Stadium Thin kontrakt** · D109–D115 · SSOT `GDD-STADIUM-01.md`                       |
| **LFE-STADIUM-01**                             | **Stadium Information Thin** · `resolveClubStadium` · D109–D115 · `82a164d`            |
| LFE-TRAINING-01 · LFE-TRAINING-02              | Trening Thin + Depth (skill · XI Gate · RPC) (D21)                                     |
| GDD-§26A / §26B                                | SSOT liczb + sync `ECONOMY_THIN`                                                       |
| **GDD-16**                                     | **Akademia Thin A** (Intake + Promote) · docs `4805f7e`                                |
| **GDD-17**                                     | **Skauting Information Thin B** · docs `2595cc9`                                       |
| **GDD-18**                                     | **Ranking Thin** (sezonowy ranking klubów) · tip `4dedd71`                             |
| **GDD-19**                                     | **Osiągnięcia Thin** (kamienie / historia) · tip `2c619ca`                             |
| **GDD-21**                                     | **Wiadomości Thin** · content `bf07a44` · tip `c24efef`                                |
| **GDD-22**                                     | **Powiadomienia Thin** · content `09b85e7` · tip `f871ca8`                             |
| **M2.5**                                       | **PASS** · First Domain Implementation Review                                          |

### Silnik / Match UI

LFE EPIC-1…7 · Architecture Freeze · Live Bridge · Canvas · Replay · Post · Ratings · Match Path immersive (IMPL-02/06).

### Design / World Art / DS

GDD-01…22 (Thin docs) · §20 · §23 · §26 · Art Bible · World Art **CLOSED** (165 assets) · Visual DNA **LOCKED** · Style Lock **ACTIVE** · Hi-Fi · Proto · Playtest → GO impl.

### UI P0 (Night Pitch Office)

IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01 · DOCS-BASELINE-01 — **Production Baseline** `54d0724`.

### Marketing / Auth presentation (po UI P0)

| EPIC                 | Commit    | Skrót                                                    |
| -------------------- | --------- | -------------------------------------------------------- |
| **LFE-LANDING-01**   | `ffa20c6` | Landing marketing · Tunnel hero · full-bleed             |
| **LFE-BRANDING-01B** | `1fbd6b5` | Logo K1+K3 · favicons · OG · BrandLogo                   |
| **LFE-AUTH-UX-01**   | `9dc834a` | Login Modal · premium `/login` · `/register` · header    |
| **LFE-UI-MOTION-01** | `9fd14fc` | Shared CSS motion Thin · Hub enter/press · Match overlay |

### Docs

LFE-DOCS-01 · DOCS-UX-03 · DOCS-SYNC-01 · DOCS-BASELINE-01 · **LFE-HANDOFF-01** (ten dokument).

### Najważniejsze decyzje Ownera (skrót)

- Hub = **ekran decyzji**, nie dashboard mid-season.
- First Match **przed** Hubem; unlock Hub = `first_match_completed_at`.
- Domain UI **tylko** przez resolvery; **NO RUNTIME MOCKS**; **SEED ≠ RUNTIME**.
- Transfer settle **tylko** `completeTransferBuy` / `completeTransferSell`.
- UI presentation ≠ zmiana DTO / unlock / settlement (Guide §16) — **Presentation ≠ Domain**.
- Visual DNA / Style Lock / World Art / tokeny / branding SVG — **bez driftu** bez osobnego Owner GO.
- Kalendarz Thin = **22** fixtures (D28 / LEAGUE-04).
- **Information Thin / Skauting (D24):** shortlista = refs only; porządkuje informacje, **nie** ocenia / nie decyduje za gracza; zero wpływu na AI/rynek/symulację.
- **Messages Thin (D40–D46):** `resolveClubMessages` only · Overlay = ta sama DTO · NO RUNTIME MOCKS.
  Pełny indeks: [`../DECISIONS.md`](../DECISIONS.md) · skrót trwały: [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md).

---

## 3. Aktualna architektura

### Stack

| Warstwa      | Technologia                                                            |
| ------------ | ---------------------------------------------------------------------- |
| Frontend     | Next.js 15 App Router · TypeScript · CSS tokens                        |
| Backend data | Supabase Auth + Postgres (RLS) · project `anoeimngwptucjdugjme`        |
| Engine       | `@lastfootball/lfe` · `0.9.1-match-ai01` (headless)                    |
| CI           | GitHub Actions: Format · Typecheck · Lint · Test · Build · secret scan |
| Deploy       | Vercel Production                                                      |
| Monorepo     | npm workspaces                                                         |

### SSOT (krytyczne)

| Domen           | SSOT                                                                                                      |
| --------------- | --------------------------------------------------------------------------------------------------------- |
| Cash            | `cash_balance` + `resolveClubFinance`                                                                     |
| Transfery       | `resolveTransferMarket` · envelope · listing · offers · settle buy/sell                                   |
| Liga            | `fixtures` · `resolveLeagueTable`                                                                         |
| Kadra           | `players` (+ `potential` · `academy_track`) · `resolveClubSquad` · match development · pasma UI           |
| Akademia        | `resolveClubAcademy` · Intake/Promote · max 3 · D23                                                       |
| Skauting        | `resolveClubScouting` · `scout_shortlist` `(club_id, player_id)` → `players.id` · D24                     |
| Daily Goal      | `resolveClubDailyGoal` · derive only · Primary CTA nadrzędny · D25                                        |
| Trening         | `resolveClubTraining` · `last_training_on` · skill Thin ≤ potential · XI Gate · senior filter             |
| Hub             | `resolveHubPhase` · `resolvePrimaryCta` · OFFSEASON (D79)                                                 |
| Season End      | `season_phase` / `season_number` · `resolveSeasonReport` · `confirmStartNextSeason` · D68–D87             |
| Promotion       | `league_tier` · `resolveLeagueTierLabel` · `resolvePromotionOutcome` · `applyLeagueTierOutcome` · D88–D94 |
| Sponsors        | `club_sponsor_contracts` · `resolveClubSponsors` · claim/renew · Confirm base payout · D95–D101           |
| UI presentation | `UI_DESIGN_GUIDE.md` §16 · `UI_COPY`                                                                      |
| Produkt         | GDD · `GDD-SEASON-END-01.md` (kontrakt Thin)                                                              |
| Obraz           | Visual DNA · Style Lock · World Art registry                                                              |

### Najważniejsze katalogi

| Path                   | Rola                            |
| ---------------------- | ------------------------------- |
| `apps/web`             | Product UI                      |
| `packages/lfe`         | Match engine                    |
| `packages/domain`      | Shared DTOs                     |
| `supabase/`            | Migrations                      |
| `docs/`                | Documentation SSOT              |
| `docs/AI/`             | Cold start AI                   |
| `docs/implementation/` | Notatki UI / presentation EPICs |
| `docs/game-design/`    | GDD · DNA · DS · World Art      |
| `docs/platform/`       | Domeny platformy                |
| `AGENTS.md`            | Entry Cursor Agent              |

Szczegóły: [`MODULE_MAP.md`](./MODULE_MAP.md) · [`../ARCHITECTURE.md`](../ARCHITECTURE.md).

---

## 4. Visual DNA

**Status:** LOCKED · Style Lock ACTIVE (certificate v02).

**Jedno zdanie:** Night Pitch Office — nocny premium klub; floodlight + void; materiały zamiast efektów; semi-flat sport editorial; klub gracza bohaterem; zero SaaS.

### Czego NIE wolno zmieniać (bez nowego EPIC + Owner GO)

- 10 zasad Visual DNA ([`../game-design/LFE-WORLD-ART-03-VISUAL-DNA.md`](../game-design/LFE-WORLD-ART-03-VISUAL-DNA.md))
- Paleta święta: Void / Navy / Ash · Brass Gold · Pitch Emerald · Flood Ivory
- Zakazy: purple/indigo dominant · cream+terracotta · neon cyber · fotorealistyczne twarze · toy-3D
- Style Lock / Foundation Reference Board
- Pliki World Art jako „szybka poprawka stylu”

---

## 5. World Art

|                |                                                                                                          |
| -------------- | -------------------------------------------------------------------------------------------------------- |
| **Status**     | **CLOSED** (LFE-WORLD-ART-05) · ~165 zatwierdzonych assetów                                              |
| **Registry**   | [`../game-design/LFE-WORLD-ART-05-ASSET-REGISTRY.md`](../game-design/LFE-WORLD-ART-05-ASSET-REGISTRY.md) |
| **Użycie**     | Tła / hero / bandy UI zgodnie z Component Map; **nie** regenerować / podmieniać bez Owner GO             |
| **Handoff UI** | [`../game-design/LFE-WORLD-ART-05-UI-HANDOFF.md`](../game-design/LFE-WORLD-ART-05-UI-HANDOFF.md)         |

Landing / Auth używają Tunnel (`HERO-002`) — presentation only, bez edycji assetów źródłowych.

---

## 6. Design System

|                   |                                                                                                            |
| ----------------- | ---------------------------------------------------------------------------------------------------------- |
| **Status**        | Foundation ACTIVE · wdrożony w UI P0 + Landing/Auth                                                        |
| **SSOT reguł UI** | [`../game-design/UI_DESIGN_GUIDE.md`](../game-design/UI_DESIGN_GUIDE.md) §16                               |
| **DS koncept**    | [`../game-design/LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](../game-design/LFE-UI-SKIN-01-DESIGN-SYSTEM.md)         |
| **Tokeny**        | CSS variables w web — **nie zmieniać kolorystyki / DNA** bez Owner GO                                      |
| **Branding**      | K1 monogram LF + K3 wordmark `LASTFOOTBALL` · `BrandLogo` · assets w `apps/web/public/` (LFE-BRANDING-01B) |
| **Microcopy**     | `apps/web/src/lib/ui/copy.ts` (`UI_COPY`)                                                                  |

---

## 7. Gameplay

### Pętla gracza (klub → koniec sezonu → N+1)

1. **Auth / Landing** → rejestracja / login
2. **Club Wizard** → tożsamość klubu
3. **First Match** (Tunnel → … → Post) → `first_match_completed_at` → Hub
4. **EARLY_CLUB** → seed **22** fixtures → **SEASON**
5. **Matchday loop:** Hub Primary → Match Path → wynik → finanse / development / trening / transfery (gdy odblokowane) · akademia / skauting · daily goal · ranking / osiągnięcia / wiadomości
6. Po **22/22 played** → **Season Closed** → **OFFSEASON** · raport (+ outcome awansu/spadku derive) · soft-lock Sponsors/Board/Stadium
7. **Confirm N+1** → Age++ (H-AGE · D122) · apply `league_tier` (D90) · clear slate · `planClubFixtures` · `season_number++` · powrót **SEASON**

### Co działa (Thin Slice na produkcji)

- Onboarding → Club Wizard → First Match → Welcome LF → Hub
- Hub EARLY_CLUB / SEASON / **OFFSEASON** · Primary CTA · SoftLockRouteGate
- Liga **22** · tabela derive · Terminarz · Season End Thin · Promotion Thin · Sponsors Thin · Board Thin · **Stadium Thin**
- Finanse · Kadra · Transfery 01–**10** · Trening Depth · Akademia · Skauting · Daily · Achievements · Ranking · Messages · Club profile
- Match Live + Canvas + Replay · Post · **Ratings v2** · match development PRIMARY

### Co jest Thin (świadome limity)

kalendarz **22** (D28) · Season End **Thin CLOSED** (GDD+kod · D68–D87) · Age++ **Thin CLOSED** (H-AGE · D122 · Confirm N+1) · Promotion **Thin CLOSED** (D88–D94 · same AI world) · Sponsors **Thin CLOSED** (D95–D101 · ledger only) · Board **Thin CLOSED** (D102–D108 · no persist) · Stadium **Thin CLOSED** (D109–D115 · no tickets / no Match Engine) · brak XP / attribute DB · Ranking bez ELO/points surface · Achievements bez XP/score · Messages = derive · **brak kanału push** · brak Physics · akademia/skauting limity Thin · Daily bez Quest Engine.

### Planowane (Owner wybiera)

**Czekaj na Owner GO** — kolejka soft-lock + TD-03+ + PUBLIC + Ratings v2 + **AGE-01** = **CLOSED**. Rekomendacja ROADMAP: **League World** / **§22** / **Career Decline** (patrz §10).

---

## 8. UI (stan ekranów)

| Obszar           | Stan                                                                                         |
| ---------------- | -------------------------------------------------------------------------------------------- |
| **Landing**      | CLOSED · LFE-LANDING-01 · Tunnel hero · CTAs (Załóż klub / Zaloguj → modal)                  |
| **Branding**     | CLOSED · LFE-BRANDING-01B · logo system w chrome + meta                                      |
| **Login**        | CLOSED · LFE-AUTH-UX-01 · Modal na Landing + `/login` AuthStage                              |
| **Register**     | CLOSED · AuthStage · CTA „Rozpocznij karierę” · presentation only                            |
| **Hub**          | CLOSED UI P0 · decision-first · **MOTION-01** enter/press · Night Pitch Office               |
| **Match**        | CLOSED IMPL-02/05/06 · Path immersive · XI · Live/Post · **MOTION-01** Goal/Final overlay    |
| **Squad**        | CLOSED IMPL-03/05 + PLAYERS-02 · resolver `resolveClubSquad` · pasma potential               |
| **Academy**      | CLOSED **LFE-ACADEMY-01** · `resolveClubAcademy` · Intake/Promote · D23 · `9c6fe86`          |
| **Scouting**     | CLOSED **LFE-SCOUTING-01** · `resolveClubScouting` · shortlist refs · `93fd6d5`              |
| **Daily Goal**   | CLOSED **LFE-DAILY-01** · `resolveClubDailyGoal` · derive · `73e1361`                        |
| **Achievements** | CLOSED **LFE-ACHIEVEMENTS-01** · `resolveClubAchievements` · history · `3915be9`             |
| **Ranking**      | CLOSED **LFE-RANKING-01** · `resolveClubRanking` · seasonal · `bf86749`                      |
| **Training**     | CLOSED TRAINING-01/02 · Depth skill + XI Gate · ceiling potential (D22)                      |
| **Transfers**    | CLOSED Thin 01–**10** (TD-03+ org split · D116–D118) + presentation                          |
| **Finance**      | CLOSED Thin + presentation                                                                   |
| **Motion**       | CLOSED **LFE-UI-MOTION-01** · shared `motion.css` · Guide §8 · `9fd14fc`                     |
| **SoftLock**     | CLOSED **LFE-SOFTLOCK-01** · Route Gate · SoftLockState · D52 · D63–D67 · `46f7caa`          |
| **Season End**   | CLOSED **GDD + LFE-SEASON-END-01** · OFFSEASON · raport · Confirm N+1 · D68–D87 · `024e827`  |
| **Promotion**    | CLOSED **GDD + LFE-PROMOTION-01** · `league_tier` · outcome · D88–D94 · `fa06c53`            |
| **Sponsors**     | CLOSED **GDD + LFE-SPONSORS-01** · `resolveClubSponsors` · H-SPONSORS · D95–D101 · `17eb8ba` |
| **Board**        | CLOSED **GDD + LFE-BOARD-01** · `resolveClubBoard` · H-BOARD · D102–D108 · `75c190d`         |
| **Stadium**      | CLOSED **GDD + LFE-STADIUM-01** · `resolveClubStadium` · D109–D115 · `82a164d`               |

---

## 9. Soft-locki aktywne (nav / route)

Access SSOT: `resolveNavAccess` / `isModuleSoftLocked` · gate: `SoftLockRouteGate` · surface: `SoftLockState` (D52 · D63–D67).  
**OFFSEASON** = parity unlock z **SEASON** (D79).

| Moduł / trasa      | Stan soft-lock                   | Dlaczego                      | Odblokuje (Owner EPIC) |
| ------------------ | -------------------------------- | ----------------------------- | ---------------------- |
| `/sponsors`        | **open** (SEASON + OFFSEASON)    | LFE-SPONSORS-01 CLOSED (D99)  | —                      |
| `/board`           | **open** (SEASON + OFFSEASON)    | LFE-BOARD-01 CLOSED (D105)    | —                      |
| `/stadium`         | **open** (SEASON + OFFSEASON)    | LFE-STADIUM-01 CLOSED (D111)  | —                      |
| `/transfers`       | locked gdy `!transferWindowOpen` | Okno po progach meczów (Thin) | (już w Transfers)      |
| `/training`        | locked gdy `!trainingUnlocked`   | Po progach played (Thin)      | (już w Training)       |
| Liga / Finanse / … | locked na EARLY_CLUB / NEW_CLUB  | Progressive disclosure Hub    | First Match + fixtures |

---

## 10. Roadmapa oficjalna (kolejność Ownera · 2026-08-03)

Brak EPIC **IN PROGRESS**. Start **wyłącznie** po **Owner GO** (zwykle od AUDIT).

**LFE-AGE-01** = **CLOSED** (`6a54722` · D122).  
**LFE-RATINGS-V2** = **CLOSED** (`962f0a8`).  
**LFE-PUBLIC-API-01** = **CLOSED** (`ce00327` · D119–D121).  
**TD-03+ / LFE-TRANSFERS-10** = **CLOSED** (`9424dd8` · D116–D118).

```
League World  ·  §22 push/email  ·  Career Decline
```

| #   | EPIC                            | Notatka         |
| --- | ------------------------------- | --------------- |
| 1   | League World (AI po tier)       | osobny Owner GO |
| 2   | Kanał push / email (§22 Future) | osobny Owner GO |
| 3   | Career Decline (po AGE-01)      | osobny Owner GO |

**Alternatywy FUTURE:** `/advanced` · Physics · multi-tier AI · Ticket Economy · Prime / Retirement.

SSOT listy: [`../ROADMAP.md`](../ROADMAP.md).

---

## 11. Rekomendowany następny EPIC

### **Czekaj na Owner GO → League World / §22 / Career Decline**

**Uzasadnienie:** LFE-AGE-01 CLOSED · Domain `6a54722` · D122 Age++ H-AGE wired. ROADMAP PLANNED: League World · §22 · Career Decline.

**Zakaz teraz:** AUDIT / PLAN / IMPLEMENT bez Owner GO · Fake Production · Physics „przy okazji” · druga ścieżka settle · import `/testing` w web.

**Nie zaczynaj** kolejnego EPIC bez **Owner GO**.

---

## 12. NOWA SESJA AI (ChatGPT)

### Od czego zacząć

1. [`AI_QUICK_START.md`](./AI_QUICK_START.md) — 1 ekran
2. **Ten plik** — kontekst sesji
3. [`START_HERE.md`](./START_HERE.md) — mapa + zakazy
4. [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) — hashe
5. [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../ROADMAP.md`](../ROADMAP.md)
6. [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md) — skrót D\*
7. Task-specific: GDD / platform / `MODULE_MAP` dopiero po Owner GO na EPIC

### Czego nie wolno

- Polegać na historii czatu — tylko **`docs/` + kod**.
- Commit / push / IMPLEMENT bez **Owner Approval Gate**.
- Scope creep poza Thin IN/OUT EPICu.
- Fake Production / runtime mocki / atrapy w soft-lockach.
- Duplikować resolvery / settlement / planner fixtures.
- Łamać **Contract First** (GDD/kontrakt przed kodem, gdy wymagane).

### Obowiązujący workflow

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VERIFY → COMMIT → PUSH
  → CI → PRODUCTION VERIFY → DOCS SYNC → EPIC CLOSE → FINAL DOCS VERIFY
```

### SSOT (nie kopiuj między plikami)

| Fakt                | Dokument                                                                     |
| ------------------- | ---------------------------------------------------------------------------- |
| Hashe / tipy        | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)                               |
| Status projektu     | [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)                               |
| Lista EPIC          | [`../ROADMAP.md`](../ROADMAP.md)                                             |
| Decyzje D\* pełne   | [`../DECISIONS.md`](../DECISIONS.md)                                         |
| Skrót D\*           | [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md)                 |
| Season End kontrakt | [`../game-design/GDD-SEASON-END-01.md`](../game-design/GDD-SEASON-END-01.md) |

### Zasady nienegocjowalne

**SSOT FIRST** · **Contract First** · **Reuse First** · **ZERO DUPLICATE LOGIC** · **ZERO Fake Production** · **ZERO Scope Creep** · **Owner Approval Gate** · **Presentation ≠ Domain** · **Information Thin** · **RESOLVER FIRST**.

---

## 13. NOWY AGENT CURSOR

### Jak zacząć

1. Root [`AGENTS.md`](../../AGENTS.md)
2. [`AI_QUICK_START.md`](./AI_QUICK_START.md) → **ten handoff** → [`START_HERE.md`](./START_HERE.md)
3. [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) · [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md)
4. Po Owner GO na EPIC: kontrakt GDD/PLAN + `MODULE_MAP` + kod wejścia

### Czego nie implementować bez Owner GO

- Żadnego nowego EPICu (League World / §22 / Career Decline / `/advanced` / Physics) bez Owner GO.
- Ticket Economy · Stadium expand · Prestige/Quest · multi-tier AI catalogs · Prime / Retirement.
- Drugiego `planClubFixtures` / standings DB / Fake Production.
- Commitów i pushy „przy okazji”.

### Każda większa funkcjonalność = pełny pipeline

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VERIFY → COMMIT → PUSH
  → PRODUCTION VERIFY → DOCS SYNC → EPIC CLOSE
```

Role: Owner (ChatGPT) = Technical Product Owner / GO / HOLD.  
Cursor Agent = Senior Engineer — wykonuje po GO; docs+code SSOT; bez historii czatu.

### Na co uważać (Cursor)

- Prettier CI gate przed merge/`main`.
- Migracje Supabase tylko gdy EPIC wymaga i Owner GO.
- UI presentation EPIC ≠ zmiana DTO/unlock/resolver bez domain GO.
- Soft-lock: reuse `SoftLockRouteGate` / `SoftLockState` (D66) — nie PlaceholderPage.

---

## 14. Owner Decisions (nienaruszalne)

1. **Owner GO** przed IMPLEMENT (kod) / COMMIT / PUSH / CLOSE.
2. **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC** · **Contract First**.
3. **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED ≠ RUNTIME** · **ZERO Fake Production**.
4. **Single Settlement Path** — tylko `completeTransferBuy` / `completeTransferSell`.
5. Hub = decyzja · First Match przed Hubem · `first_match_completed_at`.
6. Canvas / Replay **nigdy** nie wołają Engine i nie mutują `MatchState`.
7. UI presentation → Guide §16; bez driftu DNA / Style Lock.
8. Branding K1+K3 i World Art — zmiana tylko osobnym EPIC + GO.
9. §26 = SSOT liczb Thin; D18/D20 = SSOT implementacji economy/transfers.
10. Kalendarz **22** (D28) · Season End Thin CLOSED (D68–D87) · Age++ Thin CLOSED (D122 · H-AGE) · Promotion Thin CLOSED (D88–D94) · Sponsors Thin CLOSED (D95–D101) · Board Thin CLOSED (D102–D108) · Stadium Thin CLOSED (D109–D115) · Transfers-10 / TD-03+ CLOSED (D116–D118) · LFE PUBLIC surface CLOSED (D119–D121).
11. Decyzje **D1–D122** obowiązują — pełny rejestr: [`../DECISIONS.md`](../DECISIONS.md); skrót: [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md).

---

## 15. Known Constraints

- Thin Slice wszędzie w platformie — świadome limity vs pełne GDD.
- Domain tip = **AGE-01** (`6a54722`); prior RATINGS-V2 `962f0a8`; Presentation MOTION `9fd14fc`; UI P0 `54d0724`.
- Soft-lock Sponsors/Board/Stadium = **open** (D99/D105/D111); windowed: transfers/training.
- Brak: AI clubs · escrow · timeout · Physics · XP/attribute DB · Ranking ELO · Achievements XP · Messages DB · §6 engine · Stadium Ticket/expand · Board Prestige/Quest · sponsor marketplace · multi-tier AI / baraże · `completeLiveTransfer()` · `@lastfootball/lfe/advanced` · Career Decline / Prime / Retirement Depth.
- Migracje prod: training · potential · academy_track · scout_shortlist · fee helpers · season_number/season_phase · league_tier · **club_sponsor_contracts**; Messages/Club/SoftLock/Board/Stadium/TRANSFERS-10/PUBLIC-API-01/RATINGS-V2/AGE-01 = brak migracji.
- Sekrety `.env` — nigdy w git · Force-push `main` — zakaz.

---

## 16. Quality Gates (workflow)

```
AUDIT → (RCA jeśli regresja) → PLAN → OWNER GO → IMPLEMENT → VERIFY
  → COMMIT → PUSH → CI GREEN → PRODUCTION VERIFY
  → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

| Etap              | Zasada                                                    |
| ----------------- | --------------------------------------------------------- |
| AUDIT             | stan kodu/docs · luki · ryzyka — **bez** IMPLEMENT bez GO |
| PLAN              | scope · AC · poza zakresem · SSOT                         |
| OWNER GO          | jedyny sygnał do kodu / commit / push                     |
| IMPLEMENT         | tylko scope PLAN                                          |
| VERIFY            | format · typecheck · lint · test · build                  |
| COMMIT            | jeden spójny commit; bez sekretów                         |
| PUSH              | `main` lub uzgodniony branch                              |
| CI                | GREEN obowiązkowe przed CLOSE                             |
| PRODUCTION VERIFY | Vercel / smoke / migracje gdy feat                        |
| DOCS CLOSE…       | sync SSOT · tip pin · **EPIC FULLY CLOSED**               |

Szczegóły: [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) · [`../WORKFLOW.md`](../WORKFLOW.md).

---

## 17. Current Project Health

| Obszar       | Ocena        | Komentarz                                                                                          |
| ------------ | ------------ | -------------------------------------------------------------------------------------------------- |
| Architektura | **Silna**    | Warstwy jasne · resolvery · LFE izolowany · Season lifecycle Thin                                  |
| Kod          | **Dobry**    | Thin Slice spójny · CI zielone                                                                     |
| UI           | **Dobry+**   | Night Pitch Office P0 + Landing/Auth spójne                                                        |
| UX           | **Dobry**    | Hub decision-first · SoftLock · OFFSEASON CTA                                                      |
| Gameplay     | **Thin+**    | Pełna pętla sezonu 22 + N+1 Confirm · Training · Transfers · Academy · Scouting · Info Thin layers |
| Dokumentacja | **Aktualna** | AGE-01 CLOSE · Domain tip `6a54722` · D1–D122                                                      |
| CI           | **GREEN**    | tip `main` VERIFIED                                                                                |
| Production   | **GREEN**    | Vercel · Domain `6a54722` · brak migracji AGE-01                                                   |

---

## Powiązania

| Dokument                                                     | Rola                                     |
| ------------------------------------------------------------ | ---------------------------------------- |
| [`AI_QUICK_START.md`](./AI_QUICK_START.md)                   | 1 ekran                                  |
| [`ARCHITECTURAL_DECISIONS.md`](./ARCHITECTURAL_DECISIONS.md) | skrót D\* + Thin principles              |
| [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)               | **SSOT hashy**                           |
| [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)               | **SSOT statusu**                         |
| [`../ROADMAP.md`](../ROADMAP.md)                             | **SSOT listy EPIC**                      |
| [`../HANDOFF.md`](../HANDOFF.md)                             | krótki alias                             |
| [`../MASTER_HANDOFF.md`](../MASTER_HANDOFF.md)               | mapa architektury (bez kopiowania hashy) |

## Last updated

2026-08-03 — LFE-AGE-01 FULLY CLOSED · Domain `6a54722` · next Owner GO → League World / §22 / Career Decline
