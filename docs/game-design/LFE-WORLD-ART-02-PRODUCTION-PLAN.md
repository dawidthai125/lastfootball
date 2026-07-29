# LFE-WORLD-ART-02 — PRODUCTION PLAN

**EPIC:** LFE-WORLD-ART-02  
**Etap:** PLAN + WORLD CONCEPT PRODUCTION (studio)  
**Status:** DRAFT — plan studia (bez generowania obrazów · bez UI · bez kodu)  
**Data:** 2026-07-28  

> Kompletny **plan produkcji świata wizualnego** LastFootball.  
> Nie zawiera promptów do pojedynczych grafik ani plików obrazów.  
> SSOT stylu: [`LFE-CONCEPT-ART-01-ART-BIBLE.md`](./LFE-CONCEPT-ART-01-ART-BIBLE.md).  
> Katalog ID: [`LFE-CONCEPT-ART-01-ASSET-LIBRARY.md`](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md).  
> Roadmapa faz A–F: [`LFE-CONCEPT-ART-01-ROADMAP.md`](./LFE-CONCEPT-ART-01-ROADMAP.md).  
> Most UI/DS: [`LFE-ART-DIRECTION-01-AUDIT.md`](./LFE-ART-DIRECTION-01-AUDIT.md).  
> Quality: [`LFE-WORLD-ART-02-QUALITY-GUIDE.md`](./LFE-WORLD-ART-02-QUALITY-GUIDE.md).  
> Backlog: [`LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md`](./LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md).

---

## 0. Cel EPICu (ten etap)

| Robimy | Nie robimy |
| ------ | ---------- |
| Plan całego studia artystycznego | Generowanie obrazów |
| Podział świata na paczki WORLD-01…12 | Promptów ad-hoc / „jedna grafika na raz” |
| Mapowanie Hero / Secondary / BG / Empty / Loading / Marketing | React · CSS · komponenty |
| Pipeline Brief→Library | Commit / push bez Owner GO |
| Rekomendacja kolejnego EPICu | Zmiana DTO / resolverów / feature baseline |

**Misja studia:** zbudować spójny świat **Night Pitch Office**, w którym każda przyszła skóra UI „dzieje się w miejscu”.

---

## 1. Model studia

### 1.1 Role (koncepcyjne)

| Rola | Odpowiedzialność |
| ---- | ---------------- |
| **Art Director** | Kanon Biblii, PASS/FAIL, seed discipline |
| **World Lead** | Paczki WORLD-*, kolejność, DoD paczki |
| **Concept Artist / AI Operator** | Moodboard → Concept → Iteration (wg pipeline) |
| **Librarian** | Naming, wersje, katalog `LF-A-*`, export specs |
| **Owner** | GO na paczki / CLOSE / priorytety P0–P3 |

### 1.2 Zasada produkcji

```
Paczka WORLD-XX
  → Style lock (jeśli pierwsza w torze)
  → Hero lock
  → Secondary + Background
  → Empty + Loading
  → Marketing (opcjonalnie w tej samej paczce lub później)
  → Props / textures shared
  → Quality Gate (Quality Guide)
  → Export + Library + Versioning
```

**Zakaz:** produkcja marketingu przed Hero lock lokacji bazowej (wyjątek: WORLD-12 Brand Identity może iść równolegle od startu).

### 1.3 Kolejność paczek (studio schedule)

| Wave | Paczki | Uzasadnienie |
| ---- | ------ | ------------ |
| **Wave 0** | WORLD-12 (Brand) + shared materials bootstrap | Identyfikacja + grain/flood/turf tools |
| **Wave 1** | WORLD-01 · WORLD-10 (część murawa/tunel) · shared pitch | Dom gracza + DNA meczu |
| **Wave 2** | WORLD-04 · WORLD-05 · WORLD-03 | Daily loop |
| **Wave 3** | WORLD-02 · WORLD-06 | Prestige + pieniądze |
| **Wave 4** | WORLD-07 · WORLD-08 · WORLD-09 | Depth rooms |
| **Wave 5** | WORLD-10 (moments domknięcie) · WORLD-11 | Emocja trybun |

Mapowanie do Concept Roadmap: Wave 0–1 ≈ Faza A · Wave 2 ≈ B · Wave 3 ≈ C · Wave 4 ≈ D–E · Wave 5 ≈ E–F.

---

## 2. Paczki świata (WORLD-01 … WORLD-12)

