# LFE-WORLD-ART-02 — PRODUCTION BACKLOG

**EPIC:** LFE-WORLD-ART-02  
**Etap:** PLAN (backlog produkcji)  
**Status:** DRAFT — kolejka pracy studia (bez generowania obrazów)  
**Data:** 2026-07-28  

> Backlog jobów artystycznych powiązany z paczkami WORLD-01…12.  
> Plan: [`LFE-WORLD-ART-02-PRODUCTION-PLAN.md`](./LFE-WORLD-ART-02-PRODUCTION-PLAN.md).  
> Quality: [`LFE-WORLD-ART-02-QUALITY-GUIDE.md`](./LFE-WORLD-ART-02-QUALITY-GUIDE.md).  
> ID assetów: [`LFE-CONCEPT-ART-01-ASSET-LIBRARY.md`](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md).

---

## 0. Legenda

| Pole | Wartość |
| ---- | ------- |
| **Status job** | `BACKLOG` · `READY` · `IN_PROGRESS` · `IN_REVIEW` · `APPROVED` · `BLOCKED` |
| **Wave** | 0…5 (Production Plan §1.3) |
| **Priorytet** | P0 / P1 / P2 / P3 |
| **Est.** | S ≤0.5d · M ~1d · L ~2–3d · XL multi-day (orientacja AI+review) |

Wszystkie joby poniżej startują jako **`BACKLOG`**.  
`READY` dopiero po Owner GO na EPIC produkcji obrazów (`LFE-WORLD-ART-03+`).

---

## 1. Kolejność globalna (critical path)

```
W0  WORLD-12 Brand core + Shared materials
      ↓
W1  WORLD-01 Office + WORLD-10 Match Day core (pitch/tunnel/flood)
      ↓
W2  WORLD-04 Locker → WORLD-05 Transfer → WORLD-03 Training + Icons core
      ↓
W3  WORLD-02 Stadium + WORLD-06 Finance + Crest templates expand
      ↓
W4  WORLD-07 Board (+press) · WORLD-08 Medical · WORLD-09 Academy (+scout/analyst jobs)
      ↓
W5  WORLD-10 Moments close · WORLD-11 Supporters
```

---

## 2. Wave 0 — Brand + Shared

### WORLD-12 — Brand Identity

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W12-J01 | Style frames brand (3) CONCEPT | — | P0 | M | BACKLOG | Art Bible GO |
| W12-J02 | LF Monogram foil/mono/inverse | BRD-001 | P0 | M | BACKLOG | J01 |
| W12-J03 | LF Wordmark | BRD-002 | P0 | S | BACKLOG | J02 |
| W12-J04 | LF Shield flat+foil | BRD-003 | P0 | M | BACKLOG | J02 |
| W12-J05 | App icon | BRD-004 | P1 | S | BACKLOG | J04 |
| W12-J06 | Social / OG kit | BRD-005 | P1 | M | BACKLOG | J03–J04 |
| W12-J07 | Crest frame rings | CRS-001 | P0 | M | BACKLOG | J04 |
| W12-J08 | Crest placeholder ghost | CRS-004 | P0 | S | BACKLOG | J07 |
| W12-J09 | Crest Template Pack A (8–12) | CRS-002 | P0 | XL | BACKLOG | J07 |
| W12-J10 | Loading Crest Breath 16:9+9:16 | LOD-001 | P0 | M | BACKLOG | J04 |
| W12-J11 | Prestige badge LF | BDG-005 | P1 | S | BACKLOG | J02 |
| W12-J12 | Marketing brand campaign set (3) | — | P1 | L | BACKLOG | J04+J10 |

### Shared materials bootstrap

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| SHR-J01 | Film grain tile | TEX-001 | P0 | S | BACKLOG | — |
| SHR-J02 | Concrete ash | TEX-002 | P0 | S | BACKLOG | — |
| SHR-J03 | Wet/dry turf tile | GRS-001 | P0 | M | BACKLOG | — |
| SHR-J04 | Line paint SVG | GRS-004 | P0 | S | BACKLOG | — |
| SHR-J05 | Pitch micro grid | PAT-001 | P0 | S | BACKLOG | — |
| SHR-J06 | Void grain BG | BG-001 | P0 | S | BACKLOG | SHR-J01 |
| SHR-J07 | Flood bloom soft/strong | FLD-002 | P0 | M | BACKLOG | — |
| SHR-J08 | Flood corner wash L/R | FLD-003 | P0 | M | BACKLOG | SHR-J07 |
| SHR-J09 | Brass brushed texture | TEX-004 | P1 | S | BACKLOG | W12-J02 |

