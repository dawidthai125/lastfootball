# AI — START HERE

## Cel

Onboarding dla **ChatGPT / Cursor Agent** bez historii czatu i bez czytania całej historii git.

## Kolejność czytania (obowiązkowa)

| # | Dokument | Po co |
| --- | --- | --- |
| 1 | **Ten plik** | reguły + mapa |
| 2 | [`CURRENT_BASELINE.md`](./CURRENT_BASELINE.md) | co jest na produkcji |
| 3 | [`PROJECT_STATE.md`](./PROJECT_STATE.md) | done / next |
| 4 | [`ARCHITECTURE_RULES.md`](./ARCHITECTURE_RULES.md) | granice warstw + SSOT |
| 5 | [`EPIC_WORKFLOW.md`](./EPIC_WORKFLOW.md) | jak prowadzić EPIC |
| 6 | [`../MASTER_HANDOFF.md`](../MASTER_HANDOFF.md) | pełne przekazanie |
| 7 | [`../HANDOFF.md`](../HANDOFF.md) | skrót 1 ekranu |
| 8 | Task-specific (poniżej) | tylko to, czego dotyczy zadanie |

### Gdy zadanie dotyczy…

| Temat | Czytaj |
| --- | --- |
| Onboarding / auth / klub | [`../platform/ONBOARDING_FLOW.md`](../platform/ONBOARDING_FLOW.md) |
| First Match | [`../platform/FIRST_MATCH.md`](../platform/FIRST_MATCH.md) |
| Hub | [`../platform/HUB.md`](../platform/HUB.md) |
| Match Live / Canvas / Replay | [`../web/MATCH_UI_PIPELINE.md`](../web/MATCH_UI_PIPELINE.md) |
| Silnik LFE | [`../lfe/README.md`](../lfe/README.md) · [`../lfe/GAMEPLAY_MATCH_STACK.md`](../lfe/GAMEPLAY_MATCH_STACK.md) |
| Produkt / GDD | [`../game-design/README.md`](../game-design/README.md) |
| Release | [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md) |

Indeks docs: [`../README.md`](../README.md).

---

## Czego NIE robić

| Zakaz | Dlaczego |
| --- | --- |
| Commit / push bez **Owner GO** | polityka projektu |
| Force-push / rewrite `main` | historia produkcyjna |
| Zmiana kodu w EPIC-u docs-only | scope |
| Import Engine/AI w Canvas / Replay / Post Match | granica warstw |
| Mutacja `MatchState` z React UI | CommandBus only |
| Duplikacja logiki LFE w `apps/web` | ZERO DUPLICATE |
| Mid-season mock na Hub EARLY_CLUB | LFE-HUB-01 |
| Nowy docs gdy treść już istnieje | SSOT FIRST |
| Commit `.env` / sekretów | bezpieczeństwo |

---

## Zasady twarde

1. **REUSE FIRST** — najpierw istniejący moduł / API.
2. **ZERO DUPLICATE LOGIC** — jedna implementacja w LFE; web konsumuje.
3. **SSOT FIRST** — jeden dokument prawdy na temat; aktualizuj, nie kopiuj.
4. **`createMatch()` → `MatchSession`** — jedyny oficjalny entry meczu LFE.
5. **Hub = ekran decyzji** — `resolveHubPhase` + dokładnie 1 Primary CTA.
6. **First Match przed Hubem** — gate: `clubs.first_match_completed_at`.

---

## Definition of Done (skrót)

- Scope EPIC-u domknięty; poza zakresem nietknięte.
- typecheck / lint / build PASS (gdy kod).
- E2E / smoke gdy dotyczy ścieżki gracza.
- Docs status zaktualizowane przy zamykaniu EPIC-u.
- Commit / push **tylko** po Owner GO.

Release: [`../RELEASE_PROCESS.md`](../RELEASE_PROCESS.md).

## Last updated

2026-07-24 — LFE-DOCS-01
