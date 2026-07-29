# LFE-UI-IMPL-02 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-IMPL-02  
**Data:** 2026-07-29  
**Wejście:** IMPL-01 `282cfc9`  

---

## 0. Raport

| Etap | Implementacja |
| ---- | ------------- |
| Tunnel | `/match/[id]/tunnel` · `MatchTunnelView` · HERO-002 |
| VS | `/match/[id]/vs` · `MatchVsView` · HERO-003 |
| Pre | `/match/[id]` · checklist HF-MCH-03 + kontekst |
| Live | `/match/[id]/live` · chrome Live · **bez** Primary „Gol” |
| Goal | `MatchMomentOverlay` MOM-002 (auto/tap dismiss) |
| Final | Overlay MOM-003 → ◆ Podsumowanie |
| Post | istniejący `PostMatchView` → Hub / complete |
| Shell | TopBar / Nav / MobileNav **ukryte** na `/match/*` |

Hub Primary / Terminarz / First Match → **tunnel**.

---

## 1. Pliki

| Ścieżka | Rola |
| ------- | ---- |
| `components/match/MatchTunnelView.tsx` | Tunnel |
| `components/match/MatchVsView.tsx` | VS |
| `components/match/MatchMomentOverlay.tsx` | Goal / Final |
| `components/match/match-path.css` | Style path |
| `components/match/PreMatchView.tsx` | Checklist |
| `components/match/LiveMatchFoundation.tsx` | Live + overlays |
| `components/layout/AppShell.tsx` | Hide chrome |
| `lib/match/match-path.ts` | Helpers |
| `lib/hub/resolve-primary-cta.ts` | CTA → tunnel |
| `public/assets/world-art/hero-002*` · `hero-003*` · `mom-002*` · `mom-003*` | WA |

---

## 2. DoD

| Gate | Status |
| ---- | ------ |
| Pełny Match Path | ✓ |
| Nav ukryty | ✓ |
| Hi-Fi / WA | ✓ |
| D↔M | ✓ (hero mobile/desktop · full-width Primary) |
| typecheck | ✓ |
| testy path + hub | ✓ |

---

## 3. Rekomendacja

# **GO — LFE-UI-IMPL-03** (domeny / polish) lub docs-only SSOT commit przed kolejnym releasem.

Owner: zaległe docs design = **osobny commit docs-only** (nie mieszać z IMPL).

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Notes Match Path |
