import type { TeamId } from '@lastfootball/domain';

import type { Bench, Lineup, MatchSettings, Player } from './domain';

/**
 * Input contract to create a match session (see MatchSessionConfig).
 */
export interface MatchInput {
  seed: number;
  matchId?: string;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeLineup: Lineup;
  awayLineup: Lineup;
  homeBench: Bench;
  awayBench: Bench;
  /** Full roster referenced by lineups/benches. */
  players: readonly Player[];
  settings?: Partial<MatchSettings>;
  /** Side that owns MatchState.tactics. Defaults to home. */
  tacticsSide?: 'home' | 'away';
  /** Kickoff pressing for the tactics owner. Omitted keeps the default 50. */
  openingPressing?: number;
  /** Kickoff tempo for the tactics owner. Omitted keeps the default 50. */
  openingTempo?: number;
}

export interface MatchEvent {
  minute: number;
  type: string;
  message: string;
}

export interface MatchResult {
  homeGoals: number;
  awayGoals: number;
  events: MatchEvent[];
  completed: boolean;
}

/**
 * @deprecated Use MatchSession (EPIC-6). Kept for type compatibility.
 */
export type MatchHandle = import('./session/session').MatchSession;
