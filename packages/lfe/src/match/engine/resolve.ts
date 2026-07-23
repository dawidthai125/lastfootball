import type { EngineEventType } from '../../events';
import type { MatchState, PitchSide, TeamStatistics } from '../domain';
import { bumpPlayerStat, createScore } from '../domain';
import type { Rng } from '../../rng';
import {
  decideActionFromState,
  decidePossessionFromState,
} from '../../ai';

import { attributePlayerForEvent } from './attribute-player';

export type MatchEngineEmit = {
  readonly type: EngineEventType;
  readonly payload?: unknown;
};

function bumpTeamStat(
  stats: TeamStatistics,
  patch: Partial<TeamStatistics>,
): TeamStatistics {
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
): { state: MatchState; emits: MatchEngineEmit[] } {
  const emits: MatchEngineEmit[] = [];
  const decision = decideActionFromState(state, side);

  if (rng.next() >= decision.attackChance) {
    return { state, emits };
  }

  const actorId = attributePlayerForEvent(state, side, 'SHOT', tick);

  emits.push({ type: 'ATTACK', payload: { side, minute: state.clock.displayMinute } });

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
      return {
        state: Object.freeze({
          ...state,
          statistics: Object.freeze({
            ...state.statistics,
            home: side === 'away' ? nextTeam : state.statistics.home,
            away: side === 'home' ? nextTeam : state.statistics.away,
            players,
          }),
        }),
        emits,
      };
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
          home: side === 'home' ? bumpTeamStat(st, { corners: st.corners + 1 }) : next.statistics.home,
          away: side === 'away' ? bumpTeamStat(st, { corners: st.corners + 1 }) : next.statistics.away,
        }),
      });
    }
    return { state: next, emits };
  }

  if (rng.next() >= decision.goalChance) {
    return { state: next, emits };
  }

  emits.push({
    type: 'GOAL',
    payload: {
      side,
      minute: next.clock.displayMinute,
      ...(actorId !== undefined ? { playerId: actorId } : {}),
    },
  });
  const scored = side === 'home' ? next.statistics.home : next.statistics.away;
  let goalPlayers = next.statistics.players;
  if (actorId !== undefined) {
    const row = goalPlayers.find((p) => p.playerId === actorId);
    if (row) {
      goalPlayers = bumpPlayerStat(goalPlayers, actorId, { goals: row.goals + 1 });
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
        side === 'home'
          ? bumpTeamStat(scored, { goals: scored.goals + 1 })
          : next.statistics.home,
      away:
        side === 'away'
          ? bumpTeamStat(scored, { goals: scored.goals + 1 })
          : next.statistics.away,
      players: goalPlayers,
    }),
  });

  return { state: next, emits };
}
