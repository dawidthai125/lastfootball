# LFE-WORLD-ART-04 — QUALITY PROCESS

**EPIC:** LFE-WORLD-ART-04  
**Status:** ACTIVE — obowiązuje przy każdym assetcie volume  
**Data:** 2026-07-28

> Proces jakości produkcji biblioteki pod **Style Lock ACTIVE**.  
> DNA: [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md) (**LOCKED**).  
> Board: `LF-REF-BOARD-FOUNDATION-v02`.  
> Certificate: [`LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md`](./LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md).  
> Checklist bazowy: [`LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md`](./LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md).  
> Guide: [`LFE-WORLD-ART-02-QUALITY-GUIDE.md`](./LFE-WORLD-ART-02-QUALITY-GUIDE.md).

---

## 0. Zasada

Żaden asset Wave 0–2 nie wchodzi do Library jako `APPROVED` bez przejścia **pełnego gate poniżej**.  
**0× FAIL** wymagane. SOFT ≤2 (nigdy na DNA Z1 / Z5 / Z8 / Z10).

---

## 1. Pipeline jakości (per asset)

```
Brief (ID z Asset Queue + REF + DNA)
  → Draft render
  → Self-check vs REF board v02
  → Review (Quality Gate §2)
  → Iteration (max 3)
  → APPROVED
  → Export (sizes Asset Library)
  → Library index + versioning
```

Statusy jak w Queue: `READY` → `IN_PROGRESS` → `IN_REVIEW` → `APPROVED` | `ITERATE` loop.

---

## 2. Quality Gate — 7 filarów (obowiązkowe)

Każdy asset oceniany:

### 2.1 Visual DNA (LOCKED)

- [ ] Z1 Miejsce przed panelem
- [ ] Z2 Night Pitch temperatura
- [ ] Z3 Światło masztów / biurka
- [ ] Z4 Materiał przed efektem
- [ ] Z5 Semi-flat Sport Editorial (**hard FAIL** przy photoreal regress)
- [ ] Z6 Crop, nie katalog
- [ ] Z7 Atmosfera ≤ ~10% (BG/overlay)
- [ ] Z8 Paleta void/brass/pitch
- [ ] Z9 Klub vs produkt (gdy crest/brand)
- [ ] Z10 Family match vs board v02 / Wave peers

### 2.2 Style Lock

- [ ] Certificate ACTIVE respektowany
- [ ] Brak nowego kierunku „po cichu”
- [ ] Porównanie z `LF-REF-BOARD-FOUNDATION-v02`

### 2.3 Foundation Reference Board

- [ ] Wskazany REF z Queue użyty jako wzorzec
- [ ] Nie gorszy stylistycznie niż REF (semi-flat, temperatura)
- [ ] Nie miesza poster/tile/sheet form (lekcja REF-05/09)

### 2.4 Color System

- [ ] Swatche zgodne z REF-09 / Art Bible
- [ ] Brak purple / cyan cyber / rainbow dominant
- [ ] Clubtint ≤ 1

### 2.5 Material System

- [ ] Zgodne z REF-07 / REF-05 / REF-15
- [ ] Grain w budżecie kanonicznym (2–3%)
- [ ] Brak plastic toy / pure glow

### 2.6 Lighting System

- [ ] Zgodne z REF-08 / REF-04
- [ ] Warm flood / desk lamp wg lokacji
- [ ] Cool night ambient
- [ ] Brak flat UI light / disco

### 2.7 Composition Rules

- [ ] Warstwy FG→mid→BG lub typ sheet/tile/icon OK
- [ ] Safe area / negatywna przestrzeń wg typu
- [ ] Brak UI chrome / losowego tekstu (wyjątek: kontrolowane labele tool sheet)
- [ ] Brak fish-eye / niebriefowany dutch

---

## 3. Scorecard (kopiuj)

```
ASSET: LF-A-____ | Wave: _ | Variant: ____ | v__
REF compared: REF-__
Reviewer: ____ | Date: ____

Visual DNA:     PASS / SOFT / FAIL
Style Lock:     PASS / FAIL
Foundation REF: PASS / SOFT / FAIL
Color:          PASS / SOFT / FAIL
Material:       PASS / SOFT / FAIL
Lighting:       PASS / SOFT / FAIL
Composition:    PASS / SOFT / FAIL

SOFT count: _/2 (forbidden on Z1/Z5/Z8/Z10)
FIX LIST:
1.
2.
VERDICT: APPROVED / ITERATE / REJECTED
```

---

## 4. Auto-FAIL (volume)

1. Photoreal drift (Z5)
2. Purple / SaaS dashboard aesthetic
3. Poster zamiast tile/sheet gdy brief wymaga lab/tile
4. Real club IP / celebrity faces
5. Losowy czytelny tekst AI
6. Drugi styl vs REF-16 family
7. Ignorowanie Style Lock ACTIVE

---

## 5. Wave exit gates

### Wave 0 exit

- [ ] Wszystkie P0 Wave 0 APPROVED
- [ ] REF-COLOR / LIGHT / TEX prod copies APPROVED
- [ ] Brand + crest system P0 APPROVED
- [ ] Spot-check vs REF-01/07/09/04/05

### Wave 1 exit

- [ ] HERO-001/002/003 + mobile variants P0 APPROVED
- [ ] BG office/pitch/tunnel P0 APPROVED
- [ ] LOD-001/002 APPROVED
- [ ] Family check vs REF-16

### Wave 2 exit

- [ ] HERO-004/005/006 APPROVED
- [ ] Soft-lock spots ILL-002/003 APPROVED
- [ ] ICO style + ICO-001…021 APPROVED
- [ ] Daily loop rozróżnialny w contact sheet

**FAIL Wave exit** → nie startuj kolejnej fali.

---

## 6. Eskalacja

| Sytuacja                 | Akcja                           |
| ------------------------ | ------------------------------- |
| 3× ITERATE               | Nowy brief lub HOLD Wave        |
| Konflikt z DNA           | Wygrywa DNA LOCKED              |
| Wątpliwość Style Lock    | Owner + wstrzymaj volume        |
| Potrzeba zmiany kierunku | **Nowy EPIC** — nie hotfix w 04 |

---

## 7. Relacja do UI

Ten proces **nie** zatwierdza implementacji UI.  
Gdy później `LFE-ART-DIRECTION-02` / `LFE-UI-SKIN-*`: assety volume są wejściem — Guide §16 nadal obowiązuje dla hierarchii decyzji.

---

## Historia

| Wersja | Data       | Opis                            |
| ------ | ---------- | ------------------------------- |
| 0.1.0  | 2026-07-28 | Quality process volume Wave 0–2 |
