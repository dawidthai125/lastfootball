# AI — Architectural Decisions (skrót cold start)

## Cel

**Krótki przewodnik** dla nowej sesji ChatGPT / Cursor: trwałe decyzje architektoniczne **bez** kopiowania pełnych opisów.

**Pełny rejestr D\* (D1–D118):** [`../DECISIONS.md`](../DECISIONS.md) — **SSOT**; ten plik = skrót cold start.
**Zasady filozofii:** [`ARCHITECTURE_PRINCIPLES.md`](./ARCHITECTURE_PRINCIPLES.md)  
**Reguły warstw / SSOT map:** [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md)

---

## Jak czytać tipy (nie mylić)

| Warstwa                 | SSOT               | Znaczenie                                     |
| ----------------------- | ------------------ | --------------------------------------------- |
| Production Baseline     | `CURRENT_BASELINE` | UI P0 tip (`54d0724`)                         |
| Domain feature baseline | `CURRENT_BASELINE` | Ostatni feat domenowy (np. Ranking `bf86749`) |
| Presentation tip        | `CURRENT_BASELINE` | Ostatni feat UI po P0 (np. MOTION)            |
| Documentation tip       | `CURRENT_BASELINE` | Ostatni `docs:` CLOSE sync                    |
| `git HEAD` / tip `main` | `git log -1`       | Może być nowszy pin/fix niż Documentation tip |

---

## Zasady nienumerowane (obowiązkowe)

| Zasada                     | Jedno zdanie                                                                              |
| -------------------------- | ----------------------------------------------------------------------------------------- |
| **SSOT FIRST**             | Jeden fakt → jedno źródło.                                                                |
| **REUSE FIRST**            | Najpierw istniejący resolver / helper.                                                    |
| **ZERO DUPLICATE LOGIC**   | Jedna implementacja reguły domeny.                                                        |
| **RESOLVER FIRST**         | UI domeny tylko przez `resolve*`.                                                         |
| **Presentation ≠ Domain**  | UI/motion/copy **nie** zmienia DTO / unlock / settlement; domain **nie** omija Guide §16. |
| **Information Thin**       | Warstwa informacji **porządkuje** fakty; **nie** ocenia i **nie** decyduje za gracza.     |
| **SEED ≠ RUNTIME**         | Seed ≠ ratunek pustego UI.                                                                |
| **NO RUNTIME MOCKS**       | Produkcja bez fałszywego rynku/sali/Hub FOMO.                                             |
| **Single Settlement Path** | Transfer settle tylko `completeTransferBuy` / `completeTransferSell`.                     |

---

## D19–D28 · D38 · D40–D46 (skrót)

