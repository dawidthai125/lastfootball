'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { readClubBuild } from '@/lib/club/read-build';
import { hireCoach } from '@/lib/training/coach';
import type { TrainingActionState } from '@/lib/training/action-types';
import { createClient } from '@/lib/supabase/server';

const GROUP_LABEL: Record<string, string> = {
  attack: 'atak',
  passing: 'podania',
  defense: 'obrona',
  physical: 'fizyczność',
  goalkeeping: 'bramkarstwo',
};

export async function hireClubCoach(
  _prev: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };

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
  const hired = hireCoach({
    cash: clubRow.cash_balance,
    current: build.coachGroup,
    next: String(formData.get('group') ?? ''),
  });
  if (!hired.ok) {
    return {
      error:
        hired.reason === 'cash' ? 'Za mało środków na trenera.' : 'Wybierz jedną grupę atrybutów.',
    };
  }
  if (hired.fee === 0) {
    return { ok: true };
  }

  const { error: updErr } = await supabase
    .from('clubs')
    .update({ cash_balance: hired.cashAfter, coach_group: hired.group } as never)
    .eq('id', clubRow.id);
  if (updErr) return { error: 'Trener nie jest jeszcze włączony.' };

  await supabase.from('finance_movements').insert({
    club_id: clubRow.id,
    category: 'coach_hire',
    label: `Trener: ${GROUP_LABEL[hired.group] ?? hired.group}`,
    amount: -hired.fee,
    fixture_id: null,
  } as never);

  revalidatePath('/training');
  revalidatePath('/finance');
  return { ok: true };
}
