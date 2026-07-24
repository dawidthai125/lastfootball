import type { ClubDto } from '@/lib/club/types';
import { isFirstMatchCompleted } from '@/lib/club/types';

/** Lifecycle phase of the manager Hub (LFE-HUB-01). */
export type HubPhase = 'NEW_CLUB' | 'EARLY_CLUB' | 'SEASON' | 'PLAYOFF' | 'OFFSEASON';

/** Session flavor within a phase (GDD §23). */
export type HubSession = 'post_match' | 'matchday' | 'idle';

export type HubCta = {
  readonly id: string;
  readonly label: string;
  readonly href: string;
  /** soft_locked = visible but not navigable (“Wkrótce”). */
  readonly access: 'open' | 'soft_locked';
};

export type HubNavAccess = 'open' | 'soft_locked';

/**
 * Sole resolver for Hub phase. NEW_CLUB never renders `/hub` (middleware tunnel).
 * SEASON / PLAYOFF / OFFSEASON reserved until league SSOT exists.
 */
export function resolveHubPhase(club: ClubDto | null | undefined): HubPhase {
  if (!club || !isFirstMatchCompleted(club)) return 'NEW_CLUB';
  return 'EARLY_CLUB';
}

/** EARLY_CLUB defaults to idle (no live next fixture yet). */
export function resolveHubSession(phase: HubPhase): HubSession {
  if (phase === 'EARLY_CLUB') return 'idle';
  return 'idle';
}
