/** Branded-ish string IDs — plain strings at runtime for JSON replay. */

export type { MatchId, PlayerId, TeamId } from '@lastfootball/domain';

export type PitchSide = 'home' | 'away';

export type PitchRole =
  | 'GK'
  | 'RB'
  | 'CB'
  | 'LB'
  | 'RWB'
  | 'LWB'
  | 'CDM'
  | 'CM'
  | 'CAM'
  | 'RM'
  | 'LM'
  | 'RW'
  | 'LW'
  | 'ST'
  | 'CF';

/** Integer rating band used across attributes/skills (deterministic, JSON-safe). */
export type Rating = number;

/** Pitch-relative coordinates in metres from pitch origin (design contract). */
export interface PitchPoint {
  readonly x: number;
  readonly y: number;
}
