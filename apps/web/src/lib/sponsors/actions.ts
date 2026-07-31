'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { resolveLeagueTable } from '@/lib/league/resolve-league-table';
import { listClubFixtures } from '@/lib/fixtures/get-fixture';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { ensureClubSponsorContract, getClubSponsorContract } from '@/lib/sponsors/get-contract';
import { resolveClubSponsors, type SponsorActionState } from '@/lib/sponsors/types';
import { createClient } from '@/lib/supabase/server';

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

  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' };

  const contract = await ensureClubSponsorContract(club.id, club.seasonNumber);
  if (!contract) return { error: 'Brak kontraktu sponsora.' };

  if (contract.bonus_claimed_at) {
    return { error: null };
  }

  const fixtures = await listClubFixtures(club.id);
  const table = resolveLeagueTable(club, fixtures);
  const dto = resolveClubSponsors({
    contract,
    seasonPhase: club.seasonPhase,
    playerPosition: table.rows.find((r) => r.isPlayer)?.position ?? null,
    tableSize: table.rows.length,
  });

  if (dto.bonusState !== 'claimable') {
    return { error: 'Bonus nie jest jeszcze dostępny.' };
  }

  const supabase = await createClient();
  const { data: clubRow, error: cashReadErr } = await supabase
    .from('clubs')
    .select('cash_balance')
    .eq('id', club.id)
    .maybeSingle();

  if (cashReadErr || !clubRow) {
    return { error: 'Nie udało się odczytać kasy.' };
  }

  const cash = (clubRow as { cash_balance: number }).cash_balance ?? 0;
  const amount = contract.bonus_amount;
  const claimedAt = new Date().toISOString();

  const { data: updated, error: claimErr } = await supabase
    .from('club_sponsor_contracts')
    .update({ bonus_claimed_at: claimedAt, updated_at: claimedAt } as never)
    .eq('id', contract.id)
    .is('bonus_claimed_at', null)
    .select('id')
    .maybeSingle();

  if (claimErr) {
    return { error: 'Nie udało się zarejestrować odbioru bonusu.' };
  }
  if (!updated) {
    return { error: null };
  }

  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: cash + amount } as never)
    .eq('id', club.id);

  if (cashErr) {
    return { error: 'Nie udało się wypłacić bonusu.' };
  }

  await supabase.from('finance_movements').insert({
    club_id: club.id,
    category: 'sponsor_bonus',
    label: `Bonus sponsorski · ${contract.brand_name}`,
    amount,
  } as never);

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

  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' };
  if (club.seasonPhase !== 'offseason') {
    return { error: 'Odnowienie dostępne tylko w przerwie.' };
  }

  const contract = await ensureClubSponsorContract(club.id, club.seasonNumber);
  if (!contract) return { error: 'Brak kontraktu sponsora.' };
  if (contract.renewal_accepted_at) {
    return { error: null };
  }

  const supabase = await createClient();
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

/**
 * Flat renew + base payout once for nextSeason (Owner LOCK 2 · 8).
 * Called only from confirmStartNextSeason.
 */
export async function renewSponsorAndPayBase(params: {
  readonly clubId: string;
  readonly nextSeason: number;
  readonly currentCash: number;
}): Promise<{ ok: true; nextCash: number } | { ok: false; error: string }> {
  const supabase = await createClient();
  let contract = await getClubSponsorContract(params.clubId);
  if (!contract) {
    contract = await ensureClubSponsorContract(params.clubId, Math.max(1, params.nextSeason - 1));
  }
  if (!contract) {
    return { ok: false, error: 'Brak kontraktu sponsora.' };
  }

  const nextSeason = Math.max(1, Math.trunc(params.nextSeason));
  const now = new Date().toISOString();

  // Flat renew — same Thin brand + amounts (D101 · Owner LOCK 8).
  const { error: renewErr } = await supabase
    .from('club_sponsor_contracts')
    .update({
      season_number: nextSeason,
      brand_key: contract.brand_key,
      brand_name: contract.brand_name,
      base_amount: contract.base_amount,
      bonus_amount: contract.bonus_amount,
      goal_kind: contract.goal_kind,
      goal_target: contract.goal_target,
      bonus_claimed_at: null,
      renewal_accepted_at: null,
      updated_at: now,
    } as never)
    .eq('id', contract.id);

  if (renewErr) {
    return { ok: false, error: 'Nie udało się odnowić kontraktu.' };
  }

  if (contract.base_paid_season_number === nextSeason) {
    return { ok: true, nextCash: params.currentCash };
  }

  const amount = contract.base_amount;
  const nextCash = params.currentCash + amount;

  const { data: paid, error: markErr } = await supabase
    .from('club_sponsor_contracts')
    .update({
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

  const { error: cashErr } = await supabase
    .from('clubs')
    .update({ cash_balance: nextCash } as never)
    .eq('id', params.clubId);

  if (cashErr) {
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
