import {
  createBench,
  createLineup,
  createMatch,
  createPlayer,
  type FormationCode,
  type MatchSession,
  type PitchRole,
} from '@lastfootball/lfe';
import type { PlayerId } from '@lastfootball/domain';

import type { Fixture } from '@/data/fixtures';
import { getPreMatchBundle } from '@/data/fixtures';
import { dashboardMock } from '@/data/mock';

const ROLE_MAP: Record<string, PitchRole> = {
  BR: 'GK',
  PO: 'RB',
  ŚO: 'CB',
  LO: 'LB',
  ŚP: 'CM',
  PN: 'RW',
  N: 'ST',
  OB: 'CB',
};

function mapRole(pos: string): PitchRole {
  return ROLE_MAP[pos] ?? 'CM';
}

/**
 * Builds a headless MatchSession from fixture + pre-match lineup data.
 * No simulation ticks — GAMEPLAY-01 foundation only.
 */
export function createSessionFromFixture(fixture: Fixture): MatchSession {
  const bundle = getPreMatchBundle(fixture.id);
  const us = dashboardMock.club;
  const homeName = fixture.home ? us.name : fixture.opponent;
  const awayName = fixture.home ? fixture.opponent : us.name;
  const homeShort = fixture.home ? us.shortName : fixture.opponentShort;
  const awayShort = fixture.home ? fixture.opponentShort : us.shortName;

  const ourRows = bundle?.ourLineup ?? [];
  const theirRows = bundle?.theirLineup ?? [];

  const homeTeamId = 'team-home';
  const awayTeamId = 'team-away';

  const homePlayers = padToEleven(ourRows).map((r, i) =>
    createPlayer({
      id: (r.id ?? `home-${i}`) as PlayerId,
      teamId: homeTeamId,
      side: 'home',
      name: r.name,
      shirtNumber: r.number,
      preferredRole: mapRole(r.pos),
    }),
  );
  const awayPlayers = padToEleven(theirRows).map((r, i) =>
    createPlayer({
      id: `away-${i}` as PlayerId,
      teamId: awayTeamId,
      side: 'away',
      name: r.name,
      shirtNumber: r.number,
      preferredRole: mapRole(r.pos),
    }),
  );

  const homeIds = homePlayers.map((p) => p.id);
  const awayIds = awayPlayers.map((p) => p.id);
  const formationCode: FormationCode = '4-4-2';

  const homeLineup = createLineup({
    side: 'home',
    formationCode,
    playerIds: homeIds,
    captainPlayerId: homeIds[5] ?? homeIds[0]!,
  });
  const awayLineup = createLineup({
    side: 'away',
    formationCode,
    playerIds: awayIds,
  });

  const homeBench = createBench('home', []);
  const awayBench = createBench('away', []);

  const session = createMatch({
    seed: hashSeed(fixture.id),
    matchId: fixture.id,
    homeTeamId,
    awayTeamId,
    homeTeamName: homeName,
    awayTeamName: awayName,
    homeShortName: homeShort,
    awayShortName: awayShort,
    homeLineup,
    awayLineup,
    homeBench,
    awayBench,
    players: [...homePlayers, ...awayPlayers],
    // Compressed halves for Live: 45s sim ≈ 45' display
    settings: {
      halfDurationMs: 45_000,
      halfTimeDurationMs: 3_000,
      enableExtraTime: false,
      enablePenalties: false,
    },
  });

  return session;
}

function padToEleven<T extends { pos: string; name: string; number: number; id?: string }>(
  rows: T[],
): T[] {
  const out = [...rows];
  let n = 12;
  while (out.length < 11) {
    out.push({
      pos: 'ŚP',
      name: `Zawodnik ${n}`,
      number: n,
      id: `pad-${n}`,
    } as T);
    n += 1;
  }
  return out.slice(0, 11);
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
