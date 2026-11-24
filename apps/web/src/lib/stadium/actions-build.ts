'use server';

import { serverDb } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { readClubBuild } from '@/lib/club/read-build';
import { upgradePart, type StadiumPart } from '@/lib/stadium/levels';
import { CASH_STALE_ERROR, writeClubCash } from '@/lib/finance/club-cash';
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
  // The level the manager saw: a second click must not buy the next one.
  const seen = Number(formData.get('level') ?? -1);
  const current =
    part === 'stands'
      ? build.levels.stands
      : part === 'pitch'
        ? build.levels.pitch
        : build.levels.trainingCenter;
  if (seen !== current) return { error: 'Poziom już się zmienił. Odśwież stronę.' };
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
  const written = await writeClubCash({
    clubId: clubRow.id,
    expected: clubRow.cash_balance,
    next: next.cashAfter,
    extra: { [column]: level },
  });
  if (written === 'stale') return { error: CASH_STALE_ERROR };
  if (written === 'error') return { error: 'Rozbudowa nie jest jeszcze włączona.' };

  await serverDb(supabase)
    .from('finance_movements')
    .insert({
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
