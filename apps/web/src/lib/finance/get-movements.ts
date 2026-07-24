import { createClient } from '@/lib/supabase/server';
import { env } from '@/config/env';
import { mapFinanceMovementRow, type FinanceMovementRow } from '@/lib/finance/map-movement';
import type { FinanceMovementDto } from '@/lib/finance/types';

/** Latest movements for club (newest first). */
export async function listClubFinanceMovements(
  clubId: string,
  limit = 20,
): Promise<FinanceMovementDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('finance_movements')
    .select('id, club_id, category, label, amount, fixture_id, created_at')
    .eq('club_id', clubId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as FinanceMovementRow[]).map(mapFinanceMovementRow);
}
