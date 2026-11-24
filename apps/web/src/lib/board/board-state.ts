/** Prestige and tasks of one club, from stored records and fixtures (D131). Pure. */

import { resolvePrestige, type PrestigeDto } from '@/lib/board/prestige';
import { buildSeasonHistory, type BoardClub } from '@/lib/board/season-history';
import type { BoardRecords } from '@/lib/board/store';
import { resolveBoardTasks, type BoardTaskDto } from '@/lib/board/tasks';
import type { FixtureDto } from '@/lib/fixtures/types';

export type BoardState = {
  readonly prestige: PrestigeDto;
  readonly tasks: readonly BoardTaskDto[];
};

/**
 * Null without the tables. A closed season counts from its last match, so the sponsor
 * page shows the quote that the season start will use.
 */
export function resolveBoardState(
  club: BoardClub,
  fixtures: readonly FixtureDto[],
  records: BoardRecords,
): BoardState | null {
  if (records.status !== 'ok') return null;
  const tasks = resolveBoardTasks({
    clubId: club.id,
    seasonNumber: club.seasonNumber,
    leagueTier: club.leagueTier,
    fixtures,
    claims: records.claims,
  });
  const stored = records.history.some((row) => row.seasonNumber === club.seasonNumber);
  const closing = stored ? null : buildSeasonHistory(club, fixtures);
  const prestige = resolvePrestige({
    leagueTier: club.leagueTier,
    history: closing ? [closing, ...records.history] : records.history,
    completedTaskSeasons: [
      ...records.claims.map((claim) => claim.seasonNumber),
      ...tasks.filter((task) => task.state === 'done').map(() => club.seasonNumber),
    ],
  });
  return { prestige, tasks };
}
