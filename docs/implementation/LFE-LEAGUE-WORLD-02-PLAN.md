# LFE-LEAGUE-WORLD-02 — PLAN (Tier-aware AI strength · League Strength Profile)

**EPIC:** LFE-LEAGUE-WORLD-02  
**Typ:** docs PLAN · League World Thin (Web-only strength bands + MatchSession skill map)  
**Data:** 2026-08-03  
**Wejście:** AUDIT LFE-LEAGUE-WORLD-02 · Owner **GO → PLAN**  
**Status PLAN:** FULLY CLOSED · feat `843bcfd` · CI GREEN · PRODUCTION VERIFY · DOCS CLOSE  
**Baseline wejścia:** Domain `6a54722` (AGE-01 · D122) · Promotion `fa06c53` (D88–D94 · D92) · tip `89ec878` (docs) · D1–D122  
**Baseline wyjścia:** Domain **`843bcfd`** · D1–**D123** · docs tip `DOCS_TIP`  
**SSOT wejścia:** AUDIT sesji · [`../game-design/GDD-PROMOTION-01.md`](../game-design/GDD-PROMOTION-01.md) · [`../platform/LEAGUE.md`](../platform/LEAGUE.md) · [`../DECISIONS.md`](../DECISIONS.md) D15/D17/D28/D88–D94 · `opponent-catalog.ts` · `plan-fixtures.ts` · `create-session.ts` · `seed-roster.ts`

---

## 0. Cel

Po awansie / spadku szczebla (`league_tier`) świat ligi ma **realnie trudniejszy (lub łatwiejszy) poziom sportowy** w MatchSession — bez baraży, bez nowego Match Engine i bez zmian LFE PUBLIC.

**Zasada nadrzędna**

> Wariant **B**: ten sam katalog 11 AI + **League Strength Profile** (`minSkill` / `maxSkill`) per tier.  
> **Obowiązkowo:** mapowanie `players.skill` (DB) → LFE `PlayerSkills` w league MatchSession.  
> REUSE: `planClubFixtures` double RR 22 · Confirm N+1 wipe · `createPlayer` (istniejące pole `skills`).  
> D123 superseduje D92 po wdrożeniu.

---

## 1. Owner LOCK (zamknięte w tym PLAN)

| #   | Potwierdzenie                                                                          | Stan       |
| --- | -------------------------------------------------------------------------------------- | ---------- |
| 1   | **Player DB → MatchSession skill map = IN** (obowiązkowo)                              | **LOCKED** |
| 2   | **League Strength Profile** = domenowy kontrakt (`minSkill`, `maxSkill`, rozszerzalny) | **LOCKED** |
| 3   | Wariant **B** — skill bands per tier (nie osobne 4×11 katalogi nazw jako wymóg)        | **LOCKED** |
| 4   | **D123** zastępuje **D92** po wdrożeniu (Same Opponent World → Tier-aware Strength)    | **LOCKED** |
| 5   | **Brak** zmian LFE PUBLIC API / allowlist / root barrel                                | **LOCKED** |
| 6   | **Brak** migracji schematu                                                             | **LOCKED** |
| 7   | **Brak** zmian Match Engine / AI decision ladder / Physics                             | **LOCKED** |

Owner GO → IMPLEMENT potwierdza LOCK 1–7 bez zmian semantyki.

---

## 2. Thin IN

| #   | Element                                                                                                                                                                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Kontrakt pure **`LeagueStrengthProfile`**: `{ minSkill, maxSkill }` (+ miejsce na przyszłe pola — patrz §4)                                                                                                                                 |
| 2   | SSOT resolve: `resolveLeagueStrengthProfile(tier: LeagueTier) → LeagueStrengthProfile`                                                                                                                                                      |
| 3   | Pasma Thin (liczby LOCK w IMPLEMENT jeśli Owner nie skoryguje): IV / III / II / I rosnąco, `1 ≤ minSkill ≤ maxSkill ≤ 99`, bez overlap wymuszony (prefer monotoniczny growth)                                                               |
| 4   | Deterministyczny skill AI per zawodnik: `resolveOpponentPlayerSkill(opponentClubId, slotIndex, profile)` ∈ `[minSkill, maxSkill]`                                                                                                           |
| 5   | `seedOpponentSquad(opponentClubId, tier)` (lub równoważny) → seed z skill Thin; REUSE role/XI layout                                                                                                                                        |
| 6   | **Mapa gracza:** `mapPlayerSkillToLfeSkills(skill: number) → PlayerSkills` — uniform Thin z `players.skill` (1…99) na wszystkie pola LFE `PlayerSkills` (lub jawny helper role-aware **tylko** jeśli już istnieje REUSE; default = uniform) |
| 7   | Wire `createSessionFromLeagueFixture`: `createPlayer({ …, skills })` dla **naszej** XI (z DB skill) **i** AI (z profile)                                                                                                                    |
| 8   | `planClubFixtures(clubId, tier?)` — tier **opcjonalny** w Thin B (katalog nazw bez zmian); Confirm przekazuje `nextTier` dla spójności API / przyszłego wariantu A                                                                          |
| 9   | Confirm N+1: po `applyLeagueTierOutcome` plan + session world używają **nowego** tier (fixtures wipe już istnieje)                                                                                                                          |
| 10  | Testy pure (profile · opponent skill · player map) + session wire smoke                                                                                                                                                                     |
| 11  | DOCS CLOSE: D123 · LEAGUE · PROMOTION pointer · ROADMAP · BASELINE · HANDOFF · CHANGELOG · PLAN CLOSED                                                                                                                                      |

