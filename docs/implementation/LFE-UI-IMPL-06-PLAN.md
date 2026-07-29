# LFE-UI-IMPL-06 — PLAN

**EPIC:** LFE-UI-IMPL-06  
**Etap:** LIVE MATCH & POST FIDELITY  
**Data:** 2026-07-29  
**Wejście:** IMPL-06A PASS (`00b2c2a`)

---

## 0. Cel

Domknąć UX Live → Post (HF-MCH-04/05/07/08) **bez** nowych domen, bez zmian silnika / DNA / WA / IA / `UI_COPY`.

---

## 1. Audyt (Hi-Fi ↔ kod)

| Ekran / temat    | Hi-Fi                                    | Stan dziś                                       | Gap fidelity                         |
| ---------------- | ---------------------------------------- | ----------------------------------------------- | ------------------------------------ |
| Live layout      | Status strip · feed · brak 2. Primary    | Scorebug OK · **3-kolumna zawsze**              | Mobile / wąski desktop — brak parity |
| Live loading     | reconnect/loading strip                  | Plain text „Ładowanie meczu…”                   | LoadingFrame                         |
| Half-time        | GDD faza Przerwa · (brak osobnego HF ID) | `periodLabel=Przerwa` bez UI                    | Soft banner HT                       |
| Goal overlay     | MOM-002 · auto/tap · reduced-motion fade | Overlay OK · brak enter motion                  | CSS enter/fade                       |
| Final whistle    | MOM-003 · ◆ → Post                       | ✓                                               | Drobny polish motion                 |
| Post             | Thin hero · Wynik > ◆ Hub > Context      | Dense report · Replay jako „primary” · EN label | Hierarchia + thin hero + PL          |
| Error / empty XI | Empty / banner                           | Panel „Kadra niedostępna”                       | EmptyState                           |
| Soft-lock Match  | N/A immersive                            | Chrome ukryty (IMPL-02)                         | Bez zmian                            |

**Nie w zakresie:** nowe assety MOM-004 (brak w runtime WA) · zmiana tick/HT duration · DTO.

---

## 2. Zakres implementacji

1. `live-match.css` + klasy stage/scorebug/HT/feed — responsive stack
2. Live: LoadingFrame · HT banner · PL feed labels · `data-lf-impl=06`
3. Overlays: enter animation + `prefers-reduced-motion`
4. Post: thin LocationHero · Decision hierarchy · Primary = continue · soft Replay
5. Live page EmptyState przy braku XI
6. Testy guard + docs

---

## 3. DoD

- [x] Live → Post ≈ Hi-Fi
- [x] D↔M parity
- [x] Brak regresji IMPL-01…06A
- [x] CI GREEN · Production Verify

---

## Historia

| Wersja | Data       | Opis                          |
| ------ | ---------- | ----------------------------- |
| 0.1.0  | 2026-07-29 | Audit + plan IMPL-06          |
| 1.0.0  | 2026-07-29 | Implementacja + DoD zamknięte |
