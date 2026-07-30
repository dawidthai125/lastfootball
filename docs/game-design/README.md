# Game Design — Last Football

## Cel dokumentu

Indeks dokumentacji produktowej (GDD). **SSOT produktu** = `GAME_DESIGN_DOCUMENT.md`.

## Aktualny stan

Faza 2: GDD-01…15 **CLOSED** · **GDD-16…19 · GDD-21 · GDD-22 Thin CLOSED**. Wypełnione §3–§22 (Thin; §24+ szkielet), **§20 Zadania**, **§23 Hub**, **§26**. UI Presentation Contract (Guide — nie mylić z GDD §16). World Art **CLOSED** · Style Lock **ACTIVE** · Hi-Fi / Proto / Playtest **PASS**.

**UI P0 implementacja CLOSED** (Night Pitch Office): IMPL-01…06 · 06A · CONTENT-PASS-01 · DOCS-SYNC-01.  
**Landing · Branding · Auth UX · MOTION-01 CLOSED** (po UI P0).  
**Domain tip:** `9027baf` (LEAGUE-04) · **Presentation tip:** `9fd14fc` (MOTION-01) · **Documentation tip:** **`086a2ac`** — LFE-LEAGUE-04 CLOSE (pin) — patrz [`../AI/CURRENT_BASELINE.md`](../AI/CURRENT_BASELINE.md).  
Master handoff: [`../AI/PROJECT_HANDOFF.md`](../AI/PROJECT_HANDOFF.md).  
Następny: **Transfers hardening READY FOR AUDIT** (Owner GO) — **nie rozpoczęty**.  
PLAN closed: [`../implementation/LFE-LEAGUE-04-PLAN.md`](../implementation/LFE-LEAGUE-04-PLAN.md).

## Opis działania

1. Design docs-only (bez kodu, bez formuł silnika).
2. Po etapie: raport → STOP → czekaj na GO.
3. Implementacja gameplay **wynika** z GDD, nie odwrotnie.

## Dokumenty

