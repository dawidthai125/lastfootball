# LFE-CAREER-DECLINE-01 — PLAN (Career Decline Thin · Phase · Growth Gate)

**EPIC:** LFE-CAREER-DECLINE-01  
**Typ:** docs PLAN · Career Decline Depth Thin (derive phase · soft growth gate · REUSE age SSOT)  
**Data:** 2026-08-03  
**Wejście:** AUDIT LFE-CAREER-DECLINE-01 · Owner **GO → PLAN** · Owner **GO → IMPLEMENT** · Owner **GO → DOCS CLOSE**  
**Status PLAN:** **FULLY CLOSED**  
**Domain feat:** **`3c01baa`** — `feat(career): add Career Phase derive and Growth Gate (LFE-CAREER-DECLINE-01)`  
**Baseline wyjścia:** Domain `3c01baa` · Prior LEAGUE-WORLD-02 `843bcfd` · D1–**D124**  
**SSOT:** [`../platform/PLAYERS.md`](../platform/PLAYERS.md) · [`../DECISIONS.md`](../DECISIONS.md) **D124** · [`../AI/ARCHITECTURAL_DECISIONS.md`](../AI/ARCHITECTURAL_DECISIONS.md)

---

## 0. Cel

Uczynić **schyłek kariery** czytelny i odczuwalny w wielosezonowej pętli — bez emerytury, bez Prime buffa i bez drugiego modelu zawodnika.

**Zasada nadrzędna**

> AGE-01 zostaje fundamentem czasu (H-AGE · `applySeasonAgeEffects`).  
> Decline Thin = **Career Phase (derive)** + **Growth Gate (malejący współczynnik)** + pogłębienie sezonowego regressu w **tej samej** pure ścieżce age.  
> **D124:** Career Phase = derived domain concept (zero kolumn DB).  
> REUSE FIRST · brak LFE PUBLIC · brak Match Engine · brak migracji.

---

## 1. Owner LOCK (zamknięte w tym PLAN)

| #   | Potwierdzenie                                                                                         | Stan       |
| --- | ----------------------------------------------------------------------------------------------------- | ---------- |
| 1   | **Career Phase (derive) = IN** — Information Thin z `age` (ew. skill/potential), bez persist          | **LOCKED** |
| 2   | **Growth Gate** = malejący **współczynnik** rozwoju — **nie** twardy zakaz growth                     | **LOCKED** |
| 3   | **Jedna ścieżka age** dla całego rosteru klubu (senior **i** `academy_track`) — bez wyjątków akademii | **LOCKED** |
| 4   | **Brak** nowych kolumn DB (`career_phase`, `retired_at`, …)                                           | **LOCKED** |
| 5   | **Brak** zmian LFE PUBLIC API / allowlist / root barrel                                               | **LOCKED** |
| 6   | **Brak** zmian Match Engine / AI / Physics                                                            | **LOCKED** |
| 7   | **D124** — Career Phase as Derived Domain Concept (DOCS CLOSE)                                        | **LOCKED** |

Owner GO → IMPLEMENT potwierdza LOCK 1–7. Liczby pasm / współczynników (§4–§5) wolno skorygować w GO IMPLEMENT **bez** zmiany kształtu kontraktu.

---

## 2. Thin IN

| #   | Element                                                                                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pure **`resolveCareerPhase(age, …) → CareerPhaseId`** — sole derive SSOT fazy (D124)                                                                |
| 2   | Stałe faz / progów w **`DEVELOPMENT_THIN`** (lub sąsiedni pure module REUSE) — **zakaz** magic numbers w UI                                         |
| 3   | Information Thin: label fazy na Squad / Player Card (pasmo analogiczne do potential — **bez** liczby „ukrytego score”)                              |
| 4   | **Growth Gate:** `resolveGrowthCoefficient(phase) ∈ (0, 1]` stosuje się w Match PRIMARY (+ Training SUPPORTING) — deterministycznie, nie „hard ban” |
| 5   | Pogłębienie sezonowego regressu skill w **`applySeasonAgeEffects`** według fazy / pasma wieku (nadal jeden SSOT age; H-AGE bez zmian momentu)       |
| 6   | REUSE H-AGE wire (Confirm N+1) — **bez** drugiego age tick mid-season                                                                               |
| 7   | Opcjonalny feedback Thin po Confirm / w raporcie: liczba graczy z regressem w ticku (1 linia · Guide §16)                                           |
| 8   | Testy pure (phase · coefficient · age regress pasma · growth gate determinism) + regresja AGE-01 / PLAYERS-02 / LEAGUE-WORLD-02                     |
| 9   | DOCS CLOSE: D124 · PLAYERS · ARCHITECTURAL_DECISIONS · ROADMAP · BASELINE · HANDOFF · CHANGELOG · PLAN CLOSED                                       |

