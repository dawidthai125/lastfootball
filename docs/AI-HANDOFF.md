# AI Handoff / Agent Handbook — Last Football

## Cel dokumentu

**SSOT startowy dla nowego Agenta AI / Cursor.**  
Umożliwia rozpoczęcie pracy **bez** historii czatu. Czytaj ten plik jako pierwszy (obok krótkiego [`HANDOFF.md`](./HANDOFF.md)).

**Last updated:** 2026-07-24 · **LFE version:** `0.9.1-match-ai01` · **Web HEAD:** `33618e9`

---

## 1. Aktualny stan projektu

| Warstwa                | Stan                                                                                                     |
| ---------------------- | -------------------------------------------------------------------------------------------------------- |
| **LFE**                | EPIC-1…7 + **Gameplay Foundation** + **Match AI** + **Match Engine** · `packages/lfe` `0.9.1-match-ai01` |
| **Web match pipeline** | Pre Match → Live (`LiveMatchRuntime`) → **Canvas Renderer** → **Replay** → **Post Match**                |
| **UI shell**           | Asset Pack 01 + Shell polish na `main` (release B)                                                       |
| **GDD**                | Faza 2 częściowo (§6 skeleton)                                                                           |
| **Infra**              | Next.js 15 · Supabase · Vercel (`lastfootball.vercel.app`) · CI Format→Build **zielony**                 |

### Ukończone EPIC-i (implementacja)

| ID                       | Status  | Notatka                                                 |
| ------------------------ | ------- | ------------------------------------------------------- |
| LFE EPIC-1…7             | ✅ DONE | Foundation → Positioning                                |
| GAMEPLAY-01 / Foundation | ✅ DONE | tactics, event vocab, tactical commands                 |
| MATCH-AI-01              | ✅ DONE | possession/action decisions                             |
| MATCH-ENGINE-01          | ✅ DONE | tick sim via `MatchEngineSystem`                        |
| LFE-PLAYER-MATCH-DATA-01 | ✅ DONE | `statistics.players` + `playerId` na GOAL/SHOT/FOUL     |
| LFE-CI-PRETTIER-01       | ✅ DONE | pełny format repo; CI format gate PASS                  |
| LFE-ASSET-PACK-01        | ✅ DONE | `public/assets/pack-01`                                 |
| LFE-UI-POLISH-SHELL-01   | ✅ DONE | nav/topbar/rail                                         |
| LFE-UI-POLISH-LIVE-01    | ✅ DONE | broadcast Live chrome                                   |
| LFE-CANVAS-RENDERER-01   | ✅ DONE | 2D pitch/players/ball + EventBus FX (`d752d22`)         |
| LFE-REPLAY-01            | ✅ DONE | buffer + controller LIVE/REPLAY (`cf1d68c`)             |
| LFE-POST-MATCH-01        | ✅ DONE | raport + skok do Replay (`b25f479`)                     |
| LFE-LIVE-BRIDGE-01       | ✅ DONE | LiveMatchRuntime ↔ Canvas/Replay/Post Match (`33618e9`) |

**Na `origin/main`:** RELEASE A–C + Player Match Data + Prettier + Canvas + Replay + Post Match + Live Bridge.

---

## 2. Obowiązujące zasady architektury

1. **`createMatch()` → `MatchSession`** = jedyny oficjalny entry meczu w LFE.
2. **UI / Canvas / Replay** tylko **czytają** MatchState / EventBus / spatial (lub nagrane `MatchCanvasReadModel`). Mutacje wyłącznie przez **CommandBus**.
3. **Canvas ≠ Engine.** Brak importów Engine/AI w rendererze.
4. **Replay nie uruchamia Engine** — tylko buffer.
5. **LFE bez React / Supabase / DOM.**
6. **GDD** = SSOT produktu; **LFE freeze** = SSOT kontraktu silnika (rozszerzenia GAMEPLAY/AI/ENGINE dokumentuj osobno).
7. **Nie commituj / nie pushuj** bez jawnej prośby Ownera.
8. **Nie zmieniaj SSOT** (freeze/GDD) bez AUDIT + Owner GO.

### Czego NIE wolno zmieniać (bez osobnego EPIC + GO)

- Match Engine / Match AI logika „po cichu” przy EPIC-ach UI.
- Mutacja MatchState / EventBus / CommandBus z Canvas lub Replay.
- Łamanie Architecture Freeze PUBLIC bez AUDIT.
- Force-push na `main`, pomijanie Owner GO przy release.

---

## 3. Pipeline meczu (aktualny)

```
Pre Match (UI)
    ↓ createSessionFromFixture / createMatch
Gameplay Foundation (tactics, commands, events vocab)
    ↓
Match AI (decyzje) → Match Engine (RNG + tick) → MatchState + EventBus
    ↓
LiveMatchRuntime (web) → Canvas Renderer (LIVE)
    ↓ append MatchCanvasReadModel
Replay Buffer / Controller (REPLAY mode)
    ↓ MATCH_END
Post Match (summary + seek do zdarzeń w Replay)
```

Szczegóły: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md) · [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md)

---

## 4. Zależności modułów (skrót)

