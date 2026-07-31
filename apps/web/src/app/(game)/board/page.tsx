import { redirect } from 'next/navigation';

import { BoardView } from '@/components/board/BoardView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { countPlayedInList, ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { resolveClubBoard } from '@/lib/board';
import { resolveSeasonReport } from '@/lib/season';

/**
 * Board — fed only by resolveClubBoard() (LFE-BOARD-01 · D102).
 * Information Thin — no Server Actions / no persist (D103).
 */
export default async function BoardPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const table = resolveLeagueTable(club, fixtures);
  const playerRow = table.rows.find((r) => r.isPlayer);
  const seasonReport =
    club.seasonPhase === 'offseason'
      ? resolveSeasonReport(table, club.seasonNumber, club.leagueTier)
      : null;

  const board = resolveClubBoard({
    seasonPhase: club.seasonPhase,
    seasonNumber: club.seasonNumber,
    playerPosition: playerRow?.position ?? null,
    tableSize: table.rows.length,
    playedCount: countPlayedInList(fixtures),
    seasonReport,
  });

  return <BoardView board={board} />;
}
