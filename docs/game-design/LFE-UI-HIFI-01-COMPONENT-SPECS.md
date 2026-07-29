# LFE-UI-HIFI-01 — COMPONENT SPECS

**EPIC:** LFE-UI-HIFI-01  
**Data:** 2026-07-29  
**Status:** DRAFT — Hi-Fi spec komponentów (bez kodu)

> Ekrany: [`LFE-UI-HIFI-01-HIFI-SCREENS.md`](./LFE-UI-HIFI-01-HIFI-SCREENS.md)  
> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> Stany: [`LFE-UI-HIFI-01-STATE-SPECS.md`](./LFE-UI-HIFI-01-STATE-SPECS.md)

---

## 0. Zasady wspólne

| Reguła | Spec                                                  |
| ------ | ----------------------------------------------------- |
| Radius | 6–10px kontenery; Primary **nie** rounded-full pill   |
| Border | default `border.subtle`; Decision `border.prestige`   |
| Focus  | ring brass soft 2px (a11y)                            |
| Motion | 150–220ms ease-out; szacunek `prefers-reduced-motion` |
| Ikony  | tylko World Art `ICO-*` / crest — stroke ~1.75–2px    |

---

## 1. AppShell

| Parametr | Spec Hi-Fi                                                   |
| -------- | ------------------------------------------------------------ |
| Warstwy  | void → grain → chrome → main                                 |
| Desktop  | TopBar 52px · Nav 80px · Main fluid · Status 28px opcjonalny |
| Mobile   | TopBar 48px · Main · Bottom 56px + safe area                 |
| WA       | `BG-001` · `TEX-001` @ 2–3%                                  |
| Zakaz    | KPI chips w chrome · drugi Primary                           |

---

## 2. TopBar

| Slot | Treść            | Typo / kolor                                  |
| ---- | ---------------- | --------------------------------------------- |
| L    | Crest / monogram | `BRD-003`/`CRS-*` 28–32px · clubtint ring ≤1  |
| C    | Faza / dzień     | `type.label` · `text.muted`                   |
| R    | Kasa (1) · Live? | kasa `type.kpi` muted · Live = `ICO-016` rare |

**Stany:** default · (Live on) · (error toast niezależny).

---

## 3. NavItem / BottomNav

| Stan                 | Wygląd                                          |
| -------------------- | ----------------------------------------------- |
| Default              | outline brass ikona · `text.muted` label        |
| Hover                | `bg.hover`                                      |
| Active               | gold-soft fill · `text.gold` · prestige tick    |
| Disabled / soft-lock | opacity 0.45 · `ICO-020` small · tap → SoftLock |

Rozmiar hit ≥44px; ikony z rejestru (`ICO-001` Hub, `002` Trn, `003` Sqd, `004` Xfr, …).

---

## 4. Breadcrumb

| Użycie | Desktop głębokość ≥2 · Mobile = Back + tytuł |
| Separator | `text.faint` · |
| Link | soft · current = `text.primary` |

---

## 5. LocationHero

| Parametr     | Spec                                                 |
| ------------ | ---------------------------------------------------- |
| Asset        | `HERO-*` / `BG-*` per lokacja (HIFI-SCREENS)         |
| Overlay      | gradient do `bg.surface` / `bg.base` (czytelność H1) |
| Budżet uwagi | ≤ ~10% gdy Decision nad/pod                          |
| Zakaz        | inset rounded card gallery · floating stickers       |

Warianty: **full** (Hub/Tunnel) · **thin** (checklist/post) · **mobile 9:16** (`HERO-001-M`).

---

## 6. DecisionBlock

| Element          | Spec                                                             |
| ---------------- | ---------------------------------------------------------------- |
| Container        | `bg.surface` · padding `space.6–8` · prestige border gdy Primary |
| H1               | Archivo · pytanie/sprawa · `text.primary`                        |
| Support          | 1 zdanie Source Sans · `text.secondary`                          |
| Meta             | max 1 linia · `text.muted`                                       |
| Dialekt Event    | VS / sprawa / wynik                                              |
| Dialekt Question | nagłówek-pytanie                                                 |

---

## 7. PrimaryButton

| Parametr | Spec                                        |
| -------- | ------------------------------------------- |
| Fill     | `brand.gold.base` → press `brand.gold.deep` |
| Text     | `text.on-gold`                              |
| Height   | 44–48px · full-width mobile                 |
| Shadow   | `shadow.glow-gold` subtelnnie na focus      |
| Reguła   | **dokładnie 1** na ekran decyzji            |

---

## 8. SecondaryButton

| Parametr | Spec                                                             |
| -------- | ---------------------------------------------------------------- |
| Style    | outline `border.strong` · `text.secondary` lub slate soft fill   |
| Hub      | max **5** · równa waga wizualna między sobą · niższa niż Primary |
| Height   | 40–44px                                                          |

---

## 9. SoftLink

| Spec | `text.muted` · underline on hover · bez gold · łączy pętlę |

---

## 10. PlayerRow

| Spec    |                                       |
| ------- | ------------------------------------- |
| Layout  | [kit/status] [nazwa] [meta] [chevron] |
| Surface | transparent / `surface-alt` zebra     |
| Hover   | `bg.hover`                            |
| WA      | opcjonalnie `SHT-*` thumb semi-flat   |
| Touch   | min 48px wysokość                     |

---

## 11. ContextList / Table

| Spec | pod Decision · nie first-viewport wall · header `type.label` · rows 44px+ |

---

## 12. StatusChip

| Wariant   | Kolor / ikona                       |
| --------- | ----------------------------------- |
| Live      | scarlet + `ICO-016`                 |
| W/D/L     | `ICO-017…019` + success/warn/danger |
| Soft-lock | warn + `ICO-020`                    |
| Ready/OK  | success pitch                       |

Zawsze **ikona + label** (a11y).

---

## 13. EmptyState / SoftLockState

|      | Empty                                     | Soft-lock                      |
| ---- | ----------------------------------------- | ------------------------------ |
| Art  | `EMP-*` / `ILL-*`                         | `ILL-002/003/011` + `ICO-020`  |
| Copy | co zrobić dalej                           | dlaczego + kiedy (z resolvera) |
| CTA  | Secondary/Primary 1                       | ○ Wróć / Hub                   |
| Tone | desat OK · nie grey SaaS flat przypadkowy | fog soft                       |

---

## 14. Modal / Sheet

| Spec | `bg.raised` · `shadow.soft` · 1 Primary · Secondary cancel · focus trap (spec a11y) |

Użycie: confirm Accept transfer; soft-lock global.

---

## 15. MatchMomentOverlay

| Spec | full-bleed WA (`MOM-*`) · wynik/tytuł krótki · dismiss tap/auto · reduced-motion = fade |

Zakaz: dodatkowe promo stickers.

---

## 16. LoadingFrame

| Spec | `LOD-*` per lokacja · bez losowego tekstu AI · tips sheet `LOD-005` = P1 |

---

## 17. Toast / Banner

| Spec | inset top/bottom · info/danger · nie zasłania Primary na stałe · auto-dismiss |

---

## 18. Badge

| Spec | `BDG-001` matchday flavor · nie zastępuje StatusChip Live |

---

## Historia

| Wersja | Data       | Opis                     |
| ------ | ---------- | ------------------------ |
| 0.1.0  | 2026-07-29 | Component Hi-Fi specs P0 |