---

## 3. Thin OUT (twarde)

- Retirement / auto-depart / `retired_at` / zwolnienie slotu emerytalnego
- Prime buff (skill+/potential+ w oknie peak)
- Twardy zakaz growth (`coefficient = 0` jako reguła produktowa) — **zabronione** LOCK 2
- Regres z braku minut / zmęczenia / kontuzji / morale (pełne GDD §7.15 źródła)
- Youth Depth / academy levels / auto-promote / youth OVR / wyjątki age dla akademii
- World-age AI clubs
- Attribute DB · XP · career history persist · biografia / timeline UI
- Nowe kolumny DB · migracje schematu
- Zmiany `@lastfootball/lfe` PUBLIC / Match Engine / Physics
- Zmiana semantyki `deriveTransferFee` / Single Settlement Path
- Zmiana League Strength Profile / katalogów AI
- Inbox §21/§22 jako wymóg
- Scope creep ACADEMY-02 / §22 push

---

## 4. Model Career Phase (D124)

### 4.1 Kontrakt (derive · Web domain)

```ts
/** Derived only — never persisted. D124. */
type CareerPhaseId = 'youth' | 'rising' | 'prime' | 'decline' | 'late';

type CareerPhaseView = {
  readonly id: CareerPhaseId;
  readonly label: string; // Information Thin — copy SSOT UI_COPY / local const
};
```

### 4.2 Resolve SSOT

| Funkcja                         | Rola                                               |
| ------------------------------- | -------------------------------------------------- |
| `resolveCareerPhase(input)`     | Jedyny SSOT fazy z `age` (+ opcjonalnie kontekstu) |
| `resolveCareerPhaseView(phase)` | Label / presentation helper (zero logiki progu)    |

**Input Thin (minimalny):** `{ age: number }`  
**Opcja REUSE (nie wymagana):** `skill` / `potential` tylko jeśli Owner GO IMPLEMENT doda tie-break; default = **age-only**.

### 4.3 Propozycja progów wieku (LOCK liczb w IMPLEMENT)

| `CareerPhaseId` | Wiek (po ticku / bieżący) | Sens produktowy                         |
| --------------- | ------------------------- | --------------------------------------- |
| `youth`         | ≤ 20                      | Dojrzewanie / akademia–senior young     |
| `rising`        | 21–27                     | Wzrost PRIMARY sensowny                 |
| `prime`         | 28–31                     | Peak Thin (bez buffa — tylko etykieta)  |
| `decline`       | 32–37                     | Start soft regress (`AGE_REGRESS_FROM`) |
| `late`          | ≥ 38                      | Schyłek głęboki · soft landing          |

Zasady:

- Progi **monotoniczne** · pełne pokrycie 1…50.
- `decline` zaczyna się w **`AGE_REGRESS_FROM` (32)** — spójność z AGE-01 seed.
- Phase **nie** zapisuje się do DB (LOCK 4 · D124).
- UI: pasmo / krótki label — **nie** numeric career score.

### 4.4 Gdzie widać fazę

| Powierzchnia    | Zachowanie Thin                                   |
| --------------- | ------------------------------------------------- |
| `/squad`        | label / chip fazy (REUSE presentation patterns)   |
| `/players/[id]` | ta sama derive                                    |
| `/academy`      | ta sama derive (ten sam age path — LOCK 3)        |
| Season report   | opcjonalnie agregat regress — nie osobny SSOT faz |

Zakaz drugiego „career resolvera” poza `resolveCareerPhase`.

---

## 5. Growth Gate (malejący współczynnik)

### 5.1 Kontrakt

```ts
/** (0, 1] — never 0 as product rule (LOCK 2). */
resolveGrowthCoefficient(phase: CareerPhaseId): number;
```

**Semantyka:** współczynnik = **prawdopodobieństwo / waga** przyznania istniejącego +1 skill (Match PRIMARY / Training SUPPORTING), **nie** mnożnik ułamkowego skill (skill pozostaje integer 1…99).

### 5.2 Propozycja współczynników (LOCK w IMPLEMENT)

