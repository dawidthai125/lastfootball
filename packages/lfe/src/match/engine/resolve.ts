import type { EngineEventType } from '../../events';
import type { MatchState, PitchSide, PlayerId, TeamStatistics } from '../domain';
import { bumpPlayerStat, createScore } from '../domain';
import type { Rng } from '../../rng';
import { decideActionFromState, decidePossessionFromState } from '../../ai';

import { attributeAssistForGoal, attributePlayerForEvent } from './attribute-player';
import {
  cornerGoalChance,
  cornerQuality,
  freeKickGoalChance,
  freeKickQuality,
  FULL_RULES,
  penaltyGoalChance,
  penaltyQuality,
  rollCard,
  setPieceTaker,
  withOffside,
} from './incidents';

export type MatchEngineEmit = {
  readonly type: EngineEventType;
  readonly payload?: unknown;
};

function bumpTeamStat(stats: TeamStatistics, patch: Partial<TeamStatistics>): TeamStatistics {
  return Object.freeze({ ...stats, ...patch });
}

function oppositeSide(side: PitchSide): PitchSide {
  return side === 'home' ? 'away' : 'home';
}

/** @deprecated Prefer decidePossessionFromState — kept for ENGINE-01 API compat. */
export function possessionHomeChance(state: MatchState): number {
  return decidePossessionFromState(state).homeChance;
}

export function rollPossessionSide(state: MatchState, rng: Rng): PitchSide {
  const { homeChance } = decidePossessionFromState(state);
  return rng.next() < homeChance ? 'home' : 'away';
}

export function withPossessionTick(state: MatchState, side: PitchSide): MatchState {
  const team = side === 'home' ? state.statistics.home : state.statistics.away;
  const nextTeam = bumpTeamStat(team, {
    possessionTicks: team.possessionTicks + 1,
  });
  return Object.freeze({
    ...state,
    statistics: Object.freeze({
      ...state.statistics,
      home: side === 'home' ? nextTeam : state.statistics.home,
      away: side === 'away' ? nextTeam : state.statistics.away,
    }),
  });
}

/**
 * Probabilistic in-possession resolution.
 * AI supplies chances; Engine rolls RNG and mutates MatchState + emit list.
 * Optional playerId on GOAL/SHOT/FOUL is deterministic (no extra RNG).
 */