**DoD Wave 0:** Brand lock APPROVED + shared P0 APPROVED → odblokuj Wave 1.

---

## 3. Wave 1 — Office + Match Day core

### WORLD-01 — Manager Office

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W01-J01 | Moodboard Office | — | P0 | S | BACKLOG | Wave 0 |
| W01-J02 | Hero desk 16:9 + 9:16 | HERO-001 | P0 | L | BACKLOG | J01, SHR |
| W01-J03 | Secondary lamp/chair | OFF-002 related | P0 | M | BACKLOG | J02 |
| W01-J04 | BG wash night/matchday/idle | BG-002 | P0 | M | BACKLOG | J02 |
| W01-J05 | Props: crest stand, window, folders | OFF-001/006/004 | P0 | M | BACKLOG | J02 |
| W01-J06 | Empty inbox spot | ILL-001 | P1 | S | BACKLOG | J05 |
| W01-J07 | Loading desk night | LOD-004 | P1 | M | BACKLOG | J02 |
| W01-J08 | Marketing office key art | — | P0 | M | BACKLOG | J02+W12 |

### WORLD-10 — Match Day (core only)

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W10-J01 | Moodboard Match Day | — | P0 | S | BACKLOG | Wave 0 |
| W10-J02 | Hero murawa low-angle | HERO-003 | P0 | L | BACKLOG | J01, GRS |
| W10-J03 | Hero tunel POV | HERO-002 | P0 | L | BACKLOG | J01, SHR-J02 |
| W10-J04 | BG turf mist | BG-003 | P0 | M | BACKLOG | GRS |
| W10-J05 | BG pitch grid soft | BG-004 | P0 | S | BACKLOG | PAT-001 |
| W10-J06 | BG flood vignette pair | BG-005 | P0 | M | BACKLOG | FLD |
| W10-J07 | BG tunnel gradient | BG-010 | P0 | M | BACKLOG | J03 |
| W10-J08 | Loading tunnel walk | LOD-002 | P0 | M | BACKLOG | J03 |
| W10-J09 | Matchday banner strip | BAN-001 | P0 | M | BACKLOG | J02–J03 |
| W10-J10 | Marketing match night (landing bridge) | — | P0 | L | BACKLOG | J02+W12 |
| W10-J11 | Empty no fixtures | EMP-001 | P1 | S | BACKLOG | J02 |
| W10-J12 | Turf macro loading | LOD-003 | P1 | S | BACKLOG | GRS |

**DoD Wave 1 = Foundation Pack v1** (rekomendowany zakres `LFE-WORLD-ART-03`).

---

## 4. Wave 2 — Daily Club Loop

### WORLD-04 — Locker Room

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W04-J01 | Moodboard | — | P0 | S | BACKLOG | Foundation |
| W04-J02 | Hero kits row | HERO-004 | P0 | L | BACKLOG | J01 |
| W04-J03 | Secondary bench/boots | — | P0 | M | BACKLOG | J02 |
| W04-J04 | BG mesh + fabric tex | BG-006 · TEX-005 | P0 | M | BACKLOG | J02 |
| W04-J05 | Hanger silhouette | SHT-006 | P0 | S | BACKLOG | J02 |
| W04-J06 | Empty locker | EMP-002 | P1 | S | BACKLOG | J05 |
| W04-J07 | Loading kits | — | P1 | M | BACKLOG | J02 |
| W04-J08 | Marketing squad identity | — | P1 | M | BACKLOG | J02 |

### WORLD-05 — Transfer Office

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W05-J01 | Moodboard | — | P0 | S | BACKLOG | Foundation |
| W05-J02 | Hero contract | HERO-005 | P0 | L | BACKLOG | J01 |
| W05-J03 | Secondary stamp/portfolio | TRN-003/004 | P0 | M | BACKLOG | J02 |
| W05-J04 | BG blinds | BG-008 | P0 | M | BACKLOG | J02 |
| W05-J05 | Props pen/sheet/envelope | TRN-001/002/005 | P0 | M | BACKLOG | J02 |
| W05-J06 | Soft-lock window + empty market | ILL-003/004 | P0 | M | BACKLOG | J05 |
| W05-J07 | Loading + marketing | — | P1 | M | BACKLOG | J02 |

