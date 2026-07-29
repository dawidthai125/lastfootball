# LFE-UI-PROTO-01 — PROTOTYPE SPEC

**EPIC:** LFE-UI-PROTO-01  
**Etap:** INTERACTIVE PROTOTYPE  
**Status:** DRAFT — specyfikacja prototypu (bez React · HTML · CSS · bez logiki biznesowej)  
**Data:** 2026-07-29  

> Hi-Fi: [`LFE-UI-HIFI-01-HIFI-SCREENS.md`](./LFE-UI-HIFI-01-HIFI-SCREENS.md)  
> Components / States: [`…-COMPONENT-SPECS.md`](./LFE-UI-HIFI-01-COMPONENT-SPECS.md) · [`…-STATE-SPECS.md`](./LFE-UI-HIFI-01-STATE-SPECS.md)  
> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> Handoff: [`LFE-WORLD-ART-05-UI-HANDOFF.md`](./LFE-WORLD-ART-05-UI-HANDOFF.md)  
> Flows: [`LFE-UI-PROTO-01-FLOW-MAP.md`](./LFE-UI-PROTO-01-FLOW-MAP.md)  
> Interactions: [`LFE-UI-PROTO-01-INTERACTION-SPECS.md`](./LFE-UI-PROTO-01-INTERACTION-SPECS.md)  
> Review: [`LFE-UI-PROTO-01-UX-REVIEW.md`](./LFE-UI-PROTO-01-UX-REVIEW.md)  

---

## 0. Cel prototypu

Walidacja **doświadczenia użytkownika** P0 (decision-first §16 · Hi-Fi · IA) na klikanych ścieżkach — **bez** silnika gry, API, persistencji i production UI.

| Jest | Nie jest |
| ---- | -------- |
| Mapa ekranów + hotspots + stany | Aplikacja LastFootball |
| Mock copy / fixture data | Reguły transferów / match sim |
| Desktop + Mobile Variant A | Nowe assety / nowy styl |
| Soft-lock i error jako sceny | Real `resolveNavAccess` kod |

---

## 1. Forma dostarczenia

| Preferencja | Opis |
| ----------- | ---- |
| **Primary** | Figma / FigJam Prototype (klik) z frame’ami Hi-Fi + overlays |
| **Alt** | Miro / PDF annotated click-map (gorszy do §16 motion) |
| **Zakaz** | React app · HTML/CSS prototype w repo · generowanie WA |

**Nomenklatura frame’ów:** `PROTO-{SCR-ID}-{viewport}-{state}`  
Przykład: `PROTO-SCR-HUB-01-D-default` · `PROTO-SCR-MCH-04-M-live`

| Viewport | Szerokość frame |
| -------- | --------------- |
| **D** Desktop | 1280–1440 |
| **M** Mobile | 390 (+ safe area bottom nav) |

---

## 2. Zakres ekranów P0 (prototype nodes)

### Shell
| Node | SCR / HF | Desktop | Mobile |
| ---- | -------- | ------- | ------ |
| Shell chrome | HF-SHELL-01/02 | ✓ rail | ✓ bottom 5 |
| Soft-lock modal | SCR-SYS-04 | ✓ | ✓ sheet |
| Toast error | SCR-SYS-05 | ✓ | ✓ |
| Loading desk | SCR-SYS-02 + `LOD-004` | ✓ | ✓ |

### Hub
| Node | ID | Sceny |
| ---- | -- | ----- |
| Matchday | SCR-HUB-01 | default · loading · Secondary locked |
| Idle / po meczu | SCR-HUB-02 | default |
| EARLY_CLUB | SCR-HUB-04 | default · Secondary soft-lock |

### Match Path
| Node | ID | Sceny |
| ---- | -- | ----- |
| Tunnel | SCR-MCH-01 | default · loading `LOD-002` · error retry |
| VS | SCR-MCH-02 | default |
| Pre-match | SCR-MCH-03 | default · Primary disabled (incomplete) |
| Live | SCR-MCH-04 | live · reconnect strip |
| Goal overlay | SCR-MCH-05 | enter/hold/exit |
| Final whistle | SCR-MCH-07 | default |
| Post-match | SCR-MCH-08 | default |