Dla każdej paczki: cel · klimat · emocje · kolor · światło · materiały · tekstury · styl · liczba grafik · priorytet · kolejność.

> **Liczba grafik** = orientacyjna liczba **master deliverables** (warianty night/matchday liczone osobno w backlogu jako joby).

---

### WORLD-01 — Manager Office

| Pole | Opis |
| ---- | ---- |
| **Cel** | Codzienny „dom” menedżera — oś Hub / decyzji |
| **Klimat** | Cisza nocna, widok na stadion za szybą, ciężar herbu |
| **Emocje** | Odpowiedzialność · spokój luksusu · samotność roli |
| **Kolorystyka** | Night navy · ash · brass · desk warm · club accent na herbie |
| **Światło** | Lampka biurkowa + distant floodlights |
| **Materiały** | Ciemne drewno · skóra · matowe szkło · mosiądz |
| **Tekstury** | Wood grain soft · glass · paper · film grain |
| **Styl ilustracji** | Semi-flat editorial · FG desk props · cropped window |
| **Liczba grafik (MVP)** | ~14 master (Hero×2 ratio + Secondary + BG×3 + Empty + Loading + Marketing + props 4–6) |
| **Priorytet** | **P0** |
| **Kolejność** | Wave 1 · **pierwsza lokacja narracyjna** (po bootstrap Brand/shared) |
| **Art Bible** | §4.1 Gabinet |
| **Asset kotwice** | HERO-001 · BG-002 · OFF-* · LOD desk · ILL board letter |

---

### WORLD-02 — Stadium

| Pole | Opis |
| ---- | ---- |
| **Cel** | Skala i duma klubu — fasada / miska trybun |
| **Klimat** | Architektura nocą · floodlight sublime |
| **Emocje** | Prestige · przynależność · ambicja |
| **Kolorystyka** | Void · concrete blue-grey · flood ivory · seat clubtint |
| **Światło** | Dominujące maszty floodlight |
| **Materiały** | Beton · stal · siedzenia · szkło elewacji |
| **Tekstury** | Concrete ash · crowd dotfield |
| **Styl** | Architectural crop · nie pełny stock stadium |
| **Liczba MVP** | ~12 (Hero + Secondary + BG + Loading + Marketing + STAD/FLD set) |
| **Priorytet** | **P1** |
| **Kolejność** | Wave 3 (po daily loop) |
| **Art Bible** | §4.2 Stadion (+ elementy §4.12 Parking jako flavor później) |
| **Kotwice** | HERO-008 · STAD-* · FLD-001 · BG-009 |

---

### WORLD-03 — Training Ground

| Pole | Opis |
| ---- | ---- |
| **Cel** | Codzienna praca sztabu — dyscyplina, nie glamour |
| **Klimat** | Boisko treningowe · cones · mniej „Champions League” |
| **Emocje** | Dyscyplina · rytm · nadzieja (lekka) |
| **Kolorystyka** | Cooler green · ash cones · muted gold |
| **Światło** | Day-for-club **lub** training flood (oba warianty) |
| **Materiały** | Trawa · plastik cones · siatki · metal bramek |
| **Tekstury** | Turf · chalk marks |
| **Styl** | Editorial workmanlike · silhouettes distant |
| **Liczba MVP** | ~12 (Hero + Secondary + BG + Empty softlock + Loading + Marketing + TRG props) |
| **Priorytet** | **P0** (daily) |
| **Kolejność** | Wave 2 |
| **Art Bible** | §4.4 |
| **Kotwice** | HERO-006 · TRG-* · ILL-002 · GRS shared |

---

### WORLD-04 — Locker Room

| Pole | Opis |
| ---- | ---- |
| **Cel** | Intymność drużyny — Kadra jako szatnia |
| **Klimat** | Lockers · koszulki bez twarzy · warm bulbs |
| **Emocje** | Wspólnota · napięcie przed/po · przynależność |
| **Kolorystyka** | Cool concrete · metal · kit clubtint · warm bulb |
| **Światło** | Warm bulbs + cool fluorescent mix |
| **Materiały** | Metal · drewno ławek · tkanina · guma |
| **Tekstury** | Mesh · fabric weave · scratched metal |
| **Styl** | Row of kits · tunnel light at end optional |
| **Liczba MVP** | ~13 |
| **Priorytet** | **P0** |
| **Kolejność** | Wave 2 · **pierwsza w daily loop** |
| **Art Bible** | §4.5 |
| **Kotwice** | HERO-004 · BG-006 · SHT-006 · TEX-005 |

