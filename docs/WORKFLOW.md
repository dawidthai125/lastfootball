# Workflow — Last Football

## Cel dokumentu

Jak prowadzimy pracę: etapy, role Owner / ChatGPT / Cursor oraz oczekiwane raporty.

## Aktualny stan

Wzorzec potwierdzony na release LFE i serii match pipeline (Canvas → … → Docs):

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → OWNER GO → PUSH → CI → CLOSE
```

(HISTORYCZNY alias etapów: AUDIT → PLAN → DESIGN → IMPLEMENT → VERIFY → TEST → RELEASE → POST RELEASE — to samo w innych słowach.)

## Opis działania — etapy

| Etap           | Co się dzieje                                      | Kod?  | Commit?     | Push?       |
| -------------- | -------------------------------------------------- | ----- | ----------- | ----------- |
| **AUDIT**      | Analiza repo / API / SSOT; lista luk i ryzyk       | Nie   | Nie         | Nie         |
| **PLAN**       | Zakres IN/OUT, pliki, testy, ryzyka                | Nie   | Nie         | Nie         |
| **OWNER GO**   | Akceptacja planu / implementacji / push            | —     | —           | —           |
| **IMPLEMENT**  | Kod lub docs zgodnie z PLAN; REUSE FIRST           | Tak*  | Nie†        | Nie         |
| **VALIDATION** | format / typecheck / lint / test / build (wg EPIC) | —     | Nie         | Nie         |
| **COMMIT**     | Conventional Commit; tylko pliki EPIC              | —     | Tak (po GO) | Nie         |
| **PUSH**       | `git push` → monitoruj CI                          | —     | —           | Tak (po GO) |
| **CI**         | Format · Typecheck · Lint · Test · Build = PASS    | —     | —           | —           |
| **CLOSE**      | Raport; docs sync jeśli nie w EPIC                 | Docs* | Osobny GO   | Osobny GO   |

\* DESIGN / docs-only EPIC: tylko dokumenty.  
† Commit wyłącznie po Owner GO (nawet gdy IMPLEMENT gotowy).

### Zasady STOP

- Po **AUDIT** i po **PLAN**: STOP — czekaj na Owner GO.
- Po **COMMIT**: STOP przed PUSH — osobne GO.
- Nie zaczynaj Physics / Ratings / GDD-13 bez GO.
- Nie pushuj niepełnego łańcucha commitów, jeśli PLAN wymaga serii atomowej.

## Współpraca ról

| Rola                              | Odpowiedzialność                                                      |
| --------------------------------- | --------------------------------------------------------------------- |
| **Owner**                         | Priorytety, GO/NO-GO, decyzje produktowe, akceptacja freeze / release |
| **ChatGPT / Agent planujący**     | AUDIT, PLAN, design GDD, dokumenty; nie omijać SSOT                   |
| **Cursor / Agent implementujący** | IMPLEMENT, VALIDATION, COMMIT/PUSH na GO, edycja plików               |

### Handoff między czatami

1. [`AI-HANDOFF.md`](./AI-HANDOFF.md) (pełny) / [`HANDOFF.md`](./HANDOFF.md).
2. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) + [`ROADMAP.md`](./ROADMAP.md).
3. Silnik: [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md) + freeze.
4. Web match: [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md).
5. Produkt: GDD + [`game-design/CURRENT_DESIGN.md`](./game-design/CURRENT_DESIGN.md).

## Raportowanie

Każdy etap → krótki raport w czacie (szablon w [`AI-HANDOFF.md`](./AI-HANDOFF.md) §6).  
Nie twórz nowych plików `docs/*REPORT*` bez potrzeby.

## WIP i dokumentacja

- Duży WIP dziel na grupy (np. Canvas / Replay / Post Match / Bridge / Docs).
- Po feature EPIC: zaktualizuj SSOT statusowe albo zaplanuj docs EPIC.
- **SSOT FIRST** — nie duplikuj dokumentów.

## Najważniejsze decyzje

- Owner jest SSOT decyzji; dokumenty są SSOT faktów.
- Stary chat nie jest wymagany po HANDOFF.
- Jedna zmiana = jeden jasny cel (nie mieszać GDD z Physics).

## Powiązania

[`AI-HANDOFF.md`](./AI-HANDOFF.md) · [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) · [`CODING_STANDARDS.md`](./CODING_STANDARDS.md) · [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`DECISIONS.md`](./DECISIONS.md)

## Last updated

2026-07-24 — AI-DOCS-CONSOLIDATION-01
