/** What a manual claim may do (D131). Pure; `claim_board_task` repeats the season checks. */

import type { BoardState } from '@/lib/board/board-state';
import { buildSeasonHistory, type BoardClub } from '@/lib/board/season-history';
import type { BoardTaskBlock, BoardTaskDto } from '@/lib/board/tasks';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { ClubSeasonPhase } from '@/lib/season/types';

export type TaskClaim =
  | { readonly kind: 'pay'; readonly task: BoardTaskDto }
  | { readonly kind: 'claimed' }
  | { readonly kind: 'refused'; readonly error: string };

export function resolveTaskClaim(input: {
  readonly club: BoardClub & { readonly seasonPhase: ClubSeasonPhase };
  readonly fixtures: readonly FixtureDto[];
  /** Null when the records could not be read. */
  readonly board: BoardState | null;
  readonly block: BoardTaskBlock;
}): TaskClaim {
  const { club, fixtures, board, block } = input;
  if (!board) {
    return { kind: 'refused', error: 'Nie udało się wczytać zadań. Spróbuj ponownie.' };
  }
  const task = board.tasks.find((item) => item.block === block);
  if (task?.state === 'claimed') return { kind: 'claimed' };
  // A failed read looks the same as an empty list.
  if (fixtures.length === 0) {
    return { kind: 'refused', error: 'Nie udało się wczytać terminarza. Spróbuj ponownie.' };
  }
  // A start that failed halfway leaves the next season's fixtures on the old season number.
  if (
    board.closed ||
    (club.seasonPhase === 'offseason' && buildSeasonHistory(club, fixtures) == null)
  ) {
    return { kind: 'refused', error: 'Ten sezon jest już rozliczony.' };
  }
  if (task?.state !== 'done') return { kind: 'refused', error: 'To zadanie nie jest wykonane.' };
  return { kind: 'pay', task };
}
