/** Server only. A match that was settled, but whose effects on the squad were not saved. */

import type { FixtureDto } from '@/lib/fixtures/types';
import { loadKickoff } from '@/lib/match/kickoff-store';
import { tryAdminClient } from '@/lib/supabase/admin';

/** Older matches are left alone: the squad has moved on since. */
const WINDOW_MS = 48 * 60 * 60 * 1000;
/** The save of the match itself may still be running, with the newest decisions. */
const SETTLING_MS = 2 * 60 * 1000;

export type UnfinishedMatch = {
  readonly fixtureId: string;
  readonly managerLog: string;
  readonly shape: string;
};

/** The last match of the club, when it is fresh enough to finish. */
export function lastFreshMatch(
  fixtures: readonly Pick<FixtureDto, 'id' | 'status' | 'playedAt'>[],
  now: Date,
): string | null {
  let best: { id: string; at: number } | null = null;
  for (const fixture of fixtures) {
    const at = Date.parse(fixture.playedAt ?? '');
    if (fixture.status !== 'played' || Number.isNaN(at)) continue;
    if (!best || at > best.at) best = { id: fixture.id, at };
  }
  if (!best) return null;
  const age = now.getTime() - best.at;
  return age >= SETTLING_MS && age <= WINDOW_MS ? best.id : null;
}

/** Null when all is saved, or when that is not certain. */
export async function findUnfinishedMatch(
  clubId: string,
  fixtures: readonly FixtureDto[],
  now: Date = new Date(),
): Promise<UnfinishedMatch | null> {
  const fixtureId = lastFreshMatch(fixtures, now);
  const admin = fixtureId ? tryAdminClient() : null;
  if (!fixtureId || !admin) return null;
  const { data, error } = await admin
    .from('match_development_log')
    .select('match_key')
    .eq('club_id', clubId)
    .eq('match_key', fixtureId)
    .maybeSingle();
  if (error || data) return null;
  const kickoff = await loadKickoff(fixtureId, clubId, now);
  if (kickoff.kind === 'error') return null;
  return {
    fixtureId,
    managerLog: JSON.stringify(kickoff.kind === 'found' ? kickoff.log : []),
    shape: kickoff.kind === 'found' ? kickoff.snapshot.formation : '4-4-2',
  };
}
