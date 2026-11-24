import { toSeasonHistoryRow, type SeasonHistory } from '@/lib/board/season-history';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  applyLeagueTierOutcome,
  resolvePromotionOutcome,
  type LeagueTier,
  type PromotionOutcomeKind,
} from '@/lib/league/league-tier';
import { isSeasonCompleteTrigger } from '@/lib/season/types';
import type { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type StartDb = Pick<NonNullable<ReturnType<typeof tryAdminClient>>, 'rpc'>;

export type SeasonStartLock =
  | { readonly kind: 'held'; readonly token: string }
  /** Another request holds it, or the club already moved on. */
  | { readonly kind: 'busy' }
  | { readonly kind: 'error' };

/** One season start per club. A lock left by a dead request expires on its own. */
export async function lockSeasonStart(
  db: StartDb,
  clubId: string,
  endedSeason: number,
): Promise<SeasonStartLock> {
  const { data, error } = await db.rpc(
    'begin_season_start' as never,
    { p_club_id: clubId, p_season: endedSeason } as never,
  );
  if (error) {
    console.error('lockSeasonStart failed', { code: error.code });
    return { kind: 'error' };
  }
  return data ? { kind: 'held', token: String(data) } : { kind: 'busy' };
}

/** A failed release is safe: the lock expires. */
export async function unlockSeasonStart(db: StartDb, clubId: string, token: string): Promise<void> {
  try {
    const { error } = await db.rpc(
      'end_season_start' as never,
      { p_club_id: clubId, p_token: token } as never,
    );
    if (error) console.error('unlockSeasonStart failed', { code: error.code });
  } catch {
    console.error('unlockSeasonStart failed');
  }
}

/**
 * Season record and fixture delete in one transaction, so a stored season means its
 * fixtures are gone. Refused when the lock, the season or the results moved meanwhile.
 */
export async function clearSeasonFixtures(
  db: StartDb,
  input: {
    readonly clubId: string;
    readonly endedSeason: number;
    readonly token: string;
    readonly fixtures: readonly FixtureDto[];
    readonly history: SeasonHistory | null;
  },
): Promise<boolean> {
  const { data, error } = await db.rpc(
    'clear_season_fixtures' as never,
    {
      p_club_id: input.clubId,
      p_season: input.endedSeason,
      p_token: input.token,
      p_played: input.fixtures.filter((f) => f.status === 'played').length,
      p_history: input.history ? toSeasonHistoryRow(input.history) : null,
    } as never,
  );
  if (error || !data) console.error('clearSeasonFixtures failed', { code: error?.code });
  return !error && Boolean(data);
}

/** The stored result wins. An unfinished slate never moves a club between leagues. */
export function resolveNextTier(input: {
  readonly tier: LeagueTier;
  readonly fixtures: readonly FixtureDto[];
  readonly position: number | null;
  readonly tableSize: number;
  readonly storedOutcome: PromotionOutcomeKind | null;
}): LeagueTier {
  if (input.storedOutcome) return applyLeagueTierOutcome(input.tier, input.storedOutcome);
  if (input.position == null || !isSeasonCompleteTrigger(input.fixtures)) return input.tier;
  const { kind } = resolvePromotionOutcome(input.position, input.tableSize, input.tier);
  return applyLeagueTierOutcome(input.tier, kind);
}
