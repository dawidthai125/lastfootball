# LFE-UI-SKIN-01 — SCREEN INVENTORY

**EPIC:** LFE-UI-SKIN-01  
**Etap:** DESIGN SYSTEM FOUNDATION  
**Data:** 2026-07-28  
**Status:** DRAFT — inwentarz ekranów (architektura; bez makiet)

> Komponenty: [`LFE-UI-SKIN-01-COMPONENT-MAP.md`](./LFE-UI-SKIN-01-COMPONENT-MAP.md)  
> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> §16: [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md)  
> Assety: [`LFE-WORLD-ART-05-ASSET-REGISTRY.md`](./LFE-WORLD-ART-05-ASSET-REGISTRY.md)  

**Kolumny:** ID ekranu · Nazwa · Domena · Trasa (orientacyjna) · Komponenty DS · World Art · Dialekt · P

> Trasy = orientacja produktu (istniejące / planowane) — **bez** zmian routerów w tym EPICu.

---

## 0. Shell & system

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-SYS-01 | App boot / splash | Shell | — | LoadingFrame | `LOD-001` · `BRD-003` | Utility | P0 |
| SCR-SYS-02 | Route loading | Shell | * | LoadingFrame | `LOD-*` per lokacja | Utility | P0 |
| SCR-SYS-03 | Tips rotation | Shell | load | LoadingFrame | `LOD-005` | Utility | P1 |
| SCR-SYS-04 | Global soft-lock modal | Shell | overlay | SoftLockState · Modal | `ICO-020` · `ILL-*` | Utility | P0 |
| SCR-SYS-05 | Toast / inline error | Shell | overlay | Toast | — | Utility | P0 |

---

## 1. Hub

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-HUB-01 | Hub — dzień meczowy | Hub | `/hub` | LocationHero · DecisionBlock · Primary · Secondary×≤5 | `HERO-001` · `BG-002` · `OFF-*` · `ICO-001` | Event | P0 |
| SCR-HUB-02 | Hub — idle / po meczu | Hub | `/hub` | j.w. | j.w. · opcjonalnie `MOM-003` flavor rare | Event | P0 |
| SCR-HUB-03 | Hub — empty inbox | Hub | `/hub` | EmptyState | `ILL-001` | Event | P1 |
| SCR-HUB-04 | Hub — EARLY_CLUB decision | Hub | `/hub` | DecisionBlock (bez mid-season mock) | `HERO-001` | Event | P0 |

---

## 2. Squad (Kadra)

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-SQD-01 | Kadra — lista | Squad | `/squad` | LocationHero · DecisionBlock · PlayerRow · ContextList | `HERO-004` · `BG-006` · `SHT-*` · `ICO-003` | Question | P0 |
| SCR-SQD-02 | Kadra — empty | Squad | `/squad` | EmptyState | `EMP-002` | Question | P1 |
| SCR-SQD-03 | Gracz — detal | Squad | `/squad/:id` | DecisionBlock · Context | `SHT-001` · `SHT-006` | Question | P0 |
| SCR-SQD-04 | Skład XI (pre-match) | Squad/Match | match path | DecisionBlock · PlayerRow | `HERO-004` / pitch dialect | Event | P0 |

---

