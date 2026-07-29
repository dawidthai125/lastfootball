# LFE-UI-WIREFRAMES-01 — INFORMATION ARCHITECTURE

**EPIC:** LFE-UI-WIREFRAMES-01  
**Etap:** INFORMATION ARCHITECTURE & WIREFRAMES  
**Status:** DRAFT — low fidelity · bez UI kodu · bez Hi-Fi  
**Data:** 2026-07-29  

> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> Mapa: [`LFE-UI-SKIN-01-COMPONENT-MAP.md`](./LFE-UI-SKIN-01-COMPONENT-MAP.md)  
> Ekrany: [`LFE-UI-SKIN-01-SCREEN-INVENTORY.md`](./LFE-UI-SKIN-01-SCREEN-INVENTORY.md)  
> Handoff: [`LFE-WORLD-ART-05-UI-HANDOFF.md`](./LFE-WORLD-ART-05-UI-HANDOFF.md)  
> Flows: [`LFE-UI-WIREFRAMES-01-FLOWS.md`](./LFE-UI-WIREFRAMES-01-FLOWS.md)  
> Wireframes: [`LFE-UI-WIREFRAMES-01-WIREFRAMES.md`](./LFE-UI-WIREFRAMES-01-WIREFRAMES.md)  
> Checklist: [`LFE-UI-WIREFRAMES-01-CHECKLIST.md`](./LFE-UI-WIREFRAMES-01-CHECKLIST.md)  
> UX kontrakt: [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16  

**Zakres tego dokumentu:** P0 — Shell · Hub · Match Path · Squad · Training · Transfers · Finance.

---

## 0. Zasady IA

1. **Decision-first** — Hero → Decision → Context (§16.2).  
2. **Jedna sprawa / jedno pytanie** na first viewport.  
3. **Hub = router dnia**, nie dashboard KPI.  
4. **Daily loop:** Hub → Trening → Kadra → Transfery → Finanse → Match → Hub.  
5. **Lokacja świata** nad panelem (DNA Z1) — IA nazywa miejsce, nie „moduł CRM”.  
6. **Unlock / soft-lock** tylko przez istniejące `resolveNavAccess` — IA nie wymyśla reguł.  
7. **Kadra ≠ Skład** (§16.6).

---

## 1. Mapa nawigacji (sitemap P0)

```
App
├── Shell (TopBar · Nav · Status)
├── /hub                          Hub (router)
├── /training                     Trening
├── /squad                        Kadra
│   └── /squad/:id                Gracz detal
├── /transfers                    Transfery
│   └── /transfers/:id            Oferta detal
├── /finance                      Finanse
├── Match path (niekoniecznie 1 URL)
│   ├── Tunnel / First Match
│   ├── Kick-Off / VS
│   ├── Pre-match (Skład XI)
│   ├── Live
│   ├── Goal overlay
│   ├── Final whistle
│   └── Post-match
├── Soft-lock modal (global)
└── Loading / Toast (global)
```

**Mobile Variant A (bottom nav):** Hub · Trening · Kadra · Transfery · Więcej  
(Terminarz / Mecz / Finanse często przez Hub Secondary lub Więcej — bez zmiany semantyki §16.)

---

## 2. Hierarchia treści (wspólna)

| Warstwa | Zawartość | Max first viewport |
| ------- | --------- | ------------------ |
| **A. Chrome** | Crest · kasa soft · status sesji · nav | Thin — bez KPI wall |
| **B. Hero** | Kontekst lokacji / wydarzenia | 1 blok |
| **C. Decision** | Pytanie lub sprawa + **1 Primary** | 1 Primary · Secondary ≤5 (Hub) |
| **D. Context** | Lista / tabela / historia | Pod foldem lub scroll |
| **E. Soft-links** | Sąsiedzi pętli | Muted |

---

## 3. Shell — IA

| Element | Rola IA | Zawartość |
| ------- | ------- | --------- |
| **TopBar** | Tożsamość + kontekst sesji | Crest/club · label dnia/fazy · kasa (1 liczba) · opcjonalnie Live chip |
| **Status bar** | Stan nieblokujący | Faza Hub / soft-lock hint / sync — nie druga nav |
| **Nav desktop** | Lokacje P0 + More | Ikony World Art `ICO-*` · active = bieżąca lokacja |
| **Nav mobile** | Variant A | 5 slotów |
| **Breadcrumbs** | Orientacja głębokości | Tylko poziomy ≥2 (np. Kadra › Gracz · Transfery › Oferta). Hub = **bez** breadcrumb |
| **Main** | Hero → Decision → Context | Pełna szerokość treści |

**Zakaz w Shell:** równe karty KPI · drugi gold CTA · rozbudowany right-rail na Hubie.

---

## 4. Hub — IA

| Pole | Wartość |
| ---- | ------- |
| **Cel użytkownika** | Wiedzieć „co teraz” i wejść w jedną ścieżkę |
| **First viewport** | Sprawa dnia / najbliższy mecz / fallback Kadra |
| **Primary** | Event → Match path **lub** fallback Kadra |
| **Secondary (≤5)** | Trening · Kadra · Transfery · Finanse · Terminarz |
| **Context** | Max 1 linia meta (Okno · Kasa) — nie wall |
| **Ekrany** | SCR-HUB-01 · 02 · 04 (P0) |

---

## 5. Match Path — IA

| Etap | Cel | Ekran | Wyjście |
| ---- | --- | ----- | ------- |
| Tunnel / First | Wejść w mecz (onboarding) | SCR-MCH-01 | Kick-Off |
| Kick-Off / VS | Potwierdzić start | SCR-MCH-02 | Pre-match / Live |
| Pre-match | Skład / checklist | SCR-MCH-03 · SCR-SQD-04 | Live |
| Live | Obserwować + feedback | SCR-MCH-04 · 05 | HT / FT |
| Final | Zamknąć emocję | SCR-MCH-07 | Post-match |
| Post-match | Zrozumieć wynik → Hub | SCR-MCH-08 | Hub |

**Hierarchia Live:** Live chip + wynik > zdarzenia > statystyki głębokie (Context).

---

## 6. Squad — IA

| Poziom | Cel | Treść |
| ------ | --- | ----- |
| Lista Kadra | Przegląd + decyzja dnia | Pytanie (np. gotowość) · Primary · lista graczy |
| Detal gracza | Zrozumieć zawodnika | Context (atrybuty) · soft-link Trening |
| Skład XI | Ustawić XI przed meczem | Osobny dialekt Event — nie mylić z listą Kadry |

---

## 7. Training — IA

| Stan | First viewport |
| ---- | -------------- |
| Odblokowany | Pytanie dnia + 1 Primary (przeprowadź sesję) |
| Soft-lock | SoftLockState + wyjaśnienie unlock |
| Po sesji | Potwierdzenie / empty „jutro” + soft-link |

---

## 8. Transfers — IA

| Poziom | Cel |
| ------ | --- |
| Inbox | Najbliższa oferta / sprawa okna |
| Detal | Accept / Reject (+ kontroferta P1) |
| Okno zamknięte | Soft-lock — nie pusty CRM |

**Context:** kolejka ofert pod Decision — nie równe karty KPI.

---

## 9. Finance — IA

| First viewport | Jedno pytanie o kasę / priorytet wydatku |
| Context | Kategorie envelope/thin — browse |
| Soft-link | → Transfery |

Bez fintech dashboard (wiele równych wykresów na first viewport).

---

## 10. Macierz ekranów P0 (IA)

| ID | Cel użytkownika | Główne akcje | Komponenty | World Art | P | Powiązania |
| -- | --------------- | ------------ | ---------- | --------- | - | ---------- |
| SCR-SYS-01 | Wejść do gry | Czekaj / start | LoadingFrame | `LOD-001` · `BRD-003` | P0 | → Hub / Tunnel |
| SCR-SYS-02 | Przejście trasy | — | LoadingFrame | `LOD-*` | P0 | * |
| SCR-SYS-04 | Zrozumieć blokadę | Zamknij / idź do unlock | SoftLock · Modal | `ICO-020` · `ILL-*` | P0 | Nav |
| SCR-SYS-05 | Feedback | Dismiss | Toast | — | P0 | * |
| SCR-HUB-01 | Decyzja dnia meczowego | Primary Match · Secondary loop | Hero · Decision · Sec×5 | `HERO-001` · `BG-002` · `OFF-*` | P0 | → Match · loop |
| SCR-HUB-02 | Decyzja idle / po meczu | Primary / Secondary | j.w. | j.w. | P0 | → loop |
| SCR-HUB-04 | Early club bez mock KPI | Primary | Decision | `HERO-001` | P0 | → Match/Kadra |
| SCR-MCH-01 | Rozpocząć First Match | Primary dalej | Hero · Primary | `HERO-002` · `LOD-002` | P0 | → MCH-02 |
| SCR-MCH-02 | Potwierdzić VS | Primary start | Hero · Score · Decision | `HERO-003` · `MOM-001` | P0 | → MCH-03/04 |
| SCR-MCH-03 | Checklist pre-match | Dalej / Skład | Decision · SoftLink | `ICO-028` | P0 | ↔ SQD-04 |
| SCR-SQD-04 | Ustawić XI | Zapisz · Dalej | Decision · PlayerRow | `HERO-004` | P0 | → Live |
| SCR-MCH-04 | Śledzić mecz | (ograniczone) | Live chip · Context | `ICO-016` · `SUP-001` | P0 | → MCH-05/07 |
| SCR-MCH-05 | Odczytać gola | Auto / dismiss | MomentOverlay | `MOM-002` | P0 | → Live |
| SCR-MCH-07 | Zamknąć mecz | Dalej | Moment · Decision | `MOM-003` | P0 | → MCH-08 |
| SCR-MCH-08 | Podsumowanie → Hub | Primary Hub | Decision · Context | `SUP-001` · `SCF-003` | P0 | → Hub |
| SCR-SQD-01 | Zarządzać kadrą | Primary · open player | Hero · List | `HERO-004` · `SHT-*` | P0 | → SQD-03 · TRN |
| SCR-SQD-03 | Zobaczyć gracza | Wstecz · soft Trening | Decision · Context | `SHT-001/006` | P0 | ← SQD-01 |
| SCR-TRN-01 | Trenować dziś | Primary sesja | Hero · Decision | `HERO-006` · `TRG-*` | P0 | → Hub/Kadra |
| SCR-TRN-02 | Zrozumieć soft-lock | Wróć / Hub | SoftLock | `ILL-002` | P0 | → Hub |
| SCR-XFR-01 | Przejrzeć oferty | Open oferta | Hero · List | `HERO-005` · `TRN-*` | P0 | → XFR-02 |
| SCR-XFR-02 | Accept/Reject | Primary/Secondary | Decision · Modal | `TRN-001…003` | P0 | → XFR-01 · FIN |
| SCR-XFR-03 | Okno zamknięte | Wróć | SoftLock | `ILL-003` | P0 | → Hub |
| SCR-FIN-01 | Zrozumieć kasę | Primary / browse | Hero · Decision · List | `HERO-007` · `FIN-*` | P0 | ↔ XFR |

---

## 11. Poza zakresem (P1+)

Inbox · Academy · Medical · Settings · Liga · Stadion · Zarząd — w inventory; **nie** w wireframes P0 tego EPICu.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | IA P0 · sitemap · macierz ekranów |
