# Project Status — Last Football

## Cel dokumentu

Jedno miejsce: **gdzie jesteśmy**, co zrobione, co dalej, otwarte decyzje.

## Aktualny etap projektu

**Etap:** LFE Architecture Freeze **RELEASED** na `main` (commity A–G) + GDD Faza 2 **częściowo** (do GDD-12).

**HEAD (release docs):** `5d37de9` (stan w momencie spisania; sprawdzaj `git log -1`).

| Tor | Etap |
|-----|------|
| Engine | EPIC-1…7 **DONE** · Freeze **APPROVED** · Public API v1 **zamrożone (kontrakt)** |
| Product design | GDD-01…12 **CLOSED** · następny: **GDD-13 §6 Rozwój klubu** (wymaga Owner GO) |
| App / features | Foundation shell · brak ekranu meczu |
| Infra | Monorepo + Supabase link + Vercel + CI |

## Co jest ukończone

### LFE

- EPIC-1 Foundation (tick, clock, rng, events, scheduler, world, sim loop)  
- EPIC-2 Match Domain  
- EPIC-3 Match State Machine  
- EPIC-4 Simulation Systems  
- EPIC-5 Command System  
- EPIC-6 Match Session (`createMatch` → `MatchSession`)  
- EPIC-7 Positioning (spatial read, bez fizyki)  
- Docs: epic1–7, overview, `LFE_ARCHITECTURE_FREEZE.md`  
- Audyty: AUDIT-01 Repo · AUDIT-02 Public API · AUDIT-03 Freeze  

### GDD (Faza 2)

- §3 Core loop · §4–§5 Rejestracja/klub · §7 Gracze · §8 Trening · §9 Mecz · §10 Liga · §11 Puchary · §12 Transfery · §13 Stadion · §14 Finanse · §15 Sponsorzy  
- UI Design Guide  

### Infra / app

- `apps/web` shell, `/status` → `getEngineStatus()`  
- Supabase prep, ops docs, CI gate  

## Co jest w trakcie

- **Nic blokującego implementacyjnie** po release A–G.  
- Opcjonalny dług: zawężenie `packages/lfe/src/index.ts` do PUBLIC API v1 (kontrakt już opisany; kod nadal przeeksponowany).

## Co będzie robione następne (rekomendacja)

1. **Owner GO** → GDD-13 (§6 Rozwój klubu) **albo**  
2. Pierwszy gameplay EPIC LFE (Physics / ball) **albo**  
3. Feature `match` UI consumujący `MatchSession` (bez łamania freeze)  

**Domyślna rekomendacja produktowa (z zamknięcia GDD-12):** GDD-13 przed głębokim gameplay.

## Otwarte decyzje

| ID | Temat | Status |
|----|--------|--------|
| D-01 | Kiedy zawęzić `index.ts` do freeze (chore packaging `1.0.0`) | Otwarte |
| D-02 | Następny tor: GDD-13 vs LFE Physics vs Match UI | Czeka na Owner GO |
| D-03 | Entry points `@lastfootball/lfe/advanced` + `/testing` | Zaplanowane w freeze, niezaimplementowane |
| D-04 | Domain factories transitional → engine builds models | Zaakceptowane kierunkowo; brak EPIC migracji |

## Najbliższy EPIC

| Kandydat | Warunek |
|----------|---------|
| **GDD-13** (§6) | Owner GO (docs-only) |
| LFE Physics / ball movement | Owner GO + nie łamie PUBLIC v1 bez AUDIT |
| App Match Live UI | Po jasnym kontrakcie spatial + session (już jest) |

**Najbliższy EPIC silnika (gdy GO na gameplay):** Physics (RESERVED `physics/`) — po zamknięciu designu potrzebnego z GDD §9.

## Powiązania

[`ROADMAP.md`](./ROADMAP.md) · [`lfe/CURRENT_STATUS.md`](./lfe/CURRENT_STATUS.md) · [`game-design/ROADMAP.md`](./game-design/ROADMAP.md) · [`HANDOFF.md`](./HANDOFF.md)

## Last updated

2026-07-23
