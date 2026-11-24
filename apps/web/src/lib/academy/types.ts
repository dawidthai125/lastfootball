import { academyLevel } from '@/lib/academy/levels';
import type { AcademyCandidate } from '@/lib/academy/intake';
import type { PotentialBandId } from '@/lib/squad/potential';
import type { CareerPhaseId } from '@/lib/squad/career-phase';
import type { HubPhase } from '@/lib/hub/types';

/** Thin A constants — implementation only (not GDD numbers). */
export const ACADEMY_THIN = {
  /** Level 0. Higher levels: academyLevel(level).slots. */
  MAX_PROSPECTS: academyLevel(0).slots,
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
  /** Leaves at the next season start unless promoted. */
  readonly lastSeason: boolean;
  /** Trainings used this season, of JUNIOR_TRAINING.SEASON_GAIN. */
  readonly seasonGain: number;
  /** Why he cannot train today, null when he can. */
  readonly trainingBlock: string | null;
};

export type AcademyIntakeBlockedReason =
  'not_season' | 'slots_full' | 'offer_open' | 'waiting' | null;

/** Cards of the open intake. No id and no numbers besides the age. */
export type AcademyOfferDto = {
  readonly seq: number;
  readonly candidates: readonly {
    readonly index: number;
    readonly name: string;
    readonly pos: string;
    readonly age: number;
    readonly potentialLabel: string;
  }[];
};

export type AcademyUpgradeDto = {
  readonly cost: number;
  readonly affordable: boolean;
  readonly effects: string;
};

/** What the server knows besides the players. `levels` false: the migration did not run. */
export type AcademyState = {
  readonly levels: boolean;
  readonly level: number;
  readonly offer: { readonly seq: number; readonly candidates: readonly AcademyCandidate[] } | null;
  readonly waitDays: number;
  readonly cash: number;
  readonly seasonNumber: number;
  readonly today: string;
};

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
  /** Levels, choice and training are shown only when the database has them. */
  readonly hasLevels: boolean;
  readonly level: number;
  readonly upkeep: number;
  readonly summary: string;
  readonly upgrade: AcademyUpgradeDto | null;
  readonly offer: AcademyOfferDto | null;
  readonly waitDays: number;
};

export type AcademyActionState = {
  readonly ok?: boolean;
  readonly error?: string;
  readonly message?: string;
};

export const ACADEMY_ACTION_INITIAL: AcademyActionState = {};
