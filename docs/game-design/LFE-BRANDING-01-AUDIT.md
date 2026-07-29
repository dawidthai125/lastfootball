# LFE-BRANDING-01 — AUDIT · RCA · KONCEPCJE LOGO

**EPIC:** LFE-BRANDING-01  
**Etap:** BRAND REFRESH — analiza i propozycje (BEZ IMPLEMENTACJI)  
**Data:** 2026-07-29  
**Wejście:** Owner GO po LFE-LANDING-01  
**Status:** **DRAFT — oczekuje wyboru koncepcji przez Ownera**

> Na tym etapie: **nie** tworzymy SVG · **nie** podmieniamy logo w UI · **nie** commit · **nie** push.  
> Po Owner GO: osobny etap IMPLEMENT (assety + wiring chrome).

---

## 0. Zakres i twarde ograniczenia

| Dozwolone                                            | Zakazane                              |
| ---------------------------------------------------- | ------------------------------------- |
| Redesign **znaku / wordmarku** produktu LastFootball | Zmiana nazwy „LastFootball”           |
| Nowe kształty w ramach istniejącej palety            | Nowe kolory marki / tokeny DS         |
| Plan wersji assetów                                  | Zmiana Visual DNA / Style Lock        |
| Propozycje koncepcyjne                               | Zmiana World Art lokacji / UI screens |

**Visual DNA (LOCK):** Night Pitch Office · Void + Brass Gold · semi-flat sport editorial · **klub gracza > logo produktu** · marka = prestige frame (monogram / shield), nie watermark.

---

# 1. Audit obecnego logo

## 1.1 Co gracz widzi dziś (shipped UI)

| Kontekst                | Implementacja                                                                            | Poziom                    |
| ----------------------- | ---------------------------------------------------------------------------------------- | ------------------------- |
| Landing header          | CSS kwadrat `lf-landing__brand-mark` (12×12, `gold-base`) + tekst Archivo „LASTFOOTBALL” | **Placeholder mark**      |
| Landing hero            | Sam wordmark CSS (gold caps) — bez sygnetu                                               | Tekst UI, nie brand asset |
| Auth header             | Ten sam CSS mark                                                                         | Placeholder               |
| Favicon / app icon / OG | **Brak** dedykowanych assetów w `apps/web`                                               | Luka                      |
| TopBar (gra)            | Tekst „LastFootball · …” — bez marku produktu (zgodnie z DNA: klub > produkt)            | OK hierarchia             |

**Werdykt UX:** Po cinematic Landing (Tunnel full-bleed) header pokazuje **złoty kwadrat** — sygnał „MVP / brak brandu”, nie „premium manager”.

## 1.2 Co istnieje w World Art (niepodpięte do chrome)

| ID            | Asset                                    | Styl                        | Gate            | Użycie w UI |
| ------------- | ---------------------------------------- | --------------------------- | --------------- | ----------- |
| **BRD-001**   | Monogram LF (serif, brushed brass)       | Prestige serif interlocking | PASS SOFT       | **Nie**     |
| **BRD-002**   | Wordmark `LASTFOOTBALL` condensed italic | Sport slant                 | PASS            | **Nie**     |
| **BRD-003**   | Shield + LF + ball + stripes             | Klasyczny herb 3D foil      | PASS SOFT       | **Nie**     |
| BRD-004 / 005 | App icon · Social kit                    | —                           | **DEFERRED P1** | Brak        |

Źródła: `docs/verification/lfe-world-art-04/lf-a-brd-00{1,2,3}-*.png` · REF-01 brand identity.

## 1.3 Ocena obecnego systemu (as-is)

