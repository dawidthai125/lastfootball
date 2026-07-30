import type { PotentialBandId } from '@/lib/squad/potential';
import type { HubPhase } from '@/lib/hub/types';

/** Thin constants — implementation only (not GDD numbers). */
export const SCOUTING_THIN = {
  MAX_SHORTLIST: 20,
} as const;

export type ScoutingCandidateSource = 'own_senior' | 'market_listed';

/** Fact signals only — never a scout score / AI rank. */
export type ScoutingCandidateDto = {
  readonly playerId: string;
  readonly name: string;
  readonly pos: string;
  readonly age: number;
  readonly potentialBand: PotentialBandId;
  readonly potentialLabel: string;
  /** True when player is on transfer list (own or live H2H). */
  readonly listed: boolean;
  readonly source: ScoutingCandidateSource;
  readonly onShortlist: boolean;
  /** Deep-link target for decisions — Transfery or Kadra. */
  readonly ctaHref: '/transfers' | '/squad';
  readonly ctaLabel: string;
};

export type ScoutingDto = {
  readonly clubId: string;
  readonly phase: HubPhase;
  readonly unlocked: boolean;
  readonly windowOpen: boolean;
  readonly candidates: readonly ScoutingCandidateDto[];
  readonly shortlist: readonly ScoutingCandidateDto[];
  readonly shortlistCount: number;
  readonly maxShortlist: number;
  readonly canAddShortlist: boolean;
};

export type ScoutingActionState = {
  readonly ok?: boolean;
  readonly error?: string;
  readonly message?: string;
};

export const SCOUTING_ACTION_INITIAL: ScoutingActionState = {};
