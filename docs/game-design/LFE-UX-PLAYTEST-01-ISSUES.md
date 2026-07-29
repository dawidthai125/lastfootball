# LFE-UX-PLAYTEST-01 — ISSUES

**EPIC:** LFE-UX-PLAYTEST-01  
**Data:** 2026-07-29  
**Źródło:** sesje PT-01…08 ([`…-RESULTS.md`](./LFE-UX-PLAYTEST-01-RESULTS.md))  

**Skala:** **P0** blokuje zadanie · **P1** poważnie utrudnia · **P2** kosmetyczny  

---

## 0. Status

| Priorytet | Otwarte | Zamknięte / WONTFIX |
| --------- | ------- | ------------------- |
| **P0** | **0** | — |
| **P1** | **1** | — |
| **P2** | **5** | — |
| NOTE | 3 | — |

**Gate:** brak aktywnych P0 ✓

---

## 1. Issues playtest

### PTI-01 — Mobile: brak SQD-03 / XFR-02
- **Priorytet:** P1  
- **PT:** PT-08 (+ daily mobile)  
- **Opis:** Match Path M OK; detal gracza i Accept oferty nie mają frame’ów Mobile — pełna parity daily nieklikalna na M.  
- **Oczekiwane:** D↔M te same cele domen  
- **Obserwowane:** lista Kadra / inbox bez drill-down M  
- **§16/IA:** nie psuje Hub→Match; psuje kompletność domen M  
- **Fix:** dodać `PROTO-SCR-SQD-03-M` · `PROTO-SCR-XFR-02-M` (+ modal) w polish Figma **lub** w pierwszym EPIC UI (parity acceptance)  
- **Status:** OPEN  

### PTI-02 — Live: Primary „Gol (demo)”
- **Priorytet:** P2  
- **PT:** PT-01 / PT-08  
- **Opis:** Hotspot demo myli z decyzją menedżerską.  
- **Fix:** w implementacji moment auto/overlay; w proto oznaczyć wyraźniej „demo advance”  
- **Status:** OPEN · backlog implementacji  

### PTI-03 — Font Inter zamiast Archivo / Source Sans
- **Priorytet:** P2  
- **Źródło:** ISS-01 build  
- **Fix:** tokeny typo DS w implementacji + Figma polish  
- **Status:** OPEN  

### PTI-04 — Ikony Nav placeholder (ellipses)
- **Priorytet:** P2  
- **Źródło:** ISS-02  
- **Fix:** `ICO-*` World Art  
- **Status:** OPEN  

### PTI-05 — Hero WA fills niepełne
- **Priorytet:** P2  
- **Źródło:** ISS-03  
- **Fix:** apply PNG z `lfe-world-art-04/` na pozostałe LocationHero  
- **Status:** OPEN  

### PTI-06 — Soft-lock exit jako gold Primary
- **Priorytet:** P2  
- **PT:** PT-04 / PT-05  
- **Opis:** Exit „○ Hub” wizualnie gold — OK funkcjonalnie; copy ○ vs fill może lekko mylić.  
- **Fix:** Secondary outline dla exit soft-lock **lub** Primary „Wróć do Hub” bez symbolu ○  
- **Status:** OPEN  

### PTI-07 — Nav i Secondary dublują wejścia do domen
- **Priorytet:** NOTE  
- **PT:** PT-02  
- **Opis:** Krótka pauza „którym wejść?” — nie blokuje.  
- **Fix:** opcjonalnie w copy Hub: Secondary = sprawy dnia, Nav = lokacje  
- **Status:** OPEN  

### PTI-08 — START Modes bez cross-page linków
- **Priorytet:** NOTE  
- **Źródło:** ISS-05  
- **Status:** WONTFIX (limit Figma) · launchers OK  

### PTI-09 — Pre incomplete Primary no-op
- **Priorytet:** NOTE  
- **Źródło:** ISS-06  
- **Status:** WONTFIX (celowe) · w impl: disabled + hint  

---

## 2. Mapowanie build → playtest

| Build ISS | Playtest |
| --------- | -------- |
| ISS-01 | PTI-03 P2 |
| ISS-02 | PTI-04 P2 |
| ISS-03 | PTI-05 P2 |
| ISS-04 | **PTI-01 P1** |
| ISS-05…07 | NOTE / WONTFIX |

---

## 3. Backlog rekomendowany przed/na start implementacji

| Kolejność | ID | Działanie |
| --------- | -- | --------- |
| 1 | PTI-01 | Parity M: detal + oferta (+ modal) |
| 2 | PTI-02 | Live bez fałszywego Primary decyzji |
| 3 | PTI-03…05 | Typo · ikony · WA fills (może równolegle z kodem) |
| 4 | PTI-06 | Spójność CTA soft-lock |

**Nie blokują startu EPIC implementacyjnego** przy GO Owner (PTI-01 jako acceptance kryterium M w sprincie 1).

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Issues P0/P1/P2 z PT-01…08 |
