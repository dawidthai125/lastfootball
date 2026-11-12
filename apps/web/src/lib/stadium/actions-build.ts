'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { readClubBuild } from '@/lib/club/read-build';
import { upgradePart, type StadiumPart } from '@/lib/stadium/levels';
import { createClient } from '@/lib/supabase/server';

export type GroundActionState = { error?: string; ok?: boolean };

const PART_COLUMN = {
  stands: 'stands_level',
  pitch: 'pitch_level',
  training_center: 'training_center_level',
} as const;

const PART_LABEL: Record<StadiumPart, string> = {
  stands: 'Trybuny',
  pitch: 'Murawa',
  training_center: 'Ośrodek',
};

export async function raiseGroundPart(
  _prev: GroundActionState,
  formData: FormData,
): Promise<GroundActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };

  const part = String(formData.get('part') ?? '');
  if (part !== 'stands' && part !== 'pitch' && part !== 'training_center') {
    return { error: 'Nieznany element stadionu.' };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };

  const { data: club, error: clubErr } = await supabase
    .from('clubs')
    .select('id, cash_balance')
    .eq('owner_id', user.id)
    .maybeSingle();
  if (clubErr || !club) return { error: 'Nie znaleziono klubu.' };

  const clubRow = club as { id: string; cash_balance: number };
  const build = await readClubBuild(supabase, clubRow.id);
  const next = upgradePart({ levels: build.levels, part, cash: clubRow.cash_balance });
  if (!next.ok) {
    return {
      error:
        next.reason === 'cash'
          ? 'Za mało środków w kasie.'
          : next.reason === 'max'
            ? 'Ten element jest już na najwyższym poziomie.'
            : 'Nieznany element stadionu.',
    };
  }

  const column = PART_COLUMN[part];
  const level =
    part === 'stands'
      ? next.levels.stands
      : part === 'pitch'
        ? next.levels.pitch
        : next.levels.trainingCenter;
  const { error: updErr } = await supabase
    .from('clubs')
    .update({ cash_balance: next.cashAfter, [column]: level } as never)
    .eq('id', clubRow.id);
  if (updErr) return { error: 'Rozbudowa nie jest jeszcze włączona.' };

  await supabase.from('finance_movements').insert({
    club_id: clubRow.id,
    category: 'stadium_build',
    label: PART_LABEL[part],
    amount: -next.cost,
    fixture_id: null,
  } as never);

  revalidatePath('/stadium');
  revalidatePath('/finance');
  revalidatePath('/training');
  return { ok: true };
}
