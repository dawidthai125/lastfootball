import type { PlayerId, PitchSide } from './ids';

/** Aggregate team counters — incremented by later systems. */
export interface TeamStatistics {
  readonly side: PitchSide;
  readonly goals: number;
  readonly shots: number;
  readonly shotsOnTarget: number;
  readonly possessionTicks: number;
  readonly passesAttempted: number;
  readonly passesCompleted: number;
  readonly tackles: number;
  readonly fouls: number;
  readonly corners: number;
  readonly offsides: number;
  readonly yellowCards: number;
  readonly redCards: number;
}

export interface PlayerStatistics {
  readonly playerId: PlayerId;
  readonly side: PitchSide;
  readonly goals: number;
  readonly assists: number;
  readonly shots: number;
  readonly passesAttempted: number;
  readonly passesCompleted: number;
  readonly tackles: number;
  readonly foulsCommitted: number;
  readonly yellowCards: number;
  readonly redCards: number;
  readonly minutesPlayed: number;
}

export interface Statistics {
  readonly home: TeamStatistics;
  readonly away: TeamStatistics;
  readonly players: readonly PlayerStatistics[];
}

export function emptyTeamStatistics(side: PitchSide): TeamStatistics {
  return Object.freeze({
    side,
    goals: 0,
    shots: 0,
    shotsOnTarget: 0,
    possessionTicks: 0,
    passesAttempted: 0,
    passesCompleted: 0,
    tackles: 0,
    fouls: 0,
    corners: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
  });
}

export function emptyStatistics(): Statistics {
  return Object.freeze({
    home: emptyTeamStatistics('home'),
    away: emptyTeamStatistics('away'),
    players: Object.freeze([]),
  });
}
