# LFE-UI-PROTOTYPE-VALIDATION-01 — FIGMA BUILD

**EPIC:** LFE-UI-PROTOTYPE-VALIDATION-01  
**Etap:** FIGMA CLICKABLE PROTOTYPE  
**Data:** 2026-07-29  
**Status:** BUILT — klikalny prototyp P0  

> Spec: [`LFE-UI-PROTO-01-PROTOTYPE-SPEC.md`](./LFE-UI-PROTO-01-PROTOTYPE-SPEC.md)  
> Flows: [`LFE-UI-PROTO-01-FLOW-MAP.md`](./LFE-UI-PROTO-01-FLOW-MAP.md)  
> Interactions: [`LFE-UI-PROTO-01-INTERACTION-SPECS.md`](./LFE-UI-PROTO-01-INTERACTION-SPECS.md)  
> Playtest: [`LFE-UI-PROTOTYPE-VALIDATION-01-PLAYTEST-PLAN.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-PLAYTEST-PLAN.md)  
> Issues: [`LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md)  
> Gate: [`LFE-UI-PROTOTYPE-VALIDATION-01-GATE.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-GATE.md)  

---

## 0. Plik Figma

| Pole | Wartość |
| ---- | ------- |
| **URL** | https://www.figma.com/design/mgNprLAGRgxrq7JrvZwda9/LFE-UI-PROTOTYPE-VALIDATION-01 |
| **fileKey** | `mgNprLAGRgxrq7JrvZwda9` |
| **Nazwa** | LFE-UI-PROTOTYPE-VALIDATION-01 |
| **Plan** | Starter (max **3** pages) |

### Strony

| Page | Rola |
| ---- | ---- |
| `00 · START · Modes` | Indeks + instrukcja playtestu |
| `01 · Desktop` | Frame’y D + Mode Launcher A–G + Flow starts |
| `02 · Mobile` | Frame’y M + Mode Launcher H + Flow starts |

**Uwaga Figma:** `NAVIGATE` działa tylko **na tej samej stronie** — Modes są na launchers Desktop/Mobile, nie cross-page z START.

---

## 1. Jak uruchomić prototyp

1. Otwórz plik → strona **`01 · Desktop`** lub **`02 · Mobile`**.  
2. Present / Prototype (**▶**).  
3. Wybierz Flow: **Mode Launcher** / **MODE-A Matchday** / **MODE-H Match Path**.  
4. Klikaj hotspoty `HS · Primary` · `HS · Secondary · *` · `HS · Nav · *` · `HS · Row · *` · Crest.

---

## 2. Kolejność buildu (wykonana)

| # | Zakres | Status |
| - | ------ | ------ |
| 1 | Application Shell (TopBar · Nav rail / Bottom) | ✓ |
| 2 | Match Path Pre · Live · Post | ✓ D+M |
| 3 | Hub Matchday / Idle / EARLY | ✓ D+M |
| 4 | Squad (lista · detal D · XI) | ✓ (detal M = SOFT) |
| 5 | Training open + soft-lock | ✓ D+M |
| 6 | Transfers inbox · oferta D · modal · lock | ✓ (oferta M = SOFT) |
| 7 | Finance default + empty | ✓ D (+ M default) |
| 8 | Empty states | ✓ SQD/FIN D |
| 9 | Error states | ✓ Tunnel error · Live reconnect D |
| 10 | Soft-lock | ✓ TRN-02 · XFR-03 · SYS-04 D+M |

---

## 3. Inwentarz frame’ów

### Desktop (`01 · Desktop`) — 27 frames

| Frame | Rola |
| ----- | ---- |
| `DESKTOP · MODE LAUNCHER` | Modes A–G |
| `PROTO-SCR-HUB-01-D-default` | Matchday |
| `PROTO-SCR-HUB-02-D-default` | Idle |
| `PROTO-SCR-HUB-04-D-default` | EARLY |
| `PROTO-SCR-MCH-01-D-default` | Tunnel |
| `PROTO-SCR-MCH-01-D-error` | Tunnel ERR-01 |
| `PROTO-SCR-MCH-02-D-default` | VS |
| `PROTO-SCR-MCH-03-D-default` | Pre ready |
| `PROTO-SCR-MCH-03-D-incomplete` | Pre Primary disabled |
| `PROTO-SCR-SQD-04-D-default` | XI |
| `PROTO-SCR-MCH-04-D-live` | Live |
| `PROTO-SCR-MCH-04-D-reconnect` | Live ERR-02 |
| `PROTO-SCR-MCH-05-D-default` | Goal overlay |
| `PROTO-SCR-MCH-07-D-default` | Final |
| `PROTO-SCR-MCH-08-D-default` | Post → Hub |
| `PROTO-SCR-SQD-01-D-default` | Kadra |
| `PROTO-SCR-SQD-01-D-empty` | Empty EMP-002 |
| `PROTO-SCR-SQD-03-D-default` | Detal |
| `PROTO-SCR-TRN-01-D-default` | Trening |
| `PROTO-SCR-TRN-02-D-default` | Soft-lock |
| `PROTO-SCR-XFR-01-D-default` | Inbox |
| `PROTO-SCR-XFR-02-D-default` | Oferta |
| `PROTO-SCR-XFR-02-D-modal` | Confirm Accept |
| `PROTO-SCR-XFR-03-D-default` | Okno zamknięte |
| `PROTO-SCR-FIN-01-D-default` | Finanse |
| `PROTO-SCR-FIN-01-D-empty` | Empty EMP-003 |
| `PROTO-SCR-SYS-04-D-default` | Soft-lock global |

### Mobile (`02 · Mobile`) — 19 frames

| Frame | Rola |
| ----- | ---- |
| `MOBILE · MODE LAUNCHER` | MODE-H + mirrors |
| Hub 01/02/04 | ✓ |
| Match Path 01→08 (+ XI) | ✓ |
| SQD-01 · TRN-01/02 · XFR-01/03 · FIN-01 · SYS-04 | ✓ |

---

## 4. Hotspoty — konwencja nazw

| Prefix | Znaczenie |
| ------ | --------- |
| `HS · Primary` | Jedyny gold CTA decyzji |
| `HS · Secondary · {label}` | Secondary / soft |
| `HS · Nav · {Hub\|Trn\|Sqd\|Xfr\|Fin}` | Shell nav |
| `HS · Row · {…}` | Lista → detal / oferta |
| `HS · Crest→Hub` | Crest home |
| `LAUNCH · MODE-*` | Start scenariusza |

**Audyt reactions (build):** Desktop **~147** · Mobile **~96**.

---

## 5. Mode → start frame

| Mode | Start | Page |
| ---- | ----- | ---- |
| A | HUB-01-D | Desktop |
| B | HUB-02-D | Desktop |
| C | HUB-04-D | Desktop |
| D | TRN-02-D | Desktop |
| E | XFR-03-D | Desktop |
| F | SQD-01-D-empty | Desktop |
| G | MCH-01-D-error | Desktop |
| H | HUB-01-M | Mobile |

Flow starts w Figma: `MODE-A Matchday` · `MODE-B Idle` · `MODE-G Error` · `Mode Launcher` · `MODE-H Match Path` · `Mobile Mode Launcher`.

---

## 6. Zgodność wizualna (fidelity)

| Warstwa | Stan w pliku |
| ------- | ------------ |
| Tokeny kolorów Night Pitch Office | ✓ void `#07111C` · brass `#C9A85C` · pitch · scarlet Live |
| Hierarchia §16 Hero→Decision→Context | ✓ |
| 1 Primary / Secondary ≤5 | ✓ |
| World Art PNG | **Częściowo:** upload `HERO-001` office D/M + tunnel; apply do wszystkich hero = polish (limit MCP) |
| Typo Archivo / Source Sans | **SOFT:** Inter (Starter substitute) |
| Ikony ICO-* stroke | **SOFT:** ellipses placeholder |

---

## 7. Poza zakresem (świadomie)

- React / HTML / CSS / logika biznesowa  
- Nowe assety (tylko rejestr WA)  
- P1: HT · Academy · Medical · Hub empty ILL-001  
- Cross-page Mode buttons na START (limit API NAVIGATE)  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Figma Build · fileKey mgNprLAGRgxrq7JrvZwda9 |
