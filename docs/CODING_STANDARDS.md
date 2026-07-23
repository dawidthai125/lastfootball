# Coding Standards — Last Football

## Cel dokumentu

Konwencje kodu dla ludzi i agentów (Cursor / ChatGPT).

## Aktualny stan

TypeScript strict-ish monorepo; Vitest w LFE; Prettier + ESLint (web); CI `validate`.

## Opis działania / reguły

### Ogólne

- TypeScript everywhere.  
- Conventional Commits (`feat`, `docs`, `fix`, `chore`, …).  
- Nie commituj sekretów (`.env.local`).  
- Nie zmieniaj architektury „przy okazji” feature’a — najpierw AUDIT / Owner GO.

### LFE (`packages/lfe`)

- Zero React / Next / Supabase.  
- Determinizm: seeded RNG; unikaj `Date.now()` / `Math.random` w logice meczu.  
- Mutacje stanu meczu przez **commands** / systems — nie ad-hoc z UI.  
- Nowe PUBLIC exporty tylko zgodnie z Architecture Freeze.  
- Testy: `npm run test --workspace=@lastfootball/lfe`.  
- Build/typecheck: `npm run build --workspace=@lastfootball/lfe` (`tsc --noEmit`).

### Domain (`packages/domain`)

- DTO manager / persistence-facing.  
- Nie dublować pełnego modelu meczu LFE.

### Web (`apps/web`)

- App Router.  
- Import LFE tylko z `@lastfootball/lfe` (kontrakt PUBLIC).  
- UI design: [`game-design/UI_DESIGN_GUIDE.md`](./game-design/UI_DESIGN_GUIDE.md).

### GDD / docs

- Faza design: **docs-only**, bez formuł silnika, bez implementacji.  
- Po etapie GDD: raport → STOP → czekaj na GO.

### Format

- Prettier (root).  
- Nie robić commitów „tylko whitespace” mieszanych z featem.

## Najważniejsze decyzje

- Freeze > wygoda eksportów.  
- Testy chronią EPIC-y przed regresją.  
- Komentarze tylko gdy wyjaśniają niet oczywisty kontrakt.

## Powiązania

[`WORKFLOW.md`](./WORKFLOW.md) · [`DECISIONS.md`](./DECISIONS.md) · [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md) · [`CONTRIBUTING.md`](../CONTRIBUTING.md)

## Last updated

2026-07-23
