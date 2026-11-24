import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import { createSessionFromLeagueFixture, resolveOpponentXi } from '@/lib/fixtures/create-session';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  leftDuringMatch,
  readKickoffSnapshot,
  sessionFromKickoff,
} from '@/lib/match/kickoff-snapshot';
import { replayManagerMatch } from '@/lib/match/replay-manager-match';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';

const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'ST', 'LW'] as const;
const club = { id: 'c1', name: 'T', shortName: 'T', leagueTier: 'iv' } as ClubDto;
const fixture = {
  id: 'fx-1',
  clubId: 'c1',
  matchday: 1,
  competition: 'league',
  opponentClubId: 'opp-stal-brzeg',
  opponent: { id: 'opp-stal-brzeg', name: 'Stal', shortName: 'STB' },
  isHome: false,
  status: 'upcoming',
  homePitchLevel: undefined,
} as FixtureDto;
const xi = ROLES.map((role, i): RosterPlayerSeed => ({
  id: `p-${i}`,
  name: `P${i}`,
  number: i + 1,
  pos: 'X',
  role,
  starter: true,
  captain: undefined,
  skill: 55 + i,
  energy: 61,
  form: 64,
  morale: 58,
}));
const snapshot = { club, fixture, ourXi: xi, ourBench: [], formation: '4-3-3', theirXi: null };

describe('kickoff snapshot', () => {
  it('replays the same match after the JSON round trip', { timeout: 60_000 }, () => {
    const stored = readKickoffSnapshot(JSON.parse(JSON.stringify(snapshot)), 'fx-1', 'c1');
    const log = [{ t: 100, c: 'attack' }];
    const live = createSessionFromLeagueFixture(club, fixture, xi, [], '4-3-3', null);
    expect(replayManagerMatch(sessionFromKickoff(stored!), 'away', log)).toEqual(
      replayManagerMatch(live, 'away', log),
    );
  });

  it('names a player who was sold or loaned out meanwhile', () => {
    const stored = readKickoffSnapshot(JSON.parse(JSON.stringify(snapshot)), 'fx-1', 'c1')!;
    const squad = xi.map((p) => ({ id: p.id, onLoan: false }));
    expect(leftDuringMatch(stored, squad)).toBeNull();
    expect(leftDuringMatch(stored, squad.slice(1))).toBe('P0');
    expect(
      leftDuringMatch(
        stored,
        squad.map((p) => ({ ...p, onLoan: p.id === 'p-3' })),
      ),
    ).toBe('P3');
  });

  it('freezes the AI rival without changing the match', { timeout: 60_000 }, () => {
    const frozen = { ...snapshot, theirXi: resolveOpponentXi(club, fixture) };
    const stored = readKickoffSnapshot(JSON.parse(JSON.stringify(frozen)), 'fx-1', 'c1')!;
    const live = createSessionFromLeagueFixture(club, fixture, xi, [], '4-3-3', null);
    expect(replayManagerMatch(sessionFromKickoff(stored), 'away', [])).toEqual(
      replayManagerMatch(live, 'away', []),
    );
  });

  it('refuses another fixture, another club and broken rows', () => {
    const raw = JSON.parse(JSON.stringify(snapshot));
    expect(readKickoffSnapshot(raw, 'fx-2', 'c1')).toBeNull();
    expect(readKickoffSnapshot(raw, 'fx-1', 'c2')).toBeNull();
    expect(readKickoffSnapshot({ ...raw, ourXi: raw.ourXi.slice(1) }, 'fx-1', 'c1')).toBeNull();
    expect(readKickoffSnapshot({ ...raw, theirXi: 'x' }, 'fx-1', 'c1')).toBeNull();
    expect(readKickoffSnapshot(null, 'fx-1', 'c1')).toBeNull();
  });
});