| Phase     | Coefficient | Skutek Thin                            |
| --------- | ----------- | -------------------------------------- |
| `youth`   | `1.0`       | pełny wzrost (jak dziś)                |
| `rising`  | `1.0`       | pełny wzrost                           |
| `prime`   | `1.0`       | pełny wzrost (peak bez buffa)          |
| `decline` | `0.5`       | ~połowa szans na +1 względem baseline  |
| `late`    | `0.25`      | rzadki +1 — soft landing, nie hard ban |

Floor: **`coefficient ≥ 0.25`** w Thin (zakaz `0`).

### 5.3 Determinizm (obowiązkowy)

Gate **musi** być deterministyczny (ten sam gracz + ten sam impuls → ten sam wynik):

```
roll = stableHash(playerId + ':' + impulseKey) % 1000
allow = roll < floor(coefficient * 1000)
```

`impulseKey` = match development key / training session key (REUSE istniejące klucze idempotencji).

### 5.4 Punkty aplikacji (REUSE)

| Ścieżka             | Plik / symbol                           | Zmiana Thin                                 |
| ------------------- | --------------------------------------- | ------------------------------------------- |
| Match PRIMARY       | `applyMatchDevelopmentEffects`          | po wyborze kandydata do +1: gate po `phase` |
| Training SUPPORTING | `applyTrainingSessionEffects` (lub eq.) | ten sam współczynnik / helper               |
| Season age regress  | `applySeasonAgeEffects`                 | **nie** jest Growth Gate — osobna oś (§6)   |

**Zakaz:** osobna „DeclineEngine” klasa · fork growth poza DEVELOPMENT_THIN helpers.

### 5.5 Relacja do GDD §7.15

Growth Gate realizuje „wolniejszy wzrost po peaku” **bez** regressu z minut/morale.  
Źródła regressu spoza wieku = OUT tego EPICu.

---

## 6. Wpływ na Age (D122)

| Przed (AGE-01)                    | Po (DECLINE-01)                                                           |
| --------------------------------- | ------------------------------------------------------------------------- |
| `age++` @ Confirm                 | **bez zmian** momentu / H-AGE                                             |
| Soft regress flat −1 @ `age ≥ 32` | Regress **pasmowy** wg phase / age (propozycja §6.1) w **tej samej** pure |
| Scope: cały active roster         | **bez zmian** (LOCK 3 — academy włączona)                                 |
| Potential nie mutowany z wiekiem  | **bez zmian**                                                             |

### 6.1 Propozycja sezonowego regressu skill (LOCK liczb w IMPLEMENT)

Po `age = min(50, age+1)`:

| Phase po ticku  | Δ skill (gdy `skill > 1`)                      |
| --------------- | ---------------------------------------------- |
| `youth`…`prime` | `0`                                            |
| `decline`       | `−1` (zachowanie seed AGE-01)                  |
| `late`          | `−2` (soft landing vs emerytura — nadal clamp) |

Clamp: `skill = max(1, min(potential, skill + Δ))` · zawsze `skill ≤ potential`.

**Alternatywa Owner (GO IMPLEMENT):** zostawić flat −1 dla całego `age ≥ 32` i oprzeć Decline wyłącznie o Phase + Growth Gate — wtedy §6.1 = waiver, AC dostosować.

### 6.2 Co się **nie** zmienia

- Moment: tylko Confirm N+1
- Port H-AGE / revert
- Cap age 50
- Brak mid-season birthday

---

## 7. Wpływ na League World (D123)

| Element                     | Wpływ                                    |
| --------------------------- | ---------------------------------------- |
| `mapPlayerSkillToLfeSkills` | REUSE — niższy skill → niższe LFE skills |
| `LeagueStrengthProfile`     | **bez zmian**                            |
| AI opponent seed            | **bez zmian**                            |
| Match Engine                | **bez zmian** (LOCK 6)                   |

Decline działa przez **DB skill** (age tick + wolniejszy growth) — zero wire League World poza skutkiem ubocznym skill.

---

## 8. Wpływ na Transfers

| Element               | Wpływ                                                              |
| --------------------- | ------------------------------------------------------------------ |
| `deriveTransferFee`   | **bez zmian formuły** — fee reaguje na `skill`/`age` automatycznie |
| Settlement Path       | **nienaruszony**                                                   |
| Listing / nego        | **bez zmian**                                                      |
| Career Phase na rynku | OUT Thin (opcjonalny Future Information) — nie w tym EPICu         |

Sell-before-decline = decyzja gracza wsparta **widoczną fazą** na Squad/Player — nie nowym flow transferów.

---

