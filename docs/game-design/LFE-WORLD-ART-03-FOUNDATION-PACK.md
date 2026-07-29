# LFE-WORLD-ART-03 — FOUNDATION PACK

**EPIC:** LFE-WORLD-ART-03  
**Etap:** FOUNDATION PACK PRODUCTION (VISUAL DNA)  
**Status:** DRAFT — zestaw referencyjny / DNA (bez pełnej biblioteki · bez UI · bez kodu)  
**Data:** 2026-07-28  
**Owner GO (wejście):** LFE-WORLD-ART-02 zaakceptowany

> Cel: zdefiniować **ostateczny styl wizualny** gry jako **wzorce referencyjne**, nie produkować setek grafik.  
> Visual DNA: [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md).  
> Style Lock: [`LFE-WORLD-ART-03-STYLE-LOCK.md`](./LFE-WORLD-ART-03-STYLE-LOCK.md).  
> SSOT: Art Bible · Asset Library · WORLD-ART-02 Plan / Quality / Backlog · Art Direction 01.

---

## 0. Czym jest Foundation Pack

| Jest                                                              | Nie jest                      |
| ----------------------------------------------------------------- | ----------------------------- |
| **Visual DNA** — wzorce, z których wynika cała przyszła produkcja | Pełna Asset Library (180+ ID) |
| **Reference Board** — ograniczony zestaw masterów-wzorców         | Wave 2–5 volume               |
| Zamrożenie kierunku Night Pitch Office                            | Implementacja React/CSS       |
| Wejście do Style Lock                                             | UI skin / tokeny w kodzie     |

**Zasada ilości:** Foundation Pack = **minimum wystarczające do Style Lock**, nie maksimum katalogu.

**Docelowa liczba masterów referencyjnych (łącznie):** ok. **12–18** APPROVED (nie 100+).

---

## 1. Skład Foundation Pack (10 elementów)

Kolejność produkcji referencji:

```
Color Reference → Lighting System → Texture System → Shared Materials
    → Brand Identity → Floodlights → Pitch → Tunnel
    → Night Stadium → Manager Office
    → Style Lock Review → Owner APPROVE
```

---

## 2. Element 1 — Brand Identity

| Pole                        | Opis                                                                                        |
| --------------------------- | ------------------------------------------------------------------------------------------- |
| **Cel**                     | Jednoznaczny znak LastFootball: prestige brass na void                                      |
| **Rola**                    | Kotwica marki dla wszystkich paczek i marketingu                                            |
| **Najważniejsze elementy**  | Monogram LF · Wordmark condensed · Shield/herb marki · Crest frame ring · Placeholder ghost |
| **Styl**                    | Vector-first · semi-flat · foil catchlight · zero toy-3D                                    |
| **Kompozycja**              | Znak w centrum void; dużo negatywnej przestrzeni; bez UI chrome                             |
| **Światło**                 | Pojedynczy catchlight na brass; ambient cool night                                          |
| **Kolory**                  | Brass Gold `#C9A85C` · Brass Deep `#8B7340` · Void `#02060C` · Flood Ivory na highlight     |
| **Materiały**               | Brushed brass · matte ink · miękki grain 2%                                                 |
| **Emocje**                  | Ambicja · zaufanie premium · powaga                                                         |
| **Zastosowanie**            | Loading crest · marketing · watermark · app identity · baza herbu gracza                    |
| **Reference masters (min)** | 1× shield lockup · 1× monogram sheet · 1× wordmark · 1× LOD crest breath                    |
| **Asset IDs**               | BRD-001…003 · CRS-001/004 · LOD-001                                                         |
| **Backlog jobs**            | W12-J02…J04 · J07–J08 · J10                                                                 |

---

## 3. Element 2 — Manager Office

| Pole                        | Opis                                                                                                     |
| --------------------------- | -------------------------------------------------------------------------------------------------------- |
| **Cel**                     | „Dom” menedżera — emocjonalny rdzeń Hub                                                                  |
| **Rola**                    | Wzorzec lokacji **Office** (wszystkie biura później dziedziczą DNA gabinetu)                             |
| **Najważniejsze elementy**  | Biurko · herb na podstawce · lampka · okno na floodlighty · pusty fotel / sylwetka od tyłu (opcjonalnie) |
| **Styl**                    | Semi-flat sport editorial · FG props ostre · BG window soft                                              |
| **Kompozycja**              | Warstwy: props FG → biurko mid → szyba → stadion crop daleko                                             |
| **Światło**                 | Desk lamp warm lokalny + distant flood warm + cool room ambient                                          |
| **Kolory**                  | Night Navy · Ash · Brass · desk warm · clubtint tylko na herbie                                          |
| **Materiały**               | Ciemne drewno · skóra · matowe szkło · mosiądz · papier                                                  |
| **Emocje**                  | Odpowiedzialność · spokój luksusu · samotność roli                                                       |
| **Zastosowanie**            | Hub cover · loading desk · marketing „Twój klub” · wzorzec dla Transfer/Finance light                    |
| **Reference masters (min)** | 1× Hero 16:9 · 1× Hero 9:16 **lub** crop mobile · 1× BG wash                                             |
| **Asset IDs**               | HERO-001 · BG-002 · OFF-001/002/006                                                                      |
| **Backlog**                 | W01-J02 · J04 · J05                                                                                      |

