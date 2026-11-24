import { ACADEMY_UPKEEP, UPKEEP_LABEL, UPKEEP_SHORT_LABEL } from '@/lib/academy/levels';
import type { toStoredPlayers } from '@/lib/match/match-players';
import type { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type SettleDb = Pick<NonNullable<ReturnType<typeof tryAdminClient>>, 'rpc'>;

export type Settlement = { readonly applied: boolean; readonly paid: number };

/**
 * One transaction for result, cash and ledger. The academy level is read there, under the club
 * lock, so no failed read here can skip the upkeep.
 */
export async function settleFixture(
  db: SettleDb,
  args: Readonly<Record<string, unknown>>,
  players: ReturnType<typeof toStoredPlayers> = [],
): Promise<Settlement | null> {
  const full = {
    ...args,
    p_upkeep_by_level: args.p_upkeep_by_level ?? ACADEMY_UPKEEP,
    p_upkeep_label: UPKEEP_LABEL,
    p_upkeep_short_label: UPKEEP_SHORT_LABEL,
  };
  // D143: with the players of the match. An older database settles without them.
  let result = await db.rpc('settle_match' as never, { p_args: full, p_players: players } as never);
  if (result.error?.code === 'PGRST202') {
    result = await db.rpc('settle_fixture' as never, full as never);
  }
  if (result.error) console.error('settleFixture failed', { code: result.error.code });
  return result.error ? null : (result.data as Settlement | null);
}
