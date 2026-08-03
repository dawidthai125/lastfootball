# LFE-RATINGS-V2 — PLAN (Player Match Data · assists / minutes · Ratings formula)

**EPIC:** LFE-RATINGS-V2 (ROADMAP: **Ratings v2**)  
**Typ:** Thin engine fill + Post Match derive / presentation  
**Data:** 2026-08-03  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN**  
**Status PLAN:** IMPLEMENT COMPLETE · czekaj na **Owner GO COMMIT**  
**Baseline wejścia:** tip `5ffc9d1` · Domain `ce00327` · Docs tip `7485366` · D1–D121  
**SSOT wejścia:** AUDIT Ratings v2 (sesja) · [`../ROADMAP.md`](../ROADMAP.md) · Handoff §11 · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) · [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

---

## 0. Cel

Wzbogacić **Player Match Data** i **Post Match Ratings** o:

1. deterministyczne **`assists`**,
2. Thin **`minutesPlayed`**,
3. formułę ocen v2 (REUSE `computePlayerRatings`) + prezentację Thin.

**Bez** nowego silnika · **bez** Physics · **bez** zmian PUBLIC root / allowlist · **bez** migracji.

**Zasada nadrzędna**

> Wypełniamy istniejące pola `PlayerStatistics`; Web czyta je pure derive. Presentation ≠ Domain. D119–D121 nienaruszone.

---

## 1. Potwierdzenia kontraktowe (Owner LOCK)

| #   | Potwierdzenie                                                                  | Stan       |
| --- | ------------------------------------------------------------------------------ | ---------- |
| 1   | **Brak** zmian LFE PUBLIC API surface (root barrel / Freeze §3 exports)        | **LOCKED** |
| 2   | **Brak** nowych PUBLIC exportów / allowlist entries                            | **LOCKED** |
| 3   | **Brak** migracji Supabase / schematu DB                                       | **LOCKED** |
| 4   | **D119–D121** pozostają bez zmian (brak nowej decyzji D\* w tym EPICu)         | **LOCKED** |
| 5   | App nadal importuje wyłącznie `@lastfootball/lfe` — **nie** `/testing`         | **LOCKED** |
| 6   | Single Settlement Path / Season Confirm / soft-lock Sponsors·Board·Stadium OUT | **LOCKED** |

`PlayerStatistics.assists` i `minutesPlayed` **już istnieją** w typie PUBLIC (`Freeze` §3.4) — Thin = **fill + consume**, nie nowy kontrakt typów.

---

## 2. Zakres IN

| #   | Element                                                                                           |
| --- | ------------------------------------------------------------------------------------------------- |
| 1   | LFE internal: bump `assists` przy `GOAL` (kontrakt §4)                                            |
| 2   | LFE internal: bump `minutesPlayed` dla czasu na boisku (kontrakt §5)                              |
| 3   | Opcjonalnie Thin: `assistPlayerId` w payload `GOAL` (to samo wydarzenie; **nie** nowy export)     |
| 4   | Web: `computePlayerRatings` formuła v2 — uwzględnia `assists` (+ MVP tie-break z minutes)         |
| 5   | Web: `PlayerRatingView` + `assists` / `minutesPlayed`                                             |
| 6   | Web: `PostMatchView` — prezentacja Thin (Guide §16): widoczne asysty / minuty przy ocenie         |
| 7   | Testy LFE (`player-match-data01`) + Web (`player-ratings01` · `post-match01`)                     |
| 8   | Docs CLOSE po PRODUCTION VERIFY (stack match + ROADMAP / STATUS / BASELINE / HANDOFF / CHANGELOG) |

---

## 3. Zakres OUT (twarde)

- Physics · full Rules · ECS · `@lastfootball/lfe/advanced`
- Nowe PUBLIC exporty · zmiana `public-allowlist.ts` · zmiana root `index.ts` (poza ewentualnym **zerowym** diffem)
- Nowe pola w `PlayerStatistics` (passes/tackles/cards **nie** bumpowane w tym EPICu)
- xG / xA · pass network · rating persistence DB · Achievement/XP z ocen
- Zmiana Canvas / Replay Buffer API / Live Bridge kontraktu
- Zmiana match AI decision ladder / goalChance / possession model
- Transfer settle · Season Confirm · soft-lock · Sponsors / Board / Stadium
- Import `@lastfootball/lfe/testing` w `apps/web`
- Migracje · SemVer bump `0.9.1-match-ai01` (nie wymagany)
- Visual DNA / World Art / tokeny kolorów poza copy/layout Post Match Thin

---

## 4. Kontrakt deterministycznej asysty

### 4.1 Kiedy

Dokładnie gdy silnik emituje **`GOAL`** i istnieje atrybuowany **`playerId` scorera** (jak dziś w `resolve.ts`).

### 4.2 Ile

| Reguła                           | Wartość                                   |
| -------------------------------- | ----------------------------------------- |
| Asyst na 1 gol                   | **0 lub 1** (nigdy >1)                    |
| Ten sam zawodnik = scorer+asysta | **Zakaz**                                 |
| Brak kandydata (np. XI &lt; 2)   | `assists` **bez** bumpa (gol nadal ważny) |
| RNG                              | **Zakaz** — zero `rng.next()` w atrybucji |

### 4.3 Kto (determinizm)

REUSE wzorca `attributePlayerForEvent`:

1. Strona = strona gola (`side`).
2. Pula = `lineup.slots` tej strony **bez** scorera.
3. Preferencja ról ofensywnych (ta sama lista co GOAL/SHOT w `attribute-player.ts`); jeśli pusta po filtrze → cała pula bez scorera.
4. Indeks: `(tick + stableHash('ASSIST')) % candidates.length` (lub równoważny pure helper obok istniejącego — **internal**, nie PUBLIC).
5. Wynik → `assistPlayerId`; `bumpPlayerStat(..., { assists: row.assists + 1 })`.

### 4.4 Payload event (Thin opcjonalny)

| Pole             | Status                                                 |
| ---------------- | ------------------------------------------------------ |
| `playerId`       | bez zmian (scorer)                                     |
| `assistPlayerId` | **opcjonalne** w payload `GOAL` (internal event shape) |

Ratings **nie** zależą od payload — SSOT liczników = `statistics.players`.

### 4.5 Poza asystą

Brak asyst z SHOT / ATTACK / CORNER. Brak „secondary assist”.

---

## 5. Kontrakt `minutesPlayed`

### 5.1 Semantyka

| Pole             | Znaczenie Thin                                |
| ---------------- | --------------------------------------------- |
| Jednostka        | **integer** ≥ 0 (`Math.floor` minut display)  |
| Źródło czasu     | `MatchClock.displayMinute`                    |
| Kto dostaje      | tylko zawodnicy **w aktualnym XI** (on-pitch) |
| Ławka nigdy IN   | pozostaje `0`                                 |
| Po zejściu (SUB) | licznik **zamrożony** (bez dalszego bumpa)    |

### 5.2 Punkty aktualizacji (event-driven · internal)

| Moment                                                  | Akcja                                                                                                                            |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `SUBSTITUTION`                                          | **Out:** dopisz minuty do `floor(displayMinute)` od ostatniego creditu / wejścia. **In:** zacznij naliczanie od bieżącej minuty. |
| `HALF_END` / `MATCH_END` (lub równoważny FINISHED path) | Dopisz minuty wszystkim **aktualnym** XI do `floor(displayMinute)`.                                                              |
| Tick-by-tick ciągły                                     | **OUT** (nie wymagane w Thin)                                                                                                    |

Implementacja może trzymać **internal** mapę `onPitchSinceFloor: PlayerId → number` w resolve/tick **albo** wyliczać z `substitutions[]` + końcowego XI przy end — wybór techniczny w IMPLEMENT, byle AC §5.1 i testy.

### 5.3 Granice Thin

- Brak osobnego stoppage accounting poza tym, co już jest w `displayMinute`.
- Brak minut „urojonych” dla rezerwowych bez wejścia.
- Brak wpływu minut na fee / development / training (poza Post Match UI / rating derive).

---

## 6. Zmiany LFE (internal only)

| Plik / obszar (kandydat)                         | Zmiana                                                         |
| ------------------------------------------------ | -------------------------------------------------------------- |
| `match/engine/resolve.ts`                        | Po bumpie `goals`: atrybucja asysty + bump `assists`           |
| `match/engine/attribute-player.ts` (lub sibling) | Pure helper asysty (REUSE hash/roles) — **nie** eksport PUBLIC |
| `match/engine/tick.ts` / resolve SUB path        | Credit `minutesPlayed` wg §5                                   |
| `match/domain/statistics.ts`                     | **Bez** zmiany shape (już ma pola); REUSE `bumpPlayerStat`     |
| `player-match-data01.test.ts`                    | Zastąp T10-zero dla IN fields; dodaj AC asyst / minut / SUB    |

**Zakaz LFE:** zmiana `src/index.ts` exports · `public-allowlist.ts` · `testing.ts` · AI decision core · Physics stubs.

---

## 7. Zmiany Web (derive + presentation)

### 7.1 Derive — `player-ratings.ts`

| Element          | Kontrakt v2                                                                                      |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| Wejście          | `MatchState.statistics.players` — REUSE (goals/shots/fouls **+** assists; minutes do view / MVP) |
| Formuła          | v1 + `ASSIST_DELTA` (propozycja **0.5**) · `ASSIST_CAP` (propozycja **3**)                       |
| Minuty w formule | **nie** jako duży delta ratingu Thin; użyte w **MVP tie-break** + UI                             |
| Skala / clamp    | bez zmian `1.0–10.0` · `clampRating` / `round1`                                                  |
| XI only          | bez zmian (lineup.slots obu stron)                                                               |
| Mutacje          | **zakaz** Engine / MatchState                                                                    |

MVP sort (rozszerzenie deterministyczne):

`rating ↓ · goals ↓ · assists ↓ · minutesPlayed ↓ · shots ↓ · fouls ↑ · home · slotIndex · playerId`

### 7.2 DTO — `PlayerRatingView`

Dodać:

```ts
readonly assists: number;
readonly minutesPlayed: number;
```

`PostMatchSummary` — bez nowego top-level SSOT; nadal `ratings` + `mvpPlayerId`.

### 7.3 Presentation — `PostMatchView`

- Przy wierszu oceny: Thin meta (np. `G · A · Min`) — **Information Thin**, nie nowy dashboard.
- Guide §16 · istniejące tokeny / typografia Post Match.
- Bez kart SaaS · bez nowych mocków.

### 7.4 Pliki (szacunek)

| Plik                                                         | Rola               |
| ------------------------------------------------------------ | ------------------ |
| `apps/web/src/components/match/post-match/player-ratings.ts` | formula + view     |
| `.../player-ratings01.test.ts`                               | AC derive          |
| `.../build-post-match-summary.ts`                            | tylko jeśli wiring |
| `.../PostMatchView.tsx`                                      | prezentacja        |
| `.../post-match01.test.ts`                                   | summary embeds v2  |

---

## 8. Strategia testów

### 8.1 LFE (`player-match-data01.test.ts` + ewentualnie unit helpera)

| ID  | AC                                                                                            |
| --- | --------------------------------------------------------------------------------------------- |
| L1  | Po `GOAL` z scorerem: scorera `goals+1`; asysta `+1` u innego XI **lub** 0 gdy brak kandydata |
| L2  | Asysta ≠ scorer; max 1 bump asysty / gol                                                      |
| L3  | Determinizm: ten sam seed/session → te same `assists`                                         |
| L4  | Po grze: `minutesPlayed > 0` dla starterów XI; ławka bez wejścia = 0                          |
| L5  | Po SUB: out ma zamrożone minuty; in może rosnąć po dalszej grze                               |
| L6  | OUT fields (passes/tackles/cards) nadal 0 (dawne T10 zawężone)                                |
| L7  | Brak regresji goals/shots/fouls attribution                                                   |

### 8.2 Web (`player-ratings01` · `post-match01`)

| ID  | AC                                                             |
| --- | -------------------------------------------------------------- |
| W1  | Asysty wpływają na rating w zadanym delcie / cap               |
| W2  | `PlayerRatingView` niesie `assists` + `minutesPlayed`          |
| W3  | MVP tie-break uwzględnia assists / minutes (deterministycznie) |
| W4  | Brak stats row → counters 0, brak crash (jak v1)               |
| W5  | Summary embeds ratings v2 + `mvpPlayerId`                      |
| W6  | Identyczny `MatchState` 2× → identyczne ratings/MVP            |

### 8.3 Regresja pakietowa

- Istniejące testy LFE engine / session / PUBLIC allowlist **GREEN** (allowlist **bez** diff).
- Web match post-match suite GREEN.

---

## 9. Ryzyka i mitygacje

| ID  | Ryzyko                                       | Mitygacja                                                                      |
| --- | -------------------------------------------- | ------------------------------------------------------------------------------ |
| R1  | Asysta „sztuczna” bez podań                  | Jawny Thin kontrakt §4 · bez RNG · docs OUT Physics                            |
| R2  | Minutes drift przy SUB                       | Event-driven credit §5 · test L5                                               |
| R3  | Zmiana MVP vs Ratings v1                     | Golden tests W3 · tie-break udokumentowany                                     |
| R4  | Scope creep passes/tackles                   | OUT checklist §3 · T10 zawężone                                                |
| R5  | Przypadkowy PUBLIC export                    | Diff gate: `index.ts` / allowlist = empty                                      |
| R6  | Payload `assistPlayerId` mylony z PUBLIC API | To shape eventu już PUBLIC typu `EngineEvent`; **bez** nowych symboli eksportu |

---

## 10. Checklist VERIFY (po IMPLEMENT · przed COMMIT)

- [ ] AC §4 asysty spełnione (L1–L3)
- [ ] AC §5 minutes spełnione (L4–L5)
- [ ] Formuła / DTO / UI Thin (W1–W6)
- [ ] `git diff` — **brak** zmian `public-allowlist.ts` / nowych root exportów
- [ ] `git diff` — **brak** `supabase/migrations/**`
- [ ] format · typecheck · lint · test · build PASS (lokalnie)
- [ ] Brak importu `@lastfootball/lfe/testing` w `apps/web`
- [ ] Canvas / Replay / Live Bridge — bez zbędnego diffu API
- [ ] Soft-lock / transfers / season — nietknięte

---

## 11. Checklist DOCS CLOSE (po PRODUCTION VERIFY · Owner GO docs)

- [ ] [`docs/lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) — Player Match Data: assists/minutes **IN** Thin
- [ ] [`docs/web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md) — Ratings v2 (assists/minutes)
- [ ] [`docs/lfe/CURRENT_STATUS.md`](../lfe/CURRENT_STATUS.md) — Ratings v2 DONE / next
- [ ] [`docs/ROADMAP.md`](../ROADMAP.md) — Ratings v2 → DONE; odśwież NEXT
- [ ] [`docs/PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`docs/AI/CURRENT_BASELINE.md`](../AI/CURRENT_BASELINE.md) — tip / domain feat
- [ ] [`docs/AI/PROJECT_HANDOFF.md`](../AI/PROJECT_HANDOFF.md) §1 / §11 — sync
- [ ] [`docs/CHANGELOG.md`](../CHANGELOG.md) · root `CHANGELOG.md` — wpis EPIC
- [ ] [`docs/lfe/PUBLIC_API.md`](../lfe/PUBLIC_API.md) — tylko status NEXT (bez claimu nowego surface)
- [ ] **Potwierdź ponownie:** D119–D121 bez zmian · brak nowej D\* o ile Owner nie zdecyduje inaczej
- [ ] FINAL DOCS VERIFY · EPIC FULLY CLOSED

---

## 12. Milestones IMPLEMENT (po GO)

| M   | Opis                                            |
| --- | ----------------------------------------------- |
| M1  | LFE asysty + testy L1–L3 · L6–L7                |
| M2  | LFE minutesPlayed + testy L4–L5                 |
| M3  | Web formula/DTO/tests W1–W6                     |
| M4  | Post Match presentation Thin                    |
| M5  | VALIDATION lokalne (format…build)               |
| M6  | Owner GO COMMIT → PUSH → CI → PRODUCTION VERIFY |
| M7  | DOCS CLOSE (§11)                                |

---

## 13. Definition of Done

- IN §2 zamknięte · OUT §3 nienaruszone
- Potwierdzenia §1 prawdziwe po diffie
- CI GREEN · PRODUCTION VERIFY PASS
- DOCS CLOSE · **EPIC FULLY CLOSED**

---

## Last updated

2026-08-03 — LFE-RATINGS-V2 IMPLEMENT COMPLETE · VERIFY PASS · czekaj na **GO COMMIT**