| Dokument                                                                                             | Opis                                                  |
| ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| [GAME_DESIGN_DOCUMENT.md](./GAME_DESIGN_DOCUMENT.md)                                                 | Pełny GDD (SSOT)                                      |
| [UI_DESIGN_GUIDE.md](./UI_DESIGN_GUIDE.md)                                                           | Zasady UI/UX · **§16 Presentation Contract (SSOT)**   |
| [LFE-CONCEPT-ART-01-ART-BIBLE.md](./LFE-CONCEPT-ART-01-ART-BIBLE.md)                                 | **SSOT świata / obrazu** (Night Pitch Office) · DRAFT |
| [LFE-CONCEPT-ART-01-ASSET-LIBRARY.md](./LFE-CONCEPT-ART-01-ASSET-LIBRARY.md)                         | Katalog assetów świata · DRAFT                        |
| [LFE-CONCEPT-ART-01-ROADMAP.md](./LFE-CONCEPT-ART-01-ROADMAP.md)                                     | Roadmapa produkcji Concept Art · DRAFT                |
| [LFE-WORLD-ART-02-PRODUCTION-PLAN.md](./LFE-WORLD-ART-02-PRODUCTION-PLAN.md)                         | Plan studia WORLD-01…12 · DRAFT                       |
| [LFE-WORLD-ART-02-QUALITY-GUIDE.md](./LFE-WORLD-ART-02-QUALITY-GUIDE.md)                             | Consistency Gate / Quality · DRAFT                    |
| [LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md](./LFE-WORLD-ART-02-PRODUCTION-BACKLOG.md)                   | Backlog produkcji świata · DRAFT                      |
| [LFE-WORLD-ART-03-FOUNDATION-PACK.md](./LFE-WORLD-ART-03-FOUNDATION-PACK.md)                         | Foundation Pack / Visual DNA stage · DRAFT            |
| [LFE-WORLD-ART-03-VISUAL-DNA.md](./LFE-WORLD-ART-03-VISUAL-DNA.md)                                   | 10 zasad Visual DNA · DRAFT                           |
| [LFE-WORLD-ART-03-STYLE-LOCK.md](./LFE-WORLD-ART-03-STYLE-LOCK.md)                                   | Procedura Style Lock · DRAFT                          |
| [LFE-WORLD-ART-03R-REFERENCE-BOARD.md](./LFE-WORLD-ART-03R-REFERENCE-BOARD.md)                       | Foundation Reference Board (16 REF) · SPEC            |
| [LFE-WORLD-ART-03R-APPROVAL-PROCESS.md](./LFE-WORLD-ART-03R-APPROVAL-PROCESS.md)                     | Draft→Board Lock · werdykt 04                         |
| [LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md](./LFE-WORLD-ART-03R-QUALITY-CHECKLIST.md)                   | Checklisty jakości REF · DRAFT                        |
| [LFE-WORLD-ART-03R-FOUNDATION-RENDER-REPORT.md](./LFE-WORLD-ART-03R-FOUNDATION-RENDER-REPORT.md)     | Render REF-01…16 · FAIL board                         |
| [LFE-WORLD-ART-03R-GATE-RESULTS.md](./LFE-WORLD-ART-03R-GATE-RESULTS.md)                             | Gate matryca · WORLD-04 blocked                       |
| [LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md](./LFE-WORLD-ART-03R-STYLE-LOCK-CERTIFICATE.md)         | Certificate **AKTYWNY** (v02)                         |
| [LFE-WORLD-ART-03R-REMEDIATION-REPORT.md](./LFE-WORLD-ART-03R-REMEDIATION-REPORT.md)                 | Remediacja FAIL REF · PASS                            |
| [LFE-WORLD-ART-03R-RE-CERTIFICATION.md](./LFE-WORLD-ART-03R-RE-CERTIFICATION.md)                     | Re-gate · board PASS · 04 odblokowane                 |
| [LFE-WORLD-ART-04-PRODUCTION-PLAN.md](./LFE-WORLD-ART-04-PRODUCTION-PLAN.md)                         | Volume Wave 0–2 · Owner GO                            |
| [LFE-WORLD-ART-04-ASSET-QUEUE.md](./LFE-WORLD-ART-04-ASSET-QUEUE.md)                                 | Kolejka ~90 ID · READY                                |
| [LFE-WORLD-ART-04-QUALITY-PROCESS.md](./LFE-WORLD-ART-04-QUALITY-PROCESS.md)                         | Gate volume pod Style Lock                            |
| [LFE-WORLD-ART-04A-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04A-PRODUCTION-REPORT.md)                   | Wave 0 production · 25 assets                         |
| [LFE-WORLD-ART-04A-GATE-RESULTS.md](./LFE-WORLD-ART-04A-GATE-RESULTS.md)                             | Wave 0 gate PASS · Wave 1 GO                          |
| [LFE-WORLD-ART-04A-ASSET-INDEX.md](./LFE-WORLD-ART-04A-ASSET-INDEX.md)                               | Indeks plików Wave 0                                  |
| [LFE-WORLD-ART-04B-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04B-PRODUCTION-REPORT.md)                   | Wave 1 environments · 19 assets                       |
| [LFE-WORLD-ART-04B-GATE-RESULTS.md](./LFE-WORLD-ART-04B-GATE-RESULTS.md)                             | Wave 1 gate PASS · Wave 2 GO                          |
| [LFE-WORLD-ART-04B-ASSET-INDEX.md](./LFE-WORLD-ART-04B-ASSET-INDEX.md)                               | Indeks plików Wave 1                                  |
| [LFE-WORLD-ART-04C-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04C-PRODUCTION-REPORT.md)                   | Wave 2 gameplay env · 43 assets                       |
| [LFE-WORLD-ART-04C-GATE-RESULTS.md](./LFE-WORLD-ART-04C-GATE-RESULTS.md)                             | Wave 2 gate PASS · Wave 3 GO                          |
| [LFE-WORLD-ART-04C-ASSET-INDEX.md](./LFE-WORLD-ART-04C-ASSET-INDEX.md)                               | Indeks plików Wave 2                                  |
| [LFE-WORLD-ART-04C-CONTACT-SHEET.md](./LFE-WORLD-ART-04C-CONTACT-SHEET.md)                           | Contact sheet Wave 2                                  |
| [LFE-WORLD-ART-04D-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04D-PRODUCTION-REPORT.md)                   | Wave 3 stadium+finance · 22 assets                    |
| [LFE-WORLD-ART-04D-GATE-RESULTS.md](./LFE-WORLD-ART-04D-GATE-RESULTS.md)                             | Wave 3 gate PASS · Wave 4 GO                          |
| [LFE-WORLD-ART-04D-ASSET-INDEX.md](./LFE-WORLD-ART-04D-ASSET-INDEX.md)                               | Indeks plików Wave 3                                  |
| [LFE-WORLD-ART-04D-CONTACT-SHEET.md](./LFE-WORLD-ART-04D-CONTACT-SHEET.md)                           | Contact sheet Wave 3                                  |
| [LFE-WORLD-ART-04E-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04E-PRODUCTION-REPORT.md)                   | Wave 4 board·medical·academy · 30 assets              |
| [LFE-WORLD-ART-04E-GATE-RESULTS.md](./LFE-WORLD-ART-04E-GATE-RESULTS.md)                             | Wave 4 gate PASS · Wave 5 GO                          |
| [LFE-WORLD-ART-04E-ASSET-INDEX.md](./LFE-WORLD-ART-04E-ASSET-INDEX.md)                               | Indeks plików Wave 4                                  |
| [LFE-WORLD-ART-04E-CONTACT-SHEET.md](./LFE-WORLD-ART-04E-CONTACT-SHEET.md)                           | Contact sheet Wave 4                                  |
| [LFE-WORLD-ART-04F-PRODUCTION-REPORT.md](./LFE-WORLD-ART-04F-PRODUCTION-REPORT.md)                   | Wave 5 moments·supporters · 26 assets                 |
| [LFE-WORLD-ART-04F-GATE-RESULTS.md](./LFE-WORLD-ART-04F-GATE-RESULTS.md)                             | Wave 5 gate PASS · CLOSE 04 GO                        |
| [LFE-WORLD-ART-04F-ASSET-INDEX.md](./LFE-WORLD-ART-04F-ASSET-INDEX.md)                               | Indeks plików Wave 5                                  |
| [LFE-WORLD-ART-04F-CONTACT-SHEET.md](./LFE-WORLD-ART-04F-CONTACT-SHEET.md)                           | Contact sheet Wave 5                                  |
| [LFE-WORLD-ART-05-CLOSE-REPORT.md](./LFE-WORLD-ART-05-CLOSE-REPORT.md)                               | **CLOSE** programu WORLD ART · 165 assets             |
| [LFE-WORLD-ART-05-ASSET-REGISTRY.md](./LFE-WORLD-ART-05-ASSET-REGISTRY.md)                           | Centralny rejestr zatwierdzonych assetów              |
| [LFE-WORLD-ART-05-UI-HANDOFF.md](./LFE-WORLD-ART-05-UI-HANDOFF.md)                                   | Handoff do zespołu UI                                 |
| [LFE-UI-SKIN-01-DESIGN-SYSTEM.md](./LFE-UI-SKIN-01-DESIGN-SYSTEM.md)                                 | DS foundation · zasady UI · tokeny koncepcyjne        |
| [LFE-UI-SKIN-01-COMPONENT-MAP.md](./LFE-UI-SKIN-01-COMPONENT-MAP.md)                                 | Mapa domen UI ↔ World Art                             |
| [LFE-UI-SKIN-01-SCREEN-INVENTORY.md](./LFE-UI-SKIN-01-SCREEN-INVENTORY.md)                           | Inwentarz ekranów · ~52 ID                            |
| [LFE-UI-WIREFRAMES-01-IA.md](./LFE-UI-WIREFRAMES-01-IA.md)                                           | IA P0 · sitemap · macierz ekranów                     |
| [LFE-UI-WIREFRAMES-01-FLOWS.md](./LFE-UI-WIREFRAMES-01-FLOWS.md)                                     | User flows P0 · daily · match                         |
| [LFE-UI-WIREFRAMES-01-WIREFRAMES.md](./LFE-UI-WIREFRAMES-01-WIREFRAMES.md)                           | Low-fi wireframes P0                                  |
| [LFE-UI-WIREFRAMES-01-CHECKLIST.md](./LFE-UI-WIREFRAMES-01-CHECKLIST.md)                             | Checklist · Hi-Fi GO                                  |
| [LFE-UI-HIFI-01-HIFI-SCREENS.md](./LFE-UI-HIFI-01-HIFI-SCREENS.md)                                   | Hi-Fi screens P0 · Shell→Finance                      |
| [LFE-UI-HIFI-01-COMPONENT-SPECS.md](./LFE-UI-HIFI-01-COMPONENT-SPECS.md)                             | Specy komponentów Hi-Fi                               |
| [LFE-UI-HIFI-01-STATE-SPECS.md](./LFE-UI-HIFI-01-STATE-SPECS.md)                                     | Stany ekranów i interakcji P0                         |
| [LFE-UI-HIFI-01-DESIGN-REVIEW.md](./LFE-UI-HIFI-01-DESIGN-REVIEW.md)                                 | Quality Gate · **Proto GO**                           |
| [LFE-UI-PROTO-01-PROTOTYPE-SPEC.md](./LFE-UI-PROTO-01-PROTOTYPE-SPEC.md)                             | Spec interaktywnego prototypu P0                      |
| [LFE-UI-PROTO-01-FLOW-MAP.md](./LFE-UI-PROTO-01-FLOW-MAP.md)                                         | Mapa przepływów · Modes A–H                           |
| [LFE-UI-PROTO-01-INTERACTION-SPECS.md](./LFE-UI-PROTO-01-INTERACTION-SPECS.md)                       | Hotspoty · stany · soft-lock · errors                 |
| [LFE-UI-PROTO-01-UX-REVIEW.md](./LFE-UI-PROTO-01-UX-REVIEW.md)                                       | Quality Gate · **Figma GO**                           |
| [LFE-UI-PROTOTYPE-VALIDATION-01-FIGMA-BUILD.md](./LFE-UI-PROTOTYPE-VALIDATION-01-FIGMA-BUILD.md)     | Build Figma · URL · inventory                         |
| [LFE-UI-PROTOTYPE-VALIDATION-01-PLAYTEST-PLAN.md](./LFE-UI-PROTOTYPE-VALIDATION-01-PLAYTEST-PLAN.md) | Plan playtestów PT-01…08                              |
| [LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md](./LFE-UI-PROTOTYPE-VALIDATION-01-UX-ISSUES.md)         | Log issues · SOFT build                               |
| [LFE-UI-PROTOTYPE-VALIDATION-01-GATE.md](./LFE-UI-PROTOTYPE-VALIDATION-01-GATE.md)                   | Quality Gate · **Playtest GO**                        |
| [LFE-UX-PLAYTEST-01-RESULTS.md](./LFE-UX-PLAYTEST-01-RESULTS.md)                                     | Wyniki PT-01…08                                       |
| [LFE-UX-PLAYTEST-01-ISSUES.md](./LFE-UX-PLAYTEST-01-ISSUES.md)                                       | Issues P0/P1/P2                                       |
| [LFE-UX-PLAYTEST-01-RCA.md](./LFE-UX-PLAYTEST-01-RCA.md)                                             | Root cause analysis                                   |
| [LFE-UX-PLAYTEST-01-OWNER-DECISION.md](./LFE-UX-PLAYTEST-01-OWNER-DECISION.md)                       | Decyzja · **GO impl**                                 |
| [LFE-ART-DIRECTION-01-AUDIT.md](./LFE-ART-DIRECTION-01-AUDIT.md)                                     | Most do UI/DS 2.0 · DRAFT                             |
| [LFE-UX-POSTMORTEM-01.md](./LFE-UX-POSTMORTEM-01.md)                                                 | Historia UI Evolution (**REFERENCE**)                 |
| [CURRENT_DESIGN.md](./CURRENT_DESIGN.md)                                                             | Co jest wypełnione (skrót)                            |
| [ROADMAP.md](./ROADMAP.md)                                                                           | Kolejne etapy GDD                                     |

## Najważniejsze decyzje

- Match-centric loop; hub-first; 5–15 min.
- Liga 4 poziomy; puchar narodowy; transfery z oknami; 1 kasa + envelope.
- Szczegóły w GDD — nie duplikować tu reguł jako „nowych”.

## Powiązania

[`../PROJECT_STATUS.md`](../PROJECT_STATUS.md) · [`../lfe/MATCH_FLOW.md`](../lfe/MATCH_FLOW.md) · [`../DECISIONS.md`](../DECISIONS.md)

## Last updated

2026-07-30 — LFE-LEAGUE-04 CLOSED · Domain `9027baf`
