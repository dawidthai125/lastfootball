# LFE-UI-IMPL-06A — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-06A  
**Data:** 2026-07-29  
**Wejście:** CONTENT-PASS-01 `50ddf1a` · Owner Change Request

---

## 0. Audyt → decyzja

| Problem prod               | Przyczyna w kodzie                | Rozwiązanie                                  |
| -------------------------- | --------------------------------- | -------------------------------------------- |
| Pusty pas po prawej        | `.lf-hub { max-width: 42rem }`    | Desktop `68–72rem` + `margin-inline: auto`   |
| Ikony bez nazw             | Rail 80px OK · brak instant label | CSS `data-lf-tooltip` · `transition: none`   |
| Hero „pasek”               | `max-height: 280px` (desktop)     | 300–460px / aspect 2.35 — wariant full       |
| Next Match słaby           | wąski stack Decision → Primary    | `.lf-hub__decision-stage` grid Decision \| ◆ |
| Twój klub / akcje w pustce | linear stack w 42rem              | `.lf-hub__body` grid Club \| Akcje+status    |

**Hi-Fi:** rail 80px **zachowany**. Korekta to **domknięcie label** + **fluid main**, nie nowy DS.

---

## 1. Pliki

| Plik                                   | Zmiana                                                              |
| -------------------------------------- | ------------------------------------------------------------------- |
| `components/layout/left-nav.css`       | Instant tooltip collapsed                                           |
| `components/layout/LeftNavigation.tsx` | `data-lf-tooltip` · `data-nav-collapsed` · bez native `title` delay |
| `components/hub/hub-decision.css`      | Szerokość · hero · grid                                             |
| `components/hub/EarlyClubHub.tsx`      | Wrappery `decision-stage` / `body` / `actions`                      |
| `styles/impl-06a.test.ts`              | Guardy layout + tooltip                                             |

**Bez zmian:** tokens kolorów/fontów · WA assety · unlock · DTO · IA routes · MobileNav.

---

## 2. Mobile

Breakpointy ≥768 / ≥1200 only. Stack Decision→Primary→Club→Secondary bez zmian zachowania.

---

## 3. DoD

| Gate                         | Status |
| ---------------------------- | ------ |
| Tooltip wszystkie ikony rail | ✓      |
| Desktop szerokość + center   | ✓      |
| Hero wyeksponowany           | ✓      |
| Mobile bez regresji          | ✓      |
| typecheck · test · CI        | (ship) |

---

## Historia

| Wersja | Data       | Opis                     |
| ------ | ---------- | ------------------------ |
| 0.1.0  | 2026-07-29 | Notes desktop Hub UX fix |