---

### WORLD-05 — Transfer Office

| Pole | Opis |
| ---- | ---- |
| **Cel** | Negocjacja i kontrakt — poker menedżerski |
| **Klimat** | Biurko · papier · pieczęć · blinds |
| **Emocje** | Skupienie · deal · napięcie kontrolowane |
| **Kolorystyka** | Ash · ledger cream muted · brass · soft screen |
| **Światło** | Desk lamp + monitor glow (nie neon) |
| **Materiały** | Papier · skóra teczki · szkło · metal |
| **Tekstury** | Paper fiber · leather |
| **Styl** | Contract-first composition · sylwetki tablicy bez twarzy |
| **Liczba MVP** | ~13 |
| **Priorytet** | **P0** |
| **Kolejność** | Wave 2 (po lub równolegle z WORLD-04) |
| **Art Bible** | §4.6 |
| **Kotwice** | HERO-005 · BG-008 · TRN-* · ILL-003/004 |

---

### WORLD-06 — Finance Office

| Pole | Opis |
| ---- | ---- |
| **Cel** | Trzeźwość budżetu — księga klubu |
| **Klimat** | Ledger · pieczęć · szafa akt |
| **Emocje** | Kontrola · ciężar · spokój liczb |
| **Kolorystyka** | Ledger green-grey · paper ivory · brass soft |
| **Światło** | Cool office + warm desk |
| **Materiały** | Paper · binder · glass · metal |
| **Tekstury** | Ledger lines · paper fiber |
| **Styl** | Open book hero · bez „fintech dashboard art” |
| **Liczba MVP** | ~11 |
| **Priorytet** | **P1** |
| **Kolejność** | Wave 3 |
| **Art Bible** | §4.16 |
| **Kotwice** | HERO-007 · BG-007 · FIN-* · EMP-003 |

---

### WORLD-07 — Board Room

| Pole | Opis |
| ---- | ---- |
| **Cel** | Władza i ocena — presja zarządu |
| **Klimat** | Długi stół · ciemne drewno · herb na ścianie |
| **Emocje** | Ocena · prestige polityczne · napięcie |
| **Kolorystyka** | Dark wood · deep navy · heavier brass · burgundy soft |
| **Światło** | Soft sconces / chandelier dust |
| **Materiały** | Polished wood · leather · glass case |
| **Tekstury** | Wood polish · carpet |
| **Styl** | Empty chairs power composition |
| **Liczba MVP** | ~10 |
| **Priorytet** | **P2** |
| **Kolejność** | Wave 4 |
| **Art Bible** | §4.9 (+ Konferencyjna §4.10 jako secondary w tej paczce lub osobny job) |
| **Kotwice** | HERO-009 · BG-012 · ILL-007 |

**Uwaga planu:** Sala Konferencyjna = **Secondary stream** wewnątrz WORLD-07 (HERO-011), nie osobna paczka Ownera — żeby nie mnożyć WORLD-ID.

---

### WORLD-08 — Medical Centre

| Pole | Opis |
| ---- | ---- |
| **Cel** | Troska i chłód — kontuzja bez horroru |
| **Klimat** | Clinical calm · leżanka · frost glass |
| **Emocje** | Niepokój kontrolowany · opieka |
| **Kolorystyka** | Cool blue-white · steel · soft mint · night window |
| **Światło** | Clinical cool vs night contrast |
| **Materiały** | Stal · plastik medyczny · tkanina |
| **Tekstury** | Smooth sterile · soft fabric |
| **Styl** | Clean · bez gore · bez twarzy pacjentów |
| **Liczba MVP** | ~10 |
| **Priorytet** | **P2** |
| **Kolejność** | Wave 4 |
| **Art Bible** | §4.7 |
| **Kotwice** | HERO-013 · BG-011 · MED-* · ILL-008 |

---

### WORLD-09 — Academy

