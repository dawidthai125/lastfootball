import type { FormationCode, MatchSession } from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import type { FixtureDto } from '@/lib/fixtures/types';
import { parseOurFormation } from '@/lib/match/our-formation';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';

/** Everything createSessionFromLeagueFixture reads (D130). Stored by the server only. */
export type KickoffSnapshot = {
  readonly club: ClubDto;
  readonly fixture: FixtureDto;
  readonly ourXi: readonly RosterPlayerSeed[];
  readonly ourBench: readonly RosterPlayerSeed[];
  readonly formation: FormationCode;
  readonly theirXi: readonly RosterPlayerSeed[] | null;
};

/** A started match can be finished for this long; later the stored squad counts again. */
export const KICKOFF_VALID_MS = 3 * 60 * 60 * 1000;

function isRoster(value: unknown): value is readonly RosterPlayerSeed[] {
  return (
    Array.isArray(value) &&
    value.every(
      (p) => typeof p === 'object' && p !== null && typeof (p as { id?: unknown }).id === 'string',
    )
  );
}

/** Row JSON → snapshot of this fixture, or null when it is not usable. */
export function readKickoffSnapshot(
  raw: unknown,
  fixtureId: string,
  clubId: string,
): KickoffSnapshot | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const s = raw as Partial<KickoffSnapshot>;
  if (s.club?.id !== clubId || s.fixture?.id !== fixtureId) return null;
  if (!isRoster(s.ourXi) || s.ourXi.length !== 11 || !isRoster(s.ourBench)) return null;
  if (s.theirXi != null && !isRoster(s.theirXi)) return null;
  return {
    club: s.club,
    fixture: s.fixture,
    ourXi: s.ourXi,
    ourBench: s.ourBench,
    formation: parseOurFormation(s.formation),
    theirXi: s.theirXi ?? null,
  };
}

export function sessionFromKickoff(s: KickoffSnapshot): MatchSession {
  return createSessionFromLeagueFixture(
    s.club,
    s.fixture,
    s.ourXi,
    s.ourBench,
    s.formation,
    s.theirXi,
  );
}
