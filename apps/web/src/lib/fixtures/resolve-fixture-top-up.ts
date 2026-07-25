import type { PlannedFixture } from '@/lib/fixtures/plan-fixtures';

export type ExistingFixtureRef = {
  readonly matchday: number;
  readonly status: string;
};

export type FixtureInsertRow = {
  readonly matchday: number;
  readonly opponentClubId: string;
  readonly isHome: boolean;
  readonly status: 'upcoming' | 'scheduled';
};

/**
 * Pure top-up: missing matchdays only, identity from `plan` (planClubFixtures).
 * Never overwrites existing matchdays. Never invents opponents / home-away.
 *
 * Status rules:
 * - Empty club: use plan statuses (MD1 upcoming, rest scheduled).
 * - Non-empty: insert missing as scheduled; if club has no upcoming, lowest
 *   missing matchday becomes upcoming (season continuation after short slate).
 */
export function resolveFixtureTopUp(
  plan: readonly PlannedFixture[],
  existing: readonly ExistingFixtureRef[],
): readonly FixtureInsertRow[] {
  const have = new Set(existing.map((f) => f.matchday));
  const missing = plan.filter((p) => !have.has(p.matchday));
  if (missing.length === 0) return [];

  if (existing.length === 0) {
    return missing.map((p) => ({
      matchday: p.matchday,
      opponentClubId: p.opponentClubId,
      isHome: p.isHome,
      status: p.status,
    }));
  }

  const hasUpcoming = existing.some((f) => f.status === 'upcoming');
  const sorted = [...missing].sort((a, b) => a.matchday - b.matchday);
  const promoteMatchday = hasUpcoming ? null : (sorted[0]?.matchday ?? null);

  return sorted.map((p) => ({
    matchday: p.matchday,
    opponentClubId: p.opponentClubId,
    isHome: p.isHome,
    status: p.matchday === promoteMatchday ? ('upcoming' as const) : ('scheduled' as const),
  }));
}
