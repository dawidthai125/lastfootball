# LFE-UI-HIFI-01 — HIGH-FIDELITY SCREENS

**EPIC:** LFE-UI-HIFI-01  
**Etap:** HIGH-FIDELITY UI DESIGN  
**Status:** DRAFT — specyfikacja Hi-Fi (bez React · CSS · HTML · bez nowych assetów)  
**Data:** 2026-07-29  

> DS: [`LFE-UI-SKIN-01-DESIGN-SYSTEM.md`](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)  
> Wireframes: [`LFE-UI-WIREFRAMES-01-WIREFRAMES.md`](./LFE-UI-WIREFRAMES-01-WIREFRAMES.md)  
> IA / Flows: [`LFE-UI-WIREFRAMES-01-IA.md`](./LFE-UI-WIREFRAMES-01-IA.md) · [`…-FLOWS.md`](./LFE-UI-WIREFRAMES-01-FLOWS.md)  
> Handoff: [`LFE-WORLD-ART-05-UI-HANDOFF.md`](./LFE-WORLD-ART-05-UI-HANDOFF.md)  
> Specs: [`LFE-UI-HIFI-01-COMPONENT-SPECS.md`](./LFE-UI-HIFI-01-COMPONENT-SPECS.md) · [`…-STATE-SPECS.md`](./LFE-UI-HIFI-01-STATE-SPECS.md)  
> Review: [`LFE-UI-HIFI-01-DESIGN-REVIEW.md`](./LFE-UI-HIFI-01-DESIGN-REVIEW.md)  

**Zasada:** Night Pitch Office + §16 — **nie** nowy styl. Kolory/typo = tokeny DS; grafiki = rejestr World Art.

---

## 0. Konwencje Hi-Fi

| Element | Spec |
| ------- | ---- |
| Tło bazowe | `bg.base` `#07111C` + grain `TEX-001` @ 2–3% |
| Hero | Full-bleed / edge crop; vignette do `bg.surface`; **nie** card inset |
| Decision zone | `bg.surface` + `border.prestige` gdy Primary obecny |
| Primary | `brand.gold` fill · `text.on-gold` · radius umiarkowany (nie pill SaaS) |
| Secondary | outline / slate · wizualnie niższe |
| Soft-link | `text.muted` underline |
| Typo H1 | Archivo · pytanie/sprawa |
| Typo body | Source Sans 3 · 14 |
| Clubtint | max 1 pasek / crest ring |

**Stany wspólne:** patrz STATE-SPECS. Poniżej per ekran: default + loading + empty + error.

---

# ETAP 1 — Shell · Hub

## HF-SHELL-01 — Application Shell (Desktop)

| Pole | Wartość |
| ---- | ------- |
| **ID** | HF-SHELL-01 / SCR-SYS + chrome |
| **Cel** | Orientacja, nawigacja P0, kontekst sesji bez KPI wall |
| **Układ sekcji** | TopBar (48–56px) → Nav rail (72–88px) + Main → Status opcjonalny (24–28px) |
| **Hierarchia** | Crest/club > faza dnia > kasa (1 liczba) > Live rare; Main = treść decyzji |
| **Komponenty** | AppShell · TopBar · NavItem · StatusBar · Breadcrumb (≥2) |
| **World Art** | `BG-001` · `TEX-001` · `BRD-003`/`CRS-*` · `ICO-001…007/013…015` |
| **Stany** | default · loading (SCR-SYS-02 w Main) · error toast · soft-lock modal |
| **Zależności** | Wszystkie ekrany P0 |

**Hi-Fi detale:**

- Nav active: ikona gold-soft fill + 2px prestige tick (clubtint OK).  
- TopBar: bez drugiego gold CTA; kasa = `type.kpi` muted, nie hero number.  
- Flood corner (`FLD-003`) tylko matchday Hub / Live — nie globalnie.

---

## HF-SHELL-02 — Application Shell (Mobile Variant A)

| Pole | Wartość |
| ---- | ------- |
| **ID** | HF-SHELL-02 |
| **Cel** | Touch-first daily loop |
| **Układ** | TopBar thin → Main stack → Bottom nav 5 |
| **Hierarchia** | Main Decision > Bottom nav > TopBar meta |
| **Komponenty** | j.w. + BottomNav |
| **World Art** | j.w. · hero mobile `HERO-001-M` gdy Hub |
| **Stany** | j.w. |
| **Zależności** | Hub · Training · Squad · Transfers · More |

