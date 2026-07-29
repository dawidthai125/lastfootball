# LFE-CONCEPT-ART-01 — CONCEPT ART ROADMAP

**EPIC:** LFE-CONCEPT-ART-01  
**Etap:** AUDIT + ART BIBLE + CONCEPT LIBRARY  
**Status:** DRAFT — kolejność produkcji świata (bez IMPLEMENT kodu)  
**Data:** 2026-07-28

> Roadmapa **produkcji świata wizualnego** LastFootball.  
> Kanon: [`LFE-CONCEPT-ART-01-ART-BIBLE.md`](./LFE-CONCEPT-ART-01-ART-BIBLE.md).  
> Katalog: [`LFE-CONCEPT-ART-01-ASSET-LIBRARY.md`](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md).  
> Most do UI/DS: [`LFE-ART-DIRECTION-01-AUDIT.md`](./LFE-ART-DIRECTION-01-AUDIT.md).  
> **Nie obejmuje** implementacji React/CSS — osobne EPICi skin/token po Owner GO.

---

## 0. Zasady roadmapy

1. **Najpierw lokacje osi dnia menedżera** — Gabinet → Szatnia → Transfery → Trening → Tunel/Murawa.
2. **Każda lokacja:** Concept exploration → Hero lock → BG/Textures → Props/Spots → Approve gate.
3. **AI Image Strategy** (Art Bible §6) obowiązuje w każdej fazie.
4. **§16 UI** nie jest blokowane przez brak artu — ale art nie może wymuszać anti-patternów UI.
5. Pipeline produktowy: `AUDIT → PLAN → OWNER GO → IMPLEMENT → …` — tu **IMPLEMENT = produkcja grafik**, nie kod gry, dopóki Owner nie otworzy EPICu skin.
6. Feature baseline domenowy (`9b1c575`) **bez zmian**.

---

## 1. Faza dokumentacyjna (TEN EPIC) — DONE docs draft

| Deliverable                          | Plik                                  | Stan     |
| ------------------------------------ | ------------------------------------- | -------- |
| Art Bible                            | `LFE-CONCEPT-ART-01-ART-BIBLE.md`     | DRAFT    |
| Asset Library                        | `LFE-CONCEPT-ART-01-ASSET-LIBRARY.md` | DRAFT    |
| Roadmap                              | ten plik                              | DRAFT    |
| Owner GO na kanon Night Pitch Office | —                                     | Oczekuje |

**Po GO:** zamknięcie docs EPICu / ewentualny docs-commit wg Ownera — **bez kodu**.

---

## 2. Mapa lokacji → priorytet produkcji

| #   | Lokacja                     | Priorytet | Faza art | Powód                        |
| --- | --------------------------- | --------- | -------- | ---------------------------- |
| 1   | Gabinet Menedżera           | P0        | A        | Codzienny „dom” gracza (Hub) |
| 2   | Murawa                      | P0        | A        | DNA marki / landing bridge   |
| 3   | Tunel Stadionowy            | P0        | A        | Emocja meczu (Kick-Off)      |
| 4   | Szatnia                     | P0        | B        | Kadra = daily loop           |
| 5   | Biuro Transferowe           | P0        | B        | Rynek = silna domena         |
| 6   | Boisko treningowe           | P0        | B        | Daily loop                   |
| 7   | Biuro Finansowe             | P1        | C        | Daily loop soft              |
| 8   | Stadion                     | P1        | C        | Tożsamość klubu / fasada     |
| 9   | Floodlights + Grass systems | P0/P1     | A–C      | Shared materials             |
| 10  | Pokój Analityków            | P2        | D        | Depth taktyki                |
| 11  | Centrum Medyczne            | P2        | D        | Kontuzje narrative           |
| 12  | Gabinet Skautów             | P2        | D        | Skauting future              |
| 13  | Gabinet Zarządu             | P2        | D        | Wiadomości / presja          |
| 14  | Sala Konferencyjna          | P2        | E        | Media moments                |
| 15  | Akademia                    | P2        | E        | Nadzieja / unlock flavor     |
| 16  | Muzeum Klubu                | P2        | E        | Prestige / trofea            |
| 17  | Magazyn Sprzętu             | P3        | F        | Flavor authenticity          |
| 18  | Parking Klubowy             | P3        | F        | Day-in-life                  |
| 19  | Sklep Klubowy               | P3        | F        | Merch future                 |