### WORLD-03 — Training Ground

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W03-J01 | Moodboard | — | P0 | S | BACKLOG | Foundation |
| W03-J02 | Hero cones+goal (day+night flood) | HERO-006 | P0 | L | BACKLOG | J01, GRS |
| W03-J03 | Secondary ball bag / board | TRG-003/006 | P0 | M | BACKLOG | J02 |
| W03-J04 | Props cones/goal/bibs | TRG-001/002/004 | P0 | M | BACKLOG | J02 |
| W03-J05 | Soft-lock fog cones | ILL-002 | P0 | S | BACKLOG | J04 |
| W03-J06 | BG + loading + marketing | — | P1 | M | BACKLOG | J02 |

### Icons core (równolegle Wave 2)

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| ICO-J01 | Icon style frame sheet | — | P0 | M | BACKLOG | W12 |
| ICO-J02 | Nav/core icons set | ICO-001…021 | P0 | XL | BACKLOG | J01 |
| ICO-J03 | Extended icons | ICO-022…028 | P1 | L | BACKLOG | J02 |

**DoD Wave 2:** Daily loop rozróżnialny bez labeli + icon core APPROVED.

---

## 5. Wave 3 — Stadium + Finance

### WORLD-02 — Stadium

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W02-J01 | Moodboard | — | P1 | S | BACKLOG | Wave 2 |
| W02-J02 | Hero facade | HERO-008 | P1 | L | BACKLOG | J01 |
| W02-J03 | Secondary bowl / mast | STAD-003 · FLD-001 | P1 | M | BACKLOG | J02 |
| W02-J04 | BG silhouette strip | BG-009 | P1 | M | BACKLOG | J02 |
| W02-J05 | Soft-lock gate | ILL-011 | P2 | S | BACKLOG | J02 |
| W02-J06 | Loading + marketing prestige | — | P1 | M | BACKLOG | J02 |

### WORLD-06 — Finance Office

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W06-J01 | Moodboard | — | P1 | S | BACKLOG | Wave 2 |
| W06-J02 | Hero ledger | HERO-007 | P1 | L | BACKLOG | J01 |
| W06-J03 | Secondary binders | FIN-003 | P1 | S | BACKLOG | J02 |
| W06-J04 | BG ledger paper + tex | BG-007 · TEX-006 | P1 | M | BACKLOG | J02 |
| W06-J05 | Props stamp/envelope/safe | FIN-002/005/004 | P1 | M | BACKLOG | J02 |
| W06-J06 | Empty blank ledger | EMP-003 | P1 | S | BACKLOG | J02 |
| W06-J07 | Loading + marketing | — | P1 | M | BACKLOG | J02 |

### Crest expand

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| CRS-J01 | Opponent generic set 12–24 | CRS-005 | P1 | XL | BACKLOG | W12-J09 |
| CRS-J02 | Club pride banner tintable | BAN-004 | P1 | M | BACKLOG | CRS frames |

---

## 6. Wave 4 — Depth rooms

### WORLD-07 — Board Room (+ Press)

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W07-J01 | Hero boardroom | HERO-009 | P2 | L | BACKLOG | Wave 3 |
| W07-J02 | Secondary press room | HERO-011 | P2 | L | BACKLOG | J01 |
| W07-J03 | BG curtain | BG-012 | P2 | M | BACKLOG | J01 |
| W07-J04 | Board letter spot | ILL-007 | P1 | S | BACKLOG | J01 |
| W07-J05 | Wood polish tex + marketing | TEX-008 | P2 | M | BACKLOG | J01 |

### WORLD-08 — Medical

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W08-J01 | Hero medical | HERO-013 | P2 | L | BACKLOG | Wave 3 |
| W08-J02 | BG frost + props | BG-011 · MED-* | P2 | M | BACKLOG | J01 |
| W08-J03 | Injury notice spot | ILL-008 | P2 | S | BACKLOG | J02 |
| W08-J04 | Loading + marketing care | — | P2 | M | BACKLOG | J01 |

### WORLD-09 — Academy (+ Scout / Analyst jobs)

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W09-J01 | Hero academy | HERO-012 | P2 | L | BACKLOG | Wave 3 |
| W09-J02 | Youth prospect spot | ILL-009 | P2 | S | BACKLOG | J01 |
| W09-J03 | Marketing future club | — | P2 | M | BACKLOG | J01 |
| W09-J04 | Scout office hero+spot | HERO-015 · ILL-010 | P2 | L | BACKLOG | J01 |
| W09-J05 | Analyst room hero | HERO-014 | P2 | L | BACKLOG | Foundation style |

---

## 7. Wave 5 — Moments + Supporters