| Pole | Opis |
| ---- | ---- |
| **Cel** | Nadzieja i przyszłość klubu |
| **Klimat** | Youth pitch · jaśniejsze światło (wyjątek day-for-club) |
| **Emocje** | Optymizm spokojny · przynależność przyszła |
| **Kolorystyka** | Fresh turf · warmer daylight · bib clubtint |
| **Światło** | Natural preferential |
| **Materiały** | Trawa · małe bramki · tablice |
| **Tekstury** | Fresh turf · chalk |
| **Styl** | Hopeful · silhouettes youth · nie „dziecięcy cartoon” |
| **Liczba MVP** | ~10 |
| **Priorytet** | **P2** |
| **Kolejność** | Wave 4 (po Board/Medical lub równolegle) |
| **Art Bible** | §4.8 |
| **Kotwice** | HERO-012 · ILL-009 |

**Uwaga:** Gabinet Skautów + Pokój Analityków (P2 depth) = **jobs dodatkowe** w Wave 4 backlog (`WORLD-09b Scout` / `WORLD-09c Analyst`) — nie osobne WORLD-ID w tym planie Ownera; briefy z Art Bible §4.14–4.15.

---

### WORLD-10 — Match Day

| Pole | Opis |
| ---- | ---- |
| **Cel** | Emocja meczu — murawa · tunel · flood · moments |
| **Klimat** | Presja · sacral pitch · light at end of tunnel |
| **Emocje** | Presja · adrenalina · fokus · catharsis (moments) |
| **Kolorystyka** | Pitch emerald · flood ivory · void · live scarlet rare |
| **Światło** | Flood warm dominant · tunnel cool→warm |
| **Materiały** | Wet turf · concrete tunnel · rubber · paint lines |
| **Tekstury** | Turf fiber · concrete scuff · grain |
| **Styl** | Low-angle pitch · POV tunnel · abstract moments (bez twarzy) |
| **Liczba MVP** | ~18 (największa paczka emocji: Murawa + Tunel + Moments + banners + loading) |
| **Priorytet** | **P0** (rdzeń) + P1 moments |
| **Kolejność** | Wave 1 (murawa+tunel+flood) → Wave 5 (moments domknięcie) |
| **Art Bible** | §4.3 Murawa · §4.11 Tunel · Match Moments |
| **Kotwice** | HERO-002/003 · BG-003/004/005/010 · GRS-* · FLD-* · MOM-* · BAN-001 · LOD-002 |

---

### WORLD-11 — Supporters

| Pole | Opis |
| ---- | ---- |
| **Cel** | Kibic i barwy — energia bez chaosu IP |
| **Klimat** | Crowd silhouette · szalik · tifo abstract |
| **Emocje** | Przynależność · duma · ciepło trybun |
| **Kolorystyka** | Clubtint controlled · night stands · warm edges |
| **Światło** | Bowl flood spill · soft smoke rare |
| **Materiały** | Knit scarf · fabric · plastic seats abstract |
| **Tekstury** | Crowd dotfield · knit |
| **Styl** | **Zero twarzy** · zero real club IP · geometric tifo |
| **Liczba MVP** | ~10 |
| **Priorytet** | **P2/P3** |
| **Kolejność** | Wave 5 |
| **Art Bible** | Supporters + Sklep/Muzeum flavor |
| **Kotwice** | SUP-* · SCF-* · PAT-005 · HERO museum/shop opcjonalnie |

---

### WORLD-12 — Brand Identity

| Pole | Opis |
| ---- | ---- |
| **Cel** | System marki LF + narzędzia herbu gracza |
| **Klimat** | Prestige brass · night void · condensed sport letter |
| **Emocje** | Ambicja · zaufanie premium · klarowność marki |
| **Kolorystyka** | Brass gold · void ink · flood ivory |
| **Światło** | Foil catchlight · museum spot na shield |
| **Materiały** | Brushed brass · matte ink · paper brand |
| **Tekstury** | Foil · grain |
| **Styl** | Vector-first · semi-flat shield · no toy 3D |
| **Liczba MVP** | ~20 (monogram · wordmark · shield · app icon · social · crest frames · template pack A · placeholder) |
| **Priorytet** | **P0** |
| **Kolejność** | **Wave 0 — start równoległy / pierwszy** |
| **Kotwice** | BRD-* · CRS-* · LOD-001 · BDG-005 · ICO core start |

---

## 3. Hero Artwork Plan (per paczka)

Dla każdej lokacji / paczki — sześć typów deliverable.

