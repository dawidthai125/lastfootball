# LFE-UI-IMPL-01 — TEST PLAN

**EPIC:** LFE-UI-IMPL-01  
**Data:** 2026-07-29  

---

## 0. Automatyczne

| Test | Komenda | Cel |
| ---- | ------- | --- |
| Unit IMPL-01 | `npm run test -w @lastfootball/web -- src/styles/impl-01.test.ts` | Tokeny SKIN-01 · PTI-01 docs |
| Typecheck | `npm run typecheck -w @lastfootball/web` | TS |
| Lint | `npm run lint -w @lastfootball/web` | ESLint |

---

## 1. Manual — Shell

| ID | Kroki | Oczekiwane |
| -- | ----- | ---------- |
| S1 | Otwórz `/hub` desktop ≥1200 | TopBar ~52px · Nav rail · Main Hub · **brak** right KPI rail |
| S2 | Resize &lt;768 | Bottom nav Hub/Trening/Kadra/Transfery/Więcej · Primary full-width |
| S3 | Crest / Hub link | Powrót Hub |
| S4 | Soft-locked nav item | Brak CTA „Odblokuj” |

---

## 2. Manual — Hub

| ID | Kroki | Oczekiwane |
| -- | ----- | ---------- |
| H1 | Hub matchday | Hero HERO-001 · 1 sprawa · **1** Primary gold · Secondary ≤5 |
| H2 | Hub idle / EARLY | Decision-first · bez KPI wall |
| H3 | Mobile Hub | Hero mobile asset · stack · touch ≥44 |

---

## 3. Manual — PTI-01

| ID | Kroki | Oczekiwane |
| -- | ----- | ---------- |
| P1 | Mobile `/players/{id}` | Detal czytelny · CTA full-width · `data-pti=PTI-01-SQD-03-M` |
| P2 | Mobile `/transfers` z ofertą | Accept/Reject pełna szerokość · `data-pti=PTI-01-XFR-02-M` |

---

## 4. Regresja vs prototyp

| Check | Pass |
| ----- | ---- |
| 1 Primary na Hub | |
| Kadra ≠ Skład w Nav | |
| Scarlet nie w Hub chrome | |
| Style Lock (brak purple) | |

---

## Historia

| Wersja | Data | Opis |
| ------ | ---- | ---- |
| 0.1.0 | 2026-07-29 | Test plan Sprint 1 |
