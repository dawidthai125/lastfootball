import { resolveBoardState } from '@/lib/board/board-state';
import type { PrestigeDto } from '@/lib/board/prestige';
import { buildSeasonHistory, type BoardClub, type SeasonHistory } from '@/lib/board/season-history';
import { loadBoardRecords, payBoardTask, type BoardWriteDb } from '@/lib/board/store';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { PromotionOutcomeKind } from '@/lib/league/league-tier';

// Not a 'use server' module on purpose: it takes a club and writes with the admin client.

export type CloseBoardSeason =
  | {
      readonly ok: true;
      readonly prestige: PrestigeDto | null;
      /** To store together with the fixture delete. Null when there is nothing to store. */
      readonly history: SeasonHistory | null;
      /** Set on a retry whose fixtures are already gone: the first result stands. */
      readonly storedOutcome: PromotionOutcomeKind | null;
    }
  | { readonly ok: false; readonly error: string };

/**
 * Season transition, before the fixtures are deleted: pays every completed task nobody
 * collected and hands over the season record. Any doubt stops the transition, so nothing
 * is lost. The record is written later, in the same transaction as the fixture delete.
 */
export async function closeBoardSeason(
  db: BoardWriteDb,
  club: BoardClub,
  fixtures: readonly FixtureDto[],
): Promise<CloseBoardSeason> {
  const records = await loadBoardRecords(db, club.id);
  const state = resolveBoardState(club, fixtures, records);
  if (records.status !== 'ok' || !state) {
    return { ok: false, error: 'Nie udało się wczytać historii klubu. Spróbuj ponownie.' };
  }
  const { prestige } = state;
  const stored = records.history.find((row) => row.seasonNumber === club.seasonNumber);
  if (stored) return { ok: true, prestige, history: null, storedOutcome: stored.outcome };

  const history = buildSeasonHistory(club, fixtures);
  // A season that was cleared before this feature existed has nothing to pay or record.
  for (const task of history ? state.tasks : []) {
    if (task.state !== 'done') continue;
    if (!(await payBoardTask(db, { clubId: club.id, seasonNumber: club.seasonNumber, task }))) {
      return { ok: false, error: 'Nie udało się wypłacić zadań zarządu. Spróbuj ponownie.' };
    }
  }
  return { ok: true, prestige, history, storedOutcome: null };
}
