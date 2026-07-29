# LFE-UI-PROTOTYPE-VALIDATION-01 — UX ISSUES

**EPIC:** LFE-UI-PROTOTYPE-VALIDATION-01  
**Data:** 2026-07-29  
**Plik:** https://www.figma.com/design/mgNprLAGRgxrq7JrvZwda9/LFE-UI-PROTOTYPE-VALIDATION-01

> Log findings z buildu + playtestu. Szablon poniżej.

---

## 0. Status logu

| Metryka                     | Wartość                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------- |
| BLOCKER otwarte             | **0**                                                                              |
| MAJOR otwarte               | **0** (build)                                                                      |
| MINOR / SOFT znane z buildu | **5**                                                                              |
| Playtest findings           | → [`LFE-UX-PLAYTEST-01-ISSUES.md`](./LFE-UX-PLAYTEST-01-ISSUES.md) · **0 P0** · GO |

---

## 1. Znane z buildu (pre-playtest)

| ID     | Sev   | Opis                                                                                                                  | Mitigacja / status                             |
| ------ | ----- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| ISS-01 | MINOR | Font **Inter** zamiast Archivo / Source Sans 3                                                                        | Starter substitute · polish typography         |
| ISS-02 | MINOR | Ikony Nav = ellipses, nie `ICO-*` stroke                                                                              | Import ikon WA Wave 2 przy polish              |
| ISS-03 | MINOR | Większość Hero = color band + WA ID; PNG office/tunnel uploadowane, nie wszystkie frame’y mają fill IMAGE (limit MCP) | Dokończyć apply fills z `lfe-world-art-04/`    |
| ISS-04 | MINOR | Mobile: brak osobnych `SQD-03-M` · `XFR-02-M` (parity soft)                                                           | Desktop pokrywa Accept/detal; dodać M w polish |
| ISS-05 | NOTE  | START page Modes nie linkują cross-page (limit Figma NAVIGATE)                                                        | Launchers na Desktop/Mobile — OK by design     |
| ISS-06 | NOTE  | `MCH-03-incomplete` Primary disabled = **brak** reaction (celowe)                                                     | Obserwator: no-op = PASS                       |
| ISS-07 | NOTE  | Flood wash FLD-003 nie jako osobna warstwa grafiki                                                                    | Label / matchday copy only                     |

**Regresje Style Lock / purple / photoreal:** nie stwierdzono w buildzie tokenowym.

---

## 2. Szablon wpisu playtest

```
### ISS-XX — {krótki tytuł}
- Severity: BLOCKER | MAJOR | MINOR | NOTE
- Mode / ekran: …
- Kroki: …
- Oczekiwane: …
- Obserwowane: …
- §16 / Hi-Fi / IA?: …
- Propozycja fix: …
- Status: OPEN | FIXED | WONTFIX
```

---

## 3. Playtest log (puste — Owner)

| PT               | Wynik | Issues        |
| ---------------- | ----- | ------------- |
| PT-01 Match Path | PASS  | —             |
| PT-02 Daily      | PASS  | PTI-07 NOTE   |
| PT-03 EARLY      | PASS  | —             |
| PT-04 TRN lock   | PASS  | PTI-06 P2     |
| PT-05 XFR lock   | PASS  | PTI-06 P2     |
| PT-06 Empty      | PASS  | —             |
| PT-07 Error      | PASS  | —             |
| PT-08 Mobile     | PASS  | **PTI-01 P1** |

---

## Historia

| Wersja | Data       | Opis                              |
| ------ | ---------- | --------------------------------- |
| 0.1.0  | 2026-07-29 | Pre-playtest SOFT issues z buildu |