### WORLD-10 — Match Day close

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W10-J20 | Kick-off flash | MOM-001 | P1 | M | BACKLOG | Wave 1 core |
| W10-J21 | Goal bloom abstract | MOM-002 | P1 | M | BACKLOG | J20 |
| W10-J22 | Final whistle | MOM-003 | P1 | M | BACKLOG | J20 |
| W10-J23 | Halftime tunnel | MOM-004 | P2 | M | BACKLOG | J20 |
| W10-J24 | Tips rotation 5 cards | LOD-005 | P2 | L | BACKLOG | Multi-WORLD P0 |
| W10-J25 | Trophy / medal set | TRP-* · BDG | P2 | L | BACKLOG | W12 brass |

### WORLD-11 — Supporters

| Job ID | Deliverable | Asset IDs | P | Est. | Status | Depends |
| ------ | ----------- | --------- | - | ---- | ------ | ------- |
| W11-J01 | Crowd silhouette | SUP-001 | P2 | M | BACKLOG | Wave 3 stadium |
| W11-J02 | Crowd dotfield pattern | PAT-005 | P2 | S | BACKLOG | J01 |
| W11-J03 | Scarf classic + fold | SCF-001/002 | P1 | M | BACKLOG | Clubtint system |
| W11-J04 | Scarf wave moment | SCF-003 | P2 | M | BACKLOG | J03 |
| W11-J05 | Tifo abstract + smoke soft | SUP-002/003 | P3 | L | BACKLOG | J01 |
| W11-J06 | Marketing fan belonging | — | P2 | M | BACKLOG | J03 |

### Flavor opcjonalny (P3 — nie blokuje)

| Job ID | Deliverable | Asset IDs | P | Est. | Status |
| ------ | ----------- | --------- | - | ---- | ------ |
| FLV-J01 | Parking hero | HERO-017 | P3 | M | BACKLOG |
| FLV-J02 | Equipment room hero | HERO-018 | P3 | M | BACKLOG |
| FLV-J03 | Shop hero + scarf teaser | HERO-016 · ILL-012 | P3 | L | BACKLOG |
| FLV-J04 | Museum trophy hero | HERO-010 | P2 | L | BACKLOG |

---

## 8. Podsumowanie liczbowych jobów

| Wave | Joby (orientacja) | Cel immersji |
| ---- | ----------------- | ------------ |
| 0 | ~21 | Brand + shared tools |
| 1 | ~20 | Foundation Pack (Office + Match core) |
| 2 | ~25 + icons | Daily loop |
| 3 | ~16 | Prestige + money |
| 4 | ~16 | Depth rooms |
| 5 | ~16 + flavor | Moments + fans |
| **Razem** | **~110+ jobów** | Pełny świat |

MVP krytyczny Ownera = **Wave 0 + Wave 1** (~40 jobów) → EPIC `LFE-WORLD-ART-03`.

---

## 9. Tracking sheet (minimalny)

Dla każdego joba w arkuszu / issue:

```
Job ID | WORLD | Wave | P | Est | Status | Assignee | Asset IDs | Seed family | Review link | Version
```

Quality scorecard → Quality Guide §3.

---

## 10. Rekomendacja kolejnego EPICu

### **`LFE-WORLD-ART-03` — Foundation Pack Production**

**Weź z backlogu:** wszystkie joby **Wave 0 + Wave 1** (status → READY po GO).

**Nie bierz jeszcze:** Wave 2+ (chyba że Foundation zamknięty w trakcie).

**Dlaczego:**

1. Zamyka lukę Landing → Hub (Brand + Gabinet + Murawa/Tunel).  
2. Shared materials zatrzymują drift stylu w daily loop.  
3. Dopiero po APPROVED Foundation sensowny jest `LFE-ART-DIRECTION-02` (tokens) i później `LFE-UI-SKIN-01`.  
4. Ten EPIC (02) kończy **PLAN studia**; 03 zaczyna **produkcję obrazów** (nadal bez React/CSS).

**Następny po 03:** `LFE-WORLD-ART-04` — Daily Club Loop (Wave 2: Locker · Transfer · Training · Icons).

---

## 11. Owner GO checklist

- [ ] Akceptacja backlogu Wave 0–5  
- [ ] Akceptacja critical path  
- [ ] GO → otwarcie `LFE-WORLD-ART-03` (produkcja obrazów Foundation)  
- [ ] Decyzja: docs-commit trzech plików WORLD-ART-02  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Pierwszy Production Backlog |
