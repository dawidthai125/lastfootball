# LFE-UI-IMPL-06A — PLAN

**EPIC:** LFE-UI-IMPL-06A  
**Etap:** DESKTOP HUB LAYOUT & NAVIGATION UX FIX  
**Data:** 2026-07-29  
**Wejście:** CONTENT-PASS-01 PASS (`50ddf1a`) · Owner Change Request (ręczny przegląd prod)

---

## 0. Cel

Poprawić odbiór desktop Hub + czytelność icon rail **bez** zmian: logiki · IA · World Art · Design System tokenów · Visual DNA.

---

## 1. AUDYT (przyczyna → skutek)

### 1.1 Porównanie Hi-Fi ↔ kod ↔ odczucie prod

| Obszar           | Hi-Fi / DS                                            | Kod dziś                                                                | Efekt UX na prod                              |
| ---------------- | ----------------------------------------------------- | ----------------------------------------------------------------------- | --------------------------------------------- |
| Nav desktop      | Rail **80px** · NavItem ma **label** (muted)          | Default `navCollapsed=true` · label tylko przy expand · `title=` native | Ikony bez czytelnych nazw; tooltip z OS delay |
| Main             | **fluid** · Hero full szerokość kontentu              | `.lf-hub { max-width: 42rem }` (~672px)                                 | Pusty pas po prawej na szerokim monitorze     |
| LocationHero Hub | wariant **full** · atmosfera; Decision > Hero         | `max-height: 220/280px` + aspect 21/9                                   | Hero „pasek” — za słaby jako miejsce gabinetu |
| Decision / mecz  | Sprawa/VS > ◆ Primary > Secondary                     | Decision w wąskim 42rem stack                                           | Next Match słabo wyeksponowany na desktop     |
| Context          | 1 linia / bez KPI wall · Desktop Context ~8–10 kolumn | Club + Secondary + status w wąskiej kolumnie                            | Poczucie pustki, nie „gabinetu”               |
| Mobile           | Bottom nav + labels                                   | Bez zmian w tym EPICu                                                   | Parity do zachowania                          |

### 1.2 Werdykt przyczyn

1. **Puste prawo:** nie brak assetów — **sztuczny `max-width: 42rem`** Huba wbrew „Main fluid” / grid ≥1200.
2. **Ikony bez sensu:** rail 80px jest **zgodny z Hi-Fi**, ale brakuje warstwy labeli przy collapsie; native `title` ≠ instant tooltip.
3. **Hero za niski:** wariant `full` **niedoszacowany** względem „Hero pełna szerokość” (DS §3) — korekta wysokości w limicie tokenów, bez zmiany assetów.
4. **Next Match:** hierarchia copy OK; brakuje **szerokości + stage Decision+Primary** na desktop.

### 1.3 Korekta projektu (zgodna z World Art / DS)

| Zmiana                                                    | Uzasadnienie                                                       |
| --------------------------------------------------------- | ------------------------------------------------------------------ |
| Instant CSS tooltip na rail                               | Domknięcie Hi-Fi „label” przy 80px bez zmiany IA / szerokości rail |
| Hub `max-width` desktop ~68–72rem + `margin-inline: auto` | Fluid + wyśrodkowanie; bez rozciągania kart na 100vw               |
| Hero desktop wyższy (~320–420)                            | Korekta wariantu full; Decision nadal król                         |
| Grid: Decision+Primary · Club\|Akcje                      | Lepsze wypełnienie szerokości bez KPI wall                         |
| Mobile CSS bez regresji                                   | Breakpoint ≥768 / ≥1024 only                                       |

**Nie robimy:** default expand nav 160px (zmieniałby chrome Hi-Fi 80), nowych kolorów/fontów, nowych WA, right rail na Hubie.

---

## 2. Zakres implementacji

1. `LeftNavigation` — `data-lf-tooltip` + CSS instant tooltip (collapsed); expanded bez tooltip clutter
2. `hub-decision.css` + lekki markup wrapperów w `EarlyClubHub`
3. Testy regresji shell/hub layout
4. Docs NOTES + TEST-PLAN

---

## 3. DoD / Quality Gate

- [x] Tooltip natychmiastowy dla wszystkich ikon menu (collapsed)
- [x] Desktop Hub wykorzystuje szerokość · optycznie wyśrodkowany
- [x] Hero wyeksponowany (nie „kilkaset px pasek”)
- [x] Brak ogromnych pustych przestrzeni
- [x] Mobile bez regresji
- [x] typecheck · test · build · CI GREEN

---

## Historia

| Wersja | Data       | Opis                          |
| ------ | ---------- | ----------------------------- |
| 0.1.0  | 2026-07-29 | Audit + plan UX fix           |
| 1.0.0  | 2026-07-29 | Implementacja + DoD zamknięte |
