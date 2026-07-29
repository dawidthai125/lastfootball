# LFE-CONCEPT-ART-01 — ASSET LIBRARY

**EPIC:** LFE-CONCEPT-ART-01  
**Etap:** AUDIT + ART BIBLE + CONCEPT LIBRARY  
**Status:** DRAFT — katalog produkcji (bez IMPLEMENT)  
**Data:** 2026-07-28  

> Katalog **wszystkich klas assetów** świata LastFootball.  
> Kanon stylu: [`LFE-CONCEPT-ART-01-ART-BIBLE.md`](./LFE-CONCEPT-ART-01-ART-BIBLE.md).  
> Kolejność produkcji: [`LFE-CONCEPT-ART-01-ROADMAP.md`](./LFE-CONCEPT-ART-01-ROADMAP.md).  
> **Nie jest** to lista plików w repo — to **specyfikacja biblioteki** do stworzenia.

---

## 0. Konwencje katalogu

### 0.1 ID

`LF-A-{CAT}-{NNN}` — np. `LF-A-HERO-001`

### 0.2 Priorytet

| Priorytet | Znaczenie |
| --------- | --------- |
| **P0** | Fundament immersji (bez tego świat nie stoi) |
| **P1** | Pełny klub codzienny |
| **P2** | Moments / marketing / depth |
| **P3** | Future / nice-to-have |

### 0.3 Rozmiary kanoniczne (produkcja)

| Slot | Ratio | px (master) | Runtime hint |
| ---- | ----- | ----------- | ------------ |
| Hero desktop | 16:9 | 3840×2160 | downscale WebP |
| Hero mobile | 9:16 | 1440×2560 | |
| Background | 16:9 | 2560×1440 | heavy compress + blur OK |
| Spot | 1:1 | 1024×1024 | transparent |
| Icon | 1:1 | 64 / 128 / 256 SVG first | |
| Pattern/Texture | tile | 512×512 / 1024×1024 | seamless |
| Banner | 3:1 | 2400×800 | |
| Badge | 1:1 | 512×512 | |
| Loading | 16:9 + 9:16 | j.w. | |
| Crest | 1:1 | 1024×1024 SVG/PNG | |
| Shirt flat | 3:4 | 1200×1600 | |
| Moment | 16:9 | 2560×1440 | |

### 0.4 Warianty standardowe

| Sufiks | Opis |
| ------ | ---- |
| `-night` | Domyślny Night Pitch |
| `-matchday` | Warm flood boost |
| `-idle` | Spokojniejszy, mniej warm |
| `-clubtint` | Slot pod barwę klubu (maska) |
| `-softlock` | Desaturated / fog for locked |
| `-empty` | Spot empty state |
| `-alt` | Alternatywna kompozycja A/B |

### 0.5 Styl (globalny)

Zawsze: **Night Pitch Office · semi-flat sport editorial · Art Bible Master Lock**.

---

## 1. Hero Artwork

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-HERO-001 | Gabinet — Night Desk | Hub emotional cover / loading | 16:9, 9:16 | night, matchday, idle | Desk+window floodlights | P0 |
| LF-A-HERO-002 | Tunel — Light at End | Kick-Off / match entry | 16:9, 9:16 | night, matchday | POV tunnel | P0 |
| LF-A-HERO-003 | Murawa — Low Angle | Landing / brand / match | 16:9 | night, matchday | Pitch-level lines | P0 |
| LF-A-HERO-004 | Szatnia — Kits Row | Kadra cover | 16:9 | night, clubtint | Shirts no faces | P0 |
| LF-A-HERO-005 | Biuro Transferowe — Contract | Transfery cover | 16:9 | night, idle | Contract desk | P0 |
| LF-A-HERO-006 | Boisko Treningowe | Trening cover | 16:9 | day-club, night-flood | Cones+goal | P1 |
| LF-A-HERO-007 | Biuro Finansowe — Ledger | Finanse cover | 16:9 | night | Ledger+stamp | P1 |
| LF-A-HERO-008 | Stadion — Fasada | Club / stadium screens | 16:9 | night, matchday | Architecture crop | P1 |
| LF-A-HERO-009 | Gabinet Zarządu | Board messages | 16:9 | night | Long table | P2 |
| LF-A-HERO-010 | Muzeum — Trophy Spot | Achievements / prestige | 16:9 | night | Glass case | P2 |
| LF-A-HERO-011 | Sala Konferencyjna | Media / press | 16:9 | night | Mics+backdrop | P2 |
| LF-A-HERO-012 | Akademia — Youth Pitch | Academy unlock | 16:9 | day-club | Hopeful light | P2 |
| LF-A-HERO-013 | Centrum Medyczne | Injuries narrative | 16:9 | cool | Clinical calm | P2 |
| LF-A-HERO-014 | Pokój Analityków | Tactics depth | 16:9 | night | Board+screens | P2 |
| LF-A-HERO-015 | Gabinet Skautów | Scouting | 16:9 | night | Map pins | P2 |
| LF-A-HERO-016 | Sklep Klubowy | Shop future | 16:9 | night, clubtint | Shirt rack | P3 |
| LF-A-HERO-017 | Parking Klubowy | Day-in-life / flavor | 16:9 | night | Gate+glow | P3 |
| LF-A-HERO-018 | Magazyn Sprzętu | Flavor / training props | 16:9 | warm-bulb | Ball shelves | P3 |