export function resolvePossessionAction(
  state: MatchState,
  side: PitchSide,
  rng: Rng,
  tick: number = 0,
  attackScale: number = 1,
): { state: MatchState; emits: MatchEngineEmit[] } {
  const emits: MatchEngineEmit[] = [];
  const decision = decideActionFromState(state, side);

  if (rng.next() >= decision.attackChance * attackScale) {
    const passerId = attributePlayerForEvent(state, side, 'PASS', tick);
    const completed = rng.next() < 0.82;
    emits.push({
      type: 'PASS',
      payload: {
        side,
        minute: state.clock.displayMinute,
        completed,
        ...(passerId !== undefined ? { playerId: passerId } : {}),
      },
    });
    const team = side === 'home' ? state.statistics.home : state.statistics.away;
    let players = state.statistics.players;
    if (passerId !== undefined) {
      const row = players.find((p) => p.playerId === passerId);
      if (row) {
        players = bumpPlayerStat(players, passerId, {
          passesAttempted: row.passesAttempted + 1,
          passesCompleted: row.passesCompleted + (completed ? 1 : 0),
        });
      }
    }
    const nextTeam = bumpTeamStat(team, {
      passesAttempted: team.passesAttempted + 1,
      passesCompleted: team.passesCompleted + (completed ? 1 : 0),
    });
    return {
      state: Object.freeze({
        ...state,
        statistics: Object.freeze({
          ...state.statistics,
          home: side === 'home' ? nextTeam : state.statistics.home,
          away: side === 'away' ? nextTeam : state.statistics.away,
          players,
        }),
      }),
      emits,
    };
  }

  const actorId = attributePlayerForEvent(state, side, 'SHOT', tick);

  emits.push({ type: 'ATTACK', payload: { side, minute: state.clock.displayMinute } });

  if (state.rules && rng.next() < FULL_RULES.OFFSIDE) {
    const offside = withOffside(state, side, actorId);
    emits.push(...offside.emits);
    return { state: offside.state, emits };
  }

  if (rng.next() >= decision.shotChance) {
    if (rng.next() < decision.foulChance) {
      const foulerSide = oppositeSide(side);
      const foulerId = attributePlayerForEvent(state, foulerSide, 'FOUL', tick);
      emits.push({
        type: 'FOUL',
        payload: {
          against: side,
          minute: state.clock.displayMinute,
          ...(foulerId !== undefined ? { playerId: foulerId } : {}),
        },
      });
      const team = side === 'home' ? state.statistics.away : state.statistics.home;
      const nextTeam = bumpTeamStat(team, { fouls: team.fouls + 1 });
      let players = state.statistics.players;
      if (foulerId !== undefined) {
        const row = players.find((p) => p.playerId === foulerId);
        if (row) {
          players = bumpPlayerStat(players, foulerId, {
            foulsCommitted: row.foulsCommitted + 1,
          });
        }
      }
      let fouled: MatchState = Object.freeze({
        ...state,
        statistics: Object.freeze({
          ...state.statistics,
          home: side === 'away' ? nextTeam : state.statistics.home,
          away: side === 'home' ? nextTeam : state.statistics.away,
          players,
        }),
      });
      if (state.rules) {
        if (foulerId !== undefined) {
          const card = rollCard(fouled, foulerSide, foulerId, tick, rng);
          fouled = card.state;
          emits.push(...card.emits);
        }
        const dead = resolveDeadBall(fouled, side, rng, tick);
        fouled = dead.state;
        emits.push(...dead.emits);
      }
      return { state: fouled, emits };
    }
    return { state, emits };
  }

  const onTarget = rng.next() < decision.onTargetChance;
  emits.push({
    type: 'SHOT',
    payload: {
      side,
      onTarget,
      minute: state.clock.displayMinute,
      ...(actorId !== undefined ? { playerId: actorId } : {}),
    },
  });

  let next = state;
  const team = side === 'home' ? state.statistics.home : state.statistics.away;
  let players = next.statistics.players;
  if (actorId !== undefined) {
    const row = players.find((p) => p.playerId === actorId);
    if (row) {
      players = bumpPlayerStat(players, actorId, { shots: row.shots + 1 });
    }
  }
  next = Object.freeze({
    ...next,
    statistics: Object.freeze({
      ...next.statistics,
      home:
        side === 'home'
          ? bumpTeamStat(team, {
              shots: team.shots + 1,
              shotsOnTarget: team.shotsOnTarget + (onTarget ? 1 : 0),
            })
          : next.statistics.home,
      away:
        side === 'away'
          ? bumpTeamStat(team, {
              shots: team.shots + 1,
              shotsOnTarget: team.shotsOnTarget + (onTarget ? 1 : 0),
            })
          : next.statistics.away,
      players,
    }),
  });

  if (!onTarget) {
    if (rng.next() < decision.cornerChance) {
      emits.push({ type: 'CORNER', payload: { side, minute: next.clock.displayMinute } });
      const st = side === 'home' ? next.statistics.home : next.statistics.away;
      next = Object.freeze({
        ...next,
        statistics: Object.freeze({
          ...next.statistics,
          home:
            side === 'home' ? bumpTeamStat(st, { corners: st.corners + 1 }) : next.statistics.home,
          away:
            side === 'away' ? bumpTeamStat(st, { corners: st.corners + 1 }) : next.statistics.away,
        }),
      });
      if (state.rules) {
        const taker = setPieceTaker(next, side, cornerQuality);
        if (taker && rng.next() < cornerGoalChance(next, side, taker)) {
          const scorerId = headerScorer(next, side, taker.id, tick);
          const shot = withShot(next, side, scorerId, true, { header: true });
          const goal = withGoal(shot.state, side, scorerId, taker.id, { header: true });
          return { state: goal.state, emits: [...emits, ...shot.emits, ...goal.emits] };
        }
      }
    }
    return { state: next, emits };
  }

  const goalChance = state.rules ? decision.goalChance * OPEN_PLAY_SHARE : decision.goalChance;
  if (rng.next() >= goalChance) {
    return { state: next, emits };
  }

  const assistPlayerId =
    actorId !== undefined ? attributeAssistForGoal(next, side, actorId, tick) : undefined;

  const goal = withGoal(next, side, actorId, assistPlayerId);
  return { state: goal.state, emits: [...emits, ...goal.emits] };
}

/** Goals from penalties, free kicks and corners come on top, so open play scores a bit less. */
const OPEN_PLAY_SHARE = 0.83;

