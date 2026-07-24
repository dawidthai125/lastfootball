# MASTER HANDOFF — Last Football

## Cel

Kompletne przekazanie projektu dla nowego ChatGPT / Cursor / developera.  
**Nie wymagana** historia czatu ani analiza całej historii commitów.

**Baseline:** [`AI/CURRENT_BASELINE.md`](./AI/CURRENT_BASELINE.md) · commit `b6b92dc` · 2026-07-24

---

## 1. Production Baseline

| Pole | Wartość |
| --- | --- |
| Prod URL | https://lastfootball.vercel.app |
| Commit | `b6b92dce1fc9e0bf75fb48cc82a1e5ad570a327a` |
| Message | feat(hub): rebuild EARLY_CLUB decision Hub (LFE-HUB-01) |
| App | `@lastfootball/web` 0.1.0 · LFE `0.9.1-match-ai01` |
| Supabase | `anoeimngwptucjdugjme` |
| CI | Format · Typecheck · Lint · Test · Build |
| Hosting | Vercel Production |

---

## 2. Architektura (skrót)

```
Browser → Next.js apps/web
            ├─ Auth / middleware / Club DTO
            ├─ Onboarding + First Match tunnel
            ├─ Hub EARLY_CLUB (decision screen)
            └─ Match UI → LiveMatchRuntime → packages/lfe
Supabase ← Auth + clubs (+ future tables)
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

| Path | Role |
| --- | --- |
| `apps/web` | Product UI |
| `packages/lfe` | Match engine |
| `packages/domain` | Shared DTOs |
| `supabase/` | Migrations + README |
| `docs/` | Documentation SSOT |
| `AGENTS.md` | AI entry pointer |

---

## 5. EPICs

### Zakończone (kod na `main`)

**Platforma:** LFE-PLATFORM-01 P1–P3 · LFE-INFRA-01 · LFE-MATCH-01 · LFE-HUB-01  

**Silnik/UI meczu:** LFE EPIC-1…7 · Gameplay · AI · Engine · Player Match Data · Canvas · Replay · Post Match · Live Bridge · Ratings · CI Prettier  

**Design docs:** GDD-01…15  

### Aktywne

Brak otwartego EPIC implementacyjnego (po HUB-01).

### Typowe następne

League fixtures SSOT · GDD-16+ · Economy/Transfers · LFE PUBLIC export trim · Physics (FUTURE)

---

## 6. SSOT map

| Domain | SSOT |
| --- | --- |
| Product intent | GDD (`game-design/GAME_DESIGN_DOCUMENT.md`) |
| LFE PUBLIC API | `lfe/LFE_ARCHITECTURE_FREEZE.md` |
| Club identity | `clubs` → `ClubDto` |
| Hub unlock | `first_match_completed_at` |
| Hub phase / Primary | `resolveHubPhase` / `resolvePrimaryCta` |
| Match state | `MatchState` + `EventBus` via `MatchSession` |
| Agent onboarding | `docs/AI/START_HERE.md` |

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
- Table `clubs` (owner RLS) + `first_match_completed_at`
- Env: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (secret — never commit)
- Status: [`CONNECTION_STATUS.md`](./CONNECTION_STATUS.md)

---

## 9. ADR / decyzje

[`DECISIONS.md`](./DECISIONS.md) · [`AI/DECISIONS.md`](./AI/DECISIONS.md)

Kluczowe: LFE izolowany; CommandBus; First Match przed Hubem; Hub = decision screen; clubs table SSOT.

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

2026-07-24 — LFE-DOCS-01