| ID       | Temat                      | Sedno (1 linia)                                                                   |
| -------- | -------------------------- | --------------------------------------------------------------------------------- |
| **D19**  | Players SSOT               | Jedyna tabela kadry = `players`; UI = `resolveClubSquad`; seed ≠ runtime.         |
| **D20**  | Transfers Thin             | Rynek = `resolveTransferMarket`; settle tylko buy/sell; fee = derive.             |
| **D21**  | Training Thin + Depth      | `resolveClubTraining`; status + skill ≤ potential; RPC sesji; XI Gate.            |
| **D22**  | Potential / match growth   | `players.potential`; UI = pasma only; match PRIMARY; trening SUPPORTING.          |
| **D23**  | Academy Thin A             | `academy_track` / `promoted_at` na `players`; max 3; `resolveClubAcademy`.        |
| **D24**  | Scouting Information Thin  | `resolveClubScouting`; `scout_shortlist` = `(club_id, player_id)` → `players.id`. |
| **D25**  | Daily Goal Thin            | `resolveClubDailyGoal` derive only; Primary > Daily; ≠ Secondary daily loop.      |
| **D26**  | Achievements Thin          | `resolveClubAchievements` derive; immutable history; ≠ XP/score/§6/Ranking.       |
| **D27**  | Ranking Thin               | `resolveClubRanking` z table input; własny DTO; ≠ league columns/ELO/§6.          |
| **D28**  | League calendar 22         | `LEAGUE_FIXTURE_COUNT=22` double RR; MD1–11 identity; AI↔AI double RR.            |
| **D38**  | Transfer public API        | Buy/Sell only · fee SQL helpers · 1× live settle · TRANSFERS-09.                  |
| **D47**  | Club = Identity            | `/club` tożsamość ≠ progresja §6.                                                 |
| **D48**  | Profile Composition        | `ClubProfileDto` = compose faktów; zero drugiego modelu.                          |
| **D49**  | No Staff on Club           | Brak personelu Future na `/club`.                                                 |
| **D50**  | View presentation only     | `ClubProfileView` bez logiki biznesowej.                                          |
| **D51**  | One club profile resolver  | `resolveClubProfile` = sole DTO `/club`.                                          |
| **D52**  | Soft lock ≠ Fake Prod      | Soft-lock surface nigdy nie leakuje atrap / Fake Production.                      |
| **D63**  | Route ≡ Nav access         | Deep-link access = `resolveNavAccess` / `isModuleSoftLocked`.                     |
| **D64**  | No Placeholder as lock     | PlaceholderPage ≠ mechanizm soft-lock.                                            |
| **D65**  | SoftLockState canonical    | Locked route surface = `SoftLockState`.                                           |
| **D66**  | Generic route gate         | Jeden gate; nowy lock = `FLAT_NAV` + unlock — bez edycji gate.                    |
| **D67**  | Transparent gate           | Poza `FLAT_NAV` = pass-through; zero logiki domenowej w gate.                     |
| **D68**  | Lifecycle before systems   | Najpierw koniec sezonu (kontrakt/kod); potem Sponsors/Board/….                    |
| **D69**  | SE = event pipeline        | Season End = ciąg zdarzeń, nie ekran z side-effectami.                            |
| **D70**  | Trigger owns lifecycle     | Start pipeline tylko przy 22/22 played klubu gracza.                              |
| **D71**  | Report before consequences | Raport przed konsekwencjami / hookami.                                            |
| **D72**  | Hooks before features      | Hook = moment · Owner · cel; bez feature spec.                                    |
| **D73**  | No promotion in SE Thin    | Thin nie zmienia szczebla ligowego.                                               |
| **D74**  | Docs before lifecycle      | Brak kodu SE bez zamkniętego GDD-SEASON-END-01.                                   |
| **D75**  | Lifecycle deterministic    | Zero RNG zamknięcia; ten sam input → ten sam pipeline.                            |
| **D76**  | Contract before code       | Kontrakt GDD przed PLAN/IMPLEMENT kodu SE.                                        |
| **D77**  | SE Thin SSOT file          | SSOT = `GDD-SEASON-END-01.md`; §10 = pointer.                                     |
| **D78**  | Season Closed idempotent   | `season_phase=offseason` raz / przebieg 22; idempotent.                           |
| **D79**  | Offseason unlock parity    | OFFSEASON soft-lock = SEASON (Board/Stadium locked; Sponsors → D99).              |
| **D80**  | Sole planner               | N+1 tylko przez `planClubFixtures` (zero drugiego terminarza).                    |
| **D81**  | Report pure resolve        | `resolveSeasonReport` z tabeli; Information Thin.                                 |
| **D82**  | Confirm before N+1         | Auto start nowego sezonu zakazany.                                                |
| **D83**  | Hooks no-op in Thin        | `onSeasonEnd` no-op age++; Sponsors+Board wired as info/Confirm; age still OUT.   |
| **D84**  | Report = existing facts    | Highlighty tylko z faktów domeny.                                                 |
| **D85**  | Confirm sole N+1 path      | Tylko `confirmStartNextSeason`.                                                   |
| **D86**  | Report read-only           | View bez mutacji; Confirm osobno.                                                 |
| **D87**  | Offseason persists         | `season_phase` SSOT do Confirm; AC-10/11.                                         |
| **D88**  | League tier club SSOT      | `league_tier` → ClubDto; etykiety tylko `resolveLeagueTierLabel`.                 |
| **D89**  | Promotion outcome derived  | Pure z tabeli + tier; zero RNG.                                                   |
| **D90**  | Single tier mutation       | Mutacja tier tylko w Confirm N+1.                                                 |
| **D91**  | Report before persist tier | Outcome w raporcie OFFSEASON; persist przy Confirm.                               |
| **D92**  | Same opponent world Thin   | Tier + etykiety only; skład ligi / AI bez zmian.                                  |
| **D93**  | Floor IV · ceiling I       | Brak spadku z IV; brak awansu z I.                                                |
| **D94**  | No playoffs Thin           | Baraże OUT.                                                                       |
| **D95**  | One Base Sponsor Contract  | 1 kontrakt / klub; SSOT = `club_sponsor_contracts`.                               |
| **D96**  | Sponsors UI Sole Resolver  | UI tylko `resolveClubSponsors`.                                                   |
| **D97**  | Sponsor Cash Via Ledger    | Payout/bonus → `cash_balance` + `finance_movements` only.                         |
| **D98**  | H-SPONSORS Non-Blocking    | Confirm Primary; renewal secondary; auto-renew przy Confirm.                      |
| **D99**  | Soft Unlock Sponsors Only  | `/sponsors` open; Board later D105; Stadium locked.                               |
| **D100** | No Marketplace No Quest    | Brak marketplace / nego / Quest Engine / mid-season change.                       |
| **D101** | Flat Renewal Band Thin     | Auto-renew = te same brand + kwoty Thin.                                          |
| **D102** | Board UI Sole Resolver     | UI tylko `resolveClubBoard`.                                                      |
| **D103** | Board Information Thin     | Pure derive · zero persist / mutacji Board.                                       |
| **D104** | H-BOARD Non-Blocking       | Confirm Primary; Board = info.                                                    |
| **D105** | Soft Unlock Board Only     | `/board` open SEASON+OFFSEASON; Stadium locked.                                   |
| **D106** | No Prestige Engine         | Brak silnika Prestige/Reputacja.                                                  |
| **D107** | No Quest No Club Mgmt      | Brak Quest Engine · brak zarządzania klubem.                                      |
| **D108** | Derive From Season Facts   | Tabela + report · zero RNG.                                                       |
| **D109** | Stadium UI Sole Resolver   | UI tylko `resolveClubStadium`.                                                    |
| **D110** | Stadium Information Thin   | Pure derive · zero persist / mutacji Stadium.                                     |
| **D111** | Soft Unlock Stadium Only   | `/stadium` open SEASON+OFFSEASON.                                                 |
| **D112** | No Ticket Economy Thin     | Brak biletów → kasa · brak nowych finance categories.                             |
| **D113** | Qualitative Attendance     | Pasmo jakościowe · unknown bez home · zero RNG.                                   |
| **D114** | Starter Package Facts      | Nazwa + pojemność = `STARTER_PACKAGE`.                                            |
| **D115** | No Match Engine Coupling   | Zero wpływu na LFE Match / PreMatch / Canvas.                                     |
| **D116** | Transfer Actions Org Split | `actions.ts` → `actions-*.ts` + barrel; Public API bez zmian.                     |
| **D117** | Transfer displayPos Sole   | Jedyna `displayPos` w `lib/transfers/display-pos.ts`.                             |
| **D118** | No Transfer Dispatcher     | Brak Dispatcher / Registry / Service Locator; SSP bez zmian.                      |
| **D40**  | Fake Production Rule       | Prod nie udaje spraw / unread bez faktu domenowego.                               |
| **D41**  | No runtime mocks           | Odblokowany moduł ≠ hardcoded / mock lista.                                       |
| **D42**  | Messages Are Derived       | Inbox = derive skutków; nigdy przyczyna.                                          |
| **D43**  | One Event → Many Views     | `/messages` + Overlay = ta sama `ClubMessagesDto`.                                |
| **D44**  | UI nie sortuje/filtruje    | Kolejność wyłącznie w `resolveClubMessages`.                                      |
| **D45**  | One resolver               | `resolveClubMessages` = jedyne źródło danych UI.                                  |
| **D46**  | Messages Thin scope        | Brak DB / workflow / Accept w skrzynce / drugiego procesu ofert.                  |

