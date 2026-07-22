/**
 * Shared domain DTOs — no I/O, no React, no Supabase.
 * Placeholder types for the foundation layer only.
 */

export type PlayerId = string;
export type TeamId = string;
export type MatchId = string;

export interface PlayerAttributes {
  speed: number;
  shooting: number;
  passing: number;
  defending: number;
  stamina: number;
}

export interface Player {
  id: PlayerId;
  teamId: TeamId;
  name: string;
  position: string;
  attributes: PlayerAttributes;
  energy: number;
  isStarting: boolean;
}

export interface Team {
  id: TeamId;
  name: string;
  wins: number;
  draws: number;
  losses: number;
}

export type FormationCode = '4-4-2' | '4-3-3' | '4-2-3-1' | '3-5-2' | '5-3-2';
