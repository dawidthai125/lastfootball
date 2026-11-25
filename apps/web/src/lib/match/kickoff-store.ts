import { parseManagerLog, type ManagerLogEntry } from '@/lib/match/manager-commands';
import {
  KICKOFF_VALID_MS,
  leftDuringMatch,
  readKickoffSnapshot,
  type KickoffSnapshot,
} from '@/lib/match/kickoff-snapshot';
import { tryAdminClient } from '@/lib/supabase/admin';

// Not a 'use server' module on purpose: it takes a club id. Callers authorise the owner first.

type OpenRow = {
  readonly fixture_id: string;
  readonly started_at: string;
  readonly snapshot: unknown;
  readonly progress_tick: number;
  readonly manager_log: unknown;
};

async function readOpenRow(clubId: string): Promise<OpenRow | null | 'error'> {
  const admin = tryAdminClient();
  if (!admin) return null;
  const { data, error } = await admin
    .from('match_kickoffs' as never)
    .select('fixture_id, started_at, snapshot, progress_tick, manager_log')
    .eq('club_id', clubId)
    .maybeSingle();
  return error ? 'error' : (data as OpenRow | null);
}

function storedLog(raw: unknown): readonly ManagerLogEntry[] {
  return parseManagerLog(JSON.stringify(raw ?? [])) ?? [];
}

/**
 * One open match per club: opening a match replaces the copy before it. The client never
 * names a copy, so it cannot choose between starts or opt out.
 */
export async function storeKickoff(snapshot: KickoffSnapshot): Promise<void> {
  const { error } =
    (await tryAdminClient()
      ?.from('match_kickoffs' as never)
      .upsert(
        {
          club_id: snapshot.club.id,
          fixture_id: snapshot.fixture.id,
          started_at: new Date().toISOString(),
          snapshot,
          progress_tick: 0,
          manager_log: [],
        } as never,
        { onConflict: 'club_id' },
      )) ?? {};
  if (error) console.error('storeKickoff failed', { fixtureId: snapshot.fixture.id });
}

export type MatchEntry =
  | { readonly kind: 'new' }
  | {
      readonly kind: 'resume';
      readonly snapshot: KickoffSnapshot;
      readonly tick: number;
      readonly log: readonly ManagerLogEntry[];
    }
  /** Another match of the club went on and is not finished. */
  | { readonly kind: 'other'; readonly fixtureId: string }
  | { readonly kind: 'error' };

/** What entering this match means (D150). A match that went on is never started again. */
export async function enterMatch(
  clubId: string,
  fixtureId: string,
  seniors: readonly { readonly id: string }[],
): Promise<MatchEntry> {
  const row = await readOpenRow(clubId);
  if (row === 'error') return { kind: 'error' };
  if (!row || row.progress_tick <= 0) return { kind: 'new' };
  const admin = tryAdminClient();
  if (row.fixture_id !== fixtureId) {
    const other = await admin
      ?.from('fixtures')
      .select('status')
      .eq('id', row.fixture_id)
      .eq('club_id', clubId)
      .maybeSingle();
    if (other?.error) return { kind: 'error' };
    return other?.data?.status === 'upcoming'
      ? { kind: 'other', fixtureId: row.fixture_id }
      : { kind: 'new' };
  }
  const snapshot = readKickoffSnapshot(row.snapshot, fixtureId, clubId);
  if (!snapshot || leftDuringMatch(snapshot, seniors)) {
    // Nobody can finish it, so it must not stand in the way of a new start.
    await admin
      ?.from('match_kickoffs' as never)
      .delete()
      .eq('club_id', clubId)
      .eq('fixture_id', fixtureId);
    return { kind: 'new' };
  }
  // The six hours count from the last entry, so a returning player can finish.
  const touched = await admin
    ?.from('match_kickoffs' as never)
    .update({ started_at: new Date().toISOString() } as never)
    .eq('club_id', clubId)
    .eq('fixture_id', fixtureId);
  if (touched?.error) return { kind: 'error' };
  return { kind: 'resume', snapshot, tick: row.progress_tick, log: storedLog(row.manager_log) };
}