| Kryterium              | UI CSS mark | BRD pack (WA) | Komentarz                                                |
| ---------------------- | ----------- | ------------- | -------------------------------------------------------- |
| Nowoczesność           | 1/5         | 3/5           | Kwadrat = zero designu; shield = klasyczny / ciężki      |
| Minimalizm             | 5/5 (zbyt)  | 2/5 (shield)  | Monogram BRD-001 bliżej celu                             |
| Czytelność mała        | 2/5         | 2–3/5         | Shield: ball+stripes giną @16px; monogram OK @24px       |
| Czytelność duża        | 2/5         | 4/5           | WA ma prestiż; UI nie                                    |
| Spójność z Landing P0  | 1/5         | 3/5           | Gap: cinematic world vs square                           |
| DNA Night Pitch Office | 3/5 (kolor) | 4/5           | Kolor OK; forma UI nie                                   |
| Skalowalność systemu   | 1/5         | 3/5           | Brak SVG master · brak mono/light · BRD-004/005 deferred |

## 1.4 Problem Ownera (potwierdzony)

> „Obecne logo wygląda zbyt prosto i nie pasuje poziomem do nowego UI.”

To dotyczy **shipped chrome** (CSS square + UI type), niekoniecznie jakości samych renderów BRD.  
Dodatkowo BRD-003 jest **zbyt heraldyczny / detaliczny** jak na nowoczesny product mark przy faviconie i obok UI P0.

---

# 2. RCA (Root Cause Analysis)

| ID     | Przyczyna                                                                                 | Skutek                                          |
| ------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| **R1** | Landing chrome nigdy nie dostał prawdziwego marku — tylko `background: gold` square       | „MVP badge” obok Tunnel hero                    |
| **R2** | Brand pack BRD-001…003 wyprodukowany jako WA, **nie zintegrowany** z headerem / faviconem | Dwa światy: art folder vs produkt               |
| **R3** | BRD-003 (shield+ball+stripes) optymalizowany pod **prestige still**, nie pod **UI scale** | Trudny favicon / rail / tab                     |
| **R4** | Wordmark hero = Archivo UI caps, nie BRD-002 lockup                                       | Brand nieczytelny jako system (brak master SVG) |
| **R5** | BRD-004 App icon · BRD-005 Social — **deferred**                                          | Brak obecności w browser / share                |
| **R6** | Po LFE-LANDING-01 podniesiono jakość świata → **luka brandu** stała się widoczna          | Owner GO na BRANDING-01                         |

**Werdykt RCA:** To nie „zły kolor” ani „zła nazwa”. To **brak skalowalnego product marku w chrome** + **nadmiar detalu w heraldycznym shieldzie** względem nowoczesnego UI P0.

---

# 3. Benchmark konkurencji

| Marka                | Styl                        | Typografia                | Znak                                           | Kolorystyka                            | Skalowalność              | Czytelność          | Lekcja dla LF                                 |
| -------------------- | --------------------------- | ------------------------- | ---------------------------------------------- | -------------------------------------- | ------------------------- | ------------------- | --------------------------------------------- |
| **Football Manager** | Utilitarny product brand    | Sans condensed / bold     | Często wordmark-first; SI Sports Interactive   | Ciemny + accent                        | Wordmark czytelny w store | Wysoka w marketingu | Wordmark może prowadzić; ikona osobno         |
| **EA Sports FC**     | Athletic bold · cinematic   | Ultra-bold sans / display | EA pill + FC wordmark · ball motifs w kampanii | Czarny / white / neon accents sezonowe | Silna (EA monogram)       | Bardzo wysoka       | Oddziel **monogram ikony** od **kampanii**    |
| **Top Eleven**       | Mobile sports pop           | Rounded bold              | Figurative / crest-ish app icon                | Żywsze, bardziej casual                | App-icon first            | Wysoka na mobile    | LF **nie** idzie w casual pop (DNA)           |
| **Hattrick**         | Klasyczny community / crest | Serif/legacy feel         | Crest-like heritage                            | Tradycyjne barwy                       | Średnia (detal herbu)     | Średnia @małe       | Heritage OK, ale nie kopiować ciężkiego herbu |
| **FootballTeam**     | Sport UI / modern game      | Sans sport                | Często ball/crest hybrid                       | Ciemny + accent                        | Średnia–dobra             | Dobra               | Hybrid mark + wordmark                        |

