# LFE-UI-PROTOTYPE-VALIDATION-01 — PLAYTEST PLAN

**EPIC:** LFE-UI-PROTOTYPE-VALIDATION-01  
**Data:** 2026-07-29  
**Plik:** https://www.figma.com/design/mgNprLAGRgxrq7JrvZwda9/LFE-UI-PROTOTYPE-VALIDATION-01  

> Build: [`…-FIGMA-BUILD.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-FIGMA-BUILD.md)  
> Issues log: [`…-UX-ISSUES.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md)  

---

## 0. Cel playtestu

Zweryfikować **doświadczenie P0** (decision-first §16 · IA · Hi-Fi flow) na klikanej ścieżce — **bez** oceniania produkcji / silnika.

| Mierzymy | Nie mierzymy |
| -------- | ------------ |
| Czy wiem, co kliknąć (1 Primary) | Realizm sim meczu |
| Czy pętla Hub→Match→Hub domyka | Balance finansów |
| Soft-lock zrozumiały | Copy finalne marketing |
| D↔M te same cele | Perf / a11y WCAG pełne |

---

## 1. Setup sesji

| Parametr | Wartość |
| -------- | ------- |
| Czas | 25–40 min / uczestnik |
| Urządzenie | Desktop Figma Present + telefon/tablet Present Mobile |
| Rola | Owner / design / 1–2 „manager game” users |
| Zapis | Issues → UX-ISSUES (ID + severity) |

**Przed startem:** otwórz `01 · Desktop` → ▶ → Flow **Mode Launcher**.

---

## 2. Scenariusze (obowiązkowe)

### PT-01 — Match Path happy (MODE-A)

| Pole | Treść |
| ---- | ----- |
| Start | MODE-A / HUB-01-D |
| Zadanie | „Zagraj mecz od Hub do powrotu do biura.” |
| Kroki oczekiwane | Hub◆ → Tunnel → VS → Pre → (opc. XI) → Live → Gol → Live → FT → Final → Post ◆ Hub |
| Pass | Dotarcie do HUB-02 bez martwego kliknięcia |
| Fail | Zgubiona ścieżka · 2 gold CTA · powrót niemożliwy |

### PT-02 — Daily loop (MODE-B)

| Start | HUB-02-D |
| Zadanie | „Zrób coś poza meczem i wróć.” |
| Kroki | Secondary/Nav → domena → decyzja → Hub |
| Pass | ≥1 domena (SQD/TRN/XFR/FIN) + powrót |

### PT-03 — EARLY (MODE-C)

| Start | HUB-04-D |
| Zadanie | „Wygląda jak początek kariery — wejdź w pierwszy mecz.” |
| Pass | Brak mid-season KPI wall · ◆ First Match działa |

### PT-04 — Soft-lock Training (MODE-D)

| Start | TRN-02-D |
| Zadanie | „Trening zablokowany — co robisz?” |
| Pass | Rozumie blokadę · ○ Hub · **brak** „Odblokuj” |

### PT-05 — Soft-lock Transfers (MODE-E)

| Start | XFR-03-D |
| Pass | Copy okna · ○ Hub |

### PT-06 — Empty (MODE-F)

| Start | SQD empty (opc. FIN empty z Nav) |
| Pass | CTA prowadzi dalej (Hub/Trening/Transfery) |

### PT-07 — Error resilience (MODE-G)

| Start | Tunnel error |
| Zadanie | „Napraw wejście na mecz.” |
| Pass | ◆ Retry → Tunnel default → można kontynuować path |

### PT-08 — Mobile parity (MODE-H)

| Start | HUB-01-M na stronie Mobile |
| Zadanie | Pełny Match Path na mobile |
| Pass | Te same etapy co PT-01 · Primary full-width czytelny |

---

## 3. Checklist obserwatora (§16 / Hi-Fi)

Na każdym ekranie decyzji zaznacz:

- [ ] Dokładnie **1** Primary gold  
- [ ] Hub Secondary **≤5**  
- [ ] Hero / sprawa nad listą kontekstową  
- [ ] Scarlet **tylko** Live  
- [ ] Soft-lock bez fałszywego Odblokuj  
- [ ] Kadra ≠ Skład XI (XI tylko z Match)  
- [ ] Flood/matchday nie „zawsze on” poza HUB-01/Live  

---

## 4. Skala findings

| Severity | Definicja | Akcja |
| -------- | --------- | ----- |
| **BLOCKER** | Martwa ścieżka P0 / zły target Primary | Fix przed PASS playtest |
| **MAJOR** | Myląca hierarchia / D≠M target | Fix lub świadomy SOFT |
| **MINOR** | Copy / spacing / font substitute | Backlog polish |
| **NOTE** | Obserwacja bez naruszenia gate | Log only |

---

## 5. Protokół zakończenia

1. Uzupełnij [`…-UX-ISSUES.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md).  
2. Jeśli 0 BLOCKER na P0 flows → playtest **PASS**.  
3. Gate dokumentu: [`…-GATE.md`](./LFE-UI-PROTOTYPE-VALIDATION-01-GATE.md).  

**Następny EPIC po playtest PASS:** decyzja Owner o implementacji UI (nie w tym EPIC).

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Playtest plan PT-01…08 |
