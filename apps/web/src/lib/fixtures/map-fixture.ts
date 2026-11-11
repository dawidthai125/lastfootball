import { findCupGuest } from '@/lib/cup/cup-guests';
import { requireOpponent } from '@/lib/fixtures/opponent-catalog';
import type { FixtureDto, FixtureRow, FixtureStatus } from '@/lib/fixtures/types';

function asStatus(raw: string): FixtureStatus {
  if (raw === 'upcoming' || raw === 'played' || raw === 'scheduled') return raw;
  return 'scheduled';
}

export function mapFixtureRow(row: FixtureRow): FixtureDto {
  const competition =
    row.competition === 'cup' ? 'cup' : row.competition === 'challenge' ? 'challenge' : 'league';
  const opponent =
    competition === 'challenge'
      ? { id: row.opponent_club_id, name: 'Rywal', shortName: 'RYW' }
      : (findCupGuest(row.opponent_club_id) ?? requireOpponent(row.opponent_club_id));
  return {
    id: row.id,
    clubId: row.club_id,
    matchday: row.matchday,
    competition,
    opponentClubId: row.opponent_club_id,
    opponent,
    isHome: row.is_home,
    status: asStatus(row.status),
    homeScore: row.home_score,
    awayScore: row.away_score,
    playedAt: row.played_at,
    createdAt: row.created_at,
  };
}
