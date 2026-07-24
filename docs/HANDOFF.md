# HANDOFF — Last Football

## Cel dokumentu

**Krótki start** dla nowego ChatGPT / Cursor.  
Pełny handbook: **[`AI-HANDOFF.md`](./AI-HANDOFF.md)** ← czytaj gdy potrzebujesz pipeline / API / ograniczeń.

## Stan projektu (2026-07-24)

| Tor           | Stan                                                                                         |
| ------------- | -------------------------------------------------------------------------------------------- |
| **LFE**       | EPIC-1…7 + Gameplay + AI + Engine + **Player Match Data** · **`0.9.1-match-ai01`** na `main` |
| **Web match** | Live Bridge + Canvas + Replay + Post Match + **Ratings**                                     |
| **UI shell**  | Asset Pack + Shell polish na `main`                                                          |
| **GDD**       | GDD-01…13 CLOSED · §3–§15 wypełnione                                                         |
| **CI**        | Format → Typecheck → Lint → Test → Build — zielony po Prettier chore                         |
| **Prod**      | `https://lastfootball.vercel.app`                                                            |

## Najważniejsze dokumenty

| Priorytet | Dokument                                                             |
| --------- | -------------------------------------------------------------------- |
| 1         | [`AI-HANDOFF.md`](./AI-HANDOFF.md)                                   |
| 2         | Ten plik                                                             |
| 3         | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)                           |
| 4         | [`ARCHITECTURE.md`](./ARCHITECTURE.md)                               |
| 5         | [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md)       |
| 6         | [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)             |
| 7         | [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) |
| 8         | [`DECISIONS.md`](./DECISIONS.md)                                     |

## Kolejność czytania

1. `AI-HANDOFF.md` / ten HANDOFF
2. `PROJECT_STATUS.md` + `ROADMAP.md`
3. Silnik → `lfe/README.md` + `GAMEPLAY_MATCH_STACK.md`
4. UI meczu → `web/MATCH_UI_PIPELINE.md`
5. Przed commit → `RELEASE_PROCESS.md`

## Najbliższy cel (rekomendacja)

1. **GDD-14+** (kolejny rozdział szkieletu) — Owner GO.
2. Albo Ratings v2 / Transfer / Economy — później.

Przed startem: przeczytaj [`AI-HANDOFF.md`](./AI-HANDOFF.md) (reguły + workflow).

## Zasady twarde

- Canvas/Replay tylko read / nagrane dane.
- Nie łam Engine/AI przy EPIC-ach UI.
- Nie commit / push bez prośby Ownera.
- Nie polegaj na historii czatu — tylko docs + kod.
- Metryki rozwoju klubu → tylko §6 GDD.

## Last updated

2026-07-24 — GDD-13
