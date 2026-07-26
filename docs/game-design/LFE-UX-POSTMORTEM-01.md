# LFE-UX-POSTMORTEM-01 — UI Evolution (REFERENCE)

**Status:** REFERENCE — **nie SSOT reguł**  
**Obowiązujące zasady prezentacji:** [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16 Presentation Contract

> **W przypadku rozbieżności obowiązuje `UI_DESIGN_GUIDE`, a postmortem ma charakter referencyjny.**

**Zakres historii:** LFE-UI-EVOLUTION-01 (A–H, review 01C) · LFE-UI-EVOLUTION-02  
**Tip serii (orientacja):** `a2aff01` — daily manager loop  
**Feature baseline domenowy:** bez zmian — patrz [`../AI/CURRENT_BASELINE.md`](../AI/CURRENT_BASELINE.md)

---

## 0. Mapa serii

| EPIC    | Temat                    | Feature tip (orientacja)         |
| ------- | ------------------------ | -------------------------------- |
| **01**  | AUDIT wejściowy UX       | (tylko ocena)                    |
| **01A** | Hub decision-first       | `b464a8d`                        |
| **01B** | Shell chrome             | `fa5a28b`                        |
| **01C** | UX Smoke Review          | (tylko review)                   |
| **01D** | Transfers command center | `aa2c77d`                        |
| **01E** | PreMatch Kick-Off        | `21b0766`                        |
| **01F** | Training decision-first  | `e2ca976` (+ Prettier `7e03872`) |
| **01G** | Squad decision-first     | `45715a3`                        |
| **01H** | Finances decision-first  | `526d7cb`                        |
| **02**  | Daily manager loop       | `a2aff01`                        |

**Poza serią (świadomie):** Landing (już silny), League browse, Live Match depth, Player detail depth.

---

## 1. Stan początkowy

- Architektura domenowa stabilna po LFE-TRANSFERS-08; Hub miał poprawną **semantykę** resolverów (GDD §23), ale prezentacja czytała się jak panel admina.
- Większość ekranów domenowych: KPI strip + `Panel` + tabela.
- Shell: TopBar z metrykami, MobileNav = poziomy scroll całej IA.
- Mobile = adaptacja desktopu, nie mobile-first.
- Największy dystans do GDD/UI Guide: **Transfery** i **Trening**.

---

## 2. Problemy UX rozwiązane

| Problem                         | Kierunek rozwiązania                 |
| ------------------------------- | ------------------------------------ |
| KPI wall na first viewport      | Jedna linia kontekstu lub usunięcie  |
| Brak dominant CTA               | Jedno gold Primary; Secondary muted  |
| Copy techniczny (Thin/Seed/H2H) | Język menedżera                      |
| PreMatch = briefing / triptych  | Kick-Off + dominant CTA → Live       |
| Shell konkuruje z treścią       | Chrome dyskretny; rail off na `/hub` |
| Hub secondary ≠ daily path      | Daily loop (02)                      |
| „Skład” vs „Kadra”              | SSOT: Kadra = `/squad`; Skład = XI   |
| Ekrany izolowane                | Soft-linki cross-screen              |

Seria **nie** naprawiała braków funkcji domenowych (nowe silniki, budżetowanie, League decision layer).

---

## 3. Wzorce wprowadzone (opis historyczny)

Obowiązująca definicja → Guide §16.

| Wzorzec                       | Skrót                                                     |
| ----------------------------- | --------------------------------------------------------- |
| **Decision-first**            | Jedno pytanie / jedna sprawa na first viewport            |
| **Hero → Decision → Context** | Browse pod decyzją                                        |
| **Primary CTA**               | Dokładnie jedno dominant                                  |
| **Soft-links**                | Muted mosty pętli; nie drugi gold                         |
| **Dialekty**                  | Event/inbox vs question-day (nie unifikować)              |
| **Daily Loop**                | Hub → Trening → Kadra → Transfery → Finanse → Match → Hub |
| **Mobile Variant A**          | Hub · Trening · Kadra · Transfery · Więcej                |

---

## 4. Zasady architektoniczne zachowane

Presentation only: bez zmian DTO, resolverów biznesowych, unlock rules, settlement, API, Supabase, silników.  
Konsumpcja: `resolve*`, `resolveNavAccess`, istniejące href/akcje.  
Pipeline Owner GO · SSOT FIRST · REUSE FIRST · ZERO DUPLICATE · THIN SLICE · RESOLVER FIRST.

---

## 5. Lekcje procesu

- Prettier + concat `className` w template literals → preferuj pełne stringi ternarne.
- Smoke prod bez sesji często **307 → `/login`**; weryfikacja UI = tip source + CI.
- Owner Review (matryca stanów) przed COMMIT łapie regresje hierarchii bez live browsera.

---

## 6. Poza UI Evolution (luki produktowe — nie backlog GO)

League decision layer · Live Match UX depth · Post-match narrative · Player development depth · Training/economy richness · Messaging/board · Stadium/staff · Guided Day-1 coaching · pełna re-IA desktop left-nav.

Kolejny wzrost wartości = **domena i treści**, nie kosmetyka tych samych ekranów.

---

## 7. Stan końcowy (referencja)

|              |                                                                   |
| ------------ | ----------------------------------------------------------------- |
| Tip serii    | `a2aff01`                                                         |
| UX           | Hub, Shell, TX, KO, TR, SQ, FI = język decyzji; pętla dnia spięta |
| Architektura | Bez regresji SSOT / settle / unlock business rules                |
| Reguły dalej | [`UI_DESIGN_GUIDE.md`](./UI_DESIGN_GUIDE.md) §16                  |

---

## 8. Jak używać tego dokumentu

1. Przed EPIC-em UI: najpierw Guide §16 + [`../AI/COMMON_PATTERNS.md`](../AI/COMMON_PATTERNS.md) (UI Presentation Pattern).
2. Ten plik = kontekst „dlaczego” i mapa EPIC — **nie** jedyne Must/Must-not.
3. Semantyka Hub (phase/CTA/unlock) → [`../platform/HUB.md`](../platform/HUB.md).

---

## Last updated

2026-07-26 — LFE-DOCS-UX-03 IMPLEMENT
