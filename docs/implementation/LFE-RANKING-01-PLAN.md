# LFE-RANKING-01 — PLAN (Ranking Information Thin · derive)

**EPIC:** LFE-RANKING-01  
**Typ:** Information Thin (GDD §18) — pure resolver · derive only  
**Data:** 2026-07-30  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · GDD-18 CLOSED · D19–D26  
**Status PLAN:** CLOSED · EPIC LFE-RANKING-01 FULLY CLOSED (feat `bf86749` · PRODUCTION VERIFY PASS · DOCS CLOSE)
**Baseline wejścia:** Domain `3915be9` · Presentation `9fd14fc` · Docs tip `4fc9c75` · tip `e221c0b`

---

## 0. Cel

Wdrożyć opcjonalną warstwę **sezonowego rankingu klubów** zgodnie z GDD §18:

- pytanie: **„Jak wypada mój klub wśród innych w tym sezonie?”**,
- wyłącznie **pure resolver derive** (bez persist),
- **porządkuje** porównanie klubów z **istniejących** sygnałów sezonu (tabela jako **input**),
- **nie** jest tabelą ligową, osią gry, Achievementami ani metrykami §6,
- **nie** mutuje domeny, **nie** dodaje ELO / Rating Score / XP / nowych metryk.

**Zasada nadrzędna (Owner freeze)**

> Ranking = Information Thin: porządkuje porównanie klubów w bieżącym sezonie; konsumuje tabelę wyłącznie jako input; ma własny DTO i surface UI; nie ocenia ELO i nie redefiniuje §6 / §10.

---

## 1. Zamrożone decyzje Ownera (nienaruszalne w PLAN)

| #   | Decyzja                                                                             |
| --- | ----------------------------------------------------------------------------------- |
| 1   | Ranking = **Information Thin**                                                      |
| 2   | Pure resolver **`resolveClubRanking()`**                                            |
| 3   | **Derive only**                                                                     |
| 4   | Ranking **nie jest** tabelą ligi                                                    |
| 5   | Ranking wykorzystuje dane tabeli **wyłącznie jako input**                           |
| 6   | Ranking ma **własny DTO** i **własny surface UI**                                   |
| 7   | **Nie** pokazywać jako głównego surface: punktów · bilansu · W/D/L · bramek         |
| 8   | **Zakaz** ELO · Rating Score · XP · nowych metryk                                   |
| 9   | **Zakaz** zmian §6                                                                  |
| 10  | **Zakaz** persistence · migracji                                                    |
| 11  | Ranking **dostępny od EARLY_CLUB**                                                  |
| 12  | Pokazywać **wszystkie kluby ligi**                                                  |
| 13  | Wynik resolvera **deterministyczny**                                                |
| 14  | Ranking = **bieżący sezon**, nie historia                                           |
| 15  | SSOT FIRST · REUSE FIRST · ZERO DUPLICATE LOGIC · Resolver First · Information Thin |

---

## 2. Zakres Thin (IN)

| #   | Element                                                                                                                                      |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pure resolver `resolveClubRanking(...)` → `ClubRankingDto`                                                                                   |
| 2   | Input = wynik / kształt `resolveLeagueTable` (**REUSE** standings jako sygnał; **zero** drugiej logiki punktów)                              |
| 3   | Mapowanie input → DTO Rankingu **bez** pól points / W/D/L / goals / GD                                                                       |
| 4   | Lista **wszystkich** klubów ligi w kolejności wynikającej z inputu tabeli (deterministycznie)                                                |
| 5   | Kontekst **bieżącego sezonu** (etykiety z inputu tabeli: `seasonLabel` / `leagueLabel`) — bez historii międzysezonowej                       |
| 6   | Opcjonalne **pasmo jakościowe** pozycji (np. górna / środkowa / dolna trzecina) — Information Thin, **nie** score                            |
| 7   | UI `/rankings`: zastąpienie `PlaceholderPage` + atrap rating/EU-1 widokiem z resolvera                                                       |
| 8   | Nav: pozycja Rankingu + unlock **`rankings` open od EARLY_CLUB** (NEW_CLUB zgodnie z istniejącym wzorcem EARLY set)                          |
| 9   | Copy w `UI_COPY` — rywalizacja sezonowa klubów (bez ELO / „reputacja serwera”)                                                               |
| 10  | Testy pure: determinizm · brak pól ELO/points/WDL/goals w DTO · ≠ surface LeagueTable · pełna lista członków                                 |
| 11  | Guide §16 presentation only — bez zmiany DTO unlock innych domen                                                                             |
| 12  | DOCS CLOSE po PRODUCTION VERIFY (BASELINE · HANDOFF · STATUS · ROADMAP · MODULE_MAP · DECISIONS **D27** · CHANGELOG · CURRENT_DESIGN · PLAN) |

