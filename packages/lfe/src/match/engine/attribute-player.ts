import type { LineupSlot, MatchState, PitchRole, PitchSide, PlayerId } from '../domain';

/** Event kinds that receive deterministic player attribution in PLAYER-MATCH-DATA-01. */
export type AttributeEventKind = 'GOAL' | 'SHOT' | 'FOUL' | 'PASS';

/** Hash kinds including ASSIST (Ratings v2) — ASSIST is not a Match Engine event actor kind. */
type AttributeHashKind = AttributeEventKind | 'ASSIST';

/** Share of shots and goals by pitch role (D143). Skill moves it further. */
const GOAL_ROLE_WEIGHT: Readonly<Record<PitchRole, number>> = {
  GK: 0,
  CB: 1,
  RB: 1,
  LB: 1,
  RWB: 1.5,
  LWB: 1.5,
  CDM: 1.5,
  CM: 3,
  RM: 4,
  LM: 4,
  CAM: 6,
  RW: 7,
  LW: 7,
  ST: 12,
  CF: 12,
};

const ASSIST_ROLE_WEIGHT: Readonly<Record<PitchRole, number>> = {
  GK: 0.2,
  CB: 1,
  RB: 3,
  LB: 3,
  RWB: 4,
  LWB: 4,
  CDM: 3,
  CM: 6,
  RM: 7,
  LM: 7,
  CAM: 9,
  RW: 8,
  LW: 8,
  ST: 5,
  CF: 5,
};

/** One goal in four has no assist. */
export const ASSIST_SHARE = 0.75;

const skillFactor = (skill: number): number => (Math.max(1, skill) / 60) ** 2;

/** Weight of a player for a shot or a goal. The league scorer list uses the same one. */
export function goalWeight(role: PitchRole, finishing: number): number {
  return GOAL_ROLE_WEIGHT[role] * skillFactor(finishing);
}

export function assistWeight(role: PitchRole, passing: number): number {
  return ASSIST_ROLE_WEIGHT[role] * skillFactor(passing);
}

/** Index by weight, `unit` in [0, 1). All weights 0 = even shares. */
export function pickByWeight(weights: readonly number[], unit: number): number {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return Math.min(weights.length - 1, Math.floor(unit * weights.length));
  let left = unit * total;
  for (let i = 0; i < weights.length; i += 1) {
    left -= weights[i]!;
    if (left < 0) return i;
  }
  return weights.length - 1;
}

/** Full mix of tick, side and kind to [0, 1). Not the match RNG: scores must not move. */
function attributionUnit(kind: AttributeHashKind | 'ASSISTED', side: PitchSide, tick: number) {
  let h =
    Math.imul(tick + 1, 0x9e3779b1) ^
    stableEventKindHash(kind) ^
    (side === 'home' ? 0 : 0x5bd1e995);
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 2 ** 32;
}

function pickSlot(
  state: MatchState,
  slots: readonly LineupSlot[],
  weight: typeof goalWeight,
  skill: 'finishing' | 'shortPassing',
  unit: number,
): PlayerId | undefined {
  if (slots.length === 0) return undefined;
  const weights = slots.map((slot) =>
    weight(slot.role, state.players.find((p) => p.id === slot.playerId)?.skills[skill] ?? 50),
  );
  return slots[pickByWeight(weights, unit)]!.playerId;
}

const DEFENSIVE_ROLES: ReadonlySet<PitchRole> = new Set(['CB', 'CDM', 'RB', 'LB', 'RWB', 'LWB']);

const PASS_ROLES: ReadonlySet<PitchRole> = new Set([
  'CM',
  'CDM',
  'CAM',
  'LM',
  'RM',
  'RB',
  'LB',
  'RWB',
  'LWB',
]);

/** Stable non-cryptographic hash — no RNG. */
export function stableEventKindHash(kind: AttributeHashKind | 'ASSISTED'): number {
  let h = 0;
  for (let i = 0; i < kind.length; i++) {
    h = (h * 31 + kind.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/**
 * Pure, deterministic mapping: (state, acting side, event kind, tick) → PlayerId.
 * Does not mutate state and must never call RNG.
 *
 * `actingSide` is the side of the attributed player:
 * - GOAL / SHOT → attacking (possession) side
 * - FOUL → fouling side (opposite of payload `against`)
 * - PASS → possession side, midfield first
 */
export function attributePlayerForEvent(
  state: MatchState,
  actingSide: PitchSide,
  kind: AttributeEventKind,
  tick: number,
): PlayerId | undefined {
  const lineup = actingSide === 'home' ? state.homeLineup : state.awayLineup;
  if (kind === 'GOAL' || kind === 'SHOT') {
    // One unit for both: the goal belongs to the shooter.
    const unit = attributionUnit('SHOT', actingSide, tick);
    return pickSlot(state, lineup.slots, goalWeight, 'finishing', unit);
  }
  const preferred = kind === 'FOUL' ? DEFENSIVE_ROLES : PASS_ROLES;
  const preferredSlots = lineup.slots.filter((s) => preferred.has(s.role));
  const candidates = preferredSlots.length > 0 ? preferredSlots : lineup.slots;
  if (candidates.length === 0) {
    return undefined;
  }
  const index = (tick + stableEventKindHash(kind)) % candidates.length;
  return candidates[index]!.playerId;
}

/**
 * LFE-RATINGS-V2 — deterministic assist for a GOAL (0|1, never the scorer, no RNG).
 */
export function attributeAssistForGoal(
  state: MatchState,
  actingSide: PitchSide,
  scorerId: PlayerId,
  tick: number,
): PlayerId | undefined {
  const lineup = actingSide === 'home' ? state.homeLineup : state.awayLineup;
  if (attributionUnit('ASSISTED', actingSide, tick) >= ASSIST_SHARE) return undefined;
  return pickSlot(
    state,
    lineup.slots.filter((s) => s.playerId !== scorerId),
    assistWeight,
    'shortPassing',
    attributionUnit('ASSIST', actingSide, tick),
  );
}
