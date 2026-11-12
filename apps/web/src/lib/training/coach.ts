/** One coach, one attribute group. Extra training yield applies only in that group. */

import { bumpGroup, type AttrGroups } from '@/lib/squad/truth';

export const COACH_GROUPS = ['attack', 'passing', 'defense', 'physical', 'goalkeeping'] as const;
export type CoachGroup = (typeof COACH_GROUPS)[number];

export const COACH_THIN = { HIRE_FEE: 8_000, EXTRA_GROUP_DELTA: 1 } as const;

export function isCoachGroup(value: unknown): value is CoachGroup {
  return COACH_GROUPS.some((group) => group === value);
}

export function hireCoach(input: {
  readonly cash: number;
  readonly current: CoachGroup | null;
  readonly next: unknown;
}):
  | { ok: true; group: CoachGroup; fee: number; cashAfter: number }
  | { ok: false; reason: 'cash' | 'group' } {
  if (!isCoachGroup(input.next)) return { ok: false, reason: 'group' };
  if (input.current === input.next) {
    return { ok: true, group: input.next, fee: 0, cashAfter: input.cash };
  }
  if (!Number.isFinite(input.cash) || input.cash < COACH_THIN.HIRE_FEE) {
    return { ok: false, reason: 'cash' };
  }
  return {
    ok: true,
    group: input.next,
    fee: COACH_THIN.HIRE_FEE,
    cashAfter: input.cash - COACH_THIN.HIRE_FEE,
  };
}

export function applyCoachYield<
  T extends { readonly groups?: AttrGroups; readonly potential: number },
>(player: T, coach: CoachGroup | null, trainedGroup: CoachGroup | null): T {
  if (coach === null || trainedGroup === null || coach !== trainedGroup) return player;
  if (player.groups === undefined) return player;
  const groups = bumpGroup(
    player.groups,
    trainedGroup,
    COACH_THIN.EXTRA_GROUP_DELTA,
    player.potential,
  );
  return { ...player, groups };
}
