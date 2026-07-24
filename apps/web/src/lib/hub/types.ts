import type { ClubDto } from '@/lib/club/types';
import { isFirstMatchCompleted } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';

/** Lifecycle phase of the manager Hub (LFE-HUB-01 / LFE-LEAGUE-02). */
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

export type HubPhaseContext = {
  /** S1: fixtures slate exists → SEASON after First Match. */
  readonly hasFixtures?: boolean;
};

export type HubCtaContext = {
  readonly nextFixture: FixtureDto | null;
  readonly lastPlayedFixture?: FixtureDto | null;
  readonly hasFixtures?: boolean;
};

/**
 * Sole resolver for Hub phase.
 * S1 (LFE-LEAGUE-02): first match + fixtures → SEASON; first match + no fixtures → EARLY_CLUB.
 */
export function resolveHubPhase(
  club: ClubDto | null | undefined,
  ctx: HubPhaseContext = {},
): HubPhase {
  if (!club || !isFirstMatchCompleted(club)) return 'NEW_CLUB';
  if (ctx.hasFixtures) return 'SEASON';
  return 'EARLY_CLUB';
}

/**
 * Session within phase — driven by fixtures SSOT (not UI).
 * Applies to EARLY_CLUB and SEASON.
 */
export function resolveHubSession(
  phase: HubPhase,
  nextFixture: FixtureDto | null = null,
  lastPlayedFixture: FixtureDto | null = null,
): HubSession {
  if (phase !== 'EARLY_CLUB' && phase !== 'SEASON') return 'idle';
  if (nextFixture?.status === 'upcoming') return 'matchday';
  if (lastPlayedFixture?.status === 'played') return 'post_match';
  return 'idle';
}
