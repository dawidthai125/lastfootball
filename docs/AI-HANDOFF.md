# AI Handoff / Agent Handbook — Last Football

## Cel dokumentu

**SSOT startowy dla nowego Agenta AI / Cursor / ChatGPT.**  
Umożliwia rozpoczęcie pracy **bez** historii czatu i **bez** czytania całej historii commitów.  
Czytaj ten plik jako pierwszy (obok krótkiego [`HANDOFF.md`](./HANDOFF.md)).

**Last updated:** 2026-07-24 · **LFE:** `0.9.1-match-ai01` · **Docs HEAD:** `60ccc66` · **Web pipeline:** `33618e9`

---

## 0. Kolejność czytania (obowiązkowa)

| #   | Dokument                                                       | Po co                                                                |
| --- | -------------------------------------------------------------- | -------------------------------------------------------------------- |
| 1   | **Ten plik**                                                   | reguły Agenta, stan, pipeline, zakazy                                |
| 2   | [`HANDOFF.md`](./HANDOFF.md)                                   | skrót 1 ekranu                                                       |
| 3   | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)                     | gdzie jesteśmy                                                       |
| 4   | [`ROADMAP.md`](./ROADMAP.md)                                   | co dalej (tech)                                                      |
| 5   | [`ARCHITECTURE.md`](./ARCHITECTURE.md)                         | przepływ danych systemu                                              |
| 6   | [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md) | AI + Engine + Player Match Data                                      |
| 7   | [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)       | Canvas · Replay · Post Match · Live Bridge                           |
| 8   | [`WORKFLOW.md`](./WORKFLOW.md)                                 | AUDIT → … → CLOSE                                                    |
| 9   | [`CODING_STANDARDS.md`](./CODING_STANDARDS.md)                 | konwencje + REUSE FIRST                                              |
| 10  | [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md)                   | commit / push / rollback                                             |
| 11  | Produkt (gdy zadanie GDD)                                      | [`game-design/README.md`](./game-design/README.md)                   |
| 12  | Kontrakt LFE (gdy API)                                         | [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) |

Indeks pełny: [`docs/README.md`](./README.md). Chronologia docs: [`docs/CHANGELOG.md`](./CHANGELOG.md) (nie mylić ze starym root `CHANGELOG.md`).

---

## 1. Aktualny stan projektu

| Warstwa       | Stan                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------ |
| **LFE**       | EPIC-1…7 + Gameplay + Match AI + Match Engine + **Player Match Data** · `0.9.1-match-ai01` |
| **Web match** | Pre → **Live Bridge** → **Canvas** → **Replay** → **Post Match** na `main`                 |
| **UI shell**  | Asset Pack + Shell polish                                                                  |
| **GDD**       | Faza 2: GDD-01…15 CLOSED · §3–§15 + §20 + §23                                              |
| **CI**        | Format → Typecheck → Lint → Test → Build — **zielony** (po LFE-CI-PRETTIER-01)             |
| **Prod**      | `https://lastfootball.vercel.app` · `/status` → `LFE_VERSION`                              |

### Ukończone EPIC-i (kod na `main`)

| ID                                 | Status | Hash (orient.)           |
| ---------------------------------- | ------ | ------------------------ |
| LFE EPIC-1…7                       | ✅     | —                        |
| GAMEPLAY / MATCH-AI / MATCH-ENGINE | ✅     | `e449400`…               |
| LFE-PLAYER-MATCH-DATA-01           | ✅     | `4d43661`                |
| LFE-CI-PRETTIER-01                 | ✅     | `fbbebea`                |
| LFE-CANVAS-RENDERER-01             | ✅     | `d752d22`                |
| LFE-REPLAY-01                      | ✅     | `cf1d68c`                |
| LFE-POST-MATCH-01                  | ✅     | `b25f479`                |
| LFE-LIVE-BRIDGE-01                 | ✅     | `33618e9`                |
| LFE-DOCS-SYNC-01                   | ✅     | `60ccc66`                |
| LFE-PLAYER-RATINGS-01              | ✅     | (local / pending commit) |

Szczegóły statusu: [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).

---

## 2. Co WOLNO / czego NIE WOLNO

### Wolno

- Czytać i rozszerzać istniejące moduły zgodnie z EPIC + PLAN.
- Mutować mecz **tylko** przez `CommandBus` / oficjalne session API.
- Czytać `MatchState`, `EventBus.history`, `MatchSpatialState`, `MatchCanvasReadModel`.
- Pisać testy (LFE vitest; web: replay/post-match vitest paths).
- Aktualizować docs SSOT po EPIC (status / changelog / handoff).
- Formatować (`npm run format`) gdy wymaga CI / Owner.

### Nie wolno

