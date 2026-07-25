# Workflow — Last Football

## Cel

Etapy pracy Owner / ChatGPT / Cursor. **Jeden** pipeline — bez wariantów.

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

| Etap           | Co się dzieje                                                 | Kod?  | Commit?     | Push?     |
| -------------- | ------------------------------------------------------------- | ----- | ----------- | --------- |
| **AUDIT**      | Analiza repo / SSOT; luki i ryzyka                            | Nie   | Nie         | Nie       |
| **PLAN**       | Zakres IN/OUT, pliki, testy, ryzyka                           | Nie   | Nie         | Nie       |
| **OWNER GO**   | Akceptacja planu / commit / push / close                      | —     | —           | —         |
| **IMPLEMENT**  | Kod lub docs wg PLAN                                          | Tak*  | Nie         | Nie       |
| **VALIDATION** | format / typecheck / lint / test / build                      | —     | Nie         | Nie       |
| **COMMIT**     | Conventional Commit; tylko pliki EPIC                         | —     | Tak (po GO) | Nie       |
| **PUSH**       | `git push` (po GO)                                            | —     | —           | Tak       |
| **CI**         | Format · Typecheck · Lint · Test · Build · Secret scan = PASS | —     | —           | —         |
| **CLOSE**      | Docs sync; EPIC FULLY CLOSED                                  | Docs* | Osobny GO   | Osobny GO |

\* Docs-only EPIC: tylko dokumenty.  
Owner GO pojawia się wielokrotnie (po PLAN, przed COMMIT, przed PUSH, przed CLOSE).

### Zasady STOP

- Po AUDIT i PLAN: STOP — czekaj na GO.
- Po COMMIT: STOP przed PUSH.
- Po PUSH: czekaj na CI GREEN przed CLOSE.

## Role

| Rola      | Odpowiedzialność                                                               |
| --------- | ------------------------------------------------------------------------------ |
| **Owner** | Priorytety, GO/NO-GO, decyzje produktowe                                       |
| **Agent** | AUDIT/PLAN/IMPLEMENT/VALIDATION/COMMIT/PUSH na GO; tylko `docs/` + kod w scope |

### Handoff między sesjami

1. [`AI/START_HERE.md`](./AI/START_HERE.md) (nie AI-HANDOFF jako handbook)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`ROADMAP.md`](./ROADMAP.md) — lista EPIC
4. Task docs: [`platform/`](./platform/) · [`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Raportowanie

Każdy etap → krótki raport w czacie (szablon w zadaniu Ownera).  
Nie twórz `docs/*REPORT*` bez potrzeby.

## Powiązania

[`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md) · [`AI/ENGINEERING_GUIDE.md`](./AI/ENGINEERING_GUIDE.md) · [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md)

## Last updated

2026-07-25 — AI-DOCS-HYGIENE-01
