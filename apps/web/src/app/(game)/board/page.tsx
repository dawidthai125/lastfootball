import { redirect } from 'next/navigation';

import { BoardView } from '@/components/board/BoardView';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { countPlayedInList, ensureClubFixtures } from '@/lib/fixtures';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { resolveClubBoard } from '@/lib/board';
import { loadBoardState } from '@/lib/board/load-board-state';
import { resolveDeparturePreview, resolveSeasonReport } from '@/lib/season';
import { listClubPlayers } from '@/lib/squad/get-players';

/**
 * Board — fed only by resolveClubBoard() (LFE-BOARD-01 · D102).
 * Prestige and tasks: D131. The only action lives in BoardTasksPanel.
 */
export default async function BoardPage() {
  const club = await getManagerClub();
  if (!club) redirect('/welcome');

  const fixtures = await ensureClubFixtures(club.id, { seasonPhase: club.seasonPhase });
  const table = resolveLeagueTable(club, fixtures);
  const playerRow = table.rows.find((r) => r.isPlayer);
  const offseason = club.seasonPhase === 'offseason';
  const seasonReport = offseason
    ? resolveSeasonReport(table, club.seasonNumber, club.leagueTier)
    : null;

  const players = offseason ? await listClubPlayers(club.id) : [];
  const departure = offseason
    ? resolveDeparturePreview(
        players.map((player) => ({
          id: player.id,
          name: player.name,
          age: player.age,
          skill: player.skill,
          academyTrack: Boolean(player.academyTrack),
          departed: player.departedAt != null || player.status === 'DEPARTED',
        })),
      )
    : null;

  const records = await loadBoardState(club, fixtures);
  const board = resolveClubBoard({
    seasonPhase: club.seasonPhase,
    seasonNumber: club.seasonNumber,
    playerPosition: playerRow?.position ?? null,
    tableSize: table.rows.length,
    playedCount: countPlayedInList(fixtures.filter((f) => f.competition === 'league')),
    seasonReport,
    departureNote: departure?.retire ? departure.summary : null,
    prestige: records?.prestige ?? null,
    tasks: records?.tasks ?? null,
  });

  return <BoardView board={board} />;
}
