# Workflow — Last Football

## Cel

Etapy pracy Owner / ChatGPT / Cursor. **Jeden** pipeline — bez wariantów.

## Pipeline (jedyny)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI
  → PRODUCTION VERIFY → DOCS CLOSE → DOCS COMMIT → DOCS PUSH → FINAL DOCS VERIFY
```

Skrót narracyjny (AGENTS / Quick Start): `… → CI → CLOSE` oznacza **cały** blok CLOSE poniżej (nie pomijać PRODUCTION VERIFY ani DOCS\*).

| Etap                  | Co się dzieje                                                     | Kod?  | Commit?     | Push? |
| --------------------- | ----------------------------------------------------------------- | ----- | ----------- | ----- |
| **AUDIT**             | Analiza repo / SSOT; luki i ryzyka                                | Nie   | Nie         | Nie   |
| **PLAN**              | Zakres IN/OUT, pliki, testy, ryzyka                               | Nie   | Nie         | Nie   |
| **OWNER GO**          | Akceptacja planu / commit / push / close (wielokrotnie)           | —     | —           | —     |
| **IMPLEMENT**         | Kod lub docs wg PLAN                                              | Tak*  | Nie         | Nie   |
| **VALIDATION**        | format / typecheck / lint / test / build                          | —     | Nie         | Nie   |
| **COMMIT**            | Conventional Commit; tylko pliki EPIC                             | —     | Tak (po GO) | Nie   |
| **PUSH**              | `git push` (po GO)                                                | —     | —           | Tak   |
| **CI**                | Format · Typecheck · Lint · Test · Build · Secret scan = PASS     | —     | —           | —     |
| **PRODUCTION VERIFY** | Vercel Ready · smoke ścieżki · migracje prod (jeśli w zakresie)   | —     | Nie         | —     |
| **DOCS CLOSE**        | Sync SSOT (STATUS · ROADMAP · BASELINE · HANDOFF · CHANGELOG · …) | Docs* | Nie         | Nie   |
| **DOCS COMMIT**       | Commit docs (po GO)                                               | —     | Tak (po GO) | Nie   |
| **DOCS PUSH**         | Push docs (po GO)                                                 | —     | —           | Tak   |
| **FINAL DOCS VERIFY** | CI tip docs · tip pin · EPIC FULLY CLOSED                         | —     | —           | —     |

\* Docs-only EPIC: tylko dokumenty.  
Owner GO pojawia się wielokrotnie (po PLAN, przed COMMIT, przed PUSH, przed DOCS CLOSE / COMMIT / PUSH).

### Zasady STOP

- Po AUDIT i PLAN: STOP — czekaj na GO.
- Po COMMIT: STOP przed PUSH.
- Po PUSH: czekaj na **CI GREEN**, potem **PRODUCTION VERIFY**, potem GO na DOCS CLOSE.
- Po DOCS COMMIT: STOP przed DOCS PUSH.
- EPIC = **FULLY CLOSED** dopiero po FINAL DOCS VERIFY.

## Role

| Rola      | Odpowiedzialność                                                               |
| --------- | ------------------------------------------------------------------------------ |
| **Owner** | Priorytety, GO/NO-GO, decyzje produktowe                                       |
| **Agent** | AUDIT/PLAN/IMPLEMENT/VALIDATION/COMMIT/PUSH na GO; tylko `docs/` + kod w scope |

### Handoff między sesjami

1. [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) → [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md)
2. [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)
3. [`ROADMAP.md`](./ROADMAP.md) — lista EPIC
4. Trwałe decyzje: [`AI/ARCHITECTURAL_DECISIONS.md`](./AI/ARCHITECTURAL_DECISIONS.md) · [`DECISIONS.md`](./DECISIONS.md)
5. Task docs: [`platform/`](./platform/) · [`lfe/`](./lfe/) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

## Raportowanie

Każdy etap → krótki raport w czacie (szablon w zadaniu Ownera).  
Nie twórz `docs/*REPORT*` bez potrzeby.

## Powiązania

[`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md) · [`AI/ENGINEERING_GUIDE.md`](./AI/ENGINEERING_GUIDE.md) · [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md)

## Last updated

2026-07-30 — AI-DOCS-HARDENING-01 (pełny cykl CLOSE)