| Paczka | Hero Artwork | Secondary Artwork | Background | Empty State | Loading Screen | Marketing Illustration |
| ------ | ------------ | ----------------- | ---------- | ----------- | -------------- | ---------------------- |
| **WORLD-01** | Desk+crest+window flood (HERO-001) | Lamp pool detail / empty chair | Gabinet wash night/matchday/idle (BG-002) | Empty inbox on desk (ILL-001) | Desk night (LOD-004) | „Twój klub czeka” office window key art |
| **WORLD-02** | Facade crop night (HERO-008) | Stand bowl crop (STAD-003) | Silhouette strip (BG-009) | Gate locked soft (ILL-011) | Facade slow push | Stadium prestige key art |
| **WORLD-03** | Cones+portable goal (HERO-006) | Ball bag / coach board | Turf mist training | Soft-lock cones fog (ILL-002) | Turf closeup training | Daily work key art |
| **WORLD-04** | Kits row no faces (HERO-004) | Bench+boots detail | Mesh fabric (BG-006) | Empty locker (EMP-002) | Kits row mobile | Squad identity key art |
| **WORLD-05** | Contract+pen (HERO-005) | Stamp+portfolio | Blinds (BG-008) | Empty market / closed window (ILL-003/004) | Contract desk | Negotiation prestige art |
| **WORLD-06** | Open ledger+seal (HERO-007) | Binder stack | Ledger paper (BG-007) | Blank ledger (EMP-003) | Ledger close | Discipline of numbers art |
| **WORLD-07** | Long table+crest wall (HERO-009) | Press room mics (HERO-011) | Curtain wash (BG-012) | Board letter sealed (ILL-007) | Boardroom dust light | Power & scrutiny art |
| **WORLD-08** | Treatment table calm (HERO-013) | Ice+tape still life | Frost glass (BG-011) | Injury notice (ILL-008) | Cool corridor | Care & recovery art |
| **WORLD-09** | Youth small goals (HERO-012) | Scout map pins (HERO-015) alt stream | Campus soft day | Youth prospect (ILL-009) | Academy daylight | Future of the club art |
| **WORLD-10** | Pitch low-angle (HERO-003) **or** Tunnel POV (HERO-002) as co-heroes | Kick-off / whistle moments | Turf mist · grid · flood L/R · tunnel grad | No fixtures (EMP-001) | Tunnel walk (LOD-002) + turf macro | Match night brand hero (landing bridge) |
| **WORLD-11** | Scarf cascade / crowd sil | Folded scarves | Crowd dotfield | — (używa shop empty later) | Crowd soft | Fan belonging art |
| **WORLD-12** | LF Shield foil | Monogram + wordmark lockups | Void grain brand | — | Crest breath (LOD-001) | Full brand campaign set |

**Zasada:** Hero = emocja lokacji. Background = ≤10% uwagi pod przyszłą treść. Marketing nie łamie Master Lock Biblii.

---

## 4. Shared production layers (poza WORLD, ale obowiązkowe)

Produkowane w Wave 0–1, używane przez wszystkie paczki:

| Warstwa | Deliverables | Priorytet |
| ------- | ------------ | --------- |
| Film grain | TEX-001 | P0 |
| Concrete ash | TEX-002 | P0 |
| Wet turf tile + line paint | GRS-001 · GRS-004 | P0 |
| Flood bloom + corner wash | FLD-002 · FLD-003 | P0 |
| Pitch micro grid pattern | PAT-001 | P0 |
| Void grain BG | BG-001 | P0 |
| Icon core set | ICO-001…021 min | P0 (Wave 2 complete) |

Bez shared layers **nie startować** Wave 2 lokacji daily.

---

## 5. AI Pipeline (system studia)

Pełna ścieżka **każdego** assetu master:

```
1. Brief
2. Moodboard
3. Concept
4. Review
5. Iteration
6. Approval
7. Export
8. Library
9. Versioning
```

### 5.1 Brief

- Paczka WORLD-XX · Asset ID `LF-A-*` · typ (Hero/BG/…)  
- Cytat z Art Bible (lokacja) — 5–8 zdań max  
- Wymagane warianty · ratio · safe area  
- Zakazy (twarze, UI chrome, purple, IP)  
- **Bez** finalnego promptu w tym dokumencie planu — prompt powstaje w Brief ticket dopiero po Owner GO na produkcję obrazów  

### 5.2 Moodboard

- 6–12 referencji **ducha** (nie do skopiowania)  
- 1 strona palety z Biblii  
- 1 strona materiałów  
- Oznaczenie: `MOOD-WORLD-XX-vN`  

### 5.3 Concept

