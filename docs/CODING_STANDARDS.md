# Coding Standards — Last Football

## Cel dokumentu

Konwencje kodu dla ludzi i agentów (Cursor / ChatGPT).

## Aktualny stan

TypeScript monorepo; Vitest w LFE (+ testy web replay/post-match); Prettier + ESLint (web); CI Format→Build zielony.

## Opis działania / reguły

### Ogólne

- TypeScript everywhere.
- Conventional Commits (`feat`, `docs`, `fix`, `chore`, …).
- Nie commituj sekretów (`.env.local`).
- Nie zmieniaj architektury „przy okazji” feature’a — najpierw AUDIT / Owner GO.
- **REUSE FIRST** — rozszerzaj istniejący moduł / publiczne API zamiast tworzyć równoległą implementację.
- **ZERO DUPLICATE LOGIC** — decyzje AI, statystyki meczu, drabina Engine żyją w LFE; web ich nie kopiuje.

### LFE (`packages/lfe`)

- Zero React / Next / Supabase / DOM.
- **Determinizm:** seeded RNG; unikaj `Date.now()` / `Math.random` w logice meczu.
- Mutacje stanu meczu przez **commands** / systems — nie ad-hoc z UI.
- Atrybucja zawodnika (Player Match Data): bez dodatkowego `rng.next()` (deterministyczny picker).
- Nowe PUBLIC exporty tylko zgodnie z Architecture Freeze.
- Testy: `npm run test --workspace=@lastfootball/lfe`.
- Typecheck: `npm run typecheck --workspace=@lastfootball/lfe`.

### Domain (`packages/domain`)

- DTO manager / persistence-facing.
- Nie dublować pełnego modelu meczu LFE.

### Web (`apps/web`)

- App Router.
- Import LFE tylko z `@lastfootball/lfe` (kontrakt PUBLIC).
- UI design: [`game-design/UI_DESIGN_GUIDE.md`](./game-design/UI_DESIGN_GUIDE.md).
- **Canvas** (`gameplay/canvas/*`, `canvas-host.ts`): tylko read `MatchCanvasReadModel`; **zakaz** Engine/AI/CommandBus.
- **Replay** (`gameplay/replay/*`): tylko nagrane modele; **zakaz** `session.run` / Engine.
- **Post Match**: buduje summary z state/events; seek przez publiczne API Replay.
- **Live Bridge** (`live-match-runtime.ts`, `LiveMatchFoundation.tsx`): jedyne miejsce spinające LIVE pulse + buffer + present + Post Match UI.
- Testy lokalne:
  ```bash
  npx vitest run apps/web/src/gameplay/replay/replay01.test.ts --environment node
  npx vitest run apps/web/src/components/match/post-match/post-match01.test.ts --environment node
  ```

### GDD / docs

- Faza design: **docs-only**, bez formuł silnika, bez implementacji.
- Po etapie GDD: raport → STOP → czekaj na GO.
- **SSOT FIRST** — aktualizuj istniejący dokument; nowy plik tylko gdy nie dubluje.

### Format

- Prettier (root) — `npm run format` / `format:check`.
- Nie mieszać „tylko whitespace” z feat bez osobnego chore (wzorzec: LFE-CI-PRETTIER-01).

## Najważniejsze decyzje

- Freeze > wygoda eksportów.
- Testy chronią EPIC-y przed regresją.
- Komentarze tylko gdy wyjaśniają nieoczywisty kontrakt.
- MatchState jest SSOT — UI nie utrzymuje drugiej prawdy o wyniku meczu.

## Powiązania

[`AI-HANDOFF.md`](./AI-HANDOFF.md) · [`WORKFLOW.md`](./WORKFLOW.md) · [`DECISIONS.md`](./DECISIONS.md) · [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)

## Last updated

2026-07-24 — AI-DOCS-CONSOLIDATION-01