---

## 2. Backgrounds

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-BG-001 | Void Grain | Global base under UI | 16:9 tile+full | night | Noise 2–3% | P0 |
| LF-A-BG-002 | Gabinet Wash | Hub atmosphere | 16:9 | night, matchday, idle | Window vignette low contrast | P0 |
| LF-A-BG-003 | Turf Mist | Hub idle / training | 16:9 + tile | night | Emerald falloff | P0 |
| LF-A-BG-004 | Pitch Grid Soft | Kick-Off / tactics | 16:9 | night | Line grid 3–5% | P0 |
| LF-A-BG-005 | Flood Vignette L/R | Matchday frames | pair PNG | matchday | Radial warm | P0 |
| LF-A-BG-006 | Szatnia Mesh | Squad lists atmosphere | 16:9 | night, clubtint | Fabric grain | P0 |
| LF-A-BG-007 | Ledger Paper | Finance atmosphere | 16:9 | night | Paper fiber | P1 |
| LF-A-BG-008 | Transfer Blinds | Transfers atmosphere | 16:9 | night | Blind stripes soft | P1 |
| LF-A-BG-009 | Stadium Silhouette Strip | League / post-match | 16:9 | night, matchday | Bottom/top strip | P1 |
| LF-A-BG-010 | Tunnel Gradient | PreMatch | 16:9 | matchday | Vanishing cool→warm | P1 |
| LF-A-BG-011 | Medical Frost | Medical | 16:9 | cool | Frosted glass | P2 |
| LF-A-BG-012 | Boardroom Curtain | Board | 16:9 | night | Dark wood wash | P2 |
| LF-A-BG-013 | Gallery Void | Museum | 16:9 | night | Spotlight ready | P2 |
| LF-A-BG-014 | Shop Crest Wall | Shop | 16:9 | clubtint | Soft crest repeat | P3 |
| LF-A-BG-015 | Asphalt Night | Parking flavor | 16:9 | night | Wet optional | P3 |

**Zasada BG:** środek spokojniejszy; edges darker; zero „bohatera” walczącego z treścią.

---

## 3. Illustrations (Spot / Narrative)

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-ILL-001 | Empty Inbox | Brak wiadomości | 1:1 | empty | Envelope on desk | P1 |
| LF-A-ILL-002 | Soft-lock Trening | Trening zablokowany | 1:1 | softlock | Cones in fog | P0 |
| LF-A-ILL-003 | Soft-lock Transfer Window | Okno zamknięte | 1:1 | softlock | Closed stamp folder | P0 |
| LF-A-ILL-004 | Empty Market | Brak ofert | 1:1 | empty | Empty board | P1 |
| LF-A-ILL-005 | First Win | Post-match positive | 1:1 / 16:9 | moment | Abstract celebration no faces | P1 |
| LF-A-ILL-006 | Hard Defeat | Post-match calm | 1:1 | moment | Empty bench rain soft | P1 |
| LF-A-ILL-007 | Board Letter | Wiadomość zarządu | 1:1 | night | Sealed letter brass | P1 |
| LF-A-ILL-008 | Injury Notice | Kontuzja | 1:1 | cool | Tape+ice | P2 |
| LF-A-ILL-009 | Youth Prospect | Akademia | 1:1 | day-club | Small goal hope | P2 |
| LF-A-ILL-010 | Scout Lead | Skauting | 1:1 | night | Pin on map | P2 |
| LF-A-ILL-011 | Stadium Locked | Soft-lock stadion | 1:1 | softlock | Gate chain abstract | P2 |
| LF-A-ILL-012 | Shop Teaser | Future shop | 1:1 | clubtint | Scarf fold | P3 |

