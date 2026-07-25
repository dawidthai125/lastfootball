# MASTER HANDOFF — Last Football

## Cel

Kompletne przekazanie projektu dla nowego ChatGPT / Cursor / developera.  
**Nie wymagana** historia czatu ani analiza całej historii commitów.

**Baseline:** [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · commit `0b960b5` · LFE-PLAYERS-01 CLOSED · 2026-07-25

---

## 1. Production Baseline

| Pole     | Wartość                                                                        |
| -------- | ------------------------------------------------------------------------------ |
| Prod URL | https://lastfootball.vercel.app                                                |
| Commit   | `0b960b543d6640116424560c635417a5b59de9c5`                                     |
| Message  | feat(players): persist club roster SSOT with resolveClubSquad (LFE-PLAYERS-01) |
| Status   | **PRODUCTION VERIFIED · GREEN** (prettier follow-up `d43fa3d`)                 |
| App      | `@lastfootball/web` 0.1.0 · LFE `0.9.1-match-ai01`                             |
| Supabase | `anoeimngwptucjdugjme` (+ fixtures + cash/finance + **players** applied)       |
| CI       | Format · Typecheck · Lint · Test · Build                                       |
| Hosting  | Vercel Production                                                              |

---

## 2. Architektura (skrót)

```
Browser → Next.js apps/web
            ├─ Auth / middleware / Club DTO (+ cash_balance)
            ├─ Onboarding + First Match tunnel
            ├─ Hub decision (EARLY_CLUB / SEASON) + fixtures + league + finance + squad
            └─ Match UI → LiveMatchRuntime → packages/lfe
Supabase ← Auth + clubs + fixtures + finance_movements + players
```

Szczegóły: [`ARCHITECTURE.md`](./ARCHITECTURE.md) · [`AI/ARCHITECTURE_RULES.md`](./AI/ARCHITECTURE_RULES.md)

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

### Zakończone (kod na `main`)

**Platforma:** LFE-PLATFORM-01 P1–P3 · LFE-INFRA-01 · LFE-MATCH-01 · LFE-HUB-01 · LFE-DOCS-01 · **LFE-LEAGUE-01 Thin A (CLOSED)** · **LFE-LEAGUE-02 (CLOSED)** · **LFE-ECONOMY-01 (CLOSED)** · **LFE-PLAYERS-01 (CLOSED)**

**Silnik/UI meczu:** LFE EPIC-1…7 · Gameplay · AI · Engine · Player Match Data · Canvas · Replay · Post Match · Live Bridge · Ratings · CI Prettier

**Design docs:** GDD-01…15

### Aktywne

Brak otwartego EPIC implementacyjnego.

### Next Recommended EPIC

**GDD-16+** lub **Transfers** / **Training** (Owner wybiera). GDD §26 zastąpi stałe Thin ekonomii.

### Typowe następne

GDD-16+ · §26 balance · Transfers · Training · 11-fixture calendar (opt.) · LFE PUBLIC export trim · Physics (FUTURE)

---

## 6. SSOT map

| Domain              | SSOT                                              |
| ------------------- | ------------------------------------------------- |
| Product intent      | GDD (`game-design/GAME_DESIGN_DOCUMENT.md`)       |
| LFE PUBLIC API      | `lfe/LFE_ARCHITECTURE_FREEZE.md`                  |
| Club identity       | `clubs` → `ClubDto`                               |
| Hub unlock          | `first_match_completed_at`                        |
| Hub phase / Primary | `resolveHubPhase` / `resolvePrimaryCta`           |
| League fixtures     | `fixtures` → `FixtureDto`                         |
| League table        | `resolveLeagueTable` → `LeagueTableDto` (D17)     |
| Club cash           | `clubs.cash_balance` (D18)                        |
| Finance history     | `finance_movements` (D18)                         |
| Finance UI          | `resolveClubFinance` → `ClubFinanceDto` (D18)     |
| Club roster         | `players` (D19)                                   |
| Squad UI            | `resolveClubSquad(club, rows)` → `SquadDto` (D19) |
| Match state         | `MatchState` + `EventBus` via `MatchSession`      |
| Agent onboarding    | `docs/AI/START_HERE.md`                           |

---

## 7. Flows

### Onboarding

[`platform/ONBOARDING_FLOW.md`](./platform/ONBOARDING_FLOW.md)

### First Match

[`platform/FIRST_MATCH.md`](./platform/FIRST_MATCH.md)

### Hub State Machine

[`platform/HUB.md`](./platform/HUB.md)

### Match UI pipeline

[`web/MATCH_UI_PIPELINE.md`](./web/MATCH_UI_PIPELINE.md)

---

## 8. Supabase

- Auth email/password; callback `/auth/callback`
- Table `clubs` (owner RLS) + `first_match_completed_at` + **`cash_balance`**
- Table `fixtures` (owner RLS via club) — LFE-LEAGUE-01 Thin A **applied**
- Table `finance_movements` (owner RLS via club) — LFE-ECONOMY-01 **applied**
- Table `players` (owner RLS via club) — LFE-PLAYERS-01 **applied**
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (secret — never commit)
- Status: [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md)

---

## 9. ADR / decyzje

[`DECISIONS.md`](./DECISIONS.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md)

Kluczowe: LFE izolowany; CommandBus; First Match przed Hubem; Hub = decision screen; clubs table SSOT; league table = pure derive (D17); club cash + `resolveClubFinance` (D18); **players + `resolveClubSquad` (D19)**.

---

## 10. Zasady implementacji

REUSE FIRST · ZERO DUPLICATE · SSOT FIRST · Owner GO na commit/push · Canvas/Replay read-only · nie łamać Freeze bez AUDIT.

---

## 11. Workflow Owner → Cursor

[`AI/EPIC_WORKFLOW.md`](./AI/EPIC_WORKFLOW.md) · [`WORKFLOW.md`](./WORKFLOW.md)

```
AUDIT → PLAN → OWNER GO → IMPLEMENT → VALIDATION → COMMIT → PUSH → CLOSE
```

---

## 12. Jak prowadzić kolejny EPIC

1. Przeczytaj `AI/START_HERE.md` + baseline.
2. AUDIT zakresu w kodzie (nie zgaduj z czatu).
3. PLAN z M1–Mn + poza zakresem + AC.
4. Czekaj na Owner GO.
5. IMPLEMENT → raport → GO COMMIT → GO PUSH → smoke → CLOSE.
6. Zaktualizuj status docs (STATUS / ROADMAP / BASELINE / CHANGELOG).

---

## Last updated

2026-07-25 — LFE-PLAYERS-01 CLOSE
