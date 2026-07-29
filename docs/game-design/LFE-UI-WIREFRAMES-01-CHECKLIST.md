# LFE-UI-WIREFRAMES-01 — CHECKLIST

**EPIC:** LFE-UI-WIREFRAMES-01  
**Data:** 2026-07-29  
**Cel:** weryfikacja kompletności IA + lo-fi P0 przed Hi-Fi

> IA · Flows · Wireframes — ten sam EPIC.

---

## 0. Zakres P0 — pokrycie

| Obszar                         | Wymagane              | Status |
| ------------------------------ | --------------------- | ------ |
| Shell desktop                  | WF-SHELL-D            | [x]    |
| Shell mobile Variant A         | WF-SHELL-M            | [x]    |
| Breadcrumbs reguła             | IA §3                 | [x]    |
| Status / TopBar                | IA §3 · WF Shell      | [x]    |
| Hub matchday / idle / early    | SCR-HUB-01/02/04      | [x]    |
| Match pre                      | MCH-01/02/03 · SQD-04 | [x]    |
| Match live + goal              | MCH-04/05             | [x]    |
| Match post                     | MCH-07/08             | [x]    |
| Squad lista + detal            | SQD-01/03             | [x]    |
| Training + soft-lock           | TRN-01/02             | [x]    |
| Transfers inbox + detal + okno | XFR-01/02/03          | [x]    |
| Finance                        | FIN-01                | [x]    |
| Soft-lock global               | SYS-04                | [x]    |
| Flows daily + match            | FLOWS.md              | [x]    |

**P1+ (poza DoD tego EPICu):** Inbox · Academy · Medical · Settings · HT · empty variants — [ ] odroczone.

---

## 1. Zgodność §16 / DS

| Kryterium                            | Status |
| ------------------------------------ | ------ |
| Hero → Decision → Context            | [x]    |
| Jedno Primary CTA                    | [x]    |
| Hub Secondary ≤5                     | [x]    |
| Brak KPI wall na first viewport      | [x]    |
| Kadra ≠ Skład w copy wireframe       | [x]    |
| Soft-linki muted (oznaczone ~)       | [x]    |
| Dialekty Event vs Question zachowane | [x]    |
| Unlock tylko przez resolver (opis)   | [x]    |

---

## 2. World Art / Style Lock (IA level)

| Kryterium                             | Status |
| ------------------------------------- | ------ |
| Każdy ekran P0 ma kotwice WA w IA/WF  | [x]    |
| Brak nowych assetów w wireframes      | [x]    |
| Marketing MKT-* nie w Decision chrome | [x]    |
| Hero jako slot ≤10% uwagi (opis)      | [x]    |

---

## 3. Jakość lo-fi

| Kryterium                                 | Status |
| ----------------------------------------- | ------ |
| Brak Hi-Fi / kolorów / CSS / React / HTML | [x]    |
| Desktop + mobile shell                    | [x]    |
| Przepływy spięte z ekranami               | [x]    |
| Powiązania między ekranami jawne          | [x]    |

---

## 4. Luki / ryzyka przed Hi-Fi

| Ryzyko                       | Mitigacja w Hi-Fi                          |
| ---------------------------- | ------------------------------------------ |
| Live feed gęstość            | Context pod wynikiem; bez drugiego Primary |
| Secondary Hub wrap na mobile | Priorytet 1–3 widoczne; reszta w Więcej    |
| Breadcrumb vs bottom-nav     | Mobile: back w TopBar zamiast długiego BC  |
| PASS SOFT tekst na HERO-005  | Hi-Fi nie dubluje losowym copy na props    |
| Immersive tunnel vs nav      | Hi-Fi: ukrycie bottom nav w MCH-01         |

---

## 5. DoD EPICu

- [x] `LFE-UI-WIREFRAMES-01-IA.md`
- [x] `LFE-UI-WIREFRAMES-01-FLOWS.md`
- [x] `LFE-UI-WIREFRAMES-01-WIREFRAMES.md`
- [x] `LFE-UI-WIREFRAMES-01-CHECKLIST.md`
- [x] Zakres P0 pokryty
- [x] Brak implementacji kodu

**Exit:** **PASS (docs)** → rekomendacja Hi-Fi UI.

---

## 6. Rekomendacja następnego etapu

# **TAK — przejść do High-Fidelity UI**

**Proponowany EPIC:** `LFE-UI-HIFI-01` (lub kontynuacja `LFE-UI-SKIN-01` Hi-Fi)

**Kolejność Hi-Fi:**

1. Shell + Hub (SCR-HUB-01)
2. Match Path (MCH-01→08)
3. Squad · Training · Transfers · Finance
4. Soft-lock / empty P0
5. Dopiero P1 ekrany

**Twarde reguły Hi-Fi:** Style Lock ACTIVE · DNA LOCKED · Board v02 · §16 · rejestr World Art · **bez** nowych assetów ad-hoc.

---

## Historia

| Wersja | Data       | Opis                    |
| ------ | ---------- | ----------------------- |
| 0.1.0  | 2026-07-29 | Checklist P0 · Hi-Fi GO |