| Zakaz                                                         | Dlaczego                |
| ------------------------------------------------------------- | ----------------------- |
| Commit / push bez **Owner GO**                                | polityka projektu       |
| Force-push / rewrite `main`                                   | historia produkcyjna    |
| Import Engine/AI w Canvas / Replay / Post Match               | granica warstw          |
| Mutacja `MatchState` / EventBus z UI / Canvas / Replay        | SSOT + CommandBus       |
| Reimplementacja logiki Engine/AI/stats w `apps/web`           | ZERO DUPLICATE          |
| Zmiana Architecture Freeze / GDD SSOT bez AUDIT + Owner GO    | kontrakt                |
| Przebudowa Engine / Replay / Canvas „przy okazji” innego EPIC | scope                   |
| Commit `undefined/`, sekretów, `.env.local`                   | śmieci / bezpieczeństwo |
| Nowy dokument docs gdy treść już istnieje                     | **SSOT FIRST**          |

---

## 3. Zasady architektoniczne (skrót)

1. **`createMatch()` → `MatchSession`** = jedyny oficjalny entry meczu w LFE.
2. **`MatchState` + `EventBus`** = SSOT stanu i zdarzeń meczu.
3. **Canvas / Replay** = presentation / nagrane `MatchCanvasReadModel` — bez Engine.
4. **Live Bridge** (`LiveMatchRuntime` + `LiveMatchFoundation`) spina LIVE pulse → buffer → Canvas; REPLAY tylko odtwarza buffer.
5. **LFE** bez React / Supabase / DOM.
6. **GDD** = SSOT produktu; **Freeze** = SSOT kontraktu PUBLIC LFE.
7. **Determinizm:** seeded RNG w Engine; atrybucja zawodnika bez dodatkowego `rng.next()` (Player Match Data).
8. **REUSE FIRST** — najpierw istniejący moduł / API; nie kopiuj logiki.
9. **ZERO DUPLICATE LOGIC** — jedna implementacja decyzji/statystyk/symulacji (w LFE), web tylko konsumuje.

Szczegóły kodu: [`CODING_STANDARDS.md`](./CODING_STANDARDS.md).  
Pipeline UI: [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md).  
Silnik: [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md).

---

## 4. Match pipeline (aktualny)

```
Pre Match (UI)
    ↓ createSessionFromFixture / createMatch
Gameplay Foundation (tactics, commands, events)
    ↓
Match AI → Match Engine (RNG + tick) → MatchState + EventBus
    ↓
LiveMatchRuntime (LIVE) → MatchCanvasReadModel
    ├─► Canvas Renderer (present)
    └─► ReplayBuffer.append
            ↓ enterReplay
        ReplayController → Canvas (REPLAY, bez session.run)
            ↓ MATCH_END / FINISHED
        Post Match (summary + seek do buffera)
```

**SSOT danych:**

```
Engine → MatchState / EventBus → LiveMatchRuntime → ReadModel → Canvas / Replay → Post Match
```

---