- 2–3 warianty kompozycji (oznaczone CONCEPT)  
- Master Lock + Location Modifier z Biblii §6  
- Seed family zapisany  

### 5.4 Review

- Quality Guide checklist (7 kryteriów + Consistency Gate)  
- Art Director: PASS / ITERATE / FAIL  

### 5.5 Iteration

- Max 3 rundy zanim eskalacja do Owner  
- Zmiana tylko briefed axes (światło / crop / materiał) — nie „nowy świat”  

### 5.6 Approval

- Status `APPROVED` w backlogu  
- Snapshot w review sheet  

### 5.7 Export

- Master PNG/TIFF lub SVG wg typu  
- Runtime: WebP/AVIF + rozmiary z Asset Library §0.3  
- Usunięcie czytelnego tekstu losowego  

### 5.8 Library

- Plik w strukturze katalogu (docelowej, nie w tym EPICu kodowym):  
  `art/world/WORLD-XX/{type}/{LF-A-*-vN}.*`  
- Wpis w Asset Library (status kolumna future)  

### 5.9 Versioning

- `v01` concept · `v02+` iteration · `vN-approved` freeze  
- Breaking style change = nowy major (`v10`) + notatka w Quality Guide changelog  

Szczegóły PASS/FAIL → Quality Guide.

---

## 6. Definition of Done — paczka WORLD-XX

Paczka = **DONE (art)** gdy:

1. Hero (desktop + mobile jeśli P0) APPROVED  
2. Secondary APPROVED  
3. ≥1 Background atmosphere APPROVED  
4. Empty **lub** soft-lock spot (jeśli dotyczy domeny) APPROVED  
5. Loading (jeśli P0/P1) APPROVED  
6. Marketing — **opcjonalnie** dla P2; dla P0 Wave 1–2: ≥1 key art  
7. Shared textures użyte poprawnie  
8. Quality Gate PASS na wszystkich masterach  
9. Library + versioning kompletne  
10. Brak naruszenia Guide §16 (art nie wymusza KPI wall)

---

## 7. Poza zakresem LFE-WORLD-ART-02 (PLAN)

- Generowanie / eksport plików obrazów (→ kolejny EPIC produkcji po GO)  
- Implementacja w `apps/web`  
- Tokeny CSS / Design System 2.0 kod  
- Zmiana UI Guide §16  
- Audio production (tylko mood notes w Biblii)

---

## 8. Rekomendacja kolejnego EPICu

### Rekomendacja: **`LFE-WORLD-ART-03` — Foundation Pack Production**

**Zakres:** Wave 0 + Wave 1 = produkcja grafik (nie kod):

1. WORLD-12 Brand Identity (P0 core: monogram, shield, wordmark, LOD-001, crest frame/placeholder)  
2. Shared layers (grain, turf, flood, void, grid)  
3. WORLD-01 Manager Office (pełny zestaw Hero→Marketing)  
4. WORLD-10 Match Day **rdzeń** (Murawa + Tunel + flood overlays + LOD-002)  

**Uzasadnienie:**

- Art Bible i Asset Library już definiują *co*; ten PLAN definiuje *jak i w jakiej kolejności*.  
- Bez Foundation Pack każda kolejna lokacja będzie dryfować stylistycznie.  
- Brand + Gabinet + Murawa/Tunel zamykają lukę Landing→Hub (największy problem immersji).  
- UI skin / tokens (`LFE-ART-DIRECTION-02`) mają sens **dopiero gdy** Foundation Pack ma APPROVED masters — inaczej tokeny zgadują kolory pod pustkę.  
- Daily loop (WORLD-03/04/05) = naturalny **WORLD-ART-04** po zamknięciu Foundation.

**Alternatywa (nie rekomendowana teraz):** skok do `LFE-ART-DIRECTION-02` (tokens) — przyspiesza CSS, ale utrwala ryzyko „ładne tokeny na wciąż SaaS-owym świecie bez assetów”.

---

## 9. Decyzje Owner GO (ten PLAN)

1. Akceptacja podziału **WORLD-01…12** i Wave 0–5?  
2. Akceptacja Hero Plan (6 typów / paczka)?  
3. GO na otwarcie **`LFE-WORLD-ART-03` Foundation Pack Production**?  
4. Czy docs PLAN (3 pliki) mają dostać osobny docs-commit?  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Pierwszy Production Plan (LFE-WORLD-ART-02) |
