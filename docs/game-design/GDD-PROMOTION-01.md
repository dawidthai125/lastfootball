# GDD-PROMOTION-01 — Promotion Thin (kontrakt produktowy)

**Produkt:** Last Football  
**EPIC:** GDD-PROMOTION-01 / LFE-PROMOTION-01  
**Status:** CLOSED — kontrakt Thin · D88–D94  
**SSOT Thin:** ten plik  
**Pointer w GDD:** [`GAME_DESIGN_DOCUMENT.md`](./GAME_DESIGN_DOCUMENT.md) §10.9 · §10.10 · **§10.21**  
**Lifecycle bazowy:** [`GDD-SEASON-END-01.md`](./GDD-SEASON-END-01.md) · H-PROMOTION

> **Cel:** Domknąć awans/spadek szczebla ligowego jako fakt domenowy klubu — bez piramidy AI, bez baraży, bez Fake Production.  
> Ten dokument **nie** zastępuje Season End Thin; rozszerza pipeline o outcome + mutację tier przy Confirm N+1.

---

## 1. Status i checklista

|                          |                                                  |
| ------------------------ | ------------------------------------------------ |
| Typ                      | Kontrakt GDD Thin                                |
| Kalendarz                | 22 kolejki (D28) — bez zmian                     |
| Season End lifecycle     | CLOSED (`GDD-SEASON-END-01` · LFE-SEASON-END-01) |
| Multi-tier AI / strength | **OUT** Thin (D92)                               |
| Baraże                   | **OUT** Thin (D94)                               |

**Checklisty**

- [x] IN / OUT
- [x] Invariants (D88–D94)
- [x] Pipeline integration
- [x] Floor / ceiling
- [x] Acceptance Criteria

---

## 2. Decyzje Ownera (sedno)

| ID      | Nazwa                               | Sedno (1 linia)                                                                |
| ------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| **D88** | League Tier Is Club SSOT            | Szczebel = fakt klubu (`league_tier`); UI tylko przez resolve z `ClubDto`.     |
| **D89** | Promotion Outcome Is Derived        | Outcome = pure derive z tabeli + tier; zero RNG.                               |
| **D90** | Single Tier Mutation Point          | Jedyna mutacja tier = ścieżka Confirm N+1.                                     |
| **D91** | Report Shows Outcome Before Persist | Raport OFFSEASON pokazuje outcome; tier w DB zmienia się dopiero przy Confirm. |
| **D92** | Thin Same Opponent World            | Thin zmienia wyłącznie szczebel + etykiety; skład ligi i siła AI bez zmian.    |
| **D93** | Floor And Ceiling                   | IV: brak spadku; I: brak awansu (mistrz/wicemistrz = etykieta).                |
| **D94** | No Playoffs In Thin                 | Baraże OUT.                                                                    |

Pełny rejestr: [`../DECISIONS.md`](../DECISIONS.md).

---

## 3. Filozofia Thin

1. Awans/spadek to **konsekwencja pozycji** w tabeli sezonu zamkniętego — nie mini-gra i nie RNG.
2. Thin dostarcza **szczebel jako tożsamość kontekstu** (IV→I) i etykiety UI.
3. Skład ligi (katalog AI) i trudność botów **nie** zmieniają się w Thin (D92) — jawny limit vs pełny GDD §10.
4. Raport uznaje wynik **przed** zapisem tier (D71 · D91).
5. Soft-lock Sponsors / Board / Stadium **nietykalny**.

---

## 4. IN / OUT

### 4.1 IN

- Persist `clubs.league_tier` (`iv` \| `iii` \| `ii` \| `i`, default `iv`).
- Pure `resolveLeagueTierLabel(tier)` — **jedyna** etykieta ligi w runtime.
- Pure `resolvePromotionOutcome(table, tier)` → promote / stay / relegate (+ warianty etykiet ceiling/floor).
- Pure `applyLeagueTierOutcome(tier, outcome)` → next tier.
- Reguły: awans miejsca **1–2** (gdy nie Liga I); spadek **11–12** (gdy nie Liga IV); mid = stay.
- Raport sezonu: outcome Information Thin (bez mutacji).
- Mutacja tier **tylko** w `confirmStartNextSeason` (D90).
- REUSE: `resolveLeagueTable`, `planClubFixtures` (D80).

### 4.2 OUT