---

## 4. Icons

Sport Outline + Selective Fill. SVG master 256; export 24/32/48.

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-ICO-001 | Hub / Gabinet | Nav | 24–256 | outline, fill-active | Desk/crest | P0 |
| LF-A-ICO-002 | Trening | Nav | | | Whistle/cones | P0 |
| LF-A-ICO-003 | Kadra | Nav | | | Shirt | P0 |
| LF-A-ICO-004 | Transfery | Nav | | | Handshake/contract | P0 |
| LF-A-ICO-005 | Finanse | Nav | | | Ledger/coin | P0 |
| LF-A-ICO-006 | Terminarz | Nav | | | Calendar pitch | P0 |
| LF-A-ICO-007 | Liga | Nav | | | Table/flag | P0 |
| LF-A-ICO-008 | Stadion | Nav | | | Stand arch | P1 |
| LF-A-ICO-009 | Akademia | Nav | | | Youth crest | P1 |
| LF-A-ICO-010 | Skauting | Nav | | | Binoculars | P1 |
| LF-A-ICO-011 | Sponsorzy | Nav | | | Ribbon seal | P1 |
| LF-A-ICO-012 | Zarząd | Nav | | | Gavel soft | P1 |
| LF-A-ICO-013 | Wiadomości | Nav | | | Envelope | P0 |
| LF-A-ICO-014 | Profil | Nav | | | Manager mark | P0 |
| LF-A-ICO-015 | Ustawienia | Nav | | | Minimal gear sport | P0 |
| LF-A-ICO-016 | Live | Badge | | | Dot+pulse | P0 |
| LF-A-ICO-017 | Win | Form | | | W mark | P0 |
| LF-A-ICO-018 | Draw | Form | | | D mark | P0 |
| LF-A-ICO-019 | Loss | Form | | | L mark | P0 |
| LF-A-ICO-020 | Soft-lock | Access | | | Lock thin | P0 |
| LF-A-ICO-021 | Ball | Generic | | | Ball | P0 |
| LF-A-ICO-022 | Tactics Board | Match prep | | | Board | P1 |
| LF-A-ICO-023 | Medical Cross | Injury | | | Soft cross | P1 |
| LF-A-ICO-024 | Trophy | Prestige | | | Cup outline | P1 |
| LF-A-ICO-025 | Scarf | Fan | | | Scarf | P2 |
| LF-A-ICO-026 | Floodlight | Matchday | | | Mast light | P2 |
| LF-A-ICO-027 | Grass | Pitch | | | Tuft | P2 |
| LF-A-ICO-028 | Whistle | Ref/start | | | Whistle | P1 |

Docelowo **≥28 ikon P0/P1**; zestaw rozszerzalny bez zmiany stylu.

---

## 5. Patterns

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-PAT-001 | Pitch Micro Grid | Overlay | 512 tile | opacity steps | Thin lines | P0 |
| LF-A-PAT-002 | Club Stripe | Kit / banners | 512 tile | clubtint | Diagonal/vertical stripes | P1 |
| LF-A-PAT-003 | Crest Watermark | BG soft | 1024 | mono brass | Crest ghost | P1 |
| LF-A-PAT-004 | Hex Tech Soft | Analyst only | 512 | cool | Very subtle | P3 |
| LF-A-PAT-005 | Crowd Dotfield | Stands abstract | 1024 | night | Dot silhouette | P2 |

---

