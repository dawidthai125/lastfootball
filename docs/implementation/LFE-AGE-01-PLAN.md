# LFE-AGE-01 — PLAN (Season Age++ Thin · H-AGE)

**EPIC:** LFE-AGE-01  
**Typ:** docs PLAN · Career Thin foundation (wire istniejącego pure age tick)  
**Data:** 2026-08-03  
**Wejście:** GAMEPLAY-LOOP-AUDIT-01 · Owner **GO → PLAN**  
**Status PLAN:** FULLY CLOSED · feat `6a54722` · CI GREEN · PRODUCTION VERIFY · DOCS CLOSE  
**Baseline wejścia:** tip `fc6f692` · Domain `962f0a8` (RATINGS-V2) · Season End `024e827` · PLAYERS-02 / D22 · D1–D121  
**Baseline wyjścia:** Domain **`6a54722`** · D1–**D122** · docs tip `759df0f`  
**SSOT wejścia:** [`../game-design/GDD-SEASON-END-01.md`](../game-design/GDD-SEASON-END-01.md) (H-AGE) · [`../platform/PLAYERS.md`](../platform/PLAYERS.md) · [`../DECISIONS.md`](../DECISIONS.md) D22 · D83 · kod `lib/squad/season-age.ts` · `confirmStartNextSeason`

---

## 0. Cel

Włączyć **sezonowy przyrost wieku** kadry przy starcie Season N+1 (hook **H-AGE**), tak aby kariera klubu miała upływ czasu między sezonami.

**Zasada nadrzędna**

> REUSE FIRST: istniejąca pure `applySeasonAgeEffects` + hook `onSeasonEnd` w Confirm N+1. Thin = **persist + idempotent wire**, nie nowy model zawodnika i nie silnik kariery (Prime / Decline / Retirement / Youth Depth).

---

## 1. Owner LOCK (przed IMPLEMENT)

| #   | Potwierdzenie                                                                                                               | Stan         |
| --- | --------------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | Moment Age++ = **wyłącznie** ścieżka `confirmStartNextSeason` (H-AGE · D82 sole Confirm)                                    | **LOCKED**   |
| 2   | REUSE `applySeasonAgeEffects` — **bez** forka reguł age/skill w drugim helperze                                             | **LOCKED**   |
| 3   | Scope kadry = zawodnicy **klubu gracza** (`players.club_id = clubId`, `departed_at is null`) — senior **i** `academy_track` | **LOCKED**   |
| 4   | Soft skill regress przy `age ≥ AGE_REGRESS_FROM` (32) = **IN** jako REUSE PLAYERS-02 (seed Decline), nie osobny EPIC        | **LOCKED**   |
| 5   | **Brak** migracji schematu (`players.age` / `skill` / `potential` już istnieją)                                             | **LOCKED**   |
| 6   | **Brak** zmian LFE PUBLIC / Match Engine / Settlement / soft-lock Sponsors·Board·Stadium                                    | **LOCKED**   |
| 7   | Nowa decyzja **D122** (Age++ wired) superseduje „brak auto age++” w D22/D83 **tylko** dla H-AGE                             | **LOCKED**   |
| 8   | Retirement · Prime buff · Youth intake auto · world-age innych klubów = **OUT**                                             | **LOCKED**   |

Owner GO IMPLEMENT zamyka LOCK 1–8. **Zamknięte** — LOCK 1–8 **LOCKED**.

---

## 2. Thin IN

