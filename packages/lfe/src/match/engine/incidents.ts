import type {
  Card,
  Injury,
  InjurySeverity,
  MatchState,
  PitchRole,
  PitchSide,
  Player,
  PlayerId,
} from '../domain';
import { bumpPlayerStat } from '../domain';
import type { Rng } from '../../rng';
import { fatigueOf } from '../../ai/fatigue';

import { reconcileMinutesPlayed } from './minutes-played';
import {
  applySubstitution,
  freshBench,
  lineupOf,
  substitutionsUsed,
  withRolesAfterExit,
} from './substitution';
import type { MatchEngineEmit } from './resolve';

/**
 * Full match rules (D151). Rates per match of two level teams:
 * ~3.5 yellow and ~0.2 red cards, ~3 offsides, ~0.3 penalties, an injury every few matches.
 * Guarded by match-rules01.test.ts.
 */
export const FULL_RULES = Object.freeze({
  YELLOW: 0.17,
  /** Straight red, per foul. */
  RED: 0.004,
  /** A booked player holds back: his share of fouls and of cards drops. */
  BOOKED_FOUL_WEIGHT: 0.6,
  BOOKED_YELLOW: 0.4,
  OFFSIDE: 0.05,
  PENALTY: 0.013,
  PENALTY_GOAL: 0.76,
  FREE_KICK: 0.11,
  FREE_KICK_GOAL: 0.06,
  CORNER_GOAL: 0.035,
  /** A team is never reduced below this. */
  MIN_PLAYERS: 7,
  /** Chance that a player gets hurt in a full match, by energy at kick-off. */
  INJURY_FRESH: 0.004,
  INJURY_TIRED: 0.08,
  INJURY_EXHAUSTED: 0.18,
  TIRED_ENERGY: 59,
  EXHAUSTED_ENERGY: 39,
  AI_SUB_MINUTES: Object.freeze([58, 67, 76]),
});

export type Incident = { readonly state: MatchState; readonly emits: MatchEngineEmit[] };

const FOUL_ROLE_WEIGHT: Readonly<Record<PitchRole, number>> = {
  GK: 0,
  CB: 1.3,
  RB: 1.2,
  LB: 1.2,
  RWB: 1.1,
  LWB: 1.1,
  CDM: 1.4,
  CM: 1.1,
  RM: 0.8,
  LM: 0.8,
  CAM: 0.8,
  RW: 0.7,
  LW: 0.7,
  ST: 0.7,
  CF: 0.7,
};

export function playerOf(state: MatchState, id: PlayerId | null | undefined): Player | undefined {
  return id ? state.players.find((p) => p.id === id) : undefined;
}

export function isBooked(state: MatchState, id: PlayerId): boolean {
  return state.cards.some((c) => c.playerId === id && c.type === 'yellow');
}

export function foulWeight(state: MatchState, role: PitchRole, id: PlayerId): number {
  return FOUL_ROLE_WEIGHT[role] * (isBooked(state, id) ? FULL_RULES.BOOKED_FOUL_WEIGHT : 1);
}

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

/** The chosen taker while he is on the pitch, otherwise the best one. Never the goalkeeper. */
export function setPieceTaker(
  state: MatchState,
  side: PitchSide,
  quality: (player: Player) => number,
): Player | undefined {
  const lineup = lineupOf(state, side);
  if (lineup.slots.some((s) => s.playerId === lineup.setPiecePlayerId)) {
    return playerOf(state, lineup.setPiecePlayerId);
  }
  let best: Player | undefined;
  for (const slot of lineup.slots) {
    if (slot.role === 'GK') continue;
    const player = playerOf(state, slot.playerId);
    if (player && (!best || quality(player) > quality(best))) best = player;
  }
  return best;
}

export const penaltyQuality = (p: Player) => (p.skills.finishing + p.skills.composure) / 2;
export const freeKickQuality = (p: Player) => (p.skills.longShots + p.skills.crossing) / 2;
export const cornerQuality = (p: Player) => p.skills.crossing;

function keeperQuality(state: MatchState, side: PitchSide): number {
  const slot = lineupOf(state, side).slots.find((s) => s.role === 'GK');
  return playerOf(state, slot?.playerId)?.skills.gkReflexes ?? 50;
}

function averageHeading(state: MatchState, side: PitchSide): number {
  const slots = lineupOf(state, side).slots;
  const sum = slots.reduce(
    (total, s) => total + (playerOf(state, s.playerId)?.skills.heading ?? 50),
    0,
  );
  return slots.length === 0 ? 50 : sum / slots.length;
}

/** The better the taker against the goalkeeper, the higher. */
export function penaltyGoalChance(state: MatchState, side: PitchSide, taker: Player): number {
  const gap = penaltyQuality(taker) - keeperQuality(state, side === 'home' ? 'away' : 'home');
  return clamp(FULL_RULES.PENALTY_GOAL + gap * 0.004, 0.55, 0.92);
}

