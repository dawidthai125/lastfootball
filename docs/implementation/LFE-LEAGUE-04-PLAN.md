# LFE-LEAGUE-04 — PLAN (Full 22-Fixture Season · Double RR)

**EPIC:** LFE-LEAGUE-04  
**Typ:** Domain calendar Thin — wydłużenie sezonu 11 → 22 (GDD §10 home+away)  
**Data:** 2026-07-30  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · LEAGUE-01…03 CLOSED · D15 / D17 · GDD §10  
**Status PLAN:** CLOSED · EPIC LFE-LEAGUE-04 FULLY CLOSED (feat `9027baf` · PRODUCTION VERIFY PASS · DOCS CLOSE)
**Baseline wejścia:** Domain `bf86749` · Presentation `9fd14fc` · Docs tip `98a3d81` · tip `0656a2f`

---

## 0. Cel

Wydłużyć sezon ligowy z **11** do **22** kolejek zgodnie z GDD §10 (dwukrotny RR, 12 klubów):

- gracz gra **home + away** przeciwko każdemu z 11 AI,
- **Double Round Robin** obowiązuje dla **całej ligi** (gracz + AI↔AI w derive tabeli),
- **`planClubFixtures()`** pozostaje **jedynym** plannerem,
- istniejące kluby dostają wyłącznie **top-up MD12–22** (MD1–11 nienaruszone),
- **bez** Season End · awansów · spadków · schedulerów · zmian Match Engine · migracji schematu.

**Zasada nadrzędna (Owner freeze)**

> LFE-LEAGUE-04 = wyłącznie kalendarz 22 (double RR). Nie jest EPICem zamknięcia sezonu ani tempo 1 mecz/dzień.

---

## 1. Zamrożone decyzje Ownera (nienaruszalne w PLAN)

| #   | Decyzja                                                                    |
| --- | -------------------------------------------------------------------------- |
| 1   | Scope = **tylko** wydłużenie sezonu **11 → 22**                            |
| 2   | **Double Round Robin** dla całej ligi (gracz + AI)                         |
| 3   | **`planClubFixtures()`** = jedyny planner                                  |
| 4   | **`LEAGUE_FIXTURE_COUNT = 22`** = nowy SSOT                                |
| 5   | Istniejące kluby: wyłącznie **top-up MD12–22**                             |
| 6   | **MD1–11 nigdy** nie są przebudowywane / tasowane                          |
| 7   | **Brak** migracji schematu                                                 |
| 8   | **Brak** feature flag i trybu legacy                                       |
| 9   | **Brak** Season End · awansów · spadków · schedulerów · zmian Match Engine |
| 10  | SSOT FIRST · REUSE FIRST · ZERO DUPLICATE LOGIC · Resolver First           |

---

## 2. Zakres Thin (IN)

| #   | Element                                                                                                                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `LEAGUE_FIXTURE_COUNT = 22` w `opponent-catalog.ts` (export SSOT)                                                               |
| 2   | `planClubFixtures(clubId)` → dokładnie **22** `PlannedFixture` (deterministycznie)                                              |
| 3   | **Invariant kompatybilności:** dla każdego `clubId`, prefix MD1–11 nowego planu **===** wynik algorytmu LEAGUE-03 (single RR)   |
| 4   | MD12–22 = rewanże: ten sam `opponentClubId` co MD `k` (k=1…11) · `isHome` **odwrócone** · `matchday = 11 + k`                   |
| 5   | Statusy planu: MD1 = `upcoming`, MD2–22 = `scheduled` (jak dziś dla MD1 vs rest)                                                |
| 6   | REUSE `resolveFixtureTopUp` + `ensureClubFixtures` — bez zmiany semantyki (brakujące MD z planu; zero nadpisu istniejących)     |
| 7   | `planAiVsAiMatches`: **double RR** (każda para AI home+away) — deterministyczne wyniki; **jedyna** zmiana derive AI↔AI          |
| 8   | Aktualizacja testów fixtures + league (count 22 · prefix MD1–11 · top-up 12–22 · AI↔AI `11×10` meczów)                          |
| 9   | Komentarze / LEAGUE.md / D15+D17 (DOCS CLOSE): wyjątek „11 ≠ 22” → **22 = SSOT**                                                |
| 10  | DOCS CLOSE po PRODUCTION VERIFY (BASELINE · HANDOFF · STATUS · ROADMAP · LEAGUE · DECISIONS D15/D17 update lub D28 · CHANGELOG) |

---

## 3. Zakres OUT (twarde)

- Season End UI / pipeline · `age++` wiring · awans / spadek / baraże
- Reguła 1 mecz/dzień · soft backlog · soft resolution AFK
- Feature flag · dual count 11|22 · „legacy planner”
- Migracje Supabase (schemat już pozwala na `matchday` 12–22 przez `unique(club_id, matchday)`)
- Przebudowa / DELETE / UPDATE wierszy MD1–11
- Zmiany Match Engine / Live / Post / XI Gate
- Zmiany Achievements · Daily · Ranking · Transfers · Training · Academy · Scouting (poza skutkiem ubocznym dłuższej tabeli)
- Standings DB · drugi planner · losowy re-seed opponentów
- Puchar w kalendarzu · multi-liga · zmiana `LEAGUE_SIZE` / katalogu AI