| #   | Element                                                                                                                                                                                            |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Persist wyniku `applySeasonAgeEffects` na wierszach `players` klubu przy Confirm N+1                                                                                                               |
| 2   | Wire H-AGE: `onSeasonEnd` (lub następca nazwy) **wykonuje** age tick zamiast no-op (D83 → D122)                                                                                                    |
| 3   | Idempotencja: **jeden** age tick na udany Confirm (gate `season_phase=offseason` → `in_season` już istnieje)                                                                                       |
| 4   | Reguły pure (bez zmian semantyki, chyba że Owner zmieni LOCK): `age = min(50, age+1)`; jeśli nowy `age ≥ 32` i `skill > 1` → `skill = max(1, min(potential, skill-1))`; zawsze `skill ≤ potential` |
| 5   | Zakres wierszy: klub gracza · `departed_at is null` · **w tym** `academy_track=true`                                                                                                               |
| 6   | Atomowość Thin: age(+skill) **przed** lub w tej samej transakcji co otwarcie sezonu — preferowane **RPC / pojedynczy server path** z jasnym order (patrz §4)                                       |
| 7   | Testy pure (już częściowo) + testy wire / idempotencji Confirm                                                                                                                                     |
| 8   | Minimalny feedback Information Thin (opcjonalnie w PLAN IMPLEMENT): raport OFFSEASON **lub** flash po Confirm — **bez** Fake Production liczb spoza DTO; bez Quest/XP                              |
| 9   | DOCS CLOSE: PLAYERS · Season End H-AGE · DECISIONS D122 · ROADMAP · BASELINE · HANDOFF · CHANGELOG · PLATFORM                                                                                      |

---

## 3. Thin OUT (twarde)

- Retirement / zwolnienie / auto-depart po wieku
- Prime years buff (skill+/potential+ w oknie wieku)
- Decline Depth (pasma kariery, morale, kontuzje wiekowe, osobne krzywe)
- Youth Depth: auto-intake, academy levels, youth OVR, mecze młodzieżowe
- `age++` w trakcie sezonu / po każdym meczu / cron real-time
- Age tick **świata** (wszystkie kluby AI / cały `players`) — Future
- Zmiana `potential` z wiekiem · numeric potential w UI
- Zmiana formuły `deriveTransferFee` (REUSE — fee **sama** zareaguje na nowe `age`/`skill`)
- Zmiana Match Engine / LFE / Ratings / Training RPC kontraktu
- Nowe kolumny (`career_phase`, `retired_at`, `prime_peak`, …) w tym EPICu
- Migracje schematu tabel
- Board Prestige · Stadium · Sponsors nego · League AI catalogs
- Push/email · Messages DB · Achievements XP
- UI career timeline / biografia zawodnika (poza ewentualnym 1-liniowym feedbackiem Thin)

---

## 4. Moment wykonywania Age++

### 4.1 Kontrakt produktowy (H-AGE)

|              |                                                                                          |
| ------------ | ---------------------------------------------------------------------------------------- |
| Hook         | **H-AGE** ([`GDD-SEASON-END-01`](../game-design/GDD-SEASON-END-01.md) §10)               |
| Moment       | Przy **New Season** (krok 7) **lub tuż przed** nim                                       |
| Wyzwalacz IO | **Tylko** `confirmStartNextSeason` (D82)                                                 |
| Nie          | Po każdym meczu · po Season Closed bez Confirm · ręczne „Postarz kadrę” · background job |

### 4.2 Kolejność w Confirm N+1 (PROPOSED)

Zachować istniejący pipeline; wstawić persist age w punkcie H-AGE:

```
1. Guard: auth · club · season_phase === offseason
2. Derive promotion outcome (read-only table)
3. H-SPONSORS: renew + base payout
4. Clear fixtures · planClubFixtures N+1
5. Persist club: season_number++ · in_season · league_tier
6. H-AGE: applySeasonAgeEffects → persist players.age (+ skill gdy regress)
7. revalidate · redirect /hub
```

**Alternatywa LOCK (równoważna):** krok 6 **przed** krokiem 5, nadal w tej samej transakcji DB — Age++ nadal „przy New Season”, nie w trakcie Offseason browse.

**Zakaz:** Age++ przy samym Season Closed / Report (gracz mógłby zobaczyć postarzoną kadrę i **nie** potwierdzić N+1).

### 4.3 Idempotencja

- Drugi Confirm przy `in_season` → fail (istniejący guard) → **brak** drugiego age++.
- Partial failure po age persist a przed club update = ryzyko; IMPLEMENT musi wybrać **jedną** ścieżkę fail-closed (transakcja / RPC / kompensacja) — AC poniżej.

---

## 5. Model danych (REUSE FIRST)

### 5.1 SSOT — bez nowych tabel

