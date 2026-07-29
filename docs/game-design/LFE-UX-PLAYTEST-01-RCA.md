# LFE-UX-PLAYTEST-01 — RCA

**EPIC:** LFE-UX-PLAYTEST-01  
**Data:** 2026-07-29  
**Cel:** Root cause analysis findings playtestu (bez zmian projektu w tym EPIC)  

> Issues: [`LFE-UX-PLAYTEST-01-ISSUES.md`](./LFE-UX-PLAYTEST-01-ISSUES.md)  
> Results: [`LFE-UX-PLAYTEST-01-RESULTS.md`](./LFE-UX-PLAYTEST-01-RESULTS.md)  

---

## 0. Podsumowanie RCA

| Finding | Root cause | Systemowy? | Akcja |
| ------- | ---------- | ---------- | ----- |
| PTI-01 Mobile drill-down | Świadomy skrót buildu (limit czasu/MCP) + Starter | Tak (proces scope M) | Domknąć parity M |
| PTI-02 Live „Gol” Primary | Prototyp potrzebuje klikalnego advance | Nie (artefakt proto) | Inny wzorzec w app |
| PTI-03…05 fidelity | Starter fonts · placeholder icons · limit upload | Tak (narzędzia) | Polish / impl DS |
| PTI-06 ○ vs gold | Niespójność notacji soft vs Primary fill | Nie | Spec CTA soft-lock |
| Brak P0 na pętli | Wiring FLOW-MAP + §16 trzymane | — | Utrzymać w impl |

**Wniosek:** problemy są **wierności / kompletności Mobile domen**, nie architektury decyzji. Główna pętla Hub→Match→Hub jest zdrowa.

---

## 1. RCA — PTI-01 (P1)

### Problem
Użytkownik na Mobile nie może domknąć ścieżki Kadra→detal ani Transfer→Accept.

### 5 Whys (skrót)
1. Brak frame’ów M →  
2. Build priorytetował Match Path H (MODE-H) →  
3. Limit stron Starter + limit MCP przy domykaniu →  
4. Acceptance parity D↔M w PROTO nie wymusił „wszystkie domeny M” jako hard gate →  
5. **Root:** kryterium parity w Validation Gate było „Match Path same targets”, nie „pełne domeny M”.

### Korekta
- Acceptance implementacji Mobile: SQD detal + XFR Accept obowiązkowe w P0 app.  
- Opcjonalnie: dopiąć frame’y Figma przed kodem (nie blokuje GO, jeśli Owner akceptuje równolegle).

---

## 2. RCA — PTI-02 (P2)

### Problem
Live wygląda jak decyzja menedżerska „strzel gola”.

### Root cause
Prototyp Figma nie ma timer/auto-advance — wymaga hotspotu. Wybór Primary gold na „Gol” narusza mental model §16 (decyzja ≠ event sim).

### Korekta
W app: moment overlay bez Primary decyzji; w proto: Secondary „demo →” lub auto-prototype delay.

---

## 3. RCA — PTI-03…05 (P2 fidelity)

### Root cause
Warstwa „proto fidelity” vs Hi-Fi: Inter, ellipses, niepełne IMAGE fills — decyzja narzędziowa (Starter · MCP rate limit), nie Style Lock drift.

### Korekta
Implementacja czyta DS + World Art rejestr; Figma polish równolegle. **Nie** re-otwierać kierunku artystycznego.

---

## 4. RCA — PTI-06 (P2)

### Root cause
SoftLockState używa Primary jako jedynego silnego CTA wyjścia (zgodne z „wyjście”), ale label zachował symbol ○ z wireframe.

### Korekta
COMPONENT-SPECS: soft-lock exit = Primary „Wróć do Hub” **lub** Secondary outline — jedna konwencja.

---

## 5. Co NIE jest root cause

| Hipoteza odrzucona | Dlaczego |
| ------------------ | -------- |
| Zła IA / Hub router | PT-01/02/03 PASS bez zagubienia strukturalnego |
| Naruszenie Style Lock | Brak purple/photoreal; tokeny Night Pitch OK |
| Martwe happy path | 0 P0 · Retry i soft-lock działają |
| Kadra = Skład | XI tylko z Match Path potwierdzone |

---

## 6. Ryzyka implementacji (z playtestu)

| Ryzyko | Mitigacja |
| ------ | --------- |
| Przeniesienie „Gol ◆” do produkcji | STATE-SPECS Live + moment overlay |
| Mobile P0 bez detal/oferty | Definition of Done sprint 1 |
| KPI wall regresja | §16 checklist w PR review |
| Nowe assety ad-hoc | WORLD ART CLOSED · handoff §6 |

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | RCA playtest P1/P2 |
