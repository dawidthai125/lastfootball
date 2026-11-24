import {
  PLAYER_RANKING_DAYS,
  resolvePlayerRanking,
  type PlayerRankingRow,
  type RankingInputRow,
} from '@/lib/ranking/player-ranking';
import { tryAdminClient } from '@/lib/supabase/admin';

/** Null = the read failed. Server only: the function is closed to player sessions. */
export async function loadPlayerRanking(
  now: Date = new Date(),
): Promise<readonly PlayerRankingRow[] | null> {
  const since = new Date(now.getTime() - PLAYER_RANKING_DAYS * 86_400_000).toISOString();
  const { data, error } =
    (await tryAdminClient()?.rpc('player_ranking' as never, { p_since: since } as never)) ?? {};
  if (error || !data) return null;
  return resolvePlayerRanking(data as unknown as RankingInputRow[]);
}
