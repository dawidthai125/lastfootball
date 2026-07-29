# LFE-WORLD-ART-02 — QUALITY GUIDE

**EPIC:** LFE-WORLD-ART-02  
**Etap:** PLAN (system kontroli jakości)  
**Status:** DRAFT  
**Data:** 2026-07-28

> Obowiązkowy **Quality Gate** dla każdej grafiki świata LastFootball.  
> Kanon: [`LFE-CONCEPT-ART-01-ART-BIBLE.md`](./LFE-CONCEPT-ART-01-ART-BIBLE.md).  
> Plan paczek: [`LFE-WORLD-ART-02-PRODUCTION-PLAN.md`](./LFE-WORLD-ART-02-PRODUCTION-PLAN.md).  
> Backlog: [`LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md`](./LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md).

---

## 0. Zasada nadrzędna

Żaden asset nie wchodzi do Library jako `APPROVED`, dopóki nie przejdzie **Consistency Gate** (PASS na wszystkich kryteriach obowiązkowych).

Statusy:

| Status       | Znaczenie                                              |
| ------------ | ------------------------------------------------------ |
| `CONCEPT`    | Eksploracja — nie runtime                              |
| `IN_REVIEW`  | Czeka na gate                                          |
| `ITERATE`    | Wróć z konkretną listą fixów                           |
| `APPROVED`   | Freeze wersji · wolno export/library                   |
| `REJECTED`   | Poza kanonem — nie iteruj w nieskończoność; nowy brief |
| `DEPRECATED` | Zastąpiony nowszym major                               |

---

## 1. Consistency System — 7 kryteriów obowiązkowych

Każda grafika przed akceptacją oceniana w skali:

**PASS** · **SOFT** (dopuszczalne z notatką) · **FAIL**

Asset = **APPROVED** tylko jeśli **0× FAIL** oraz ≤2× SOFT (SOFT nie na: Art Bible / Night Pitch Office / Styl).

### 1.1 Zgodność z Art Bible

| Pytanie                                                | PASS                                            | FAIL                                                     |
| ------------------------------------------------------ | ----------------------------------------------- | -------------------------------------------------------- |
| Czy lokacja / materiał / zakazy z Biblii są zachowane? | Brief cytuje § lokacji; brak zakazanych motywów | Twarze fotoreal · UI chrome · cartoon toy · real club IP |
| Czy Master Lock + Negative Lock zastosowane?           | Operator potwierdza                             | Brak śladu kanonu                                        |

### 1.2 Zgodność kolorystyczna

| Pytanie                                          | PASS              | FAIL                                                          |
| ------------------------------------------------ | ----------------- | ------------------------------------------------------------- |
| Paleta master (void/navy/ash/brass/pitch/ivory)? | Dominant z kanonu | Purple / cyan cyber / rainbow / cream editorial jako dominant |
| Clubtint ≤ 1 dominant?                           | Tak               | Dwa głośne kolory klubu + brass walczą                        |
| Semantic scarlet tylko jako Live/emocja ostra?   | Tak               | Czerwień „dla ozdoby”                                         |

**Referencja hex:** Art Bible §3.1 / Art Direction Color System.

### 1.3 Zgodność światła

| Pytanie                                                | PASS              | FAIL                              |
| ------------------------------------------------------ | ----------------- | --------------------------------- |
| Źródło jak maszty / desk lamp / clinical (wg lokacji)? | Kierunek czytelny | Flat UI light · disco multi-color |
| Warm flood + cool night ambient?                       | Temperatura OK    | Jednolity gray flat lub neon      |
| Max ~1 silny warm wash na kadr (BG)?                   | Tak               | Flary walczące z safe area        |

### 1.4 Zgodność materiałów

| Pytanie                                                 | PASS                | FAIL                                    |
| ------------------------------------------------------- | ------------------- | --------------------------------------- |
| Beton / brass / turf / glass / fabric / paper czytelne? | Materiał > efekt    | Plastic toy · pure glow bez powierzchni |
| Semi-flat editorial depth?                              | 1–2 warstwy światła | Overcooked PBR screenshot dump          |

### 1.5 Zgodność perspektywy

| Pytanie                                                   | PASS                     | FAIL                                           |
| --------------------------------------------------------- | ------------------------ | ---------------------------------------------- |
| 3/4 lekki lub frontal z warstwami / POV tunnel gdy brief? | Zgodne z typem           | Fish-eye · dutch angle bez briefu Match Moment |
| Crop, nie katalog całego obiektu?                         | Architectural/pitch crop | Stock „cały stadion z drona” jako default      |

### 1.6 Zgodność stylu

| Pytanie                                             | PASS                     | FAIL                                     |
| --------------------------------------------------- | ------------------------ | ---------------------------------------- |
| Semi-flat Sport Editorial?                          | Spójne z Foundation Pack | Realism photo · anime · clipart · 3D toy |
| Spójność z już APPROVED assetami tej paczki / Wave? | Family match             | Wygląda jak inne studio                  |

### 1.7 Zgodność z Night Pitch Office

| Pytanie                                              | PASS | FAIL                                      |
| ---------------------------------------------------- | ---- | ----------------------------------------- |
| W 1 sekundę: nocny klub / gabinet / murawa / presja? | Tak  | SaaS panel vibe · media app · arcade shop |
| Emocja lokacji zbriefowana wyczuwalna?               | Tak  | Generic dark pretty picture               |

**Wyjątek świadomy:** WORLD-09 Academy (daylight) i WORLD-03 day-variant — nadal muszą czuć się jak **ten sam klub**, nie inna gra.

