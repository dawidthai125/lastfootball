import type { HubNavAccess, HubPhase } from '@/lib/hub/types';

/** Nav item ids available on EARLY_CLUB (progressive disclosure). */
const EARLY_CLUB_OPEN = new Set([
  'panel',
  'club',
  'squad',
  'matches',
  'messages',
  'achievements',
  'profile',
  'settings',
  'status',
]);

/** SEASON unlocks Liga + Finanse on top of EARLY_CLUB opens. Transfers need window flag. */
const SEASON_OPEN = new Set([...EARLY_CLUB_OPEN, 'league', 'finance']);

export type NavAccessContext = {
  readonly transferWindowOpen?: boolean;
  /** Derived: played fixtures >= training unlock threshold. */
  readonly trainingUnlocked?: boolean;
};

/**
 * Progressive unlock for shell navigation.
 * Soft-locked items stay visible with “Wkrótce” — they must not compete with Primary CTA.
 */
export function resolveNavAccess(
  itemId: string,
  phase: HubPhase,
  ctx: NavAccessContext = {},
): HubNavAccess {
  if (phase === 'NEW_CLUB') {
    return EARLY_CLUB_OPEN.has(itemId) ? 'open' : 'soft_locked';
  }
  if (phase === 'EARLY_CLUB') {
    return EARLY_CLUB_OPEN.has(itemId) ? 'open' : 'soft_locked';
  }
  if (phase === 'SEASON') {
    if (itemId === 'transfers') {
      return ctx.transferWindowOpen ? 'open' : 'soft_locked';
    }
    if (itemId === 'training') {
      return ctx.trainingUnlocked ? 'open' : 'soft_locked';
    }
    return SEASON_OPEN.has(itemId) ? 'open' : 'soft_locked';
  }
  return 'open';
}

export function isModuleSoftLocked(
  itemId: string,
  phase: HubPhase,
  ctx: NavAccessContext = {},
): boolean {
  return resolveNavAccess(itemId, phase, ctx) === 'soft_locked';
}
