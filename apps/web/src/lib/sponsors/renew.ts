import { creditClubCash } from '@/lib/finance/club-cash';
import { ensureClubSponsorContract, getClubSponsorContract } from '@/lib/sponsors/get-contract';
import { createAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id and writes with the admin client.

/**
 * Flat renew + base payout once for nextSeason (Owner LOCK 2 · 8).
 * Called only from confirmStartNextSeason.
 */
export async function renewSponsorAndPayBase(params: {
  readonly clubId: string;
  readonly nextSeason: number;
  readonly currentCash: number;
  /** When set, the next contract follows the crowd and the league rung. */
  readonly quote?: { readonly base: number; readonly bonus: number };
}): Promise<{ ok: true; nextCash: number } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  let contract = await getClubSponsorContract(params.clubId);
  if (!contract) {
    contract = await ensureClubSponsorContract(params.clubId, Math.max(1, params.nextSeason - 1));
  }
  if (!contract) {
    return { ok: false, error: 'Brak kontraktu sponsora.' };
  }

  const nextSeason = Math.max(1, Math.trunc(params.nextSeason));
  const now = new Date().toISOString();
  const nextBase = params.quote?.base ?? contract.base_amount;
  const nextBonus = params.quote?.bonus ?? contract.bonus_amount;

  if (contract.base_paid_season_number === nextSeason) {
    return { ok: true, nextCash: params.currentCash };
  }

  const amount = nextBase;

  const { data: paid, error: markErr } = await supabase
    .from('club_sponsor_contracts')
    .update({
      season_number: nextSeason,
      base_amount: nextBase,
      bonus_amount: nextBonus,
      bonus_claimed_at: null,
      renewal_accepted_at: null,
      base_paid_season_number: nextSeason,
      updated_at: now,
    } as never)
    .eq('id', contract.id)
    .or(`base_paid_season_number.is.null,base_paid_season_number.neq.${nextSeason}`)
    .select('id')
    .maybeSingle();

  if (markErr) {
    return { ok: false, error: 'Nie udało się zarejestrować wypłaty bazowej.' };
  }

  if (!paid) {
    return { ok: true, nextCash: params.currentCash };
  }

  const nextCash = await creditClubCash(params.clubId, amount);
  if (nextCash == null) {
    await supabase
      .from('club_sponsor_contracts')
      .update({
        season_number: contract.season_number,
        base_amount: contract.base_amount,
        bonus_amount: contract.bonus_amount,
        bonus_claimed_at: contract.bonus_claimed_at,
        renewal_accepted_at: contract.renewal_accepted_at,
        base_paid_season_number: contract.base_paid_season_number,
      } as never)
      .eq('id', contract.id);
    return { ok: false, error: 'Nie udało się wypłacić przychodu sponsora.' };
  }

  await supabase.from('finance_movements').insert({
    club_id: params.clubId,
    category: 'sponsor_base',
    label: `Przychód sponsorski · ${contract.brand_name} · Sezon ${nextSeason}`,
    amount,
  } as never);

  return { ok: true, nextCash };
}