**Hi-Fi:** Bottom item active = gold-soft; Primary w Main full-width ≥44px; breadcrumbs → Back chevron.

---

## HF-HUB-01 — Hub dzień meczowy

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-HUB-01 |
| **Cel** | Jedna sprawa dnia → Match Path |
| **Układ sekcji** | 1) LocationHero gabinet 2) Decision (sprawa + ◆) 3) Secondary row ≤5 4) Context meta 1 linia |
| **Hierarchia** | Sprawa/VS > ◆ Idź do meczu > Secondary > meta |
| **Komponenty** | LocationHero · DecisionBlock · PrimaryButton · SecondaryButton×≤5 · SoftLink · StatusChip |
| **World Art** | `HERO-001` (+M) · `BG-002` · `OFF-001/002/006` · `ICO-001` · matchday `FLD-003` wash rare |
| **Stany** | default · loading `LOD-004` · empty → Hub empty P1 · error toast |
| **Zależności** | → Match Path · ○ Training/Squad/Transfers/Finance/Terminarz |

**Hi-Fi:** Hero opacity/mask tak, by H1 + Primary czytelne na `text.primary`; Secondary w jednym rzędzie desktop / wrap 2+3 mobile; **zakaz** 12 kart KPI.

---

## HF-HUB-02 — Hub idle / po meczu

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-HUB-02 |
| **Cel** | Router po meczu / dzień bez meczu |
| **Układ** | Jak HUB-01; Decision copy z resolvera |
| **Hierarchia** | Pytanie/sprawa > Primary (często Kadra/Trening) > Secondary |
| **Komponenty** | j.w. |
| **World Art** | j.w. · rare flavor `MOM-003` **nie** jako default BG |
| **Stany** | default · loading · error |
| **Zależności** | Daily loop |

---

## HF-HUB-04 — Hub EARLY_CLUB

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-HUB-04 |
| **Cel** | Decyzja early bez mid-season mock |
| **Układ** | Hero + Decision minimal; Secondary unlock-aware (disabled = soft visual) |
| **Hierarchia** | Primary (First Match / Kadra) > Secondary dostępne |
| **Komponenty** | DecisionBlock · Primary · Secondary (disabled state) |
| **World Art** | `HERO-001` · `BG-002` |
| **Stany** | default · soft-lock na Secondary |
| **Zależności** | → MCH-01 lub Squad |

---

# ETAP 2 — Match Path

## HF-MCH-01 — Tunnel / First Match

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-01 |
| **Cel** | Immersyjne wejście w pierwszy mecz |
| **Układ** | Full-bleed Hero tunnel; Decision bottom sheet / bottom stack; **nav ukryty** |
| **Hierarchia** | Atmosfera tunelu > ◆ Dalej |
| **Komponenty** | LocationHero · PrimaryButton |
| **World Art** | `HERO-002` · `BG-010` · `LOD-002` (wejście) |
| **Stany** | default · loading LOD-002 · error → retry Primary |
| **Zależności** | → SCR-MCH-02 |

**Hi-Fi:** Ciepły glow na końcu tunelu (DNA); Primary brass na ciemnym concrecie; bez TopBar clutter.

---

## HF-MCH-02 — Kick-Off / VS

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-02 |
| **Cel** | Potwierdzić start meczu |
| **Układ** | Hero pitch · VS block (herby + `type.score`) · meta 1 linia · ◆ · soft „Ustaw skład” |
| **Hierarchia** | VS > ◆ Start > soft skład |
| **Komponenty** | LocationHero · DecisionBlock · Primary · SoftLink · Badge optional |
| **World Art** | `HERO-003` · `MOM-001` (flash rare) · `BDG-001` · crest klubów |
| **Stany** | default · loading · error |
| **Zależności** | → MCH-03 / SQD-04 / Live |

---

## HF-MCH-03 — Pre-match checklist

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-03 |
| **Cel** | Domknąć gotowość przed Live |
| **Układ** | Thin hero · checklist rows · ◆ Start · soft skład |
| **Hierarchia** | Checklist > ◆ > soft |
| **Komponenty** | DecisionBlock · Primary · SoftLink · StatusChip (gotowe/nie) |
| **World Art** | `HERO-002/003` thin · `ICO-028` |
| **Stany** | default · incomplete (Primary disabled lub warn) · error |
| **Zależności** | ↔ SQD-04 → Live |

