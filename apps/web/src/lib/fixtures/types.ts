import type { OpponentClub } from '@/lib/fixtures/opponent-catalog';

export type FixtureStatus = 'scheduled' | 'upcoming' | 'played';

export type FixtureDto = {
  readonly id: string;
  readonly clubId: string;
  readonly matchday: number;
  readonly competition: 'league' | 'cup' | 'challenge' | 'human';
  /** Liga ludzi: one seed for both clubs. Absent on bot-league fixtures. */
  readonly sharedSeed?: number;
  /** Catalog id — SSOT for opponent identity. */
  readonly opponentClubId: string;
  readonly opponent: OpponentClub;
  readonly isHome: boolean;
  readonly status: FixtureStatus;
  readonly homeScore: number | null;
  readonly awayScore: number | null;
  readonly playedAt: string | null;
  readonly createdAt: string;
};

export type FixtureRow = {
  id: string;
  club_id: string;
  matchday: number;
  competition: string;
  opponent_club_id: string;
  is_home: boolean;
  status: string;
  home_score: number | null;
  away_score: number | null;
  played_at: string | null;
  created_at: string;
};