---

## 2. Kryteria dodatkowe (per typ assetu)

### 2.1 Hero Artwork

- [ ] Silny foreground prop lub herb
- [ ] Safe center ~60% pod ewentualny copy (marketing) / nie przeładowany
- [ ] Ratio 16:9 (+ 9:16 jeśli P0)
- [ ] Brak czytelnego losowego tekstu

### 2.2 Background

- [ ] Budżet uwagi ≤ ~10%
- [ ] Edges darker · mid spokojniejszy
- [ ] Brak focal subject walczącego z przyszłą treścią
- [ ] Tile/seamless jeśli texture/pattern

### 2.3 Empty / Soft-lock Spot

- [ ] Negatywna przestrzeń
- [ ] Czytelny w 1:1 małym rozmiarze
- [ ] Soft-lock = desaturacja / fog — nie „error red scream”

### 2.4 Loading

- [ ] Jeden subject
- [ ] Grain OK
- [ ] Mobile 9:16 nie gubi motywu

### 2.5 Marketing

- [ ] Brand lock LF OK
- [ ] Nie imituje UI screenshotu gry
- [ ] Zgodne z landing DNA (flood + pitch)

### 2.6 Icons / Brand vector

- [ ] SVG clean · stroke stabilny
- [ ] Czytelne 24px
- [ ] Jedna rodzina outline

---

## 3. Scorecard (szablon review)

Kopiuj per asset:

```
ASSET ID: LF-A-____-___
WORLD: WORLD-__
TYPE: Hero / Secondary / BG / Empty / Loading / Marketing / Prop / Other
VERSION: v__
REVIEWER: ____
DATE: ____

[ ] 1 Art Bible        PASS / SOFT / FAIL  notes:
[ ] 2 Color            PASS / SOFT / FAIL  notes:
[ ] 3 Light            PASS / SOFT / FAIL  notes:
[ ] 4 Materials        PASS / SOFT / FAIL  notes:
[ ] 5 Perspective      PASS / SOFT / FAIL  notes:
[ ] 6 Style            PASS / SOFT / FAIL  notes:
[ ] 7 Night Pitch Office PASS / SOFT / FAIL  notes:

Type-specific checklist: PASS / FAIL

VERDICT: APPROVED / ITERATE / REJECTED
FIX LIST (max 5 bullets):
1.
2.
SEED / FAMILY:
NEXT OWNER: Art Director / Operator
```

---

## 4. Anti-patterns (auto-FAIL)

1. Purple / indigo glow dominant
2. Dashboard · sidebar · KPI cards w kadrze
3. Fotorealistyczna twarz zawodnika / celebrity
4. Logo prawdziwych klubów / FIFA-EA trademark lookalike
5. Cartoon chibi / toy 3D
6. Losowy czytelny tekst / lorem
7. Collage „AI kitchen sink”
8. Hero BG walczący o uwagę jak wallpaper 100%
9. Drugi styl w tej samej paczce bez justification
10. Soft-lock wyglądający jak soft-paywall neon

---

## 5. Relacja do UI (Guide §16)

Art **nie ocenia** poprawności CTA — ale:

| Art może                        | Art nie może                                       |
| ------------------------------- | -------------------------------------------------- |
| Dawać miejsce (gabinet/szatnia) | Wymuszać wall of cards w kompozycji „pod UI”       |
| Dawać atmosferę ≤10%            | Wymagać drugiego gold CTA wizualnie w hero         |
| Wspierać emocję matchday        | Pakować 6 KPI w marketing jako „dashboard fantasy” |

Jeśli marketing sugeruje SaaS dashboard — **FAIL** kryterium 7.

---

## 6. Seed & family discipline

| Reguła             | Opis                                           |
| ------------------ | ---------------------------------------------- |
| Family per WORLD   | Ta sama linia seedów / model settings w paczce |
| Nie mieszaj modeli | Jedna „kamera studia” na Wave                  |
| Zapis              | W scorecard + backlog job                      |
| Breaking change    | Nowy major version + re-gate sample set        |

---

## 7. Export quality bar

| Check         | Wymaganie                                                   |
| ------------- | ----------------------------------------------------------- |
| Rozdzielczość | ≥ master z Asset Library §0.3                               |
| Artefakty     | Brak mocnego AI mush na props FG                            |
| Alpha         | Spots/icons z czystym alpha                                 |
| Naming        | `lf-world-{pack}-{type}-{variant}-v{n}` + ID `LF-A-*`       |
| Budżet KB     | Ustalany w EPICu production; tu: preferuj WebP/AVIF runtime |

---

## 8. Escakalacja

| Sytuacja                        | Akcja                                  |
| ------------------------------- | -------------------------------------- |
| 3× ITERATE bez PASS             | Nowy Concept od zera lub zmiana briefu |
| Konflikt Biblia vs brief paczki | Wygrywa **Art Bible**                  |
| Konflikt dwóch APPROVED (drift) | Deprecate starszy · re-gate paczki     |
| Wątpliwość Night Pitch          | Owner + Art Director decision log      |

---

## 9. Definition of Done — Quality Guide

- [x] 7 kryteriów Consistency System
- [x] Scorecard
- [x] Anti-patterns
- [x] Typ-specific checks
- [ ] Owner GO jako obowiązujący gate produkcji

---

## Historia

| Wersja | Data       | Opis                   |
| ------ | ---------- | ---------------------- |
| 0.1.0  | 2026-07-28 | Pierwszy Quality Guide |
