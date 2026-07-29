# LFE-UI-MOTION-01 — IMPLEMENTATION NOTES

**EPIC:** LFE-UI-MOTION-01  
**Data:** 2026-07-30  
**Typ:** Presentation Thin (Guide §16)

---

## Zakres

| Wzorzec        | Powierzchnia            | Klasa                                   |
| -------------- | ----------------------- | --------------------------------------- |
| Decision enter | Hub `.lf-hub__decision` | `lf-motion-enter`                       |
| Primary press  | Hub Primary CTA         | `lf-motion-press`                       |
| Overlay enter  | Match Goal/Final        | `lf-motion-fade-in` + `lf-motion-enter` |

**SSOT:** `apps/web/src/styles/motion.css` · reguły: Guide §8.

## Poza zakresem

Landing · nav · routes · Live tick · tabele · listy · domena / resolvery / LFE.

## Pliki

| Ścieżka                                   | Rola                       |
| ----------------------------------------- | -------------------------- |
| `styles/motion.css`                       | Shared keyframes + klasy   |
| `app/globals.css`                         | `@import` motion           |
| `components/hub/EarlyClubHub.tsx`         | klasy Hub                  |
| `components/match/MatchMomentOverlay.tsx` | klasy overlay              |
| `components/match/match-path.css`         | usunięte lokalne keyframes |
| `game-design/UI_DESIGN_GUIDE.md` §8       | kontrakt produktowy        |
| `styles/motion-01.test.ts`                | guardy                     |

## Historia

| Wersja | Data       | Opis                 |
| ------ | ---------- | -------------------- |
| 0.1.0  | 2026-07-30 | Thin A implementacja |
