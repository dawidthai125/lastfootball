# LFE-UI-PROTO-01 — INTERACTION SPECS

**EPIC:** LFE-UI-PROTO-01  
**Data:** 2026-07-29  
**Status:** DRAFT — zachowania hotspotów i stanów w prototypie  

> Screens Hi-Fi: [`LFE-UI-HIFI-01-HIFI-SCREENS.md`](./LFE-UI-HIFI-01-HIFI-SCREENS.md)  
> Component / State: [`…-COMPONENT-SPECS.md`](./LFE-UI-HIFI-01-COMPONENT-SPECS.md) · [`…-STATE-SPECS.md`](./LFE-UI-HIFI-01-STATE-SPECS.md)  
> Flows: [`LFE-UI-PROTO-01-FLOW-MAP.md`](./LFE-UI-PROTO-01-FLOW-MAP.md)  

**Zasada:** interakcje = nawigacja między frame’ami + wizualne stany DS. **Brak** logiki biznesowej.

---

## 0. Konwencje interakcji

| Symbol | Znaczenie w prototypie |
| ------ | ---------------------- |
| ◆ | Primary hotspot → 1 target frame |
| ○ | Secondary / Soft → target; wizualnie niżej |
| Nav | Shell NavItem / BottomNav |
| Overlay | warstwa nad chrome; dismiss jawny lub timed |
| Variant | Figma component variant = stan ekranu |

| Timing (docelowy w toolu) | Wartość |
| ------------------------- | ------- |
| Button press feedback | 150–220ms |
| Overlay Goal hold | 1.2–2.0s lub tap |
| Toast auto-dismiss | ~3–4s |
| `prefers-reduced-motion` | tylko fade opacity (notatka w review) |

---

## 1. Shell — interakcje

### TopBar
| Hotspot | Akcja | Uwagi §16 |
| ------- | ----- | --------- |
| Crest | → Hub (01/02 wg mode) | nie gold CTA |
| Kasa | **brak** nawigacji P0 (lub soft FIN opcjonalnie — preferuj brak) | nie Primary |
| Live chip | widoczny tylko Live; tap = no-op lub scroll do score | rare scarlet |

### Nav Desktop / Bottom Mobile
| Item | Target open | Target locked |
| ---- | ----------- | ------------- |
| Hub | HUB-01/02/04 | — |
| Trening | TRN-01 | TRN-02 lub SYS-04 |
| Kadra | SQD-01 | SYS-04 |
| Transfery | XFR-01 | XFR-03 lub SYS-04 |
| Finanse / More | FIN-01 (D: Finanse; M: More→FIN) | SYS-04 |

**Active state:** gold-soft + prestige tick (Component Spec).  
**Podczas Tunnel:** Nav ukryty — brak hotspotów.  
**Podczas Live:** Nav limited — jeśli widoczny i locked → SYS-04.

### Soft-lock Modal SYS-04
| Hotspot | Target |
| ------- | ------ |
| ○ Wróć / tło dismiss | poprzedni frame |
| ○ Do Hub | HUB-02 (lub HUB-01 w MODE-A) |
| Brak ◆ „Odblokuj” | — |

### Toast SYS-05
| Zachowanie | Nie blokuje Primary na stałe; znika auto lub tap |

---

## 2. Hub — interakcje

### SCR-HUB-01 Matchday
| Hotspot | Target | Stan źródłowy |
| ------- | ------ | ------------- |
| ◆ Idź do meczu | MCH-01 | default |
| ○ Kadra / Trening / Transfery / Finanse / Terminarz* | domena | ≤5; Terminarz = soft no-op P0 lub Hub meta |
| Locked Secondary | SYS-04 | soft visual |
| SoftLink (1) | kontekst / Hub meta | muted |

\*Terminarz P0: jeśli brak frame — **nie** dodawać martwego linku; użyj 4 Secondary + ewentualnie soft.

### SCR-HUB-02 Idle
| Hotspot | Target |
| ------- | ------ |
| ◆ (Kadra lub Trening — fixture) | SQD-01 / TRN-01 |
| ○ pozostałe | domeny |
| Crest / Nav Hub | self refresh default |

### SCR-HUB-04 EARLY
| Hotspot | Target |
| ------- | ------ |
| ◆ First Match | MCH-01 |
| ◆ Kadra (alt fixture) | SQD-01 |
| Locked Secondary | SYS-04 |

**Loading:** frame `LOD-004` → auto lub tap „Pomiń” (tylko prototyp) → Hub default.

---

## 3. Match Path — interakcje

### SCR-MCH-01 Tunnel
| Hotspot | Target |
| ------- | ------ |
| ◆ Wejdź / Kontynuuj | MCH-02 |
| ◆ Retry (error) | ten sam default |
| Back do Hub | **brak** (immersive) — wyjątek: opcjonalny soft „Wyjdź” → confirm → HUB-01 (jeśli dodany, 1 Secondary max) |

### SCR-MCH-02 VS
| ◆ Kick-off / Dalej | MCH-03 |

