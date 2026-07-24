import type { HubNavAccess, HubPhase } from '@/lib/hub/types';

/** Nav item ids available on EARLY_CLUB Day 1 (progressive disclosure). */
const EARLY_CLUB_OPEN = new Set([
  'panel',
  'club',
  'squad',
  'messages',
  'achievements',
  'profile',
  'settings',
  'status',
]);

/**
 * Progressive unlock for shell navigation.
 * Soft-locked items stay visible with “Wkrótce” — they must not compete with Primary CTA.
 */
export function resolveNavAccess(itemId: string, phase: HubPhase): HubNavAccess {
  if (phase === 'EARLY_CLUB' || phase === 'NEW_CLUB') {
    return EARLY_CLUB_OPEN.has(itemId) ? 'open' : 'soft_locked';
  }
  return 'open';
}

export function isModuleSoftLocked(itemId: string, phase: HubPhase): boolean {
  return resolveNavAccess(itemId, phase) === 'soft_locked';
}
