import { resolveBoardState } from '@/lib/board/board-state';
import type { PrestigeDto } from '@/lib/board/prestige';
import { buildSeasonHistory, type BoardClub } from '@/lib/board/season-history';
import {
  loadBoardRecords,
  payBoardTask,
  saveSeasonHistory,
  type BoardWriteDb,
} from '@/lib/board/store';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { PromotionOutcomeKind } from '@/lib/league/league-tier';

// Not a 'use server' module on purpose: it takes a club and writes with the admin client.

export type CloseBoardSeason =
  | {
      readonly ok: true;
      readonly prestige: PrestigeDto | null;
      /** Set on a retry whose fixtures are already gone: the first result stands. */
      readonly storedOutcome: PromotionOutcomeKind | null;
    }
  | { readonly ok: false; readonly error: string };

/**
 * Season transition, before the fixtures are deleted: pays every completed task nobody
 * collected, then writes the season once. Any doubt stops the transition, so nothing is lost.
 */
export async function closeBoardSeason(
  db: BoardWriteDb,
  club: BoardClub,
  fixtures: readonly FixtureDto[],
): Promise<CloseBoardSeason> {
  const records = await loadBoardRecords(db, club.id);
  if (records.status === 'missing') return { ok: true, prestige: null, storedOutcome: null };
  if (records.status === 'error') {
    return { ok: false, error: 'Nie udało się wczytać historii klubu. Spróbuj ponownie.' };
  }
  const state = resolveBoardState(club, fixtures, records);
  const stored = records.history.find((row) => row.seasonNumber === club.seasonNumber);
  if (stored) {
    return { ok: true, prestige: state?.prestige ?? null, storedOutcome: stored.outcome };
  }

  const history = buildSeasonHistory(club, fixtures);
  // A season that was cleared before this feature existed has nothing to record.
  if (history) {
    for (const task of state?.tasks ?? []) {
      if (task.state !== 'done') continue;
      if (!(await payBoardTask(db, { clubId: club.id, seasonNumber: club.seasonNumber, task }))) {
        return { ok: false, error: 'Nie udało się wypłacić zadań zarządu. Spróbuj ponownie.' };
      }
    }
    if (!(await saveSeasonHistory(db, club.id, history))) {
      return { ok: false, error: 'Nie udało się zapisać historii sezonu. Spróbuj ponownie.' };
    }
  }
  return { ok: true, prestige: state?.prestige ?? null, storedOutcome: null };
}