```
apps/web ──► @lastfootball/lfe ──► @lastfootball/domain
apps/web ──► Supabase (auth/data; nie LFE)
Canvas/Replay/PostMatch ──► MatchCanvasReadModel / LiveMatchRuntime (web)
Match Engine ──► Match AI (hard import w resolve)
Match AI ──► MatchState (read)
```

Canvas **nie** zależy od Engine/AI bezpośrednio.

---

## 5. Uruchamianie

```bash
npm install
npm run dev          # apps/web (Turbopack)
npm run build
npm run typecheck
npm run lint
npm test             # packages/lfe (vitest)
```

Replay/Post Match unit tests (lokalnie):

```bash
npx vitest run apps/web/src/gameplay/replay/replay01.test.ts --environment node
npx vitest run apps/web/src/components/match/post-match/post-match01.test.ts --environment node
```

Env: [`ENVIRONMENT.md`](./ENVIRONMENT.md) · Setup: [`DEV_SETUP.md`](./DEV_SETUP.md)

Prod: `https://lastfootball.vercel.app` · `/status` pokazuje `LFE_VERSION`.

---

## 6. Testowanie

| Pakiet      | Komenda                                | Co pokrywa                     |
| ----------- | -------------------------------------- | ------------------------------ |
| LFE         | `npm test`                             | EPIC-1…7, gameplay, AI, engine |
| Web         | `npm run typecheck` / `lint` / `build` | TS + Next                      |
| Replay/Post | vitest paths powyżej                   | buffer/controller/summary      |

CI na GitHub: „Format · Typecheck · Lint · Test · Build” — **Prettier** często failuje historycznie; Vercel może przejść mimo CI.

---

## 7. Release

Wzór (już użyty): **RELEASE A** LFE stack → **B** UI refresh → **C** live experience → push → Vercel.

Zasady: [`RELEASE_PROCESS.md`](./RELEASE_PROCESS.md) · [`WORKFLOW.md`](./WORKFLOW.md)

**Nie** commitować `undefined/` (śmieciowe PNG).  
**Nie** push bez Owner GO.

---

## 8. Najbliższe planowane EPIC-i

| Priorytet | EPIC                                      | Status            |
| --------- | ----------------------------------------- | ----------------- |
| 1         | Player Ratings (Post Match)               | PLANNED           |
| 2         | GDD-13 §6 Rozwój klubu                    | PLANNED (docs)    |
| 3         | Transfer / Economy / League / Multiplayer | FUTURE            |
| —         | Physics (prawdziwy ruch piłki)            | FUTURE / RESERVED |
| —         | Rules                                     | FUTURE / RESERVED |

---

## 9. Znane ograniczenia

- Spatial (`MatchSpatialState`) = głównie **kickoff**; Canvas derive pozycji z EventBus + spatial (presentation).
- Brak Physics — piłka/zawodnicy nie są symulacją kinematyczną.
- Replay = ring buffer w pamięci (brak dysku/wideo).
- `GOAL`/`SHOT`/`FOUL` mają optional `playerId`; Ratings / UI ocen jeszcze nie.
- `assists` / `minutesPlayed` / passes / karty w `PlayerStatistics` pozostają 0 (poza PLAYER-MATCH-DATA-01).
- `packages/lfe/src/index.ts` nadal **over-export** vs freeze (dług).
- Replay = ring buffer w pamięci (brak dysku/wideo).

---

## 10. Backlog techniczny

- Zawężenie PUBLIC surface LFE do freeze.
- Tick-synced spatial updates (lepszy Canvas/Replay).
- Persist Replay / Post Match.
- Subpath exports `advanced` / `testing` (freeze).

---

## 11. Miejsca szczególnej ostrożności

| Ścieżka                                        | Dlaczego                       |
| ---------------------------------------------- | ------------------------------ |
| `packages/lfe/src/match/engine/*`              | Nie ruszać przy EPIC-ach UI    |
| `packages/lfe/src/ai/*`                        | Engine zależy hard od AI       |
| `packages/lfe/src/match/domain/match-state.ts` | SSOT stanu — nie mutować z web |
| `apps/web/src/gameplay/canvas/*`               | Tylko render                   |
| `apps/web/src/gameplay/replay/*`               | Tylko nagrane modele           |
| `docs/lfe/LFE_ARCHITECTURE_FREEZE.md`          | Nie edytuj kontraktu bez AUDIT |

---

## 12. Indeks docs (kolejność)

1. Ten plik / [`HANDOFF.md`](./HANDOFF.md)
2. [`PROJECT_STATUS.md`](./PROJECT_STATUS.md) · [`ROADMAP.md`](./ROADMAP.md)
3. [`ARCHITECTURE.md`](./ARCHITECTURE.md)
4. Silnik: [`lfe/README.md`](./lfe/README.md) · [`lfe/GAMEPLAY_MATCH_STACK.md`](./lfe/GAMEPLAY_MATCH_STACK.md)
5. Web match: [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)
6. Produkt: [`game-design/README.md`](./game-design/README.md)

---

## Last updated

2026-07-24 — LFE-DOCS-SYNC-01
