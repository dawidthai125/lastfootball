/** Numbers of LFE-ACADEMY-02 (GDD §26.8, D134). Pure: no cash, no database. */

export const ACADEMY_MAX_LEVEL = 3;

export type AcademyLevel = {
  /** Price to reach this level from the one below. */
  readonly cost: number;
  /** Paid with every settled match, after wages. */
  readonly upkeep: number;
  readonly slots: number;
  readonly intakeEveryDays: number;
  /** Shown at one intake; the manager takes one. */
  readonly candidates: number;
  readonly skill: readonly [number, number];
};

const LEVELS: readonly [AcademyLevel, AcademyLevel, AcademyLevel, AcademyLevel] = [
  { cost: 0, upkeep: 0, slots: 3, intakeEveryDays: 7, candidates: 1, skill: [40, 52] },
  { cost: 30_000, upkeep: 500, slots: 4, intakeEveryDays: 6, candidates: 2, skill: [42, 53] },
  { cost: 60_000, upkeep: 1_000, slots: 5, intakeEveryDays: 5, candidates: 2, skill: [44, 54] },
  { cost: 110_000, upkeep: 1_500, slots: 6, intakeEveryDays: 4, candidates: 3, skill: [46, 56] },
];

export const JUNIOR_TRAINING = { COST: 1_000, SEASON_GAIN: 6 } as const;

/** A junior this old has his last academy season: the next one starts without him. */
export const JUNIOR_MAX_AGE = 19;

/** Part of the fee computer clubs pay for a home-grown player, by senior matches. */
const SALE_SHARES = [
  { matches: 22, share: 0.5 },
  { matches: 10, share: 0.25 },
  { matches: 0, share: 0.1 },
] as const;

export const UPKEEP_LABEL = 'Utrzymanie akademii';
export const UPKEEP_SHORT_LABEL = 'Utrzymanie akademii niepełne, zabrakło';

/** A missing column, or anything odd, is the old academy: level 0. */
export function clampAcademyLevel(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(ACADEMY_MAX_LEVEL, Math.trunc(value)));
}

export function academyLevel(level: number): AcademyLevel {
  return LEVELS[clampAcademyLevel(level)] ?? LEVELS[0];
}

export function academyUpgrade(input: {
  readonly level: number;
  readonly cash: number;
}):
  | { ok: true; level: number; cost: number; cashAfter: number }
  | { ok: false; reason: 'max' | 'cash' } {
  const level = clampAcademyLevel(input.level) + 1;
  if (level > ACADEMY_MAX_LEVEL) return { ok: false, reason: 'max' };
  const { cost } = academyLevel(level);
  if (!(input.cash >= cost)) return { ok: false, reason: 'cash' };
  return { ok: true, level, cost, cashAfter: input.cash - cost };
}

export function homegrownSaleShare(seniorMatches: number | null | undefined): number {
  const played = seniorMatches ?? 0;
  return SALE_SHARES.find((step) => played >= step.matches)?.share ?? 0.1;
}

export function isLastAcademySeason(age: number): boolean {
  return age >= JUNIOR_MAX_AGE;
}

/** After the age tick of the season start. */
export function leavesAcademy(age: number): boolean {
  return age > JUNIOR_MAX_AGE;
}

/** One line for Messages. Null when every junior may stay. */
export function juniorAgeNote(
  juniors: readonly { readonly name: string; readonly age: number }[],
): string | null {
  const last = juniors.filter((junior) => isLastAcademySeason(junior.age));
  const first = last[0];
  if (!first) return null;
  return last.length === 1
    ? `${first.name} odejdzie z akademii po sezonie, jeśli go nie wypromujesz`
    : `Juniorzy do promocji przed nowym sezonem: ${last.length}. Inaczej odejdą`;
}

/** Why this junior cannot train today, or null. The database checks the same again. */
export function juniorTrainingBlock(input: {
  readonly age: number;
  readonly seasonGain: number;
  readonly trainedToday: boolean;
  readonly cash: number;
}): string | null {
  if (input.age > JUNIOR_MAX_AGE) return 'Za stary na trening akademii.';
  if (input.seasonGain >= JUNIOR_TRAINING.SEASON_GAIN) return 'Limit treningów w sezonie.';
  if (input.trainedToday) return 'Trening na dziś wykonany.';
  if (input.cash < JUNIOR_TRAINING.COST) return 'Za mało środków w kasie.';
  return null;
}
