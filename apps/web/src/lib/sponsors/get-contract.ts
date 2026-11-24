import type { ClubSponsorContractRow } from '@/lib/sponsors/types';
import { buildStarterSponsorContractInsert } from '@/lib/sponsors/types';
import { tryAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';

export async function getClubSponsorContract(
  clubId: string,
): Promise<ClubSponsorContractRow | null> {
  const read = await readClubSponsorContract(clubId);
  return read === 'error' ? null : read;
}

/** A failed read is not a missing contract: whoever moves money must tell them apart. */
export async function readClubSponsorContract(
  clubId: string,
): Promise<ClubSponsorContractRow | null | 'error'> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('club_sponsor_contracts')
    .select(
      'id, club_id, brand_key, brand_name, season_number, base_amount, bonus_amount, goal_kind, goal_target, bonus_claimed_at, base_paid_season_number, renewal_accepted_at',
    )
    .eq('club_id', clubId)
    .maybeSingle();

  if (error) return 'error';
  return (data as ClubSponsorContractRow | null) ?? null;
}

/** Deterministic Thin seed for legacy clubs missing a row (createClub is primary path). */
export async function ensureClubSponsorContract(
  clubId: string,
  seasonNumber: number,
): Promise<ClubSponsorContractRow | null> {
  const existing = await getClubSponsorContract(clubId);
  if (existing) return existing;
  if (!env.isSupabaseConfigured) return null;

  const supabase = tryAdminClient();
  if (!supabase) return null;
  const insert = buildStarterSponsorContractInsert(clubId, seasonNumber);
  const { data, error } = await supabase
    .from('club_sponsor_contracts')
    .insert(insert as never)
    .select(
      'id, club_id, brand_key, brand_name, season_number, base_amount, bonus_amount, goal_kind, goal_target, bonus_claimed_at, base_paid_season_number, renewal_accepted_at',
    )
    .maybeSingle();

  if (error || !data) return null;
  return data as ClubSponsorContractRow;
}
