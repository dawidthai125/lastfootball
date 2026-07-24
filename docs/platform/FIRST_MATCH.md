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

| Moduł | Rola |
| --- | --- |
| `lib/first-match/constants.ts` | `FIRST_MATCH_ID='first'`, bot, paths, tunnel helper |
| `lib/first-match/starter-squad.ts` | Deterministic XI (seed od `clubId`) — **bez** tabeli `players` |
| `lib/first-match/create-session.ts` | `createSessionFromFirstMatch(club)` → LFE `createMatch` |
| `lib/first-match/bundles.ts` | Prematch/Live bundles z Club DTO |
| `lib/first-match/actions.ts` | `completeFirstMatch` |

## SSOT

- Ukończenie: **`clubs.first_match_completed_at`** (jedyny).
- Wynik meczu: **nie** persistowany w MVP (pasek „Ostatni mecz” na Hubie = copy jakościowy).

## Kontrakt silnika

Bez zmian PUBLIC LFE — ten sam `createMatch` / session / Live Bridge pipeline.  
Krótsze połowy (~20s) tylko w settings first match.

## Poza zakresem (MATCH-01)

Physics, liga DB, ekonomia, transfery, editable lineup, persist pełnych wyników.

## Powiązania

[`ONBOARDING_FLOW.md`](./ONBOARDING_FLOW.md) · [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md)

## Last updated

2026-07-24 — LFE-DOCS-01
