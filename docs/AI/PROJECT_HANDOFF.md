# PROJECT HANDOFF — Last Football

**EPIC:** LFE-HANDOFF-01  
**Etap:** PROJECT HANDOFF & AI ONBOARDING  
**Status:** ACTIVE — master handoff dla nowej sesji ChatGPT / Cursor  
**Data:** 2026-07-30

> **Cel:** cold start nowej sesji AI w **&lt; 5 minut** — wyłącznie z `docs/` + kodu.  
> **Nie** zastępuje SSOT statusu / baseline / listy EPIC — **łączy** je w jeden dokument startowy.  
> Hashe i listy źródłowe: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../ROADMAP.md`](../ROADMAP.md).

---

## 1. Aktualny baseline

| Pole                            | Wartość                                                                                      |
| ------------------------------- | -------------------------------------------------------------------------------------------- |
| **Production Version**          | UI P0 + Academy + **Scouting** + MOTION-01 + GDD-16…**22**                                   |
| **Production Baseline (UI P0)** | `54d0724` — **LFE-UI-IMPL-06** (Live → Post fidelity)                                        |
| **Domain feature baseline**     | `93fd6d5` — **LFE-SCOUTING-01** (Information Thin · shortlist)                               |
| **Presentation tip**            | `9fd14fc` — **LFE-UI-MOTION-01** (Hub/Match presentation motion Thin)                        |
| **Documentation tip**           | `cae2323` — **LFE-SCOUTING-01** CLOSE sync (pin)                                             |
| **Branch**                      | `main`                                                                                       |
| **Status**                      | PRODUCTION VERIFIED · GREEN · **SCOUTING-01 CLOSED** · ACADEMY-01 · M2.5 · next **DAILY-01** |

| **Production URL** | https://lastfootball.vercel.app |
| **Alias** | https://lastfootball.pl |
| **CI Status** | GREEN wymagane na tip `main` po FIX CLOSE (Format · Typecheck · Lint · Test · Build) |

```bash
git log -1 --oneline                    # tip (docs / presentation)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline cae2323     # Documentation tip SCOUTING-01 CLOSE (pin)
git log -1 --oneline 93fd6d5            # Domain SCOUTING-01
git log -1 --oneline 9c6fe86            # Prior Domain ACADEMY-01
git log -1 --oneline 9fd14fc            # LFE-UI-MOTION-01 presentation tip
```

**Prod deploy:** Vercel Production śledzi `main` (Domain Scouting `93fd6d5` · presentation MOTION-01 `9fd14fc` · docs tip CLOSE pin).

**Operacyjne:** Migracje Supabase na prod: training · potential/match dev · **`academy_track`** · **`scout_shortlist`** — zastosowane.  
`scout_shortlist` = wyłącznie `(club_id, player_id)` → `players.id` (nie drugi model); shortlista bez wpływu na AI/rynek/transfery/potencjał/symulację.

---

## 2. Co zostało ukończone

### Platforma / gameplay Thin

| EPIC                                           | Skrót                                                                              |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth · klub · First Match · Hub EARLY_CLUB/SEASON                                  |
| LFE-LEAGUE-01…03                               | Fixtures · tabela derive · 11 meczów Thin                                          |
| LFE-ECONOMY-01                                 | Cash Thin · `/finance` (D18)                                                       |
| LFE-PLAYERS-01 · **LFE-PLAYERS-02**            | Kadra `players` + **Development Thin** (potential · match) (D19/D22)               |
| **LFE-ACADEMY-01**                             | **Academy Thin A** · Intake + Promote · `academy_track` (D23) · `9c6fe86`          |
| **LFE-SCOUTING-01**                            | **Scouting Information Thin** · `resolveClubScouting` · shortlist refs · `93fd6d5` |
| LFE-TRANSFERS-01…08                            | Rynek → listing → nego → Instant → Pending → **1× Counter** (D20)                  |
| LFE-TRAINING-01 · LFE-TRAINING-02              | Trening Thin + Depth (skill · XI Gate · RPC) (D21)                                 |
| GDD-§26A / §26B                                | SSOT liczb + sync `ECONOMY_THIN`                                                   |
| **GDD-16**                                     | **Akademia Thin A** (Intake + Promote) · docs `4805f7e`                            |
| **GDD-17**                                     | **Skauting Information Thin B** · docs `2595cc9`                                   |
| **GDD-18**                                     | **Ranking Thin** (sezonowy ranking klubów) · tip `4dedd71`                         |
| **GDD-19**                                     | **Osiągnięcia Thin** (kamienie / historia) · tip `2c619ca`                         |
| **GDD-21**                                     | **Wiadomości Thin** · content `bf07a44` · tip `c24efef`                            |
| **GDD-22**                                     | **Powiadomienia Thin** · content `09b85e7` · tip `f871ca8`                         |
| **M2.5**                                       | **PASS** · First Domain Implementation Review                                      |

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
- UI presentation ≠ zmiana DTO / unlock / settlement (Guide §16).
- Visual DNA / Style Lock / World Art / tokeny / branding SVG — **bez driftu** bez osobnego Owner GO.
- Kalendarz Thin = **11** fixtures (≠ GDD 22) — świadomy wyjątek.

Pełny indeks: [`DECISIONS.md`](./DECISIONS.md) · [`../DECISIONS.md`](../DECISIONS.md).

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

| Domen           | SSOT                                                                                            |
| --------------- | ----------------------------------------------------------------------------------------------- |
| Cash            | `cash_balance` + `resolveClubFinance`                                                           |
| Transfery       | `resolveTransferMarket` · envelope · listing · offers · settle buy/sell                         |
| Liga            | `fixtures` · `resolveLeagueTable`                                                               |
| Kadra           | `players` (+ `potential` · `academy_track`) · `resolveClubSquad` · match development · pasma UI |
| Akademia        | `resolveClubAcademy` · Intake/Promote · max 3 · D23                                             |
| Trening         | `resolveClubTraining` · `last_training_on` · skill Thin ≤ potential · XI Gate · senior filter   |
| Hub             | `resolveHubPhase` · `resolvePrimaryCta`                                                         |
| UI presentation | `UI_DESIGN_GUIDE.md` §16 · `UI_COPY`                                                            |
| Produkt         | GDD                                                                                             |
| Obraz           | Visual DNA · Style Lock · World Art registry                                                    |

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

### Co działa (Thin Slice na produkcji)

- Onboarding → Club Wizard → First Match (Tunnel → VS → Pre → XI → Live → Post) → Welcome LF → Hub
- Hub EARLY_CLUB → SEASON · Primary CTA · soft-locks
- Liga (11 fixtures) · tabela derive · Terminarz
- Finanse (cash + movements)
- Kadra / Squad (+ pasma potencjału)
- Transfery: listing · Instant Buy/Sell · Pending · 1× Counter · envelope ratio 1
- Trening drużynowy **Depth**: status + skill Thin (anti-farm; ≤ potential) · XI Gate · feedback sesji
- **Akademia Thin A**: Intake + Promote · `/academy` · `academy_track` · unlock SEASON
- **Skauting Thin B**: `/scouting` · `resolveClubScouting` · prywatna shortlista (refs only) · unlock SEASON
- Match development (PRIMARY): +1 / K_MATCH=5 / starters · Post Match signals
- Match Live + Canvas + Replay + Post (immersive chrome na `/match/*`)

### Co jest Thin (świadome limity)

11 fixtures ≠ 22 · brak XP / attribute DB · **brak kodu Rankingu** (GDD §18 Thin = docs only) · **brak kodu Osiągnięć** (GDD §19 Thin = docs only) · **brak kodu Wiadomości** (GDD §21 Thin = docs only) · **brak kanału push** (GDD §22 Thin = polityka only) · brak auto season-end age++ · envelope ratio = 1 · 1× Counter · brak escrow/timeout/AI pending · brak Physics · Board/Sponsors UI niepełne · trening bez cash cost / kontuzji treningowych / timezone gracza · potential w UI tylko jako **pasmo** · akademia bez poziomów/cash-gate/youth OVR · skauting bez fog/regionów/misji/kosztów/scout_score.

### Planowane (Owner wybiera)

**LFE-DAILY-01** READY FOR AUDIT · potem LFE-ACHIEVEMENTS / RANKING (kod).

---

## 8. UI (stan ekranów)

| Obszar        | Stan                                                                                      |
| ------------- | ----------------------------------------------------------------------------------------- |
| **Landing**   | CLOSED · LFE-LANDING-01 · Tunnel hero · CTAs (Załóż klub / Zaloguj → modal)               |
| **Branding**  | CLOSED · LFE-BRANDING-01B · logo system w chrome + meta                                   |
| **Login**     | CLOSED · LFE-AUTH-UX-01 · Modal na Landing + `/login` AuthStage                           |
| **Register**  | CLOSED · AuthStage · CTA „Rozpocznij karierę” · presentation only                         |
| **Hub**       | CLOSED UI P0 · decision-first · **MOTION-01** enter/press · Night Pitch Office            |
| **Match**     | CLOSED IMPL-02/05/06 · Path immersive · XI · Live/Post · **MOTION-01** Goal/Final overlay |
| **Squad**     | CLOSED IMPL-03/05 + PLAYERS-02 · resolver `resolveClubSquad` · pasma potential            |
| **Academy**   | CLOSED **LFE-ACADEMY-01** · `resolveClubAcademy` · Intake/Promote · D23 · `9c6fe86`       |
| **Scouting**  | CLOSED **LFE-SCOUTING-01** · `resolveClubScouting` · shortlist refs · `93fd6d5`           |
| **Training**  | CLOSED TRAINING-01/02 · Depth skill + XI Gate · ceiling potential (D22)                   |
| **Transfers** | CLOSED Thin 01–08 + presentation                                                          |
| **Finance**   | CLOSED Thin + presentation                                                                |
| **Motion**    | CLOSED **LFE-UI-MOTION-01** · shared `motion.css` · Guide §8 · `9fd14fc`                  |

---

## 9. Otwarte EPICi (priorytet)

Brak EPIC **IN PROGRESS**. Kandydaci **PLANNED**:

| #   | EPIC / temat                    | Priorytet | Notatka                        |
| --- | ------------------------------- | --------- | ------------------------------ |
| 1   | **LFE-DAILY-01** (kod)          | **P0**    | READY FOR AUDIT · po Owner GO  |
| 2   | LFE-ACHIEVEMENTS-01 / RANKING   | P1        | Kolejność strategii hybrydowej |
| 3   | Full 22-fixture season          | P2        | Wymaga decyzji vs Thin 11      |
| 4   | Transfers hardening             | P2        | Tech debt                      |
| 5   | Ratings v2 · LFE PUBLIC trim    | P3        | Chore / depth                  |
| 6   | Kanał push / email (§22 Future) | P3        | Po osobnym Owner GO            |

SSOT listy: [`../ROADMAP.md`](../ROADMAP.md).

---

## 10. Rekomendowany następny EPIC

### **LFE-DAILY-01 — Daily loop (kod)**

**Uzasadnienie:** LFE-SCOUTING-01 FULLY CLOSED (`93fd6d5`). Strategia: następny Thin kod = Daily.

**Zakaz teraz:** AUDIT / PLAN / IMPLEMENT LFE-DAILY-01 — bez Owner GO.

**Nie zaczynaj** bez **Owner GO**.
---

## 11. Onboarding dla nowego AI

### Kolejność (obowiązkowa)

| #   | Dokument                                                     | Po co                                     |
| --- | ------------------------------------------------------------ | ----------------------------------------- |
| 0   | [`AI_QUICK_START.md`](./AI_QUICK_START.md)                   | 1 ekran                                   |
| 1   | **Ten plik** (`PROJECT_HANDOFF.md`)                          | pełny kontekst sesji                      |
| 2   | [`START_HERE.md`](./START_HERE.md)                           | mapa + zakazy                             |
| 3   | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md)               | hashe Production / Domain / tip           |
| 4   | [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md)               | status SSOT                               |
| 5   | [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)           | warstwy                                   |
| 6   | [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md) | filozofia                                 |
| 7   | [`COMMON_PATTERNS.md`](./COMMON_PATTERNS.md)                 | wzorce                                    |
| 8   | [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md)                     | pipeline + Owner GO                       |
| 9   | [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md)             | CI / commit                               |
| 10  | Task-specific                                                | `MODULE_MAP` · platform · Guide §16 · GDD |

**Cursor:** start od root [`AGENTS.md`](../../AGENTS.md).

### Na co uważać

- Nie polegaj na historii czatu — tylko `docs/` + kod.
- Nie commituj / nie pushuj bez **Owner GO**.
- UI EPIC ≠ zmiana resolverów / DTO / unlock.
- Nie edytuj World Art / DNA / tokenów / brand SVG „przy okazji”.
- Transfery: Single Settlement Path.
- Match: mutacje tylko CommandBus / session API.

---

## 12. Owner Decisions (nienaruszalne)

1. **Owner GO** przed IMPLEMENT (kod) / COMMIT / PUSH / CLOSE.
2. **SSOT FIRST** · **REUSE FIRST** · **ZERO DUPLICATE LOGIC**.
3. **RESOLVER FIRST** · **THIN SLICE** · **NO RUNTIME MOCKS** · **SEED ≠ RUNTIME**.
4. **Single Settlement Path** — tylko `completeTransferBuy` / `completeTransferSell`.
5. Hub = decyzja · First Match przed Hubem · `first_match_completed_at`.
6. Canvas / Replay **nigdy** nie wołają Engine i nie mutują `MatchState`.
7. UI presentation → Guide §16; bez driftu DNA / Style Lock.
8. Branding K1+K3 i World Art — zmiana tylko osobnym EPIC + GO.
9. §26 = SSOT liczb Thin; D18/D20 = SSOT implementacji economy/transfers.
10. Kalendarz **11** fixtures Thin — nie „cicho” robić 22 bez GO.

---

## 13. Known Constraints

- Thin Slice wszędzie w platformie — świadome limity vs pełne GDD.
- `LEAGUE_FIXTURE_COUNT=11` ≠ GDD home+away 22.
- Brak: AI clubs · 2+ counters · buyer Counter · escrow · timeout · Physics · individual training · XP / attribute DB · **kod Rankingu** · **kod Osiągnięć** · auto age++ · envelope ≠ 1 · full Board/Sponsors · numeric potential UI · academy levels / youth OVR · scout fog/misje/koszty/scout_score.
- Domain tip = SCOUTING-01 (`93fd6d5`); Presentation tip = MOTION-01 (`9fd14fc`); prior Domain ACADEMY `9c6fe86`; UI P0 = `54d0724`.
- Motion Thin: CSS-only · Hub/Match only · Guide §8 — bez Landing/nav/routes/Live tick.
- Ranking Thin (GDD-18): sezonowy ranking klubów · docs only · placeholder `/rankings` ≠ SSOT.
- Osiągnięcia Thin (GDD-19): kamienie / historia · docs only · placeholder `/achievements` ≠ SSOT.
- Academy Thin A (D23): `academy_track` · `resolveClubAcademy` · max 3 · PRODUCTION VERIFIED.
- Scouting Thin B: `resolveClubScouting` · `scout_shortlist` refs only · shortlista ≠ świat gry · PRODUCTION VERIFIED.
- Sekrety `.env` — nigdy w git.
- Force-push / rewrite `main` — zakazane.
- Node 20 deprecation warning w GHA — informacyjny, nie blokuje CI.
- Migracje Supabase na prod: training · potential/match dev · **academy_track** · **scout_shortlist** — zastosowane.

---

## 14. Quality Gates (workflow)

```
AUDIT → (RCA jeśli regresja) → PLAN → OWNER GO → IMPLEMENT → VERIFY
  → COMMIT → PUSH → CI GREEN → PRODUCTION VERIFY → CLOSE
```

| Etap              | Zasada                                                       |
| ----------------- | ------------------------------------------------------------ |
| AUDIT             | stan kodu/docs · luki · ryzyka — **bez** IMPLEMENT bez GO    |
| PLAN              | scope · AC · poza zakresem · SSOT                            |
| OWNER GO          | jedyny sygnał do kodu / commit / push                        |
| IMPLEMENT         | tylko scope PLAN                                             |
| VERIFY            | format · typecheck · lint · test · build                     |
| COMMIT            | jeden spójny commit; bez sekretów                            |
| PUSH              | `main` lub uzgodniony branch                                 |
| CI                | GREEN obowiązkowe przed CLOSE                                |
| PRODUCTION VERIFY | Vercel / smoke krytycznej ścieżki gdy feat                   |
| CLOSE             | sync ROADMAP · PROJECT_STATUS · CURRENT_BASELINE · CHANGELOG |

Szczegóły: [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) · [`../WORKFLOW.md`](../WORKFLOW.md).

---

## 15. Current Project Health

| Obszar       | Ocena        | Komentarz                                                            |
| ------------ | ------------ | -------------------------------------------------------------------- |
| Architektura | **Silna**    | Warstwy jasne · resolvery · LFE izolowany                            |
| Kod          | **Dobry**    | Thin Slice spójny · CI zielone                                       |
| UI           | **Dobry+**   | Night Pitch Office P0 + Landing/Auth spójne                          |
| UX           | **Dobry**    | Front door zamknięty; Hub decision-first                             |
| Gameplay     | **Thin+**    | Pętla sezonu + Training + Match development + Academy + **Scouting** |
| Dokumentacja | **Aktualna** | SCOUTING-01 CLOSE · Domain `93fd6d5` · Presentation `9fd14fc`        |
| CI           | **GREEN**    | tip feat fix VERIFIED · docs CLOSE na kolejnym tipie                 |
| Production   | **GREEN**    | Vercel · Domain SCOUTING-01 `93fd6d5`                                |

---

## Powiązania

| Dokument                                       | Rola                                     |
| ---------------------------------------------- | ---------------------------------------- |
| [`AI_QUICK_START.md`](./AI_QUICK_START.md)     | 1 ekran                                  |
| [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) | **SSOT hashy**                           |
| [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) | **SSOT statusu**                         |
| [`../ROADMAP.md`](../ROADMAP.md)               | **SSOT listy EPIC**                      |
| [`../HANDOFF.md`](../HANDOFF.md)               | krótki alias                             |
| [`../MASTER_HANDOFF.md`](../MASTER_HANDOFF.md) | mapa architektury (bez kopiowania hashy) |

## Last updated

2026-07-30 — LFE-SCOUTING-01 CLOSED · Domain `93fd6d5` · next **LFE-DAILY-01 READY FOR AUDIT**
