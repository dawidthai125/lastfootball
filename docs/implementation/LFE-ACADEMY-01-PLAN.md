# LFE-ACADEMY-01 — PLAN (Akademia Thin A · kod)

**EPIC:** LFE-ACADEMY-01  
**Typ:** implementacja domeny Thin A (Intake + Promote)  
**Data:** 2026-07-30  
**Wejście:** AUDIT PASS · GDD-16 CLOSED Thin A · D19/D22  
**Status PLAN:** COMPLETE · oczekuje **OWNER GO** na IMPLEMENT  
**Priorytet IMPLEMENT:** **#1** (przed GDD-21 docs IMPLEMENT przy konflikcie slotu)

---

## 0. Cel

Wdrożyć opcjonalną ścieżkę **Intake + Promote** zgodnie z GDD §16:

- jeden model zawodnika = tabela **`players`** (D19),
- potential / rozwój = D22 (pasma UI; Match PRIMARY · Training SUPPORTING **po** Promote),
- UI `/academy` wyłącznie przez **resolver**,
- **zastąpienie** placeholder mocków (nie ożywianie poziomu akademii / budżetu / liczbowego potencjału),
- **bez** zależności od GDD-21 / GDD-22.

Po FULLY CLOSED → kamień **M2.5 — First Domain Implementation Review**.

---

## 1. Zakres Thin (IN)

| #   | Element                                                                                |
| --- | -------------------------------------------------------------------------------------- |
| 1   | Kolumna toru akademii na `players` (jeden SSOT — patrz §3)                             |
| 2   | `resolveClubAcademy(...)` → DTO Thin (perspektywy + akcje)                             |
| 3   | Filtrowanie: perspektywy **poza** senior `resolveClubSquad` / XI / listing transferowy |
| 4   | Server action / RPC: **Intake** (INSERT perspektywy)                                   |
| 5   | Server action / RPC: **Promote** (UPDATE → tor senior)                                 |
| 6   | UI `/academy`: Intake + lista perspektyw (pasma) + Promote                             |
| 7   | Unlock nav: akademia open w `SEASON` (soft-lock wcześniej)                             |
| 8   | Testy pure resolver + reguły Intake/Promote                                            |
| 9   | Usunięcie mocków sprzecznych z §16.12 / D22                                            |
| 10  | DOCS CLOSE sync po PRODUCTION VERIFY                                                   |

---

## 2. Zakres OUT (twarde)

- Poziomy / gwiazdki / rating ośrodka / budżet akademii (liczby)
- `academy_players` / `youth_players` / drugi OVR / youth market
- Trening akademii · mecze młodzieżowe · auto-promote
- Skauting §17 · fog · shortlista
- Cash-gate / koszty §26
- Hooki inbox / push (GDD-21/22) — feedback lokalny UI only
- Zmiana LFE / Physics / attribute DB / XP
- ELO / ranking / achievements katalog

---

## 3. Model danych (SSOT FIRST · ZERO DUPLICATE)

### 3.1 Zasada nadrzędna

**Jedyna tabela zawodników = `public.players`.**  
Zakaz: `academy_player`, `youth_player`, osobnego OVR, osobnego `skill` akademii.

### 3.2 Propozycja kolumny (do OWNER GO)

| Kolumna         | Typ                              | Sens Thin                                                                               |
| --------------- | -------------------------------- | --------------------------------------------------------------------------------------- |
| `academy_track` | `boolean not null default false` | `true` = perspektywa **przed** Promote; `false` = senior (domyślnie wszyscy istniejący) |

Opcjonalnie (Thin nice-to-have, nie blokuje):

| Kolumna       | Sens                                                               |
| ------------- | ------------------------------------------------------------------ |
| `promoted_at` | `timestamptz null` — audyt promocji; `null` jeśli nigdy z akademii |

**Nie** dodajemy osobnego statusu w `status` (READY/INJURED/…) — tor ≠ kontuzja.

### 3.3 Reguły wiersza perspektywy (`academy_track = true`)

| Reguła                                                     | Wartość Thin                                         |
| ---------------------------------------------------------- | ---------------------------------------------------- |
| Tabela                                                     | `players`                                            |
| `skill` / `potential`                                      | Te same kolumny co senior; `potential ≥ skill` (D22) |
| UI potential                                               | **Tylko pasmo** (`resolvePotentialBand`)             |
| `starter`                                                  | `false` (zakaz XI przed Promote)                     |
| `transfer_listed_at`                                       | zawsze `null` (zakaz listingu)                       |
| `departed_at`                                              | `null`                                               |
| Widoczność w `resolveClubSquad`                            | **wykluczona**                                       |
| Widoczność w XI / Training senior / Transfer market supply | **wykluczona**                                       |
| Widoczność w `resolveClubAcademy`                          | **tak**                                              |

