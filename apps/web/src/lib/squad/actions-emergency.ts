'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { emergencyJunior, emergencyNeed } from '@/lib/squad/emergency-junior';
import type { EmergencyJuniorState } from '@/lib/squad/emergency-action-state';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import { filterSeniorPlayers } from '@/lib/squad/types';
import { tryAdminClient } from '@/lib/supabase/admin';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

const RECALL = 'Najpierw ściągnij zawodników z wypożyczenia.';
/** A full squad with nobody to field still gets an eleven: 11 over the usual limit (D164). */
const EMERGENCY_MAX_ROSTER = TRANSFERS_THIN.MAX_ROSTER + 11;
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
  const role = emergencyNeed(squad, utcDateString());
  if (!role) return { error: NOT_NEEDED };
  if (role === 'recall') return { error: RECALL };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Powołanie nie jest skonfigurowane na serwerze.' };

  const junior = emergencyJunior(club.leagueTier, `${club.id}:${crypto.randomUUID()}`);
  const { data, error } = await admin.rpc(
    'call_emergency_junior' as never,
    {
      p_club_id: club.id,
      p_player: { ...junior, ...role },
      p_max_roster: EMERGENCY_MAX_ROSTER,
    } as never,
  );
  const result = data as { ok?: boolean; reason?: string; name?: string } | null;
  if (error || !result) return { error: 'Nie udało się powołać juniora. Spróbuj ponownie.' };
  if (result.ok !== true) {
    if (result.reason === 'not_needed') return { error: NOT_NEEDED };
    if (result.reason === 'recall') return { error: RECALL };
    return {
      error:
        result.reason === 'roster'
          ? `Kadra ma już ${EMERGENCY_MAX_ROSTER} zawodników. Każdy dzień bez meczu skraca kontuzje i zawieszenia.`
          : 'Nie ma wolnego numeru koszulki.',
    };
  }
  revalidatePath('/', 'layout');
  return { ok: true, name: result.name };
}