## 3. Match

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-MCH-01 | First Match / Tunnel intro | Match | pre-hub tunnel | LocationHero · Primary | `HERO-002` · `BG-010` · `LOD-002` | Event | P0 |
| SCR-MCH-02 | Kick-Off / VS | Match | kick-off | LocationHero · DecisionBlock · Score | `HERO-003` · `MOM-001` · `BDG-001` | Event | P0 |
| SCR-MCH-03 | Pre-match checklist | Match | pre-match | DecisionBlock · SoftLink | `HERO-002/003` · `ICO-028` | Event | P0 |
| SCR-MCH-04 | Live match | Match | live | StatusChip Live · Context | `ICO-016` · `SUP-001` · `FLD-*` · `BG-003` | Event | P0 |
| SCR-MCH-05 | Goal moment | Match | overlay | MatchMomentOverlay | `MOM-002` · `SUP-003` · `ILL-013` | Event | P0 |
| SCR-MCH-06 | Halftime | Match | HT | LocationHero | `MOM-004` · `HERO-002` | Event | P1 |
| SCR-MCH-07 | Final whistle | Match | FT | MatchMomentOverlay · DecisionBlock | `MOM-003` | Event | P0 |
| SCR-MCH-08 | Post-match summary | Match | post | DecisionBlock · Context · SoftLink→Hub | `SUP-001` · `SCF-003` · `HERO-004` flavor | Event | P0 |
| SCR-MCH-09 | No fixtures empty | Match | — | EmptyState | `EMP` / calendar dialect · `ICO-006` | Event | P1 |

---

## 4. Training

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-TRN-01 | Trening — pytanie dnia | Training | `/training` | LocationHero · DecisionBlock · Primary | `HERO-006` · `TRG-*` · `ICO-002` | Question | P0 |
| SCR-TRN-02 | Trening — soft-lock | Training | `/training` | SoftLockState | `ILL-002` · `ICO-020` | Question | P0 |
| SCR-TRN-03 | Trening — done / empty | Training | `/training` | EmptyState · SoftLink | `TRG-001` · `ILL-002` | Question | P1 |

---

## 5. Transfers

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-XFR-01 | Transfery — inbox ofert | Transfers | `/transfers` | LocationHero · DecisionBlock · ContextList | `HERO-005` · `BG-008` · `TRN-*` · `ICO-004` | Event | P0 |
| SCR-XFR-02 | Oferta — detal Accept/Reject | Transfers | `/transfers/:id` | DecisionBlock · Modal · Primary/Secondary | `TRN-001…003` | Event | P0 |
| SCR-XFR-03 | Okno zamknięte | Transfers | `/transfers` | SoftLockState / Empty | `ILL-003` | Event | P0 |
| SCR-XFR-04 | Rynek pusty | Transfers | `/transfers` | EmptyState | `ILL-004` | Event | P1 |
| SCR-XFR-05 | Kontroferta | Transfers | flow | Modal · DecisionBlock | `TRN-004/005` | Event | P1 |

---

## 6. Finance

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-FIN-01 | Finanse — pytanie / kasa | Finance | `/finance` | LocationHero · DecisionBlock · ContextList | `HERO-007` · `BG-007` · `FIN-*` · `ICO-005` | Question | P0 |
| SCR-FIN-02 | Finanse — empty ledger | Finance | `/finance` | EmptyState | `EMP-003` | Question | P1 |
| SCR-FIN-03 | Finanse — loading | Finance | — | LoadingFrame | `LOD-007` | Utility | P1 |

---

## 7. Inbox

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-INB-01 | Wiadomości — lista | Inbox | `/inbox` lub More | DecisionBlock · ContextList | `ICO-013` · `ILL-001` · `BG-002` | Event | P1 |
| SCR-INB-02 | Wiadomość — detal | Inbox | `/inbox/:id` | DecisionBlock · SoftLink | `ILL-007` · `TRN-005` | Event | P1 |
| SCR-INB-03 | Inbox empty | Inbox | — | EmptyState | `ILL-001` | Event | P1 |

---

## 8. Academy

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-ACA-01 | Akademia — hub lokacji | Academy | `/academy` | LocationHero · DecisionBlock | `HERO-012` · `ILL-009` · `ICO-009` | Question | P1 |
| SCR-ACA-02 | Akademia — soft-lock | Academy | — | SoftLockState | `ILL-009` · `ICO-020` | Question | P1 |
| SCR-ACA-03 | Skauting | Academy | `/scout` | LocationHero · ContextList | `HERO-015` · `ILL-010` · `ICO-010` | Question | P2 |
| SCR-ACA-04 | Analitycy / taktyka | Academy | `/tactics` | LocationHero · Context | `HERO-014` · `ICO-022` | Question | P2 |

