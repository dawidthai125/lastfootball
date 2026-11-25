'use server';

import { serverDb, tryAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { OPEN_MATCH_PLAYER_ERROR, playsInOpenMatch } from '@/lib/match/kickoff-store';
import {
  incomingLoanBlock,
  LOANS_FULL,
  MAX_LOANED_IN,
  resolveIncomingLoanOffers,
  ROSTER_FULL,
} from '@/lib/squad/incoming-loan';
import { freeShirt } from '@/lib/squad/free-shirt';
import { resolvePlayerPotential } from '@/lib/squad/potential';
import { redirect } from 'next/navigation';

import { createClient } from '@/lib/supabase/server';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

export type IncomingLoanState = { readonly error?: string; readonly ok?: boolean };

const OFFER_GONE = 'Oferta wypożyczenia wygasła.';

const LOAN_ERRORS: Readonly<Record<string, string>> = {
  roster: ROSTER_FULL,
  loans: LOANS_FULL,
  offer: OFFER_GONE,
};

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
  if (!offer) return { error: OFFER_GONE };
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
  const failed = 'Nie udało się wypożyczyć zawodnika.';
  const admin = tryAdminClient();
  if (!admin) return { error: failed };
  // Counts the squad again under the club lock.
  const { data, error } = await admin.rpc(
    'take_incoming_loan' as never,
    {
      p_club_id: clubRow.id,
      p_player: {
        id: playerId,
        name: offer.name,
        shirt_number: shirt,
        pos: offer.pos,
        role: offer.role,
        age: offer.age,
        skill: offer.skill,
        potential: resolvePlayerPotential(offer.skill, playerId, offer.age),
        wage: offer.wage,
        loan_partner_label: offer.partnerLabel,
        loan_until: offer.until,
      },
      p_max_roster: TRANSFERS_THIN.MAX_ROSTER,
      p_max_loans: MAX_LOANED_IN,
    } as never,
  );
  const loan = data as { ok?: boolean; reason?: string } | null;
  if (error || !loan) return { error: failed };
  if (loan.ok !== true) return { error: LOAN_ERRORS[loan.reason ?? ''] ?? failed };
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
  if (await playsInOpenMatch(clubId, playerId)) return { error: OPEN_MATCH_PLAYER_ERROR };
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
