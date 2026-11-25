import {
  PLAYER_RANKING_DAYS,
  resolvePlayerRanking,
  type PlayerRankingRow,
  type RankingInputRow,
} from '@/lib/ranking/player-ranking';
import { tryAdminClient } from '@/lib/supabase/admin';
import { readPages } from '@/lib/supabase/read-pages';

/** Null = the read failed. Server only: the function is closed to player sessions. */
export async function loadPlayerRanking(
  now: Date = new Date(),
): Promise<readonly PlayerRankingRow[] | null> {
  const since = new Date(now.getTime() - PLAYER_RANKING_DAYS * 86_400_000).toISOString();
  const admin = tryAdminClient();
  if (!admin) return null;
  const rows = await readPages<RankingInputRow>((from, to) =>
    admin
      .rpc('player_ranking' as never, { p_since: since } as never)
      .order('club_id' as never)
      .order('competition' as never)
      .order('match_tier' as never)
      .range(from, to),
  );
  return rows ? resolvePlayerRanking(rows) : null;
}
