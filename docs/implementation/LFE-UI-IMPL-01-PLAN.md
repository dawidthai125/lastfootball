# LFE-UI-IMPL-01 — PLAN

**EPIC:** LFE-UI-IMPL-01  
**Etap:** FRONTEND IMPLEMENTATION – SHELL & HUB  
**Data:** 2026-07-29  
**Status:** IN PROGRESS → Sprint 1  

> Decyzja: [`../game-design/LFE-UX-PLAYTEST-01-OWNER-DECISION.md`](../game-design/LFE-UX-PLAYTEST-01-OWNER-DECISION.md)  
> SSOT: World Art handoff · DS · Hi-Fi screens/components/states  

---

## 0. Cel Sprintu 1

Zaimplementować / zalignować **Application Shell** + **Hub** (Desktop + Mobile) do zatwierdzonego Night Pitch Office — bez zmiany DNA, Style Lock, IA ani flow.

| W scope | Poza scope (IMPL-02+) |
| ------- | --------------------- |
| Shell chrome (TopBar · Nav · Bottom) | Match Path pełny |
| Hub Matchday / Idle / EARLY | Training / Finance deep polish |
| Tokeny DS → kod | Nowe assety |
| Responsive D↔M | Silnik reguł |
| **PTI-01** jako DoD (ścieżki M) | HT · Academy · P1 |

---

## 1. SSOT mapowanie → kod

| Artefakt | Mapowanie w repo |
| -------- | ---------------- |
| DS tokeny | `apps/web/src/styles/tokens.ts` + `globals.css` |
| Shell | `components/layout/AppShell.tsx` · TopBar · LeftNavigation · MobileNav |
| Hub | `components/hub/EarlyClubHub.tsx` · `hub-decision.css` · `app/(game)/hub/page.tsx` |
| World Art HERO-001 | `public/assets/world-art/hero-001-office-*.png` |
| Nav access | `lib/hub` `resolveNavAccess` (bez nowych reguł) |
| PTI-01 SQD-03-M | `app/(game)/players/[id]` + `squad-decision.css` mobile |
| PTI-01 XFR-02-M | `TransfersView` cases + `transfers-decision.css` mobile |

---

## 2. Kolejność prac

1. Tokeny Night Pitch Office (base `#07111C` · gold `#C9A85C` · topbar 52px · radius Hi-Fi).  
2. Shell: chrome thin · Hub bez right rail · Bottom P0 Variant A.  
3. Hub: LocationHero WA → Decision → 1 Primary → Secondary ≤5 → meta 1 linia.  
4. PTI-01: mobile parity detal gracza + oferta transferowa (istniejące trasy, CSS/DoD).  
5. Testy + docs notes/test-plan.  
6. Commit · push.

---

## 3. Definition of Done (Sprint 1)

| Kryterium | Jak weryfikujemy |
| --------- | ---------------- |
| Zgodność Hi-Fi | Hero→Decision→Primary→Secondary; 1 Primary; brak KPI wall |
| World Art | HERO-001 z rejestru w Hub hero (D+M) |
| Design System | Tokeny z `tokens.ts` = SKIN-01 |
| Desktop parity | Nav rail · TopBar · Hub layout ≥768 |
| Mobile parity | Bottom nav · Primary full-width · Hub stack |
| **PTI-01** | `/players/[id]` i Accept oferty w Transferach używalne na &lt;768px |
| Brak regresji proto | Soft-lock bez „Odblokuj”; Kadra≠XI w Nav |

---

## 4. Ryzyka

| Ryzyko | Mitigacja |
| ------ | --------- |
| Drift purple / SaaS | Tylko tokeny DS |
| KPI wall regresja | Hub: max 1 linia status |
| Nowe reguły unlock | Tylko `resolveNavAccess` |

---

## 5. Następny EPIC

Po PASS Sprint 1 → rekomendacja **LFE-UI-IMPL-02 (Match Path)**.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Plan Sprint 1 Shell & Hub |
