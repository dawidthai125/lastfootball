import type { ClubDto } from '@/lib/club/types';
import { isFirstMatchCompleted } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';

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

export type HubCtaContext = {
  readonly nextFixture: FixtureDto | null;
  readonly lastPlayedFixture?: FixtureDto | null;
  readonly hasFixtures?: boolean;
};

/**
 * Sole resolver for Hub phase. NEW_CLUB never renders `/hub` (middleware tunnel).
 * SEASON / PLAYOFF / OFFSEASON reserved until full league slice (Thin A stays EARLY_CLUB).
 */
export function resolveHubPhase(club: ClubDto | null | undefined): HubPhase {
  if (!club || !isFirstMatchCompleted(club)) return 'NEW_CLUB';
  return 'EARLY_CLUB';
}

/**
 * Session within phase — driven by fixtures SSOT (not UI).
 * matchday: upcoming fixture exists
 * post_match: no upcoming but a played fixture exists (between matches / slate done)
 * idle: otherwise
 */
export function resolveHubSession(
  phase: HubPhase,
  nextFixture: FixtureDto | null = null,
  lastPlayedFixture: FixtureDto | null = null,
): HubSession {
  if (phase !== 'EARLY_CLUB') return 'idle';
  if (nextFixture?.status === 'upcoming') return 'matchday';
  if (lastPlayedFixture?.status === 'played') return 'post_match';
  return 'idle';
}