---

## 4. Architektura (REUSE · ZERO DUPLICATE)

### 4.1 Przepływ (bez zmian warstw)

```
clubId
  → planClubFixtures(clubId)           ← JEDYNY planner (22 wiersze)
  → resolveFixtureTopUp(plan, existing)
  → ensureClubFixtures insert missing
  → listClubFixtures
  → resolveLeagueTable(club, fixtures) ← AI↔AI double RR derive
  → Hub / Match / League / Ranking
```

### 4.2 Algorytm `planClubFixtures` (22)

Niech `N = 11` = `OPPONENT_CATALOG.length`.

1. `opponents = pickOpponentsForClub(clubId, N)` — **bez zmian** (ta sama kolejność co LEAGUE-03).
2. `homeFirst = (hashBit(clubId) & 1) === 0` — **bez zmian**.
3. **Runda 1 (MD 1…N)** — identyczna z LEAGUE-03:

| Pole             | Reguła                                  |
| ---------------- | --------------------------------------- |
| `matchday`       | `i + 1` (`i = 0…N-1`)                   |
| `opponentClubId` | `opponents[i].id`                       |
| `isHome`         | `homeFirst ? i % 2 === 0 : i % 2 === 1` |
| `status`         | `i === 0 ? 'upcoming' : 'scheduled'`    |

4. **Runda 2 (MD N+1…2N)**:

| Pole             | Reguła                                        |
| ---------------- | --------------------------------------------- |
| `matchday`       | `N + i + 1`                                   |
| `opponentClubId` | `opponents[i].id` (ten sam rywal co MD `i+1`) |
| `isHome`         | **`!`** wartości z rundy 1 dla tego `i`       |
| `status`         | zawsze `'scheduled'`                          |

5. `LEAGUE_FIXTURE_COUNT = 22` (= `2 * N`).

**Invariant testowy (obowiązkowy):**

```ts
const plan22 = planClubFixtures(clubId);
// symulacja „starego” prefixu: pierwsze 11 wierszy muszą mieć
// opponent + isHome jak algorytm LEAGUE-03 (regresja top-up / prod)
expect(plan22).toHaveLength(22);
expect(plan22.slice(0, 11).map(...)).toEqual(/* LEAGUE-03 identity */);
for (let i = 0; i < 11; i++) {
  expect(plan22[11 + i].opponentClubId).toBe(plan22[i].opponentClubId);
  expect(plan22[11 + i].isHome).toBe(!plan22[i].isHome);
}
```

### 4.3 Top-up istniejących klubów

| Stan DB                   | Zachowanie `ensureClubFixtures`                |
| ------------------------- | ---------------------------------------------- |
| MD1–11 obecne, brak 12–22 | Insert tylko MD12–22 z planu (identity z §4.2) |
| Pusty klub                | Insert pełnych 22                              |
| Już 22 wiersze            | noop                                           |
| MD1–11                    | **Nigdy** nie UPDATE / DELETE / re-insert      |

`resolveFixtureTopUp` — **bez zmiany API**; działa na dowolnej długości `plan`.

Gdy klub ma MD1–11 `played` i brak `upcoming`: top-up promuje **najniższy brakujący** (MD12) do `upcoming` — istniejąca reguła LEAGUE-03, pożądana kontynuacja sezonu.

### 4.4 AI↔AI double RR (`planAiVsAiMatches`)

**Dziś:** każda nieuporządkowana para raz (`lowerId` = home) → `(11×10)/2 = 55` meczów.

**Po LEAGUE-04:** każda uporządkowana para home/away → **`11×10 = 110`** meczów.

| Reguła    | Spec                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Pary      | Dla każdych różnych `a,b` ∈ AI: mecz `a` home vs `b` **oraz** `b` home vs `a`                                                    |
| Score     | Deterministyczny hash **per kierunek** (np. seed `${home}\|${away}\|ai-v2`) — **nie** kopiować wyniku rewanżu z pierwszego meczu |
| Silnik    | Nadal **nie** Match Engine                                                                                                       |
| Konsument | Wyłącznie `resolveLeagueTable` (REUSE)                                                                                           |

**Uwaga wersji seed:** zmiana `ai-v1` → `ai-v2` (lub dopisek venue) jest **świadoma** — wyniki AI↔AI w tabeli mogą się przesunąć względem prod sprzed EPIC; akceptowalne (Thin derive, nie persist standings). Udokumentować w CHANGELOG / DECISIONS.

### 4.5 Co się **nie** zmienia

| Obszar             | Kontrakt                                      |
| ------------------ | --------------------------------------------- |
| `OPPONENT_CATALOG` | 11 AI · `LEAGUE_SIZE = 12`                    |
| First Match        | poza `fixtures`                               |
| Hub Primary        | `getNextFixture` / session — bez nowych reguł |
| Match Path / LFE   | bez zmian                                     |
| Unlock trening/TF  | nadal po `playedCount`                        |
| Schema `fixtures`  | bez migracji                                  |