| Fakt         | Źródło (istniejące)                                           |
| ------------ | ------------------------------------------------------------- |
| Wiek         | `players.age` (`integer`, check 15…50)                        |
| Skill        | `players.skill`                                               |
| Potential    | `players.potential` (`potential ≥ skill`)                     |
| Klub         | `players.club_id`                                             |
| Tor akademii | `players.academy_track`                                       |
| Odejście     | `players.departed_at`                                         |
| Pure reguły  | `applySeasonAgeEffects` · `DEVELOPMENT_THIN.AGE_REGRESS_FROM` |
| Product hook | `onSeasonEnd` → wire w Confirm                                |

### 5.2 Migracje

|                |                                                                                                                                                                             |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schemat        | **Brak** nowych kolumn / tabel w LFE-AGE-01                                                                                                                                 |
| Opcjonalne RPC | Dozwolone **tylko** jeśli IMPLEMENT potrzebuje atomowego `UPDATE` batch (bez zmiany checków) — nie jest wymaganiem PLAN, jeśli server action + batch update jest bezpieczne |

### 5.3 Pure API (bez forka)

Wejście / wyjście jak dziś:

- In: `{ id, age, skill, potential }[]`
- Out: `{ id, age, skill }[]` — **potential nie mutowany** w Thin

Persist: `UPDATE players SET age=…, skill=… WHERE id=… AND club_id=…`.

### 5.4 Poza modelem Thin

Zakaz drugiego modelu „career state” do czasu ROADMAP CAREER (Prime / Decline Depth / Retirement).

---

## 6. Wpływ na systemy

### 6.1 Player Development (D22)

| Efekt                | Thin AGE-01                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| Match PRIMARY growth | Bez zmian kontraktu; po age++ ceiling nadal `skill ≤ potential`                                  |
| Training SUPPORTING  | Bez zmian; soft regress może obniżyć skill → kolejne sesje/mecze znów mogą +1 aż do P            |
| Potential            | **Nie** maleje z wiekiem w tym EPICu                                                             |
| Seed potential       | `resolvePlayerPotential(id, age)` przy **nowych** insertach — istniejący roster nie re-seeduje P |

### 6.2 Academy (D23)

| Efekt                              | Thin AGE-01                                                                 |
| ---------------------------------- | --------------------------------------------------------------------------- |
| Perspektywy (`academy_track=true`) | **Starzeją się** razem z kadrą (ten sam `players`)                          |
| Promote                            | Nadal bez buffa; Promote po age++ widzi nowy `age`                          |
| Intake                             | Nowe perspektywy jak dziś (młody age przy INSERT) — bez auto Youth pipeline |

### 6.3 Transfers (D20)

| Efekt                           | Thin AGE-01                                             |
| ------------------------------- | ------------------------------------------------------- |
| `deriveTransferFee(skill, age)` | REUSE — starszy / słabszy skill → naturalnie inny ask   |
| Listing / nego / settlement     | Bez zmian ścieżek                                       |
| Rynek innych klubów             | AI/live listings **nie** age’owane w Thin (jawny limit) |

### 6.4 Squad / XI / Training UI

| Efekt              | Thin AGE-01                                                 |
| ------------------ | ----------------------------------------------------------- |
| `resolveClubSquad` | Czyta nowe `age` / `skill` — bez zmiany resolvera kontraktu |
| XI Gate            | Nadal status-based; age nie blokuje XI w Thin               |
| Dossier            | Pokazuje zaktualizowany wiek                                |

### 6.5 Season End / Promotion / Sponsors

| Efekt                              | Thin AGE-01                                                                           |
| ---------------------------------- | ------------------------------------------------------------------------------------- |
| Trigger 22/22 · Report · Offseason | **Bez** age przy zamknięciu                                                           |
| Confirm N+1                        | **Jedyny** moment age++                                                               |
| Promotion tier                     | Niezależne (D90); kolejność: Sponsors → fixtures → club/tier → **Age** (lub Age w tx) |
| H-SPONSORS                         | Bez zmian flat renew                                                                  |
| D83                                | Age przestaje być no-op → **D122**                                                    |

