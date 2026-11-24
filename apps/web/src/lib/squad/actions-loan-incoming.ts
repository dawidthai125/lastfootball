'use server';

import { serverDb } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { incomingLoanBlock, resolveIncomingLoanOffers } from '@/lib/squad/incoming-loan';
import { freeShirt } from '@/lib/squad/free-shirt';
import { resolvePlayerPotential } from '@/lib/squad/potential';
import { redirect } from 'next/navigation';

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
  const { data: players, error: playersErr } = await supabase
    .from('players')
    .select('id, name, loaned_in, loan_partner_label')
    .eq('club_id', clubRow.id)
    .eq('academy_track', false)
    .is('departed_at', null);
  if (playersErr || !players) return { error: 'Nie udało się odczytać kadry.' };
  const rows = players as {
    id: string;
    name: string;
    loaned_in: boolean | null;
    loan_partner_label: string | null;
  }[];
  const blocked = incomingLoanBlock({
    rosterCount: rows.length,
    alreadyLoanedIn: rows.filter((r) => r.loaned_in === true).length,
  });
  if (blocked) return { error: blocked };
  const offer = resolveIncomingLoanOffers({
    clubId: clubRow.id,
    transferWindowOpen: clubRow.transfer_window_open === true,
    roster: rows.map((r) => ({
      name: r.name,
      loanedIn: r.loaned_in === true,
      loanPartnerLabel: r.loan_partner_label,
    })),
    today: utcDateString(),
  }).find((o) => o.offerId === offerId);
  if (!offer) return { error: 'Oferta wypożyczenia wygasła.' };
  // Ids of players who left stay taken, their numbers do not.
  const { data: everyone, error: everyErr } = await supabase
    .from('players')
    .select('id, shirt_number, departed_at')
    .eq('club_id', clubRow.id);
  if (everyErr || !everyone) return { error: 'Nie udało się odczytać kadry.' };
  const taken = everyone as { id: string; shirt_number: number; departed_at: string | null }[];
  const playerId = nextLoanId(
    clubRow.id,
    taken.map((r) => r.id),
  );
  const shirt = freeShirt(taken);
  if (shirt == null) return { error: 'Brak wolnego numeru koszulki.' };
  const { error } = await serverDb(supabase)
    .from('players')
    .insert({
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
      origin: 'loan',
      joined_at: new Date().toISOString(),
      version: 1,
      departed_at: null,
      wage: offer.wage,
      loaned_in: true,
      loan_partner_label: offer.partnerLabel,
      loan_until: offer.until,
      on_loan: false,
    } as never);
  if (error) return { error: 'Nie udało się wypożyczyć zawodnika.' };
  revalidatePath('/', 'layout');
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
  const { error } = await serverDb(supabase)
    .from('players')
    .update({
      status: 'DEPARTED',
      departed_at: new Date().toISOString(),
      starter: false,
      captain: false,
      set_piece: false,
      loaned_in: false,
      loan_partner_label: null,
      loan_until: null,
    } as never)
    .eq('id', playerId)
    .eq('club_id', clubId);
  if (error) return { error: 'Nie udało się odesłać zawodnika.' };
  revalidatePath('/', 'layout');
  // His page is gone with him.
  redirect('/squad');
}
