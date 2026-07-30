import type { PlayerRowDto } from '@/lib/squad/types';
import { isAcademyProspect, isSeniorPlayer } from '@/lib/squad/types';
import type { LiveListingDto } from '@/lib/transfers/types';
import { SCOUTING_THIN } from '@/lib/scouting/types';

/**
 * Eligible shortlist targets (LFE-SCOUTING-01).
 * Own seniors + live listed H2H players. Academy prospects OUT.
 */
export function isEligibleShortlistTarget(
  playerId: string,
  ownPlayers: readonly PlayerRowDto[],
  liveListings: readonly LiveListingDto[],
): boolean {
  const own = ownPlayers.find((p) => p.id === playerId);
  if (own) {
    if (isAcademyProspect(own)) return false;
    return isSeniorPlayer(own);
  }
  return liveListings.some((l) => l.playerId === playerId);
}

export function canAddToShortlist(
  shortlistIds: readonly string[],
  playerId: string,
  ownPlayers: readonly PlayerRowDto[],
  liveListings: readonly LiveListingDto[],
): { ok: true } | { ok: false; error: string } {
  if (shortlistIds.includes(playerId)) {
    return { ok: false, error: 'Zawodnik jest już na shortliście.' };
  }
  if (shortlistIds.length >= SCOUTING_THIN.MAX_SHORTLIST) {
    return { ok: false, error: `Limit shortlisty: ${SCOUTING_THIN.MAX_SHORTLIST}.` };
  }
  if (!isEligibleShortlistTarget(playerId, ownPlayers, liveListings)) {
    return { ok: false, error: 'Zawodnik niedostępny dla shortlisty.' };
  }
  return { ok: true };
}
