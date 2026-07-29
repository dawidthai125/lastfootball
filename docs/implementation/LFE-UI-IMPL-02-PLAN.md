# LFE-UI-IMPL-02 — PLAN

**EPIC:** LFE-UI-IMPL-02  
**Etap:** MATCH PATH IMPLEMENTATION  
**Data:** 2026-07-29  
**Wejście:** IMPL-01 PASS (`282cfc9`)

---

## 0. Cel

Pełny Match Path Hi-Fi: Tunnel → VS → Pre → Live → Moments → Final → Post → Hub.

| Zasada                | Zastosowanie                                                |
| --------------------- | ----------------------------------------------------------- |
| Style Lock / DNA / WA | Assety z rejestru 04 · tokeny IMPL-01                       |
| Hide nav              | Shell: brak LeftNav / MobileNav / thin TopBar na `/match/*` |
| Bez nowego stylu      | Night Pitch Office only                                     |

---

## 1. Trasy

| Etap   | Route                | Komponent                        |
| ------ | -------------------- | -------------------------------- |
| Tunnel | `/match/[id]/tunnel` | `MatchTunnelView`                |
| VS     | `/match/[id]/vs`     | `MatchVsView`                    |
| Pre    | `/match/[id]`        | `PreMatchView` (checklist + CTA) |
| Live   | `/match/[id]/live`   | `LiveMatchFoundation` + overlays |
| Goal   | overlay w Live       | `MatchMomentOverlay`             |
| Final  | overlay w Live       | Final whistle → Post             |
| Post   | w Live po FT         | `PostMatchView` → Hub            |

Hub Primary / Terminarz → **tunnel** (nie od razu live).

---

## 2. World Art (public)

| ID       | Plik                                   |
| -------- | -------------------------------------- |
| HERO-002 | `hero-002-tunnel-night.png` (+ mobile) |
| HERO-003 | `hero-003-pitch-night.png`             |
| MOM-002  | `mom-002-goal-bloom.png`               |
| MOM-003  | `mom-003-final-whistle.png`            |

---

## 3. DoD

- [ ] Pełna ścieżka klikalna D+M
- [ ] Nav ukryty w Match Path
- [ ] Hi-Fi hierarchy / 1 Primary
- [ ] Goal overlay (nie fałszywy Primary „Gol”)
- [ ] Testy + typecheck PASS
- [ ] Commit tylko implementacyjny (bez SSOT design dump)

---

## Historia

| Wersja | Data       | Opis            |
| ------ | ---------- | --------------- |
| 0.1.0  | 2026-07-29 | Plan Match Path |