---

## 3. Thin OUT (twarde)

- Osobne 4 pełne katalogi nazw 11 AI jako wymóg (wariant A) — **OUT** (opcjonalny Future content)
- Baraże / playoff (D94)
- Standings DB · drugi planner terminarza
- Zmiana `LEAGUE_FIXTURE_COUNT` / double RR semantyki
- Rotacja żyjących klubów AI w tabeli `clubs` / FK
- Bias AI↔AI w `resolveLeagueTable` od skill (tabela nadal derive bez Match)
- Zmiany LFE PUBLIC · Match Engine · goalChance · Physics · ECS
- Migracje DB
- Transfer market filter po tier · AI clubs na rynku
- First Match bot redesign (poza league path)
- Soft-lock / Sponsors / Board / Stadium
- World-age AI · Academy levels · Prestige §6
- Numeric potential w MatchSession
- Zmiana Settlement Path

---

## 4. Model League Strength Profile

### 4.1 Kontrakt (domena Web · nie LFE package)

```ts
/** Extensible Thin profile — add fields later without breaking resolve. */
type LeagueStrengthProfile = {
  readonly minSkill: number; // 1…99
  readonly maxSkill: number; // 1…99, >= minSkill
  // Future (OUT tego EPICu, miejsce w typie / docs only):
  // readonly variance?: number;
  // readonly gkBias?: number;
};
```

### 4.2 Resolve SSOT

| Funkcja                                             | Rola                                |
| --------------------------------------------------- | ----------------------------------- |
| `resolveLeagueStrengthProfile(tier)`                | Jedyny SSOT pasm per szczebel       |
| `resolveOpponentPlayerSkill(oppId, index, profile)` | Deterministyczny skill ∈ [min, max] |
| `mapPlayerSkillToLfeSkills(skill)`                  | DB → LFE `PlayerSkills`             |

**Zakaz:** magic numbers `32`/`50`/`70` rozsiane w `create-session` — tylko przez Profile / map helper.

### 4.3 Propozycja pasm Thin (do LOCK liczb w IMPLEMENT)

| Tier  | Label    | minSkill | maxSkill | Sens                 |
| ----- | -------- | -------- | -------- | -------------------- |
| `iv`  | IV liga  | 42       | 58       | Start / miękki świat |
| `iii` | III liga | 50       | 66       | Pierwszy realny skok |
| `ii`  | II liga  | 58       | 74       | Mid pyramid          |
| `i`   | I liga   | 66       | 82       | Ceiling Thin         |

Zasady: monotoniczny wzrost mediany; overlap sąsiadów dozwolony lekko; `maxSkill ≤ 99`.  
Owner może skorygować liczby w GO IMPLEMENT **bez** zmiany kształtu kontraktu.

### 4.4 Opponent skill determinizm

```
skill = minSkill + (stableHash(oppId + ':' + index) % (maxSkill - minSkill + 1))
```

Zero RNG runtime · zero I/O.

### 4.5 Player skill map (LOCK 1)

| Wejście              | `players.skill` (senior XI z DB)                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------- |
| Wyjście              | `PlayerSkills` dla `createPlayer`                                                                  |
| Thin                 | Uniform: każde pole rating = `clamp(skill, 1, 99)`                                                 |
| GK                   | Te same wartości Thin (brak osobnego GK engine w tym EPICu)                                        |
| Brak skill w wierszu | Fail closed / skip player — **nie** ciche `50` jeśli DB ma skill (XI loader musi dostarczyć skill) |

