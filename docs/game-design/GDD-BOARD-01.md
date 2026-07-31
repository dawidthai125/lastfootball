# GDD-BOARD-01 — Board Thin (kontrakt produktowy)

**Produkt:** Last Football  
**EPIC:** GDD-BOARD-01 / LFE-BOARD-01  
**Status:** CLOSED — kontrakt Thin · D102–D108  
**SSOT Thin:** ten plik  
**Pointer w GDD:** [`GAME_DESIGN_DOCUMENT.md`](./GAME_DESIGN_DOCUMENT.md) §6 · §21 · Season End  
**Lifecycle:** [`GDD-SEASON-END-01.md`](./GDD-SEASON-END-01.md) · H-BOARD

> **Cel:** Warstwa informacji Zarządu — ocena / oczekiwania względem faktów sezonu (tabela · report).  
> Pure derive · bez persist · bez Prestige Engine · bez Quest · bez zarządzania klubem · bez blokady Confirm.

---

## 1. Owner LOCK (kod)

1. Brak migracji SQL · brak nowych tabel/kolumn · brak zapisu stanu Board.
2. Brak Server Actions / RPC zapisujących Board.
3. `resolveClubBoard()` = jedyne źródło danych UI.
4. Board = wyłącznie Information Thin.
5. Expectation = opisowe (bez progress/completion).
6. Standing używa jakościowego **trend** (nie `complete`).
7. Tone ∈ `positive` \| `neutral` \| `concern`.
8. Confirm Next Season = Primary CTA.
9. `/board` open SEASON+OFFSEASON; `/stadium` soft-locked.

---

## 2. Decyzje D102–D108

| ID       | Nazwa                    | Sedno                                       |
| -------- | ------------------------ | ------------------------------------------- |
| **D102** | Board UI Sole Resolver   | UI tylko `resolveClubBoard`                 |
| **D103** | Board Information Thin   | Pure derive · zero mutacji z UI Board       |
| **D104** | H-BOARD Non-Blocking     | Confirm Primary; Board = info               |
| **D105** | Soft Unlock Board Only   | `/board` open; Stadium locked               |
| **D106** | No Prestige Engine       | Brak silnika Prestige/Reputacja             |
| **D107** | No Quest No Club Mgmt    | Brak Quest Engine · brak zarządzania klubem |
| **D108** | Derive From Season Facts | Tabela + report · zero RNG                  |

---

## 3. IN / OUT

### IN

- `resolveClubBoard` · `/board` View · unlock Board.
- Expectation opisowe Thin · standing + trend · Offseason `seasonReview`.
- REUSE: `resolveLeagueTable` · `resolveSeasonReport`.

### OUT

- Migracje · persist · Server Actions Board
- Prestige/Reputation Engine · Quest Engine · club management
- Stadium · blokada Confirm · cash/kary Board

---

## 4. Acceptance Criteria

| ID   | Kryterium                                    |
| ---- | -------------------------------------------- |
| AC-1 | Kontrakt Thin + D102–D108 jawne              |
| AC-2 | UI = tylko `resolveClubBoard`                |
| AC-3 | Zero migracji / persist / mutations Board    |
| AC-4 | `/board` open; Stadium locked                |
| AC-5 | Confirm Primary nietknięty                   |
| AC-6 | Expectation bez completion; trend jakościowy |
| AC-7 | Tone ∈ positive/neutral/concern              |
| AC-8 | ZERO Fake Production                         |

---

## Last updated

2026-07-31 — GDD-BOARD-01 CLOSED · D102–D108 · LFE-BOARD-01