---

## 3. Zakres OUT (twarde)

- ELO · Rating Score · rankingScore · XP · progress bary
- Kolumny / pola: `points` · `won` · `drawn` · `lost` · `goalsFor` · `goalsAgainst` · `goalDifference` w DTO / UI Rankingu
- Duplikat logiki punktacji / sortu ligowego (musi zostać w `resolveLeagueTable`)
- All-time / historia międzysezonowa / leaderboard historyczny
- Ranking graczy / zawodników · global / multi-serwer / MP / etykiety „EU-1”
- Persistence · tabele `rankings` · migracje Supabase
- Zmiany / implementacja metryk §6 (Poziom · Reputacja · Prestiż)
- Zmiany `resolveLeagueTable` semantyki · `/league` jako „Ranking”
- Zmiany Achievements (D26) · Daily Goal (D25) · Scouting · Transfers · Training · Academy · LFE
- Anti-abuse tech · fair-reset cron · schedulery
- Hub Primary CTA przejęty przez Ranking
- Ożywianie atrap placeholdera (rating 1840, FC Lastovia mock, „siła serwera”)

---

## 4. Architektura (Resolver First · Information Thin)

### 4.1 Rola warstw

| Warstwa      | SSOT / owner               | Rola Rankingu                                 |
| ------------ | -------------------------- | --------------------------------------------- |
| Metryki §6   | GDD §6                     | **Nietknięte**                                |
| Tabela ligi  | `resolveLeagueTable` (D17) | **Input only** — nie surface Rankingu         |
| Achievements | `resolveClubAchievements`  | **Niezależne**                                |
| Daily Goal   | `resolveClubDailyGoal`     | **Niezależne**                                |
| Hub Primary  | `resolvePrimaryCta`        | **Nienaruszony**                              |
| Ranking      | `resolveClubRanking` (§18) | Porównanie sezonowe klubów (Information Thin) |

### 4.2 Przepływ danych (REUSE · ZERO DUPLICATE)

```
club + fixtures
    │
    ▼
resolveLeagueTable(club, fixtures)     ← jedyny SSOT standings / punktów
    │
    ▼  (LeagueTableDto jako input)
resolveClubRanking({ table })          ← mapowanie Information Thin
    │
    ▼
ClubRankingDto → RankingView (/rankings)
```

**Zasady**

1. `resolveClubRanking` **nie** liczy punktów, bilansu ani bramek.
2. Kolejność wierszy Rankingu = kolejność `table.rows` (już posortowana deterministycznie przez tabelę).
3. `position` w Rankingu = pozycja porządkowa porównania sezonowego (konsumpcja sygnału) — **nie** ELO i **nie** nowa metryka klubu.
4. Resolver **pure**: bez I/O, bez `Date.now`, bez mutacji.
5. Page **może** wywołać `resolveLeagueTable` raz i przekazać wynik do Rankingu (preferowane) — bez drugiego derive sportowego w Rankingu.

### 4.3 Kontrakt DTO (Thin)

```ts
type RankingBand = 'upper' | 'mid' | 'lower';

type ClubRankingRowDto = {
  readonly position: number;
  readonly clubId: string;
  readonly name: string;
  readonly shortName: string;
  readonly isPlayer: boolean;
  readonly band: RankingBand;
};

type ClubRankingDto = {
  readonly seasonLabel: string;
  readonly contextLabel: string; // lokalny kontekst ligi produktowej (np. z table.leagueLabel)
  readonly rows: readonly ClubRankingRowDto[];
  readonly playerPosition: number | null;
};
```

**Zakaz w DTO Rankingu:** `points` · `won` · `drawn` · `lost` · `goals*` · `goalDifference` · `elo` · `rating` · `score` · `xp` · `reputation` · `prestige` · `level`.

