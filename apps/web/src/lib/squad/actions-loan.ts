'use server';

import { serverDb } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { loanBlock, loanUntilDate, loanWage, recallWage } from '@/lib/squad/loan';
import { createClient } from '@/lib/supabase/server';

export type LoanState = { readonly error?: string; readonly ok?: boolean };

export async function savePlayerLoan(_prev: LoanState, formData: FormData): Promise<LoanState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const playerId = String(formData.get('playerId') ?? '');
  const intent = String(formData.get('intent') ?? '');
  if (!playerId) return { error: 'Nie wybrano zawodnika.' };
  if (intent !== 'loan' && intent !== 'recall')
    return { error: 'Wybierz wypożyczenie albo powrót.' };
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
    .select('id, pos, starter, wage, on_loan, wage_bank')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .maybeSingle();
  if (readErr) return { error: 'Wypożyczenie nie jest jeszcze w bazie.' };
  if (!player) return { error: 'Nie znaleziono zawodnika.' };
  const row = player as {
    pos: string;
    starter: boolean;
    wage: number | null;
    on_loan: boolean | null;
    wage_bank: number | null;
  };
  const current = typeof row.wage === 'number' ? row.wage : 0;
  if (intent === 'recall') {
    if (row.on_loan !== true) return { error: 'Nie jest wypożyczony.' };
    const { error } = await serverDb(supabase)
      .from('players')
      .update({
        on_loan: false,
        loan_until: null,
        wage: recallWage(typeof row.wage_bank === 'number' ? row.wage_bank : -1, current),
        wage_bank: null,
      } as never)
      .eq('id', playerId)
      .eq('club_id', clubId);
    if (error) return { error: 'Nie udało się ściągnąć zawodnika.' };
  } else {
    const blocked = loanBlock({
      position: row.pos,
      starter: row.starter,
      onLoan: row.on_loan === true,
    });
    if (blocked) return { error: blocked };
    const { error } = await serverDb(supabase)
      .from('players')
      .update({
        on_loan: true,
        loan_until: loanUntilDate(utcDateString()),
        wage_bank: current,
        wage: loanWage(current),
        starter: false,
      } as never)
      .eq('id', playerId)
      .eq('club_id', clubId);
    if (error) return { error: 'Nie udało się wypożyczyć zawodnika.' };
  }
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
