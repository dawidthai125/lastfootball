# MASTER HANDOFF — Last Football

## Cel

Mapa przekazania projektu (architektura, SSOT domen, flows).  
**Status „gdzie jesteśmy”:** wyłącznie [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).  
**Feature baseline / docs tip:** wyłącznie [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) — **nie kopiuj hashy tutaj**.  
**Master kontekst sesji AI (15 sekcji):** [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md).

**Cold start AI:** [`AGENTS.md`](../AGENTS.md) → [`AI/AI_QUICK_START.md`](./AI/AI_QUICK_START.md) → [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md) → [`AI/START_HERE.md`](./AI/START_HERE.md).

---

## 1. Production (pointery)

| Pole                        | Gdzie                                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| Status projektu             | [`PROJECT_STATUS.md`](./PROJECT_STATUS.md)                                    |
| Feature baseline + docs tip | [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)                          |
| Master handoff AI           | [`AI/PROJECT_HANDOFF.md`](./AI/PROJECT_HANDOFF.md)                            |
| Lista EPIC                  | [`ROADMAP.md`](./ROADMAP.md) · skrót [`AI/EPIC_INDEX.md`](./AI/EPIC_INDEX.md) |
| Prod URL                    | https://lastfootball.vercel.app                                               |

---

## 2. Architektura (skrót)

```
Browser → Next.js apps/web
            ├─ Auth / middleware / Club DTO (+ cash, transfer_window, last_training_on)
            ├─ Onboarding + First Match tunnel
            ├─ Hub decision (EARLY_CLUB / SEASON) + league + finance + squad + transfers + training
            └─ Match UI → LiveMatchRuntime → packages/lfe
Supabase ← Auth + clubs + fixtures + finance_movements + players + transfer_deals + transfer_offers
```

Szczegóły: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/ARCHITECTURE_RULES.md`](./AI/ARCHITECTURE_RULES.md) · [`AI/MODULE_MAP.md`](./AI/MODULE_MAP.md)

---

## 3. Stack

- **Frontend:** Next.js 15 App Router, TypeScript, CSS variables / design tokens
- **Backend data:** Supabase Auth + Postgres (RLS)
- **Engine:** `@lastfootball/lfe` (headless, vitest)
- **Deploy:** Vercel
- **Monorepo:** npm workspaces

---

## 4. Struktura repo

| Path              | Role                |
| ----------------- | ------------------- |
| `apps/web`        | Product UI          |
| `packages/lfe`    | Match engine        |
| `packages/domain` | Shared DTOs         |
| `supabase/`       | Migrations + README |
| `docs/`           | Documentation SSOT  |
| `AGENTS.md`       | AI entry pointer    |

---

## 5. EPICs

**SSOT listy:** [`ROADMAP.md`](./ROADMAP.md).  
**Next:** Owner wybiera — pointer w [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).

---

## 6. SSOT map

| Domain                | SSOT                                                             |
| --------------------- | ---------------------------------------------------------------- |
| Product intent        | GDD (`game-design/GAME_DESIGN_DOCUMENT.md`)                      |
| UI presentation       | `game-design/UI_DESIGN_GUIDE.md` §16                             |
| LFE PUBLIC API        | `lfe/LFE_ARCHITECTURE_FREEZE.md`                                 |
| Club identity         | `clubs` → `ClubDto`                                              |
| Hub unlock            | `first_match_completed_at`                                       |
| Hub phase / CTA       | `resolveHubPhase` / `resolvePrimaryCta` / `resolveSecondaryCtas` |
| League fixtures       | `fixtures` → `FixtureDto`                                        |
| League table          | `resolveLeagueTable` → `LeagueTableDto` (D17)                    |
| Club cash             | `clubs.cash_balance` (D18)                                       |
| Finance UI            | `resolveClubFinance` → `ClubFinanceDto` (D18)                    |
| Club roster           | `players` (D19)                                                  |
| Squad UI              | `resolveClubSquad` → `SquadDto` (D19)                            |
| Transfer market UI    | `resolveTransferMarket` → `TransferMarketDto` (D20)              |
| Training UI           | `resolveClubTraining` → `TrainingDto` (D21)                      |
| Match state           | `MatchState` + `EventBus` via `MatchSession`                     |
| Agent onboarding      | `docs/AI/START_HERE.md`                                          |
| Project status        | `docs/PROJECT_STATUS.md`                                         |
| Principles / patterns | `AI/ARCHITECTURE_PRINCIPLES` · `AI/COMMON_PATTERNS`              |

---

## 7. Flows

[`platform/ONBOARDING_FLOW.md`](./platform/ONBOARDING_FLOW.md) · [`FIRST_MATCH.md`](./platform/FIRST_MATCH.md) · [`HUB.md`](./platform/HUB.md) · [`LEAGUE.md`](./platform/LEAGUE.md) · [`FINANCE.md`](./platform/FINANCE.md) · [`PLAYERS.md`](./platform/PLAYERS.md) · [`TRANSFERS.md`](./platform/TRANSFERS.md) · [`TRAINING.md`](./platform/TRAINING.md) · [`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

---

## 8. Supabase (orientacja)

Auth + `clubs` (+ cash / window / training day) · `fixtures` · `finance_movements` · `players` · `transfer_deals` · `transfer_offers`.  
Status połączeń: [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md).  
Nigdy nie commituj sekretów `.env`.

---

## 9. ADR / decyzje

[`DECISIONS.md`](./DECISIONS.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md)

---

## 10. Zasady implementacji

REUSE FIRST · ZERO DUPLICATE · SSOT FIRST · RESOLVER FIRST · Owner GO · Canvas/Replay read-only · UI EPIC → Guide §16.

---

## 11. Workflow

[`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md) · [`WORKFLOW.md`](./WORKFLOW.md)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

CLOSE: aktualizuj **ROADMAP** · **PROJECT_STATUS** · **CURRENT_BASELINE** (feature hash **lub** docs tip) · CHANGELOG.

---

## Last updated

2026-07-29 — LFE-HANDOFF-01 (pointer → PROJECT_HANDOFF; bez kopiowania hashy)
