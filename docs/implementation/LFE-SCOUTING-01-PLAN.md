# LFE-SCOUTING-01 — PLAN (Skauting Information Thin B · kod)

**EPIC:** LFE-SCOUTING-01  
**Typ:** implementacja domeny Information Thin (GDD-17 Thin B)  
**Data:** 2026-07-30  
**Wejście:** AUDIT PASS · GDD-17 CLOSED · D19 / D20 / D22 / D23 · GDD-21+22 CLOSED (strategia)  
**Status PLAN:** CLOSED · EPIC LFE-SCOUTING-01 FULLY CLOSED (feat `93fd6d5` · PRODUCTION VERIFY PASS · DOCS CLOSE)
**Baseline wejścia:** Domain `9c6fe86` · Presentation `9fd14fc` · Docs tip `f871ca8` · HEAD `35b7ace`

---

## 0. Cel

Wdrożyć opcjonalną warstwę **Information Thin** zgodnie z GDD §17:

- skauting = **porządkowanie informacji** wspierających decyzję menedżera,
- jedyny model zawodnika = tabela **`players`** (D19),
- REUSE: `resolveTransferMarket` · potential (D22) · Academy filters (D23),
- prywatna shortlista **bez** side-effectów rynkowych / rozwojowych,
- UI `/scouting` wyłącznie przez **resolver** — **zastąpienie** placeholderów (nie ożywianie mocków).

**Zasada nadrzędna (Owner / PLAN freeze)**

> **Skauting porządkuje informacje, ale nigdy nie ocenia zawodnika za gracza.**

---

## 1. Zakres Thin (IN)

| #   | Element                                                                                        |
| --- | ---------------------------------------------------------------------------------------------- |
| 1   | Architektura Information Thin (raport/sygnał + shortlista) — bez misji/regionów/kosztów        |
| 2   | `resolveClubScouting(...)` → DTO Thin (kandydaci · sygnały · shortlista · akcje)               |
| 3   | Kandydaci = istniejące wiersze **`players`** w torze produktowym (kadra senior / listed rynek) |
| 4   | REUSE potential: pasma D22 (`resolvePlayerPotential` / band) — bez fog / ukrytych liczb        |
| 5   | REUSE rynku: kontekst listed / supply przez `resolveTransferMarket` (bez zmiany D20)           |
| 6   | REUSE Academy: `filterSeniorPlayers` / świadomość `academy_track` — Intake ≠ skauting          |
| 7   | Prywatna shortlista: add / remove · zero wpływu na listing · nego · settle · skill · potential |
| 8   | Persist shortlisty = **referencje `players.id`** (preferencja) — bez drugiego modelu zawodnika |
| 9   | UI `/scouting`: informacje + shortlista + CTA do istniejących lokalizacji (Transfery / Kadra)  |
| 10  | Unlock nav: skauting open w `SEASON` (soft-lock wcześniej) — Primary dnia meczu nienaruszony   |
| 11  | Usunięcie / zastąpienie placeholder `PlaceholderPage` + atrapy Overlay „Raport skauta”         |
| 12  | Testy: shortlista nie mutuje rynku / `players` domenowo; resolver pure + reguły preferencji    |
| 13  | DOCS CLOSE sync po PRODUCTION VERIFY                                                           |

---

## 2. Zakres OUT (twarde)

- Drugi model zawodnika: `scout_players` · `hidden_players` · osobny OVR / youth market scout
- Drugi system oceny (score skauta, ranking kandydatów, AI pick, „best buy”)
- Fog / hidden potential / hidden skill w Thin
- Mutacja `skill` · `potential` · Match Development · Training
- Zmiana mechaniki Transferów (D20): listing · nego · settle · fee · okno
- Zastępowanie Intake / Promote Akademii (D23)
- Regiony · misje · zlecenia farm · koszty §26 · pensje / XP skautów · personel
- Auto-decyzje (auto-buy / auto-promote / auto-list)
- Ożywianie mocków Overlay / copy „Zlecenia” jako SSOT
- Zmiana LFE / Physics / attribute DB / XP
- Hooki push / inbox jako wymaganie Thin (feedback lokalny UI only, jeśli w ogóle)

---

## 3. Zasada nadrzędna — konsekwencje architektoniczne

### 3.1 Zasada (SSOT produktowy)

**Skauting porządkuje informacje, ale nigdy nie ocenia zawodnika za gracza.**

**Znaczenie**