export type ShootOut = {
  readonly home: number;
  readonly away: number;
  readonly winner: PitchSide;
};

/** Best takers first, the chosen taker before them; the goalkeeper last. */
function shootOutOrder(state: MatchState, side: PitchSide): readonly Player[] {
  const lineup = lineupOf(state, side);
  const rank = (slot: { role: PitchRole; playerId: PlayerId }, player: Player) =>
    slot.playerId === lineup.setPiecePlayerId
      ? Infinity
      : slot.role === 'GK'
        ? -1
        : penaltyQuality(player);
  return lineup.slots
    .flatMap((slot) => {
      const player = playerOf(state, slot.playerId);
      return player ? [{ player, rank: rank(slot, player) }] : [];
    })
    .sort((a, b) => b.rank - a.rank || (a.player.id < b.player.id ? -1 : 1))
    .map((row) => row.player);
}

/** Five kicks each, over as soon as it is decided, then pairs until one scores and one misses. */
export function rollShootOut(state: MatchState, rng: Rng): ShootOut {
  const order = { home: shootOutOrder(state, 'home'), away: shootOutOrder(state, 'away') };
  const first: PitchSide = rng.nextBool() ? 'home' : 'away';
  const second: PitchSide = first === 'home' ? 'away' : 'home';
  const goals = { home: 0, away: 0 };
  const kick = (side: PitchSide, round: number) => {
    const taker = order[side][round % Math.max(1, order[side].length)];
    const chance = taker ? penaltyGoalChance(state, side, taker) : 0.5;
    if (rng.next() < chance) goals[side] += 1;
  };
  for (let round = 0; round < 40; round += 1) {
    for (const side of [first, second]) {
      kick(side, round);
      if (round >= 5) continue;
      const left = {
        [first]: 4 - round,
        [second]: side === first ? 5 - round : 4 - round,
      } as Record<PitchSide, number>;
      if (goals[first] > goals[second] + left[second]) return { ...goals, winner: first };
      if (goals[second] > goals[first] + left[first]) return { ...goals, winner: second };
    }
    if (round >= 4 && goals.home !== goals.away) {
      return { ...goals, winner: goals.home > goals.away ? 'home' : 'away' };
    }
  }
  return { ...goals, winner: first };
}

export function freeKickGoalChance(state: MatchState, side: PitchSide, taker: Player): number {
  const gap = freeKickQuality(taker) - keeperQuality(state, side === 'home' ? 'away' : 'home');
  return clamp(FULL_RULES.FREE_KICK_GOAL * (1 + gap * 0.02), 0.015, 0.16);
}

export function cornerGoalChance(state: MatchState, side: PitchSide, taker: Player): number {
  const other = side === 'home' ? 'away' : 'home';
  const gap =
    (cornerQuality(taker) - 50) * 0.01 +
    (averageHeading(state, side) - averageHeading(state, other)) * 0.02;
  return clamp(FULL_RULES.CORNER_GOAL * (1 + gap), 0.01, 0.1);
}

function withTeamCounter(
  state: MatchState,
  side: PitchSide,
  key: 'yellowCards' | 'redCards' | 'offsides',
): MatchState {
  const team = state.statistics[side];
  return Object.freeze({
    ...state,
    statistics: Object.freeze({
      ...state.statistics,
      [side]: Object.freeze({ ...team, [key]: team[key] + 1 }),
    }),
  });
}

function withPlayerCounter(
  state: MatchState,
  id: PlayerId,
  key: 'yellowCards' | 'redCards',
): MatchState {
  const row = state.statistics.players.find((p) => p.playerId === id);
  if (!row) return state;
  return Object.freeze({
    ...state,
    statistics: Object.freeze({
      ...state.statistics,
      players: bumpPlayerStat(state.statistics.players, id, { [key]: row[key] + 1 }),
    }),
  });
}

function withoutPlayer(state: MatchState, side: PitchSide, id: PlayerId): MatchState {
  const lineup = lineupOf(state, side);
  const next = withRolesAfterExit(
    state,
    lineup,
    lineup.slots.filter((s) => s.playerId !== id),
    id,
  );
  return Object.freeze({
    ...state,
    homeLineup: side === 'home' ? next : state.homeLineup,
    awayLineup: side === 'away' ? next : state.awayLineup,
  });
}