### D24 — kontrakt shortlisty (must-know)

- Preferencje menedżera **tylko** jako referencje do `players.id`.
- **Nie** drugi model zawodnika (brak skill / potential / scout_score w tabeli preferencji).
- Shortlista **nie** wpływa na AI, rynek, transfery, potencjał, symulację.
- Skauting **porządkuje** informacje — **nie** podejmuje decyzji za gracza.

### D25 — kontrakt Daily Goal (must-know)

- Pure derive · **brak** persist / Quest Engine / cron / nagród.
- **Primary CTA zawsze nadrzędny**; Daily Goal = sugestia Information Thin.
- ≠ `resolveSecondaryCtas` (daily loop nawigacji).
- Deep-link tylko do istniejących tras; wynik deterministyczny dla tego samego stanu.

### D26 — kontrakt Achievements (must-know)

- Pure derive z faktów domeny · **brak** persist / XP / Achievement Score / ekonomii.
- Historia **immutable** względem trwałych faktów.
- ≠ Ranking · ≠ Daily Goal · ≠ §6 metryki.

---

## Gdzie szukać kodu

[`MODULE_MAP.md`](./MODULE_MAP.md) — Hub · Daily · Achievements · Messages · Academy · Scouting · Training · Transfers · …

---

## Status

### D27 — kontrakt Ranking (must-know)