---

## 5. SSOT / decyzje do aktualizacji (DOCS CLOSE)

| Fakt                       | Przed                   | Po LEAGUE-04             |
| -------------------------- | ----------------------- | ------------------------ |
| Liczba kolejek gracza      | 11 (wyjątek vs GDD)     | **22** (= GDD §10)       |
| Planner                    | `planClubFixtures`      | bez zmian roli           |
| AI↔AI                      | single RR               | **double RR**            |
| D15 / D17 / P9 / LEAGUE.md | count 11                | count **22** · double RR |
| ROADMAP                    | Full 22 READY FOR AUDIT | **LFE-LEAGUE-04 CLOSED** |

Rekomendacja CLOSE: zaktualizować D15/D17 in-place (+ notatka źródło LEAGUE-04) **albo** dodać **D28** „Calendar 22 / double RR supersedes count 11 in D15/D17” — wybrać w IMPLEMENT spójnie z rejestrami (preferencja PLAN: **D28** krótkie supersede count, treść D15/D17 uzupełniona o 22).

---

## 6. Pliki (szacunek IMPLEMENT — bez startu teraz)

| Obszar        | Kandydat                                                                                 |
| ------------- | ---------------------------------------------------------------------------------------- |
| Count + plan  | `apps/web/src/lib/fixtures/opponent-catalog.ts` · `plan-fixtures.ts`                     |
| AI↔AI         | `apps/web/src/lib/league/simulate-ai-results.ts`                                         |
| Testy         | `fixtures01.test.ts` · `league01.test.ts`                                                |
| Docs platform | `docs/platform/LEAGUE.md` (przy CLOSE lub w tym samym PR docs)                           |
| Docs CLOSE    | BASELINE · HANDOFF · STATUS · ROADMAP · DECISIONS · EPIC_INDEX · CHANGELOG · PLAN status |

**Brak:** `supabase/migrations/*` · flagi · UI Season End.

`ensure-club-fixtures.ts` / `resolve-fixture-top-up.ts` — **prawdopodobnie zero zmian kodu** (tylko dziedziczą dłuższy plan).

---

## 7. Acceptance Criteria (IMPLEMENT)

- [ ] `LEAGUE_FIXTURE_COUNT === 22`
- [ ] `planClubFixtures` zwraca 22 wiersze; deterministycznie; MD1 upcoming
- [ ] Prefix MD1–11 = identity LEAGUE-03 (opponent + isHome) dla tego samego `clubId`
- [ ] MD12–22 = rewanże (`!isHome`, ten sam opponent, matchday 12–22)
- [ ] Top-up: klub z MD1–11 dostaje dokładnie brakujące MD12–22; MD1–11 nietknięte
- [ ] Nowy klub: pełne 22 w jednym ensure
- [ ] `planAiVsAiMatches` = double RR (110 meczów dla 11 AI); deterministyczny
- [ ] Brak migracji · brak feature flag · brak zmian Match Engine / Season End
- [ ] Testy + format · typecheck · lint · test · build PASS
- [ ] Po GO: COMMIT → PUSH → CI → PRODUCTION VERIFY (ensure top-up na prod klubie / smoke Hub next) → DOCS CLOSE

---

## 8. Ryzyka (PLAN)

| ID  | Ryzyko                                | Odpowiedź PLAN                                      |
| --- | ------------------------------------- | --------------------------------------------------- |
| R1  | Przypadkowa zmiana MD1–11 w plannerze | Invariant test + zakaz tasowania opponentów         |
| R2  | Top-up wstawia złe rewanże            | Rewanż = funkcja prefixu MD1–11 z tego samego planu |
| R3  | Skok tabeli AI↔AI po zmianie seed     | Świadome · CHANGELOG; brak persist standings        |
| R4  | Scope creep Season End                | OUT twarde Owner                                    |
| R5  | Klub bez `upcoming` po końcu MD11     | Istniejący promote najniższego missing → MD12       |

---

## 9. Production Verify (szkic)

1. CI GREEN.
2. Vercel Ready na tip feat.
3. Smoke: zalogowany klub z kalendarzem 11 → po hit ścieżki `ensureClubFixtures` (np. `/league` / Hub) pojawiają się MD12–22; MD1–11 bez zmian statusów.
4. Nowy klub (lub lokalny ensure): 22 fixtures.
5. Brak błędów unique na `(club_id, matchday)`.

---

## 10. Poza zakresem (kolejne EPIC)

| Temat                       | Gdzie        |
| --------------------------- | ------------ |
| Season End · age++ · awans  | osobny EPIC  |
| 1 mecz/dzień · soft backlog | osobny EPIC  |
| Puchar w kalendarzu         | §11 / Future |

---

## 11. Kryteria wejścia w IMPLEMENT

1. Owner **GO IMPLEMENT** na ten PLAN.
2. Bez rozszerzania OUT.
3. Bez commit / push bez kolejnego Owner GO COMMIT.

---

## Last updated

2026-07-30 — CLOSED · feat `9027baf` · PRODUCTION VERIFY · DOCS CLOSE
