# Architectural Decisions — Last Football

## Cel dokumentu

Najważniejsze decyzje architektoniczne. **Nie łamać bez AUDIT + Owner GO.**

## Aktualny stan

Decyzje poniżej obowiązują po LFE Architecture Freeze i GDD Faza 2 (część).

## Decyzje

### D1 — Monorepo z izolowanym LFE

**Dlaczego:** silnik musi być testowalny headless, bez UI/DB.  
**Zasada:** `packages/lfe` nie importuje React/Next/Supabase.

### D2 — `createMatch()` jedyny oficjalny entry meczu

**Dlaczego:** jeden kontrakt dla app (EPIC-6).  
**Zasada:** app nie woła `createSimulation` / deep systems w produkcji.

### D3 — `MatchSession` jedyna publiczna fasada

**Dlaczego:** ukrywa pipeline, bus, SM.  
**Zasada:** nowe możliwości = metody sesji lub komendy, nie wyciek INTERNAL.

### D4 — Commands jako ścieżka mutacji

**Dlaczego:** UI, AI, testy, replay — wspólny tor (EPIC-5).  
**Zasada:** nie mutować `MatchState` z komponentów React.

### D5 — State machine = SSOT faz

**Dlaczego:** deterministyczne lifecycle (EPIC-3).  
**Zasada:** tabele przejść INTERNAL; UI czyta `phase` ze stanu.

### D6 — Domain manager ≠ domain meczu

**Dlaczego:** inne lifecycle i pola (`packages/domain` vs `lfe/match/domain`).  
**Zasada:** nie scalać typów „dla wygody”.

### D7 — Architecture Freeze PUBLIC API v1

**Dlaczego:** stabilny kontrakt przed gameplay.  
**Zasada:** nowe PUBLIC tylko z aktualizacją freeze + Owner GO.  
**Źródło:** [`lfe/LFE_ARCHITECTURE_FREEZE.md`](./lfe/LFE_ARCHITECTURE_FREEZE.md)

### D8 — GDD jest SSOT produktu

**Dlaczego:** gameplay i UI wynikają z designu, nie odwrotnie.  
**Zasada:** Faza design = docs-only; liczby ekonomiczne później (§26).

### D9 — Match-centric core loop

**Dlaczego:** sesje 5–15 min, hub-first (GDD §3).  
**Zasada:** nie budować „dashboard-first” managera bez meczu.

### D10 — Domain factories transitional

**Dlaczego:** dziś app składa lineup przez factories LFE.  
**Cel:** app podaje `MatchSessionConfig`; silnik buduje modele.  
**Zasada:** nie rozrastać PUBLIC factories bez planu migracji.

### D11 — `getWorld()` jest ADVANCED

**Dlaczego:** wycieka world container.  
**Zasada:** UI używa `getMatchState` + `getSpatialState`.

### D12 — Physics / Rules = Future; AI/Engine shipped post-freeze

**Historyczne (freeze EPIC-1…7):** Physics / AI / Rules = future, stuby RESERVED.  
**Aktualizacja (2026-07-23):** Match AI + Match Engine + Gameplay Foundation = **DONE** (`0.9.1-match-ai01`). Physics i pełne Rules nadal FUTURE (Owner GO). Canvas/Replay = web, poza LFE.  
**Zasada:** nie udawaj gotowości w `status` bez implementacji; nie mutuj Engine przy EPIC-ach UI.

### D13 — First Match przed Hubem

**Dlaczego:** domknięcie emocji meczu przed domem menedżera (LFE-MATCH-01).  
**Zasada:** `/hub` tylko gdy `clubs.first_match_completed_at` ustawione; NEW_CLUB ≠ render Hub.  
**Wyjątek vs GDD §5.10:** udokumentowany w `platform/` + `AI/DECISIONS.md`.

### D14 — Hub EARLY_CLUB = decision screen

**Dlaczego:** GDD §23 + ochrona przed mid-season FOMO (LFE-HUB-01).  
**Zasada:** `resolveHubPhase` / `resolvePrimaryCta` SSOT; zero `dashboardMock` mid-season na EARLY_CLUB.

## Najważniejsze decyzje (meta)

Każde złamanie D1–D14 wymaga **AUDIT** i aktualizacji tego pliku + freeze/GDD/platform docs.

## Powiązania

[`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md) · [`lfe/PUBLIC_API.md`](./lfe/PUBLIC_API.md) · [`game-design/GAME_DESIGN_DOCUMENT.md`](./game-design/GAME_DESIGN_DOCUMENT.md)

## Last updated

2026-07-24 — LFE-DOCS-01
