# LFE-DAILY-01 — PLAN (Daily Goal Thin · derive)

**EPIC:** LFE-DAILY-01  
**Typ:** Information Thin na Hubie (GDD §20) — resolver derive only  
**Data:** 2026-07-30  
**Wejście:** AUDIT COMPLETE · Owner **GO PLAN** · GDD-15 (§20) CLOSED · GDD §23 CLOSED  
**Status PLAN:** ACCEPTED · Owner GO IMPLEMENT  
**Status IMPLEMENT:** COMPLETE — oczekuje GO COMMIT / PUSH  
**Baseline wejścia:** Domain `93fd6d5` · Presentation `9fd14fc` · Docs `3c6f757`

---

## 0. Cel

Wdrożyć na Hubie **jeden sugerowany cel dnia** zgodnie z GDD §20:

- pytanie: **„Co warto dziś zrobić?”**,
- wyłącznie **resolver derive** (bez persist, bez Quest Engine),
- **sugeruje** następny sensowny krok z **istniejących** domen,
- **nie** konkuruje z Primary CTA,
- **nie** mutuje domeny, **nie** dodaje ekonomii / cronów / resetów dnia.

**Zasada nadrzędna (Owner freeze)**

> Daily Goal porządkuje wskazówkę dnia na Hubie; Primary CTA zawsze ma wyższy priorytet; decyzja i mutacje pozostają w istniejących domenach.

---

## 1. Zamrożone decyzje Ownera (nienaruszalne w PLAN)

| # | Decyzja |
| - | ------- |
| 1 | Daily Goal = **tylko resolver (derive)**, nie persist |
| 2 | **Zakaz** Quest Engine / nowego systemu zadań |
| 3 | **Zakaz** nowych mutacji domenowych |
| 4 | **Zakaz** nowych tabel persistence Thin v1 |
| 5 | **Primary CTA > Daily Goal** zawsze |
| 6 | Daily Goal **sugeruje** następny krok; REUSE istniejących domen |
| 7 | **Zakaz** cronów · schedulerów · resetów dnia · nowych mechanik ekonomii |
| 8 | SSOT FIRST · REUSE FIRST · ZERO DUPLICATE LOGIC · Resolver First · Information Thin |

---

## 2. Zakres Thin (IN)

| # | Element |
| - | ------- |
| 1 | Pure resolver `resolveClubDailyGoal(...)` → DTO Thin (sugerowany cel lub brak) |
| 2 | Derive wyłącznie z już dostępnych sygnałów Hub / fixtures / club / training unlock |
| 3 | Dokładnie **≤1** aktywna sugestia na Hubie (warstwa 2 §23 — presentation) |
| 4 | UI Hub: slot sugestii **pod** Primary (nie wygląda jak Primary; Guide §16) |
| 5 | Deep-link wyłącznie do **istniejących** tras (`/match/...`, `/squad`, `/training`, `/matches`) |
| 6 | Soft-lock aware: nie sugerować treningu, gdy `trainingUnlocked === false` |
| 7 | Matchday: sugestia **zsynchronizowana** z Primary (ten sam kierunek) — bez drugiego CTA hero |
| 8 | Testy pure resolver (priorytet mecz; idle; trening UTC; brak mutacji) |
| 9 | `UI_COPY` — krótkie etykiety sugestii (bez liczb nagród) |
| 10 | DOCS CLOSE po PRODUCTION VERIFY (HUB · MODULE_MAP · BASELINE · STATUS · ROADMAP · CHANGELOG · ewentualne D25) |

---

## 3. Zakres OUT (twarde)

- Quest Engine · Quest Log · multi-quest · board · streaki advanced · social  
- Tabele / kolumny persist (`daily_goals`, `quest_*`, `completed_on`, …)  
- Mutacje: cash · prestige · skill · potential · fixtures · training RPC · transfers · academy · scouting  
- Nagrody liczbowe · waluta zadań · XP · energia / LP / morale (mock)  
- Cron · scheduler · midnight reset · timezone gracza (osobny mechanizm)  
- Zmiana semantyki `resolvePrimaryCta` / limitu Secondary / unlock nav  
- Kod §19 / §21 / §22 (osiągnięcia · inbox · push)  
- Ożywianie `dashboardMock.dailyTasks`  
- Zmiana LFE / Visual DNA / World Art / Landing  

---

## 4. Architektura (Resolver First · Information Thin)

### 4.1 Rola warstw