/** A foul near the goal: rarely a penalty, sometimes a free kick worth a shot. */
function resolveDeadBall(
  state: MatchState,
  side: PitchSide,
  rng: Rng,
  tick: number,
): { state: MatchState; emits: MatchEngineEmit[] } {
  const roll = rng.next();
  const penalty = roll < FULL_RULES.PENALTY;
  if (!penalty && roll >= FULL_RULES.PENALTY + FULL_RULES.FREE_KICK) return { state, emits: [] };
  const taker = setPieceTaker(state, side, penalty ? penaltyQuality : freeKickQuality);
  if (!taker) return { state, emits: [] };

  const mark = penalty ? { penalty: true } : { freeKick: true };
  const emits: MatchEngineEmit[] = [
    {
      type: penalty ? 'PENALTY' : 'FREE_KICK',
      payload: { side, playerId: taker.id, minute: state.clock.displayMinute },
    },
  ];
  const scored =
    rng.next() <
    (penalty ? penaltyGoalChance(state, side, taker) : freeKickGoalChance(state, side, taker));
  const onTarget = scored || rng.next() < (penalty ? 0.7 : 0.3);
  const shot = withShot(state, side, taker.id, onTarget, { ...mark, missed: !scored });
  emits.push(...shot.emits);
  if (!scored) return { state: shot.state, emits };
  const goal = withGoal(shot.state, side, taker.id, undefined, mark);
  return { state: goal.state, emits: [...emits, ...goal.emits] };
}

function headerScorer(
  state: MatchState,
  side: PitchSide,
  takerId: PlayerId,
  tick: number,
): PlayerId | undefined {
  const id = attributePlayerForEvent(state, side, 'HEADER', tick);
  return id === takerId ? attributePlayerForEvent(state, side, 'HEADER', tick, takerId) : id;
}

function withShot(
  state: MatchState,
  side: PitchSide,
  playerId: PlayerId | undefined,
  onTarget: boolean,
  mark: Record<string, unknown>,
): { state: MatchState; emits: MatchEngineEmit[] } {
  const team = state.statistics[side];
  const row = state.statistics.players.find((p) => p.playerId === playerId);
  return {
    state: Object.freeze({
      ...state,
      statistics: Object.freeze({
        ...state.statistics,
        [side]: bumpTeamStat(team, {
          shots: team.shots + 1,
          shotsOnTarget: team.shotsOnTarget + (onTarget ? 1 : 0),
        }),
        players: row
          ? bumpPlayerStat(state.statistics.players, row.playerId, { shots: row.shots + 1 })
          : state.statistics.players,
      }),
    }),
    emits: [
      {
        type: 'SHOT',
        payload: {
          side,
          onTarget,
          minute: state.clock.displayMinute,
          ...(playerId !== undefined ? { playerId } : {}),
          ...mark,
        },
      },
    ],
  };
}

function withGoal(
  state: MatchState,
  side: PitchSide,
  actorId: PlayerId | undefined,
  assistPlayerId: PlayerId | undefined,
  mark: Record<string, unknown> = {},
): { state: MatchState; emits: MatchEngineEmit[] } {
  const emits: MatchEngineEmit[] = [
    {
      type: 'GOAL',
      payload: {
        side,
        minute: state.clock.displayMinute,
        ...(actorId !== undefined ? { playerId: actorId } : {}),
        ...(assistPlayerId !== undefined ? { assistPlayerId } : {}),
        ...mark,
      },
    },
  ];
  let next = state;
  const scored = side === 'home' ? next.statistics.home : next.statistics.away;
  let goalPlayers = next.statistics.players;
  if (actorId !== undefined) {
    const row = goalPlayers.find((p) => p.playerId === actorId);
    if (row) {
      goalPlayers = bumpPlayerStat(goalPlayers, actorId, { goals: row.goals + 1 });
    }
  }
  if (assistPlayerId !== undefined) {
    const assistRow = goalPlayers.find((p) => p.playerId === assistPlayerId);
    if (assistRow) {
      goalPlayers = bumpPlayerStat(goalPlayers, assistPlayerId, {
        assists: assistRow.assists + 1,
      });
    }
  }
  next = Object.freeze({
    ...next,
    score: createScore(
      side === 'home' ? next.score.home + 1 : next.score.home,
      side === 'away' ? next.score.away + 1 : next.score.away,
    ),
    statistics: Object.freeze({
      ...next.statistics,
      home:
        side === 'home' ? bumpTeamStat(scored, { goals: scored.goals + 1 }) : next.statistics.home,
      away:
        side === 'away' ? bumpTeamStat(scored, { goals: scored.goals + 1 }) : next.statistics.away,
      players: goalPlayers,
    }),
  });

  return { state: next, emits };
}
