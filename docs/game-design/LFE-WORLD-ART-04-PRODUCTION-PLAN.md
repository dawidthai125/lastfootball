# LFE-WORLD-ART-04 — PRODUCTION PLAN

**EPIC:** LFE-WORLD-ART-04  
**Etap:** VOLUME PRODUCTION  
**Status:** ACTIVE — Owner GO · Style Lock ACTIVE  
**Data:** 2026-07-28  

> Właściwa produkcja biblioteki grafik LastFootball.  
> **Wzór nadrzędny:** Foundation Reference Board **`LF-REF-BOARD-FOUNDATION-v02`**.  
> **DNA:** [`LFE-WORLD-ART-03-VISUAL-DNA.md`](./LFE-WORLD-ART-03-VISUAL-DNA.md) = **LOCKED**.  
> **Lock:** [`LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md`](./LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md) = **ACTIVE**.  
> Kolejka: [`LFE-WORLD-ART-04-ASSET-QUEUE.md`](./LFE-WORLD-ART-04-ASSET-QUEUE.md).  
> Quality: [`LFE-WORLD-ART-04-QUALITY-PROCESS.md`](./LFE-WORLD-ART-04-QUALITY-PROCESS.md).  

**Zakaz tego EPICu:** UI · React · CSS · komponenty · commit/push bez osobnego Owner GO docs.

---

## 0. Cel

Zbudować **produkcyjną bibliotekę assetów** Wave 0–2 zgodną z Style Lock — nie eksplorację stylu (to zamknięte w 03R).

| Jest | Nie jest |
| ---- | -------- |
| Volume masters `LF-A-*` pod Library | Zmiana Visual DNA / Art Bible |
| Ekspansja z boardu v02 | Nowy kierunek artystyczny |
| Wave 0 → 1 → 2 w tej kolejności | Wave 3–5 (osobne EPICi później) |
| Semi-flat Night Pitch Office | Photoreal drift / SaaS look |

---

## 1. Hard rules (obowiązkowe)

1. Każdy asset **porównany wzrokowo** z odpowiednim REF z boardu v02.  
2. **Z5 semi-flat** — auto-FAIL przy photoreal regress.  
3. Paleta tylko z REF-09 / Art Bible §3.1.  
4. Lighting tylko z REF-08 / REF-04.  
5. Materiały tylko z REF-07 / REF-05 / REF-15.  
6. Consistency Gate z [`LFE-WORLD-ART-04-QUALITY-PROCESS.md`](./LFE-WORLD-ART-04-QUALITY-PROCESS.md) przed `APPROVED`.  
7. Naming: `lf-world-{wave}-{id}-{variant}-v{n}` + ID `LF-A-*`.  
8. Katalog docelowy artefaktów (produkcja): `docs/verification/lfe-world-art-04/` (tworzony przy pierwszym renderze Wave).  

---

## 2. Relacja Foundation Board → Volume

| REF (v02) | Rola w volume |
| --------- | ------------- |
| REF-01 Brand | Seed BRD-* production |
| REF-02 Office | Seed HERO-001 / BG-002 / OFF-* |
| REF-03 Stadium | Referencja architektury (Wave 3 later); lighting/material hint Wave 0–1 |
| REF-04 Floodlights | Seed FLD-* / BG-005 |
| REF-05 Pitch texture | Seed GRS-001 / TEX turf |
| REF-06 Tunnel | Seed HERO-002 / BG-010 / LOD-002 |
| REF-07 Materials | Seed TEX-* shared |
| REF-08 Lighting | Obowiązkowy sheet przy każdym Hero |
| REF-09 Color | Obowiązkowy swatch gate |
| REF-10 Patterns | Seed PAT-* |
| REF-11 Loading | Seed LOD-001 (+ LOD-002 z tunnel) |
| REF-12 Crest | Seed CRS-001/004 (+ pack A w Wave 0) |
| REF-13 Pitch hero | Seed HERO-003 / BG-003 |
| REF-14 Office BG | Seed BG-002 variants |
| REF-15 Texture scale | Grain budget gate |
| REF-16 Family | Cross-check studio match |

**Volume ≠ kopiuj REF 1:1.** Volume = produkcyjne warianty (ratios, export sizes, SVG gdzie trzeba) **w tym samym DNA**.

---

## 3. Fale produkcji (zakres Ownera)

### Wave 0 — Brand + Shared systems

| Tor | Zakres |
| --- | ------ |
| Brand Identity | Monogram · wordmark · shield · crest frames · placeholder · badge · (app/social P1) |
| Shared Materials | Grain · concrete · brass · void BG |
| Textures | Turf tile wet/dry · line paint |
| Patterns | Pitch grid · crest ghost |
| Lighting | Flood bloom soft/strong · corner wash L/R |

**DoD Wave 0:** Wszystkie P0 Wave 0 = `APPROVED` → odblokuj Wave 1.

### Wave 1 — Core locations + loading

| Tor | Zakres |
| --- | ------ |
| Manager Office | Hero 16:9+9:16 · BG wash · props · empty · loading desk · (marketing P0/P1) |
| Pitch | Hero · turf mist BG · grid BG · flood vignette pair |
| Tunnel | Hero · tunnel gradient BG · loading tunnel |
| Loading | Crest breath (jeśli nie domknięty w W0) · tunnel walk |

**DoD Wave 1:** Hub + Match entry immersja bez UI — masters APPROVED.

### Wave 2 — Daily club loop + icons

| Tor | Zakres |
| --- | ------ |
| Locker Room | Hero kits · mesh BG · hanger · empty locker · soft textures |
| Transfer Office | Hero contract · blinds BG · props · soft-lock/empty spots |
| Training Ground | Hero cones/goal · props · soft-lock · BG |
| Sport Icons | Core nav/set ICO-001…021 (P0) · extended 022…028 (P1) |

**DoD Wave 2:** Daily loop wizualnie rozróżnialny + icon core APPROVED.

**Poza tym EPICem (kolejne):** Wave 3 Stadium/Finance · Wave 4 Depth · Wave 5 Moments/Fans.

---

## 4. Kolejność krytyczna

```
W0 Brand + Color/Light/Material systems
  → W0 Textures/Patterns/Flood
    → W1 Office (z REF-02/14)
      → W1 Pitch + Tunnel (z REF-05/13/06)
        → W1 Loading
          → W2 Locker → Transfer → Training
            → W2 Icons (może start równolegle po W0 Brand)
```

Icons **nie** startują przed Brand (REF-01/12) APPROVED w volume.

---

## 5. Definition of Done — EPIC LFE-WORLD-ART-04 (Wave 0–2)

- [ ] Asset Queue Wave 0–2: wszystkie P0 = `APPROVED`  
- [ ] P1 w scope Ownera: `APPROVED` lub świadomie `DEFERRED` z listą  
- [ ] Zero FAIL otwartych na critical path  
- [ ] Artefakty w `docs/verification/lfe-world-art-04/` + indeks  
- [ ] Raport CLOSE (osobny) przed startem Wave 3 EPIC  
- [ ] Style Lock nadal ACTIVE · DNA nie zmienione  

---

## 6. Ryzyka

| Ryzyko | Mitygacja |
| ------ | --------- |
| Photoreal regress | Quality Process Z5 hard FAIL |
| Poster zamiast tile/sheet | Gate Comp + porównanie REF-05/09 |
| Drift między Wave 2 a board | Family check vs REF-16 co Wave |
| Scope creep Wave 3+ | Zakaz w tym EPICu |
| UI/token creep | Zakaz kodu |

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Start volume Wave 0–2 (Owner GO) |
