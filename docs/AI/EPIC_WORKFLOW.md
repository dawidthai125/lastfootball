# AI — EPIC Workflow

## Cel

Jak prowadzić EPIC z Ownerem i Cursor / ChatGPT.

## Pipeline (obowiązkowy)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CLOSE
```

| Etap      | Agent robi                        | Owner                           |
| --------- | --------------------------------- | ------------------------------- |
| AUDIT     | stan kodu/docs, luki, ryzyka      | czyta raport                    |
| PLAN      | M1–Mn, SSOT, poza zakresem, AC    | **GO → IMPLEMENT** lub poprawki |
| IMPLEMENT | kod/docs w scope; DoD checks      | **GO → COMMIT**                 |
| COMMIT    | jeden spójny commit; bez sekretów | **GO → PUSH**                   |
| PUSH      | push + CI + deploy + smoke        | **GO → CLOSE**                  |
| CLOSE     | status docs; EPIC zamknięty       | akceptacja                      |

## Zasady EPIC-u

1. **Jeden cel** — nie mieszaj Physics z Hubem.
2. **Poza zakresem** wypisz w PLAN i nie ruszaj.
3. **Bez commit/push** aż Owner GO.
4. **Raport końcowy** każdego etapu (szablon w zadaniu Ownera).
5. Po CLOSE: zaktualizuj `PROJECT_STATUS`, `ROADMAP`, `AI/CURRENT_BASELINE`, `CHANGELOG` (docs).

## Definition of Done (kod)

- AC z PLAN spełnione
- typecheck PASS · lint PASS · build PASS
- E2E / smoke gdy dotyczy ścieżki gracza
- brak regresji poprzednich EPIC-ów (PLATFORM / MATCH / HUB)
- docs status zsynchronizowane (przy CLOSE lub DOCS EPIC)

## Release Flow (skrót)

1. `git push origin main` (po GO)
2. GitHub Actions CI GREEN
3. Vercel Production Ready
4. Smoke na `https://lastfootball.vercel.app`
5. Raport PUSH + rekomendacja CLOSE

Szczegóły: [`../WORKFLOW.md`](../WORKFLOW.md) · [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md).

## Naming

- Product/platform: `LFE-PLATFORM-01`, `LFE-MATCH-01`, `LFE-HUB-01`, `LFE-DOCS-01`
- Engine: `LFE` EPIC-1…7, `LFE-*-01` (Canvas, Replay, …)
- Design: `GDD-NN`

## Last updated

2026-07-24 — LFE-DOCS-01