## 9. Wpływ na Academy (tylko zależności)

| Fakt                      | Reguła                                                        |
| ------------------------- | ------------------------------------------------------------- |
| Age path                  | **Ten sam** co senior (LOCK 3)                                |
| Career Phase              | Derive z `age` także dla `academy_track`                      |
| Growth Gate               | Perspektywy i tak poza Match/Training growth (senior filters) |
| Intake / Promote / max 3  | **bez zmian** (ACADEMY-01)                                    |
| Youth Depth / auto-intake | **OUT** (ACADEMY-02 osobno)                                   |

Uwaga produktowa: perspektywa trzymana latami może wejść w `decline`/`late` w akademii — spójne z LOCK 3; Release/Youth Depth = przyszły EPIC, nie ten.

---

## 10. Architektura wire (szkic IMPLEMENT)

```
resolveCareerPhase(age) → phase          // D124 derive · UI + gates

Match / Training impulse
  → eligible growth candidates (REUSE)
  → phase = resolveCareerPhase(age)
  → coeff = resolveGrowthCoefficient(phase)
  → deterministic allow(coeff) → maybe +1 skill ≤ potential

Confirm N+1
  → H-AGE unchanged orchestration
  → applySeasonAgeEffects (pasma regress §6.1)
  → persist age/skill
  → (optional) Thin feedback regress count
```

**LFE / migracje / PUBLIC:** zero.

---

## 11. Acceptance Criteria

| ID        | Kryterium                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------- |
| **AC-1**  | `resolveCareerPhase` jest pure, deterministyczne, age-based (default), bez I/O.                           |
| **AC-2**  | Faza **nigdy** nie jest kolumną DB / nie wymaga migracji (LOCK 4 · D124).                                 |
| **AC-3**  | UI Squad / Player Card pokazuje fazę wyłącznie z derive (Information Thin).                               |
| **AC-4**  | `resolveGrowthCoefficient(phase) ∈ (0, 1]` · **żadna** faza nie ma twardego `0` (LOCK 2).                 |
| **AC-5**  | Match PRIMARY stosuje Growth Gate deterministycznie; ten sam impuls → ten sam wynik.                      |
| **AC-6**  | Training SUPPORTING stosuje **ten sam** współczynnik / helper (ZERO DUPLICATE LOGIC).                     |
| **AC-7**  | H-AGE nadal jedyny age++ · scope = cały active roster w tym academy (LOCK 3 · D122).                      |
| **AC-8**  | Sezonowy regress skill pozostaje w `applySeasonAgeEffects` (jeden SSOT) · zgodny z §6.1 lub Owner waiver. |
| **AC-9**  | Potential nie jest mutowany przez Decline Thin.                                                           |
| **AC-10** | Brak zmian `@lastfootball/lfe` PUBLIC / Match Engine (LOCK 5–6).                                          |
| **AC-11** | Brak zmian Settlement / `deriveTransferFee` semantyki.                                                    |
| **AC-12** | D124 w DOCS CLOSE; PLAYERS / baseline / ROADMAP zsynchronizowane.                                         |
| **AC-13** | Regresja: AGE-01 wire · PLAYERS-02 growth · LEAGUE-WORLD-02 session skill map — PASS.                     |

---

## 12. Strategia testów

### 12.1 Pure — Career Phase

| Case                       | Oczekiwanie                             |
| -------------------------- | --------------------------------------- |
| age 18 / 25 / 30 / 34 / 40 | youth / rising / prime / decline / late |
| granice progów             | domknięte przedziały, bez dziur         |
| rerun                      | identyczny phase                        |

### 12.2 Pure — Growth Gate

| Case                           | Oczekiwanie                                |
| ------------------------------ | ------------------------------------------ |
| coeff youth/rising/prime = 1.0 | always allow (dla stałego impulseKey)      |
| decline 0.5 / late 0.25        | allow rate ~coeff na stabilnej próbce hash |
| brak coeff 0                   | assert > 0 dla wszystkich phase            |
| ten sam id+key                 | bit-identyczny allow                       |

### 12.3 Pure — Age regress

| Case                | Oczekiwanie                    |
| ------------------- | ------------------------------ |
| tick → decline      | skill −1 (lub waiver)          |
| tick → late         | skill −2 (lub waiver)          |
| skill=1             | bez zejścia poniżej 1          |
| skill vs potential  | zawsze ≤ potential             |
| academy row w slice | traktowany jak senior (LOCK 3) |

### 12.4 Wire / regresja

