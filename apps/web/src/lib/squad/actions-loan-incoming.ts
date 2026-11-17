'use server';

import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import {
  incomingLoanBlock,
  resolveIncomingLoanOffers,
} from '@/lib/squad/incoming-loan';
import { resolvePlayerPotential } from '@/lib/squad/potential';
import { createClient } from '@/lib/supabase/server';

export type IncomingLoanState = { readonly error?: string; readonly ok?: boolean };

function nextLoanId(clubId: string, existingIds: readonly string[]): string {
  const tag = clubId.replace(/-/g, '').slice(0, 8) || 'club';
  const prefix = `li-${tag}-`;
  let max = -1;
  for (const id of existingIds) {
    if (!id.startsWith(prefix)) continue;
    const n = Number(id.slice(prefix.length));
    if (Number.isFinite(n)) max = Math.max(max, n);
  }
  return `${prefix}${max + 1}`;
}

function nextShirt(used: readonly number[]): number {
  for (let n = 1; n <= 99; n++) {
    if (!used.includes(n)) return n;
  }
  return 99;
}

export async function acceptIncomingLoan(
  _prev: IncomingLoanState,
  formData: FormData,
): Promise<IncomingLoanState> {
  if (!env.isSupabaseConfigured) return { error: 'Supabase nie jest skonfigurowany.' };
  const offerId = String(formData.get('offerId') ?? '');
  if (!offerId) return { error: 'Nie wybrano oferty.' };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: 'Sesja wygasła.' };
  const { data: club } = await supabase
    .from('clubs')
    .select('id, transfer_window_open')
    .eq('owner_id', user.id)
    .maybeSingle();
  const clubRow = club as { id: string; transfer_window_open: boolean | null } | null;
  if (!clubRow?.id) return { error: 'Nie znaleziono klubu.' };
  const { data: players } = await supabase
    .from('players')
    .select('id, shirt_number, loaned_in')
    .eq('club_id', clubRow.id)
    .is('departed_at', null);
  const rows = (players as { id: string; shirt_number: number; loaned_in: boolean | null }[] | null) ?? [];
  const blocked = incomingLoanBlock({
    rosterCount: rows.length,
    alreadyLoanedIn: rows.filter((r) => r.loaned_in === true).length,
  });
  if (blocked) return { error: blocked };
  const offer = resolveIncomingLoanOffers({
    clubId: clubRow.id,
    transferWindowOpen: clubRow.transfer_window_open === true,
    rosterCount: rows.length,
    today: utcDateString(),
  }).find((o) => o.offerId === offerId);
  if (!offer) return { error: 'Oferta wypożyczenia wygasła.' };
  const playerId = nextLoanId(
    clubRow.id,
    rows.map((r) => r.id),
  );
  const shirt = nextShirt(rows.map((r) => r.shirt_number));
  const { error } = await supabase.from('players').insert({
    id: playerId,
    club_id: clubRow.id,
    name: offer.name,
    shirt_number: shirt,
    pos: offer.pos,
    role: offer.role,
    starter: false,
    captain: false,
    age: offer.age,
    skill: offer.skill,
    potential: resolvePlayerPotential(offer.skill, playerId, offer.age),
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    wage: offer.wage,
    loaned_in: true,
    loan_partner_label: offer.partnerLabel,
    loan_until: offer.until,
    on_loan: false,
  } as never);
  if (error) return { error: 'Wypożyczenie przychodzące nie jest jeszcze w bazie.' };
  revalidatePath('/transfers');
  revalidatePath('/squad');
  revalidatePath('/messages');
  return { ok: true };
}

export async function returnIncomingLoan(
  _prev: IncomingLoanState,
  formData: FormData,
): Promise<IncomingLoanState> {
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
  const { data: player } = await supabase
    .from('players')
    .select('id, loaned_in')
    .eq('id', playerId)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .maybeSingle();
  if (!player || (player as { loaned_in: boolean | null }).loaned_in !== true) {
    return { error: 'To nie jest wypożyczenie przychodzące.' };
  }
  const { error } = await supabase
    .from('players')
    .update({
      status: 'DEPARTED',
      departed_at: new Date().toISOString(),
      starter: false,
      loaned_in: false,
      loan_partner_label: null,
      loan_until: null,
    } as never)
    .eq('id', playerId)
    .eq('club_id', clubId);
  if (error) return { error: 'Nie udało się odesłać zawodnika.' };
  revalidatePath('/squad');
  revalidatePath(`/players/${playerId}`);
  return { ok: true };
}
