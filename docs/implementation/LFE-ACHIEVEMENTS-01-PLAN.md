# LFE-ACHIEVEMENTS-01 — PLAN (Achievements Information Thin · derive)

**EPIC:** LFE-ACHIEVEMENTS-01  
**Typ:** Information Thin (GDD §19) — pure resolver · derive only  
**Data:** 2026-07-30  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · GDD-19 CLOSED · D19–D25  
**Status PLAN:** ACCEPTED · Owner GO IMPLEMENT  
**Status IMPLEMENT:** COMPLETE — oczekuje GO COMMIT / PUSH  
**Baseline wejścia:** Domain `73e1361` · Presentation `9fd14fc` · Docs `ca4182e` · tip `637a625`

---

## 0. Cel

Wdrożyć opcjonalną warstwę **historii kamieni milowych** zgodnie z GDD §19:

- pytanie: **„Jakie kamienie zapisała moja kariera / mój klub?”**,
- wyłącznie **pure resolver derive** (bez persist),
- **wyraża** historię z **istniejących** faktów domeny,
- **nie** jest osią gry, rankingiem, Daily Goal ani metrykami §6,
- **nie** mutuje domeny, **nie** dodaje XP / score / ekonomii.

**Zasada nadrzędna (Owner freeze)**

> Achievements = Information Thin: porządkują i wyrażają historię z faktów domeny; historia jest immutable; nie oceniają, nie nagradzają ekonomicznie i nie decydują za gracza.

---

## 1. Zamrożone decyzje Ownera (nienaruszalne w PLAN)

| #   | Decyzja                                                          |
| --- | ---------------------------------------------------------------- |
| 1   | Achievements = **Information Thin**                              |
| 2   | **Pure resolver** · **derive only**                              |
| 3   | **Zakaz** persistence · nowych tabel · migracji                  |
| 4   | **Zakaz** Quest Engine · XP · Achievement Score                  |
| 5   | **Zakaz** nagród ekonomicznych                                   |
| 6   | **Zakaz** zmian metryk §6                                        |
| 7   | **Zakaz** zmian systemu Ranking (§18 / `/rankings`)              |
| 8   | **Daily Goal pozostaje niezależny** (D25 bez zmian semantyki)    |
| 9   | Historia osiągnięć jest **immutable**                            |
| 10  | Wyłącznie **istniejące fakty domenowe**                          |
| 11  | SSOT FIRST · REUSE FIRST · ZERO DUPLICATE LOGIC · Resolver First |

---

## 2. Zakres Thin (IN)

| #   | Element                                                                                                                           |
| --- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Pure resolver `resolveClubAchievements(...)` → DTO Thin (lista kamieni; może być pusta)                                           |
| 2   | Derive wyłącznie z faktów już w domenie (club · fixtures) — zero I/O w resolverze                                                 |
| 3   | Kamienie = obecność faktu domenowego (boolean / timestamp), **nie** progi grind XP                                                |
| 4   | Kolejność historii **stabilna** i chronologiczna (immutable view)                                                                 |
| 5   | UI `/achievements`: zastąpienie `PlaceholderPage` widokiem historii przez resolver                                                |
| 6   | Nav: **reuse** istniejącego unlock (`achievements` open EARLY_CLUB+) — bez nowych reguł FOMO                                      |
| 7   | Copy w `UI_COPY` — etykiety historii (bez nagród liczbowych)                                                                      |
| 8   | Testy pure: determinizm · immutability faktów · brak pól reward/xp/score · niezależność od Daily Goal                             |
| 9   | Guide §16 presentation only — bez zmiany DTO unlock innych domen                                                                  |
| 10  | DOCS CLOSE po PRODUCTION VERIFY (BASELINE · HANDOFF · STATUS · ROADMAP · MODULE_MAP · DECISIONS D26 · CHANGELOG · CURRENT_DESIGN) |

---

## 3. Zakres OUT (twarde)

- Tabele / kolumny `achievements` · `unlocked_at` persist · claim
- Migracje Supabase
- Quest Engine · katalog content ID · XP · progress bary · Achievement Score
- Nagrody cash / mutacje `cash_balance` / §6 Poziom·Reputacja·Prestiż
- Zmiany `/rankings` · ELO · scalenie z §18
- Zmiany `resolveClubDailyGoal` / semantyki D25
- Inbox / push (§21/§22) jako zależność
- Ukryte discovery fog · muzeum trofeów · kosmetyka stadionu
- Mutacje skill · potential · transfers · training RPC · academy · scouting · LFE
- Ożywianie atrap z `/rankings` (fikcyjne ratingi) jako wzorca

---

## 4. Architektura (Resolver First · Information Thin)

### 4.1 Rola warstw

