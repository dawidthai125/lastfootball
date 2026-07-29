# LFE-WORLD-ART-03R — APPROVAL PROCESS

**EPIC:** LFE-WORLD-ART-03R  
**Status:** DRAFT — procedura walidacji Reference Board  
**Data:** 2026-07-28  

> Jedyna ścieżka od draftu wzorca do **Foundation Reference Board LOCKED**.  
> Board: [`LFE-WORLD-ART-03R-REFERENCE-BOARD.md`](./LFE-WORLD-ART-03R-REFERENCE-BOARD.md).  
> Checklisty: [`LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md`](./LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md).  
> Style Lock: [`LFE-WORLD-ART-03-STYLE-LOCK.md`](./LFE-WORLD-ART-03-STYLE-LOCK.md).

---

## 0. Pipeline (obowiązkowy)

```
Draft
  ↓
Review
  ↓
Iteration
  ↓
Approved
  ↓
Locked          ← pojedynczy master / pozycja REF
  ↓
Foundation Reference Board   ← cały zestaw 16 + Certificate
```

Po **Foundation Reference Board** (ostatni stopień): wszystkie kolejne grafiki (w tym WORLD-ART-04) **muszą** być zgodne z boardem.

---

## 1. Statusy pozycji REF-XX

| Status | Znaczenie | Wolno iść dalej? |
| ------ | --------- | ---------------- |
| `DRAFT` | Pierwszy render / concept | Nie — tylko do Review |
| `IN_REVIEW` | Scorecard otwarty | Czeka na werdykt |
| `ITERATE` | Lista fixów ≤5 | Wróć do produkcji |
| `APPROVED` | Consistency Gate PASS | Można montować do boardu |
| `LOCKED` | Wersja zamrożona w boardzie vN | Nie zmieniać bez re-approval |
| `REJECTED` | Poza DNA — nowy brief | Nie patchować w nieskończoność |

**Uwaga:** `APPROVED` ≠ Style Lock całego świata. Style Lock = po komplecie 16 + Certificate.

---

## 2. Etapy szczegółowo

### 2.1 Draft

**Wejście:** Brief z Reference Board (REF-ID) + Art Bible lokacja + Master Lock.  
**Wyjście:** Plik `…-v01` oznaczony DRAFT.  
**Zakaz:** Używanie DRAFT jako runtime / marketing final.

### 2.2 Review

**Kto:** Art Director (minimum); Owner na P0 hero (REF-01, 02, 03, 06, 13).  
**Jak:** Checklist z [`LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md`](./LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md) + Quality Guide 7 kryteriów.  
**Werdykt:** APPROVED / ITERATE / REJECTED.

### 2.3 Iteration

- Max **3** rundy na pozycję.  
- Fix tylko osie z briefu (światło / crop / materiał / kolor).  
- Po 3× ITERATE → eskalacja Owner (nowy concept lub HOLD boardu).

### 2.4 Approved

- Wpis w tracking: Asset ID · wersja · seed family · link review.  
- Miniatura gotowa do montażu `LF-REF-BOARD-FOUNDATION`.

### 2.5 Locked (per pozycja)

- Po montażu boardu vN pozycja dostaje `LOCKED` względem tej wersji boardu.  
- Zmiana LOCKER pozycji = bump boardu (`vN+1`) + partial re-gate Family Strip (REF-16).

### 2.6 Foundation Reference Board (stopień końcowy)

**Warunki:**

1. REF-01…16 = APPROVED (następnie LOCKED w boardzie)  
2. REF-16 Family Strip PASS  
3. Lock Proposal (Style Lock §2.D)  
4. Owner podpisuje **Style Lock Certificate**  
5. Visual DNA → status `LOCKED`  
6. Publikacja: board ID + data + lista masterów

**Skutek:** wolno planować / otwierać produkcję volume (`LFE-WORLD-ART-04`).

---

## 3. Role i odpowiedzialności

| Rola | Draft | Review | Approve | Board Lock |
| ---- | ----- | ------ | ------- | ---------- |
| AI Operator / Artist | ✓ | — | — | — |
| Art Director | brief QA | ✓ | ✓ (asset) | Proposal |
| Owner | GO scope | P0 heroes | Certificate | **Final LOCK** |
| Librarian | naming | — | katalog | wersja boardu |

---

## 4. Board Assembly Checklist

Przed Certificate:

- [ ] 16/16 pozycji APPROVED  
- [ ] Color · Lighting · Texture sheets w zestawie  
- [ ] Flood + Pitch texture + Heroes Office/Stadium/Tunnel/Pitch  
- [ ] Brand + Crest + Loading  
- [ ] Family Strip bez „obcej gry”  
- [ ] Zero pozycji z FAIL na DNA 1, 5, 8, 10  
- [ ] Naming `lf-world-ref-…-vN` + `LF-A-*`  
- [ ] Kontakt sheet `LF-REF-BOARD-FOUNDATION-vN` wyeksportowany  

---

## 5. Co po zatwierdzeniu boardu

| Wolno | Nie wolno |
| ----- | --------- |
| Start `LFE-WORLD-ART-04` (volume daily loop) | Ciche zmiany DNA |
| Nowe assety Wave 2+ vs board | Drugi styl „eksperymentalny” w main |
| Mapowanie kolorów → tokens (osobny EPIC) | Otwierać 04 bez Certificate |
| Deprecate CONCEPT sprzed boardu | Używać odrzuconych draftów |

Każda nowa grafika:

```
Brief → Concept → Quality Checklist → APPROVED → Library
+ porównanie wzrokowe z Foundation Reference Board
```

---

## 6. Re-open / FAIL boardu

Jeśli Owner lub AD stwierdzi drift:

1. Status boardu → `HOLD`  
2. Lista pozycji do ITERATE  
3. Nowy Family Strip  
4. Nowy Certificate (vN+1)  
5. Volume 04 **wstrzymane** do ponownego LOCK  

Zmiana kierunku (np. porzucenie Night Pitch) = **nowy EPIC**, nie re-open 03R.

---

## 7. Stan obecny i rekomendacja (jednoznaczna)

### Stan faktów

| Element | Stan |
| ------- | ---- |
| Spec Reference Board (16) | GOTOWY |
| Quality Checklist | GOTOWY |
| Approval Process | GOTOWY |
| Wyprodukowane / APPROVED obrazy REF-01…16 | **BRAK** |
| Style Lock Certificate | **BRAK** |
| Visual DNA | `DRAFT` (docs accepted, nie `LOCKED`) |

### Rekomendacja

# **FAIL → nie otwierać `LFE-WORLD-ART-04`**

**Uzasadnienie:** Foundation Pack i DNA (docs) są zaakceptowane, ale **Visual DNA nie zostało jeszcze zwalidowane na obrazach**. Style Lock zabrania volume bez APPROVED Reference Board. Otwarcie WORLD-ART-04 teraz = produkcja w ciemno i drift.

**To nie jest FAIL Foundation Pack (docs)** — nie wymagamy przepisywania Art Bible / DNA.  
**Wymagane przed PASS→04:**

1. Render REF-01…16  
2. Review → Iteration → Approved (wszystkie)  
3. Foundation Reference Board + Style Lock Certificate  
4. Visual DNA → `LOCKED`  

**Dopiero wtedy:**

# **PASS → otwarcie `LFE-WORLD-ART-04`**

**Następny krok roboczy (nie 04):** produkcja grafik Reference Board według kolejności w Reference Board §3 — nadal bez UI/React/CSS.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Approval Process + werdykt FAIL na 04 |
