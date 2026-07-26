# MASTER HANDOFF — Last Football

## Cel

Kompletne przekazanie projektu dla nowego ChatGPT / Cursor / developera.  
**Nie wymagana** historia czatu ani analiza całej historii commitów.

**Baseline:** wyłącznie [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) (feature **LFE-TRANSFERS-08** · `9b1c575`) — nie kopiuj hashy tutaj przy kolejnych CLOSE.

---

## 1. Production Baseline

| Pole             | Wartość                                                                        |
| ---------------- | ------------------------------------------------------------------------------ |
| Prod URL         | https://lastfootball.vercel.app                                                |
| Feature baseline | **patrz** [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md)                 |
| Status           | **PRODUCTION VERIFIED · GREEN**                                                |
| App              | `@lastfootball/web` 0.1.0 · LFE `0.9.1-match-ai01`                             |
| Supabase         | `anoeimngwptucjdugjme` (players · transfers · transfer_offers · training Thin) |
| CI               | Format · Typecheck · Lint · Test · Build · Secret scan                         |
| Hosting          | Vercel Production                                                              |

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

### Zakończone / planned

**SSOT listy EPIC:** [`ROADMAP.md`](./ROADMAP.md) (nie duplikuj tutaj).

**Next:** Owner wybiera (GDD-16+ · §26 · negotiation · calendar · Training depth).

---

## 6. SSOT map

| Domain                | SSOT                                                |
| --------------------- | --------------------------------------------------- |
| Product intent        | GDD (`game-design/GAME_DESIGN_DOCUMENT.md`)         |
| LFE PUBLIC API        | `lfe/LFE_ARCHITECTURE_FREEZE.md`                    |
| Club identity         | `clubs` → `ClubDto`                                 |
| Hub unlock            | `first_match_completed_at`                          |
| Hub phase / Primary   | `resolveHubPhase` / `resolvePrimaryCta`             |
| League fixtures       | `fixtures` → `FixtureDto`                           |
| League table          | `resolveLeagueTable` → `LeagueTableDto` (D17)       |
| Club cash             | `clubs.cash_balance` (D18)                          |
| Finance history       | `finance_movements` (D18)                           |
| Finance UI            | `resolveClubFinance` → `ClubFinanceDto` (D18)       |
| Club roster           | `players` (D19)                                     |
| Squad UI              | `resolveClubSquad(club, rows)` → `SquadDto` (D19)   |
| Transfer window       | `clubs.transfer_window_open` (D20)                  |
| Transfer market UI    | `resolveTransferMarket` → `TransferMarketDto` (D20) |
| Transfer deals        | `transfer_deals` (D20)                              |
| Training day          | `clubs.last_training_on` (D21)                      |
| Training UI           | `resolveClubTraining` → `TrainingDto` (D21)         |
| Played unlock helper  | `hasPlayedUnlock` / played fixture count (D21)      |
| Match state           | `MatchState` + `EventBus` via `MatchSession`        |
| Agent onboarding      | `docs/AI/START_HERE.md`                             |
| Principles / patterns | `AI/ARCHITECTURE_PRINCIPLES` · `AI/COMMON_PATTERNS` |

---

## 7. Flows

### Onboarding

[`platform/ONBOARDING_FLOW.md`](./platform/ONBOARDING_FLOW.md)

### First Match

[`platform/FIRST_MATCH.md`](./platform/FIRST_MATCH.md)

### Hub

[`platform/HUB.md`](./platform/HUB.md)

### League · Finance · Players · Transfers · Training

[`platform/LEAGUE.md`](./platform/LEAGUE.md) · [`FINANCE.md`](./platform/FINANCE.md) · [`PLAYERS.md`](./platform/PLAYERS.md) · [`TRANSFERS.md`](./platform/TRANSFERS.md) · [`TRAINING.md`](./platform/TRAINING.md)

### Match UI pipeline

[`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

---

## 8. Supabase

- Auth email/password; callback `/auth/callback`
- Table `clubs` (owner RLS) + `first_match_completed_at` + **`cash_balance`** + **`transfer_window_open`** + **`last_training_on`**
- Table `fixtures` (owner RLS via club) — LFE-LEAGUE-01 Thin A **applied**
- Table `finance_movements` (owner RLS via club) — LFE-ECONOMY-01 **applied** (+ transfer cats)
- Table `players` (owner RLS via club) — LFE-PLAYERS-01 **applied** (+ `departed_at` / `DEPARTED`)
- Table `transfer_deals` (owner RLS via club) — LFE-TRANSFERS-01 **applied**
- Training Thin — LFE-TRAINING-01 **applied** (`last_training_on`)
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (secret — never commit)
- Status: [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md)

---

## 9. ADR / decyzje

[`DECISIONS.md`](./DECISIONS.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md)

Kluczowe: LFE izolowany; CommandBus; First Match przed Hubem; Hub = decision screen; clubs table SSOT; league table = pure derive (D17); club cash + `resolveClubFinance` (D18); players + `resolveClubSquad` (D19); transfers Thin (D20); **training Thin + `resolveClubTraining` (D21)**.

---

## 10. Zasady implementacji

REUSE FIRST · ZERO DUPLICATE · SSOT FIRST · Owner GO na commit/push · Canvas/Replay read-only · nie łamać Freeze bez AUDIT.

---

## 11. Workflow Owner → Cursor

[`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md) · [`WORKFLOW.md`](./WORKFLOW.md)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CI → CLOSE
```

---

## 12. Jak prowadzić kolejny EPIC

1. `AI/AI_QUICK_START.md` → `AI/START_HERE.md` → baseline → principles → patterns → workflow.
2. AUDIT w kodzie (nie czat).
3. PLAN M1–Mn + poza zakresem + AC.
4. Owner GO → IMPLEMENT → VALIDATION → GO COMMIT → GO PUSH → **CI GREEN** → CLOSE.
5. CLOSE: aktualizuj **ROADMAP** + **CURRENT_BASELINE** feature hash (+ CHANGELOG).

---

## Last updated

2026-07-26 — AI-DOCS-CONSOLIDATION-02
