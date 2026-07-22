import type { FormationCode, Player, TeamId } from '@lastfootball/domain';

/** Placeholder contracts — no simulation fields beyond identity. */
export interface MatchInput {
  seed: number;
  homeTeamId: TeamId;
  awayTeamId: TeamId;
  homeLineup: Player[];
  awayLineup: Player[];
  homeFormation: FormationCode;
  awayFormation: FormationCode;
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

export interface MatchHandle {
  /** Always throws until simulation is implemented. */
  runToEnd(): MatchResult;
  getEvents(): MatchEvent[];
}
