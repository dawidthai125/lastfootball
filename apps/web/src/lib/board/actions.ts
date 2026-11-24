'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import type { BoardTaskActionState } from '@/lib/board/action-types';
import { loadBoardState } from '@/lib/board/load-board-state';
import { payBoardTask } from '@/lib/board/store';
import { parseBoardTaskBlock } from '@/lib/board/tasks';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { tryAdminClient } from '@/lib/supabase/admin';

/** The browser only names the block: club, completion and reward come from the server. */
export async function collectTaskReward(
  _prev: BoardTaskActionState,
  formData: FormData,
): Promise<BoardTaskActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const block = parseBoardTaskBlock(formData.get('block'));
  if (!block) return { error: 'Nie znaleziono zadania.' };

  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Nagroda jest chwilowo niedostępna.' };

  const board = await loadBoardState(club, await listClubFixtures(club.id));
  const task = board?.tasks.find((item) => item.block === block);
  if (task?.state === 'claimed') return { error: null };
  if (task?.state !== 'done') return { error: 'To zadanie nie jest wykonane.' };

  const paid = await payBoardTask(admin, {
    clubId: club.id,
    seasonNumber: club.seasonNumber,
    task,
  });
  if (!paid) return { error: 'Nie udało się wypłacić nagrody. Spróbuj ponownie.' };

  revalidatePath('/', 'layout');
  return { error: null };
}
