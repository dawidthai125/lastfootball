import type { MatchState, PitchRole, PitchSide, PlayerId } from '../domain';

/** Event kinds that receive deterministic player attribution in PLAYER-MATCH-DATA-01. */
export type AttributeEventKind = 'GOAL' | 'SHOT' | 'FOUL';

const OFFENSIVE_ROLES: ReadonlySet<PitchRole> = new Set([
  'ST',
  'CF',
  'LW',
  'RW',
  'CAM',
  'RM',
  'LM',
]);

const DEFENSIVE_ROLES: ReadonlySet<PitchRole> = new Set(['CB', 'CDM', 'RB', 'LB', 'RWB', 'LWB']);

/** Stable non-cryptographic hash — no RNG. */
export function stableEventKindHash(kind: AttributeEventKind): number {
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
 */
export function attributePlayerForEvent(
  state: MatchState,
  actingSide: PitchSide,
  kind: AttributeEventKind,
  tick: number,
): PlayerId | undefined {
  const lineup = actingSide === 'home' ? state.homeLineup : state.awayLineup;
  const preferred = kind === 'FOUL' ? DEFENSIVE_ROLES : OFFENSIVE_ROLES;
  const preferredSlots = lineup.slots.filter((s) => preferred.has(s.role));
  const candidates = preferredSlots.length > 0 ? preferredSlots : lineup.slots;
  if (candidates.length === 0) {
    return undefined;
  }
  const index = (tick + stableEventKindHash(kind)) % candidates.length;
  return candidates[index]!.playerId;
}
