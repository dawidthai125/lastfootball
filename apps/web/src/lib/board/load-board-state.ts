import { env } from '@/config/env';
import { resolveBoardState, type BoardState } from '@/lib/board/board-state';
import type { BoardClub } from '@/lib/board/season-history';
import { loadBoardRecords, type BoardReadDb } from '@/lib/board/store';
import type { FixtureDto } from '@/lib/fixtures/types';
import { createClient } from '@/lib/supabase/server';

/** Read with the player session, so row level security keeps it to the own club. */
export async function loadBoardState(
  club: BoardClub,
  fixtures: readonly FixtureDto[],
): Promise<BoardState | null> {
  if (!env.isSupabaseConfigured) return null;
  const session = (await createClient()) as unknown as BoardReadDb;
  return resolveBoardState(club, fixtures, await loadBoardRecords(session, club.id));
}