---

## 7. Ryzyka architektoniczne

| #   | Ryzyko                                                          | Mitygacja                                                                  |
| --- | --------------------------------------------------------------- | -------------------------------------------------------------------------- |
| R1  | Partial Confirm: age zapisane, sezon nieotwarty (lub odwrotnie) | Jedna transakcja / RPC; fail-closed; testy                                 |
| R2  | Podwójny age++                                                  | Gate `offseason` + brak ścieżki age poza Confirm                           |
| R3  | Drift reguł (UI vs SQL vs pure)                                 | Jedyny SSOT reguł = `applySeasonAgeEffects`; SQL tylko zapisuje wynik pure |
| R4  | `age=50` + check DB                                             | Pure już `min(50,…)`; nie łamać check 15…50                                |
| R5  | `skill` po regress > `potential`                                | Pure clamp; respekt D22                                                    |
| R6  | Academy pominięta / włączona niespójnie                         | LOCK: wszystkie non-departed wiersze klubu                                 |
| R7  | Świat AI wiecznie młody vs kadra gracza                         | Zaakceptowany limit Thin; Future world-age                                 |
| R8  | Soft regress odczytany jako pełny Decline                       | Docs + ROADMAP CAREER: to **seed**, nie Decline EPIC                       |
| R9  | Scope creep Retirement / Youth                                  | Twardy OUT + Owner LOCK 8                                                  |
| R10 | Zmiana D83 bez D122                                             | DOCS CLOSE wymaga D122 w `DECISIONS.md`                                    |

---

## 8. Acceptance Criteria

| ID        | Kryterium                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **AC-1**  | Po udanym Confirm N+1 każdy non-departed zawodnik klubu gracza ma `age' = min(50, age+1)`.                                                        |
| **AC-2**  | Gdy `age' ≥ 32` i poprzedni `skill > 1`, `skill' = max(1, min(potential, skill-1))`; wpp. skill bez zmian z tytułu age (poza clamo do potential). |
| **AC-3**  | `potential` **nie** zmienia się w AGE-01.                                                                                                         |
| **AC-4**  | Zawodnicy `academy_track=true` podlegają AC-1/AC-2.                                                                                               |
| **AC-5**  | Age++ **nie** uruchamia się przy Season Closed / Report / browse Offseason bez Confirm.                                                           |
| **AC-6**  | Ponowny Confirm przy otwartym sezonie **nie** postarza kadry drugi raz.                                                                           |
| **AC-7**  | Jedyna mutacja age w produkcie = ścieżka Confirm (H-AGE); brak cron / match hook.                                                                 |
| **AC-8**  | REUSE: reguły z `applySeasonAgeEffects` (lub jawna supersedacja Owner — wtedy update testów PLAYERS-02).                                          |
| **AC-9**  | Brak migracji schematu; brak zmian LFE PUBLIC / Settlement.                                                                                       |
| **AC-10** | Transfer fee / Squad UI odzwierciedlają nowe age/skill bez forka formuły fee.                                                                     |
| **AC-11** | D122 + docs platform zaktualizowane w DOCS CLOSE (nie w tym dokumencie PLAN przed GO).                                                            |
| **AC-12** | Fail ścieżki Confirm: brak „połowicznego” age bez spójnego stanu sezonu (tx/RPC/kompensacja udokumentowana w IMPLEMENT report).                   |

---

## 9. Strategia testów

### 9.1 Pure (istniejące + uzupełnienie)

| Case                           | Oczekiwanie                 |
| ------------------------------ | --------------------------- |
| age 24 → 25, skill bez regress | age+1, skill same           |
| age 31 → 32, skill 70, P 80    | age 32, skill 69            |
| age 49 → 50                    | cap 50                      |
| age 50 → 50                    | bez wzrostu ponad 50        |
| skill 1 przy regress           | nie poniżej 1               |
| skill = potential przy regress | clamp do potential          |
| academy slice w input          | traktowany jak każdy wiersz |

### 9.2 Wire / integracja (nowe)