---

## 4. Element 3 — Night Stadium

| Pole                        | Opis                                                                     |
| --------------------------- | ------------------------------------------------------------------------ |
| **Cel**                     | Skala i duma — architektura klubu nocą                                   |
| **Rola**                    | Wzorzec **architectural crop** (nie stock z drona)                       |
| **Najważniejsze elementy**  | Fasada / maszty · miska trybun jako silhouette · herb na elewacji (soft) |
| **Styl**                    | Crop monumentalny · semi-flat · crowd jako texture nie ludzie            |
| **Kompozycja**              | Silna linia horyzontu niska; maszty w górze; void sky                    |
| **Światło**                 | Floodlights dominant z masztów; bloom kontrolowany                       |
| **Kolory**                  | Void · concrete grey-blue · Flood Ivory · seat clubtint ≤1               |
| **Materiały**               | Beton · stal · szkło elewacji                                            |
| **Emocje**                  | Prestige · sublime · przynależność                                       |
| **Zastosowanie**            | Club/stadium flavor · marketing prestige · tło Match Day dalekie         |
| **Reference masters (min)** | 1× facade crop Hero · 1× silhouette strip BG                             |
| **Asset IDs**               | HERO-008 · BG-009 · STAD-001 (opcjonalnie w Foundation jeśli czas)       |
| **Uwaga**                   | W Foundation **wystarczy 1 mocny crop** — pełny WORLD-02 volume później  |

---

## 5. Element 4 — Floodlights

| Pole                        | Opis                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| **Cel**                     | Kanoniczne źródło ciepła emocji meczu                                   |
| **Rola**                    | Shared light tool — używany przez Pitch, Tunnel, Stadium, Office window |
| **Najważniejsze elementy**  | Mast silhouette · bloom sprite soft/strong · corner wash L/R            |
| **Styl**                    | Additive warm · nigdy disco multi-color · nigdy purple haze             |
| **Kompozycja**              | Bloom jako overlay; mast jako rare prop; wash z narożników              |
| **Światło**                 | 3200–3800K warm; intensywność matchday > idle                           |
| **Kolory**                  | Warm gold wash `rgba` niskie · ivory highlights                         |
| **Materiały**               | Metal masztu · „powietrze” haze                                         |
| **Emocje**                  | Presja · sacral night match                                             |
| **Zastosowanie**            | Overlay BG · matchday frames · Landing DNA bridge                       |
| **Reference masters (min)** | FLD-002 soft+strong · FLD-003 L/R · opcjonalnie FLD-001 mast            |
| **Asset IDs**               | FLD-002 · FLD-003 · BG-005                                              |

---

## 6. Element 5 — Pitch

| Pole                        | Opis                                                                            |
| --------------------------- | ------------------------------------------------------------------------------- |
| **Cel**                     | Prawda gry — wilgotna murawa jako sakralna płaszczyzna                          |
| **Rola**                    | DNA boiska; most Landing ↔ Match                                                |
| **Najważniejsze elementy**  | Low-angle turf · linie ivory · wet grain · blurred stands daleko                |
| **Styl**                    | Editorial macro/low · semi-flat · bez plastic green screen                      |
| **Kompozycja**              | Horizon niski; linie prowadzące; flood w górze kadru                            |
| **Światło**                 | Flood z góry; mokry połysk trawy                                                |
| **Kolory**                  | Pitch Emerald `#1B4D36` · Turf Alive `#3F9A6A` · Flood Ivory lines · void edges |
| **Materiały**               | Wet turf fiber · paint lines · wilgoć                                           |
| **Emocje**                  | Skupienie · sacral · napięcie przed gwizdkiem                                   |
| **Zastosowanie**            | Hero murawa · turf mist BG · grid soft · training inheritance                   |
| **Reference masters (min)** | HERO-003 · GRS-001 tile · GRS-004 lines · BG-003 · BG-004                       |
| **Asset IDs**               | HERO-003 · GRS-* · BG-003/004 · PAT-001                                         |

---

## 7. Element 6 — Tunnel

