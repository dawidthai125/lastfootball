import type { PotentialBandId } from '@/lib/squad/potential';
import type { CareerPhaseId } from '@/lib/squad/career-phase';
import type { HubPhase } from '@/lib/hub/types';

/** Thin A constants — implementation only (not GDD numbers). */
export const ACADEMY_THIN = {
  MAX_PROSPECTS: 3,
  ID_PREFIX: 'a',
} as const;

export type AcademyProspectDto = {
  readonly id: string;
  readonly name: string;
  readonly pos: string;
  readonly age: number;
  readonly potentialBand: PotentialBandId;
  readonly potentialLabel: string;
  /** Derived Career Phase (D124) — same age path as seniors. */
  readonly careerPhase: CareerPhaseId;
  readonly careerPhaseLabel: string;
};

export type AcademyIntakeBlockedReason = 'not_season' | 'slots_full' | null;

export type AcademyDto = {
  readonly clubId: string;
  readonly phase: HubPhase;
  readonly unlocked: boolean;
  readonly prospects: readonly AcademyProspectDto[];
  readonly prospectCount: number;
  readonly maxProspects: number;
  readonly canIntake: boolean;
  readonly intakeBlockedReason: AcademyIntakeBlockedReason;
  readonly canPromote: boolean;
};

export type AcademyActionState = {
  readonly ok?: boolean;
  readonly error?: string;
  readonly message?: string;
};

export const ACADEMY_ACTION_INITIAL: AcademyActionState = {};
