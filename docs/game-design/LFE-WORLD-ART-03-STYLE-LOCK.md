# LFE-WORLD-ART-03 — STYLE LOCK

**EPIC:** LFE-WORLD-ART-03  
**Status:** DRAFT — procedura (lock następuje po APPROVE Foundation Reference Board)  
**Data:** 2026-07-28

> **Style Lock** = formalne zamrożenie kierunku artystycznego LastFootball.  
> Po locku: nie wolno zmieniać kierunku bez nowego EPICu; każda grafika = Visual DNA + Consistency Gate.  
> DNA: [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md).  
> Pack: [`LFE-WORLD-ART-03-FOUNDATION-PACK.md`](./LFE-WORLD-ART-03-FOUNDATION-PACK.md).  
> Gate: [`LFE-WORLD-ART-02-QUALITY-GUIDE.md`](./LFE-WORLD-ART-02-QUALITY-GUIDE.md).

---

## 0. Po co Style Lock

Bez zamknięcia stylu:

- każda sesja AI „wymyśla inną grę”,
- Landing i Hub znów się rozjeżdżają,
- volume production (Wave 2+) generuje kosztowny drift.

Style Lock zamienia Night Pitch Office z **intencji** w **kontrakt studia**.

---

## 1. Warunki wejścia do procedury Lock

Lock można rozpocząć dopiero gdy:

1. Docs Foundation Pack + Visual DNA + ten plik → **Owner GO (docs)**
2. **Reference Board** (12–18 masterów z Foundation Pack §12) → Consistency Gate
3. Minimum APPROVED:
   - Color Board
   - Lighting Sheet
   - Texture Scale Sheet
   - Shared materials P0 (grain, concrete, turf, void)
   - Flood bloom + corner wash
   - Pitch hero **lub** Tunnel hero (lepiej oba)
   - Manager Office hero
   - Brand shield + monogram
4. Art Director składa **Lock Proposal** (poniżej)
5. Owner podpisuje **Style Lock Certificate**

**Nie wolno** lockować samego tekstu DNA bez Reference Board — DNA musi być **widoczne na obrazach-wzorcach**.

---

## 2. Procedura zatwierdzania stylu (krok po kroku)

### Krok A — Reference Board Assembly

- Zbierz APPROVED masters Foundation do jednego boardu (kontakt sheet).
- Nazwa: `LF-REF-BOARD-FOUNDATION-vN`
- Dołącz: Color · Lighting · Texture sheets.

### Krok B — DNA Compliance Review

- Dla boardu jako całości: szybki test DNA (Visual DNA §2).
- Scorecard zbiorczy: 0 FAIL na zasadach 1–10.
- Lista SOFT (max) z planem ignoruj / fix przed lock.

### Krok C — Cross-asset Consistency

Sprawdź, czy Office / Pitch / Tunnel / Stadium / Brand wyglądają jak **jedno studio**:

| Check                           | PASS |
| ------------------------------- | ---- |
| Ta sama temperatura night       |      |
| Ten sam brass                   |      |
| Ten sam poziom semi-flat        |      |
| Grain spójny                    |      |
| Brak „obcej” grafiki w zestawie |      |

### Krok D — Lock Proposal

Art Director wypełnia:

```
LOCK PROPOSAL — LFE-WORLD-ART-03
Date:
Board version:
Masters count:
DNA version: 0.1.0 (or locked)
Exceptions requested: (none / list)
Risks:
Recommendation: LOCK / HOLD
```

### Krok E — Owner Decision

| Decyzja              | Skutek                                                                    |
| -------------------- | ------------------------------------------------------------------------- |
| **LOCK**             | Style Lock Certificate · Visual DNA → `LOCKED` · wolny start volume EPICu |
| **HOLD**             | Lista fixów Reference Board · powtórz B–D                                 |
| **REJECT direction** | Nowy EPIC zmiany kierunku (nie „ciche” poprawki)                          |

### Krok F — Publication

Po LOCK:

1. Oznacz Visual DNA jako `LOCKED` + data
2. Oznacz Foundation Pack Reference Board jako `CANONICAL`
3. Wpis w PROJECT / game-design README (status)
4. Backlog Wave 2+ → joby mogą przejść `BACKLOG` → `READY`
5. **Zakaz** commitowania stylu sprzecznego z boardem (gdy dojdzie produkcja plików)

---

## 3. Style Lock Certificate (szablon)