| Case                                 | Oczekiwanie                        |
| ------------------------------------ | ---------------------------------- |
| Confirm z offseason · N zawodników   | N update age (+ skill gdy due)     |
| Confirm gdy in_season                | error · 0 age writes               |
| Idempotent replay guard              | brak podwójnego +1                 |
| Failure injection (jeśli testowalne) | brak rozjazdu season_phase vs ages |

### 9.3 Regresja sąsiadów

| Obszar                       | Smoke                       |
| ---------------------------- | --------------------------- |
| Promotion tier na Confirm    | bez regresji                |
| Sponsors renew + payout      | bez regresji                |
| Fixtures reseed 22           | bez regresji                |
| `deriveTransferFee` po age   | fee zmienia się z age/skill |
| Training / Match development | nadal `skill ≤ potential`   |

### 9.4 Poza testami AGE-01

E2E pełnych 10 sezonów · world AI age · Retirement UI.

---

## 10. VERIFY checklist (po IMPLEMENT · przed COMMIT)

- [ ] `pnpm format` / format check PASS
- [ ] typecheck PASS
- [ ] lint PASS
- [ ] test PASS (squad season-age · season confirm · transfers fee smoke jeśli objęte)
- [ ] build PASS
- [ ] AC-1…AC-12 spełnione lub jawny waiver Owner
- [ ] Brak migracji schematu w diff (lub tylko opcjonalne RPC bez nowych kolumn — zgodne z LOCK 5)
- [ ] Brak zmian `@lastfootball/lfe` PUBLIC / allowlist
- [ ] Single Settlement Path nienaruszony
- [ ] Confirm nadal jedyną bramką N+1 (D82)
- [ ] Brak runtime mocków age

---

## 11. DOCS CLOSE checklist (po PRODUCTION VERIFY)

- [ ] [`docs/DECISIONS.md`](../DECISIONS.md) — **D122** Age++ wired · update D22 age line · D83 age no-op supersede
- [ ] [`docs/AI/ARCHITECTURAL_DECISIONS.md`](../AI/ARCHITECTURAL_DECISIONS.md) — skrót D122
- [x] [`docs/platform/PLAYERS.md`](../platform/PLAYERS.md) — Age = wired Confirm; reguły regress
- [x] [`docs/game-design/GDD-SEASON-END-01.md`](../game-design/GDD-SEASON-END-01.md) — H-AGE status CLOSED / pointer do LFE-AGE-01
- [ ] [`docs/ROADMAP.md`](../ROADMAP.md) — LFE-AGE-01 DONE · ROADMAP CAREER pointer
- [x] [`docs/PROJECT_STATUS.md`](../PROJECT_STATUS.md)
- [ ] [`docs/AI/CURRENT_BASELINE.md`](../AI/CURRENT_BASELINE.md) · [`PROJECT_HANDOFF.md`](../AI/PROJECT_HANDOFF.md) — Domain tip · „auto age++” usunięte z Not on production
- [x] [`docs/CHANGELOG.md`](../CHANGELOG.md) / root CHANGELOG
- [x] [`docs/AI/EPIC_INDEX.md`](../AI/EPIC_INDEX.md)
- [x] Ten PLAN → Status **FULLY CLOSED** + feat hash `6a54722`
- [ ] Tip pin docs po DOCS PUSH (`759df0f` placeholder)

**Nie w DOCS CLOSE AGE-01:** pełna spekulacja Prime/Retirement jako zaimplementowana — tylko pointer ROADMAP CAREER.

---

## 12. Milestones IMPLEMENT (po Owner GO)

| M      | Zakres                                                                         | OUT             |
| ------ | ------------------------------------------------------------------------------ | --------------- |
| **M1** | Wire persist: load slices → `applySeasonAgeEffects` → update players w Confirm | Retirement UI   |
| **M2** | Idempotencja / fail-closed (tx lub RPC) + testy wire                           | World age       |
| **M3** | Feedback Thin (opcjonalny, Guide §16)                                          | Career timeline |
| **M4** | VERIFY → COMMIT → PUSH → CI → PRODUCTION VERIFY                                | —               |
| **M5** | DOCS CLOSE (D122 + SSOT)                                                       | —               |