## 6. Textures

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-TEX-001 | Film Grain | Global | 1024 tile | 2–3% | Mono noise | P0 |
| LF-A-TEX-002 | Concrete Ash | Surfaces | 1024 | night | Matte rough | P0 |
| LF-A-TEX-003 | Wet Turf | Pitch | 1024 | wet, dry | Fiber green | P0 |
| LF-A-TEX-004 | Brass Brushed | Prestige metals | 512 | | Metal anisotropic soft | P1 |
| LF-A-TEX-005 | Fabric Locker | Szatnia | 1024 | clubtint | Weave | P0 |
| LF-A-TEX-006 | Paper Ledger | Finanse | 1024 | | Fiber+lines | P1 |
| LF-A-TEX-007 | Matte Glass | Windows | 512 | | Micro scratch | P1 |
| LF-A-TEX-008 | Wood Dark Polish | Zarząd | 1024 | | Fine grain | P2 |
| LF-A-TEX-009 | Asphalt | Parking | 1024 | wet | | P3 |
| LF-A-TEX-010 | Velvet Museum | Trophy base | 512 | | Soft | P2 |

---

## 7. Badges

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-BDG-001 | Matchday | Hub chip art | 512 | | Flood+ball | P1 |
| LF-A-BDG-002 | Window Open | Transfers | 512 | open/closed | Stamp | P1 |
| LF-A-BDG-003 | Training Done | Daily | 512 | | Whistle check | P1 |
| LF-A-BDG-004 | Live | Live match | 512 | pulse | Scarlet | P0 |
| LF-A-BDG-005 | Prestige LF | Brand | 512 | foil | Brass LF | P1 |
| LF-A-BDG-006 | Board Trust | Flavor | 512 | | Seal | P3 |

---

## 8. Banners

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-BAN-001 | Matchday Strip | Hub decision banner art | 3:1 | matchday, idle | VS atmosphere no logos clash | P0 |
| LF-A-BAN-002 | Transfer Inbox | Transfers hero strip | 3:1 | | Contract desk crop | P1 |
| LF-A-BAN-003 | Season Kick | Marketing / season | 3:1 | | Stadium+brass | P2 |
| LF-A-BAN-004 | Club Pride | Club tintable | 3:1 | clubtint | Stripe+crest frame | P1 |
| LF-A-BAN-005 | Trophy Parade | Achievement | 3:1 | | Museum gold | P2 |

---

## 9. Loading Screens

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-LOD-001 | Crest Breath | App / route load | 16:9, 9:16 | night | Crest+grain | P0 |
| LF-A-LOD-002 | Tunnel Walk | Entering match | 16:9, 9:16 | matchday | Tunnel POV | P0 |
| LF-A-LOD-003 | Turf Closeup | General | 16:9 | | Wet grass macro editorial | P1 |
| LF-A-LOD-004 | Desk Night | Hub load | 16:9 | | Office | P1 |
| LF-A-LOD-005 | Tips Rotation set | 5 kart tips | 16:9 | 5 scenes | Lokacje P0 | P2 |

---

## 10. Empty States

Zob. Illustrations ILL-001…004 +:

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-EMP-001 | No Fixtures | Terminarz pusty | 1:1 | empty | Calendar pitch blank | P1 |
| LF-A-EMP-002 | No Players Filter | Kadra filtr | 1:1 | empty | Empty locker | P1 |
| LF-A-EMP-003 | No Movements | Finanse | 1:1 | empty | Blank ledger page | P1 |

---

## 11. Match Moments

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-MOM-001 | Kick-Off Flash | Start | 16:9 | | Ball+light abstract | P1 |
| LF-A-MOM-002 | Goal Bloom | Gol (abstrakt) | 16:9 | home/away tint | Light bloom no faces | P1 |
| LF-A-MOM-003 | Final Whistle | Koniec | 16:9 | | Whistle+tunnel | P1 |
| LF-A-MOM-004 | Halftime Tunnel | Przerwa | 16:9 | | Tunnel cool | P2 |
| LF-A-MOM-005 | Var Silence | Tension rare | 16:9 | | Still crowd | P3 |
| LF-A-MOM-006 | Derby Heat | Special | 16:9 | clubtint | Stronger warm | P3 |

---

