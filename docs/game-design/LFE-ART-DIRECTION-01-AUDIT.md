# LFE-ART-DIRECTION-01 — AUDIT + DESIGN CONCEPT

**EPIC:** LFE-ART-DIRECTION-01  
**Etap:** AUDIT + DESIGN CONCEPT  
**Status:** DRAFT — oczekuje Owner GO (bez IMPLEMENT)  
**Data:** 2026-07-28  
**Zakaz tego etapu:** kod · DTO · resolvery · unlock · settlement · commit · push

> Ten dokument jest **fundamentem identyfikacji wizualnej** LastFootball na kolejne lata.  
> **Nie zastępuje** Presentation Contract ([`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16) — uzupełnia go warstwą **atmosfery, materiałów i Design System 2.0**.  
> Hierarchia decyzji (Hero → Decision → Context · 1 Primary CTA · bez KPI wall) **pozostaje obowiązująca**.

---

## 0. Metadane audytu

| Pole                          | Wartość                                                                |
| ----------------------------- | ---------------------------------------------------------------------- |
| Feature baseline (nietknięty) | `9b1c575` — LFE-TRANSFERS-08                                           |
| Tip dokumentacji (orientacja) | `931821c` — AI-DOCS-SYNC-01                                            |
| SSOT prezentacji UX           | Guide §16                                                              |
| SSOT tokenów dziś             | `--lf-*` · `globals.css` / `styles/tokens.ts` (LFE-DESIGN-TOKENS-01)   |
| Fonty dziś                    | Barlow Semi Condensed (`--font-ui`) · IBM Plex Sans (`--font-body`)    |
| Zakres audytu                 | wyłącznie UX / UI / warstwa wizualna                                   |
| Poza zakresem                 | logika domenowa · resolverzy · IA biznesowa · nowe ekrany funkcjonalne |

### Źródła audytu (bez historii czatu)

- [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) (§1–8, §16)
- [`HUB.md`](../platform/HUB.md) (semantyka Hub — tylko jako kontekst hierarchii)
- [`LFE-UX-POSTMORTEM-01.md`](./LFE-UX-POSTMORTEM-01.md) (REFERENCE)
- Tokeny: `apps/web/src/app/globals.css`
- Artefakty wizualne: `docs/verification/lfe-design-01/`, `docs/verification/lfe-ui-01/`

---

## 1. AUDYT — stan obecny (diagnoza wizualna)

### 1.1 Werdykt

**Hierarchia decyzji jest na dobrej drodze (UI Evolution 01–02). Identyfikacja wizualna — nie.**

Produkt czyta się jak **ciemny panel operacyjny SaaS ze sportowym słownictwem**, nie jak **premium gra menedżerska**. Landing ma atmosferę stadionu; świat gry po zalogowaniu tę atmosferę gubi.

Guide już mówi: „profesjonalna gra menedżerska, nie generyczny dashboard SaaS”. Problem nie jest w braku zasady — w **braku Art Direction i assetów**, które zasadę ucieleśniają.

### 1.2 Co działa (zachować)

| Element                                | Dlaczego zostaje                                                                         |
| -------------------------------------- | ---------------------------------------------------------------------------------------- |
| Decision-first / Guide §16             | Jedyna poprawna oś produktu: decyzja > dane                                              |
| Daily Manager Loop                     | Czytelna ścieżka dnia menedżera                                                          |
| Gold Primary CTA                       | Silny sygnał akcji — do wzmocnienia materiałem (metal/foil), nie kolorem „button yellow” |
| Dark base                              | Pasuje do nocnego stadionu / gabinetu — wymaga głębi, nie płaskiego `#080e18`            |
| Brand landing (floodlights + murawa)   | Najbliższy docelowej tożsamości — **most do świata gry**                                 |
| Club colors jako akcent personalizacji | Już w Guide — klucz Immersion 2.0                                                        |
| Oszczędność efektów (anti purple-glow) | Zostaje — Art Direction ≠ neon AI                                                        |

### 1.3 Co psuje „feel gry”

| Objaw                                                                          | Skutek                                                        |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| Płaskie panele `Panel` / równe karty z obramowaniem                            | Czyta się jak admin console                                   |
| Brak tekstur atmosferycznych w grze                                            | Zero skojarzenia: murawa / szatnia / trybuny                  |
| Chrome (TopBar + LeftNav + Rail) jak CRM                                       | Gracz czuje się „użytkownikiem systemu”, nie menedżerem klubu |
| Ikony outline generyczne                                                       | Brak języka sportowego                                        |
| Typografia poprawna, ale „korporacyjna”                                        | Barlow + IBM Plex = tool UI, nie brand game                   |
| Radius 1–4 px, hairline borders wszędzie                                       | Estetyka spreadsheet / terminal                               |
| Pitch green tylko jako token (`--lf-color-pitch`), mało używany atmosferycznie | Murawa istnieje w kodzie, nie w emocji                        |
| Landing ≠ In-game                                                              | Zerwanie ciągłości marki po zalogowaniu                       |

### 1.4 Mapa inspiracji (co brać / czego unikać)

| Referencja                           | Brać                                               | Nie kopiować                                   |
| ------------------------------------ | -------------------------------------------------- | ---------------------------------------------- |
| Football Manager                     | Gęstość decyzji, powaga roli                       | Excel-UI, ściana tabel od pierwszego viewportu |
| EA Sports FC                         | Premium polish, momenty emocji, typografia display | Arcade neon, menu sklepu Ultimate Team         |
| Top Eleven                           | Klarowność mobile daily loop                       | Cartoon / casual toy look                      |
| Hattrick                             | Tożsamość klubu, długoterminowa więź               | Retro web 2000s                                |
| FutbolCup                            | Lokalny klimat managerski                          | Generic browser-game chrome                    |
| Sofascore / Flashscore / OneFootball | Czytelność live, typografia wyników                | Aplikacja medialna bez „Twojego klubu”         |
| Transfermarkt                        | Autorytet rynku, hierarchia list                   | Suchy katalog danych                           |

**Wniosek:** LastFootball = **gabinet menedżera przy murawie w noc meczu** — nie FM-sheet, nie media app, nie SaaS.

### 1.5 Luka produktowa (wizualna)

```
LANDING (atmosfera stadionu)  ──X──►  HUB / PANEL (admin SaaS)
         ↑ most do zbudowania: Art Direction 2.0 + Asset Library
```

UI Evolution naprawiło **język decyzji**.  
Ten EPIC (koncepcja) definiuje **język świata**.

---

## 2. FILOZOFIA UI

### 2.1 Misja wizualna

LastFootball ma sprawiać wrażenie, że gracz **wchodzi do klubu**, nie do panelu.

Każdy ekran odpowiada na trzy pytania w ≤3 sekundy:

1. **Gdzie jestem w klubie?** (gabinet / szatnia / biuro transferowe / trybuna decyzyjna)
2. **Co jest dziś najważniejsze?** (mecz · sprawa · pytanie dnia)
3. **Jaka jest moja jedna decyzja?** (Primary CTA)

### 2.2 Emocje docelowe

| Emocja                  | Jak powstaje                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------- |
| **Odpowiedzialność**    | Ciemny gabinet, herb klubu jako bohater, spokojna hierarchia                          |
| **Presja meczu**        | Floodlight warmth na matchday, mocniejszy kontrast CTA                                |
| **Przynależność**       | Kolory klubu gracza jako żywy akcent (nie dekoracja)                                  |
| **Ambition / prestige** | Metaliczne złoto marki, trochę „pucharowego” światła — bez bling                      |
| **Kontrola**            | Czyste listy i tabele **pod** decyzją; dane służą, nie dominują                       |
| **Emocja boiska**       | Subtelna murawa / siatka / trybuny w tle — nigdy wallpaper full-bleed competing z CTA |

### 2.3 Po zalogowaniu gracz ma czuć

> „To mój klub. Dziś mam jedną sprawę. Reszta czeka w szatni i biurze.”

Nie:

> „To dashboard z widgetami i KPI.”

### 2.4 Pozycjonowanie marki (1 zdanie)

**Night Pitch Office** — nowoczesny, premium managerski UI osadzony w nocnym stadionie i gabinecie trenera; decyzja w centrum; atmosfera boiska na obrzeżach.

### 2.5 Zasady twarde Art Direction (obok §16)

1. **Klub > Produkt** — w grze herb i nazwa klubu wygrywają z logo LF.
2. **Atmosfera subtelna** — tła ≤ ~8–12% uwagi wzrokowej; treść i CTA ≥ 70%.
3. **Materiały, nie efekty** — tekstura / światło / typografia > glow / blur / glass.
4. **Jedna temperatura światła** — ciepłe floodlight gold + chłodny night blue; bez trzeciej dominanty (np. purple).
5. **Sekcje mają „miejsce”** — Hub = gabinet; Kadra = szatnia; Transfery = biuro; Trening = murawa treningowa; Finanse = księga klubu; Mecz = trybuna / tunnel.
6. **Karty tylko gdy niosą interakcję** — zgodnie z Guide; Art Direction nie przywraca wall of cards.
7. **Zero AI-SaaS defaults** — purple glow, cream+terracotta editorial, dense broadsheet.

---

## 3. MOODBOARD (opis stylu)

### 3.1 Słowa kluczowe

`nocturnal` · `floodlit` · `turf grain` · `locker concrete` · `club brass` · `match tension` · `quiet luxury` · `managerial calm`

### 3.2 Kolory (mood)

- **Night navy / ink** — głębokie tło (nie czysty black UI)
- **Warm stadium gold** — metaliczny, lekko brązowy, nie „żółty button”
- **Pitch emerald (muted)** — tylko atmosfera i success sportowy
- **Concrete ash** — powierzchnie paneli jak beton szatni
- **Floodlight ivory** — tekst primary, nigdy ostry #fff wall
- **Club primary / secondary** — slot personalizacji gracza

### 3.3 Materiały

| Materiał                          | Gdzie                                         |
| --------------------------------- | --------------------------------------------- |
| Matowy beton / chalk wall         | Surface, sidebar, tła inset                   |
| Lekki brushed brass               | Primary CTA, fokus, badge prestige            |
| Wilgotna murawa (grain, nie foto) | Hub idle / training atmosphere                |
| Szkło matowe (bardzo dyskretne)   | Overlay / dialog — bez glassmorphism show     |
| Tkanina / mesh szatni             | Kadra, lista zawodników (pasek tekstury 2–4%) |
| Papier / ledger                   | Finanse (mikro-ziarno)                        |

### 3.4 Tekstury (CSS / SVG, nie stock photo)

- Noise 2–3% na void/base
- Mikro-siatka boiska (line grid 1px, opacity 3–6%)
- Radial floodlight vignette (ciepły, lokalny, max 1 na ekran)
- Horizontal turf streak (subtelny gradient zieleni → void)

### 3.5 Gradienty

- **Dozwolone:** pionowy night depth (void → base → raised); warm gold soft fill w CTA; lokalny matchday wash
- **Zakazane:** rainbow, purple-indigo hero, multi-stop „AI mesh”, neon edge

### 3.6 Światło

- Kierunek: **z góry / z narożników** jak maszty oświetleniowe
- Temperatura: **ciepła na akcentach**, chłodna na tle
- Cienie: miękkie, głębokie (`0 12–32px`, niska opacity) — „gabinet”, nie Material elevation ladder

### 3.7 Styl grafik

- Semi-flat **sport editorial** z lekką głębią
- Silhouettes / cropped stadium fragments
- Crest-first compositions
- Bez fotorealistycznych twarzy zawodników w MVP (koszt + uncanny)

### 3.8 Styl ikon

- **Custom sport-outline** z lekkim fill na aktywnym
- Stroke 1.5–2px, zaokrąglone zakończenia
- Motywy: gwizdek, flaga rożna, koszulka, piłka, tablica taktyczna, koperta zarządu, moneta klubu
- Nie: Lucide „settings gear farm” jako tożsamość

---

## 4. COLOR SYSTEM (propozycja Design System 2.0)

> Nazwy tokenów poniżej = **kierunek Art Direction**. Mapowanie 1:1 na `--lf-*` nastąpi w późniejszym EPIC tokenów (po Owner GO).  
> **Nie zmieniać** obecnych tokenów w tym AUDIT.

### 4.1 Brand / Primary

| Token concept     | Hex (propozycja)        | Rola                         |
| ----------------- | ----------------------- | ---------------------------- |
| `brand.gold.base` | `#C9A85C`               | Primary CTA, fokus, prestige |
| `brand.gold.deep` | `#8B7340`               | Border gold, hover press     |
| `brand.gold.soft` | `rgba(201,168,92,0.14)` | Soft fill, selection         |
| `brand.gold.foil` | `#E2C878` → `#A88842`   | Gradient CTA (subtelny)      |

### 4.2 Secondary

| Token concept         | Hex       | Rola                                                 |
| --------------------- | --------- | ---------------------------------------------------- |
| `secondary.slate`     | `#7A8FA8` | Secondary actions, labels                            |
| `secondary.club-slot` | dynamic   | Primary color klubu gracza (max 1 dominant per view) |

### 4.3 Semantic

| Token       | Hex       | Użycie                                                       |
| ----------- | --------- | ------------------------------------------------------------ |
| **Success** | `#3F9A6A` | W, ok, settle positive — bliżej murawy niż „bootstrap green” |
| **Danger**  | `#C24B4B` | L, reject, błąd krytyczny                                    |
| **Warn**    | `#C9A23A` | Remis, soft-lock, ostrzeżenie                                |
| **Info**    | `#5B84A8` | Neutral info, tip                                            |
| **Live**    | `#D62828` | Mecze live — jedyny „gorący” czerwony                        |

### 4.4 Background / Surface / Card

| Token             | Hex                                                        | Rola                                       |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------ |
| `bg.void`         | `#02060C`                                                  | Najgłębszy — za teksturą                   |
| `bg.base`         | `#07111C`                                                  | Body                                       |
| `bg.raised`       | `#0C1826`                                                  | Chrome                                     |
| `bg.surface`      | `#101E2E`                                                  | Główne powierzchnie treści                 |
| `bg.surface-alt`  | `#142536`                                                  | Alternacja list                            |
| `bg.inset`        | `#060E18`                                                  | Inputs, wells                              |
| `bg.hover`        | `#1A2C40`                                                  | Hover row / nav                            |
| **Card**          | `surface` + border `#2A4058` + optional turf/noise overlay | Tylko gdy interakcja / decyzja tego wymaga |
| `border.subtle`   | `#24364C`                                                  | Domyślny                                   |
| `border.strong`   | `#3A5470`                                                  | Aktywny kontener                           |
| `border.prestige` | `#8B7340`                                                  | Decyzja / Primary zone                     |

### 4.5 Accent

| Accent                               | Rola                                          |
| ------------------------------------ | --------------------------------------------- |
| **Pitch mist** `#1B4D36` @ 8–15%     | Atmosfera Hub / Training                      |
| **Floodlight wash** `#F0E2B8` @ 4–8% | Matchday hero glow                            |
| **Club primary**                     | Pasek tożsamości, crest ring, active nav tick |

### 4.6 Typography colors

| Token            | Hex       |
| ---------------- | --------- |
| `text.primary`   | `#EDF2F8` |
| `text.secondary` | `#C5D0DE` |
| `text.muted`     | `#8494A8` |
| `text.faint`     | `#5A6B80` |
| `text.gold`      | `#C9A85C` |
| `text.on-gold`   | `#12100A` |

### 4.7 Kontrast i dostępność

- Primary CTA gold na dark: tekst `on-gold` (nie biały na złotym przy niskim kontraście)
- Status colors nigdy jako jedyny nośnik znaczenia (ikon + label)
- `prefers-reduced-motion` bez zmian zasady Guide

---

## 5. TYPOGRAPHY

### 5.1 Kierunek

Odejście od „tool UI” (Barlow + IBM Plex jako jedyna tożsamość) na **sportowy condensed display + czytelny humanistyczny sans**.

### 5.2 Propozycja zestawu (Google Fonts / self-host)

| Rola                       | Font                                                       | Uzasadnienie                                                 |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------ |
| **Display / Hero**         | **Archivo Black** lub **Bebas Neue** (display)             | Stadionowy impact; brand & big match headlines               |
| **Headings / UI**          | **Archivo** (semi-condensed 600–700)                       | Nowoczesny sport sans; lepszy niż generyczny Inter           |
| **Body**                   | **Source Sans 3**                                          | Czytelność tabel i gęstych list; neutralny, nie „AI default” |
| **Numbers / KPI / wyniki** | **Archivo** tabular + `font-variant-numeric: tabular-nums` | Spójność wyniku meczu / kasy / pozycji                       |
| **Mono (dev/status only)** | zachować dyskretnie                                        | Nie w core gameplay chrome                                   |

**Unikać jako tożsamości:** Inter, Roboto, Arial, system-ui alone, Playfair „editorial cream”.

### 5.3 Skala (kierunek)

| Token          | Desktop                    | Mobile           | Użycie                                 |
| -------------- | -------------------------- | ---------------- | -------------------------------------- |
| `type.display` | 40–48px                    | 28–32px          | Brand / rzadki hero match              |
| `type.h1`      | 24–28px                    | 20–22px          | Tytuł ekranu decyzji                   |
| `type.h2`      | 16–18px                    | 15–16px          | Sekcje                                 |
| `type.body`    | 14px                       | 14px             | Treść (lekko ↑ vs dziś 13px)           |
| `type.caption` | 12px                       | 12px             | Meta                                   |
| `type.label`   | 11px / tracking 0.06–0.1em | uppercase labels |
| `type.score`   | 28–36px                    | 24–28px          | Wynik / VS                             |
| `type.kpi`     | 18–22px                    | 16–18px          | Pojedyncza liczba kontekstu (nie wall) |

### 5.4 Hierarchia emocji

- **Display** — tylko momenty: landing, kick-off, post-match headline
- **H1** — pytanie dnia / sprawa
- **Body** — wyjaśnienie jednym zdaniem
- **Score/KPI** — liczby jak wynik na tablicy, nie jak spreadsheet cell

---

## 6. ICON STYLE

### 6.1 Decyzja

**Sport Outline + Selective Fill (Premium)**

| Stan              | Styl                               |
| ----------------- | ---------------------------------- |
| Default           | Outline 1.75px, rounded caps       |
| Active / selected | Soft fill gold-soft + outline gold |
| Destructive       | Outline danger                     |
| Live              | Filled live red dot + outline      |

### 6.2 Cechy

- Siatka 24×24 (touch target ≥ 44px z paddingiem)
- Motywy piłkarskie first, UI-generic second
- Corner radius ikon spójny z DS (nie „cute rounded app”)
- Jedna biblioteka custom (lub forked set) — **nie mix** 3 bibliotek

### 6.3 Anti-patterns

- Gradient icons
- 3D emoji
- Duotone purple
- Outline + filled chaotycznie w jednym nav

---

## 7. ILLUSTRATION STYLE

### 7.1 Decyzja

**Semi-flat Sport Posters + Atmospheric Fragments**

| Do                                          | Nie                                               |
| ------------------------------------------- | ------------------------------------------------- |
| Semi-flat silhouettes (kibic, tunel, ławka) | Full 3D characters MVP                            |
| Cropped stadium / floodlight fragments      | Pełne stock photo backgrounds                     |
| Crest & kit flat vector                     | Uncanny AI faces                                  |
| Concept-art moodboards w docs               | Concept-art jako runtime wallpaper competing z UI |
| Minimal line diagrams (taktyka)             | Over-detailed isometric cities                    |

### 7.2 Poziomy użycia

1. **Atmosphere (CSS/SVG)** — zawsze
2. **Spot illustration** — empty states, unlock soft-lock, onboarding
3. **Moment art** — post-match / trophy (rzadko, high impact)

---

## 8. BACKGROUND SYSTEM

Zasada: **nie pełne zdjęcia**. Tylko subtelne warstwy (opacity niska, blur/mask, `pointer-events: none`).

| Motyw                 | Ekrany                          | Opis warstwy                                          |
| --------------------- | ------------------------------- | ----------------------------------------------------- |
| **Murawa grain**      | Hub idle, Trening               | Ciemna zieleń + noise; fade do void u góry            |
| **Siatka boiska**     | Kick-Off, Taktyka/skład context | Line grid 3–5%                                        |
| **Floodlights**       | Matchday Hub, Live chrome       | 1–2 radial warm spots w narożnikach                   |
| **Rozmyte trybuny**   | Post-match, Liga browse         | Silhouette strip na dole / górze, mocno przyciemnione |
| **Nocny mecz wash**   | PreMatch / Live                 | Głębszy void + warm wash CTA zone                     |
| **Gabinet**           | Hub                             | Beton/ash noise; ciepłe światło biurkowe przy Primary |
| **Szatnia**           | Kadra                           | Mesh / horizontal fabric grain; cooler tone           |
| **Biuro transferowe** | Transfery                       | Ledger paper grain + sharp borders                    |
| **Księga**            | Finanse                         | Paper grain + inset wells                             |

**Budżet uwagi tła:** max ~10%. Jeśli tło „wygrywa” z Primary CTA — za mocne.

---

## 9. DASHBOARD / HUB VISION (słownie)

> Uwaga językowa: produktowo Hub = **ekran decyzji**, nie „dashboard KPI”. Poniżej wizja **ekranu głównego po zalogowaniu**.

### 9.1 Pierwszy viewport (idealny)

```
┌─────────────────────────────────────────────────────────────┐
│ [chrome dyskretny: klub · faza dnia · bez KPI wall]         │
│                                                             │
│   ░░ subtelna murawa / gabinet wash ░░                      │
│                                                             │
│   HERB + NAZWA KLUBU                    (tożsamość)         │
│   „Jutro 18:00 · vs Orzeł Grodzisk”     (sprawa)            │
│                                                             │
│   ┌──────────────────────────────────────────────┐          │
│   │  PRIMARY (gold foil):  Przygotuj mecz        │          │
│   └──────────────────────────────────────────────┘          │
│                                                             │
│   Trening · Kadra · Transfery · Finanse · Terminarz         │
│   (secondary daily loop — niższy kontrast)                  │
│                                                             │
│   jedna linia kontekstu: Liga · Poz · Kasa                  │
│   (nie 6 kart KPI)                                          │
└─────────────────────────────────────────────────────────────┘
```

### 9.2 Hierarchia

1. **Klub** (herb + nazwa)
2. **Sprawa dnia** (mecz / pytanie / last result narrative)
3. **Primary CTA**
4. **Daily loop secondary**
5. **Lekki status + wiadomość zarządu**
6. **Browse / tabele** — dopiero po scrollu (Context)

### 9.3 Najważniejsze

Jedna decyzja. Reszta świata klubu jest obecna **atmosferą i soft-linkami**, nie widgetami.

### 9.4 Czego nie ma na first viewport

- Stat cards grid
- Energy bars / XP SaaS
- Równe Panele „Tabela | Finanse | Zadania | Trening”
- Drugi gold button
- Floating badges na hero

---

## 10. MANAGER PANEL VISION (świat po Hubie)

### 10.1 Mapa „miejsc” klubu

| Moduł                | Miejsce wizualne    | Dominant           | CTA typowe                                 |
| -------------------- | ------------------- | ------------------ | ------------------------------------------ |
| **Hub**              | Gabinet             | Sprawa dnia        | 1 Primary                                  |
| **Trening**          | Murawa treningowa   | Pytanie dnia       | Wybór sesji                                |
| **Kadra**            | Szatnia             | Pytanie / gotowość | Wejście w zawodnika / soft-link trening    |
| **Transfery**        | Biuro transferowe   | Inbox sprawy       | Accept / Instant / Negocjacja (istniejące) |
| **Finanse**          | Księga klubu        | Status kasy        | Soft-link → Transfery                      |
| **Liga / Terminarz** | Trybuna analityczna | Browse             | Wejście w mecz                             |
| **Kick-Off**         | Tunel / linii       | VS                 | Start meczu                                |
| **Live**             | Boisko              | MatchState UI      | CommandBus only (bez zmiany architektury)  |
| **Post-match**       | Szatnia po meczu    | Narracja wyniku    | Powrót Hub                                 |

### 10.2 Grafiki w panelu

- Crest zawsze czytelny
- Spot illustrations przy empty / soft-lock
- Atmosphere layers per miejsce
- Brak stock „manager in suit” hero photos

### 10.3 Informacje (prezentacja)

- First viewport: **pytanie lub sprawa** + 1 linia kontekstu
- Context: tabele / listy zgodne z resolverami (bez nowych danych)
- Chrome: wspiera, nie konkuruje (Guide §16.7.6)

---

## 11. ASSET LIBRARY (do przygotowania)

### 11.1 Zasady produkcji

- Format: SVG first · WebP/AVIF dla raster atmosphere
- Kolory: mono / duotone night-gold-pitch — łatwe tintowanie
- Licencje: własne lub komercyjnie bezpieczne
- Naming: `lf-art-{domain}-{name}-{variant}`

### 11.2 Lista (MVP Art Pack → Extended)

#### A. Atmosphere (priorytet P0) — ok. **12** plików

| #   | Asset                     | Typ          |
| --- | ------------------------- | ------------ |
| 1–2 | Murawa grain (light/dark) | SVG/PNG tile |
| 3   | Siatka boiska             | SVG          |
| 4–5 | Floodlight vignette L/R   | SVG/PNG      |
| 6   | Trybuny silhouette        | SVG          |
| 7   | Gabinet noise             | SVG/PNG      |
| 8   | Szatnia mesh              | SVG          |
| 9   | Biuro ledger grain        | SVG          |
| 10  | Paper finance grain       | SVG          |
| 11  | Night void gradient map   | CSS+PNG      |
| 12  | Matchday warm wash        | PNG/SVG      |

#### B. Ikony sportowe (P0) — ok. **28** ikon

Hub, Trening, Kadra, Transfery, Finanse, Terminarz, Liga, Stadion, Akademia, Skauting, Sponsorzy, Zarząd, Wiadomości, Profil, Ustawienia, Gwizdek, Piłka, Koszulka, Tablica taktyczna, Kasa, Oferta, Kontrakt, Kontuzja, Forma, Live, W/D/L, Soft-lock, Crest placeholder

#### C. Spot illustrations (P1) — ok. **10**

Empty transfers · Soft-lock trening · Soft-lock transfer window · Empty inbox · First win · Defeat calm · Board message · Stadium locked · Academy locked · Scout locked

#### D. Brand & crest system (P0/P1) — ok. **8–15**

LF monogram foil · Shield templates · Kit stripes patterns · Crest frame rings · Watermark LF subtle

#### E. Match moment (P2) — ok. **6**

Kick-off tunnel · Goal flash frame (abstract) · Final whistle · Trophy abstract · Medal · Scarf banner abstract

#### F. Opcjonalne później (P3)

Kibice crowd texture · Sędzia silhouette · Trener sideline · Pełne stadiony per liga · 3D ball hero (marketing only)

### 11.3 Szacunek łączny MVP

| Pakiet                        | Ilość orientacyjna |
| ----------------------------- | ------------------ |
| P0 Atmosphere + Icons + Brand | ~50 assetów        |
| P1 Spots                      | +10                |
| P2 Moments                    | +6                 |
| **Razem fundament**           | **~65–70**         |

---

## 12. ANIMATION STYLE

### 12.1 Filozofia

Ruch = **obecność i hierarchia**, nie dekoracja. 2–3 globalne wzorce (Guide §8) + lokalny feedback.

### 12.2 Wzorce

| Wzorzec               | Spec                                                 |
| --------------------- | ---------------------------------------------------- |
| **Page enter**        | Fade + 6–10px rise, 180–220ms ease-out               |
| **Primary CTA hover** | Brighten foil + 1px lift shadow, 120ms               |
| **Secondary hover**   | Border/text only, bez scale bounce                   |
| **Card/row hover**    | Background → hover token, bez parallax               |
| **Decision focus**    | Lekki warm wash pojawia się na matchday              |
| **Transitions route** | Cross-fade content 150–200ms; chrome stały           |
| **Loading**           | Pulsujący crest / line na murawie — nie spinner SaaS |
| **Live score tick**   | Krótki flash liczby (120ms), respekt reduced-motion  |
| **Dialog**            | Scrim fade + panel rise; bez blur heavy              |

### 12.3 Zakazy

- Continuous float/glow
- Elastic bounce na CTA
- Parallax tła walczący z czytelnością
- Confetti na każdy sukces (tylko rare trophy moments — future)

---

## 13. DESIGN SYSTEM 2.0 — komponenty

> Semantyka interakcji bez zmian domenowych. Zmienia się **skóra, materiał, rytm**.

### 13.1 Buttons

| Variant                  | Look                                                                                   |
| ------------------------ | -------------------------------------------------------------------------------------- |
| **Primary**              | Gold foil fill, `text.on-gold`, radius sm–md (4–6px), tracking wide, full-width mobile |
| **Secondary**            | Ghost + border strong; hover border prestige                                           |
| **Tertiary / soft-link** | Text muted + underline offset; nigdy gold fill                                         |
| **Danger**               | Outline danger / soft fill danger                                                      |
| **Disabled**             | Opacity token; bez „szarego SaaS flat” przypadkowego                                   |

### 13.2 Cards / Panels

- Default: **sekcja bez card chrome**
- Decision container: border prestige + surface + optional atmosphere
- List rows: alt surface, hairline separator
- Zakaz: równy grid 6 KPI cards

### 13.3 Inputs

- Inset bg, border subtle → strong on focus
- Focus ring = gold
- Wysokość touch-friendly
- Label uppercase caption gold/muted

### 13.4 Badges

- Pill **nie** jako default (Guide bias)
- Prefer: rectangular chip radius sm, soft semantic fill
- Live = rare filled chip
- Prestige = gold outline

### 13.5 Tables

- Gęste, czytelne, caption header uppercase
- Row hover inset
- Sticky header optional na browse
- Club row: left tick w kolorze klubu
- Liczby: tabular-nums

### 13.6 Dialogs

- Scrim void 72%
- Panel surface, border strong, max-width zachowany
- Tytuł = pytanie decyzji
- 1 Primary w footer

### 13.7 Tabs

- Underline prestige dla active (nie filled pill SaaS)
- Mobile: scroll snap, bez overcrowding

### 13.8 Navigation

- **Desktop left:** ciemniejszy raised; active = gold tick + soft fill; grupy jak dziś, wizualnie „szatnia katalogów”
- **Mobile Variant A:** bez zmian IA (Hub · Trening · Kadra · Transfery · Więcej); ikony sportowe; active fill soft

### 13.9 Sidebar / Header / Footer

| Element             | Kierunek                                                             |
| ------------------- | -------------------------------------------------------------------- |
| **Header / TopBar** | Niższy kontrast; klub left; **bez** KPI wall; status max 1–2 sygnały |
| **Left nav**        | Atmosphere ash; mniej „settings app”                                 |
| **Right rail**      | Tylko gdy wspiera decyzję; na Hub off/lekki (jak Evolution)          |
| **Footer**          | Minimal / brak w grze; landing zachowuje brand footer                |

---

## 14. ROADMAP WDROŻENIA (bez implementacji teraz)

Pipeline każdego slice: `AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CLOSE`.

### Faza 0 — Ten dokument (TERAZ)

- [x] AUDIT wizualny
- [x] Design Concept Art Direction
- [ ] Owner Review / GO na kierunek **Night Pitch Office**
- [ ] Ewentualne korekty palety / fontów po feedbacku

### Faza 1 — `LFE-ART-DIRECTION-02` Foundation Tokens _(docs+tokens only / presentation)_

- Zamrożenie palety 2.0 w SSOT (Guide + tokens doc)
- Mapowanie `--lf-*` → nowe wartości (bez zmiany semantyki komponentów)
- Font swap (display/headings/body) + type scale
- Motion tokens refresh
- **Poza:** nowe ekrany, IA, DTO

### Faza 2 — `LFE-ART-ASSETS-01` Atmosphere Pack

- Produkcja P0 atmosphere + brand marks
- Integracja warstw tła na Hub / Kick-Off / Trening / Kadra / Transfery / Finanse
- Loading crest

### Faza 3 — `LFE-ART-ASSETS-02` Icon + Spot Pack

- 28 ikon sportowych
- Empty / soft-lock spots
- Podmiana ikon chrome (MobileNav / LeftNav)

### Faza 4 — `LFE-UI-SKIN-01` Shell & Hub Skin

- TopBar / Nav / Hub decision chrome w DS 2.0
- Primary foil CTA
- Zachowanie §16 hierarchii (regresja = fail)

### Faza 5 — `LFE-UI-SKIN-02` Domain Screens Skin

- Transfers · Squad · Training · Finance · Kick-Off (thin presentation)
- Tables / badges / dialogs alignment
- Soft-links daily loop bez zmian semantyki

### Faza 6 — `LFE-ART-ASSETS-03` Match Moments _(opcjonalnie)_

- Post-match / trophy / marketing lands sync z in-game

### Faza 7 — CLOSE dokumentacyjny

- Sync Guide (nowa sekcja Art Direction lub §7/§16 addendum)
- `CURRENT_DESIGN` / ROADMAP / EPIC_INDEX
- Feature baseline **bez zmian**, o ile brak feat domenowych

### Zależności i ryzyka

| Ryzyko                    | Mitygacja                                       |
| ------------------------- | ----------------------------------------------- |
| Skin przywraca KPI wall   | AC: Guide §16 must/must-not w każdym PLAN       |
| Asset bloat / ciężkie PNG | SVG + WebP, budget KB w PLAN                    |
| Rozjazd Landing vs Gra    | Faza 2 łączy atmosphere z landing DNA           |
| Scope creep domenowy      | Zakaz DTO/resolver/unlock bez osobnego Owner GO |
| „Karta dla karty”         | Cards only for interaction                      |

### Definition of Done (cała linia Art Direction)

- Gracz po zalogowaniu czuje **klub / stadion / gabinet**, nie SaaS
- Landing i Hub dzielą jedną temperaturę światła i materiałów
- §16 spełnione na każdym ekranie decyzji
- Tokeny 2.0 = SSOT; brak ad-hoc hex w komponentach
- Asset library udokumentowana i wersjonowana
- CI GREEN; presentation only względem domeny

---

## 15. DECYZJE DO OWNER GO

Proszę o decyzję Ownera (tak / korekta):

1. **Kierunek nazwy:** _Night Pitch Office_ — akceptacja?
2. **Paleta:** night navy + warm brass gold + muted pitch — akceptacja hexów roboczych?
3. **Fonty:** Archivo (+ Black display) + Source Sans 3 — OK, czy inny zestaw?
4. **Ikony:** Sport Outline + Selective Fill — OK?
5. **Ilustracje:** Semi-flat sport posters / fragments — OK? (bez 3D MVP)
6. **Roadmap faz 1–6** jako kolejne EPICi — priorytet startu = Tokens (02) czy Assets (ASSETS-01)?
7. Czy po GO mamy spisać **PLAN** tylko dla fazy 1 (`LFE-ART-DIRECTION-02`), bez kodu do czasu osobnego GO → IMPLEMENT?

---

## 16. PODSUMOWANIE

|                   |                                                                     |
| ----------------- | ------------------------------------------------------------------- |
| **Problem**       | Gra wygląda jak ciemny SaaS; brakuje świata klubu                   |
| **Kierunek**      | Night Pitch Office — gabinet przy murawie w noc meczu               |
| **Oś UX**         | Bez zmian: Guide §16 decision-first                                 |
| **Oś Art**        | Materiały · światło · atmosphere · sport icons · typografia display |
| **Następny krok** | Owner GO na kierunek → PLAN Fazy 1                                  |
| **Ten etap**      | **Bez implementacji · bez commitów · bez zmian kodu**               |

---

## Historia dokumentu

| Wersja | Data       | Opis                                          |
| ------ | ---------- | --------------------------------------------- |
| 0.1.0  | 2026-07-28 | AUDIT + Design Concept (LFE-ART-DIRECTION-01) |
