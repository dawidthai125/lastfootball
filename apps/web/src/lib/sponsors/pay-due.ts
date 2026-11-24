import { recordMovement } from '@/lib/finance/record-movement';
import { creditClubCash } from '@/lib/finance/club-cash';
import { readClubSponsorContract } from '@/lib/sponsors/get-contract';
import { resolveClubSponsors, type ClubSponsorContractRow } from '@/lib/sponsors/types';
import { createAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id and writes with the admin client.

/** Marks first, then pays: a second request finds the mark. A failed payment gives it back. */
export async function paySponsorBonus(
  clubId: string,
  contract: ClubSponsorContractRow,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createAdminClient();
  const claimedAt = new Date().toISOString();
  const { data: updated, error } = await supabase
    .from('club_sponsor_contracts')
    .update({ bonus_claimed_at: claimedAt, updated_at: claimedAt } as never)
    .eq('id', contract.id)
    .eq('season_number', contract.season_number)
    .is('bonus_claimed_at', null)
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, error: 'Nie udało się zarejestrować odbioru bonusu.' };
  if (!updated) return { ok: true };

  if ((await creditClubCash(clubId, contract.bonus_amount)) == null) {
    await supabase
      .from('club_sponsor_contracts')
      .update({ bonus_claimed_at: null } as never)
      .eq('id', contract.id)
      .eq('bonus_claimed_at', claimedAt);
    return { ok: false, error: 'Nie udało się wypłacić bonusu.' };
  }

  await recordMovement({
    club_id: clubId,
    category: 'sponsor_bonus',
    label: `Bonus sponsorski · ${contract.brand_name}`,
    amount: contract.bonus_amount,
  });
  return { ok: true };
}

/** D136: season start pays the bonus nobody collected. No finished table → nothing to decide. */
export async function payClosedSeasonBonus(input: {
  readonly clubId: string;
  readonly endedSeason: number;
  readonly position: number | null;
  readonly tableSize: number;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (input.position == null) return { ok: true };
  const contract = await readClubSponsorContract(input.clubId);
  if (contract === 'error') return { ok: false, error: 'Nie udało się odczytać umowy sponsora.' };
  if (!contract || contract.season_number !== input.endedSeason) return { ok: true };
  const { bonusState } = resolveClubSponsors({
    contract,
    seasonPhase: 'offseason',
    playerPosition: input.position,
    tableSize: input.tableSize,
  });
  return bonusState === 'claimable' ? paySponsorBonus(input.clubId, contract) : { ok: true };
}

/** The first contract has no season start behind it, so its base was never paid (D136). */
export function firstBaseDue(
  contract: Pick<ClubSponsorContractRow, 'season_number' | 'base_paid_season_number'>,
  seasonNumber: number,
): boolean {
  return contract.base_paid_season_number === null && contract.season_number === seasonNumber;
}

/** Pays that base once, after a league match. A failure only waits for the next match. */
export async function payFirstSponsorBase(clubId: string, seasonNumber: number): Promise<void> {
  const contract = await readClubSponsorContract(clubId);
  if (contract === 'error' || !contract || !firstBaseDue(contract, seasonNumber)) return;

  const supabase = createAdminClient();
  const { data: marked, error } = await supabase
    .from('club_sponsor_contracts')
    .update({ base_paid_season_number: seasonNumber } as never)
    .eq('id', contract.id)
    .eq('season_number', seasonNumber)
    .is('base_paid_season_number', null)
    .select('id')
    .maybeSingle();
  if (error) console.error('payFirstSponsorBase failed', { code: error.code });
  if (error || !marked) return;

  if ((await creditClubCash(clubId, contract.base_amount)) == null) {
    console.error('payFirstSponsorBase: credit failed');
    await supabase
      .from('club_sponsor_contracts')
      .update({ base_paid_season_number: null } as never)
      .eq('id', contract.id)
      .eq('season_number', seasonNumber);
    return;
  }
  await recordMovement({
    club_id: clubId,
    category: 'sponsor_base',
    label: `Przychód sponsorski · ${contract.brand_name} · Sezon ${seasonNumber}`,
    amount: contract.base_amount,
  });
}