### Wnioski (bez kopiowania)

1. **Product mark ≠ club crest** — konkurencja rozdziela ikonę marki od herbu klubu (zgodne z DNA §9).
2. **System > jeden render** — monogram @16px + wordmark @hero + app icon.
3. **Flat / semi-flat wektor** wygrywa skalę; foil 3D zostaje do key art / splash, nie do tab browsera.
4. LastFootball powinien zostać przy **brass + void**, nie EA-neon i nie Top Eleven pop.

---

# 4. Pięć koncepcji logo

> Wszystkie zachowują nazwę **LastFootball** i paletę **Void / Brass Gold / Pitch (opcjonalny akcent ≤10%)**.  
> Bez nowych kolorów marki.

---

## K1 — Geometric Brass Monogram „LF”

**Styl:** Minimalistyczny monogram geometryczny (semi-flat). Litery L+F z jednego kroju condensed / Archivo-adjacent, interlocking bez szeryfów dekoracyjnych. Płaski brass fill lub 1 hairline outline. Zero piłki, zero tarczy.

**Inspiracja:** Ewolucja BRD-001 w stronę UI-scale; monogramy EA / luxury sport marks (forma, nie IP).

**Zalety:**

- Najlepsza skalowalność (favicon 16–32, app icon).
- Nowoczesny / minimalistyczny (Owner brief).
- DNA §9: nie konkuruje z herbem klubu.
- Spójny z Landing P0 i tokenami gold.

**Wady:**

- Słabsze „piłkarskie” skojarzenie bez kontekstu słowa Football.
- Wymaga silnego wordmarku obok w marketingu.

**Najlepiej wygląda:** Header · favicon · app icon · splash LOD · watermark subtle.

---

## K2 — Flat Prestige Shield (uproszczony)

**Styl:** Tarcza o **jednej** obwódce brass + monogram LF w środku. Usunięte: piłka, paseki, emboss 3D. Semi-flat (1 fill + 1 stroke). Opcjonalnie micro pitch-notch u dołu (1 detal).

**Inspiracja:** Uproszczenie BRD-003 / REF-01; klasyczne herby klubów → flat redesign (jak trendy crest→mark).

**Zalety:**

- Natychmiastowe „klub / prestige”.
- Kontynuacja już zaakceptowanego kierunku REF-01.
- Dobry na splash / loading / social.

**Wady:**

- Przy 16px tarcza + LF walczą o piksele.
- Ryzyko mylenia z **herbem klubu gracza** (DNA §9 — wymaga dyscypliny użycia tylko jako product frame).

**Najlepiej wygląda:** Loading · OG image · store feature · marketing poster (duży).

---

## K3 — Wordmark Condensed Lockup „LASTFOOTBALL”

**Styl:** Wordmark-first: condensed uppercase, tracking kontrolowany, brass na void. Opcjonalnie micro-mark (K1) **przed** słowem w lockupie poziomym. Bez italic „sport slant” jeśli gryzie się z Archivo UI — preferowany upright condensed.

**Inspiracja:** BRD-002 + FM / store wordmarks; Landing hero brand-first (Guide).

**Zalety:**

- Maksymalna czytelność nazwy w hero / ads.
- Profesjonalny marketing look.
- Łatwy pairing z K1.

**Wady:**

- Sam wordmark nie ratuje favicona.
- Długie „LastFootball” bez spacji wymaga kerningu (ostatni / pierwszy).

**Najlepiej wygląda:** Landing hero · footer · social banner · email · press kit.

---

## K4 — Tunnel / Pitch Glyph + Wordmark

**Styl:** Abstrakcyjny sygnet: **POV tunelu** (trapez światła) lub **fragment linii boiska** (hairline pitch) w brass — nie piłka biedronka. Obok: wordmark K3.