## 12. Trophies

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-TRP-001 | League Crown | Awans / tytuł abstract | 512–1024 | brass, silver | Semi-flat cup | P2 |
| LF-A-TRP-002 | National Cup | Puchar | | | Handle cup | P2 |
| LF-A-TRP-003 | Fair Play | Soft | | | Laurel | P3 |
| LF-A-TRP-004 | Manager Shield | Meta prestige | | | LF shield | P2 |
| LF-A-TRP-005 | Medal Set | W/D moments | 512 | gold/silver/bronze | | P2 |

---

## 13. Club Branding

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-BRD-001 | LF Monogram | Product mark | SVG | foil, mono, inverse | Brass LF | P0 |
| LF-A-BRD-002 | LF Wordmark | Marketing | SVG | | Condensed | P0 |
| LF-A-BRD-003 | LF Shield | Brand crest | 1024 | foil, flat | Shield+star | P0 |
| LF-A-BRD-004 | App Icon | Stores | 1024 | | Shield night | P1 |
| LF-A-BRD-005 | Social Kit | OG / Twitter | set | | Night Pitch | P1 |

---

## 14. Crests (system gracza)

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-CRS-001 | Frame Ring | Obwódka herbu | 1024 | brass, silver, club | Circular/shield frame | P0 |
| LF-A-CRS-002 | Template Pack A | Wizard | 1024 ×8–12 | color slots | Semi-flat heraldic | P0 |
| LF-A-CRS-003 | Template Pack B | Expansion | +8 | | | P2 |
| LF-A-CRS-004 | Placeholder Ghost | Loading crest | 512 | | Soft mono | P0 |
| LF-A-CRS-005 | Opponent Generic Set | AI clubs visual | 12–24 | | Distinct shapes | P1 |

---

## 15. Shirts

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-SHT-001 | Home Flat | Szatnia / sklep | 3:4 | clubtint | Back/number optional | P1 |
| LF-A-SHT-002 | Away Flat | | 3:4 | | | P2 |
| LF-A-SHT-003 | Third Flat | | 3:4 | | | P3 |
| LF-A-SHT-004 | GK Flat | | 3:4 | | | P2 |
| LF-A-SHT-005 | Training Bib | Trening | 3:4 | | Mesh bib | P1 |
| LF-A-SHT-006 | Hanger Silhouette | Spots | 1:1 | | No anatomy | P0 |

---

## 16. Scarves

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-SCF-001 | Classic Bar | Fan / shop / museum | 3:1 | clubtint | Knit stripes | P1 |
| LF-A-SCF-002 | Folded Stack | Empty/shop | 1:1 | | | P2 |
| LF-A-SCF-003 | Wave Abstract | Moments | 16:9 | | Motion fabric | P2 |

---

## 17. Supporters

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-SUP-001 | Crowd Silhouette | BG stands | 16:9 | dense/sparse | No faces | P1 |
| LF-A-SUP-002 | Tifo Abstract | Rare moment | 16:9 | clubtint | Geometric tifo | P3 |
| LF-A-SUP-003 | Smoke Soft | Goal moment | 16:9 | | Low opacity | P3 |

**Zakaz:** rozpoznawalne twarze, real club tifo IP.

---

## 18. Floodlights

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-FLD-001 | Mast Pair | Stadium hero | PNG/SVG | | Architecture | P1 |
| LF-A-FLD-002 | Bloom Sprite | Overlay | 1024 | soft/strong | Additive warm | P0 |
| LF-A-FLD-003 | Corner Wash | UI decoration | pair | L/R | | P0 |

---

## 19. Grass

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-GRS-001 | Turf Tile | BG seamless | 1024 | wet/dry | | P0 |
| LF-A-GRS-002 | Macro Blade | Loading | 16:9 | | Editorial macro | P1 |
| LF-A-GRS-003 | Worn Patch | Realism soft | 512 | | Subtle wear | P2 |
| LF-A-GRS-004 | Line Paint | Overlays | SVG | | Ivory lines | P0 |

---

## 20. Stadium Architecture

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-STAD-001 | Facade Crop A | Club/stadium | 16:9 | night | Modern | P1 |
| LF-A-STAD-002 | Facade Crop B | Alt | 16:9 | | | P2 |
| LF-A-STAD-003 | Stand Bowl | Interior crop | 16:9 | | | P1 |
| LF-A-STAD-004 | Gate Crest | Entry | 1:1 | | | P2 |
| LF-A-STAD-005 | Roof Truss | Abstract | 16:9 | | Structural lines | P3 |