## 5. Workflow Agenta (obowiązkowy)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → OWNER GO → PUSH → CI → CLOSE
```

| Etap           | Agent robi                                              | STOP?                                      |
| -------------- | ------------------------------------------------------- | ------------------------------------------ |
| **AUDIT**      | Analiza kodu/docs; **zero** implementacji / commit      | Tak — raport → czekaj GO na PLAN/IMPLEMENT |
| **PLAN**       | Zakres, pliki, ryzyka, test plan; **zero** kodu         | Tak — Owner GO                             |
| **IMPLEMENT**  | Kod/docs wg planu; REUSE FIRST                          | —                                          |
| **VALIDATION** | `format:check`, typecheck, lint, test, build (wg EPIC)  | Nie przechodź do COMMIT przy FAIL          |
| **COMMIT**     | Tylko po GO; wyłącznie pliki EPIC; Conventional Commits | —                                          |
| **PUSH**       | Tylko po GO; potem CI Format→Build                      | —                                          |
| **CLOSE**      | CI PASS + aktualizacja docs jeśli nie w tym samym EPIC  | Raport końcowy                             |

Pełny opis ról Owner / ChatGPT / Cursor: [`WORKFLOW.md`](./WORKFLOW.md).  
Commity / rollback: [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md).

**Uwaga Git:** root [`CONTRIBUTING.md`](../CONTRIBUTING.md) opisuje model develop→PR; w praktyce release’y bywały **direct `main` + Owner GO**. Dla Agenta wiążące jest: **brak push bez GO** + [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md).

---

## 6. Raportowanie (szablon)

Każdy etap kończy się krótkim raportem dla Ownera:

| Etap      | Raport zawiera                                     |
| --------- | -------------------------------------------------- |
| AUDIT     | Werdykt, luki, ryzyka, GO/NO-GO do PLAN            |
| PLAN      | Zakres IN/OUT, pliki, kolejność, testy, ryzyka     |
| IMPLEMENT | Pliki, walidacje, zgodność z PLAN, gotowość COMMIT |
| COMMIT    | Hash, lista plików, `git status`                   |
| PUSH      | Hash, HEAD==origin, wyniki CI per step             |
| CLOSE     | EPIC CLOSED + co dalej                             |

Nie twórz zbędnych plików raportów w `docs/` — raport w odpowiedzi czatu wystarczy, chyba że Owner każe inaczej.

---

## 7. Commity, WIP, dokumentacja

### Commity

- Stage **tylko** pliki danego EPIC / grupy (patrz split WIP).
- Message: Conventional Commits (`feat(web): …`, `docs: …`, `chore(ci): …`).
- PowerShell: `git commit -m @" … "@`.
- Po commit kodowym: lokalne testy/typecheck zanim prosisz o PUSH.

### WIP

- Duży WIP dziel na niezależne commity (Canvas → Replay → Post Match → Bridge → Docs).
- Nie mieszaj feat + docs sync + prettier w jednym commicie bez planu.
- Stash z `-u` przed globalnym formatem / gdy trzeba czystego tree.

### Dokumentacja (SSOT FIRST)

1. Najpierw zaktualizuj **istniejący** dokument.
2. Nowy plik w `docs/` tylko gdy nie dubluje SSOT i Owner/PLAN to przewiduje.
3. Po EPIC feature: minimum `PROJECT_STATUS` / `ROADMAP` / `AI-HANDOFF` / `docs/CHANGELOG` (lub osobny docs EPIC).
4. Chronologia bieżąca: [`docs/CHANGELOG.md`](./CHANGELOG.md).

---

## 8. Uruchamianie i testy

```bash
npm install
npm run dev          # apps/web
npm run build
npm run typecheck
npm run lint
npm test             # LFE vitest
npm run format:check
```

```bash
npx vitest run apps/web/src/gameplay/replay/replay01.test.ts --environment node
npx vitest run apps/web/src/components/match/post-match/post-match01.test.ts --environment node
```

Env: [`ENVIRONMENT.md`](./ENVIRONMENT.md) · Setup: [`DEV_SETUP.md`](./DEV_SETUP.md).

---

## 9. Najbliższe EPIC-i

| Priorytet | EPIC                                      | Status            |
| --------- | ----------------------------------------- | ----------------- |
| 1         | GDD-16+ (kolejny szkielet)                | PLANNED (docs)    |
| 2         | Transfer / Economy / League / Multiplayer | FUTURE            |
| —         | Physics / pełne Rules                     | FUTURE / RESERVED |
| —         | Ratings v2 (assists / minutes)            | FUTURE            |

Źródło: [`ROADMAP.md`](./ROADMAP.md).

---

## 10. Ograniczenia i dług

- Spatial ≈ kickoff + presentation derive (brak Physics).
- Replay = ring buffer w RAM (brak persist / video).
- `playerId` na GOAL/SHOT/FOUL jest; **Ratings UI** (v1) w Post Match — formuła bez assists/minutes.
- Pola `assists` / `minutesPlayed` / passes / karty w `PlayerStatistics` często 0.
- `packages/lfe/src/index.ts` over-export vs freeze.

---

## 11. Miejsca szczególnej ostrożności

| Ścieżka                                        | Dlaczego                             |
| ---------------------------------------------- | ------------------------------------ |
| `packages/lfe/src/match/engine/*`              | Nie ruszać przy EPIC-ach UI          |
| `packages/lfe/src/ai/*`                        | Engine hard-depends                  |
| `packages/lfe/src/match/domain/match-state.ts` | SSOT — nie mutować z web             |
| `apps/web/src/gameplay/canvas/*`               | Tylko render                         |
| `apps/web/src/gameplay/replay/*`               | Tylko nagrane modele                 |
| `apps/web/src/gameplay/live-match-runtime.ts`  | Bridge — ostrożnie przy zmianach API |
| `docs/lfe/LFE_ARCHITECTURE_FREEZE.md`          | Kontrakt — AUDIT + GO                |

---

## 12. Indeks SSOT (mapa odpowiedzialności)

| Temat                    | Dokument                          |
| ------------------------ | --------------------------------- |
| Start Agenta             | **Ten plik**                      |
| Status                   | `PROJECT_STATUS.md`               |
| Roadmap tech             | `ROADMAP.md`                      |
| Roadmap produktu         | `game-design/ROADMAP.md` (osobny) |
| Architektura / data flow | `ARCHITECTURE.md`                 |
| Match UI                 | `web/MATCH_UI_PIPELINE.md`        |
| LFE gameplay             | `lfe/GAMEPLAY_MATCH_STACK.md`     |
| LFE API kontrakt         | `lfe/LFE_ARCHITECTURE_FREEZE.md`  |
| Workflow                 | `WORKFLOW.md`                     |
| Coding                   | `CODING_STANDARDS.md`             |
| Release/git              | `RELEASE_PROCESS.md`              |
| Decyzje                  | `DECISIONS.md`                    |
| Chronologia docs         | `docs/CHANGELOG.md`               |

---

## Last updated

2026-07-24 — GDD-15
