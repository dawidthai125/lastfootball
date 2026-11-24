import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import {
  createSessionFromLeagueFixture,
  resolveOpponentBench,
  resolveOpponentXi,
} from '@/lib/fixtures/create-session';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  leftDuringMatch,
  MATCH_RULES_VERSION,
  readKickoffSnapshot,
  sessionFromKickoff,
} from '@/lib/match/kickoff-snapshot';
import { parsePlayerLines } from '@/lib/match/match-players';
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
const snapshot = {
  club,
  fixture,
  ourXi: xi,
  ourBench: [],
  formation: '4-3-3',
  theirXi: null,
  rules: MATCH_RULES_VERSION,
};

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
    const frozen = {
      ...snapshot,
      theirXi: resolveOpponentXi(club, fixture),
      theirBench: resolveOpponentBench(club, fixture),
    };
    const stored = readKickoffSnapshot(JSON.parse(JSON.stringify(frozen)), 'fx-1', 'c1')!;
    const live = createSessionFromLeagueFixture(club, fixture, xi, [], '4-3-3', null);
    expect(replayManagerMatch(sessionFromKickoff(stored), 'away', [])).toEqual(
      replayManagerMatch(live, 'away', []),
    );
  });

  it('ends a match opened before full rules under its own rules', { timeout: 60_000 }, () => {
    const { rules: _rules, ...old } = snapshot;
    const stored = readKickoffSnapshot(JSON.parse(JSON.stringify(old)), 'fx-1', 'c1')!;
    const session = sessionFromKickoff(stored);
    expect(session.getMatchState().rules).toBeNull();
    const before = createSessionFromLeagueFixture(club, fixture, xi, [], '4-3-3', null, {
      fullRules: false,
    });
    expect(replayManagerMatch(session, 'away', [])).toEqual(replayManagerMatch(before, 'away', []));
  });

  it('a shared match is the same from both clubs', { timeout: 60_000 }, () => {
    const squad = (tag: string, n: number, starter: boolean) =>
      ROLES.slice(0, n).map((role, i): RosterPlayerSeed => ({
        id: `${tag}-${i}`,
        name: `${tag}${i}`,
        number: i + 1,
        pos: 'X',
        role,
        starter,
        captain: starter && i === 5,
        skill: 55 + i,
        energy: 45,
        form: 60,
        leadership: 80,
        talents: i === 4 ? ['egzekutor', 'pluca'] : [],
      }));
    const a = { xi: squad('a', 11, true), bench: squad('ab', 5, false) };
    const b = { xi: squad('b', 11, true), bench: squad('bb', 5, false) };
    const shared = { ...fixture, competition: 'human', sharedSeed: 77 } as FixtureDto;
    const home = createSessionFromLeagueFixture(
      club,
      { ...shared, isHome: true },
      a.xi,
      a.bench,
      '4-4-2',
      b.xi,
      { theirBench: b.bench },
    );
    const away = createSessionFromLeagueFixture(
      club,
      { ...shared, isHome: false },
      b.xi,
      b.bench,
      '4-3-3',
      a.xi,
      { theirBench: a.bench },
    );
    const played = replayManagerMatch(home, 'home', [])!;
    expect(replayManagerMatch(away, 'away', [])).toEqual(played);
    expect(played.players.some((p) => p.minutes !== undefined)).toBe(true);
    expect(home.getMatchState().substitutions.some((s) => s.side === 'home')).toBe(true);
    expect(parsePlayerLines(JSON.parse(JSON.stringify(played.players)))).toEqual(played.players);
  });

  it('gives the armband to the best leader when the captain is not in the eleven', () => {
    const led = xi.map((p, i) => ({ ...p, captain: undefined, leadership: i === 4 ? 85 : 50 }));
    const session = createSessionFromLeagueFixture(club, fixture, led);
    expect(session.getMatchState().awayLineup.captainPlayerId).toBe('p-4');
    const chosen = led.map((p, i) => ({ ...p, captain: i === 7 || undefined }));
    const other = createSessionFromLeagueFixture(club, { ...fixture, isHome: true }, chosen);
    expect(other.getMatchState().homeLineup.captainPlayerId).toBe('p-7');
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