/** One foul → maybe a card. A second yellow or a red leaves the team a man down. */
export function rollCard(
  state: MatchState,
  side: PitchSide,
  playerId: PlayerId,
  tick: number,
  rng: Rng,
): Incident {
  const roll = rng.next();
  const booked = isBooked(state, playerId);
  const yellow = FULL_RULES.YELLOW * (booked ? FULL_RULES.BOOKED_YELLOW : 1);
  const straight = roll < FULL_RULES.RED;
  if (!straight && roll >= FULL_RULES.RED + yellow) return { state, emits: [] };

  const canLose = lineupOf(state, side).slots.length > FULL_RULES.MIN_PLAYERS;
  const sentOff = (straight || booked) && canLose;
  if (!sentOff && booked) return { state, emits: [] };
  const type: Card['type'] = !sentOff ? 'yellow' : straight ? 'red' : 'second_yellow';
  const card: Card = Object.freeze({
    id: `card-${tick}-${playerId}`,
    type,
    playerId,
    side,
    matchMinute: state.clock.displayMinute,
    tick,
    reason: 'foul',
  });
  let next: MatchState = Object.freeze({ ...state, cards: Object.freeze([...state.cards, card]) });
  if (type !== 'red') {
    next = withPlayerCounter(withTeamCounter(next, side, 'yellowCards'), playerId, 'yellowCards');
  }
  if (sentOff) {
    next = withPlayerCounter(withTeamCounter(next, side, 'redCards'), playerId, 'redCards');
    next = reconcileMinutesPlayed(withoutPlayer(next, side, playerId));
  }
  return {
    state: next,
    emits: [
      {
        type: 'CARD',
        payload: {
          side,
          playerId,
          colour: sentOff ? 'red' : 'yellow',
          ...(type === 'second_yellow' ? { second: true } : {}),
          minute: state.clock.displayMinute,
        },
      },
    ],
  };
}

export function withOffside(state: MatchState, side: PitchSide, playerId?: PlayerId): Incident {
  return {
    state: withTeamCounter(state, side, 'offsides'),
    emits: [
      {
        type: 'OFFSIDE',
        payload: {
          side,
          minute: state.clock.displayMinute,
          ...(playerId !== undefined ? { playerId } : {}),
        },
      },
    ],
  };
}

const LINE: Readonly<Record<PitchRole, number>> = {
  GK: 0,
  CB: 1,
  RB: 1,
  LB: 1,
  RWB: 1,
  LWB: 1,
  CDM: 2,
  CM: 2,
  CAM: 2,
  RM: 2.5,
  LM: 2.5,
  RW: 3,
  LW: 3,
  ST: 3,
  CF: 3,
};

function quality(p: Player): number {
  const s = p.skills;
  if (p.preferredRole === 'GK') return (s.gkDiving + s.gkReflexes + s.gkHandling) / 3;
  return (
    (s.finishing + s.ballControl + s.shortPassing + s.tackling + s.composure + s.positioning) / 6
  );
}

/** Same line first, then quality. A goalkeeper only for a goalkeeper, and the other way round. */
function bestReplacement(state: MatchState, side: PitchSide, out: Player): Player | undefined {
  let best: Player | undefined;
  let bestScore = -Infinity;
  for (const id of freshBench(state, side)) {
    const player = playerOf(state, id);
    if (!player) continue;
    if ((player.preferredRole === 'GK') !== (out.preferredRole === 'GK')) continue;
    const far = Math.abs(LINE[player.preferredRole] - LINE[out.preferredRole]);
    const score = quality(player) - far * 12 - (player.preferredRole === out.preferredRole ? 0 : 2);
    if (score > bestScore) {
      best = player;
      bestScore = score;
    }
  }
  return best;
}

function hazard(player: Player): number {
  const energy = player.condition.energy;
  const tough = 1.5 - player.attributes.strength / 100;
  if (energy < FULL_RULES.EXHAUSTED_ENERGY) return FULL_RULES.INJURY_EXHAUSTED * tough;
  if (energy < FULL_RULES.TIRED_ENERGY) return FULL_RULES.INJURY_TIRED * tough;
  return FULL_RULES.INJURY_FRESH * tough;
}

function substitutionEmit(
  state: MatchState,
  side: PitchSide,
  playerOutId: PlayerId,
  playerInId: PlayerId,
  reason: 'injury' | 'tactical',
): MatchEngineEmit {
  return {
    type: 'SUBSTITUTION',
    payload: { side, playerOutId, playerInId, reason, minute: state.clock.displayMinute },
  };
}

/**
 * One draw per tick. An injured player is replaced at once by the best bench player while the
 * side has a substitution left; after that the team stays a man down. A side without any
 * bench keeps him on the pitch.
 */
export function rollInjury(
  state: MatchState,
  shareOfMatch: number,
  tick: number,
  rng: Rng,
): Incident {
  const roll = rng.next();
  let seen = 0;
  for (const side of ['home', 'away'] as const) {
    for (const slot of lineupOf(state, side).slots) {
      const player = playerOf(state, slot.playerId);
      if (!player || state.injuries.some((i) => i.playerId === player.id)) continue;
      seen += hazard(player) * shareOfMatch;
      if (roll >= seen) continue;
      return injure(state, side, player, slot.role, tick);
    }
  }
  return { state, emits: [] };
}