/** Open match that went on, or none. `unknown` = a read failed: whoever asks must not act. */
export async function openMatchOf(clubId: string): Promise<string | null> {
  const row = await readOpenRow(clubId);
  if (row === 'error') return 'unknown';
  if (!row || row.progress_tick <= 0) return null;
  const { data, error } =
    (await tryAdminClient()
      ?.from('fixtures')
      .select('status')
      .eq('id', row.fixture_id)
      .eq('club_id', clubId)
      .maybeSingle()) ?? {};
  if (error) return 'unknown';
  return data?.status === 'upcoming' ? row.fixture_id : null;
}

export const OPEN_MATCH_ERROR = 'Masz rozpoczęty mecz. Dokończ go najpierw.';
export const OPEN_MATCH_PLAYER_ERROR =
  'Ten zawodnik gra w rozpoczętym meczu. Najpierw dokończ mecz.';

/** Giving him away would drop the match and start it again from 0:0. */
export async function playsInOpenMatch(clubId: string, playerId: string): Promise<boolean> {
  const row = await readOpenRow(clubId);
  if (row === 'error') return true;
  if (!row) return false;
  const snapshot = readKickoffSnapshot(row.snapshot, row.fixture_id, clubId);
  if (![...(snapshot?.ourXi ?? []), ...(snapshot?.ourBench ?? [])].some((p) => p.id === playerId)) {
    return false;
  }
  const open = await openMatchOf(clubId);
  return open === row.fixture_id || open === 'unknown';
}

/** False when the copy is gone, another window is further, or an old decision was changed. */
export async function saveMatchProgress(
  clubId: string,
  fixtureId: string,
  tick: number,
  log: readonly ManagerLogEntry[],
): Promise<boolean> {
  const { data, error } =
    (await tryAdminClient()?.rpc(
      'save_match_progress' as never,
      { p_club_id: clubId, p_fixture_id: fixtureId, p_tick: tick, p_log: log } as never,
    )) ?? {};
  return !error && (data as unknown) === true;
}

export type KickoffLookup =
  | {
      readonly kind: 'found';
      readonly snapshot: KickoffSnapshot;
      readonly tick: number;
      readonly log: readonly ManagerLogEntry[];
    }
  /** Never stored, or another match was opened since: the stored squad counts. */
  | { readonly kind: 'none' }
  /** Another match went on meanwhile. It has to be finished first. */
  | { readonly kind: 'other' }
  | { readonly kind: 'expired' }
  | { readonly kind: 'error' };

export async function loadKickoff(
  fixtureId: string,
  clubId: string,
  now: Date = new Date(),
): Promise<KickoffLookup> {
  const row = await readOpenRow(clubId);
  if (row === 'error') return { kind: 'error' };
  if (!row) return { kind: 'none' };
  if (row.fixture_id !== fixtureId) return { kind: row.progress_tick > 0 ? 'other' : 'none' };
  if (now.getTime() - Date.parse(row.started_at) > KICKOFF_VALID_MS) return { kind: 'expired' };
  const snapshot = readKickoffSnapshot(row.snapshot, fixtureId, clubId);
  return snapshot
    ? {
        kind: 'found',
        snapshot,
        tick: row.progress_tick,
        log: storedLog(row.manager_log),
      }
    : { kind: 'error' };
}

/** The settled match is over. A start of another match survives only when it went on. */
export async function clearKickoffs(clubId: string, fixtureId: string): Promise<void> {
  await tryAdminClient()
    ?.from('match_kickoffs' as never)
    .delete()
    .eq('club_id', clubId)
    .or(`fixture_id.eq.${fixtureId},progress_tick.eq.0`);
}