1. Skauting **układa kontekst** (kto jest w torze, pasmo potential, czy listed, shortlista prywatna).
2. Skauting **nie wystawia werdyktu** „kup / nie kup”, „lepszy / gorszy”, „AI rekomenduje”.
3. Ocena wartości transferowej / fit / ryzyka pozostaje **decyzją gracza** na Hubie / w Transferach / w Kadrze.
4. Raport / sygnał = **prezentacja faktów już istniejących w domenie** — nie nowa liczba oceny.

### 3.2 Konsekwencje vs zasady projektu

| Zasada projektu           | Konsekwencja dla LFE-SCOUTING-01                                                                                                       |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| **SSOT FIRST**            | SSOT zawodnika = `players` (D19). SSOT rynku = D20. SSOT potential = D22. Shortlista = preferencja (ref id), **nie** SSOT zawodnika.   |
| **REUSE FIRST**           | UI i raporty **reuse’ują** `resolveTransferMarket`, pasma potential, filtry Academy/senior. Zakaz forka „scouting fee / scouting OVR”. |
| **ZERO DUPLICATE LOGIC**  | Zakaz drugiego listingu, drugiego nego, drugiego Intake, drugiej kadry. Shortlista ≠ `transfer_listed_at` ≠ pending offer.             |
| **Presentation ≠ Domain** | Badge „na shortliście”, copy raportu, layout `/scouting` = prezentacja. Reguły skill/fee/settle **nie** żyją w module skautingu.       |
| **Porządkuje ≠ ocenia**   | Zakaz score/rank/AI pick w DTO Thin. Sygnały = fakty (pasmo, listed, tor) — nie „ocena skauta 8.5”.                                    |

### 3.3 Zakazy wynikające z zasady

1. Automatyczny ranking kandydatów / „Top picks”.
2. Kolumna / pole „scout_rating” jako decyzja produktowa Thin.
3. CTA, które settle’uje lub Accept’uje ofertę **poza** Transferami.
4. Raport, który mutuje `players` „bo skaut uznał”.

---

## 4. Model danych — shortlista (persist)

### 4.1 Freeze PLAN (do OWNER GO)

| Decyzja                   | Wartość Thin                                                                |
| ------------------------- | --------------------------------------------------------------------------- |
| Encja zawodnika           | Wyłącznie `public.players` (D19) — **bez** drugiego modelu                  |
| Shortlista                | Preferencja menedżera / klubu: zbiór **referencji** `players.id`            |
| Wpływ na wiersz `players` | **Żaden** (zakaz update skill/potential/listed/academy_track ze shortlisty) |
| Wpływ na rynek / oferty   | **Żaden**                                                                   |
| Ranking / AI              | **Zakaz**                                                                   |

### 4.2 Propozycja persist (Owner zatwierdza w GO IMPLEMENT)

**Preferowana (SSOT FIRST · czytelna):** tabela preferencji (nie model zawodnika), np.:

| Kolumna      | Sens Thin                      |
| ------------ | ------------------------------ |
| `club_id`    | Właściciel shortlisty          |
| `player_id`  | FK → `players.id` (referencja) |
| `created_at` | Audyt                          |
| PK           | (`club_id`, `player_id`)       |

**Zakaz w tej tabeli:** `skill`, `potential`, `ovr`, `scout_score`, `hidden_*`, kopie atrybutów.

**Alternatywa odrzucona w PLAN (domyślnie):** localStorage-only — słabe multi-device / SSR; dopuszczalne tylko jeśli Owner GO wymusi „zero migracji” (wtedy Thin jeszcze węższy).

**Alternatywa JSON na `clubs`:** możliwa, ale mniej czytelna i trudniejsza w RLS — nie preferowana.

### 4.3 Reguły shortlisty

1. Add: tylko gdy `player_id` istnieje i jest w torze produktowym widocznym dla klubu (senior własny / listed inny — wg reguł Thin z resolvera).
2. Remove: wyłącznie preferencja — bez skutku rynkowego.
3. Limit jakościowy Thin (propozycja implementacyjna, nie GDD liczba): np. max N pozycji — Owner zatwierdza w GO; nie publikować jako reguła GDD.
4. Zawodnik `academy_track = true` **nie** jest kandydatem rynku skautingowego Thin (Intake = Academy); shortlista akademii OUT Thin (granica §16).

---

## 5. Warstwa domeny (Presentation ≠ Domain)

### 5.1 Resolver (jedyny SSOT UI Skautingu)

```
resolveClubScouting(input) → ScoutingDto
```