- Osobne katalogi AI / strength per szczebel (D92).
- Rotacja AI / uzupełnianie piramidy po awansach innych klubów.
- Baraże / playoff (D94).
- Standings DB · drugi planner terminarza.
- Soft-lock Sponsors / Board / Stadium · domena Sponsors/Board/Stadium.
- age++ / ekonomia awansu / prestiż §6.
- Mutacja tier przy Season Closed / w raporcie / w UI CTA „Awansuj”.
- Mid-season strefy kolorów awansu w tabeli (Future).

---

## 5. Invariants

| ID  | Invariant                                                          |
| --- | ------------------------------------------------------------------ |
| I1  | Szczebel SSOT = `league_tier` na klubie (D88).                     |
| I2  | Outcome deterministyczny z tabeli + tier (D89 · D75).              |
| I3  | Jedyna mutacja tier = Confirm N+1 (D90 · D85).                     |
| I4  | Raport pokazuje outcome przed persist (D91 · D71).                 |
| I5  | Etykiety ligi wyłącznie z `resolveLeagueTierLabel` (Runtime SSOT). |
| I6  | Skład ligi / AI bez zmian w Thin (D92).                            |
| I7  | Floor IV · ceiling I (D93).                                        |
| I8  | Brak baraży (D94).                                                 |
| I9  | Kalendarz N+1 nadal `planClubFixtures` (D80).                      |
| I10 | Soft-lock Sponsors/Board/Stadium bez zmian.                        |

---

## 6. Pipeline (integracja z Season End)

| Krok | Zdarzenie        | Promotion Thin                                    |
| ---- | ---------------- | ------------------------------------------------- |
| 1–2  | Trigger → Closed | bez mutacji tier                                  |
| 3    | Report           | derive outcome + label **bieżącego** tier         |
| 4–5  | OFFSEASON/hooks  | brak feature Sponsors/Board; H-PROMOTION = derive |
| 6–7  | Confirm → N+1    | `applyLeagueTierOutcome` → persist `league_tier`  |
| 8    | SEASON           | etykiety z nowego tier                            |

---

## 7. Reguły outcome (liczbowe)

| Warunek                    | Outcome    | Next tier (apply)       |
| -------------------------- | ---------- | ----------------------- |
| pozycja ≤ 2 i tier ≠ `i`   | `promote`  | o 1 szczebel wyżej      |
| pozycja ≤ 2 i tier = `i`   | `stay`     | `i` (mistrz/wicemistrz) |
| pozycja ≥ 11 i tier ≠ `iv` | `relegate` | o 1 szczebel niżej      |
| pozycja ≥ 11 i tier = `iv` | `stay`     | `iv` (podłoga)          |
| pozostałe                  | `stay`     | bez zmian               |

Kolejność etykiet szczebla: `iv` → `iii` → `ii` → `i`.

---

## 8. Acceptance Criteria (kontrakt)

| ID   | Kryterium                                      |
| ---- | ---------------------------------------------- |
| AC-1 | IN/OUT i D88–D94 jawne w tym pliku.            |
| AC-2 | Persist tier + default `iv`.                   |
| AC-3 | Outcome pure; floor/ceiling.                   |
| AC-4 | Raport OFFSEASON = derive only (zero mutacji). |
| AC-5 | Tier zmienia się tylko w Confirm N+1.          |
| AC-6 | Etykiety tylko z `resolveLeagueTierLabel`.     |
| AC-7 | D92: brak zmiany katalogu AI / siły.           |
| AC-8 | Pointer §10.21 w GDD wskazuje ten plik.        |
| AC-9 | Soft-lock Sponsors/Board/Stadium nietykalny.   |

---

## 9. Relacja do GDD pełnego

| Rozdział            | Relacja                                                              |
| ------------------- | -------------------------------------------------------------------- |
| §10.9 · §10.10      | Kierunek pełny; Thin = ten plik (D88–D94)                            |
| §10.11              | Baraże = Future (D94)                                                |
| §10.20 / SEASON-END | Lifecycle bez awansu historycznie (D73); Promotion = osobny kontrakt |
| H-PROMOTION         | Realizowany jako derive + mutacja Confirm                            |

---

## Last updated

2026-07-31 — GDD-PROMOTION-01 CLOSED · D88–D94 · LFE-PROMOTION-01