**RosterPlayerSeed** rozszerzenie Thin: opcjonalne `skill?: number` **lub** osobny parallel array przy budowie session — IMPLEMENT wybiera REUSE-friendly kształt (bez migracji).

---

## 5. Wpływ na Promotion

| Przed (D92)                                          | Po (D123)                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------- |
| Tier = etykieta                                      | Tier = etykieta **+** Strength Profile                        |
| Confirm: persist tier · ten sam katalog · flat match | Confirm: persist tier · Profile(nextTier) · AI skills z pasma |
| Raport „Awans do III”                                | Nadal Information Thin; **emocja sportowa** dopiero w MD N+1  |

**Nienaruszone:** D88–D91 · D93–D94 · sole Confirm mutation · report-before-persist.

**Zmiana decyzji:** D92 → **SUPERSEDED by D123** w DOCS CLOSE.

---

## 6. Wpływ na Age (D122)

|                       |                                                          |
| --------------------- | -------------------------------------------------------- |
| Age++                 | Bez zmian hooka / persist                                |
| Po Age + League World | Kadra starzeje się **i** gra w tier-aware world          |
| Soft regress @32      | Skill DB ↓ → MatchSession skills ↓ (dzięki mapie LOCK 1) |
| World-age AI          | Nadal OUT                                                |

Synergia retencji: S2+ = trudniejsza liga **oraz** starzejąca się kadra.

---

## 7. Wpływ na Transfers

|                                 |                                            |
| ------------------------------- | ------------------------------------------ |
| Fee / settle / market DTO       | **Bez zmian**                              |
| `deriveTransferFee(skill, age)` | REUSE — skill DB nadal SSOT fee            |
| Match vs Market                 | Nadal rozłączone (AI seed ≠ live listings) |
| Tier filter rynku               | **OUT**                                    |

Po mapie skill→match: transfer, który podnosi `players.skill`, **wreszcie** wpływa na MatchSession (dziś league path ignoruje skill).

---

## 8. Architektura wire (szkic IMPLEMENT)

```
Confirm N+1
  → applyLeagueTierOutcome → nextTier
  → H-AGE (D122)
  → planClubFixtures(clubId, nextTier)  // Thin B: tier for API future-proof
  → season in_season + league_tier

League match kickoff
  → load XI rows (id, skill, …)
  → profile = resolveLeagueStrengthProfile(club.leagueTier)
  → our: mapPlayerSkillToLfeSkills(row.skill)
  → their: seedOpponentSquad(oppId, tier) → skills from profile
  → createPlayer({ …, skills })  // PUBLIC createPlayer — no API change
  → createMatch / session
```

**LFE:** tylko konsumuje `skills` już wspierane przez `createPlayer` — zero diff silnika.

---

## 9. Acceptance Criteria

| ID        | Kryterium                                                                                                                    |
| --------- | ---------------------------------------------------------------------------------------------------------------------------- |
| **AC-1**  | `resolveLeagueStrengthProfile` zwraca `minSkill ≤ maxSkill` w 1…99 dla każdego `LeagueTier`.                                 |
| **AC-2**  | Median / mid-band profilu **rośnie** IV → III → II → I (monotonicznie).                                                      |
| **AC-3**  | `resolveOpponentPlayerSkill` jest deterministyczny (te same id+index+tier → ten sam skill).                                  |
| **AC-4**  | Opponent skills w session ∈ `[profile.minSkill, profile.maxSkill]`.                                                          |
| **AC-5**  | League MatchSession dla gracza: `createPlayer` dostaje skills zmapowane z `players.skill` (nie default 50, gdy DB ma skill). |
| **AC-6**  | Po awansie Confirm: nowe fixtures + mecze używają Profile **nowego** tier.                                                   |
| **AC-7**  | Katalog nazw: nadal 11 AI · double RR 22 · D28/D80 nienaruszone.                                                             |
| **AC-8**  | Brak zmian `@lastfootball/lfe` PUBLIC surface / allowlist.                                                                   |
| **AC-9**  | Brak migracji schematu.                                                                                                      |
| **AC-10** | Brak zmian plików Match Engine (tick/resolve/AI decide) — tylko Web session build.                                           |
| **AC-11** | D123 w DOCS CLOSE; D92 oznaczony SUPERSEDED.                                                                                 |
| **AC-12** | First Match path: **bez regresji** (OUT tego EPICu — nie psuć; brak wymogu tier profile na inaugural bot).                   |

---

## 10. Strategia testów

### 10.1 Pure