**Inspiracja:** LFE-LANDING-01 Tunnel hero · DNA crop (zasada 6) · match-night brand bridge.

**Zalety:**

- Unikalne vs konkurencja (nie kolejny ball-in-shield).
- Most narracyjny Landing ↔ Match Path.
- Nowoczesny, editorial.

**Wady:**

- Glyph może być zbyt abstrakcyjny dla nowych graczy.
- Trudniejszy do narysowania czytelnie @16px (wymaga 1–2 path max).

**Najlepiej wygląda:** Marketing key art · match-night campaigns · loading z atmosferą.

---

## K5 — Split Editorial Lockup („LAST” / „FOOTBALL”)

**Styl:** Dwuliniowy lub dwukolorowy wordmark: **LAST** w `gold-base` · **FOOTBALL** w `text-primary` / ash. Obok mały monogram K1. Typografia display condensed, upright. Zero ornamentów.

**Inspiracja:** Sport editorial / broadcast lower-thirds; premium game title treatments.

**Zalety:**

- Wyrazisty, „magazynowy” charakter.
- Dobrze wypełnia szeroki hero bez SVG crest.
- Nowoczesny względem klasycznego herbu.

**Wady:**

- Słaby jako jedyny znak w kwadracie (app icon) — wymaga monogramu.
- Dwulinia zajmuje wysokość w ciasnym headerze.

**Najlepiej wygląda:** Landing hero · onboarding splash · trailer cards · wide OG.

---

# 5. Rekomendacja

## 5.1 Zwycięski kierunek: **K1 + K3 jako system marki**

| Warstwa                             | Koncepcja                          | Rola                                                    |
| ----------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| **Primary mark**                    | **K1 Geometric Brass Monogram LF** | Favicon · header · app icon · mono                      |
| **Primary wordmark**                | **K3 Condensed lockup**            | Landing hero · marketing · footer                       |
| **Lockup**                          | K1 + K3 (horizontal)               | Default chrome marketing                                |
| **Secondary (opcjonalnie później)** | K2 Flat Shield                     | Tylko large splash / prestige moments — nie chrome 16px |
| **Campaign (opcjonalnie)**          | K4 Tunnel glyph                    | Sezonowe / match-night — nie core mark                  |

### Uzasadnienie

1. **Owner brief:** nowoczesne · minimalistyczne · czytelne · małe i duże — **K1** wygrywa skalę; **K3** wygrywa nazwę.
2. **Visual DNA:** monogram = prestige frame; nie zawłaszcza herbu klubu (DNA §9).
3. **Night Pitch Office:** brass na void, semi-flat, bez purple / neon / pop.
4. **Luka R1–R5:** jeden system zamyka CSS-square, favicon, app icon, social.
5. **BRD legacy:** K1 = ewolucja BRD-001 (serif→geometric flat); K3 = ewolucja BRD-002 (italic→upright condensed). Nie wyrzucamy DNA — **czyszczymy skalę**.

### Świadomie nie jako core

- **K2 jako jedyny znak** — za blisko club crest, słaby favicon.
- **K4 jako jedyny znak** — za abstrakcyjny bez edukacji.
- **K5 solo** — hero OK, ikona nie.

## 5.2 Pytania do Ownera (przed IMPLEMENT)

1. Akceptujesz **system K1+K3** jako zwycięzcę?
2. Czy K2 Flat Shield ma zostać w zestawie jako **prestige-only** (splash), czy odkładamy?
3. Wordmark: **LASTFOOTBALL** (jedno słowo, jak BRD-002) czy **LAST FOOTBALL** (ze spacją) — nazwa produktu bez zmian; tylko skład typograficzny?
4. Monogram: całkowicie **bezszeryfowy** (max UI), czy lekki egipski/slab echo BRD-001?

---