### SCR-MCH-03 Pre-match
| Hotspot | Warunek | Target |
| ------- | ------- | ------ |
| ○ Skład | zawsze | SQD-04 |
| ◆ Start meczu | checklist complete (variant ready) | MCH-04 |
| ◆ disabled | incomplete variant | no-op + hint inline |

### SCR-SQD-04 XI
| Hotspot | Target |
| ------- | ------ |
| ◆ Dalej / Zatwierdź | MCH-04 |
| Back / ○ Wróć | MCH-03 |
| Slot tap | lokalny selected (bez silnika) — opcjonalny micro |

### SCR-MCH-04 Live
| Hotspot / trigger | Target |
| ----------------- | ------ |
| Hotspot „Gol” / auto advance | MCH-05 |
| Hotspot „FT” / po Goal path | MCH-07 |
| Reconnect strip | zostaje Live; strip dismiss |

### SCR-MCH-05 Goal
| tap anywhere / timed | MCH-04 |
| reduced-motion note | fade only |

### SCR-MCH-07 Final
| ◆ | MCH-08 |

### SCR-MCH-08 Post
| ◆ Hub | HUB-02 |
| Soft meta | no-op lub Hub |

---

## 4. Squad — interakcje

### SCR-SQD-01
| Hotspot | Target |
| ------- | ------ |
| PlayerRow | SQD-03 |
| ○ Trening | TRN-01 |
| Soft Hub / Nav | Hub |
| Empty CTA | Hub lub Trening |

### SCR-SQD-03
| Back / breadcrumb | SQD-01 |
| ○ Trening | TRN-01 |

---

## 5. Training — interakcje

### SCR-TRN-01
| ◆ (wybór planu) | settle loading → HUB-02 |
| Soft Hub | HUB-02 |
| Error toast | zostaje TRN-01 |

### SCR-TRN-02
| ○ Hub / Wróć | HUB-02 |
| Brak ◆ Odblokuj | — |

---

## 6. Transfers — interakcje

### SCR-XFR-01
| Row oferta | XFR-02 |
| Soft Finanse | FIN-01 |
| Soft Hub | Hub |

### SCR-XFR-02
| ◆ Accept | Modal confirm |
| Modal ◆ Potwierdź | settle → XFR-01 (lub Hub) |
| Modal ○ Anuluj | XFR-02 |
| ○ Reject | XFR-01 |
| Back | XFR-01 |
| Error | Toast; modal może zostać |

### SCR-XFR-03
| ○ Hub | HUB-02 |

---

## 7. Finance — interakcje

### SCR-FIN-01
| ◆ (decyzja mock) | settle → Hub lub self |
| ○ Transfery | XFR-01 lub XFR-03 (mode) |
| Empty CTA | ○ Transfery / Hub |
| Loading LOD-007 | → default |

---

## 8. Stany — jak przełączać w prototypie

| Mechanizm | Użycie |
| --------- | ------ |
| Start points / Modes A–H | scenariusze Owner |
| Component variants | default/loading/empty/error/disabled |
| Overlay frames | Goal · Modal · Toast |
| Prototype connections | wyłącznie z tabel FLOW-MAP §9 |

**Double-submit:** Primary w loading = disabled hotspot (brak drugiego linku).

---

## 9. Desktop ↔ Mobile parity

| Interakcja | Desktop | Mobile | Parity |
| ---------- | ------- | ------ | ------ |
| Hub ◆ | same target | same | ✓ |
| Match Path | same sequence | same | ✓ |
| Nav domen | rail | bottom 5 | ✓ targets |
| Breadcrumb | text links | Back chevron | ✓ powrót |
| Modal soft-lock | center modal | bottom sheet | ✓ CTA |
| Primary | auto width | full-width ≥44 | ✓ 1 Primary |
| Secondary Hub | row | wrap 2+3 | ✓ ≤5 |

**Różnice dozwolone:** layout chrome, hero `HERO-001-M`, sheet vs modal.  
**Zakazane:** inny target Primary · pominięcie Goal/Post na mobile.

---

## 10. Scenariusze błędów (mock)

| ID | Trigger w prototypie | UI | Next |
| -- | -------------------- | -- | ---- |
| ERR-01 | Tunnel variant error | copy + ◆ Retry | MCH-01 default |
| ERR-02 | Live reconnect variant | strip under chip | zostaje Live |
| ERR-03 | Accept fail | Toast + modal | Anuluj→XFR-02 |
| ERR-04 | Trening settle fail | Toast | TRN-01 |
| ERR-05 | Generic | Toast SYS-05 | bieżący ekran |

Copy: język gracza · bez żargonu silnika.

---

## 11. Scenariusze soft-lock (mock)

| ID | Trigger | UI | Exit |
| -- | ------- | -- | ---- |
| SL-01 | Nav Trening locked | TRN-02 lub SYS-04 | ○ Hub |
| SL-02 | Nav/Secondary Transfery | XFR-03 lub SYS-04 | ○ Hub |
| SL-03 | Hub Secondary locked | SYS-04 | Wróć |
| SL-04 | EARLY locked Secondary | SYS-04 | Wróć |

Źródło „dlaczego”: fixture string — **nie** nowa reguła produktowa w UI.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Interaction specs P0 |