- Input = `resolveLeagueTable` → `resolveClubRanking` (mapowanie only).
- DTO bez points/WDL/goals/ELO; pasma = enum; copy UI = `UI_COPY` (D29).
- Nav open EARLY_CLUB; bieżący sezon; derive only.

### D40–D46 — kontrakt Messages (must-know)

- `resolveClubMessages` = **jedyny** SSOT UI · derive E1–E3.
- `/messages` + Overlay = **ta sama** DTO · UI nie sortuje/filtruje.
- **NO RUNTIME MOCKS** · brak DB / mark-as-read / Accept w skrzynce.

### D47–D51 — kontrakt Club Profile (must-know)

- Identity ≠ progression · Composition only · no staff · View = DTO only · `resolveClubProfile` sole SSOT.

### D52 · D63–D67 — kontrakt SoftLock route (must-know)

- Soft-lock ≠ Fake Production · route access ≡ nav · SoftLockState canonical · generic + transparent gate (`FLAT_NAV`).

### D68–D77 — kontrakt Season End Thin (must-know)

- Lifecycle przed systemami · pipeline zdarzeń · trigger 22/22 · report przed konsekwencjami.
- Hooki ≠ features · **brak awansu/spadku w Thin** · docs/kontrakt przed kodem · determinizm.
- SSOT Thin = `GDD-SEASON-END-01.md` (D77).

### D78–D87 — kontrakt Season End Thin **kod** (must-know)

- Trigger 22/22 → Closed → Report → OFFSEASON → Confirm → N+1 (`planClubFixtures`).
- Unlock OFFSEASON = SEASON · raport read-only z faktów · Confirm jedyna ścieżka N+1.
- `season_phase` persist (AC-10) · po N+1 raport nie wraca (AC-11) · hooki no-op.

### D88–D94 — kontrakt Promotion Thin (must-know)

- `league_tier` = SSOT szczebla · etykiety tylko `resolveLeagueTierLabel`.
- Outcome pure · raport przed persist · mutacja tier tylko Confirm N+1.
- Thin: ten sam świat AI (D92) · floor IV / ceiling I · baraże OUT.
- SSOT Thin = `GDD-PROMOTION-01.md`.

### D95–D101 — kontrakt Sponsors Thin (must-know)

- `club_sponsor_contracts` = SSOT kontraktu · UI tylko `resolveClubSponsors`.
- Cash wyłącznie finance ledger · base payout raz w `confirmStartNextSeason`.
- Confirm Primary · renewal secondary · flat auto-renew · Stadium locked (Board → D105).
- SSOT Thin = `GDD-SPONSORS-01.md`.

### D102–D108 — kontrakt Board Thin (must-know)

- UI tylko `resolveClubBoard` · Information Thin · zero migracji / persist / actions.
- Expectation opisowe · standing.trend · tone positive/neutral/concern.
- Confirm Primary · `/board` open · no Prestige/Quest/club mgmt.
- SSOT Thin = `GDD-BOARD-01.md`.

### D109–D115 — kontrakt Stadium Thin (must-know)

- UI tylko `resolveClubStadium` · Information Thin · zero migracji / persist / tickets.
- Attendance jakościowe · `unknown` bez home · `STARTER_PACKAGE` facts.
- `/stadium` open · Confirm Primary · zero Match Engine / PreMatch.
- SSOT Thin = `GDD-STADIUM-01.md`.

### D116–D118 — kontrakt Transfers TD-03+ (must-know)

- Organizational split actions + sole `displayPos` · zero semantyki rynku / SQL / DTO / RPC.
- Brak Dispatcher / Registry / Service Locator · Single Settlement Path nienaruszony.
- SSOT PLAN = `implementation/LFE-TRANSFERS-10-PLAN.md`.

**ACTIVE** · 2026-07-31 — LFE-TRANSFERS-10 IMPLEMENT · D1–D118 · SSOT [`../DECISIONS.md`](../DECISIONS.md)
