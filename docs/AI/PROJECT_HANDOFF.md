# PROJECT HANDOFF — Last Football

**EPIC:** LFE-HANDOFF-01  
**Etap:** PROJECT HANDOFF & AI ONBOARDING  
**Status:** ACTIVE — master handoff dla nowej sesji ChatGPT / Cursor  
**Data:** 2026-07-29

> **Cel:** cold start nowej sesji AI w **&lt; 5 minut** — wyłącznie z `docs/` + kodu.  
> **Nie** zastępuje SSOT statusu / baseline / listy EPIC — **łączy** je w jeden dokument startowy.  
> Hashe i listy źródłowe: [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) · [`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../ROADMAP.md`](../ROADMAP.md).

---

## 1. Aktualny baseline

| Pole                            | Wartość                                                               |
| ------------------------------- | --------------------------------------------------------------------- |
| **Production Version**          | UI P0 Night Pitch Office + Landing · Branding · Auth UX               |
| **Production Baseline (UI P0)** | `54d0724` — **LFE-UI-IMPL-06** (Live → Post fidelity)                 |
| **Domain feature baseline**     | `9b1c575` — **LFE-TRANSFERS-08** (bez zmian domenowych od UI P0)      |
| **Presentation tip**            | `9dc834a` — **LFE-AUTH-UX-01** (Landing + Branding + Auth UX na prod) |
| **Documentation tip**           | `a6f3951` — **LFE-HANDOFF-01** CLOSED                                 |
| **Branch**                      | `main`                                                                |
| **Status**                      | PRODUCTION VERIFIED · GREEN · brak otwartego EPIC produktowego        |
| **Production URL**              | https://lastfootball.vercel.app                                       |
| **Alias**                       | https://lastfootball.pl                                               |
| **CI Status**                   | GREEN na tip `main` (Format · Typecheck · Lint · Test · Build)        |

```bash
git log -1 --oneline                    # tip (docs / presentation)
git log -1 --oneline 54d0724            # Production Baseline UI P0
git log -1 --oneline 9b1c575            # Domain TRANSFERS-08
git log -1 --oneline 9dc834a            # Auth UX feat (presentation tip)
```

**Prod deploy:** Vercel Production śledzi `main` (ostatni znany deploy SHA = tip po AUTH-UX / HANDOFF).

---

## 2. Co zostało ukończone

### Platforma / gameplay Thin

| EPIC                                           | Skrót                                                             |
| ---------------------------------------------- | ----------------------------------------------------------------- |
| LFE-PLATFORM-01 · INFRA-01 · MATCH-01 · HUB-01 | Auth · klub · First Match · Hub EARLY_CLUB/SEASON                 |
| LFE-LEAGUE-01…03                               | Fixtures · tabela derive · 11 meczów Thin                         |
| LFE-ECONOMY-01                                 | Cash Thin · `/finance` (D18)                                      |
| LFE-PLAYERS-01                                 | Kadra `players` (D19)                                             |
| LFE-TRANSFERS-01…08                            | Rynek → listing → nego → Instant → Pending → **1× Counter** (D20) |
| LFE-TRAINING-01                                | Trening drużynowy Thin (D21)                                      |
| GDD-§26A / §26B                                | SSOT liczb + sync `ECONOMY_THIN`                                  |

### Silnik / Match UI

LFE EPIC-1…7 · Architecture Freeze · Live Bridge · Canvas · Replay · Post · Ratings · Match Path immersive (IMPL-02/06).

### Design / World Art / DS

GDD-01…15 · §20 · §23 · §26 · Art Bible · World Art **CLOSED** (165 assets) · Visual DNA **LOCKED** · Style Lock **ACTIVE** · Hi-Fi · Proto · Playtest → GO impl.

### UI P0 (Night Pitch Office)

IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01 · DOCS-BASELINE-01 — **Production Baseline** `54d0724`.

### Marketing / Auth presentation (po UI P0)

| EPIC                 | Commit    | Skrót                                                 |
| -------------------- | --------- | ----------------------------------------------------- |
| **LFE-LANDING-01**   | `ffa20c6` | Landing marketing · Tunnel hero · full-bleed          |
| **LFE-BRANDING-01B** | `1fbd6b5` | Logo K1+K3 · favicons · OG · BrandLogo                |
| **LFE-AUTH-UX-01**   | `9dc834a` | Login Modal · premium `/login` · `/register` · header |

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

| Domen           | SSOT                                                                    |
| --------------- | ----------------------------------------------------------------------- |
| Cash            | `cash_balance` + `resolveClubFinance`                                   |
| Transfery       | `resolveTransferMarket` · envelope · listing · offers · settle buy/sell |
| Liga            | `fixtures` · `resolveLeagueTable`                                       |
| Kadra           | `players` · `resolveClubSquad`                                          |
| Trening         | `resolveClubTraining` · `last_training_on`                              |
| Hub             | `resolveHubPhase` · `resolvePrimaryCta`                                 |
| UI presentation | `UI_DESIGN_GUIDE.md` §16 · `UI_COPY`                                    |
| Produkt         | GDD                                                                     |
| Obraz           | Visual DNA · Style Lock · World Art registry                            |

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
- Kadra / Squad
- Transfery: listing · Instant Buy/Sell · Pending · 1× Counter · envelope ratio 1
- Trening drużynowy (status-only, dzień UTC)
- Match Live + Canvas + Replay + Post (immersive chrome na `/match/*`)