### 4.4 Wejście resolvera

| Input                   | Źródło SSOT                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `table: LeagueTableDto` | **REUSE** `resolveLeagueTable` (wywołanie poza lub przez cienką fasadę page) |
| (opcjonalnie) `club.id` | do `playerPosition` / highlight — jeśli nie tylko z `isPlayer` w rows        |

Minimalny kontrakt funkcji:

```ts
function resolveClubRanking(input: { readonly table: LeagueTableDto }): ClubRankingDto;
```

### 4.5 Derive pasma (Information Thin · bez score)

Dla `LEAGUE_SIZE` / `rows.length` (Thin = 12):

| `band`  | Reguła (deterministyczna)                  | Copy (UI) — szkic  |
| ------- | ------------------------------------------ | ------------------ |
| `upper` | `position <= ceil(n/3)`                    | Górna część sezonu |
| `mid`   | pozostałe środkowe                         | Środek stawki      |
| `lower` | `position > n - floor(n/3)` (reszta dolna) | Dolna część sezonu |

Pasmo **wyraża** miejsce w porównaniu — **nie** jest Rating Score i **nie** trafia do §6.

### 4.6 Bieżący sezon (nie historia)

1. `seasonLabel` / `contextLabel` pochodzą wyłącznie z **bieżącego** `LeagueTableDto`.
2. Brak list poprzednich sezonów, snapshotów, persist pozycji.
3. Fair reset jakościowy (§18.11): nowy kontekst sezonu = nowy input tabeli; Thin nie trzyma „długu” pozycji w DB.

### 4.7 Relacja do Ligi / Achievements / Hub

