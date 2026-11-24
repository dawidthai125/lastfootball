import { readClubSponsorContract } from '@/lib/sponsors/get-contract';
import { resolveClubSponsors, type ClubSponsorContractRow } from '@/lib/sponsors/types';
import { createAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id and writes with the admin client.

/** Mark, cash and ledger land together, so a second request finds the bonus paid. */
export async function paySponsorBonus(
  clubId: string,
  contract: ClubSponsorContractRow,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { error } = await createAdminClient().rpc(
    'pay_sponsor_bonus' as never,
    {
      p_club_id: clubId,
      p_season: contract.season_number,
      p_label: `Bonus sponsorski · ${contract.brand_name}`,
    } as never,
  );
  if (error) {
    console.error('paySponsorBonus failed', { code: error.code });
    return { ok: false, error: 'Nie udało się wypłacić bonusu.' };
  }
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

  const { error } = await createAdminClient().rpc(
    'pay_first_sponsor_base' as never,
    {
      p_club_id: clubId,
      p_season: seasonNumber,
      p_label: `Przychód sponsorski · ${contract.brand_name} · Sezon ${seasonNumber}`,
    } as never,
  );
  if (error) console.error('payFirstSponsorBase failed', { code: error.code });
}