| Warstwa | SSOT / owner | Rola Daily |
| ------- | ------------ | ---------- |
| Primary CTA | `resolvePrimaryCta` (§23) | **Nienaruszalna** oś decyzji |
| Daily Goal | `resolveClubDailyGoal` (§20) | Sugestia „warto”; **nie** Primary |
| Secondary | `resolveSecondaryCtas` (daily **loop** UI) | Nawigacja — **nie** mylić z §20 |
| Domeny | Match · Squad · Training · Fixtures | Jedyny sposób **wykonania** celu |

### 4.2 Kontrakt DTO (Thin)

Propozycja (nazwy do IMPLEMENT bez driftu znaczenia):

```ts
type DailyGoalKind = 'match' | 'squad' | 'training' | 'fixtures';

type ClubDailyGoalDto = {
  readonly kind: DailyGoalKind;
  readonly label: string;       // „Co warto dziś…” — 1 linia
  readonly href: string;        // istniejąca trasa
  readonly syncedWithPrimary: boolean; // true gdy ten sam kierunek co Primary
} | null; // null = brak sensownej sugestii (nie wymuszać pustego questu)
```

**Zakaz w DTO:** reward · xp · progress% · streak · dueAt · questId · score.

### 4.3 Wejście resolvera (REUSE — zero nowych zapytań domeny)

| Input | Źródło (już na Hub page) |
| ----- | ------------------------ |
| `phase` | `resolveHubPhase` |
| `session` | `resolveHubSession` |
| `primary` | `resolvePrimaryCta` (do flagi `syncedWithPrimary` + gwarancji priorytetu) |
| `nextFixture` | `getNextFixture` |
| `lastPlayedFixture` | `getLastPlayedFixture` |
| `trainingUnlocked` | `hasPlayedUnlock` + `TRAINING_THIN` |
| `lastTrainingOn` | `club.lastTrainingOn` |
| `todayUtc` | REUSE helper UTC z treningu (`utcDateString` / równoważny export) |

Resolver **pure**: bez I/O, bez side-effectów.

### 4.4 Reguły derive (priorytet — pierwsza trafiona wygrywa)

| Priorytet | Warunek | Sugestia | `syncedWithPrimary` |
| --------- | ------- | -------- | ------------------- |
| 1 | `session === 'matchday'` ∧ `nextFixture` | Kierunek meczu (href jak Primary `/match/{id}/tunnel`) | `true` |
| 2 | `session === 'post_match'` | Sensowny następny krok: jeśli jest `nextFixture` upcoming — ten mecz; else Kadra `/squad` | zgodnie z Primary |
| 3 | `trainingUnlocked` ∧ `lastTrainingOn !== todayUtc` | Trening `/training` | `false` (Primary pozostaje Kadra / inny) |
| 4 | `hasFixtures` / next w kalendarzu niedostępny jako matchday | Terminarz `/matches` **lub** Kadra — wybór stały w IMPLEMENT: preferuj **Kadra** `/squad` gdy brak silniejszego sygnału | zwykle `true` gdy Primary = view-squad |
| 5 | else | `null` lub Kadra (fallback spójny z Primary idle) | — |

**Gwarancja Owner:** UI **nigdy** nie elevuje Daily Goal do stylu/roli Primary. Nawet gdy `syncedWithPrimary === true`, slot sugestii jest **Informational Thin** (copy warstwy 2), a jedyny Primary button = wynik `resolvePrimaryCta`.

### 4.5 Relacja do Primary (kontrakt)

1. `resolvePrimaryCta` **bez zmian reguł** Thin v1 (matchday → mecz; else → Kadra).  
2. Daily Goal **nie** nadpisuje Primary.  
3. Gdy `syncedWithPrimary`, copy Daily Goal może brzmieć jak doprecyzowanie („Warto dziś: dokończ przygotowanie meczu”), bez drugiego dużego CTA.  
4. Gdy niesynchroniczne (np. idle + trening), Primary = Kadra; sugestia = Trening jako **lekki** link / linia — nie hero button.

---

## 5. UI Hub (Presentation ≠ Domain)

| Element | Spec Thin |
| ------- | --------- |
| Miejsce | W `EarlyClubHub`, w strefie Decision — **pod** Primary CTA (lub jedna linia meta przy Decision Banner); **nie** w Secondary strip (Secondary = daily loop nawigacji) |
| Wygląd | Typografia muted / label „Dziś warto” — **nie** klasa Primary; zgodność Guide §16 |
| Interakcja | Opcjonalny `Link` do `href` sugestii; pominięcie sugestii = zero kary |
| Unlock | Trening soft-lock: brak sugestii treningu |
| Mock | **Nie** podłączać `dashboardMock.dailyTasks` |