**Wejście (REUSE):** klub · wiersze `players` (własne + listed innych, wg istniejących loaderów rynku) · shortlist ids · flagi okna / phase.

**DTO Thin (jakościowo):**

| Pole            | Źródło                                     |
| --------------- | ------------------------------------------ |
| Kandydaci rynku | Derive z listed `players` + kontekst D20   |
| Sygnały         | Pasmo potential (D22) · listed · pos/wiek  |
| Shortlista      | Preferencje (ref id) ∩ widoczne kandydaty  |
| Akcje           | add/remove shortlist · deep-link Transfery |

**Zakaz w DTO:** scout_score · AI recommendation · hidden potential · fee override.

### 5.2 Mutacje dozwolone

| Akcja            | Efekt                                   |
| ---------------- | --------------------------------------- |
| Add shortlist    | INSERT preferencji (club_id, player_id) |
| Remove shortlist | DELETE preferencji                      |

**Zakaz mutacji:** cash · `transfer_offers` · `transfer_listed_at` · skill · potential · academy_track · Intake/Promote.

### 5.3 REUSE istniejących systemów

| System                          | Rola w Thin                                     |
| ------------------------------- | ----------------------------------------------- |
| `resolveTransferMarket`         | Kontekst listed / okna / ask (odczyt)           |
| `resolvePlayerPotential` / band | Sygnał potential bez fog                        |
| `filterSeniorPlayers` / Academy | Granica: perspektywy akademii ≠ kandydaci rynku |
| Transfer UI `/transfers`        | Jedyny tor decyzji kupna/sprzedaży              |
| `resolveClubAcademy`            | Osobny tor — brak merge z skautingiem           |

---

## 6. Relacje Academy ↔ Transfer ↔ Scouting

| Tor          | SSOT decyzji                        | Rola skautingu                              |
| ------------ | ----------------------------------- | ------------------------------------------- |
| **Academy**  | Intake / Promote (D23)              | **OUT** — nie zastępuje naboru              |
| **Transfer** | Listing / nego / settle (D20)       | Wspiera decyzję · **nie** zmienia mechaniki |
| **Scouting** | Preferencja shortlisty + informacje | Porządkuje · **nie** ocenia za gracza       |

**Kontrakt granic**

1. Shortlista ≠ listing.
2. Raport ≠ oferta.
3. Skauting ≠ Intake akademii.
4. CTA skautingu do Transferów = deep-link; settle tylko w Transferach.

---

## 7. UI / Unlock / Placeholder ≠ SSOT

| Element                    | Thin                                                          |
| -------------------------- | ------------------------------------------------------------- |
| `/scouting`                | Widok resolver-only · zastępuje `PlaceholderPage`             |
| Nav `scouting`             | Open w `SEASON` (dodać do `SEASON_OPEN`); soft-lock wcześniej |
| Overlay „Raport skauta”    | Usunąć / podmienić — **nie** ożywiać jako SSOT raportów       |
| Copy „Zlecenia”            | **Zakaz** w Thin (R1) — misje = Future                        |
| Hub Primary dnia meczowego | Nienaruszony (§23)                                            |
| Presentation Contract      | Guide §16 — presentation only                                 |

---

## 8. Thin vs Future

| Element                   | Thin | Future                             |
| ------------------------- | ---- | ---------------------------------- |
| Information / shortlista  | TAK  | pogłębiona                         |
| REUSE rynku / potential   | TAK  | —                                  |
| Fog / hidden potential    | NIE  | tylko prezentacja (nigdy 2. model) |
| Regiony / misje / koszty  | NIE  | jakość informacji only             |
| Personel / XP skautów     | NIE  | jakość informacji only             |
| Ocena za gracza / AI pick | NIE  | NIE (zakaz bez osobnego Owner GO)  |
| Mutacja skill / potential | NIE  | NIE (zakaz)                        |
| Zmiana D20                | NIE  | osobny EPIC Owner                  |

---

## 9. Acceptance Criteria (IMPLEMENT)

