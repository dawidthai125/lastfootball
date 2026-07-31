import type { HubNavAccess, HubPhase } from '@/lib/hub/types';

/** Nav item ids available on EARLY_CLUB (progressive disclosure). */
const EARLY_CLUB_OPEN = new Set([
  'panel',
  'club',
  'squad',
  'matches',
  'messages',
  'achievements',
  'rankings',
  'profile',
  'settings',
  'status',
]);

/** SEASON unlocks Liga + Finanse + Akademia + Sponsors. Transfers need window flag. Board/Stadium stay locked (D99). */
const SEASON_OPEN = new Set([
  ...EARLY_CLUB_OPEN,
  'league',
  'finance',
  'academy',
  'scouting',
  'sponsors',
]);

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
  // SEASON + OFFSEASON share unlock parity (D79) — Board/Stadium stay soft-locked (D99).
  if (phase === 'SEASON' || phase === 'OFFSEASON') {
    if (itemId === 'transfers') {
      return ctx.transferWindowOpen ? 'open' : 'soft_locked';
    }
    if (itemId === 'training') {
      return ctx.trainingUnlocked ? 'open' : 'soft_locked';
    }
    return SEASON_OPEN.has(itemId) ? 'open' : 'soft_locked';
  }
  // PLAYOFF / unknown: fail closed (soft-lock), never all-open.
  return 'soft_locked';
}

export function isModuleSoftLocked(
  itemId: string,
  phase: HubPhase,
  ctx: NavAccessContext = {},
): boolean {
  return resolveNavAccess(itemId, phase, ctx) === 'soft_locked';
}
