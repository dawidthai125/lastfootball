# LFE-UI-SKIN-01 — COMPONENT MAP

**EPIC:** LFE-UI-SKIN-01  
**Etap:** DESIGN SYSTEM FOUNDATION  
**Data:** 2026-07-28  
**Status:** DRAFT — mapa domen UI ↔ World Art  

> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> Ekrany: [`LFE-UI-SKIN-01-SCREEN-INVENTORY.md`](./LFE-UI-SKIN-01-SCREEN-INVENTORY.md)  
> Handoff: [`LFE-WORLD-ART-05-UI-HANDOFF.md`](./LFE-WORLD-ART-05-UI-HANDOFF.md)  
> UX: [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16  

**Legenda złożoności:** **L** = niska · **M** = średnia · **H** = wysoka  
**Priorytet implementacji skóry:** **P0** (pętla dzienna) · **P1** · **P2**

---

## 0. Shell wspólny (wszystkie domeny)

| Element | Złożoność | World Art | P |
| ------- | --------- | --------- | - |
| AppShell / TopBar / Nav | M | `BG-001` · `TEX-001` · `ICO-001…015` · crest `BRD/CRS` | P0 |
| LoadingFrame | L | `LOD-001…010` · `LOD-005` tips | P0 |
| Empty / SoftLock primitives | L | `EMP-*` · `ILL-*` · `ICO-020` | P0 |
| Toast / Modal base | L | — (chrome) | P0 |

---

## 1. Hub

| Pole | Wartość |
| ---- | ------- |
| **Lokacja świata** | Gabinet (Night Pitch Office) |
| **Dialekt §16** | Event / inbox |
| **Złożoność** | **H** (router dnia + phase/session) |
| **Priorytet** | **P0** |
| **World Art (kotwice)** | `HERO-001` (+ mobile) · `BG-002` · `OFF-001/002/006` · `ILL-001` · `LOD-004` · `ICO-001` |
| **REF board** | REF-02 |
| **Komponenty kluczowe** | LocationHero · DecisionBlock · PrimaryButton · SecondaryButton (≤5) · SoftLink · StatusChip (session) · EmptyState |
| **Zależności** | `resolve*` Hub / CTA / nav access — bez nowych reguł |
| **Ryzyko skóry** | KPI wall; drugi gold CTA; hero za mocny vs Decision |

**Secondary Hub (kolejność):** Trening · Kadra · Transfery · Finanse · Terminarz.

---

## 2. Squad (Kadra)

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Szatnia |
| **Dialekt** | Question-day |
| **Złożoność** | **H** (lista + XI vs Kadra glossary) |
| **Priorytet** | **P0** |
| **World Art** | `HERO-004` · `BG-006` · `TEX-005` · `SHT-001/006` · `EMP-002` · `ICO-003` |
| **REF** | REF-16 |
| **Komponenty** | LocationHero · DecisionBlock · PlayerRow · ContextList · SoftLink (→ Trening) · EmptyState |
| **Uwagi** | Copy: **Kadra** = `/squad`; **Skład** = XI (§16.6) |

---

## 3. Match

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Tunel / Murawa / Moments |
| **Dialekt** | Event (VS / kick-off / live / post) |
| **Złożoność** | **H** (ścieżka wieloekranowa) |
| **Priorytet** | **P0** |
| **World Art** | `HERO-002/003` · `BG-003/004/010` · `LOD-002/003` · `MOM-001…004` · `SUP-001…004` · `SCF-*` · `FLD-*` · `ICO-016` · `ICO-028` · `BDG-001` |
| **REF** | REF-06 · 13 · 05 · 04 |
| **Komponenty** | LocationHero · DecisionBlock · MatchMomentOverlay · StatusChip Live · Score typography · SoftLockState |
| **Uwagi** | First Match tunnel przed Hubem (kontrakt produktu) — skóra nie zmienia flow |

---

## 4. Training

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Boisko treningowe |
| **Dialekt** | Question-day |
| **Złożoność** | **M** |
| **Priorytet** | **P0** |
| **World Art** | `HERO-006` · `TRG-001…006` · `ILL-002` · `BG-003` (mist) · `ICO-002` |
| **REF** | REF-05 · 13 |
| **Komponenty** | LocationHero · DecisionBlock · Secondary/Primary · SoftLockState · EmptyState |
| **Uwagi** | Soft-lock Day 1 / unlock po meczach — tylko resolver |

---

## 5. Transfers

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Biuro transferowe |
| **Dialekt** | Event / inbox |
| **Złożoność** | **H** (oferty · okno · kontroferta) |
| **Priorytet** | **P0** |
| **World Art** | `HERO-005` · `BG-008` · `TRN-001…005` · `ILL-003/004` · `ICO-004` |
| **REF** | REF-02 (office dialect) |
| **Komponenty** | LocationHero · DecisionBlock · ContextList (oferty) · Modal confirm · SoftLink (→ Finanse/Kadra) · SoftLockState |
| **Ryzyko** | Tekst props na HERO-005 (PASS SOFT) — UI copy nie dublować losowym AI text |

---

## 6. Finance

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Biuro finansowe |
| **Dialekt** | Question-day |
| **Złożoność** | **M** |
| **Priorytet** | **P0** |
| **World Art** | `HERO-007` · `BG-007` · `TEX-006` · `FIN-001…005` · `EMP-003` · `LOD-007` · `ICO-005` |
| **REF** | REF-02 |
| **Komponenty** | LocationHero · DecisionBlock · ContextList (kategorie) · SoftLink (→ Transfery) |
| **Uwagi** | 1 kasa live; bez fintech dashboard art |

---

## 7. Inbox

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Gabinet / wiadomości (office dialect) |
| **Dialekt** | Event / inbox |
| **Złożoność** | **M** |
| **Priorytet** | **P1** |
| **World Art** | `ILL-001` · `ILL-007` (board letter) · `HERO-001` / `BG-002` · `ICO-013` · `TRN-005` (envelope flavor) |
| **REF** | REF-02 |
| **Komponenty** | DecisionBlock (najbliższa sprawa) · ContextList · EmptyState · SoftLink → Hub |
| **Uwagi** | Nie budować drugiego Hubu; Hub już routuje sprawę dnia |

---

## 8. Academy

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Akademia (+ Scout / Analyst depth) |
| **Dialekt** | Question-day (hopeful) |
| **Złożoność** | **M** |
| **Priorytet** | **P1** |
| **World Art** | `HERO-012` · `ILL-009` · `HERO-015` · `ILL-010` · `HERO-014` · `LOD-010` · `ICO-009/010/022` |
| **REF** | REF-05 · day-for-club wyjątek DNA |
| **Komponenty** | LocationHero · DecisionBlock · SoftLockState · ContextList |
| **Uwagi** | Daylight dozwolony; ten sam klub (DNA wyjątek) |

---

## 9. Medical

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Centrum medyczne |
| **Dialekt** | Question-day (cool calm) |
| **Złożoność** | **M** |
| **Priorytet** | **P1** |
| **World Art** | `HERO-013` · `BG-011` · `MED-001…005` · `ILL-008` · `LOD-009` · `ICO-023` |
| **REF** | cool clinical DNA |
| **Komponenty** | LocationHero · DecisionBlock · PlayerRow (kontuzje) · SoftLockState · EmptyState |
| **Uwagi** | Bez gore; cool light OK |

---

## 10. Settings

| Pole | Wartość |
| ---- | ------- |
| **Lokacja** | Shared / void (chrome) |
| **Dialekt** | Utility (nie event) |
| **Złożoność** | **L** |
| **Priorytet** | **P1** |
| **World Art** | `BG-001` · `ICO-015` · opcjonalnie `BRD-002` wordmark |
| **REF** | REF-01 / void |
| **Komponenty** | AppShell · Form rows · Primary (save rare) · SoftLink wstecz |
| **Uwagi** | Minimal atmosphere; decyzje produktu > dekoracja |

---

## 11. Domeny wspierające (poza listą Ownera, dla kompletności mapy)

| Domena | P | World Art | Złożoność |
| ------ | - | --------- | --------- |
| Terminarz / Liga | P1 | `ICO-006/007` · `BG-009` · `HERO-008` (liga/stadion) | M |
| Stadion | P2 | `HERO-008` · `STAD-*` · `ILL-011` | M |
| Zarząd / Press | P2 | `HERO-009/011` · `BG-012` · `ILL-007` · `ICO-012` | M |
| Achievements / Museum | P2 | `HERO-010` · `TRP-*` · `BDG-*` | L |
| Profil | P1 | `ICO-014` · crest | L |

---

## 12. Kolejność implementacji skóry (rekomendacja)

```
P0: Shell → Hub → Match path → Training → Squad → Transfers → Finance
P1: Inbox → Settings → Academy → Medical → Terminarz/Liga → Profil
P2: Stadium · Board · Museum · Supporters overlays (już w Match)
```

Wireframes (następny etap) startują od **Hub + Match + Squad**.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Component map · 10 domen Ownera + shell |
