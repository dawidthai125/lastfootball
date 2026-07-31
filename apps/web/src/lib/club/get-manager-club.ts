import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import type { ClubDto } from '@/lib/club/types';

type ClubRow = {
  id: string;
  owner_id: string;
  name: string;
  short_name: string;
  primary_color: string;
  secondary_color: string;
  crest_template_id: string;
  created_at: string;
  first_match_completed_at: string | null;
  cash_balance: number;
  transfer_window_open: boolean | null;
  last_training_on: string | null;
  season_number: number | null;
  season_phase: string | null;
};

function mapClub(row: ClubRow): ClubDto {
  const phase = row.season_phase === 'offseason' ? 'offseason' : 'in_season';
  return {
    id: row.id,
    ownerId: row.owner_id,
    name: row.name,
    shortName: row.short_name,
    primaryColor: row.primary_color,
    secondaryColor: row.secondary_color,
    crestTemplateId: row.crest_template_id,
    createdAt: row.created_at,
    firstMatchCompletedAt: row.first_match_completed_at,
    cashBalance: row.cash_balance ?? 0,
    transferWindowOpen: Boolean(row.transfer_window_open),
    lastTrainingOn: row.last_training_on ?? null,
    seasonNumber: Math.max(1, Math.trunc(row.season_number ?? 1)),
    seasonPhase: phase,
  };
}

/** Current manager club from `clubs` table (SSOT). */
export async function getManagerClub(): Promise<ClubDto | null> {
  if (!env.isSupabaseConfigured) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('clubs')
    .select(
      'id, owner_id, name, short_name, primary_color, secondary_color, crest_template_id, created_at, first_match_completed_at, cash_balance, transfer_window_open, last_training_on, season_number, season_phase',
    )
    .eq('owner_id', user.id)
    .maybeSingle();

  if (error || !data) return null;
  return mapClub(data as ClubRow);
}
