'use server';

import { serverDb } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import {
  buildAcademyIntakeDraft,
  intakeWaitDays,
  isAcademyId,
  canPromoteProspect,
} from '@/lib/academy/intake';
import type { AcademyActionState } from '@/lib/academy/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveHubPhase } from '@/lib/hub';
import { listClubPlayers } from '@/lib/squad/get-players';
import { createClient } from '@/lib/supabase/server';

function revalidateAcademyPaths() {
  revalidatePath('/academy');
  revalidatePath('/squad');
  revalidatePath('/hub');
  revalidatePath('/training');
  revalidatePath('/transfers');
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
    return { error: 'Akademia odblokuje się w sezonie.' } as const;
  }
  return { club } as const;
}

export async function intakeAcademyProspect(
  prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  void prev;
  void formData;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const supabase = await createClient();
  const rows = await listClubPlayers(club.id);
  // Everyone who ever joined: numbers stay taken, and a promoted or sold junior still counts.
  const { data: everyone, error: historyErr } = await serverDb(supabase)
    .from('players')
    .select('id, shirt_number, created_at')
    .eq('club_id', club.id);
  if (historyErr) return { error: 'Nie udało się sprawdzić naboru.' };
  const history = (everyone ?? []) as { id: string; shirt_number: number; created_at: string }[];
  const wait = intakeWaitDays(
    history.filter((p) => isAcademyId(p.id, club.id)).map((p) => p.created_at),
    new Date(),
  );
  if (wait > 0) {
    return { error: `Następny nabór za ${wait} ${wait === 1 ? 'dzień' : 'dni'}.` };
  }
  const draft = buildAcademyIntakeDraft(
    club.id,
    rows,
    Date.now(),
    history.map((p) => p.shirt_number),
  );
  if ('error' in draft) return { error: draft.error };

  const { error } = await serverDb(supabase)
    .from('players')
    .insert({
      id: draft.id,
      club_id: club.id,
      name: draft.name,
      shirt_number: draft.shirtNumber,
      pos: draft.pos,
      role: draft.role,
      starter: false,
      captain: false,
      age: draft.age,
      skill: draft.skill,
      potential: draft.potential,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      academy_track: true,
      origin: 'academy',
      joined_at: new Date().toISOString(),
      promoted_at: null,
      transfer_listed_at: null,
    } as never);

  if (error) {
    return { error: 'Nie udało się przeprowadzić naboru.' };
  }

  revalidateAcademyPaths();
  return { ok: true, message: `${draft.name} dołączył do akademii.` };
}

export async function promoteAcademyProspect(
  prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  void prev;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };

  const rows = await listClubPlayers(club.id);
  const check = canPromoteProspect(rows, playerId, club.id);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await serverDb(supabase)
    .from('players')
    .update({
      academy_track: false,
      promoted_at: now,
      origin: 'academy',
      joined_at: now,
      starter: false,
      transfer_listed_at: null,
    } as never)
    .eq('id', playerId)
    .eq('club_id', club.id)
    .eq('academy_track', true)
    .is('departed_at', null)
    .select('id, name')
    .maybeSingle();

  if (error || !data) {
    return { error: 'Nie udało się wypromować zawodnika.' };
  }

  const name = (data as { name: string }).name;
  revalidateAcademyPaths();
  return { ok: true, message: `${name} trafił do kadry seniorów.` };
}
