import { findCupGuest } from '@/lib/cup/cup-guests';
import { requireOpponent } from '@/lib/fixtures/opponent-catalog';

/** One stored match, seen from our side. */
export type ClubMatch = {
  readonly season: number;
  readonly competition: string;
  readonly opponent: string;
  readonly ours: number;
  readonly theirs: number;
  readonly playedAt: string;
};

export type ClubMatchRow = {
  season_number: number;
  competition: string;
  opponent_club_id: string;
  opponent_name: string | null;
  is_home: boolean;
  home_score: number;
  away_score: number;
  played_at: string;
};

export function fromClubMatchRow(row: ClubMatchRow): ClubMatch {
  return {
    season: row.season_number,
    competition: row.competition,
    opponent:
      row.opponent_name ??
      (findCupGuest(row.opponent_club_id) ?? requireOpponent(row.opponent_club_id)).name,
    ours: row.is_home ? row.home_score : row.away_score,
    theirs: row.is_home ? row.away_score : row.home_score,
    playedAt: row.played_at,
  };
}

export type ClubRecords = {
  readonly played: number;
  readonly won: number;
  readonly drawn: number;
  readonly lost: number;
  readonly goalsFor: number;
  readonly goalsAgainst: number;
  readonly biggestWin: ClubMatch | null;
  readonly biggestLoss: ClubMatch | null;
  readonly wildest: ClubMatch | null;
  readonly winStreak: number;
  readonly unbeatenStreak: number;
};

/** Pure. A record is set by the first match that reaches it. */
export function resolveClubRecords(matches: readonly ClubMatch[]): ClubRecords {
  const inOrder = [...matches].sort((a, b) => a.playedAt.localeCompare(b.playedAt));
  const best = (score: (m: ClubMatch) => number): ClubMatch | null => {
    let top: ClubMatch | null = null;
    for (const m of inOrder) {
      if (score(m) > 0 && (!top || score(m) > score(top))) top = m;
    }
    return top;
  };
  const streak = (counts: (m: ClubMatch) => boolean): number => {
    let longest = 0;
    let now = 0;
    for (const m of inOrder) {
      now = counts(m) ? now + 1 : 0;
      longest = Math.max(longest, now);
    }
    return longest;
  };
  const won = inOrder.filter((m) => m.ours > m.theirs).length;
  const lost = inOrder.filter((m) => m.ours < m.theirs).length;
  return {
    played: inOrder.length,
    won,
    lost,
    drawn: inOrder.length - won - lost,
    goalsFor: inOrder.reduce((sum, m) => sum + m.ours, 0),
    goalsAgainst: inOrder.reduce((sum, m) => sum + m.theirs, 0),
    // Equal margins: more goals scored.
    biggestWin: best((m) => (m.ours > m.theirs ? (m.ours - m.theirs) * 100 + m.ours : 0)),
    biggestLoss: best((m) => (m.theirs > m.ours ? (m.theirs - m.ours) * 100 + m.theirs : 0)),
    wildest: best((m) => m.ours + m.theirs),
    winStreak: streak((m) => m.ours > m.theirs),
    unbeatenStreak: streak((m) => m.ours >= m.theirs),
  };
}