### Co jest Thin (świadome limity)

11 ≠ 22 fixtures · brak skill growth z treningu · envelope ratio = 1 · 1× Counter · brak escrow/timeout/AI pending · brak Physics · Board/Sponsors UI niepełne.

### Planowane (Owner wybiera)

GDD-16+ · Training depth · full 22 fixtures · LFE-UI-MOTION-01 · hardening transferów (SQL↔TS fee / single live RPC) · Ratings v2 · LFE PUBLIC trim.

---

## 8. UI (stan ekranów)

| Obszar        | Stan                                                                        |
| ------------- | --------------------------------------------------------------------------- |
| **Landing**   | CLOSED · LFE-LANDING-01 · Tunnel hero · CTAs (Załóż klub / Zaloguj → modal) |
| **Branding**  | CLOSED · LFE-BRANDING-01B · logo system w chrome + meta                     |
| **Login**     | CLOSED · LFE-AUTH-UX-01 · Modal na Landing + `/login` AuthStage             |
| **Register**  | CLOSED · AuthStage · CTA „Rozpocznij karierę” · presentation only           |
| **Hub**       | CLOSED UI P0 · decision-first · Night Pitch Office                          |
| **Match**     | CLOSED IMPL-02/05/06 · Path immersive · XI · Live/Post fidelity             |
| **Squad**     | CLOSED IMPL-03/05 · resolver `resolveClubSquad`                             |
| **Training**  | CLOSED Thin + presentation IMPL-03                                          |
| **Transfers** | CLOSED Thin 01–08 + presentation                                            |
| **Finance**   | CLOSED Thin + presentation                                                  |

---

## 9. Otwarte EPICi (priorytet)

Brak EPIC **IN PROGRESS**. Kandydaci **PLANNED** (kolejność rekomendowana):

| #   | EPIC / temat                         | Priorytet            | Notatka                                    |
| --- | ------------------------------------ | -------------------- | ------------------------------------------ |
| 1   | **Training depth** (skill / XI gate) | **P0 rekomendowany** | Domknięcie daily loop po polish front door |
| 2   | GDD-16+                              | P1                   | Docs produktowe — Owner GO                 |
| 3   | LFE-UI-MOTION-01                     | P1                   | Opcjonalny polish motion po UI P0          |
| 4   | Full 22-fixture season               | P2                   | Wymaga decyzji vs Thin 11                  |
| 5   | Transfers hardening                  | P2                   | Tech debt — `TRANSFER_ARCHITECTURE.md`     |
| 6   | Ratings v2 · LFE PUBLIC trim         | P3                   | Chore / depth                              |

SSOT listy: [`../ROADMAP.md`](../ROADMAP.md).

---

## 10. Rekomendowany następny EPIC

### **Training depth (skill / XI gate)**

**Uzasadnienie:** Front door (Landing · Brand · Auth) i UI P0 Hub/Match są zamknięte. Największy zwrot dla gracza to pogłębienie **pętli tygodnia menedżera** (trening → skład → mecz), bez ruszania Visual DNA ani settlement transferów. Alternatywa docs-only: **GDD-16+**, jeśli Owner chce najpierw produkt na papierze.

**Nie zaczynaj** bez AUDIT → PLAN → **Owner GO**.

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
- Brak: AI clubs · 2+ counters · buyer Counter · escrow · timeout · Physics · individual training skill growth · envelope ≠ 1 · full Board/Sponsors.
- UI P0 / Landing / Auth **nie** zmieniają Domain baseline TRANSFERS-08.
- Sekrety `.env` — nigdy w git.
- Force-push / rewrite `main` — zakazane.
- Node 20 deprecation warning w GHA — informacyjny, nie blokuje CI.

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

| Obszar       | Ocena        | Komentarz                                   |
| ------------ | ------------ | ------------------------------------------- |
| Architektura | **Silna**    | Warstwy jasne · resolvery · LFE izolowany   |
| Kod          | **Dobry**    | Thin Slice spójny · CI zielone              |
| UI           | **Dobry+**   | Night Pitch Office P0 + Landing/Auth spójne |
| UX           | **Dobry**    | Front door zamknięty; Hub decision-first    |
| Gameplay     | **Thin OK**  | Pełna pętla sezonu Thin; depth = next       |
| Dokumentacja | **Aktualna** | HANDOFF-01 · baseline warstwy               |
| CI           | **GREEN**    | tip `main`                                  |
| Production   | **GREEN**    | Vercel · baseline UI P0 + presentation tip  |

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

2026-07-29 — LFE-HANDOFF-01