---

## 13. ROADMAP CAREER

AGE-01 jest **fundamentem czasu**, nie całym systemem kariery. Kolejność produktowa:

```
AGE (LFE-AGE-01)          ← ten EPIC: age++ + seed soft-regress @32
  → PRIME                 ← okno wieku „szczyt” (opcjonalny buff / mniejszy regress) — Future EPIC
  → DECLINE               ← pełniejsza krzywa spadku (nie tylko -1 skill/rok) — Future EPIC
  → RETIREMENT            ← odejście / ended career / slot zwolniony — Future EPIC
  → YOUTH                 ← akademia Depth / nabór / czas dojrzewania sprzężony z AGE — Future EPIC
```

### 13.1 Jak AGE-01 odblokowuje resztę

| Etap           | Zależność od AGE-01                                                              | Bez AGE-01                           |
| -------------- | -------------------------------------------------------------------------------- | ------------------------------------ |
| **AGE**        | Persist + moment Confirm                                                         | Hook no-op — brak upływu czasu       |
| **PRIME**      | Potrzebuje prawdziwego `age` sezon→sezon, by zdefiniować pasmo szczytu           | Brak sensownego „peak window”        |
| **DECLINE**    | Soft regress @32 = **seed**; Decline pogłębia krzywą / statusy                   | Regress w pure bez wire = martwy kod |
| **RETIREMENT** | Wymaga age (i zwykle Decline) jako trigger                                       | Losowe/forced exit bez kariery       |
| **YOUTH**      | Perspektywy już się starzeją; Youth Depth dodaje czas do Promote / jakość naboru | Academy one-shot bez łuku lat        |

### 13.2 Jawne granice

| AGE-01 daje                      | AGE-01 **nie** daje                                    |
| -------------------------------- | ------------------------------------------------------ |
| Upływ 1 roku przy N+1            | Buff Prime                                             |
| Mikro-spadek skill ≥32           | Pełny Decline / kontuzje wieku                         |
| Ciśnienie na transfery (fee/age) | Emerti / emerytura                                     |
| Starzejące się perspektywy       | Auto Youth production pipeline                         |
| Fundament retencji S2–S10        | Trudniejszą ligę po awansie (osobny League World EPIC) |

### 13.3 Sugerowana kolejka Career po AGE-01 (gameplay, nie docs-only)

1. **LFE-AGE-01** (ten PLAN)
2. **LFE-LEAGUE-WORLD-02** (AI po tier) — równoległy fundament retencji S2+
3. **LFE-ACADEMY-02** / Youth Depth
4. **LFE-CAREER-DECLINE-01** (rozszerzenie regress)
5. **LFE-CAREER-RETIRE-01**
6. **LFE-CAREER-PRIME-01** (może wejść przed Decline, jeśli Owner chce „sweet spot” najpierw)

> Prime przed Decline jest opcjonalne narracyjnie; **Age musi być pierwszy**.

---

## 14. Decyzja (DOCS CLOSE)

### D122 — Season Age++ Wired at Confirm N+1 (CLOSED)

**Dlaczego:** H-AGE no-op (D83) blokuje retencję kariery; pure tick już istnieje (D22).  
**Zasada:** Jedyny age++ produktowy = Confirm N+1; REUSE `applySeasonAgeEffects`; scope = non-departed players klubu gracza (w tym academy_track); brak Retirement/Prime/Youth Depth w tym EPICu.  
**Superseduje:** fragment D22/D83 „brak auto age++ w produkcie”.  
**Feat:** `6a54722`.

---

## 15. Status i następny krok

|                          |                                                                                          |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| PLAN                     | **FULLY CLOSED** · feat `6a54722` · CI GREEN · PRODUCTION VERIFY · DOCS CLOSE            |
| Implementacja            | **SHIPPED** — Confirm N+1 Age++ wire (H-AGE · D122)                                      |
| Commit / push / migracje | Domain feat `6a54722` · **brak** migracji schematu                                       |

**EPIC CLOSED.** Następny krok: **Owner GO → League World / §22 / Career Decline** (AUDIT first).