### 3.4 Promote

Atomowo (preferowane RPC, wzorzec Training/Transfers):

1. Walidacja: wiersz należy do klubu · `academy_track = true` · `departed_at is null`.
2. `academy_track = false` · `promoted_at = now()` (jeśli kolumna).
3. Zachowaj `skill` / `potential` / `pos` / `age` — **bez** buffa absolwenta.
4. Po Promote: zawodnik wchodzi w senior path (Match Dev + Training) bez dalszej logiki akademii.

### 3.5 Intake

1. Generuj id w stylu istniejących (`a-{tag}-…` lub podobny prefix — REUSE wzorca seed/transfer ids).
2. Wiek młodzieżowy jakościowy Thin (np. 16–18 — stałe implementacyjne w kodzie, nie w GDD).
3. Niski `skill` startowy + `potential = resolvePlayerPotential(skill, id, age)` (REUSE D22).
4. Pozycja z małego zestawu pos jak seed kadry.
5. `academy_track = true`, `starter = false`.
6. Limit slotów perspektyw Thin (propozycja implementacyjna): **max 3** na klub — Owner zatwierdza w GO; nie publikować jako reguła GDD liczbowa.

### 3.6 Zmiany resolverów istniejących (REUSE · nie fork)

| Resolver / helper                    | Zmiana                                                         |
| ------------------------------------ | -------------------------------------------------------------- |
| `resolveClubSquad`                   | Filtruj `academy_track !== true` (oraz dotychczasowe departed) |
| `resolveStartingXi` / loaders squad  | To samo źródło co squad — perspektywy nie w XI                 |
| Transfer eligibility / market rows   | Tylko senior (`academy_track = false`)                         |
| Training / match development loaders | Tylko senior                                                   |
| Nowy: `resolveClubAcademy`           | Jedyny SSOT UI Akademii                                        |

---

## 4. Warstwa domeny (Presentation ≠ Domain)

```
UI /academy
  → resolveClubAcademy(club, rows, ctx)  // pure
  → actions: intakeProspect / promoteProspect  // mutacje + revalidate
```

### 4.1 `AcademyDto` (szkic)

- `clubId`
- `prospects[]`: id · name · pos · age · **potentialBand/Label** · (bez raw potential)
- `canIntake`: boolean (slot wolny + faza SEASON)
- `intakeBlockedReason?`: jakościowy
- zakaz pól: poziom akademii · budżet · youth OVR

### 4.2 UI `/academy`

1. Usunąć `StatBlock` poziomu/budżetu i tabelę z liczbowym pot.
2. Decision: „Nabór” (gdy `canIntake`).
3. Lista perspektyw + CTA „Promuj do seniorów”.
4. Mobile First · Guide Presentation Contract · bez Primary Hub conflict.
5. Feedback sukcesu: lokalny (inline / toast UI) — **bez** zapisu do inbox §21.

### 4.3 Unlock

| Faza                  | Nav `academy` |
| --------------------- | ------------- |
| NEW_CLUB / EARLY_CLUB | `soft_locked` |
| SEASON                | `open`        |

Szczegół „po N meczach” = Future; Thin = open na SEASON (zgodne z §16.10 jakościowo).

---

## 5. REUSE FIRST (mapa)

| Potrzeba         | Reuse                                                            |
| ---------------- | ---------------------------------------------------------------- |
| Kadra senior     | `players` + `resolveClubSquad`                                   |
| Potential        | `resolvePlayerPotential` · `resolvePotentialBand` · pasma UI     |
| Mutacje atomowe  | Wzorzec RPC jak `complete_training_session` / transfer complete  |
| Unlock nav       | `resolveNavAccess` + `SEASON_OPEN` (+ `academy`)                 |
| Shirt uniqueness | Istniejący constraint — dobór wolnego numeru przy Intake/Promote |
| Copy             | `UI_COPY` / lokalny copy akademii — bez mock dashboard           |

---

## 6. Acceptance Criteria

### Domena