# 6. Plan wersji (dla zwycięskiej koncepcji K1+K3)

> Do produkcji **po** Owner GO. Na tym etapie plików nie tworzymy.

| Wersja              | Format        | Spec                                                                 | Użycie                       |
| ------------------- | ------------- | -------------------------------------------------------------------- | ---------------------------- |
| **Master mark**     | **SVG**       | Monogram K1 · viewBox kwadrat · flat brass paths                     | Źródło prawdy                |
| **Master wordmark** | **SVG**       | K3 condensed · outlined paths (nie zależność od webfont w OG)        | Marketing                    |
| **Lockup H**        | **SVG**       | Mark + wordmark · gap tokenowy                                       | Header landing / auth        |
| **PNG mark**        | PNG @1x/2x/3x | 32 · 64 · 128 · 256 · 512 · 1024                                     | Fallback / stores            |
| **PNG wordmark**    | PNG           | 512–2048 szer.                                                       | Hero / press                 |
| **Favicon**         | SVG + ICO/PNG | 16 · 32 · 48                                                         | Browser tab                  |
| **Monochrome**      | SVG           | Single-path · currentColor                                           | Na jasnych / invert contexts |
| **Dark**            | SVG/PNG       | Brass / light mark on void                                           | Default Night Pitch          |
| **Light**           | SVG/PNG       | Deep brass / void mark on ivory/light panel                          | Edge cases (maile, PDF)      |
| **App icon**        | PNG           | 1024² · safe zone 10% · flat K1 na void (+ subtle grain opcjonalnie) | BRD-004                      |
| **Social preview**  | PNG           | 1200×630 OG · Tunnel/void wash + lockup K1+K3                        | BRD-005                      |
| **Apple touch**     | PNG           | 180²                                                                 | iOS home                     |
| **Maskable**        | PNG           | 512² safe zone Android                                               | PWA (jeśli)                  |

### Reguły produkcji (DNA)

- Semi-flat: **max 2 wartości tonalne** brass w SVG master (fill + opcjonalny stroke).
- Foil / brushed metal: **tylko** w key-art PNG (nie w favicon SVG).
- Zakaz: piłka biedronka w core mark · purple · neon · photoreal face.
- W grze zalogowanej: marka produktu **nie** dominuje nad herbem klubu.

### Plan implementacji (po akceptacji — osobny etap)

1. Owner GO na K1+K3 (+ odpowiedzi §5.2).
2. Design master SVG (mark · wordmark · lockup · mono).
3. Export PNG / favicon / app / OG.
4. Wiring: `LandingHeader` · hero brand · `metadata.icons` · auth — **bez** zmian tokenów / DNA / Hub layout.
5. Quality Gate: czytelność @16px · kontrast WCAG vs void · regresja Landing · CI.
6. Aktualizacja rejestru BRD-001…005 (supersede PASS SOFT emboss variants).

**Szacunek:** 1 design pass + 1 wiring pass (UI-only).

---

# 7. Quality Gate (ten etap — AUDIT ONLY)

| Kryterium                                   | Status                                                       |
| ------------------------------------------- | ------------------------------------------------------------ |
| Analiza kompletna (Audit · RCA · Benchmark) | ✓                                                            |
| Minimum 5 różnych kierunków                 | ✓ K1–K5                                                      |
| Rekomendacja uzasadniona                    | ✓ K1+K3 system                                               |
| Spójność z Visual DNA LastFootball          | ✓ brass/void · club>product · semi-flat · Night Pitch Office |
| Brak implementacji / commit / push          | ✓                                                            |

**Werdykt etapu:** **PASS (AUDIT)** — czeka na Owner wybór koncepcji.

---

## Historia

| Wersja | Data       | Opis                                                               |
| ------ | ---------- | ------------------------------------------------------------------ |
| 0.1.0  | 2026-07-29 | Audit · RCA · benchmark · 5 koncepcji · rekomendacja · plan wersji |
