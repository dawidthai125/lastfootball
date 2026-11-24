'use server';

import { revalidatePath } from 'next/cache';

import { getManagerClub } from '@/lib/club/get-manager-club';
import { STARTER_REWARD, STARTER_REWARD_LABEL } from '@/lib/starter/steps';
import { tryAdminClient } from '@/lib/supabase/admin';

export type StarterRewardState = { readonly error: string | null };

export async function claimStarterReward(
  _prev: StarterRewardState,
  _formData: FormData,
): Promise<StarterRewardState> {
  void _formData;
  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' };
  const admin = tryAdminClient();
  if (!admin) return { error: 'Nagroda jest teraz niedostępna.' };
  const { data, error } = await admin.rpc(
    'claim_starter_reward' as never,
    { p_club_id: club.id, p_amount: STARTER_REWARD, p_label: STARTER_REWARD_LABEL } as never,
  );
  const row = data as { ok?: boolean } | null;
  if (error || !row) return { error: 'Nie udało się odebrać nagrody. Spróbuj ponownie.' };
  if (row.ok !== true) return { error: 'Najpierw wykonaj wszystkie kroki.' };
  revalidatePath('/', 'layout');
  return { error: null };
}