```
═══════════════════════════════════════════
LASTFOOTBALL — STYLE LOCK CERTIFICATE
═══════════════════════════════════════════
Epic:            LFE-WORLD-ART-03
Direction:       Night Pitch Office
Visual DNA:      LOCKED (version ____)
Reference Board: LF-REF-BOARD-FOUNDATION-v____
Quality Gate:    LFE-WORLD-ART-02-QUALITY-GUIDE
Date locked:     ____-__-__
Owner:           __________________  (signature / GO)
Art Director:    __________________

Rules after lock:
1. No art direction change without a new EPIC.
2. Every asset must obey Visual DNA (10 rules).
3. Every asset must pass Consistency Gate before APPROVED.
4. Foundation Reference Board is the visual source of truth.

Exceptions attached: none / see appendix
═══════════════════════════════════════════
```

_(Wypełniane dopiero po realnym APPROVE boardu — nie teraz.)_

---

## 4. Reguły po zamknięciu Lock

### 4.1 Wolno

- Produkowć volume (WORLD-04+) **zgodne** z DNA i boardem
- Dodawać lokacje / warianty w tym samym stylu
- Iterować jakość techniczną (ostrość, compress) bez zmiany kierunku
- Mapować kolory DNA → przyszłe tokeny UI (osobny EPIC)

### 4.2 Nie wolno (bez nowego EPICu)

- Zmieniać paletę dominant (np. przejście na purple / light mode default)
- Zmieniać styl na photo-real / cartoon / cyber
- Wprowadzać drugiego „studio look” równolegle
- Ignorować Consistency Gate „bo deadline”
- Używać Foundation CONCEPT odrzuconych jako runtime

### 4.3 Każda nowa grafika — obowiązkowy flow

```
Brief (cytat DNA + lokacja)
  → Concept
  → Consistency Gate (Quality Guide)
  → APPROVED
  → Library
```

Porównanie wzrokowe z **Reference Board** = część review (kryterium Style / family match).

---

## 5. Zmiana kierunku po Lock (jedyna droga)

1. Nowy EPIC (np. `LFE-WORLD-ART-REDIR-01` lub Art Direction major)
2. AUDIT dlaczego Lock nie wystarcza
3. Nowy Reference Board
4. Nowy Style Lock (supersede)
5. Plan migracji / deprecate starych assetów

**Zakaz:** ciche podmienianie stylu w trakcie Wave 2–5.

---

## 6. Relacja do Consistency Gate

| Warstwa                         | Dokument                                |
| ------------------------------- | --------------------------------------- |
| Zasady (co)                     | Visual DNA (10)                         |
| Ocena assetu (jak mierzyć)      | Quality Guide (7 kryteriów + scorecard) |
| Zamrożenie (kiedy wolno volume) | **ten Style Lock**                      |
| Wzorce (jak wygląda PASS)       | Foundation Reference Board              |

Gate bez Locka = dobre recenzje lokalne.  
Lock bez Gate = martwy papier.  
**Oba są wymagane.**

---

## 7. Co jest TERAZ (stan EPICu 03 docs)

| Element                  | Stan                                       |
| ------------------------ | ------------------------------------------ |
| Procedura Style Lock     | DRAFT spisana                              |
| Visual DNA               | DRAFT (do Owner GO docs)                   |
| Reference Board (obrazy) | **Jeszcze nie** — kolejny krok produkcyjny |
| Certificate              | Puste do czasu APPROVE boardu              |
| Volume WORLD-04          | **Zablokowane** do LOCK                    |

---

## 8. Rekomendacja następnego kroku (Owner)

### Nie skakać od razu do pełnej produkcji volume (`LFE-WORLD-ART-04`)

**Najpierw:** EPIC / etap **`LFE-WORLD-ART-03R` — Foundation Reference Board Render**

Zakres:

- wyprodukować **tylko** 12–18 masterów z Foundation Pack §12,
- przejść Consistency Gate,
- podpisać Style Lock Certificate,
- zamknąć Visual DNA jako `LOCKED`.

**Potem:** `LFE-WORLD-ART-04` — Daily Club Loop volume (Locker · Transfer · Training · Icons) pod twardym DNA.

**Dlaczego nie od razu 04:** bez zatwierdzonego boardu volume = kosztowny drift i powtórki.  
**Dlaczego nie tokens/UI teraz:** UI skin bez zamkniętego DNA znów da „ładny SaaS”.

---

## 9. Owner GO checklist (ten dokument)

- [ ] Akceptacja procedury Style Lock
- [ ] Akceptacja warunku: **brak Lock bez Reference Board**
- [ ] GO na etap renderu Reference Board (03R) vs HOLD
- [ ] Potwierdzenie: volume 04 dopiero po Certificate

---

## Historia

| Wersja | Data       | Opis                                   |
| ------ | ---------- | -------------------------------------- |
| 0.1.0  | 2026-07-28 | Procedura Style Lock (pre-certificate) |
