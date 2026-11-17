'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { resolveIntlCallup } from '@/lib/squad/intl-callup';
import { createClient } from '@/lib/supabase/server';

export type IntlState = { readonly error?: string; readonly ok?: boolean };

export async function acceptIntlCallup(_prev: IntlState, formData: FormData): Promise<IntlState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const playerId = String(formData.get('playerId') ?? '');
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
  const today = utcDateString();
  const { data: players, error: readErr } = await supabase
    .from('players')
    .select('id, name, skill, nationality, starter, on_loan, loaned_in, intl_absent_until')
    .eq('club_id', clubId)
    .is('departed_at', null);
  if (readErr) return { error: 'Powołanie nie jest jeszcze w bazie.' };
  const rows =
    (players as
      | {
          id: string;
          name: string;
          skill: number;
          nationality: string;
          starter: boolean;
          on_loan: boolean | null;
          loaned_in: boolean | null;
          intl_absent_until: string | null;
        }[]
      | null) ?? [];
  const callup = resolveIntlCallup({
    clubId,
    today,
    players: rows.map((row) => ({
      id: row.id,
      name: row.name,
      skill: row.skill,
      nationality: row.nationality,
      starter: row.starter,
      onLoan: row.on_loan === true,
      loanedIn: row.loaned_in === true,
    })),
    alreadyAbsentIds: rows
      .filter((row) => row.intl_absent_until && row.intl_absent_until >= today)
      .map((row) => row.id),
  });
  if (!callup || callup.playerId !== playerId) {
    return { error: 'To powołanie już nie obowiązuje.' };
  }
  const { error } = await supabase
    .from('players')
    .update({
      intl_absent_until: callup.until,
      starter: false,
    } as never)
    .eq('id', playerId)
    .eq('club_id', clubId);
  if (error) return { error: 'Nie udało się zapisać powołania.' };
  revalidatePath('/messages');
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
