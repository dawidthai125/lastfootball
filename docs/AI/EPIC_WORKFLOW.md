# AI — EPIC Workflow

## Cel

Jak prowadzić EPIC z Ownerem i Cursor / ChatGPT.

## Pipeline (jedyny — obowiązkowy)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

| Etap       | Agent                                    | Owner                           |
| ---------- | ---------------------------------------- | ------------------------------- |
| AUDIT      | stan kodu/docs, luki, ryzyka             | czyta raport                    |
| PLAN       | M1–Mn, SSOT, poza zakresem, AC           | **GO → IMPLEMENT**              |
| IMPLEMENT  | kod/docs w scope                         | **GO → COMMIT** (po VALIDATION) |
| VALIDATION | format · typecheck · lint · test · build | —                               |
| COMMIT     | jeden spójny commit; bez sekretów        | **GO → PUSH**                   |
| PUSH       | `git push`                               | —                               |
| CI         | monitor Format→…→Secret scan = GREEN     | **GO → CLOSE**                  |
| CLOSE      | sync status docs (ROADMAP, BASELINE, …)  | akceptacja FULLY CLOSED         |

Praktyka: [`ENGINEERING_GUIDE.md`](./ENGINEERING_GUIDE.md) · [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md).

## Zasady EPIC-u

1. **Jeden cel** — nie mieszaj Physics z Hubem.
2. **Poza zakresem** w PLAN — nie ruszaj.
3. **Bez commit/push** aż Owner GO.
4. Raport końcowy każdego etapu (szablon w zadaniu Ownera).
5. Po CLOSE: aktualizuj **ROADMAP** (lista EPIC), **CURRENT_BASELINE** (feature hash), CHANGELOG — bez kopiowania pełnych list EPIC do 5 plików.

## Definition of Done (kod)

- AC z PLAN spełnione
- format · typecheck · lint · test · build PASS
- CI GREEN po push
- brak runtime mocków; SSOT zachowany
- docs zsynchronizowane przy CLOSE

## Naming

- Product: `LFE-PLATFORM-01`, `LFE-TRAINING-01`, …
- Engine: EPIC-1…7, `LFE-*-01` (Canvas, Replay, …)
- Design: `GDD-NN`
- Docs hygiene / consolidation: `AI-DOCS-HYGIENE-01`, `AI-DOCS-CONSOLIDATION-02`

## Last updated

2026-07-26 — AI-DOCS-CONSOLIDATION-02