- [ ] Brak drugiej tabeli zawodników / drugiego OVR.
- [ ] Perspektywy nie wchodzą do XI, Training senior, listingu, `resolveClubSquad`.
- [ ] Po Promote zawodnik w senior squad; Match/Training path bez osobnego buffa.
- [ ] UI pokazuje wyłącznie pasma potential.
- [ ] Intake respektuje limit slotów Thin (po GO).

### UI / architektura

- [ ] `/academy` konsumuje **tylko** `resolveClubAcademy`.
- [ ] Placeholder mocki usunięte / zastąpione.
- [ ] Presentation ≠ Domain.
- [ ] Nav: soft-lock przed SEASON; open w SEASON.

### Jakość

- [ ] Testy pure (resolver · filtry · promote/intake reguły).
- [ ] typecheck · lint · CI GREEN.
- [ ] Migracja udokumentowana w checklist prod (jak D21/D22).

### Docs (po PRODUCTION VERIFY)

- [ ] CURRENT_BASELINE Domain tip · STATUS · ROADMAP · HANDOFF · ARCHITECTURE_RULES (academy) · DECISIONS (D23 jeśli Owner uzna) · CHANGELOG.
- [ ] M2.5 checklist przygotowany do Owner review.

---

## 7. Pliki (orientacja IMPLEMENT)

| Obszar       | Ścieżki (oczekiwane)                                                            |
| ------------ | ------------------------------------------------------------------------------- |
| Migracja     | `supabase/migrations/*_academy_track.sql`                                       |
| Domain       | `apps/web/src/lib/academy/*` (`resolve-club-academy.ts`, types, actions, tests) |
| Squad filter | `apps/web/src/lib/squad/resolve-club-squad.ts` (+ loaders / map-player)         |
| Nav          | `apps/web/src/lib/hub/unlock.ts`                                                |
| UI           | `apps/web/src/app/(game)/academy/page.tsx` (+ ewentualny `AcademyView`)         |
| Docs CLOSE   | `docs/AI/*`, `PROJECT_STATUS`, `ROADMAP`, `DECISIONS`, `ARCHITECTURE_RULES`     |

**Nie ruszać w tym EPIC:** GDD §21 treść (Tor A), skauting, messages domain.

---

## 8. Ryzyka

| Ryzyko                                     | Poziom | Mitigacja                                |
| ------------------------------------------ | ------ | ---------------------------------------- |
| Drugi model zawodnika „przez przypadek”    | Wysoki | AC §6 · code review M2.5                 |
| Perspektywa w XI / transfer                | Wysoki | Filtr we **wszystkich** loaderach senior |
| Ożywienie mocka (poziom/budżet/liczba pot) | Wysoki | AC UI · §16.12                           |
| Konflikt shirt_number                      | Średni | Allocator wolnego numeru                 |
| Równoległy Tor A docs                      | Niski  | Osobne commity; Academy IMPLEMENT first  |
| Migracja nie na prod                       | Średni | Checklist jak potential RPC              |

---

## 9. M2.5 — First Domain Implementation Review

Po EPIC FULLY CLOSED Owner ocenia:

1. SSOT FIRST · REUSE · ZERO DUPLICATE · Presentation ≠ Domain
2. Zgodność GDD §16 Thin
3. Czy tempo Scouting-01 jest bezpieczne

Werdykt: **PASS** / **PASS WITH NOTES** / **HOLD** (patrz strategia hybrydowa).

---

## 10. Workflow po OWNER GO

```
OWNER GO → IMPLEMENT (kod) → OWNER VERIFICATION
→ COMMIT → PUSH → PRODUCTION VERIFY
→ DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
→ M2.5 Owner Review
```

GDD-21 docs IMPLEMENT: **dopiero** gdy Owner zwolni slot (Academy ma priorytet).

---

## 11. Decyzje wymagające OWNER GO (checklist)

- [ ] Zatwierdzenie kolumny `academy_track` (+ opcjonalnie `promoted_at`)
- [ ] Limit perspektyw Thin = **3** (lub inna liczba wskazana przez Ownera)
- [ ] Unlock = open na **SEASON** (bez dodatkowego progu played)
- [ ] Prefix id Intake (`a-…`) OK
- [ ] Start IMPLEMENT LFE-ACADEMY-01 jako **jedyny** aktywny IMPLEMENT

---

## Historia

| Wersja | Data       | Opis                         |
| ------ | ---------- | ---------------------------- |
| 1.0.0  | 2026-07-30 | PLAN COMPLETE — Owner Review |