| Pole                        | Opis                                                                                                 |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Cel**                     | Najczystsza presja — wejście w mecz                                                                  |
| **Rola**                    | Wzorzec POV + kontrast cool→warm                                                                     |
| **Najważniejsze elementy**  | Vanishing tunnel · jasny prostokąt murawy na końcu · scuff concrete · opcjonalne sylwetki bez twarzy |
| **Styl**                    | POV · semi-flat · mocny kontrast końca tunelu                                                        |
| **Kompozycja**              | Punkt zbiegu w prostokąt światła; ściany prowadzą wzrok                                              |
| **Światło**                 | Cool tunnel ambient + warm pitch rectangle                                                           |
| **Kolory**                  | Concrete ash · cool grey · warm pitch glow · club stripe soft                                        |
| **Materiały**               | Beton · guma · metal rails                                                                           |
| **Emocje**                  | Adrenalina · fokus · „zaraz gwizdek”                                                                 |
| **Zastosowanie**            | Kick-Off · loading tunnel · Match Day hero co-equal z Pitch                                          |
| **Reference masters (min)** | HERO-002 · BG-010 · LOD-002                                                                          |
| **Asset IDs**               | HERO-002 · BG-010 · LOD-002                                                                          |

---

## 8. Element 7 — Shared Materials

| Pole                        | Opis                                                                             |
| --------------------------- | -------------------------------------------------------------------------------- |
| **Cel**                     | Wspólny „budulec” wszystkich lokacji                                             |
| **Rola**                    | Zapobiega driftowi — każda paczka używa tych samych powierzchni                  |
| **Najważniejsze elementy**  | Film grain · concrete ash · wet turf · brass brushed · (opcjonalnie matte glass) |
| **Styl**                    | Seamless tiles · subtelne · runtime-friendly                                     |
| **Kompozycja**              | N/A (tile) — test na void + na Hero sample                                       |
| **Światło**                 | Tekstury neutralne; reagują na Lighting System                                   |
| **Kolory**                  | Mono/desat bazowe; tint w lokacji                                                |
| **Materiały**               | Jak nazwa                                                                        |
| **Emocje**                  | Autentyczność · głębia bez hałasu                                                |
| **Zastosowanie**            | Overlay global · surfaces · Foundation bootstrap Wave 0                          |
| **Reference masters (min)** | TEX-001 · TEX-002 · TEX-003/GRS-001 · TEX-004 · BG-001                           |
| **Asset IDs**               | TEX-001/002/004 · GRS-001 · BG-001                                               |

---

## 9. Element 8 — Lighting System

| Pole                        | Opis                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Cel**                     | Jedna „fizyka światła” studia                                                 |
| **Rola**                    | Reguły, niekoniecznie osobny plik — **dokument + 1 sheet referencyjny**       |
| **Najważniejsze elementy**  | Flood warm · Desk lamp · Cool night ambient · (notatka: Medical/Museum later) |
| **Styl**                    | Dwa bieguny: warm accent + cool void; bez trzeciej dominanty                  |
| **Kompozycja**              | Sheet: 4 panele przykładów (Office / Pitch / Tunnel / Stadium)                |
| **Światło**                 | Temperatury z Art Bible §2.6                                                  |
| **Kolory**                  | Warm gold wash 4–8% · cool fill · ivory specular rare                         |
| **Materiały**               | Światło ujawnia materiał — nie zastępuje go glowem                            |
| **Emocje**                  | Matchday = więcej warm; Idle = więcej cool                                    |
| **Zastosowanie**            | Obowiązkowy reference przy każdym briefie                                     |
| **Reference masters (min)** | 1× **Lighting Reference Sheet** (kompozyt 4 paneli z Hero samples)            |
| **ID roboczy**              | `LF-A-REF-LIGHT-001`                                                          |

---

## 10. Element 9 — Texture System

| Pole                        | Opis                                                 |
| --------------------------- | ---------------------------------------------------- |
| **Cel**                     | Skala i intensywność tekstur (budżet uwagi)          |
| **Rola**                    | Grain 2–3% · turf · concrete — kiedy i jak mocno     |
| **Najważniejsze elementy**  | Opacity scale · tile size · do’s/don’ts              |
| **Styl**                    | Subtelne; nigdy „grunge poster”                      |
| **Kompozycja**              | Sheet: tekstura @ 0% / 2% / 5% / 10% — zatwierdź max |
| **Światło**                 | Tekstura nie emituje własnego koloru światła         |
| **Kolory**                  | Mono noise; turf tylko w pitch context               |
| **Materiały**               | Shared Materials + reguły użycia                     |
| **Emocje**                  | Głębia „filmowa” bez brudu                           |
| **Zastosowanie**            | Gate Quality (materiały) · BG budget ≤10%            |
| **Reference masters (min)** | 1× **Texture Scale Sheet** `LF-A-REF-TEX-001`        |
| **Powiązane**               | TEX-* · PAT-001                                      |