---

## HF-MCH-04 — Live

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-04 |
| **Cel** | Śledzić wynik i zdarzenia |
| **Układ** | Status strip (Live scarlet + wynik + minuta) · opcjonalnie crowd strip · feed Context |
| **Hierarchia** | Live+wynik > feed > (brak drugiego Primary) |
| **Komponenty** | StatusChip Live · ContextList · Score |
| **World Art** | `ICO-016` · `SUP-001` · `BG-003` · `FLD-002/003` |
| **Stany** | default live · reconnecting (loading strip) · error banner |
| **Zależności** | → MCH-05 overlay · → MCH-07 |

**Hi-Fi:** Scarlet **tylko** Live dot; feed rows `surface-alt`; flood wash subtelnnie.

---

## HF-MCH-05 — Goal overlay

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-05 |
| **Cel** | Feedback gola |
| **Układ** | Full overlay `MOM-002` · wynik chwilowy · auto/tap dismiss |
| **Hierarchia** | Moment art > wynik |
| **Komponenty** | MatchMomentOverlay |
| **World Art** | `MOM-002` · `SUP-003` · `ILL-013` |
| **Stany** | enter · hold · exit (reduced-motion = fade) |
| **Zależności** | → Live |

---

## HF-MCH-07 — Final whistle

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-07 |
| **Cel** | Zamknąć emocję meczu |
| **Układ** | Overlay/hero `MOM-003` · ◆ Dalej |
| **Hierarchia** | Moment > Primary |
| **Komponenty** | MatchMomentOverlay · PrimaryButton |
| **World Art** | `MOM-003` |
| **Stany** | default · loading do post |
| **Zależności** | → MCH-08 |

---

## HF-MCH-08 — Post-match

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-MCH-08 |
| **Cel** | Wynik + powrót Hub |
| **Układ** | Thin hero crowd · Decision (wynik + 1 wniosek) · ◆ Hub · Context skrót |
| **Hierarchia** | Wynik > ◆ Hub > Context |
| **Komponenty** | LocationHero · DecisionBlock · Primary · ContextList · SoftLink |
| **World Art** | `SUP-001` · `SCF-003` · flavor `HERO-004` rare |
| **Stany** | default · loading · error |
| **Zależności** | → Hub (SCR-HUB-02) |

---

# ETAP 3 — Squad · Training · Transfers · Finance

## HF-SQD-01 — Kadra lista

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-SQD-01 |
| **Cel** | Przegląd kadry + decyzja dnia |
| **Układ** | Hero szatnia · Decision (pytanie) · opcjonalne ◆ · soft Trening · PlayerRow list |
| **Hierarchia** | Pytanie > ◆/soft > lista |
| **Komponenty** | LocationHero · DecisionBlock · PlayerRow · SoftLink · EmptyState |
| **World Art** | `HERO-004` · `BG-006` · `TEX-005` · `SHT-*` · `ICO-003` |
| **Stany** | default · loading · empty `EMP-002` · error |
| **Zależności** | → SQD-03 · ○ TRN-01 |

**Hi-Fi:** Wiersz = surface-alt hover; mini kit / status chip; copy **Kadra**.

---

## HF-SQD-03 — Gracz detal

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-SQD-03 |
| **Cel** | Zrozumieć zawodnika |
| **Układ** | BC Kadra›Gracz · thin hero/prop · nagłówek · Context atrybuty · soft Trening |
| **Hierarchia** | Tożsamość gracza > status > atrybuty |
| **Komponenty** | Breadcrumb · DecisionBlock light · Context · SoftLink |
| **World Art** | `SHT-001` · `SHT-006` |
| **Stany** | default · loading · error |
| **Zależności** | ← SQD-01 · → TRN |

---

## HF-SQD-04 — Skład XI

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-SQD-04 |
| **Cel** | Ustawić XI przed meczem |
| **Układ** | Decision „Skład” · lista/sloty · ◆ Zapisz i dalej · soft checklist |
| **Hierarchia** | XI > ◆ > soft |
| **Komponenty** | DecisionBlock · PlayerRow · Primary · SoftLink |
| **World Art** | `HERO-004` dialect / pitch thin |
| **Stany** | default · invalid XI (warn) · loading · error |
| **Zależności** | ↔ MCH-03 → Live |

---

