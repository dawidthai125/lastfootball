'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { isTalkPersonality, talkResult } from '@/lib/squad/contract-talk';
import { createClient } from '@/lib/supabase/server';

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
    .select('id')
    .eq('owner_id', user.id)
    .maybeSingle();
  const clubId = (club as { id: string } | null)?.id;
  if (!clubId) return { error: 'Nie znaleziono klubu.' };
  const { data: player, error: readErr } = await supabase
    .from('players')
    .select('id, wage, skill, age, morale, personality, contract_until')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .maybeSingle();
  if (readErr || !player) return { error: 'Nie udało się odczytać kontraktu.' };
  const row = player as {
    wage: number | null;
    skill: number;
    age: number;
    morale: number | null;
    personality: string | null;
    contract_until: string | null;
  };
  const rawPersonality = row.personality ?? '';
  const personality = isTalkPersonality(rawPersonality) ? rawPersonality : 'spokojny';
  const wage = typeof row.wage === 'number' ? row.wage : fallbackWage(row.skill, row.age);
  const decision = talkResult({
    wage,
    offer,
    personality,
    morale: typeof row.morale === 'number' ? row.morale : 60,
    contractUntil: row.contract_until ?? '2028-06-30',
    today: utcDateString(),
  });
  if (!decision.ok) return { error: decision.reason };
  const { error } = await supabase
    .from('players')
    .update({ wage: decision.wage, contract_until: decision.contractUntil } as never)
    .eq('id', playerId)
    .eq('club_id', clubId);
  if (error) return { error: 'Nie udało się zapisać kontraktu.' };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
