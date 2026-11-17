# LFE-RETIREMENT-01 — Thin farewell (PLAN)

**EPIC:** LFE-RETIREMENT-01  
**Typ:** Information Thin · post–Confirm N+1 farewell  
**Owner GO:** granted (implement)  
**Tip main:** `~3b83e48`  
**Branch:** `feat/retirement-farewell`

---

## IN

- Information Thin farewell **after Confirm N+1** when someone actually departed.
- **REUSE** `planSeasonDeparture` / `resolveDeparturePreview` / existing **DEPARTED** mutation in `openNextSeasonAfterDeparture` (sole mutate path).
- Pure `resolveRetirementFarewell` + farewell names returned from open/confirm.
- Messages optional `retirementFarewell?: { subject: string } | null` → `/hub`.
- Hub banner: who left (+ promote if any), once after Confirm.
- Tests for pure helpers + messages item.
- ROADMAP one-line update.

## OUT

- New age tables · cash/XP · Prestige · Prime buff · Academy depth · push/email
- Inventing thresholds (keep **age ≥ 38** from `departure.ts`)
- Tickets · playing matches · second mutation path

## Success

- Hub / Messages show who left (+ promote if any) once after Confirm.
- No second mutation path — only existing Confirm → `openNextSeasonAfterDeparture` DEPARTED write.
- No schema migration; farewell from action DTO and/or derive on today’s `departed_at` / `promoted_at`.

## Wire (Thin)

1. `openNextSeasonAfterDeparture` → `{ ok: true, farewell: { retireName, promoteName } | null }`.
2. `confirmStartNextSeason` returns farewell in `ConfirmStartNextSeasonState`; `revalidatePath`; no bare redirect that drops DTO (client keeps banner via `useActionState`).
3. Hub: banner from action state and/or server `resolveRetirementFarewell` for today’s transition flash.
4. Messages / layout: pass `retirementFarewell` into `resolveClubMessages` when flash resolves.
