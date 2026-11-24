'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { emergencyJunior, missingRole } from '@/lib/squad/emergency-junior';
import type { EmergencyJuniorState } from '@/lib/squad/emergency-action-state';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { tryAdminClient } from '@/lib/supabase/admin';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

const NOT_NEEDED = 'Możesz już wystawić jedenastkę. Ustaw skład.';

/** A free junior for a club that cannot field a legal eleven. The database checks it again. */
export async function callEmergencyJunior(): Promise<EmergencyJuniorState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const club = await getManagerClub().catch(() => null);
  if (!club) return { error: 'Nie znaleziono klubu.' };
  const rows = await listClubPlayers(club.id).catch(() => null);
  if (!rows) return { error: 'Nie udało się odczytać kadry. Spróbuj ponownie.' };
  const seniors = filterSeniorPlayers(rows);
  const squad = seniors.length > 0 ? resolveClubSquad(club, seniors).players : [];
  const role = missingRole(squad, utcDateString());
  if (!role) return { error: NOT_NEEDED };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Powołanie nie jest skonfigurowane na serwerze.' };

  const junior = emergencyJunior(club.leagueTier, `${club.id}:${crypto.randomUUID()}`);
  const { data, error } = await admin.rpc(
    'call_emergency_junior' as never,
    {
      p_club_id: club.id,
      p_player: { ...junior, ...role },
      p_max_roster: TRANSFERS_THIN.MAX_ROSTER,
    } as never,
  );
  const result = data as { ok?: boolean; reason?: string; name?: string } | null;
  if (error || !result) return { error: 'Nie udało się powołać juniora. Spróbuj ponownie.' };
  if (result.ok !== true) {
    if (result.reason === 'not_needed') return { error: NOT_NEEDED };
    return {
      error:
        result.reason === 'roster'
          ? `Kadra ma już ${TRANSFERS_THIN.MAX_ROSTER} zawodników. Każdy dzień bez meczu skraca kontuzje i zawieszenia.`
          : 'Nie ma wolnego numeru koszulki.',
    };
  }
  revalidatePath('/', 'layout');
  return { ok: true, name: result.name };
}