## HF-TRN-01 — Trening

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-TRN-01 |
| **Cel** | Przeprowadzić sesję dnia |
| **Układ** | Hero trening · pytanie · ◆ Sesja · soft Hub/Kadra |
| **Hierarchia** | Pytanie > ◆ > soft |
| **Komponenty** | LocationHero · DecisionBlock · Primary · SoftLink |
| **World Art** | `HERO-006` · `TRG-001…006` · `ICO-002` · mist `BG-003` |
| **Stany** | default · loading · error · (done = P1 empty) |
| **Zależności** | ○ Hub · ○ Squad |

---

## HF-TRN-02 — Trening soft-lock

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-TRN-02 |
| **Cel** | Wyjaśnić niedostępność |
| **Układ** | SoftLockState full · `ILL-002` · copy unlock · ○ Hub |
| **Hierarchia** | Wyjaśnienie > wyjście |
| **Komponenty** | SoftLockState · SoftLink |
| **World Art** | `ILL-002` · `ICO-020` |
| **Stany** | default only |
| **Zależności** | → Hub |

---

## HF-XFR-01 — Transfery inbox

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-XFR-01 |
| **Cel** | Najbliższa oferta / sprawa okna |
| **Układ** | Hero biuro · Decision sprawy · ◆ · Context lista ofert |
| **Hierarchia** | Sprawa > ◆ > lista |
| **Komponenty** | LocationHero · DecisionBlock · Primary · ContextList |
| **World Art** | `HERO-005` · `BG-008` · `TRN-*` · `ICO-004` |
| **Stany** | default · loading · empty P1 · error |
| **Zależności** | → XFR-02 · ○ FIN |

**Hi-Fi:** Nie dublować tekstu props z PASS SOFT HERO-005 własnym lorem na grafice.

---

## HF-XFR-02 — Oferta detal

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-XFR-02 |
| **Cel** | Accept / Reject |
| **Układ** | BC · Decision · ◆ Accept · ○ Reject · soft Finanse/Kadra · Context warunki |
| **Hierarchia** | Decyzja > akcje > warunki |
| **Komponenty** | Breadcrumb · DecisionBlock · Primary · Secondary · Modal confirm · SoftLink |
| **World Art** | `TRN-001…003` |
| **Stany** | default · confirm modal · loading settle · error |
| **Zależności** | → XFR-01 · FIN · Squad |

---

## HF-XFR-03 — Okno zamknięte

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-XFR-03 |
| **Cel** | Soft-lock okna |
| **Układ** | SoftLock · `ILL-003` · ○ Hub |
| **Komponenty** | SoftLockState |
| **World Art** | `ILL-003` · `ICO-020` |
| **Stany** | default |
| **Zależności** | → Hub |

---

## HF-FIN-01 — Finanse

| Pole | Wartość |
| ---- | ------- |
| **ID** | SCR-FIN-01 |
| **Cel** | Zrozumieć kasę / priorytet |
| **Układ** | Hero ledger · Decision (pytanie + 1 saldo) · ◆ opcjonalne · soft Transfery · Context kategorie |
| **Hierarchia** | Pytanie+saldo > ◆ > kategorie |
| **Komponenty** | LocationHero · DecisionBlock · Primary · SoftLink · ContextList |
| **World Art** | `HERO-007` · `BG-007` · `TEX-006` · `FIN-*` · `ICO-005` |
| **Stany** | default · loading `LOD-007` · empty `EMP-003` · error |
| **Zależności** | ↔ Transfers · Hub |

**Hi-Fi:** Jedna liczba kasy jako `type.kpi` — nie ściana wykresów; brass stamp props jako ornament Context, nie CTA.

---

## Mapa ID Hi-Fi ↔ Wireframe ↔ Screen

| Hi-Fi | Wireframe | Screen Inventory |
| ----- | --------- | ---------------- |
| HF-SHELL-01/02 | WF-SHELL-D/M | SYS chrome |
| HF-HUB-01/02/04 | WF-HUB-01 | SCR-HUB-01/02/04 |
| HF-MCH-01…08 | WF-MCH-* | SCR-MCH-* |
| HF-SQD-01/03/04 | WF-SQD-* | SCR-SQD-* |
| HF-TRN-01/02 | WF-TRN-* | SCR-TRN-* |
| HF-XFR-01/02/03 | WF-XFR-* | SCR-XFR-* |
| HF-FIN-01 | WF-FIN-01 | SCR-FIN-01 |

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Hi-Fi screens P0 · Etap 1–3 |