---

## 3. Fazy produkcji Concept Art

### Faza A — Foundation World (P0 core)

**Cel:** Gracz w 3 sekundach czuje Night Pitch Office.

| Workstream                                  | Asset IDs (przykłady)       | DoD                           |
| ------------------------------------------- | --------------------------- | ----------------------------- |
| Style frames (3–5)                          | CONCEPT only                | Owner approve light/materials |
| Gabinet Hero + BG                           | HERO-001, BG-002, OFF-*     | Gate PASS                     |
| Murawa Hero + Turf/Grid                     | HERO-003, GRS-*, BG-003/004 | Gate PASS                     |
| Tunel Hero + BG                             | HERO-002, BG-010            | Gate PASS                     |
| Shared: Grain, Flood bloom, Brass, LF brand | TEX-001, FLD-_, BRD-_       | Gate PASS                     |
| Loading crest                               | LOD-001                     | Gate PASS                     |

**Wyjście:** „Foundation Pack v1” — można projektować skóry UI bez zgadywania świata.

**Szacunek:** 25–40 master assetów.

---

### Faza B — Daily Club Loop (P0 loop)

**Cel:** Szatnia / Transfery / Trening = osobne miejsca.

| Lokacja         | Hero             | BG              | Spots/Props            |
| --------------- | ---------------- | --------------- | ---------------------- |
| Szatnia         | HERO-004         | BG-006, TEX-005 | SHT-006, ILL softlocks |
| Transfery       | HERO-005         | BG-008          | TRN-*, ILL-003/004     |
| Trening         | HERO-006         | turf training   | TRG-*, ILL-002         |
| Icons P0 set    | ICO-001…028 core | —               | SVG complete           |
| Matchday banner | BAN-001          | —               |                        |

**DoD:** Daily loop wizualnie rozróżnialny bez czytania labeli.

**Szacunek:** +30–45 assetów.

---

### Faza C — Club Prestige & Money (P1)

| Lokacja                 | Focus                     |
| ----------------------- | ------------------------- |
| Biuro Finansowe         | HERO-007, BG-007, FIN-*   |
| Stadion                 | HERO-008, STAD-*, FLD-001 |
| Crest system            | CRS-001/002/004           |
| Club banners            | BAN-004                   |
| Opponent crest generics | CRS-005                   |

**DoD:** Klub gracza ma heraldykę; finanse i stadion mają materiał.

---

### Faza D — Depth Rooms (P2 ops)

Centrum Medyczne · Analitycy · Skauci · Zarząd

**DoD:** Soft-lock / future screens mają gotowy klimat (nawet jeśli domena thin).

---

### Faza E — Story & Prestige (P2 narrative)

Konferencyjna · Akademia · Muzeum · Trophies · Match Moments core (MOM-001…003)

**DoD:** Post-match i prestige nie wyglądają jak pusty panel.

---

### Faza F — Flavor Campus (P3)

Parking · Magazyn · Sklep · Supporters advanced · Tifo

**DoD:** Opcjonalny world-building; nie blokuje UI skin.

---

## 4. Równoległe tor y (nie lokacyjne)

| Tor                 | Opis                                    | Start                                 | Zależność               |
| ------------------- | --------------------------------------- | ------------------------------------- | ----------------------- |
| **Brand Kit**       | Monogram, wordmark, shield, social      | Faza A                                | Art Bible               |
| **Icon Studio**     | Pełny zestaw sport outline              | Faza B                                | Style lock              |
| **Texture Lab**     | Seamless materials                      | Faza A                                | Style frames            |
| **Moment Studio**   | Goal/whistle/kickoff abstracts          | Faza E (szkice od B)                  | Match feel              |
| **AI Pipeline Ops** | Seed library per lokacja, review sheets | Cały czas                             | Art Bible §6            |
| **UI Skin EPICs**   | Tokens / shell / domain skins           | Po Foundation Pack + Art Direction GO | **osobne EPICi kodowe** |

---

## 5. Proponowane EPICi follow-up (nazwy robocze)

