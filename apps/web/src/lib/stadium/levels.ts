import { TRAINING_THIN } from '@/lib/training/types';

/**
 * Pure stadium upgrade math. A parent wires this into UI, cash, and the match.
 * No persistence and no match-engine calls.
 */

export const STADIUM_MAX_LEVEL = 3;

export type StadiumPart = 'stands' | 'pitch' | 'training_center';

export type StadiumLevels = {
  readonly stands: number;
  readonly pitch: number;
  readonly trainingCenter: number;
};

export type AttendanceBand = 'quiet' | 'steady' | 'lively' | 'unknown';

/** Cost to leave this level. Index 0..2 is the price of the next level. Index 3 unused. */
export const STADIUM_UPGRADE_COST = {
  stands: [40_000, 80_000, 140_000, 0],
  pitch: [25_000, 50_000, 90_000, 0],
  training_center: [30_000, 60_000, 100_000, 0],
} as const;

const TICKET_BASE_EUR = [0, 1_500, 3_000, 5_000] as const;

const HOME_PITCH_BONUS = [0, 1, 2, 3] as const;

/** Level 0 keeps today's session cap. Each next level adds 1. Not +skill per player. */
const TRAINING_SESSION_CAP = [
  TRAINING_THIN.SKILL_UP_MAX_PER_SESSION,
  TRAINING_THIN.SKILL_UP_MAX_PER_SESSION + 1,
  TRAINING_THIN.SKILL_UP_MAX_PER_SESSION + 2,
  TRAINING_THIN.SKILL_UP_MAX_PER_SESSION + 3,
] as const;

const STANDS_LOOK = [
  'Trybuny startowe',
  'Trybuny większe',
  'Trybuny pełne',
  'Trybuny kryte',
] as const;

const PITCH_LOOK = ['Murawa zwykła', 'Murawa równa', 'Murawa gęsta', 'Murawa turniejowa'] as const;

const CENTER_LOOK = [
  'Boisko treningowe',
  'Ośrodek mały',
  'Ośrodek pełny',
  'Ośrodek kadry',
] as const;

type LevelTable = readonly [number, number, number, number];
type LabelTable = readonly [string, string, string, string];

/** Truncate, then fold negatives to 0 and anything above the cap to max. */
function clampStadiumLevel(level: number): number {
  if (!Number.isFinite(level)) return 0;
  const truncated = Math.trunc(level);
  if (truncated < 0) return 0;
  if (truncated > STADIUM_MAX_LEVEL) return STADIUM_MAX_LEVEL;
  return truncated;
}

function valueAt(table: LevelTable, level: number): number {
  const index = clampStadiumLevel(level);
  return table[index] ?? table[0];
}

function labelAt(table: LabelTable, level: number): string {
  const index = clampStadiumLevel(level);
  return table[index] ?? table[0];
}

function isStadiumPart(part: string): part is StadiumPart {
  return part === 'stands' || part === 'pitch' || part === 'training_center';
}

function levelOf(levels: StadiumLevels, part: StadiumPart): number {
  if (part === 'stands') return levels.stands;
  if (part === 'pitch') return levels.pitch;
  return levels.trainingCenter;
}

function withUpgradedPart(
  levels: StadiumLevels,
  part: StadiumPart,
  nextLevel: number,
): StadiumLevels {
  return {
    stands: part === 'stands' ? nextLevel : levels.stands,
    pitch: part === 'pitch' ? nextLevel : levels.pitch,
    trainingCenter: part === 'training_center' ? nextLevel : levels.trainingCenter,
  };
}

function attendanceMultiplier(attendance: AttendanceBand): number {
  if (attendance === 'quiet') return 0.6;
  if (attendance === 'steady') return 1;
  if (attendance === 'lively') return 1.4;
  if (attendance === 'unknown') return 0.8;
  return 0.8;
}

/** Fresh stadium: stands, pitch, and training center all at 0. */
export function emptyStadiumLevels(): StadiumLevels {
  return { stands: 0, pitch: 0, trainingCenter: 0 };
}

export function upgradePart(input: {
  readonly levels: StadiumLevels;
  readonly part: StadiumPart;
  readonly cash: number;
}):
  | { ok: true; levels: StadiumLevels; cost: number; cashAfter: number }
  | { ok: false; reason: 'max' | 'cash' | 'part' } {
  const part = input.part as string;
  if (!isStadiumPart(part)) {
    return { ok: false, reason: 'part' };
  }

  const level = clampStadiumLevel(levelOf(input.levels, part));
  if (level >= STADIUM_MAX_LEVEL) {
    return { ok: false, reason: 'max' };
  }

  const cost = STADIUM_UPGRADE_COST[part][level];
  if (cost == null) {
    return { ok: false, reason: 'max' };
  }
  if (!(input.cash >= cost)) {
    return { ok: false, reason: 'cash' };
  }

  const cashAfter = input.cash - cost;
  return {
    ok: true,
    levels: withUpgradedPart(input.levels, part, level + 1),
    cost,
    cashAfter,
  };
}

/** Whole EUR. Level 0 is always 0, before the attendance multiplier. */
export function ticketIncome(input: {
  readonly standsLevel: number;
  readonly attendance: AttendanceBand;
}): number {
  const level = clampStadiumLevel(input.standsLevel);
  if (level === 0) return 0;
  const base = valueAt(TICKET_BASE_EUR, level);
  return Math.max(0, Math.round(base * attendanceMultiplier(input.attendance)));
}

/**
 * Small integer added only on the home side.
 * Both viewers of a shared match must pass the home side's pitch level, not "our" side.
 */
export function homePitchBonus(pitchLevel: number): number {
  return valueAt(HOME_PITCH_BONUS, pitchLevel);
}

/**
 * How many players may gain skill in one session.
 * Level 0 keeps TRAINING_THIN.SKILL_UP_MAX_PER_SESSION. Each further level adds 1.
 * Does not change +1 skill per player.
 */
export function trainingSessionCap(centerLevel: number): number {
  return valueAt(TRAINING_SESSION_CAP, centerLevel);
}

/** Player-facing Polish labels. Plain words only — no tokens, no cards. */
export function stadiumLook(levels: StadiumLevels): {
  readonly stands: string;
  readonly pitch: string;
  readonly center: string;
} {
  return {
    stands: labelAt(STANDS_LOOK, levels.stands),
    pitch: labelAt(PITCH_LOOK, levels.pitch),
    center: labelAt(CENTER_LOOK, levels.trainingCenter),
  };
}