| Warstwa       | SSOT / owner                    | Rola Achievements                              |
| ------------- | ------------------------------- | ---------------------------------------------- |
| Metryki klubu | §6                              | **Nietknięte**                                 |
| Ranking       | §18 / Future kod                | **Nietknięty**                                 |
| Daily Goal    | `resolveClubDailyGoal` (D25)    | **Niezależny** — zero wspólnej logiki katalogu |
| Hub Primary   | `resolvePrimaryCta`             | **Nienaruszony**                               |
| Achievements  | `resolveClubAchievements` (§19) | Wyrażenie historii (Information Thin)          |
| Fakty domeny  | `clubs` · `fixtures`            | Jedyny „silnik” odblokowań (derive)            |

### 4.2 Immutable history (derive)

1. Kamień pojawia się **wyłącznie**, gdy odpowiadający fakt domenowy już istnieje.
2. Gdy fakt jest trwały (np. `first_match_completed_at` ustawione raz), kamień **nie znika** przy kolejnych wywołaniach — widok historii jest **immutable**.
3. Brak „claim”, „revoke”, „reset sezonu achievementów”, cronów.
4. Resolver **nie** zapisuje stanu — tylko czyta input.

### 4.3 Kontrakt DTO (Thin)

```ts
type AchievementCategory = 'sport' | 'club' | 'career' | 'season';

type AchievementMilestoneDto = {
  readonly id: string; // stabilny klucz derive (nie content DB)
  readonly category: AchievementCategory;
  readonly title: string;
  readonly detail: string;
  readonly occurredAt: string | null; // timestamp z faktu domeny, gdy dostępny
};

type ClubAchievementsDto = {
  readonly milestones: readonly AchievementMilestoneDto[];
};
```

**Zakaz w DTO:** `xp` · `score` · `reward` · `progress` · `percent` · `rank` · `cash`.

`id` = stabilny identyfikator reguły derive (np. `first_match`) — **nie** katalog contentu GDD i **nie** wiersz DB.

### 4.4 Wejście resolvera (REUSE — fakty domenowe)

| Input                             | Źródło SSOT                                                       |
| --------------------------------- | ----------------------------------------------------------------- |
| `club.createdAt`                  | `ClubDto`                                                         |
| `club.firstMatchCompletedAt`      | `ClubDto`                                                         |
| `club.lastTrainingOn`             | `ClubDto` (fakt „kiedyś trenowano”, nie slot dnia)                |
| `fixtures` (lista już załadowana) | `fixtures` / page                                                 |
| `playedCount`                     | REUSE `countPlayedInList(fixtures)` — **nie** duplikować liczenia |

Resolver **pure**: bez I/O, bez Date.now (timestamps tylko z inputu).

### 4.5 Kamienie Thin v1 (derive — pierwsza obecność faktu)

| #   | `id`                 | Kategoria | Warunek (fakt domenowy)                | `occurredAt`                                                |
| --- | -------------------- | --------- | -------------------------------------- | ----------------------------------------------------------- |
| 1   | `club_founded`       | `club`    | klub istnieje (`createdAt`)            | `createdAt`                                                 |
| 2   | `first_match`        | `career`  | `firstMatchCompletedAt != null`        | `firstMatchCompletedAt`                                     |
| 3   | `first_league_match` | `sport`   | istnieje fixture `status === 'played'` | `playedAt` najwcześniejszego played (lub `null` jeśli brak) |
| 4   | `first_training`     | `career`  | `lastTrainingOn != null`               | `lastTrainingOn` (data UTC dnia — bez dopisywania czasu)    |

**Zasady**

1. Brak progów typu „10 meczów = XP”.
2. Brak kamieni z transferów / akademii / skautingu w Thin v1 (unika nowych zapytań i scope creep).
3. Kolejność listy: sort po `occurredAt` rosnąco; brak timestampu → po stabilnym porządku `id` na końcu tej grupy.
4. Lista może być krótka (1–4) — OK; pusta tylko gdy brak klubu (strona i tak wymaga klubu).

### 4.6 Relacja do Daily Goal / Hub / Ranking

| System              | Kontrakt PLAN                                                          |
| ------------------- | ---------------------------------------------------------------------- |
| Daily Goal          | **Zero** importów / wspólnych reguł katalogu; osobne pliki / resolvery |
| Hub Primary         | Bez zmian                                                              |
| Hub Daily Goal slot | Bez zmian                                                              |
| `/rankings`         | **Nie dotykać**                                                        |
| Nav achievements    | Reuse `resolveNavAccess` — bez nowej semantyki                         |

---

## 5. UI `/achievements` (Presentation ≠ Domain)