---

## 21. Manager Office Props

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-OFF-001 | Desk Crest Stand | Hero FG | isolated | | | P0 |
| LF-A-OFF-002 | Desk Lamp | Decoration | | | Warm | P0 |
| LF-A-OFF-003 | Tactics Tablet | Soft | | | | P1 |
| LF-A-OFF-004 | Folder Stack | | | | | P1 |
| LF-A-OFF-005 | Coffee Cup | Flavor | | | | P2 |
| LF-A-OFF-006 | Window Frame | Composition | | | | P0 |

---

## 22. Transfer Props

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-TRN-001 | Contract Sheet | Hero/spot | isolated | signed/blank | | P0 |
| LF-A-TRN-002 | Fountain Pen | | | | | P0 |
| LF-A-TRN-003 | Club Stamp | | | | | P0 |
| LF-A-TRN-004 | Leather Portfolio | | | | | P1 |
| LF-A-TRN-005 | Offer Envelope | Inbox | | | | P1 |
| LF-A-TRN-006 | Negotiation Chairs | Scene | | | Silhouette | P2 |

---

## 23. Finance Props

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-FIN-001 | Open Ledger | Hero | | | | P0 |
| LF-A-FIN-002 | Wax Seal / Stamp | | | | Brass | P1 |
| LF-A-FIN-003 | Binder Stack | | | | | P1 |
| LF-A-FIN-004 | Safe Door Abstract | | | | | P2 |
| LF-A-FIN-005 | Wage Envelope | | | | | P2 |

---

## 24. Medical Props

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-MED-001 | Treatment Table | Hero | | | Cool | P2 |
| LF-A-MED-002 | Ice Pack | Spot | | | | P1 |
| LF-A-MED-003 | Kit Medical Bag | | | | | P2 |
| LF-A-MED-004 | Tape Roll | | | | | P1 |
| LF-A-MED-005 | Clipboard | | | | | P2 |

---

## 25. Training Props

| ID | Nazwa | Zastosowanie | Rozmiary | Warianty | Styl | Priorytet |
| -- | ----- | ------------ | -------- | -------- | ---- | --------- |
| LF-A-TRG-001 | Cone Set | Hero/spot | | | | P0 |
| LF-A-TRG-002 | Portable Goal | | | | | P0 |
| LF-A-TRG-003 | Ball Bag | | | | | P1 |
| LF-A-TRG-004 | Bibs Stack | | clubtint | | P1 |
| LF-A-TRG-005 | Ladder / Hurdles | | | | Soft | P2 |
| LF-A-TRG-006 | Coach Board | | | | | P1 |

---

## 26. Podsumowanie ilościowe (orientacja)

| Kategoria | Ilość pozycji w katalogu (v0.1) | P0 szacunek plików |
| --------- | -------------------------------- | ------------------ |
| Hero | 18 | 6–8 master |
| Backgrounds | 15 | 8 |
| Illustrations + Empty | 15 | 6 |
| Icons | 28+ | 28 |
| Patterns | 5 | 3 |
| Textures | 10 | 6 |
| Badges | 6 | 4 |
| Banners | 5 | 2 |
| Loading | 5 | 3 |
| Match Moments | 6 | 3 |
| Trophies | 5 | 2 |
| Club Branding | 5 | 3 |
| Crests | 5 systemów | templates 8–12 |
| Shirts / Scarves / Supporters | 12 | 4 |
| Flood / Grass / Stadium | 14 | 8 |
| Props (office→training) | ~30 | 12 |
| **Razem katalog** | **~180+ ID** | **MVP runtime ~90–110 plików** |

MVP immersji = wszystkie **P0** + kluczowe **P1** z Hub / Szatnia / Transfer / Trening / Tunel / Murawa.

---

## 27. Gate jakości assetu

Każdy plik przed katalogiem „approved”:

1. Zgodność z Art Bible Master Lock  
2. Poprawny ID + naming  
3. Warianty oznaczone  
4. Safe area (jeśli BG/Hero pod UI)  
5. Brak IP third-party  
6. Budżet KB ustalony w EPICu produkcyjnym  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Pierwszy katalog Asset Library |