Szczegóły copy / CSS tokenów — w IMPLEMENT według Guide; bez nowego dialektu ekranu.

---

## 6. SSOT / REUSE / ZERO DUPLICATE

| Fakt | SSOT | Daily robi |
| ---- | ---- | ---------- |
| Co grać / Primary | `resolvePrimaryCta` | Czyta; nie forkuje |
| Sesja Hub | `resolveHubSession` | Czyta |
| Fixtures | `fixtures` + getNext/Last | Czyta |
| Slot treningu dnia | `clubs.last_training_on` + UTC training | Czyta (REUSE porównania dnia) |
| Produkt „zadanie dnia” | GDD §20 | Resolver = implementacja Thin |
| Nagrody / kasa | §14 / D18 / §26 | **Nie dotyka** |

Zakaz: druga funkcja „co jest Primary”; drugi „czy trenowano dziś” bez reuse UTC treningu.

---

## 7. Pliki (szacunek IMPLEMENT — bez startu teraz)

| Obszar | Kandydat |
| ------ | -------- |
| Resolver + typy + testy | `apps/web/src/lib/hub/resolve-club-daily-goal.ts` (+ test obok `hub01.test.ts`) |
| Export | `apps/web/src/lib/hub/index.ts` |
| Copy | `apps/web/src/lib/ui/copy.ts` |
| UI | `apps/web/src/components/hub/EarlyClubHub.tsx` (+ CSS hub-decision w razie potrzeby) |
| Page wire | `apps/web/src/app/(game)/hub/page.tsx` — przekazanie już liczonych sygnałów |
| Docs CLOSE | `HUB.md` · `MODULE_MAP` · baseline / status / roadmap / changelog · `ARCHITECTURAL_DECISIONS` (D25 skrót, jeśli Owner) |

**Brak:** `supabase/migrations/*` w tym EPIC.

---

## 8. Acceptance Criteria (IMPLEMENT)

- [ ] `resolveClubDailyGoal` jest pure derive; zero I/O / mutacji  
- [ ] Hub pokazuje ≤1 sugestię zgodną z regułami §4.4  
- [ ] Primary CTA niezmieniony semantycznie; wizualnie nadrzędny wobec Daily Goal  
- [ ] Matchday: sugestia zsynchronizowana z kierunkiem meczu; brak drugiego hero CTA  
- [ ] Idle + trening odblokowany + brak sesji UTC dziś → sugestia `/training`  
- [ ] Soft-lock treningu → brak sugestii treningu  
- [ ] Brak tabel / RPC / cron / nagród cash  
- [ ] `dashboardMock.dailyTasks` nie jest SSOT ani źródłem UI Hub  
- [ ] Testy unit: matchday sync · post_match · training UTC · primary precedence  
- [ ] format · typecheck · lint · test · build PASS  
- [ ] Po GO: COMMIT → PUSH → CI GREEN → PRODUCTION VERIFY → DOCS CLOSE path  

---

## 9. Ryzyka (PLAN)

| ID | Ryzyko | Odpowiedź PLAN |
| -- | ------ | -------------- |
| R1 | Mylenie z Secondary daily loop | Slot osobny od `resolveSecondaryCtas`; docs HUB rozróżniają |
| R2 | Elevacja sugestii do Primary | Freeze Owner + AC wizualny |
| R3 | Duplikat logiki UTC treningu | REUSE `utcDateString` (lub export shared) |
| R4 | Scope creep nagród | OUT twarde |
| R5 | Pusty idle bez sugestii | Dozwolone `null` lub fallback Kadra spójny z Primary — bez wymuszania questu |

---

## 10. Poza zakresem vs przyszłość

| Temat | Status |
| ----- | ------ |
| Persist / claim / completed_on | Future (osobny EPIC + GO) |
| Nagrody §26 | Future |
| Quest Log / streaki | Future (§20.14) |
| Inbox / push hook | Future (§21/§22 kod) |
| First Match §5.11 na Hubie | Poza Thin — tunnel przed Hubem |

---

## 11. Definition of Ready → IMPLEMENT

Owner akceptuje ten PLAN (**GO IMPLEMENT**), w szczególności:

1. Reguły derive §4.4 (priorytety 1–5)  
2. Primary bez zmian semantyki  
3. Zero migracji / zero ekonomii  
4. UI = sugestia Informational Thin pod Primary  

---

## 12. Następny krok

**STOP po PLAN.**  
Czekamy na: **GO IMPLEMENT** · **HOLD** · lub korektę Thin w tym dokumencie.

**Zakaz teraz:** IMPLEMENT · migracje · commit · push.