| Element     | Spec Thin                                                                                                 |
| ----------- | --------------------------------------------------------------------------------------------------------- |
| Wejście     | `apps/web/src/app/(game)/achievements/page.tsx` ładuje club + fixtures (REUSE istniejących loaderów)      |
| Render      | Lista historii kamieni z DTO — decision/history dialect (Guide §16); **nie** Primary Hub                  |
| Placeholder | **Zastąpić** `PlaceholderPage` — nie traktować go jako SSOT                                               |
| Puste stany | Krótki copy „Historia zbuduje się wraz z karierą” gdy tylko `club_founded` / mało kamieni — bez FOMO kary |
| Interakcja  | Read-only historia; brak claim / reward CTA                                                               |
| Zakaz       | Tabele ratingów, XP, progress bary, badge score                                                           |

---

## 6. SSOT / REUSE / ZERO DUPLICATE

| Fakt                 | SSOT                       | Achievements                                |
| -------------------- | -------------------------- | ------------------------------------------- |
| First Match          | `first_match_completed_at` | Czyta                                       |
| Mecze ligowe         | `fixtures.status`          | Czyta via `countPlayedInList` / scan played |
| Trening (fakt sesji) | `last_training_on`         | Czyta (obecność)                            |
| Produkt §19          | GDD §19                    | Resolver = implementacja Thin               |
| Daily                | D25                        | Nie forkuje / nie kataloguje                |
| §6 / Ranking         | GDD                        | Nie dotyka                                  |

---

## 7. Pliki (szacunek IMPLEMENT — bez startu teraz)

| Obszar                  | Kandydat                                                                                                                                      |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Resolver + typy + testy | `apps/web/src/lib/achievements/resolve-club-achievements.ts` · `achievements01.test.ts` · `index.ts`                                          |
| Page                    | `apps/web/src/app/(game)/achievements/page.tsx`                                                                                               |
| UI komponent            | `apps/web/src/components/achievements/*` (cienki widok listy)                                                                                 |
| Copy                    | `apps/web/src/lib/ui/copy.ts`                                                                                                                 |
| Docs CLOSE              | BASELINE · HANDOFF · STATUS · ROADMAP · MODULE_MAP · DECISIONS (**D26**) · ARCHITECTURAL_DECISIONS · CHANGELOG · CURRENT_DESIGN · PLAN status |

**Brak:** `supabase/migrations/*`.

---

## 8. Acceptance Criteria (IMPLEMENT)

- [ ] `resolveClubAchievements` pure derive; zero I/O / mutacji / persist
- [ ] DTO bez `xp` / `score` / `reward` / cash
- [ ] Kamienie tylko z faktów §4.5; historia immutable względem trwałych faktów
- [ ] `/achievements` nie jest `PlaceholderPage` atrapą SSOT
- [ ] Brak zmian Daily Goal · Ranking · §6 · ekonomii · LFE
- [ ] Nav bez nowych reguł unlock
- [ ] Testy unit + format · typecheck · lint · test · build PASS
- [ ] Po GO: COMMIT → PUSH → CI → PRODUCTION VERIFY → DOCS CLOSE path

---

## 9. Ryzyka (PLAN)

| ID  | Ryzyko                                              | Odpowiedź PLAN                  |
| --- | --------------------------------------------------- | ------------------------------- |
| R1  | Scope creep katalogu ID / XP                        | Freeze §4.5 · OUT twarde        |
| R2  | Traktowanie placeholder / rankings mock jako wzorca | Zakaz kopiowania ratingów       |
| R3  | Duplikat liczenia played                            | REUSE `countPlayedInList`       |
| R4  | Pomieszanie z Daily Goal                            | Osobny moduł · AC niezależności |
| R5  | „Progi” ukryte w regułach                           | Tylko obecność faktu, nie N≥10  |

---

## 10. Poza zakresem vs Future

| Temat                               | Status                  |
| ----------------------------------- | ----------------------- |
| Persist unlock / claim              | Future                  |
| Katalog content ID · XP · score     | Future (osobny GO)      |
| Hook transfer / akademia / skauting | Future                  |
| §21 / §22 celebracja                | Future                  |
| Ranking kod                         | LFE-RANKING-01 (osobny) |
| Nagrody §26                         | Future                  |

---

## 11. Definition of Ready → IMPLEMENT

Owner akceptuje ten PLAN (**GO IMPLEMENT**), w szczególności:

1. Kamienie Thin v1 (§4.5) — wyłącznie te cztery derive
2. Zero migracji / XP / score / ekonomii
3. Daily Goal i Ranking nietknięte
4. Immutable history = derive z trwałych faktów domeny

---

## 12. Następny krok

**STOP po PLAN.**  
Czekamy na: **GO IMPLEMENT** · **HOLD** · lub korektę Thin w tym dokumencie.

**Zakaz teraz:** IMPLEMENT · migracje · commit · push.
