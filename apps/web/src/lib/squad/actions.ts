'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { createClient } from '@/lib/supabase/server';
import { listClubPlayers } from '@/lib/squad/get-players';
import { resolveClubSquad } from '@/lib/squad/resolve-club-squad';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { validateStartingXi } from '@/lib/squad/validate-starting-xi';
import type { SaveXiActionState } from '@/lib/squad/xi-action-state';

/**
 * Persist Match XI — sets players.starter for manager club (exactly 11).
 */
export async function saveStartingXi(
  _prev: SaveXiActionState,
  formData: FormData,
): Promise<SaveXiActionState> {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' };
  }

  const matchId = String(formData.get('matchId') ?? '').trim();
  const rawIds = String(formData.get('starterIds') ?? '');
  const starterIds = rawIds
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (!matchId) return { error: 'Brak identyfikatora meczu.' };
  if (starterIds.length !== 11) {
    return { error: 'XI musi mieć dokładnie 11 zawodników.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();

  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };
  const clubId = (club as { id: string }).id;

  const rows = await listClubPlayers(clubId).catch(() => null);
  if (!rows) return { error: 'Nie udało się odczytać kadry. Spróbuj ponownie.' };
  let squad;
  try {
    squad = resolveClubSquad({ id: clubId }, rows);
  } catch {
    return { error: 'Kadra niedostępna.' };
  }

  const idSet = new Set(starterIds);
  const chosen = squad.players.filter((p) => idSet.has(p.id));
  if (chosen.length !== 11) {
    return { error: 'Wybrani zawodnicy nie należą do Twojej kadry.' };
  }

  const validation = validateStartingXi(chosen, utcDateString());
  if (!validation.ok) {
    return { error: validation.errors[0] ?? 'Skład XI jest nieprawidłowy.' };
  }

  const { error: saveErr } = await supabase.rpc(
    'save_starting_xi' as never,
    { p_club_id: clubId, p_player_ids: starterIds } as never,
  );
  if (saveErr) return { error: 'Nie udało się zapisać XI. Spróbuj ponownie.' };

  revalidatePath('/squad');
  revalidatePath(`/match/${matchId}`);
  revalidatePath(`/match/${matchId}/xi`);
  revalidatePath(`/match/${matchId}/live`);
  revalidatePath('/hub');

  return { ok: true };
}