function injure(
  state: MatchState,
  side: PitchSide,
  player: Player,
  role: PitchRole,
  tick: number,
): Incident {
  const subsLeft = (state.rules?.maxSubstitutions ?? 0) - substitutionsUsed(state, side) > 0;
  const bench = freshBench(state, side);
  const inPlayer = subsLeft ? bestReplacement(state, side, player) : undefined;
  const noBench = bench.length === 0 && substitutionsUsed(state, side) === 0;
  const canLose = lineupOf(state, side).slots.length > FULL_RULES.MIN_PLAYERS;
  const forcedOff = inPlayer !== undefined || (!noBench && role !== 'GK' && canLose);
  const severity: InjurySeverity =
    player.condition.energy < FULL_RULES.EXHAUSTED_ENERGY ? 'serious' : 'minor';
  const injury: Injury = Object.freeze({
    id: `injury-${tick}-${player.id}`,
    playerId: player.id,
    side,
    severity,
    matchMinute: state.clock.displayMinute,
    tick,
    description: '',
    forcedOff,
  });
  let next: MatchState = Object.freeze({
    ...state,
    injuries: Object.freeze([...state.injuries, injury]),
  });
  const emits: MatchEngineEmit[] = [
    {
      type: 'INJURY',
      payload: {
        side,
        playerId: player.id,
        severity,
        forcedOff,
        minute: state.clock.displayMinute,
      },
    },
  ];
  if (inPlayer) {
    next = applySubstitution(next, {
      id: `sub-injury-${tick}`,
      side,
      playerOutId: player.id,
      playerInId: inPlayer.id,
      tick,
      reason: 'injury',
    });
    emits.push(substitutionEmit(next, side, player.id, inPlayer.id, 'injury'));
  } else if (forcedOff) {
    next = reconcileMinutesPlayed(withoutPlayer(next, side, player.id));
  }
  return { state: next, emits };
}

/**
 * Substitutions of a side the engine runs: tired legs, a booked player, and by the score a
 * forward for a defender or the other way round. One per minute mark.
 */
export function autoSubstitutions(state: MatchState, tick: number): Incident {
  const rules = state.rules;
  if (!rules || rules.autoSides.length === 0) return { state, emits: [] };
  let next = state;
  const emits: MatchEngineEmit[] = [];
  for (const side of rules.autoSides) {
    const used = substitutionsUsed(next, side);
    if (used >= rules.maxSubstitutions) continue;
    const tactical = next.substitutions.filter(
      (s) => s.side === side && s.reason === 'tactical',
    ).length;
    const mark = FULL_RULES.AI_SUB_MINUTES[tactical];
    if (mark === undefined || next.clock.displayMinute < mark + (side === 'home' ? 0 : 2)) continue;
    const pick = pickAutoSubstitution(next, side);
    if (!pick) continue;
    next = applySubstitution(next, {
      id: `sub-auto-${side}-${tick}`,
      side,
      playerOutId: pick.out.id,
      playerInId: pick.in.id,
      tick,
      reason: 'tactical',
    });
    emits.push(substitutionEmit(next, side, pick.out.id, pick.in.id, 'tactical'));
  }
  return { state: next, emits };
}

function pickAutoSubstitution(
  state: MatchState,
  side: PitchSide,
): { out: Player; in: Player } | null {
  const diff = (state.score.home - state.score.away) * (side === 'home' ? 1 : -1);
  const late = state.clock.displayMinute >= 65;
  const cameOn = new Set(state.substitutions.map((s) => s.playerInId));
  let best: { out: Player; in: Player } | null = null;
  // Below this a change would only weaken the team.
  let bestScore = -6;
  for (const slot of lineupOf(state, side).slots) {
    if (slot.role === 'GK' || cameOn.has(slot.playerId)) continue;
    const out = playerOf(state, slot.playerId);
    if (!out) continue;
    const tired = (100 - out.condition.energy) * 0.1 + fatigueOf(state, out) * 0.2;
    const booked = isBooked(state, out.id) ? 5 : 0;
    for (const id of freshBench(state, side)) {
      const inn = playerOf(state, id);
      if (!inn || inn.preferredRole === 'GK') continue;
      const step = LINE[inn.preferredRole] - LINE[slot.role];
      let shape = -Math.abs(step) * 6;
      if (late && diff < 0 && step > 0) {
        shape = (LINE[inn.preferredRole] === 3 ? 6 : 4) + (LINE[slot.role] >= 2 ? 1 : 0);
      }
      if (late && diff > 0 && step < 0) shape = 2;
      const score = quality(inn) - quality(out) + tired + booked + shape;
      if (score > bestScore) {
        bestScore = score;
        best = { out, in: inn };
      }
    }
  }
  return best;
}
