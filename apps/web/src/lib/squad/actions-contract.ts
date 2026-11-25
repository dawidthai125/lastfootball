'use server';

import { serverDb } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { isTalkPersonality, talkResult } from '@/lib/squad/contract-talk';
import { createClient } from '@/lib/supabase/server';

const LISTED = 'Najpierw zdejmij go z listy transferowej.';

export type ContractTalkState = { readonly error?: string; readonly ok?: boolean };

function fallbackWage(skill: number, age: number): number {
  return 1200 + skill * 35 + Math.max(0, 32 - age) * 50;
}

export async function saveContractTalk(
  _prev: ContractTalkState,
  formData: FormData,
): Promise<ContractTalkState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const playerId = String(formData.get('playerId') ?? '');
  const offer = Number(formData.get('offer'));
  if (!playerId) return { error: 'Nie wybrano zawodnika.' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };
  const { data: club } = await supabase
    .from('clubs')
    .select('id, season_number')
    .eq('owner_id', user.id)
    .maybeSingle();
  const clubRow = club as { id: string; season_number: number | null } | null;
  const clubId = clubRow?.id;
  if (!clubId) return { error: 'Nie znaleziono klubu.' };
  const { data: player, error: readErr } = await supabase
    .from('players')
    .select(
      'id, wage, skill, age, morale, personality, contract_season, on_loan, transfer_listed_at, origin',
    )
    .eq('id', playerId)
    .eq('club_id', clubId)
    .eq('loaned_in', false)
    .eq('academy_track', false)
    .is('departed_at', null)
    .maybeSingle();
  if (readErr || !player) return { error: 'Nie udało się odczytać kontraktu.' };
  const row = player as {
    wage: number | null;
    skill: number;
    age: number;
    morale: number | null;
    personality: string | null;
    contract_season: number | null;
    on_loan: boolean | null;
    transfer_listed_at: string | null;
    origin: string | null;
  };
  if (row.origin === 'emergency') {
    return { error: 'Junior awaryjny ma kontrakt tylko do końca sezonu.' };
  }
  // Half of the pay sits in wage_bank during a loan, so the talk would start from a false wage.
  if (row.on_loan === true) return { error: 'Najpierw ściągnij go z wypożyczenia.' };
  // The buyer takes the wage over and bids without seeing it.
  if (row.transfer_listed_at) return { error: LISTED };
  const rawPersonality = row.personality ?? '';
  const personality = isTalkPersonality(rawPersonality) ? rawPersonality : 'spokojny';
  const wage = typeof row.wage === 'number' ? row.wage : fallbackWage(row.skill, row.age);
  const decision = talkResult({
    wage,
    offer,
    personality,
    morale: typeof row.morale === 'number' ? row.morale : 60,
    contractSeason: row.contract_season,
    season: clubRow?.season_number ?? 1,
  });
  if (!decision.ok) return { error: decision.reason };
  const { data: saved, error } = await serverDb(supabase)
    .from('players')
    .update({ wage: decision.wage, contract_season: decision.contractSeason } as never)
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('transfer_listed_at', null)
    .select('id');
  if (error) return { error: 'Nie udało się zapisać kontraktu.' };
  if (!saved || (saved as unknown[]).length === 0) return { error: LISTED };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
