# LFE-UX-PLAYTEST-01 — OWNER DECISION

**EPIC:** LFE-UX-PLAYTEST-01  
**Data:** 2026-07-29  
**Wejście:** Results · Issues · RCA · prototyp Figma zaakceptowany

---

## 0. Decyzja

# **GO — pierwszy EPIC implementacyjny**

| Warunek Quality Gate                  | Status     |
| ------------------------------------- | ---------- |
| Brak aktywnych P0                     | ✓          |
| Brak krytycznych problemów UX (pętla) | ✓          |
| Główna pętla gry zrozumiała           | ✓ PT-01/08 |
| Prototyp gotowy do implementacji      | ✓          |

**HOLD:** nie.

---

## 1. Uzasadnienie

1. **8/8** scenariuszy PT PASS w protokolarnym walkthrough.
2. Happy path Hub→Match→Hub bez martwych przejść; soft-lock i error zrozumiałe.
3. §16 decision-first utrzymane (1 Primary · Kadra≠XI · scarlet rare).
4. Jedyny **P1** (parity Mobile detal/oferta) nie blokuje startu kodu — wchodzi jako **DoD sprintu 1 Mobile**.
5. P2 = fidelity/proto artefacts — naprawiane w DS/WA przy implementacji, bez zmiany Style Lock.

---

## 2. Zakres pierwszego EPIC-u implementacyjnego (rekomendacja)

**Proponowany ID:** `LFE-UI-IMPL-01` (nazwa do potwierdzenia Owner)

| Must           | Opis                                                                |
| -------------- | ------------------------------------------------------------------- |
| Shell D+M      | TopBar · Nav / Bottom · tokeny DS                                   |
| Hub            | Matchday · Idle · EARLY                                             |
| Match Path     | Pre · Live · Moments · Post                                         |
| Domeny P0      | Squad (lista+detal) · Training · Transfers (inbox+Accept) · Finance |
| Stany          | loading · empty · error · soft-lock                                 |
| **DoD Mobile** | domknięcie **PTI-01** (detal + oferta)                              |

| Won’t (ten EPIC)                 |                   |
| -------------------------------- | ----------------- |
| Nowe assety / nowy styl          | Style Lock ACTIVE |
| Silnik meczu / reguły transferów | mock/fixtures OK  |
| P1 produkt (HT · Academy · …)    | później           |

**SSOT wizualne:** Hi-Fi · DS · World Art handoff · PROTO / FLOW (bez redesignu).

---

## 3. Warunki równoległe (nie blokują GO)

| ID        | Działanie                   | Owner                    |
| --------- | --------------------------- | ------------------------ |
| PTI-01    | Parity M w DoD              | Impl + opc. Figma polish |
| PTI-02…06 | Backlog UI polish           | Design/Impl              |
| Opcja     | Panel graczy `PLAYTEST-01B` | Owner — nie blokuje GO   |

**Zasada z Owner GO playtestu:** nie zmieniać projektu _przed_ domknięciem sesji — **sesje domknięte**; zmiany = tylko w kolejnym EPIC (impl/polish), nie ad-hoc w Figma bez ticketu.

---

## 4. Kryteria HOLD (gdyby wrócić)

Włączyć HOLD tylko jeśli pojawi się:

- nowe **P0** na pętli meczu, lub
- regresja §16 (KPI wall / 2 Primary / soft-lock Odblokuj), lub
- naruszenie Style Lock / World Art CLOSED.

---

## 5. Podpis decyzji

| Rola                 | Status                               |
| -------------------- | ------------------------------------ |
| Facylitator playtest | PASS sesji · rekomendacja **GO**     |
| Owner                | **GO** (ten dokument = decyzja EPIC) |

**Następny krok:** otworzyć `LFE-UI-IMPL-01` (lub równoważny) ze SSOT powyżej.

---

## Historia

| Wersja | Data       | Opis                                |
| ------ | ---------- | ----------------------------------- |
| 0.1.0  | 2026-07-29 | Owner Decision **GO** implementacja |
