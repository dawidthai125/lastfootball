# AI — Decisions (index)

## Cel

Szybki indeks decyzji dla Agenta. Pełna lista historyczna: [`../DECISIONS.md`](../DECISIONS.md).

## Platform / product (2026)

| ID | Decyzja | Źródło |
| --- | --- | --- |
| P1 | Produkcyjny routing klubu = tabela `clubs`, nie `user_metadata` | LFE-PLATFORM-01 |
| P2 | First Match tunnel **przed** Hubem; Hub dopiero po `first_match_completed_at` | LFE-MATCH-01 (wyjątek vs GDD §5.10 Hub-first) |
| P3 | `first_match_completed_at` = jedyne SSOT ukończenia pierwszego meczu | LFE-MATCH-01 |
| P4 | First Match = synthetic fixture `id=first` + deterministic starter squad (bez tabeli `players`) | LFE-MATCH-01 |
| P5 | Hub EARLY_CLUB = ekran decyzji; mid-season mock usunięty z tej ścieżki | LFE-HUB-01 / GDD §23 |
| P6 | `resolveHubPhase` / `resolvePrimaryCta` = SSOT fazy i Primary CTA | LFE-HUB-01 |
| P7 | Progressive disclosure: trening/finanse/transfery/liga soft-lock na Day 1 | LFE-HUB-01 / GDD §3 |
| P8 | Supabase prod/dev = project `anoeimngwptucjdugjme` | LFE-INFRA-01 |

## Engine (trwałe)

Patrz D1–D10 w [`../DECISIONS.md`](../DECISIONS.md): monorepo LFE izolowany, `createMatch`, CommandBus, Freeze v1, GDD SSOT produktu, Canvas/Replay read-only.

## Last updated

2026-07-24 — LFE-DOCS-01
