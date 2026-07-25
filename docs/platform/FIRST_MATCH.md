# Platform — First Match (LFE-MATCH-01)

## Cel

Inauguracyjny mecz przed odblokowaniem Hubu.

## Ścieżka

```
First Match Intro (/onboarding/first-match)
  → Prematch (/match/first)
  → Live (/match/first/live)
  → Post Match UI
  → completeFirstMatch()  → set first_match_completed_at (idempotent)
  → Welcome LF (/onboarding/welcome-lf)
  → Hub
```

## Kluczowe moduły

| Moduł                               | Rola                                                           |
| ----------------------------------- | -------------------------------------------------------------- |
| `lib/first-match/constants.ts`      | `FIRST_MATCH_ID='first'`, bot, paths, tunnel helper            |
| `lib/squad/load-starting-xi.ts`     | DB XI via `listClubPlayers` + `resolveStartingXi` (D19)        |
| `lib/first-match/create-session.ts` | `createSessionFromFirstMatch(club, ourXi)` → LFE `createMatch` |
| `lib/first-match/bundles.ts`        | Prematch/Live bundles; lineup z DB XI + AI bot seed            |
| `lib/first-match/actions.ts`        | `completeFirstMatch`                                           |

## SSOT

- Ukończenie: **`clubs.first_match_completed_at`** (jedyny).
- Skład gracza: **`players`** → [`PLAYERS.md`](./PLAYERS.md) / D19; **bez** runtime seed.
- Wynik meczu: **nie** persistowany w MVP (pasek „Ostatni mecz” na Hubie = copy jakościowy).

## Kontrakt silnika

Bez zmian PUBLIC LFE — ten sam `createMatch` / session / Live Bridge pipeline.  
Krótsze połowy (~20s) tylko w settings first match.

## Poza zakresem (MATCH-01)

Physics, ekonomia, transfery, editable lineup, persist pełnych wyników First Match.

## Po MATCH-01 (LFE-LEAGUE-01)

Po `completeFirstMatch` wywoływane jest `ensureClubFixtures` (3 mecze ligowe).  
Wynik First Match nadal **nie** trafia do `fixtures`.

## Powiązania

[`ONBOARDING_FLOW.md`](./ONBOARDING_FLOW.md) · [`HUB.md`](./HUB.md) · [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

## Last updated

2026-07-25 — LFE-PLAYERS-01 CLOSE