| System       | Kontrakt PLAN                                                                |
| ------------ | ---------------------------------------------------------------------------- |
| `/league`    | **Osobny** surface (punkty · W/D/L · bramki) — **bez** zmian semantyki       |
| `/rankings`  | **Własny** surface (# · klub · pasmo; highlight gracza)                      |
| Achievements | Zero wspólnej logiki katalogu                                                |
| Daily Goal   | Zero zależności                                                              |
| Hub Primary  | Bez zmian; Ranking nie jest Primary                                          |
| Nav `league` | Nadal soft-lock do SEASON (istniejące) — Ranking **open EARLY_CLUB** (Owner) |

---

## 5. UI `/rankings` (Presentation ≠ Domain)

| Element     | Spec Thin                                                                                  |
| ----------- | ------------------------------------------------------------------------------------------ |
| Wejście     | `page.tsx`: club + fixtures (REUSE loaderów) → `resolveLeagueTable` → `resolveClubRanking` |
| Render      | Lista / tabela prezentacyjna: `#` · nazwa klubu · pasmo; highlight `isPlayer`              |
| Placeholder | **Zastąpić** — usunąć atrapy rating / EU-1 / „reputacja serwera”                           |
| Copy        | Tytuł/subtitle: sezonowy ranking klubów · kontekst ligi produktowej                        |
| Zakaz UI    | Kolumny punktów, bilansu, W/D/L, bramek, rating liczbowy                                   |
| Interakcja  | Read-only; brak CTA grind / claim                                                          |
| Guide       | Presentation Contract §16 · decision/secondary dialect — nie Primary Hub                   |

---

## 6. Nav / unlock

| Zmiana                        | Spec                                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------------------------ |
| `nav.ts`                      | Dodać item `rankings` → `/rankings` (grupa Rozgrywki, obok / pod Ligą — bez FOMO Primary)        |
| `unlock.ts` `EARLY_CLUB_OPEN` | Dodać `'rankings'` → open od EARLY_CLUB (i NEW_CLUB jak inne EARLY open, spójnie z achievements) |
| Testy Hub                     | Rozszerzyć `hub01.test.ts`: `resolveNavAccess('rankings', 'EARLY_CLUB') === 'open'`              |
| Primary / Secondary CTA       | **Bez** dodawania Rankingu jako Primary                                                          |

---

## 7. SSOT / REUSE / ZERO DUPLICATE

| Fakt                 | SSOT                   | Ranking                                     |
| -------------------- | ---------------------- | ------------------------------------------- |
| Punkty / W/D/L / G   | `resolveLeagueTable`   | **Nie** eksponuje; czyta kolejność z inputu |
| Członkostwo ligi     | `resolveLeagueMembers` | Pośrednio via table rows                    |
| Produkt §18          | GDD §18                | Resolver = implementacja Thin               |
| §6                   | GDD                    | Nie dotyka                                  |
| Achievements / Daily | D26 / D25              | Nie forkuje                                 |
| Placeholder mock     | —                      | Usunąć; nie-SSOT                            |

---

## 8. Pliki (szacunek IMPLEMENT — bez startu teraz)

| Obszar                  | Kandydat                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolver + typy + testy | `apps/web/src/lib/ranking/resolve-club-ranking.ts` · `ranking01.test.ts` · `index.ts`                                                         |
| Page                    | `apps/web/src/app/(game)/rankings/page.tsx`                                                                                                   |
| UI                      | `apps/web/src/components/ranking/*` (cienki widok listy)                                                                                      |
| Nav / unlock            | `apps/web/src/lib/nav.ts` · `apps/web/src/lib/hub/unlock.ts` · `hub01.test.ts`                                                                |
| Copy                    | `apps/web/src/lib/ui/copy.ts`                                                                                                                 |
| Docs CLOSE              | BASELINE · HANDOFF · STATUS · ROADMAP · MODULE_MAP · DECISIONS (**D27**) · ARCHITECTURAL_DECISIONS · CHANGELOG · CURRENT_DESIGN · PLAN status |

**Brak:** `supabase/migrations/*`.

---

## 9. Acceptance Criteria (IMPLEMENT)

- [ ] `resolveClubRanking` pure derive; zero I/O / mutacji / persist / migracji
- [ ] Input = `LeagueTableDto`; brak drugiej logiki punktacji
- [ ] DTO / UI Rankingu **bez** points · W/D/L · bramek · ELO · Rating Score · XP
- [ ] Surface `/rankings` ≠ `/league` (własny DTO + copy + kolumny)
- [ ] Lista zawiera **wszystkie** kluby z inputu tabeli; wynik deterministyczny
- [ ] Kontekst = bieżący sezon (etykiety z tabeli); brak historii
- [ ] `/rankings` nie jest PlaceholderPage z atrapami rating/EU-1
- [ ] Nav `rankings` open od EARLY_CLUB
- [ ] Brak zmian §6 · Achievements · Daily · semantyki `resolveLeagueTable`
- [ ] Testy unit + format · typecheck · lint · test · build PASS
- [ ] Po GO: COMMIT → PUSH → CI → PRODUCTION VERIFY → DOCS CLOSE path

---

## 10. Ryzyka (PLAN)

| ID  | Ryzyko                               | Odpowiedź PLAN                                            |
| --- | ------------------------------------ | --------------------------------------------------------- |
| R1  | Ranking wygląda jak kopia tabeli     | Zakaz kolumn sportowych · własne copy/pasmo · osobny DTO  |
| R2  | Ożywienie placeholder rating         | Zakaz kopiowania mocków · usunięcie atrap                 |
| R3  | Duplikat sortu/punktów               | REUSE wyłącznie `resolveLeagueTable` jako input           |
| R4  | Wprowadzenie ELO „przy okazji”       | Freeze Owner · zakaz w DTO/AC                             |
| R5  | Ukryte §6                            | Zakaz pól reputation/prestige/level                       |
| R6  | Liga soft-lock vs Ranking open EARLY | Świadome (Owner): Ranking dostępny wcześniej niż nav Ligi |

---

## 11. Poza zakresem (kolejne EPIC / Future)

| Temat                            | Gdzie           |
| -------------------------------- | --------------- |
| ELO / liczby rankingowe / §26    | Osobny Owner GO |
| All-time / historia              | Future §18.15   |
| Implementacja metryk §6 w kodzie | Osobny EPIC     |
| Ranking graczy · global / MP     | Future          |
| Anti-abuse techniczny            | Future          |

---

## 12. Kryteria wejścia w IMPLEMENT

1. Owner **GO IMPLEMENT** na ten PLAN.
2. Bez rozszerzania OUT.
3. Bez commit / push bez kolejnego Owner GO COMMIT.

---

## Last updated

2026-07-30 — CLOSED · feat `bf86749` · PRODUCTION VERIFY · DOCS CLOSE
