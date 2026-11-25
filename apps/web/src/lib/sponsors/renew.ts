import { ensureClubSponsorContract, readClubSponsorContract } from '@/lib/sponsors/get-contract';
import { createAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id and writes with the admin client.

/**
 * Flat renew + base payout once for nextSeason (Owner LOCK 2 · 8), in one transaction.
 * Called only from confirmStartNextSeason.
 */
export async function renewSponsorAndPayBase(params: {
  readonly clubId: string;
  readonly nextSeason: number;
  /** When set, the next contract follows the crowd and the league rung. */
  readonly quote?: { readonly base: number; readonly bonus: number };
}): Promise<{ ok: true } | { ok: false; error: string }> {
  let contract = await readClubSponsorContract(params.clubId);
  if (contract === 'error') return { ok: false, error: 'Nie udało się odczytać umowy sponsora.' };
  if (!contract) {
    contract = await ensureClubSponsorContract(params.clubId, Math.max(1, params.nextSeason - 1));
  }
  if (!contract) {
    return { ok: false, error: 'Brak kontraktu sponsora.' };
  }

  const nextSeason = Math.max(1, Math.trunc(params.nextSeason));
  const { error } = await createAdminClient().rpc(
    'renew_sponsor' as never,
    {
      p_club_id: params.clubId,
      p_season: nextSeason,
      p_base: params.quote?.base ?? contract.base_amount,
      p_bonus: params.quote?.bonus ?? contract.bonus_amount,
      p_label: `Przychód sponsorski · ${contract.brand_name} · Sezon ${nextSeason}`,
    } as never,
  );
  if (error) {
    console.error('renewSponsorAndPayBase failed', { code: error.code });
    return { ok: false, error: 'Nie udało się wypłacić przychodu sponsora.' };
  }
  return { ok: true };
}
