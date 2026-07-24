import { requireOpponent } from '@/lib/fixtures/opponent-catalog';
import type { FixtureDto, FixtureRow, FixtureStatus } from '@/lib/fixtures/types';

function asStatus(raw: string): FixtureStatus {
  if (raw === 'upcoming' || raw === 'played' || raw === 'scheduled') return raw;
  return 'scheduled';
}

export function mapFixtureRow(row: FixtureRow): FixtureDto {
  return {
    id: row.id,
    clubId: row.club_id,
    matchday: row.matchday,
    competition: 'league',
    opponentClubId: row.opponent_club_id,
    opponent: requireOpponent(row.opponent_club_id),
    isHome: row.is_home,
    status: asStatus(row.status),
    homeScore: row.home_score,
    awayScore: row.away_score,
    playedAt: row.played_at,
    createdAt: row.created_at,
  };
}
