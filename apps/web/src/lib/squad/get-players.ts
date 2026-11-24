import { serverDb } from '@/lib/supabase/admin';
import { env } from '@/config/env';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { reconcileExpiredIntl } from '@/lib/squad/reconcile-intl';
import { reconcileExpiredLoans } from '@/lib/squad/reconcile-loans';
import type { PlayerRowDto } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping, energy, form, wage, suspension_matches, injury_matches, recent_ratings';

const DEPTH_SELECT =
  'id, energy_on, origin, joined_at, morale, personality, contract_until, release_clause, set_piece, last_individual_on';

const LOAN_SELECT =
  'id, on_loan, loan_until, wage_bank, loaned_in, loan_partner_label, intl_absent_until';

const CONTRACT_SELECT = 'id, contract_season';

const ACADEMY_SELECT = 'id, senior_matches, academy_trained_on, academy_gain, academy_gain_season';

const OFFER_SELECT = 'id, ai_offer_declined';

const PLAYER_SELECT_LEGACY =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at';

const MISSING_COLUMN = new Set(['42703', 'PGRST204']);

/** A missing column is an older database. Anything else means we do not know. */
function isFailedRead(error: { readonly code?: string } | null): boolean {
  return error != null && !MISSING_COLUMN.has(error.code ?? '');
}

/** The squad could not be read. It must never pass for an empty club or an old database. */
export class SquadReadError extends Error {
  constructor() {
    super('Nie udało się odczytać kadry. Spróbuj ponownie.');
    this.name = 'SquadReadError';
  }
}

function stopOnFailedRead(error: { readonly code?: string } | null): void {
  if (isFailedRead(error)) throw new SquadReadError();
}

/**
 * Club players from DB (SSOT) including academy prospects.
 * Excludes DEPARTED / departed_at. Empty array if missing — no seed fallback.
 * Throws SquadReadError when the read fails.
 * Senior consumers must filter via resolveClubSquad / filterSeniorPlayers.
 */
export async function listClubPlayers(
  clubId: string,
  restDay: string = utcDateString(),
): Promise<PlayerRowDto[]> {
  if (!env.isSupabaseConfigured) return [];
  const supabase = await createClient();
  const full = await supabase
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null)
    .order('shirt_number', { ascending: true });

  stopOnFailedRead(full.error);
  const result = full.error
    ? await supabase
        .from('players')
        .select(PLAYER_SELECT_LEGACY)
        .eq('club_id', clubId)
        .is('departed_at', null)
        .order('shirt_number', { ascending: true })
    : full;

  if (result.error || !result.data) throw new SquadReadError();
  const depth = await supabase
    .from('players')
    .select(DEPTH_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null);
  stopOnFailedRead(depth.error);
  const depthById = new Map<string, Partial<PlayerDbRow>>();
  if (!depth.error && depth.data) {
    for (const row of depth.data as Partial<PlayerDbRow>[]) {
      if (row.id) depthById.set(row.id, row);
    }
  }
  const extras = await Promise.all(
    [LOAN_SELECT, ACADEMY_SELECT, CONTRACT_SELECT, OFFER_SELECT].map((columns) =>
      supabase.from('players').select(columns).eq('club_id', clubId).is('departed_at', null),
    ),
  );
  for (const extra of extras) {
    stopOnFailedRead(extra.error);
    if (extra.error || !extra.data) continue;
    for (const row of extra.data as unknown as Partial<PlayerDbRow>[]) {
      if (!row.id) continue;
      depthById.set(row.id, { ...depthById.get(row.id), ...row });
    }
  }

  const today = utcDateString();
  const mapped = (result.data as PlayerDbRow[]).map((row) =>
    mapPlayerRow({ ...row, ...depthById.get(row.id) }, restDay),
  );
  const patches = reconcileExpiredLoans(
    mapped.map((row) => ({
      id: row.id,
      onLoan: row.onLoan === true,
      loanedIn: row.loanedIn === true,
      loanUntil: row.loanUntil ?? null,
      wage: typeof row.wage === 'number' ? row.wage : 0,
      wageBank: typeof row.wageBank === 'number' ? row.wageBank : null,
    })),
    today,
  );
  for (const patch of patches) {
    if (patch.kind === 'recall') {
      await serverDb(supabase)
        .from('players')
        .update({
          on_loan: false,
          loan_until: null,
          wage: patch.wage,
          wage_bank: null,
        } as never)
        .eq('id', patch.id)
        .eq('club_id', clubId);
      const depth = depthById.get(patch.id) ?? {};
      depthById.set(patch.id, {
        ...depth,
        on_loan: false,
        loan_until: null,
        wage: patch.wage,
        wage_bank: null,
      });
    } else {
      await serverDb(supabase)
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
        .eq('id', patch.id)
        .eq('club_id', clubId);
      depthById.set(patch.id, {
        ...depthById.get(patch.id),
        loaned_in: false,
        loan_until: null,
        departed_at: new Date().toISOString(),
        status: 'DEPARTED',
      });
    }
  }

  const afterLoans = (result.data as PlayerDbRow[])
    .map((row) => mapPlayerRow({ ...row, ...depthById.get(row.id) }, restDay))
    .filter((p) => p.status !== 'DEPARTED');

  const intlPatches = reconcileExpiredIntl(
    afterLoans.map((row) => ({
      id: row.id,
      intlAbsentUntil: row.intlAbsentUntil ?? null,
    })),
    today,
  );
  for (const patch of intlPatches) {
    await serverDb(supabase)
      .from('players')
      .update({ intl_absent_until: null } as never)
      .eq('id', patch.id)
      .eq('club_id', clubId);
    const depth = depthById.get(patch.id) ?? {};
    depthById.set(patch.id, { ...depth, intl_absent_until: null });
  }

  if (intlPatches.length === 0) return afterLoans;

  return (result.data as PlayerDbRow[])
    .map((row) => mapPlayerRow({ ...row, ...depthById.get(row.id) }, restDay))
    .filter((p) => p.status !== 'DEPARTED');
}
