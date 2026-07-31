# GDD-STADIUM-01 — Stadium Thin (kontrakt produktowy)

**Produkt:** Last Football  
**EPIC:** GDD-STADIUM-01 / LFE-STADIUM-01  
**Status:** IMPLEMENT — kontrakt Thin · D109–D115  
**SSOT Thin:** ten plik  
**Pointer w GDD:** [`GAME_DESIGN_DOCUMENT.md`](./GAME_DESIGN_DOCUMENT.md) §13 · §5.6

> **Cel:** Karta „nasz dom” — nazwa, pojemność, jakościowe pasmo frekwencji.  
> Pure derive · bez persist · bez Ticket Economy · bez rozbudowy · bez Match Engine · bez blokady Confirm.

---

## 1. Owner LOCK (kod)

1. Brak migracji SQL · brak nowych tabel/kolumn.
2. Brak Ticket Economy · brak nowych kategorii Finance.
3. Brak zmian Match Engine / UI Match / PreMatch.
4. `resolveClubStadium()` = jedyne źródło danych UI.
5. Attendance wyłącznie jakościowe; brak home played → `unknown`.
6. `hubHint` wyłącznie w OFFSEASON.
7. Identity Note = statyczny opis obiektu.
8. Unlock wyłącznie `/stadium` (SEASON+OFFSEASON).
9. Confirm Next Season = Primary CTA.
10. REUSE `STARTER_PACKAGE` (nazwa · pojemność).

---

## 2. Decyzje D109–D115

| ID       | Nazwa                         | Sedno                                               |
| -------- | ----------------------------- | --------------------------------------------------- |
| **D109** | Stadium UI Sole Resolver      | UI tylko `resolveClubStadium`                       |
| **D110** | Stadium Information Thin      | Pure derive · zero mutacji / persist Stadium        |
| **D111** | Soft Unlock Stadium Only      | `/stadium` open SEASON+OFFSEASON                    |
| **D112** | No Ticket Economy Thin        | Brak biletów → kasa; brak nowych finance categories |
| **D113** | Qualitative Attendance Only   | Pasmo jakościowe · zero symulacji liczbowej / RNG   |
| **D114** | Starter Package Stadium Facts | Nazwa + pojemność wyłącznie z `STARTER_PACKAGE`     |
| **D115** | No Match Engine Coupling      | Brak wpływu na LFE Match / wynik / Canvas `Stadium` |

---

## 3. IN / OUT

### IN

- `resolveClubStadium` · `/stadium` View · unlock Stadium.
- Qualitative attendance band z ostatniego home played.
- REUSE: `STARTER_PACKAGE`.

### OUT

- Migracje · Ticket Economy · finance categories
- Rozbudowa · utrzymanie cash · cennik · rename
- Match Engine / PreMatch / Canvas
- Prestige / Quest · H-STADIUM blokujący Confirm

---

## 4. Acceptance Criteria

| ID    | Kryterium                                              |
| ----- | ------------------------------------------------------ |
| AC-1  | Kontrakt Thin + D109–D115 jawne                        |
| AC-2  | UI = tylko `resolveClubStadium`                        |
| AC-3  | Zero migracji / persist / finance categories / tickets |
| AC-4  | `/stadium` open; inne soft-locki bez zmian             |
| AC-5  | Confirm Primary nietknięty                             |
| AC-6  | Attendance jakościowe; brak home → `unknown`           |
| AC-7  | Nazwa + pojemność = `STARTER_PACKAGE`                  |
| AC-8  | Zero wpływu na Match Engine                            |
| AC-9  | ZERO Fake Production                                   |
| AC-10 | Verify gates GREEN                                     |

---

## Last updated

2026-07-31 — GDD-STADIUM-01 · D109–D115 · LFE-STADIUM-01 IMPLEMENT
