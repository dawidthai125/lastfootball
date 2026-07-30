'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveHubPhase } from '@/lib/hub';
import { canAddToShortlist } from '@/lib/scouting/shortlist';
import { listScoutShortlistIds } from '@/lib/scouting/get-shortlist';
import type { ScoutingActionState } from '@/lib/scouting/types';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';
import { fetchLiveListings } from '@/lib/transfers/fetch-live-listings';

function revalidateScoutingPaths() {
  revalidatePath('/scouting');
}

async function requireSeasonClub() {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' } as const;
  }
  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' } as const;

  const fixtures = await listClubFixtures(club.id);
  const phase = resolveHubPhase(club, { hasFixtures: fixtures.length > 0 });
  if (phase !== 'SEASON' && phase !== 'PLAYOFF' && phase !== 'OFFSEASON') {
    return { error: 'Skauting odblokuje się w sezonie.' } as const;
  }
  return { club } as const;
}

/**
 * Add preference only — never mutates players / transfers / academy.
 */
export async function addScoutShortlist(
  prev: ScoutingActionState,
  formData: FormData,
): Promise<ScoutingActionState> {
  void prev;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };

  const supabase = await createClient();
  const [ownPlayers, liveListings, shortlistIds] = await Promise.all([
    listClubPlayers(club.id),
    fetchLiveListings(supabase, club.id),
    listScoutShortlistIds(club.id),
  ]);

  const check = canAddToShortlist(shortlistIds, playerId, ownPlayers, liveListings);
  if (!check.ok) return { error: check.error };

  const { error } = await supabase.from('scout_shortlist' as never).insert({
    club_id: club.id,
    player_id: playerId,
  } as never);

  if (error) {
    return { error: 'Nie udało się dodać do shortlisty.' };
  }

  revalidateScoutingPaths();
  return { ok: true, message: 'Dodano do shortlisty.' };
}

/**
 * Remove preference only — no market / player side-effects.
 */
export async function removeScoutShortlist(
  prev: ScoutingActionState,
  formData: FormData,
): Promise<ScoutingActionState> {
  void prev;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };

  const supabase = await createClient();
  const { error } = await supabase
    .from('scout_shortlist' as never)
    .delete()
    .eq('club_id', club.id)
    .eq('player_id', playerId);

  if (error) {
    return { error: 'Nie udało się usunąć z shortlisty.' };
  }

  revalidateScoutingPaths();
  return { ok: true, message: 'Usunięto z shortlisty.' };
}