| Case                            | Oczekiwanie                         |
| ------------------------------- | ----------------------------------- |
| Profile IV vs I                 | mid(I) > mid(IV)                    |
| Opponent skill bounds           | zawsze w [min, max]                 |
| Hash stability                  | rerun identyczny                    |
| `mapPlayerSkillToLfeSkills(70)` | wszystkie ratingi 70 (Thin uniform) |
| Clamp                           | skill 0/200 → 1/99                  |

### 10.2 Session / wire

| Case                     | Oczekiwanie           |
| ------------------------ | --------------------- |
| Fixture + club tier `i`  | AI skills w paśmie I  |
| Fixture + club tier `iv` | AI skills w paśmie IV |
| Our XI skill 80 z DB     | LFE player skills 80  |
| plan length              | nadal 22              |

### 10.3 Regresja

Promotion outcome · Confirm · Age H-AGE · Transfers fee · table derive · soft-lock.

### 10.4 Poza testami

E2E 10 sezonów · baraże · content art per tier.

---

## 11. VERIFY checklist (po IMPLEMENT · przed COMMIT)

- [x] format · typecheck · lint · test · build PASS
- [x] AC-1…AC-12 spełnione lub jawny waiver Owner
- [x] Diff **bez** `packages/lfe` (lub wyłącznie komentarz zero — prefer **zero** diff LFE)
- [x] Diff **bez** `public-allowlist` / root `index.ts` LFE
- [x] Diff **bez** `supabase/migrations`
- [x] `createSessionFromLeagueFixture` ustawia `skills` po obu stronach
- [x] Single Settlement Path / Confirm D82 nienaruszone

---

## 12. DOCS CLOSE checklist (po PRODUCTION VERIFY)

- [x] [`docs/DECISIONS.md`](../DECISIONS.md) — **D123** · D92 SUPERSEDED
- [x] [`docs/AI/ARCHITECTURAL_DECISIONS.md`](../AI/ARCHITECTURAL_DECISIONS.md) — skrót D123
- [x] [`docs/ROADMAP.md`](../ROADMAP.md) · STATUS · BASELINE · HANDOFF · CHANGELOG · EPIC_INDEX
- [x] [`docs/lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) — nota: Web-only · surface nienaruszony
- [x] [`docs/platform/PLAYERS.md`](../platform/PLAYERS.md) — skill→MatchSession
- [x] Ten PLAN → Status **FULLY CLOSED** + feat hash `843bcfd`
- [x] Tip pin docs

---

## 13. Milestones IMPLEMENT (po Owner GO)

| M      | Zakres                                                                             | OUT                  |
| ------ | ---------------------------------------------------------------------------------- | -------------------- |
| **M1** | `LeagueStrengthProfile` + resolve + opponent skill pure + testy                    | Catalog A            |
| **M2** | `mapPlayerSkillToLfeSkills` + rozszerzenie seed/XI load skill                      | Engine               |
| **M3** | Wire `createSessionFromLeagueFixture` (+ Confirm tier arg planner jeśli potrzebne) | First Match redesign |
| **M4** | VERIFY → COMMIT → PUSH → CI → PRODUCTION VERIFY                                    | —                    |
| **M5** | DOCS CLOSE (D123)                                                                  | —                    |

**M1–M5 = DONE.**

---

## 14. Decyzja (DOCS CLOSE)

### D123 — Tier-Aware League Strength World · CLOSED

**Dlaczego:** D92 (same opponent world) czyni awans kosmetycznym; retencja S2+ wymaga trudności per szczebel.  
**Zasada:** `league_tier` wybiera `LeagueStrengthProfile` (`minSkill`/`maxSkill`); AI seed skills ∈ pasmo; league MatchSession mapuje `players.skill` → LFE `PlayerSkills`; katalog nazw Thin B bez wymogu 4× content; kalendarz 22 REUSE; brak LFE PUBLIC / migracji / Match Engine.  
**Superseduje:** **D92** Thin Same Opponent World.

---

## 15. Status i następny krok

|                          |                                                                               |
| ------------------------ | ----------------------------------------------------------------------------- |
| PLAN                     | **FULLY CLOSED** · feat `843bcfd` · CI GREEN · PRODUCTION VERIFY · DOCS CLOSE |
| Implementacja            | **SHIPPED** · Domain `843bcfd`                                                |
| Commit / push / migracje | Domain feat `843bcfd` · **brak** migracji schematu                            |

**EPIC rekomendacja:** FULLY CLOSED po docs tip pin. **Nie startować** kolejnego EPIC bez Owner GO (§22 / Career Decline).
