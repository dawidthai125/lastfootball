# LFE-UI-HIFI-01 — STATE SPECS

**EPIC:** LFE-UI-HIFI-01  
**Data:** 2026-07-29  
**Status:** DRAFT — stany interakcji i ekranów P0

> Komponenty: [`LFE-UI-HIFI-01-COMPONENT-SPECS.md`](./LFE-UI-HIFI-01-COMPONENT-SPECS.md)  
> Ekrany: [`LFE-UI-HIFI-01-HIFI-SCREENS.md`](./LFE-UI-HIFI-01-HIFI-SCREENS.md)

---

## 0. Stany globalne komponentów interaktywnych

| Stan         | Wizualnie                           | Zachowanie                       |
| ------------ | ----------------------------------- | -------------------------------- |
| **default**  | surface / outline brass             | —                                |
| **hover**    | `bg.hover` · border strong          | pointer                          |
| **focus**    | brass ring 2px                      | klawiatura widoczna              |
| **pressed**  | gold deep / inset light             | ≤220ms                           |
| **selected** | gold-soft + prestige border         | nav / row                        |
| **disabled** | opacity ~0.4 · no hover             | wyjaśnienie soft-lock jeśli lock |
| **loading**  | skeleton inset / spinner dyskretny  | blokuj double-submit Primary     |
| **error**    | danger border + ikona + copy gracza | retry jeśli sensowne             |

---

## 1. Macierz stanów ekranów P0

| ID         | default        | loading         | empty        | error            | soft-lock                         |
| ---------- | -------------- | --------------- | ------------ | ---------------- | --------------------------------- |
| HF-SHELL   | chrome idle    | Main = LOD      | —            | Toast SYS-05     | Modal SYS-04                      |
| SCR-HUB-01 | sprawa+◆       | `LOD-004`       | (P1 ILL-001) | Toast            | Secondary disabled→modal          |
| SCR-HUB-02 | j.w. idle      | `LOD-004`       | P1           | Toast            | j.w.                              |
| SCR-HUB-04 | early decision | `LOD-004`       | —            | Toast            | Secondary locked                  |
| SCR-MCH-01 | tunnel+◆       | `LOD-002`       | —            | Retry ◆          | —                                 |
| SCR-MCH-02 | VS+◆           | short           | —            | Toast            | —                                 |
| SCR-MCH-03 | checklist      | short           | —            | Toast            | Primary disabled jeśli incomplete |
| SCR-SQD-04 | XI editor      | save load       | —            | Toast / warn XI  | —                                 |
| SCR-MCH-04 | live feed      | reconnect strip | —            | banner reconnect | —                                 |
| SCR-MCH-05 | overlay in     | —               | —            | —                | —                                 |
| SCR-MCH-07 | whistle+◆      | →post           | —            | Toast            | —                                 |
| SCR-MCH-08 | wynik+◆Hub     | short           | —            | Toast            | —                                 |
| SCR-SQD-01 | lista          | skeleton rows   | `EMP-002`    | Toast            | —                                 |
| SCR-SQD-03 | detal          | skeleton        | —            | Toast / back     | —                                 |
| SCR-TRN-01 | pytanie+◆      | settle          | (P1 done)    | Toast            | → TRN-02                          |
| SCR-TRN-02 | ILL-002        | —               | —            | —                | **to jest** soft-lock             |
| SCR-XFR-01 | inbox          | skeleton        | P1 ILL-004   | Toast            | → XFR-03                          |
| SCR-XFR-02 | Accept/Reject  | settle          | —            | Toast + modal    | —                                 |
| SCR-XFR-03 | ILL-003        | —               | —            | —                | **to jest** soft-lock             |
| SCR-FIN-01 | pytanie+kasa   | `LOD-007`       | `EMP-003`    | Toast            | —                                 |

---

## 2. Loading — reguły Hi-Fi

1. Preferuj **location LOD** (`LOD-002` tunnel, `LOD-004` desk, `LOD-007` ledger).
2. Skeleton w kolorach `bg.inset` / `surface-alt` — nie shimmer purple.
3. Primary w stanie loading: spinner w button · disabled.
4. Live reconnect: thin strip pod StatusChip — nie pełny blokujący splash.

---

## 3. Empty — reguły Hi-Fi

| Ekran                | Asset     | CTA                |
| -------------------- | --------- | ------------------ |
| Squad                | `EMP-002` | soft Hub / Trening |
| Finance              | `EMP-003` | soft Transfery     |
| Transfers empty (P1) | `ILL-004` | Hub                |
| Hub empty (P1)       | `ILL-001` | Secondary loop     |

Copy: konkretna wskazówka, nie „brak danych”.

---

## 4. Error — reguły Hi-Fi

| Poziom   | Forma                          |
| -------- | ------------------------------ |
| Inline   | pole / wiersz danger           |
| Toast    | SYS-05 — krótki, gracza        |
| Blocking | rzadko; Modal z ○ Wróć + retry |

Bez stack trace / żargonu silnika.

---

## 5. Soft-lock — reguły Hi-Fi

```
Źródło prawdy: resolveNavAccess (bez nowych reguł w UI)
Prezentacja: SoftLockState lokalny LUB Modal SYS-04
Art: ILL-* + ICO-020
CTA: wyjście (Hub / Wróć) — nie fałszywy Primary „Odblokuj” bez resolvera
```

---

## 6. Match moment stany

| Overlay      | Enter           | Hold     | Exit         |
| ------------ | --------------- | -------- | ------------ |
| Goal MCH-05  | fade/scale soft | 1.2–2.0s | tap lub auto |
| Final MCH-07 | fade            | do ◆     | Primary      |

`prefers-reduced-motion`: tylko opacity fade, bez bloom motion.

---

## 7. Nav disabled vs soft-lock

| Sytuacja             | UI                                                              |
| -------------------- | --------------------------------------------------------------- |
| Lokacja locked       | NavItem disabled look · tap → SYS-04                            |
| Hub Secondary locked | Secondary muted · tap → SYS-04                                  |
| W trakcie Live       | Nav może być ograniczone (spec produktu) — bez utraty Live chip |

---

## Historia

| Wersja | Data       | Opis           |
| ------ | ---------- | -------------- |
| 0.1.0  | 2026-07-29 | State specs P0 |
