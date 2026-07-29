# LFE-UI-IMPL-01 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-01  
**Data:** 2026-07-29  
**Zakres:** Shell + Hub (Desktop + Mobile) + DoD PTI-01  

---

## 0. Raport implementacyjny

| Obszar | Zmiana |
| ------ | ------ |
| Tokeny | Align do SKIN-01: `bg.base #07111C`, brass `#C9A85C`, `text.onGold`, topbar **52px**, radius 6/8 |
| Shell | `data-lf-impl` · TopBar 52px via token · Hub bez right rail (bez zmian logiki) |
| Hub | LocationHero **HERO-001** (D+M PNG z World Art) → Decision → Primary → Secondary≤5 → meta |
| Soft-lock copy | „niedostępne” / title bez „Odblokuj” |
| PTI-01 | `players/[id]` + Transfer inbox/actions: mobile full-width CTA · `data-pti` |
| Assety | `public/assets/world-art/hero-001-office-night.png` · `…-mobile.png` (z rejestru 04) |

**Nie zmieniono:** Visual DNA · Style Lock · IA · `resolveNavAccess` reguły.

---

## 1. Pliki kluczowe

| Plik | Rola |
| ---- | ---- |
| `apps/web/src/styles/tokens.ts` | SSOT tokenów |
| `apps/web/src/app/globals.css` | SSR seed |
| `apps/web/src/components/hub/EarlyClubHub.tsx` | Hub Hi-Fi |
| `apps/web/src/components/hub/hub-decision.css` | Hub layout |
| `apps/web/src/components/layout/AppShell.tsx` | Shell marker |
| `apps/web/src/components/squad/squad-decision.css` | PTI-01 M |
| `apps/web/src/components/transfers/transfers-decision.css` | PTI-01 M |
| `apps/web/src/styles/impl-01.test.ts` | Guard testów |

---

## 2. DoD checklist

| Kryterium | Status |
| --------- | ------ |
| Hi-Fi Hub hierarchy | ✓ |
| World Art HERO-001 | ✓ |
| Design System tokens | ✓ |
| Desktop shell | ✓ |
| Mobile bottom nav + Hub | ✓ |
| PTI-01 SQD-03-M / XFR-02-M | ✓ (trasy + CSS mobile) |
| Brak regressji soft-lock Odblokuj | ✓ |

---

## 3. Świadome ograniczenia Sprint 1

- Nav rail nadal 184px expanded (Hi-Fi 72–88 icon rail = polish IMPL-02).  
- Fonty: istniejący `--font-ui` (Archivo/Source jeśli już w layout — bez Inter identity).  
- Match Path **nie** w tym sprincie.

---

## 4. Rekomendacja

# **GO — LFE-UI-IMPL-02 (Match Path)**

Kolejność: Tunnel → VS → Pre → Live → Moments → Post, z ukryciem nav w Tunnel/Live wg Hi-Fi.

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Notes Sprint 1 |