---

## 9. Medical

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-MED-01 | Centrum medyczne | Medical | `/medical` | LocationHero · DecisionBlock · PlayerRow | `HERO-013` · `BG-011` · `MED-*` · `ICO-023` | Question | P1 |
| SCR-MED-02 | Kontuzja — notice | Medical | detal | DecisionBlock · Empty/Context | `ILL-008` · `MED-002/004` | Question | P1 |
| SCR-MED-03 | Medical soft-lock | Medical | — | SoftLockState | `ICO-020` · `BG-011` | Question | P2 |

---

## 10. Settings & profil

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-SET-01 | Ustawienia | Settings | `/settings` | Form rows · SoftLink | `BG-001` · `ICO-015` | Utility | P1 |
| SCR-SET-02 | Profil menedżera | Settings | `/profile` | DecisionBlock light · Context | `ICO-014` · crest | Utility | P1 |

---

## 11. Liga · Terminarz · Stadion · Zarząd (wspierające)

| ID | Nazwa | Domena | Trasa | Komponenty | World Art | Dialekt | P |
| -- | ----- | ------ | ----- | ---------- | --------- | ------- | - |
| SCR-SCH-01 | Terminarz | Schedule | `/fixtures` | ContextList · SoftLink | `ICO-006` · `BG-009` | Event | P1 |
| SCR-LGE-01 | Tabela ligi | League | `/league` | ContextTable · SoftLink | `ICO-007` · `BG-009` · `HERO-008` soft | Event | P1 |
| SCR-STA-01 | Stadion | Stadium | `/stadium` | LocationHero · DecisionBlock | `HERO-008` · `STAD-*` · `FLD-001` | Question | P2 |
| SCR-STA-02 | Stadion locked | Stadium | — | SoftLockState | `ILL-011` | Question | P2 |
| SCR-BRD-01 | Zarząd | Board | `/board` | LocationHero · DecisionBlock | `HERO-009` · `BG-012` · `ICO-012` | Event | P2 |
| SCR-BRD-02 | Press / media | Board | — | LocationHero | `HERO-011` | Event | P2 |
| SCR-ACH-01 | Trofea / muzeum | Prestige | `/achievements` | LocationHero · Context | `HERO-010` · `TRP-*` · `BDG-*` | Question | P2 |

---

## 12. Marketing / out-of-game (nie chrome gry)

| ID | Nazwa | Domena | Użycie | World Art | P |
| -- | ----- | ------ | ------ | --------- | - |
| SCR-MKT-01… | Key art surfaces | Marketing | Store / season / social | `MKT-*` only | P2 |

Nie używać `MKT-*` jako tła DecisionBlock.

---

## 13. Podsumowanie inwentarza

| Grupa | Liczba ID (orientacja) | P0 |
| ----- | ---------------------- | -- |
| Shell | 5 | 4 |
| Hub | 4 | 3 |
| Squad | 4 | 3 |
| Match | 9 | 7 |
| Training | 3 | 2 |
| Transfers | 5 | 3 |
| Finance | 3 | 1 |
| Inbox | 3 | 0 |
| Academy | 4 | 0 |
| Medical | 3 | 0 |
| Settings/Profil | 2 | 0 |
| Supporting | 7 | 0 |
| **Razem gry** | **~52** | **~23** |

---

## 14. Rekomendacja wireframes (następny etap)

Kolejność makiet:

1. **SCR-HUB-01** + shell nav  
2. **SCR-MCH-01/02/04/08** (ścieżka meczu)  
3. **SCR-SQD-01** · **SCR-TRN-01** · **SCR-XFR-01** · **SCR-FIN-01**  
4. Soft-lock / empty warianty P0  
5. P1 Inbox · Settings · Academy · Medical  

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-28 | Screen inventory · ~52 ekrany · mapowanie World Art |
