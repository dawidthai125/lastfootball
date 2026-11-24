'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubSponsorContract } from '@/lib/sponsors/get-contract';
import { paySponsorBonus } from '@/lib/sponsors/pay-due';
import { resolveClubSponsors, type SponsorActionState } from '@/lib/sponsors/types';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Idempotent bonus claim (Owner LOCK 7) — finance ledger only (D97).
 * Claimable only in offseason when goal complete (finish season top half).
 */
export async function claimSponsorBonus(
  _prev: SponsorActionState,
  _formData: FormData,
): Promise<SponsorActionState> {
  void _formData;
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const club = await getManagerClub().catch(() => null);
  if (!club) return { error: 'Nie znaleziono klubu.' };

  const contract = await ensureClubSponsorContract(club.id, club.seasonNumber);
  if (!contract) return { error: 'Brak kontraktu sponsora.' };
  // Renewed for the next season already: this season's bonus window is over.
  if (contract.season_number > club.seasonNumber) {
    return { error: 'Bonus nie jest jeszcze dostępny.' };
  }

  if (contract.bonus_claimed_at) {
    return { error: null };
  }

  const fixtures = await listClubFixtures(club.id);
  const table = resolveLeagueTable(club, fixtures);
  const playerRow = table.rows.find((r) => r.isPlayer);
  const dto = resolveClubSponsors({
    contract,
    seasonPhase: club.seasonPhase,
    playerPosition: playerRow?.position ?? null,
    tableSize: table.rows.length,
    leaguePlayed: playerRow?.played ?? 0,
  });

  if (dto.bonusState !== 'claimable') {
    return { error: 'Bonus nie jest jeszcze dostępny.' };
  }

  const paid = await paySponsorBonus(club.id, contract);
  if (!paid.ok) return { error: paid.error };

  revalidatePath('/', 'layout');
  return { error: null };
}

/**
 * Secondary Offseason Accept — non-blocking (D98).
 */
export async function acceptSponsorRenewal(
  _prev: SponsorActionState,
  _formData: FormData,
): Promise<SponsorActionState> {
  void _formData;
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const club = await getManagerClub().catch(() => null);
  if (!club) return { error: 'Nie znaleziono klubu.' };
  if (club.seasonPhase !== 'offseason') {
    return { error: 'Odnowienie dostępne tylko w przerwie.' };
  }

  const contract = await ensureClubSponsorContract(club.id, club.seasonNumber);
  if (!contract) return { error: 'Brak kontraktu sponsora.' };
  if (contract.renewal_accepted_at) {
    return { error: null };
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('club_sponsor_contracts')
    .update({ renewal_accepted_at: now, updated_at: now } as never)
    .eq('id', contract.id);

  if (error) {
    return { error: 'Nie udało się zaakceptować odnowienia.' };
  }

  revalidatePath('/', 'layout');
  return { error: null };
}