| EPIC                   | Zakres                                    | Typ                            |
| ---------------------- | ----------------------------------------- | ------------------------------ |
| `LFE-CONCEPT-ART-01`   | Art Bible + Library + Roadmap             | **Docs (ten)**                 |
| `LFE-WORLD-ART-02`     | Faza A Foundation Pack (produkcja grafik) | Art production                 |
| `LFE-WORLD-ART-03`     | Faza B Daily Club Loop art                | Art production                 |
| `LFE-WORLD-ART-04`     | Faza C Prestige & Finance art             | Art production                 |
| `LFE-WORLD-ART-05`     | Fazy D–E Depth + Moments                  | Art production                 |
| `LFE-ART-DIRECTION-02` | Tokens / typografia DS 2.0                | Docs+tokens (kod presentation) |
| `LFE-UI-SKIN-01`       | Shell + Hub skin                          | Kod presentation only          |
| `LFE-UI-SKIN-02`       | Domain screens skin                       | Kod presentation only          |

Kolejność rekomendowana po GO Biblii:

```
CONCEPT-ART-01 CLOSE (docs)
    → WORLD-ART-02 (Foundation Pack)
        → ART-DIRECTION-02 (tokens)  ∥  WORLD-ART-03 (Daily art)
            → UI-SKIN-01 (Hub/Shell)
                → UI-SKIN-02 + WORLD-ART-04…
```

---

## 6. Concept Art per lokacja — mini-checklist

Dla **każdej** lokacji z Art Bible:

- [ ] 2–3 exploration concepts (oznaczone CONCEPT)
- [ ] 1 Hero lock approved
- [ ] 1–2 Backgrounds approved
- [ ] Texture/material notes synced
- [ ] Props list checked against Asset Library
- [ ] Spot/empty/softlock jeśli dotyczy
- [ ] Sound mood 3 bullets (koncept — nie audio production)
- [ ] AI seeds zapisane
- [ ] Gate PASS w sheet przeglądu

---

## 7. Kamienie milowe immersji

| Milestone         | Kryterium „czuję świat”                                    |
| ----------------- | ---------------------------------------------------------- |
| **M1 Foundation** | Gabinet + Murawa + Tunel + Grain/Flood = jeden klimat      |
| **M2 Daily Club** | Bez czytania wiesz: szatnia vs biuro transferów vs trening |
| **M3 Prestige**   | Stadion + finanse + crest = „mój klub”                     |
| **M4 Narrative**  | Post-match / museum / board mają emocję                    |
| **M5 Campus**     | Parking/sklep/magazyn = opcjonalny lore                    |

---

## 8. Ryzyka

| Ryzyko                        | Mitygacja                            |
| ----------------------------- | ------------------------------------ |
| Drift stylu AI między sesjami | Master Lock + seed library + gate    |
| Art wymusza ścianę kart w UI  | Review z Guide §16                   |
| Scope 18 lokacji zabija MVP   | Ścisłe P0 A–B najpierw               |
| Fotorealistyczne twarze       | Zakaz w Biblii + negative lock       |
| Ciężkie pliki                 | WebP/AVIF budgets w EPICu production |
| Mylenie Art Bible z UI DS     | Osobne EPICi skin; Biblia = świat    |

---

## 9. Decyzje Owner GO

1. Akceptacja **Art Bible** jako SSOT świata?
2. Akceptacja kolejności faz **A → B → C → …**?
3. Czy `LFE-WORLD-ART-02` (Foundation Pack) ma iść **przed** `LFE-ART-DIRECTION-02` (tokens)? (rekomendacja: **tak**)
4. Czy docs tego EPICu mają dostać **GO → COMMIT** (tylko markdown)?
5. Czy któraś lokacja P2 ma awansować do P0 (np. Zarząd / Medyczne)?

---

## 10. Status EPICu

|               |                                    |
| ------------- | ---------------------------------- |
| Dokumenty     | 3/3 DRAFT utworzone                |
| Kod           | **0 zmian**                        |
| Commit / push | **Zakazane** do Owner GO           |
| Następny krok | Owner Review → GO / korekty Biblii |

---

## Historia

| Wersja | Data       | Opis                          |
| ------ | ---------- | ----------------------------- |
| 0.1.0  | 2026-07-28 | Pierwsza roadmapa Concept Art |