| Case                     | Oczekiwanie                |
| ------------------------ | -------------------------- |
| H-AGE Confirm            | age++ nadal działa         |
| Match development        | gate nie psuje K_MATCH cap |
| League session skill map | czyta zaktualizowany skill |
| Transfers fee smoke      | bez zmian API              |

### 12.5 Poza testami

E2E 10 sezonów · Retirement UI · minutes-based regress · Prime buff.

---

## 13. VERIFY checklist (po IMPLEMENT · przed COMMIT)

- [x] format · typecheck · lint · test · build PASS
- [x] AC-1…AC-13 spełnione lub jawny waiver Owner
- [x] Diff **bez** `packages/lfe` PUBLIC / allowlist / Match Engine
- [x] Diff **bez** `supabase/migrations`
- [x] Diff **bez** nowych kolumn w typach DB / RPC schemas
- [x] `applySeasonAgeEffects` pozostaje jedynym SSOT age/regress
- [x] Growth Gate współdzielony Match + Training (jeden helper)
- [x] `resolveCareerPhase` bez side-effectów
- [x] Single Settlement Path / Confirm D82 nienaruszone

---

## 14. DOCS CLOSE checklist (po PRODUCTION VERIFY)

- [x] [`docs/DECISIONS.md`](../DECISIONS.md) — **D124** Career Phase as Derived Domain Concept
- [x] [`docs/AI/ARCHITECTURAL_DECISIONS.md`](../AI/ARCHITECTURAL_DECISIONS.md) — skrót D124
- [x] [`docs/platform/PLAYERS.md`](../platform/PLAYERS.md) — phase derive · Growth Gate · Decline Thin
- [x] [`docs/ROADMAP.md`](../ROADMAP.md) · STATUS · BASELINE · HANDOFF · CHANGELOG · EPIC_INDEX
- [x] Ten PLAN → Status **FULLY CLOSED** + feat hash `3c01baa`
- [x] Tip pin docs
- [x] Pointer: Retirement / Prime / Youth Depth nadal FUTURE

---

## 15. Milestones IMPLEMENT (po Owner GO)

| M      | Zakres                                                                     | OUT          | Stan    |
| ------ | -------------------------------------------------------------------------- | ------------ | ------- |
| **M1** | `resolveCareerPhase` + `DEVELOPMENT_THIN` progi + testy pure               | DB column    | **DONE** |
| **M2** | `resolveGrowthCoefficient` + wire Match/Training gate + testy              | Hard ban (0) | **DONE** |
| **M3** | Pasma regress w `applySeasonAgeEffects` (§6.1 lub waiver) + H-AGE regresja | Retirement   | **DONE** |
| **M4** | UI Information Thin (Squad / Player) + opcjonalny feedback Confirm         | Timeline UI  | **DONE** |
| **M5** | VERIFY → COMMIT → PUSH → CI → PRODUCTION VERIFY → DOCS CLOSE (D124)        | —            | **DONE** |

---

## 16. Decyzja (DOCS CLOSE)

### D124 — Career Phase as Derived Domain Concept · CLOSED

**Dlaczego:** Schyłek i peak muszą być czytelne w UI i bramkować rozwój bez drugiego modelu danych i bez kolumn DB.  
**Zasada:** `CareerPhase` = pure derive z faktów domeny (Thin: `age`); UI i Growth Gate czytają wyłącznie `resolveCareerPhase` / `resolveGrowthCoefficient`; zero persist `career_phase`; AGE tick nadal H-AGE; Decline Depth = pasma regress + malejący współczynnik growth (nie hard ban); brak Retirement/Prime w tym EPICu.  
**Źródło:** LFE-CAREER-DECLINE-01 · feat **`3c01baa`** · SSOT [`../DECISIONS.md`](../DECISIONS.md).

---

## 17. Status — FULLY CLOSED

|                          |                                                                                 |
| ------------------------ | ------------------------------------------------------------------------------- |
| PLAN                     | **FULLY CLOSED** — `docs/implementation/LFE-CAREER-DECLINE-01-PLAN.md`          |
| Domain feat              | **`3c01baa`**                                                                   |
| Decision                 | **D124** CLOSED                                                                 |
| CI / Production          | GREEN · VERIFIED                                                                |
| Następny EPIC            | **Czekaj na Owner GO** — §22 / Youth Depth / Retirement / Prime                 |

**EPIC LFE-CAREER-DECLINE-01 = FULLY CLOSED.** Nie startować kolejnego EPIC bez Owner GO.