---

## 11. Element 10 — Color Reference

| Pole                        | Opis                                                                          |
| --------------------------- | ----------------------------------------------------------------------------- |
| **Cel**                     | Zamrożona paleta master + dozwolone gradienty                                 |
| **Rola**                    | Pierwszy element Foundation — bez niej nie ma PASS koloru                     |
| **Najważniejsze elementy**  | Swatche Void→Ivory · Brass foil · Pitch · Live scarlet (rare) · Clubtint slot |
| **Styl**                    | Czysty sheet + przykłady „good/bad adjacent”                                  |
| **Kompozycja**              | Grid swatch + 2 mini mock mood (good night pitch / bad purple)                |
| **Światło**                 | Pokazać warm vs cool na tych samych swatchach                                 |
| **Kolory**                  | Art Bible §3.1 (hex kanoniczne)                                               |
| **Materiały**               | N/A                                                                           |
| **Emocje**                  | Klarowność marki                                                              |
| **Zastosowanie**            | Każdy review kolorystyczny · token future map                                 |
| **Reference masters (min)** | 1× **Color Board** `LF-A-REF-COLOR-001`                                       |
| **Zakaz na boardzie**       | Purple · cyan cyber · cream terracotta editorial                              |

---

## 12. Zestaw referencyjny — checklista ilościowa

| #   | Master referencyjny                                  | Element          | Min.       |
| --- | ---------------------------------------------------- | ---------------- | ---------- |
| 1   | Color Board                                          | Color Reference  | 1          |
| 2   | Lighting Sheet                                       | Lighting System  | 1          |
| 3   | Texture Scale Sheet                                  | Texture System   | 1          |
| 4   | Shared tiles (grain, concrete, turf, brass, void BG) | Shared Materials | 5          |
| 5   | Flood bloom + corner wash                            | Floodlights      | 2–3        |
| 6   | Pitch hero + mist/grid                               | Pitch            | 2–3        |
| 7   | Tunnel hero + loading                                | Tunnel           | 2          |
| 8   | Stadium facade crop                                  | Night Stadium    | 1          |
| 9   | Office hero + BG wash                                | Manager Office   | 2          |
| 10  | Brand shield + monogram + LOD crest                  | Brand Identity   | 3          |
|     | **Razem**                                            |                  | **~12–18** |

To jest **cały** Foundation Pack referencyjny. Reszta Asset Library = produkcja po Style Lock.

---

## 13. Definition of Done — Foundation Pack (ten EPIC docs + przyszły render)

### Docs (teraz)

- [x] 10 elementów opisanych
- [x] Visual DNA (10 zasad)
- [x] Style Lock procedura
- [ ] Owner Review docs

### Reference Board (kolejny krok produkcyjny — nie volume)

- [ ] 12–18 masterów z tabeli §12 → Consistency Gate → APPROVED
- [ ] Lighting + Color + Texture sheets APPROVED
- [ ] Style Lock podpisany przez Owner

**Bez** Wave 2 volume. **Bez** kodu.

---

## 14. Rekomendacja następnego EPICu

### Werdykt: **najpierw walidacja Foundation Pack (Reference Board), dopiero potem volume**

| Opcja | EPIC                                                                              | Werdykt                                                  |
| ----- | --------------------------------------------------------------------------------- | -------------------------------------------------------- |
| A     | Od razu `LFE-WORLD-ART-04` (Daily Loop volume)                                    | **Za wcześnie** — drift stylu bez zatwierdzonych wzorców |
| B     | `LFE-WORLD-ART-03R` / kontynuacja 03: **Reference Board Render** (12–18 masterów) | **Rekomendowane**                                        |
| C     | `LFE-ART-DIRECTION-02` tokens w kodzie                                            | **Za wcześnie** — tokeny bez zamkniętego DNA             |

**Uzasadnienie:** WORLD-ART-02 zaplanował Wave 0–1 jako Foundation Pack produkcji grafik, ale Owner jasno ograniczył ten etap do **DNA / wzorca**, nie pełnej biblioteki. Bez APPROVED Reference Board każda grafika Wave 2 będzie zgadywaniem.  
Po Style Lock → naturalnie **`LFE-WORLD-ART-04`** = produkcja volume (Daily Loop: Locker · Transfer · Training · Icons) **ściśle według Visual DNA**.

Szczegóły DNA i procedury zamknięcia → pliki VISUAL-DNA i STYLE-LOCK.

---

## Historia

| Wersja | Data       | Opis                                    |
| ------ | ---------- | --------------------------------------- |
| 0.1.0  | 2026-07-28 | Foundation Pack spec (Visual DNA stage) |