### Squad · Training · Transfers · Finance
| Node | ID | Sceny obowiązkowe |
| ---- | -- | ----------------- |
| Kadra lista | SCR-SQD-01 | default · empty `EMP-002` |
| Gracz detal | SCR-SQD-03 | default |
| Skład XI | SCR-SQD-04 | default · warn XI |
| Trening | SCR-TRN-01 | default · settle loading |
| Trening lock | SCR-TRN-02 | soft-lock |
| Transfer inbox | SCR-XFR-01 | default · (empty P1 opcjonalny) |
| Oferta | SCR-XFR-02 | default · confirm modal Accept |
| Okno zamknięte | SCR-XFR-03 | soft-lock |
| Finanse | SCR-FIN-01 | default · empty `EMP-003` · loading `LOD-007` |

**Poza P0 (nie budować):** Inbox Hub empty ILL-001 · Academy · Medical · Settings · HT · More menu pełne.

---

## 3. Fixture data (mock — stałe w prototypie)

| Fixture | Wartość przykładowa | Uwaga |
| ------- | ------------------- | ----- |
| Klub | „Night FC” + crest `CRS-*`/`BRD-003` | 1 clubtint |
| Faza | Matchday / Idle / EARLY | przełącznik sceny, nie silnik |
| Kasa TopBar | `€ 1,24 mln` | 1 liczba, muted |
| Sprawa Hub-01 | „Derby — jutro 20:00” | 1 sprawa |
| VS | Night FC 0–0 Rival | dialekt Event |
| Live score | 1–0 67' | scarlet chip |
| Oferta XFR | Kupno · 3 wiersze meta | bez wall ofert |
| Soft-lock copy | „Okno transferowe zamknięte · wraca 1 sierpnia” | z mock resolvera |

**Zakaz w copy:** lorem na assetach · stack trace · mid-season KPI w EARLY.

---

## 4. Tryby scenariuszy (prototype modes)

Prototyp ma **przełącznik scen** (Figma variants / start points), nie runtime:

| Mode ID | Start | Cel walidacji |
| ------- | ----- | ------------- |
| `MODE-A` | HUB-01 Matchday | Happy path meczu → HUB-02 |
| `MODE-B` | HUB-02 Idle | Daily Secondary loop |
| `MODE-C` | HUB-04 EARLY | Early bez mid-season clutter |
| `MODE-D` | Soft-lock Training | TRN-02 / SYS-04 |
| `MODE-E` | Soft-lock Transfers | XFR-03 |
| `MODE-F` | Empty Squad / Finance | EMP-* CTA |
| `MODE-G` | Live reconnect / Tunnel error | resilience UX |
| `MODE-H` | Mobile mirror MODE-A | D↔M parity |

---

## 5. Reguły chrome w prototypie

| Kontekst | Desktop Nav | Mobile Bottom | TopBar Live |
| -------- | ----------- | ------------- | ----------- |
| Hub / domeny | on | on | off |
| Tunnel MCH-01 | **off** (immersive) | **off** | off |
| Live MCH-04 | limited / off (jak Hi-Fi) | limited | **on** scarlet |
| Overlays MCH-05/07 | chrome dim | j.w. | — |
| Soft-lock modal | chrome visible pod | j.w. | — |

Flood wash `FLD-003`: **tylko** HUB-01 matchday i Live — nie globalnie.

---

## 6. Mapowanie Hi-Fi → Prototype frames

| Hi-Fi | Prototype node | Hotspots kluczowe |
| ----- | -------------- | ----------------- |
| HF-SHELL-* | chrome wrapper | NavItem · BottomNav · crest home→Hub |
| HF-HUB-01 | HUB-01 | ◆ Match · ≤5 Secondary · SoftLink |
| HF-HUB-02 | HUB-02 | ◆ Primary (Kadra/Trening) · Secondary |
| HF-HUB-04 | HUB-04 | ◆ · locked Secondary→SYS-04 |
| HF-MCH-01…08 | Match Path | zob. FLOW-MAP |
| HF-SQD-* | Squad | row→detal · ○ Trening · XI z Match |
| HF-TRN-* | Training | ◆ settle · lock→TRN-02 |
| HF-XFR-* | Transfers | oferta→Accept modal · lock→XFR-03 |
| HF-FIN-01 | Finance | ○ Transfery · empty CTA |

---

## 7. Quality bar prototypu (przed UX Review)

1. Każdy Primary prowadzi do zdefiniowanego next frame.  
2. Każdy Soft-lock ma wyjście Hub/Wróć.  
3. Brak ekranu „ślepego” bez Back/Hub (poza overlay auto-dismiss).  
4. Assety wyłącznie ID z World Art.  
5. 1 Primary na frame decyzji.  
6. Desktop i Mobile = te same przejścia (różny chrome).  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Prototype Spec P0 |
