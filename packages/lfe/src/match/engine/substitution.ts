import type {
  Lineup,
  LineupSlot,
  MatchState,
  PitchSide,
  PlayerId,
  SubstitutionReason,
} from '../domain';
import { reconcileMinutesPlayed } from './minutes-played';

export function lineupOf(state: MatchState, side: PitchSide) {
  return side === 'home' ? state.homeLineup : state.awayLineup;
}

export function benchOf(state: MatchState, side: PitchSide) {
  return side === 'home' ? state.homeBench : state.awayBench;
}

export function substitutionsUsed(state: MatchState, side: PitchSide): number {
  return state.substitutions.filter((sub) => sub.side === side).length;
}

/** Bench players who may still come on: nobody returns after leaving the pitch. */
export function freshBench(state: MatchState, side: PitchSide): readonly PlayerId[] {
  const left = new Set([
    ...state.substitutions.map((sub) => sub.playerOutId),
    ...state.injuries.filter((i) => i.forcedOff).map((i) => i.playerId),
    ...state.cards.filter((c) => c.type !== 'yellow').map((c) => c.playerId),
  ]);
  return benchOf(state, side).playerIds.filter((id) => !left.has(id));
}

/** The armband goes to the best leader left; nobody inherits the set pieces. */
export function withRolesAfterExit(
  state: MatchState,
  lineup: Lineup,
  slots: readonly LineupSlot[],
  goneId: PlayerId,
): Lineup {
  let captain = lineup.captainPlayerId;
  if (captain === goneId) {
    captain = null;
    let best = -1;
    for (const slot of slots) {
      const player = state.players.find((p) => p.id === slot.playerId);
      if (player && player.leadership > best) {
        best = player.leadership;
        captain = player.id;
      }
    }
  }
  return Object.freeze({
    ...lineup,
    slots: Object.freeze([...slots]),
    captainPlayerId: captain,
    setPiecePlayerId: lineup.setPiecePlayerId === goneId ? null : lineup.setPiecePlayerId,
  });
}

export function applySubstitution(
  state: MatchState,
  input: {
    readonly id: string;
    readonly side: PitchSide;
    readonly playerOutId: PlayerId;
    readonly playerInId: PlayerId;
    readonly tick: number;
    readonly reason: SubstitutionReason;
  },
): MatchState {
  const { side, playerOutId, playerInId } = input;
  const lineup = lineupOf(state, side);
  const bench = benchOf(state, side);
  const slots = lineup.slots.map((s) =>
    s.playerId === playerOutId ? Object.freeze({ ...s, playerId: playerInId }) : s,
  );
  const replaced: Lineup = {
    ...lineup,
    slots: Object.freeze(slots),
    captainPlayerId: lineup.captainPlayerId === playerOutId ? playerInId : lineup.captainPlayerId,
    setPiecePlayerId:
      lineup.setPiecePlayerId === playerOutId ? playerInId : lineup.setPiecePlayerId,
  };
  const nextLineup = Object.freeze(
    state.rules ? withRolesAfterExit(state, lineup, slots, playerOutId) : replaced,
  );
  const nextBench = Object.freeze({
    ...bench,
    playerIds: Object.freeze(bench.playerIds.filter((id) => id !== playerInId).concat(playerOutId)),
  });
  // LFE-RATINGS-V2: freeze out-player minutes; in-player starts from current minute.
  return reconcileMinutesPlayed(
    Object.freeze({
      ...state,
      homeLineup: side === 'home' ? nextLineup : state.homeLineup,
      awayLineup: side === 'away' ? nextLineup : state.awayLineup,
      homeBench: side === 'home' ? nextBench : state.homeBench,
      awayBench: side === 'away' ? nextBench : state.awayBench,
      substitutions: Object.freeze([
        ...state.substitutions,
        Object.freeze({
          id: input.id,
          side,
          playerOutId,
          playerInId,
          matchMinute: state.clock.displayMinute,
          tick: input.tick,
          reason: input.reason,
          completed: true,
        }),
      ]),
    }),
  );
}
