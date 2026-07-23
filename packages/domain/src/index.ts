/**
 * Shared domain DTOs — manager / persistence facing.
 * Match simulation models live in `@lastfootball/lfe` → `match/domain` (EPIC-2).
 * No I/O, no React, no Supabase.
 */

export type PlayerId = string;
export type TeamId = string;
export type MatchId = string;

/** Manager-layer attribute snapshot (subset). Engine uses richer PlayerAttributes. */
export interface PlayerAttributes {
  speed: number;
  shooting: number;
  passing: number;
  defending: number;
  stamina: number;
}

/** Club roster DTO — not the in-match Player aggregate. */
export interface Player {
  id: PlayerId;
  teamId: TeamId;
  name: string;
  position: string;
  attributes: PlayerAttributes;
  energy: number;
  isStarting: boolean;
}

/** Club entity DTO — not the in-match Team aggregate. */
export interface Team {
  id: TeamId;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export type FormationCode = '4-4-2' | '4-3-3' | '4-2-3-1' | '3-5-2' | '5-3-2';
