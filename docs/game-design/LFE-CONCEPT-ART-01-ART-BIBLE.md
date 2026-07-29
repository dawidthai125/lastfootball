# LFE-CONCEPT-ART-01 — ART BIBLE

**EPIC:** LFE-CONCEPT-ART-01  
**Etap:** AUDIT + ART BIBLE + CONCEPT LIBRARY  
**Status:** DRAFT — fundament świata (bez IMPLEMENT)  
**Data:** 2026-07-28  
**Zakaz tego etapu:** kod · CSS · React · komponenty · DTO · resolvery · commit · push

> **To jest księga ŚWIATA LastFootball** — nadrzędny dokument identyfikacji wizualnej gry.  
> Wszystkie przyszłe ekrany, grafiki, animacje i UI mają powstawać **na podstawie tej Biblii**.  
> Nie projektujemy tu UI ani komponentów. Projektujemy **miejsca, atmosferę i język obrazu**.  
> Hierarchia decyzji gracza pozostaje w [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16.  
> Kierunek marki (UI/DS): [`LFE-ART-DIRECTION-01-AUDIT.md`](./LFE-ART-DIRECTION-01-AUDIT.md).  
> Biblioteka assetów: [`LFE-CONCEPT-ART-01-ASSET-LIBRARY.md`](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md).  
> Roadmapa produkcji: [`LFE-CONCEPT-ART-01-ROADMAP.md`](./LFE-CONCEPT-ART-01-ROADMAP.md).

---

## 0. Cel i granice

| Jest                                | Nie jest                                                       |
| ----------------------------------- | -------------------------------------------------------------- |
| Filozofia świata gry                | Specyfikacja React / CSS                                       |
| Visual Language marki               | Design System komponentów (→ Art Direction + późniejsze EPICi) |
| Lokacje klubu jako „miejsca emocji” | Mapa resolverów / unlock                                       |
| Style Guide obrazu                  | Implementacja tokenów                                          |
| System generowania grafik AI        | Pojedyncze jednorazowe prompty ad-hoc                          |

**Problem, który rozwiązujemy:** po zalogowaniu gracz nie czuje klubu, stadionu, szatni ani emocji meczu — tylko panel.  
**Misja:** zbudować spójny świat **Night Pitch Office**, w którym każdy ekran „dzieje się gdzieś”.

---

## 1. Filozofia świata

### 1.1 Jedno zdanie

LastFootball to **nocny klub nowoczesnej piłki**: gabinet menedżera z widokiem na floodlighty, gdzie każda decyzja ma ciężar murawy.

### 1.2 Nazwa kierunku

**Night Pitch Office**

- **Night** — cisza przed gwizdkiem, powaga, głębia
- **Pitch** — murawa, zapach trawy, prawda boiska
- **Office** — odpowiedzialność, spokój, kontrola menedżera

### 1.3 Emocje kanoniczne

| Emocja           | Opis dla artysty                                              |
| ---------------- | ------------------------------------------------------------- |
| Odpowiedzialność | Ciężar herbu na biurku; decyzja nie jest „klikiem”            |
| Spokój luksusu   | Ciemne materiały, cisza, drogie światło — nie bling           |
| Presja meczu     | Ciepłe floodlighty wkraczają w kadr; powietrze gęstnieje      |
| Przynależność    | Kolory klubu gracza żyją w przestrzeni                        |
| Ambicja          | Metaliczne złoto marki jak puchar w gablocie — rzadko, celnie |
| Samotność roli   | Gabinet o 22:47; stadion za szybą; Ty i sprawa                |

### 1.4 Synestezja (skojarzenia pozawzrokowe)

Artysta ma myśleć nie tylko obrazem:

| Zmysł              | Skojarzenie świata LF                                                                                       |
| ------------------ | ----------------------------------------------------------------------------------------------------------- |
| Zapach             | Mokrá murawa · skóra piłki · kawa w gabinecie · antystept w szatni · papier kontraktu                       |
| Dźwięk (koncepcja) | Daleki pomp · skrzyp drzwi tunelu · stuk obcasów na betonie · szum trybun za ścianą · cisza przed gwizdkiem |
| Dotyk              | Chłodny beton · ciepły mosiądz · wilgotna trawa · szorstka tkanina szalika · gładki szkło gabloty           |
| Temperatura        | Zimny night air + ciepła plama floodlightu = napięcie                                                       |

### 1.5 Czego świat NIE jest

- Panelem administracyjnym / CRM
- Arkuszem Football Manager
- Neonowym sklepem Ultimate Team
- Aplikacją medialną wyników
- Cartoon casual mobile
- Fioletowym „AI SaaS”

### 1.6 Inspiracje (brać ducha, nie wygląd)

| Źródło                               | Duch do wzięcia           | Zakaz kopiowania       |
| ------------------------------------ | ------------------------- | ---------------------- |
| Football Manager                     | Powaga roli               | Excel-wall             |
| EA Sports FC                         | Premium moment            | Arcade neon shop       |
| Top Eleven                           | Codzienność menedżera     | Toy cartoon            |
| Hattrick                             | Więź z klubem             | Retro web              |
| FutbolCup / Football Chairman        | Lokalny managerski klimat | Generic browser chrome |
| OneFootball / Sofascore / Flashscore | Klarowność live           | Brak „Twojego klubu”   |
| Transfermarkt                        | Autorytet rynku           | Suchy katalog          |

---

## 2. Visual Language

### 2.1 Prawo obrazu (5 praw)

1. **Miejsce przed panelem** — każdy kadr ma lokację.
2. **Światło z masztów** — floodlighty z góry / narożników; nigdy „flat UI light”.
3. **Materiał przed efektem** — beton, mosiądz, murawa, szkło matowe > glow.
4. **Crop, nie katalog** — fragmenty stadionu, nie całe stock photo.
5. **Klub jest bohaterem** — herb i barwy gracza wygrywają z logo produktu w świecie gry.

### 2.2 Kształty

| Kształt                        | Znaczenie                            |
| ------------------------------ | ------------------------------------ |
| Prostokąt ostry / lekko ścięty | Powaga, architektura stadionu, biuro |
| Tarcza / herb                  | Tożsamość klubu                      |
| Łuk trybuny (silhouetta)       | Skala emocji meczu                   |
| Linia boiska (prosta, cienka)  | Porządek, taktyka, prawda gry        |
| Okrąg piłki / spotlight        | Fokus decyzji / moment               |

Unikać: miękkich bubble-shapes, pill-everything, organicznych blobów AI.

### 2.3 Linie

- **Architektura:** proste, spokojne, horyzont niskokaloryczny
- **Boisko:** cienkie, białe/kość słoniowa @ niskiej opacity
- **Prestige:** cienka linia mosiądzu wokół strefy decyzji
- **Nigdy:** scribble, comic speed-lines, neon outline

### 2.4 Materiały kanoniczne

| Materiał                   | Charakter                                      |
| -------------------------- | ---------------------------------------------- |
| Night concrete             | Matowy, chłodny, „szatnia / tunel”             |
| Brushed brass              | Ciepły metal marki LF — prestige               |
| Wet turf grain             | Wilgotna zieleń, nie plastikowy green screen   |
| Matte glass                | Szyba gabinetu na stadion — refleksy dyskretne |
| Locker mesh / fabric       | Szatnia, koszulki, szaliki                     |
| Ledger paper               | Finanse, kontrakty                             |
| Polished wood (ciemne)     | Gabinet zarządu — rzadko, luksus               |
| Steel / medical white-blue | Centrum medyczne — chłodniej                   |
| Chalk / tactics board      | Analitycy, taktyka                             |

### 2.5 Cienie

- Miękkie, głębokie, **niskie** (światło z góry)
- Jedno dominujące źródło + ambient night fill
- Bez hard drop-shadow „karty Material Design”
- Postacie / props rzucają cień zgodny z floodlightem

### 2.6 Światła

| Typ                | Temperatura          | Kiedy                             |
| ------------------ | -------------------- | --------------------------------- |
| Floodlight warm    | 3200–3800K (ciepły)  | Matchday, Kick-Off, Live, Landing |
| Office desk lamp   | Ciepły lokalny       | Gabinet, finanse, skauci          |
| Cool night ambient | 6500K+ przyciemnione | Tło, void, tunel                  |
| Medical cool       | Niebieskawy          | Centrum medyczne                  |
| Museum spot        | Wąski warm spot      | Muzeum / trofea                   |
| Shop LED soft      | Neutralny            | Sklep — nadal night-safe          |

**Zakaz:** rainbow, purple haze, cyan cyberpunk, lens flare disco.

### 2.7 Głębia i perspektywa

- **Preferowane:** 3/4 lekkie lub frontal z warstwami (foreground props → mid decision → background atmosphere)
- **Hero artwork:** silny foreground prop lub herb; tło rozmyte / cropped
- **Background UI:** prawie flat depth (2–5% parallax max w koncepcji)
- **Unikać:** fish-eye, dramatyczny dutch angle (poza rare Match Moment)

### 2.8 Kadrowanie

| Typ               | Reguła                                                            |
| ----------------- | ----------------------------------------------------------------- |
| Hero              | Centrum emocji + przestrzeń na tytuł/CTA poza kadrze sztuki       |
| Atmosphere BG     | Edges darker (vignette naturalna); środek spokojniejszy pod treść |
| Spot illustration | Obiekt + negatywna przestrzeń; nie „pełna scena”                  |
| Match Moment      | Moment w czasie (gwizdek, gol abstrakcyjny) — nie cała trybuna    |

### 2.9 Kontrast

- Wysoki kontrast **decyzji** (gold vs night)
- Niski kontrast **atmosfery** (żeby nie walczyć z treścią)
- Tekstury zawsze poniżej czytelności treści (budżet uwagi tła ≤ ~10%)

---

## 3. Style Guide (kanon obrazu)

### 3.1 Paleta świata (master)

| Nazwa         | Hex       | Rola w świecie                       |
| ------------- | --------- | ------------------------------------ |
| Void Ink      | `#02060C` | Noc za oknem                         |
| Night Navy    | `#07111C` | Powietrze lokacji                    |
| Ash Concrete  | `#101E2E` | Ściany / powierzchnie                |
| Brass Gold    | `#C9A85C` | Prestige LF / światło warm           |
| Brass Deep    | `#8B7340` | Metal cień                           |
| Pitch Emerald | `#1B4D36` | Murawa (atmosphere)                  |
| Turf Alive    | `#3F9A6A` | Sukces / żywa trawa                  |
| Flood Ivory   | `#EDF2F8` | Highlights / linie boiska            |
| Live Scarlet  | `#D62828` | Tylko live / ostra emocja            |
| Club Primary  | dynamic   | Barwa gracza — max 1 dominant / kadr |

### 3.2 Gradienty dozwolone

- Night depth: void → navy → ash (pion)
- Flood wash: transparent → warm gold 4–8% (radial z narożnika)
- Turf falloff: emerald mist → void (dół kadru)
- Brass foil: `#E2C878` → `#A88842` (tylko małe powierzchnie prestige)

### 3.3 Tekstury (zawsze subtelne)

- Film grain / noise 2–3%
- Beton micro-rough
- Turf fiber grain
- Fabric weave
- Paper fiber (ledger)
- Glass micro-scratch (bardzo słabe)

### 3.4 Typografia w świecie (art, nie UI spec)

Na artworkach i loading screens:

| Rola         | Kierunek                                                   | Uwaga                |
| ------------ | ---------------------------------------------------------- | -------------------- |
| Display      | Condensed sport black (Archivo Black / Bebas-like)         | Nagłówki momentów    |
| Title        | Semi-condensed bold                                        | Nazwy lokacji / klub |
| Body art     | Humanist sans clean                                        | Krótkie hasła        |
| Zakaz na art | Script fonts, comic, Inter-as-brand, serif editorial cream |

Pełny zestaw UI → Art Direction 01; tu tylko spójność obrazu z literą.

### 3.5 Ikonografia świata

- Sport outline, rounded caps, stroke stabilny
- Motywy: piłka, koszulka, gwizdek, flaga, tablica, kontrakt, stetoskop, puchar, szalik
- Fill tylko w stanie „aktywny / żywy”
- Jedna rodzina — jak studio, nie marketplace mix

### 3.6 Styl ilustracji

**Semi-flat Sport Editorial**

- Płaskie kolory + 1–2 warstwy światła
- Silhouettes kibiców / architektury
- Brak fotorealistycznych twarzy zawodników (MVP)
- Cropped props w foreground
- Lekka depth fog w tle

### 3.7 Kompozycja hero

1. Foreground: prop lokacji lub herb
2. Mid: przestrzeń „oddechu” (miejsce na UI później)
3. Background: cropped stadium / night / texture
4. Light: jedno warm + ambient cool
5. Accent: thin brass LUB club color — nie oba głośno

---

## 4. Lokacje świata (Concept Map)

Każda lokacja = osobny klimat. Poniżej kanon dla artystów i generatorów.

---

### 4.1 Gabinet Menedżera

| Pole                   | Opis                                                                            |
| ---------------------- | ------------------------------------------------------------------------------- |
| **Klimat**             | Cisza, ciężar decyzji, widok na nocny stadion za szybą                          |
| **Kolory**             | Night navy, ash, brass, desk warm; club color jako akcent na herbie             |
| **Światło**            | Lampka biurkowa + distant floodlights za oknem                                  |
| **Materiały**          | Ciemne drewno, skóra fotela, matowe szkło, mosiądz                              |
| **Tekstury**           | Wood grain dyskretny, glass reflection, paper                                   |
| **Nastrój**            | Spokój luksusu + samotność roli                                                 |
| **Hero artwork**       | Biurko z herbem; za szybą rozmyte floodlighty; pusty fotel lub sylwetka od tyłu |
| **Tło**                | Window vignette + soft turf glow daleko                                         |
| **Dekor**              | Teczka, pióro, mały monitor taktyczny, zdjęcie stadionu w ramce                 |
| **Animacje (koncept)** | Pył w świetle lampy; dalekie migotanie masztów                                  |
| **Dźwięki (koncept)**  | Zegar · daleki pomp · szelest papieru                                           |

**Mapowanie gry (orientacja, nie UI):** Hub / Panel decyzji.

---

### 4.2 Stadion

| Pole          | Opis                                                            |
| ------------- | --------------------------------------------------------------- |
| **Klimat**    | Skala, duma klubu, architektura nocą                            |
| **Kolory**    | Void, concrete grey-blue, flood ivory, club seats tint          |
| **Światło**   | Dominujące floodlighty z masztów                                |
| **Materiały** | Beton, stal, siedzenia, szkło elewacji                          |
| **Tekstury**  | Beton, crowd silhouette grain                                   |
| **Nastrój**   | Sublime / prestige                                              |
| **Hero**      | Crop elewacji + maszty; herb na fasadzie                        |
| **Tło**       | Night sky + light bloom kontrolowany                            |
| **Dekor**     | Flagpoles, LED ribbon abstract (bez czytelnego tekstu losowego) |
| **Animacje**  | Slow light pulse; crowd sway abstract                           |
| **Dźwięki**   | Distant chant · wind · electrical hum                           |

---

### 4.3 Murawa

| Pole          | Opis                                              |
| ------------- | ------------------------------------------------- |
| **Klimat**    | Prawda gry; wilgoć; sacral pitch                  |
| **Kolory**    | Pitch emerald, turf alive, line ivory, void edges |
| **Światło**   | Flood z góry; mokry połysk trawy                  |
| **Materiały** | Trawa, farba linii, wilgoć                        |
| **Tekstury**  | Turf fiber, mud micro (bardzo delikatnie)         |
| **Nastrój**   | Skupienie / sacral                                |
| **Hero**      | Low angle na linię środka; światła w górze kadru  |
| **Tło**       | Blurred stands                                    |
| **Dekor**     | Corner flag soft, ball mid-distance optional      |
| **Animacje**  | Grass micro-sway; light haze                      |
| **Dźwięki**   | Soft wind · distant boots · silence               |

---

### 4.4 Boisko treningowe

| Pole          | Opis                                                                |
| ------------- | ------------------------------------------------------------------- |
| **Klimat**    | Praca, pot, codzienność; mniej glam niż stadion                     |
| **Kolory**    | Day-for-night cooler green, ash cones, muted gold                   |
| **Światło**   | Poranne / popołudniowe cooler LUB flood treningowy                  |
| **Materiały** | Trawa, plastik cones, siatki, metal bramek                          |
| **Tekstury**  | Turf + chalk marks                                                  |
| **Nastrój**   | Dyscyplina, rytm                                                    |
| **Hero**      | Bramka treningowa + cones w foreground; sztab w oddali (silhouette) |
| **Tło**       | Trees / fence / low stands soft                                     |
| **Dekor**     | Ball bag, bibs, whiteboard                                          |
| **Animacje**  | Cone shadow drift; distant player silhouettes loop                  |
| **Dźwięki**   | Whistle far · ball thump · coach shout muffled                      |

**Mapowanie:** Trening.

---

### 4.5 Szatnia

| Pole          | Opis                                                               |
| ------------- | ------------------------------------------------------------------ |
| **Klimat**    | Intymność drużyny; napięcie przed / po                             |
| **Kolory**    | Cool concrete, metal lockers, kit club colors, warm bulbs          |
| **Światło**   | Rzędy warm bulbs + cool fluorescent mix                            |
| **Materiały** | Metal, drewno ławek, tkanina koszulek, guma podłogi                |
| **Tekstury**  | Mesh, fabric, scratched metal                                      |
| **Nastrój**   | Broń się razem / po meczu cisza                                    |
| **Hero**      | Rząd koszulek z numerami (bez twarzy); ławka; tunel light na końcu |
| **Tło**       | Lockers depth                                                      |
| **Dekor**     | Boots, tape, tactics board, water bottles                          |
| **Animacje**  | Steam soft; bulb flicker rare                                      |
| **Dźwięki**   | Tape rip · studs on floor · muffled chant                          |

**Mapowanie:** Kadra.

---

### 4.6 Biuro Transferowe

| Pole          | Opis                                                                   |
| ------------- | ---------------------------------------------------------------------- |
| **Klimat**    | Negocjacja, napięcie kontraktu, poker menedżerski                      |
| **Kolory**    | Ash, ledger cream muted, brass, cool screen glow                       |
| **Światło**   | Desk lamp + monitor glow (nie neon)                                    |
| **Materiały** | Papier, skóra teczki, szkło, metal spinacz                             |
| **Tekstury**  | Paper fiber, leather                                                   |
| **Nastrój**   | Skupienie / deal                                                       |
| **Hero**      | Kontrakt i długopis na biurku; w tle tablica z sylwetkami (bez twarzy) |
| **Tło**       | Blind stripes soft                                                     |
| **Dekor**     | Phone, stamped folders, club stamp                                     |
| **Animacje**  | Paper edge lift; cursor blink abstract                                 |
| **Dźwięki**   | Pen · paper · quiet phone ring                                         |

**Mapowanie:** Transfery.

---

### 4.7 Centrum Medyczne

| Pole          | Opis                                                    |
| ------------- | ------------------------------------------------------- |
| **Klimat**    | Chłód, opieka, napięcie kontuzji                        |
| **Kolory**    | Cool blue-white, steel, soft mint, night outside window |
| **Światło**   | Clinical cool + window night contrast                   |
| **Materiały** | Stal, plastik medyczny, prześcieradło, szkło            |
| **Tekstury**  | Smooth sterile, soft fabric                             |
| **Nastrój**   | Troska / niepokój kontrolowany                          |
| **Hero**      | Leżanka + bandaż / ice pack; monitor rytmu abstract     |
| **Tło**       | Clean wall + frosted glass                              |
| **Dekor**     | Kit bag medical, clipboard, crutch soft                 |
| **Animacje**  | Soft ECG line; cool light pulse                         |
| **Dźwięki**   | Quiet beep · HVAC · distant corridor                    |

---

### 4.8 Akademia

| Pole          | Opis                                                                       |
| ------------- | -------------------------------------------------------------------------- |
| **Klimat**    | Nadzieja, młodzież, przyszłość klubu                                       |
| **Kolory**    | Jaśniejszy turf, warmer day light, club colors w bibs                      |
| **Światło**   | Natural daylight preferential (wyjątek od night — nadal w kanonie „klubu”) |
| **Materiały** | Trawa, małe bramki, szkolne tablice                                        |
| **Tekstury**  | Fresh turf, chalk                                                          |
| **Nastrój**   | Optymizm spokojny                                                          |
| **Hero**      | Małe bramki + youth silhouettes; academy crest soft                        |
| **Tło**       | Campus low buildings                                                       |
| **Dekor**     | Balls, cones, graduation scarf abstract                                    |
| **Animacje**  | Kids pass silhouette loop                                                  |
| **Dźwięki**   | Laughter far · whistle · birds                                             |

---

### 4.9 Gabinet Zarządu

| Pole          | Opis                                               |
| ------------- | -------------------------------------------------- |
| **Klimat**    | Władza, ocena, prestiż, napięcie polityczne        |
| **Kolory**    | Dark wood, deep navy, brass heavier, burgundy soft |
| **Światło**   | Warm chandeliers soft / wall sconces — luksus      |
| **Materiały** | Polished wood, leather, glass trophy case          |
| **Tekstury**  | Wood polish, carpet weave                          |
| **Nastrój**   | Ocena z góry / powaga                              |
| **Hero**      | Długi stół; puste krzesła; herb na ścianie         |
| **Tło**       | Curtain / night window                             |
| **Dekor**     | Gavel soft, folders, decanter abstract             |
| **Animacje**  | Dust in chandelier light                           |
| **Dźwięki**   | Clock · muffled voices · chair creak               |

---

### 4.10 Sala Konferencyjna

| Pole          | Opis                                              |
| ------------- | ------------------------------------------------- |
| **Klimat**    | Media, presja słów, światła kamer                 |
| **Kolory**    | Backdrop club colors, flash white soft, navy      |
| **Światło**   | Softbox frontal + backdrop lights                 |
| **Materiały** | Cloth backdrop, microphones, table cloth          |
| **Tekstury**  | Fabric weave, metal mic mesh                      |
| **Nastrój**   | Presja publiczna                                  |
| **Hero**      | Mikrofon cluster + club backdrop; empty chair     |
| **Tło**       | Logos abstract (nie prawdziwe marki 3rd party)    |
| **Dekor**     | Name plate blank, water glass, cameras silhouette |
| **Animacje**  | Soft flash occasional                             |
| **Dźwięki**   | Camera shutters · murmur · mic tap                |

---

### 4.11 Tunel Stadionowy

| Pole          | Opis                                                          |
| ------------- | ------------------------------------------------------------- |
| **Klimat**    | Przed meczem — najczystsza presja                             |
| **Kolory**    | Concrete grey, light at end (pitch glow), club stripe on wall |
| **Światło**   | Cool tunnel + warm pitch rectangle at end                     |
| **Materiały** | Beton, guma, metal rails                                      |
| **Tekstury**  | Rough concrete, scuff marks                                   |
| **Nastrój**   | Adrenalina / fokusienie                                       |
| **Hero**      | Point-of-view do światła boiska; silhouettes ahead            |
| **Tło**       | Tunnel vanishing point                                        |
| **Dekor**     | „STAFF” signage abstract, kit bags                            |
| **Animacje**  | Light at end pulse; steam breath                              |
| **Dźwięki**   | Boots echo · crowd roar rising · heart-like low boom          |

**Mapowanie:** Kick-Off / wejście w mecz.

---

### 4.12 Parking Klubowy

| Pole          | Opis                                            |
| ------------- | ----------------------------------------------- |
| **Klimat**    | Codzienność, przyjazd, „dzień w pracy klubu”    |
| **Kolory**    | Night asphalt, sodium/LED cool, club van accent |
| **Światło**   | Pole lamps; stadium glow on horizon             |
| **Materiały** | Asphalt, metal cars (silhouette), barriers      |
| **Tekstury**  | Asphalt grain, wet reflection optional          |
| **Nastrój**   | Grounded / routine                              |
| **Hero**      | Empty executive spot + stadium silhouette       |
| **Tło**       | Floodlight bloom distant                        |
| **Dekor**     | Barriers, club crest on gate                    |
| **Animacje**  | Light rain ripples optional                     |
| **Dźwięki**   | Keys · distant engine · night insects           |

---

### 4.13 Magazyn Sprzętu

| Pole          | Opis                                             |
| ------------- | ------------------------------------------------ |
| **Klimat**    | Rzemiosło, zaplecze, autentyczność               |
| **Kolory**    | Warm tungsten, wood shelves, orange ball accents |
| **Światło**   | Single warm bulb / strip                         |
| **Materiały** | Wood, canvas bags, rubber, metal                 |
| **Tekstury**  | Canvas, dust motes                               |
| **Nastrój**   | Hands-on / honest                                |
| **Hero**      | Shelves of balls + cones; kit bags               |
| **Tło**       | Deep shelf dark                                  |
| **Dekor**     | Nets, pumps, numbered crates                     |
| **Animacje**  | Dust in light beam                               |
| **Dźwięki**   | Ball bounce soft · zipper · shelf creak          |

---

### 4.14 Pokój Analityków

| Pole          | Opis                                                     |
| ------------- | -------------------------------------------------------- |
| **Klimat**    | Skupienie danych, taktyka, chłodna inteligencja          |
| **Kolory**    | Dark screens cyan-soft (kontrolowany), chalk white, navy |
| **Światło**   | Screen glow + dim overhead                               |
| **Materiały** | Glass screens, metal desks, chalk/board                  |
| **Tekstury**  | Pixel soft, chalk dust                                   |
| **Nastrój**   | Analiza / klarowność                                     |
| **Hero**      | Tactics board + freeze-frame pitch diagram abstract      |
| **Tło**       | Multi-monitor bokeh                                      |
| **Dekor**     | Sticky notes, remote, coffee                             |
| **Animacje**  | Diagram line draw loop                                   |
| **Dźwięki**   | Soft UI ticks · rewind tape abstract · hush              |

---

### 4.15 Gabinet Skautów

| Pole          | Opis                                           |
| ------------- | ---------------------------------------------- |
| **Klimat**    | Podróż, odkrycie, mapy, notatki                |
| **Kolory**    | Warm desk, map paper, brass pins, night window |
| **Światło**   | Desk lamp pool                                 |
| **Materiały** | Paper maps, cork, leather notebook             |
| **Tekstury**  | Paper, cork, ink                               |
| **Nastrój**   | Ciekawość / trop                               |
| **Hero**      | Mapa z pinezkami + dossier bez twarzy          |
| **Tło**       | Bookshelf blur                                 |
| **Dekor**     | Camera, boarding pass abstract, binoculars     |
| **Animacje**  | Pin drop; page turn                            |
| **Dźwięki**   | Page · stamp · distant train optional          |

---

### 4.16 Biuro Finansowe

| Pole          | Opis                                                            |
| ------------- | --------------------------------------------------------------- |
| **Klimat**    | Dyscyplina liczb, ciężar budżetu, spokój księgi                 |
| **Kolory**    | Ledger green-grey, paper ivory muted, brass calculator era soft |
| **Światło**   | Cool office + warm desk                                         |
| **Materiały** | Paper, binder, glass desk, metal                                |
| **Tekstury**  | Ledger lines, paper fiber                                       |
| **Nastrój**   | Kontrola / trzeźwość                                            |
| **Hero**      | Otwarta księga + pieczęć klubu; w tle safe abstract             |
| **Tło**       | Filing cabinets depth                                           |
| **Dekor**     | Stamp, pen, binder clips, envelope wage                         |
| **Animacje**  | Stamp press; column highlight soft                              |
| **Dźwięki**   | Stamp · paper · quiet calculator                                |

**Mapowanie:** Finanse.

---

### 4.17 Muzeum Klubu

| Pole          | Opis                                                 |
| ------------- | ---------------------------------------------------- |
| **Klimat**    | Pamięć, chwała, legenda                              |
| **Kolory**    | Dark gallery, gold spots, wood, glass                |
| **Światło**   | Museum spotlights na eksponatach                     |
| **Materiały** | Glass cases, polished wood, metal trophies           |
| **Tekstury**  | Glass reflection, velvet                             |
| **Nastrój**   | Duma / nostalgia                                     |
| **Hero**      | Puchar w gablocie w warm spot; reszta w mroku        |
| **Tło**       | Gallery void                                         |
| **Dekor**     | Scarves framed, boots historic, photos blurred faces |
| **Animacje**  | Dust mote in spot; slow camera push conceptual       |
| **Dźwięki**   | Quiet hall reverb · soft choir far optional          |

---

### 4.18 Sklep Klubowy

| Pole          | Opis                                                       |
| ------------- | ---------------------------------------------------------- |
| **Klimat**    | Kibic, barwy, energia merch — nadal premium night          |
| **Kolory**    | Club primary dominant controlled, clean shelves, warm LEDs |
| **Światło**   | Retail soft + window night                                 |
| **Materiały** | Fabric shirts, glass, cardboard tags                       |
| **Tekstury**  | Fabric knit, print                                         |
| **Nastrój**   | Belonging / fan love                                       |
| **Hero**      | Rack of shirts (backs/numbers); scarf cascade              |
| **Tło**       | Crest wall soft                                            |
| **Dekor**     | Price tags blank, bags, mannequin headless                 |
| **Animacje**  | Fabric sway soft                                           |
| **Dźwięki**   | Soft pop ambient · bag rustle · door chime                 |

---

## 5. Relacje lokacji (mapa emocji)

```
                    [Stadion]
                        │
         ┌──────────────┼──────────────┐
         │              │              │
    [Tunel] ──────► [Murawa] ◄──── [Trybuny*]
         │              │
         ▼              ▼
    [Szatnia]     [Boisko treningowe] ── [Akademia]
         │
         ▼
 [Gabinet Menedżera] ←── codzienna oś decyzji
         │
    ┌────┼────┬─────────┬──────────┐
    ▼    ▼    ▼         ▼          ▼
Transfer Medyczne Analitycy  Finanse   Zarząd
    │                              │
 Skautów                      Konferencyjna
    │
 Magazyn · Parking · Muzeum · Sklep
```

\*Trybuny = warstwa Stadionu / Match Moments, nie osobna lokacja checklisty Ownera.

---

## 6. AI Image Strategy (system studia)

Cel: wszystkie grafiki wyglądają jak z **jednego profesjonalnego studio** — nie jak losowy generator.

### 6.1 Master Style Lock (wklejaj ZAWSZE)

```
LastFootball official concept art, Night Pitch Office universe,
semi-flat sport editorial, premium football club atmosphere,
nocturnal stadium mood, warm floodlights + cool night ambient,
materials: concrete, brushed brass, wet turf grain, matte glass,
no purple neon, no cyberpunk, no cartoon toy style, no SaaS UI mockup,
no readable random text, no photorealistic faces, no celebrity likeness,
cinematic crop, subtle film grain, cohesive studio look
```

### 6.2 Negative Lock (wklejaj ZAWSZE)

```
UI screenshot, dashboard, sidebar, KPI cards, spreadsheet,
purple glow, pink lighting, anime, chibi, clipart,
stock photo watermark, busy collage, oversized lens flare,
Inter font poster, plastic 3D render toy, Unreal Engine screenshot dump,
logo mashup of real clubs, FIFA/EA trademark, readable lorem ipsum
```

### 6.3 Pipeline produkcji (system)

1. **Brief lokacji** — 5 zdań z §4 tej Biblii
2. **Master + Negative Lock**
3. **Location Modifier** (poniżej)
4. **Shot type** — Hero / BG / Spot / Moment / Marketing
5. **Seed discipline** — trzymaj family seeds per lokacja
6. **Review gate** — checklista §6.5
7. **Post** — grade do palety master; usuń tekst; crop safe area
8. **Catalog** — ID z Asset Library

### 6.4 Location Modifiers (doklejaj)

| Lokacja     | Modifier                                                                           |
| ----------- | ---------------------------------------------------------------------------------- |
| Gabinet     | `manager office desk, crest on desk, window to floodlit stadium, desk lamp warmth` |
| Stadion     | `modern stadium exterior night, floodlight masts, architectural crop`              |
| Murawa      | `pitch-level wet grass, white lines, floodlights above, blurred stands`            |
| Trening     | `training ground, cones, portable goal, daylight-for-club or training flood`       |
| Szatnia     | `locker room, hanging shirts no faces, benches, warm bulbs`                        |
| Transfery   | `transfer office, contract papers, leather folder, negotiation desk`               |
| Medyczne    | `medical room cool light, treatment table, clean steel`                            |
| Akademia    | `youth academy pitch, small goals, hopeful daylight`                               |
| Zarząd      | `boardroom dark wood, long table, prestige`                                        |
| Konferencja | `press room backdrop, microphones, softbox light`                                  |
| Tunel       | `stadium tunnel POV, bright pitch rectangle at end`                                |
| Parking     | `club parking night, stadium glow horizon`                                         |
| Magazyn     | `equipment room, ball shelves, warm bulb dust`                                     |
| Analitycy   | `analyst room, tactics board, soft screen glow`                                    |
| Skauci      | `scout office, map pins, dossier, desk lamp`                                       |
| Finanse     | `finance office, ledger book, club stamp`                                          |
| Muzeum      | `club museum, trophy in glass case spotlight`                                      |
| Sklep       | `club store, shirt rack backs, scarves, crest wall`                                |

### 6.5 Shot-type recipes

| Typ                    | Cel                      | Kadrowanie                           | Extra                        |
| ---------------------- | ------------------------ | ------------------------------------ | ---------------------------- |
| **Hero Artwork**       | Emocja lokacji           | 16:9 / 3:2; safe center 60%          | Strong FG prop               |
| **Backgrounds**        | Atmosphere under content | 16:9; darker edges; low contrast mid | No focal subject fighting UI |
| **Concept Art**        | Eksploracja              | free                                 | Oznacz CONCEPT; nie runtime  |
| **Marketing Art**      | Landing / store / social | 16:9 / 1:1 / 9:16                    | Brand lock LF; crest OK      |
| **Loading Screens**    | Oczekiwanie = świat      | 16:9 / mobile 9:16                   | Single subject + grain       |
| **UI Decorations**     | Fragments / vignettes    | transparent PNG/WebP                 | Isolated, easy tint          |
| **Spot Illustrations** | Empty / soft-lock        | 1:1 / 4:3                            | Negative space               |

### 6.6 Consistency Gate (PASS/FAIL)

PASS tylko jeśli:

- [ ] Night Pitch Office wyczuwalne w 1 sekundę
- [ ] Paleta master (brak purple/cyan dominant)
- [ ] Materiały czytelne (beton/mosiądz/murawa…)
- [ ] Brak twarzy fotorealistycznych
- [ ] Brak UI chrome w kadrze
- [ ] Spójne z innymi assetami tej lokacji
- [ ] Safe area pod przyszłą treść (BG)
- [ ] Zero losowego tekstu

### 6.7 Naming & wersjonowanie grafik

`lf-world-{location}-{type}-{variant}-v{n}`

Przykład: `lf-world-office-hero-night-v03`

---

## 7. Relacja do innych SSOT

| Dokument            | Rola względem Art Bible              |
| ------------------- | ------------------------------------ |
| Ta Biblia           | **SSOT świata / obrazu**             |
| Asset Library       | Katalog produkcji                    |
| Roadmap Concept Art | Kolejność produkcji lokacji          |
| Art Direction 01    | Most do UI/DS (nie zastępuje Biblii) |
| UI Design Guide §16 | SSOT hierarchii decyzji UI           |
| GDD                 | SSOT mechanik — nie obrazu           |

Konflikt UI vs świat: **świat nie może psuć §16** (np. hero artwork nie wymusza KPI wall). Konflikt mechanik vs świat: wygrywa GDD dla reguł, Biblia dla obrazu.

---

## 8. Definition of Done (ten EPIC docs)

- [x] Filozofia Night Pitch Office spisana
- [x] Visual Language + Style Guide
- [x] 18 lokacji z pełnym briefem
- [x] AI Image Strategy systemowa
- [ ] Owner GO na kanon świata
- [ ] Start produkcji wg Roadmap (osobne EPICi asset — po GO)

**Bez kodu. Bez commitów w tym etapie (chyba że Owner każe docs commit osobno).**

---

## Historia

| Wersja | Data       | Opis                                    |
| ------ | ---------- | --------------------------------------- |
| 0.1.0  | 2026-07-28 | Pierwsza Art Bible (LFE-CONCEPT-ART-01) |