- [x] `resolveClubScouting` jest jedynym SSOT UI `/scouting`.
- [x] Kandydaci wyłącznie z `players` (D19) — brak drugiego modelu / hidden players.
- [x] REUSE: `resolveTransferMarket` · potential pasma · filtry Academy/senior — bez forka fee/OVR.
- [x] Shortlista: persist = ref `players.id` · zero mutacji domeny zawodnika / rynku.
- [x] Zasada „porządkuje ≠ ocenia”: brak scout_score / AI pick / auto-rank w Thin.
- [x] Granice Academy / Transfer zapisane w kodzie i testach (ZERO DUPLICATE).
- [x] Placeholder `/scouting` + Overlay atrapa zastąpione lub usunięte (nie ożywione).
- [x] Copy bez „zleceń/misji” w Thin.
- [x] Nav: skauting open SEASON; Hub Primary nienaruszony.
- [x] Testy: add/remove shortlist bez side-effectów D20/D22/D23.
- [x] Thin OUT: fog · regiony · misje · koszty · drugi model · drugi system oceny.
- [x] Po VERIFY: COMMIT → PUSH → CI GREEN → PRODUCTION VERIFY → DOCS CLOSE.
- [x] Brak zmian LFE / Physics; migracja tylko jeśli Owner GO na tabelę preferencji shortlisty.

---

## 10. Ryzyka (R1–R8) — mitigacja PLAN

| #   | Ryzyko                                    | Mitigacja PLAN / IMPLEMENT                          |
| --- | ----------------------------------------- | --------------------------------------------------- |
| R1  | Drift „zlecenia/misje” z placeholder copy | Copy Thin = raporty / shortlista; misje = Future    |
| R2  | Ożywianie Overlay „Raport skauta”         | Usunąć/podmienić; Placeholder ≠ SSOT                |
| R3  | Shortlista jako listing / oferta          | Tylko preferencja; settle wyłącznie D20             |
| R4  | Tabela `scout_players` jako drugi model   | Zakaz; tylko ref `players.id` w preferencji         |
| R5  | Fog / ukryty potential w Thin             | Zakaz; D22 pasma only                               |
| R6  | Pomieszanie z Academy Intake              | Granica §16/D23; academy_track OUT kandydatów rynku |
| R7  | Scouting jako Hub Primary                 | Opcjonalny; §23 Primary = mecz                      |
| R8  | Scope creep regionów/kosztów              | Thin OUT · Future                                   |

---

## 11. Pliki (orientacja IMPLEMENT — nie tworzyć teraz)

| Obszar              | Przykład (orientacyjny)                           |
| ------------------- | ------------------------------------------------- |
| Domain              | `apps/web/src/lib/scouting/*`                     |
| UI                  | `apps/web/src/components/scouting/*` · page       |
| Unlock              | `apps/web/src/lib/hub/unlock.ts` (`SEASON_OPEN`)  |
| Overlay cleanup     | `OverlayRoot` atrapa skauta                       |
| Migracja (jeśli GO) | preferencja shortlisty (club_id, player_id)       |
| Testy               | `scouting01.test.ts`                              |
| Docs CLOSE          | STATUS · ROADMAP · BASELINE · HANDOFF · CHANGELOG |

**Nie ruszać poza GO:** packages LFE · Physics · niezwiązane EPIC-i.

---

## 12. Workflow po OWNER GO IMPLEMENT

```
OWNER GO IMPLEMENT
→ migracja preferencji shortlisty (jeśli zatwierdzona) · domain · UI · testy
→ OWNER VERIFICATION
→ COMMIT → PUSH → CI → PRODUCTION VERIFY (migracja na prod jeśli dotyczy)
→ DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

**Zakaz teraz:** IMPLEMENT · migracje · kod · AUDIT równoległy innych EPIC bez GO.

---

## 13. Decyzje wymagające OWNER GO (checklist)

- [ ] Zatwierdzenie Thin IN / OUT (§1–§2)
- [ ] Freeze zasady „porządkuje ≠ ocenia” (§3)
- [ ] Freeze persist shortlisty: tabela preferencji (club_id, player_id) **vs** wariant bez migracji
- [ ] Freeze: REUSE rynku/potential/Academy · zakaz drugiego modelu / drugiej oceny
- [ ] Freeze unlock: open w SEASON
- [ ] Zgoda na start **IMPLEMENT** (osobny GO)

---

## 14. Kryteria zakończenia EPIC-u (FULLY CLOSED)

1. IMPLEMENT Thin zgodny z PLAN + Owner VERIFY PASS
2. COMMIT + PUSH · CI GREEN
3. PRODUCTION VERIFY (w tym migracja preferencji na prod, jeśli w zakresie)
4. DOCS CLOSE sync SSOT
5. FINAL DOCS VERIFY · raport **EPIC FULLY CLOSED**

---

## Historia

| Wersja | Data       | Opis                         |
| ------ | ---------- | ---------------------------- |
| 1.0.0  | 2026-07-30 | PLAN COMPLETE — Owner Review |
