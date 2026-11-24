import { describe, expect, it } from 'vitest';

import {
  createPauseMatchCommand,
  createResumeMatchCommand,
  DEFAULT_PLAYER_CONDITION,
} from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import { createSessionFromLeagueFixture, teamSpiritFromSeed } from '@/lib/fixtures/create-session';
import type { FixtureDto } from '@/lib/fixtures/types';
import {
  MANAGER_LOG_MAX,
  SUB_COMMAND,
  managerCommand,
  managerSubstitution,
  parseManagerLog,
  type ManagerLogEntry,
} from '@/lib/match/manager-commands';
import { kickOffSession, replayManagerMatch } from '@/lib/match/replay-manager-match';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';

const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'ST', 'LW'] as const;

function session(id: string, isHome: boolean) {
  const club = { id: 'c1', name: 'T', shortName: 'T', leagueTier: 'iv' } as ClubDto;
  const fixture = {
    id,
    clubId: 'c1',
    matchday: 1,
    competition: 'league',
    opponentClubId: 'opp-stal-brzeg',
    opponent: { id: 'opp-stal-brzeg', name: 'Stal', shortName: 'STB' },
    isHome,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    playedAt: null,
    createdAt: '2026-11-23',
  } as FixtureDto;
  const xi = ROLES.map((role, i): RosterPlayerSeed => ({
    id: `p-${i}`,
    name: `P${i}`,
    number: i + 1,
    pos: 'X',
    role,
    starter: true,
    skill: 60,
  }));
  const bench: RosterPlayerSeed[] = [
    { id: 'b-1', name: 'B', number: 12, pos: 'N', role: 'ST', starter: false as const, skill: 75 },
  ];
  return createSessionFromLeagueFixture(club, fixture, xi, bench);
}

type Plan = readonly (readonly [tick: number, command: string])[];

/** The live view: pulses of several ticks, clicks between them, pauses. */
function playLive(id: string, isHome: boolean, plan: Plan, pulse: number) {
  const s = session(id, isHome);
  const side = isHome ? 'home' : 'away';
  const log: ManagerLogEntry[] = [];
  kickOffSession(s);
  let at = 0;
  for (let i = 0; i < 12_000 && s.getMatchState().phase !== 'FINISHED'; i += 1) {
    while (at < plan.length && s.context().tick >= plan[at]![0]) {
      const c = plan[at]![1];
      const tick = s.context().tick;
      if (c === 'pause') {
        s.dispatch(createPauseMatchCommand({ tick, source: 'ui' }));
        s.dispatch(createResumeMatchCommand({ tick, source: 'ui' }));
      } else if (c === SUB_COMMAND) {
        const ok = s.dispatch(managerSubstitution('p-9', 'b-1', tick, side)).ok;
        if (ok) log.push({ t: tick, c, o: 'p-9', i: 'b-1' });
      } else if (s.dispatch(managerCommand(c, tick, side)!).ok) {
        log.push({ t: tick, c });
      }
      s.context().events.flush();
      at += 1;
    }
    s.run(pulse);
  }
  const { home, away } = s.getMatchState().score;
  return { score: { home, away }, log };
}

describe('replayManagerMatch', () => {
  const plan: Plan = [
    [60, 'attack'],
    [301, 'pause'],
    [420, SUB_COMMAND],
    [700, 'form-433'],
    [1100, 'press'],
    [1500, 'defend'],
  ];

  it.each([
    ['fx-a', true, 1],
    ['fx-b', false, 2],
    ['fx-c', true, 4],
    ['fx-d', false, 4],
  ] as const)('gives the score the manager saw (%s)', { timeout: 60_000 }, (id, home, pulse) => {
    const live = playLive(id, home, plan, pulse);
    expect(live.log.length).toBe(5);
    const sent = parseManagerLog(JSON.stringify(live.log))!;
    const replayed = replayManagerMatch(session(id, home), home ? 'home' : 'away', sent)!;
    expect({ home: replayed.home, away: replayed.away }).toEqual(live.score);
    const goals = (side: 'home' | 'away') =>
      replayed.players.filter((p) => p.side === side).reduce((sum, p) => sum + p.goals, 0);
    expect({ home: goals('home'), away: goals('away') }).toEqual(live.score);
  });

  it('ignores unknown commands and a fourth substitution', { timeout: 60_000 }, () => {
    const clean = replayManagerMatch(session('fx-e', true), 'home', []);
    const noisy = replayManagerMatch(session('fx-e', true), 'home', [
      { t: 10, c: 'score-99' },
      { t: 12, c: SUB_COMMAND, o: 'nobody', i: 'ghost' },
    ]);
    expect(noisy).toEqual(clean);
  });
});

describe('parseManagerLog', () => {
  it('accepts an empty log and refuses malformed ones', () => {
    expect(parseManagerLog(null)).toEqual([]);
    expect(parseManagerLog('[]')).toEqual([]);
    for (const bad of [
      'x',
      '{}',
      '[{"t":-1,"c":"attack"}]',
      '[{"t":1.5,"c":"attack"}]',
      '[{"t":9,"c":"attack"},{"t":3,"c":"press"}]',
      '[{"t":1,"c":"sub"}]',
      '[{"t":1}]',
      JSON.stringify(Array.from({ length: MANAGER_LOG_MAX + 1 }, () => ({ t: 1, c: 'press' }))),
    ]) {
      expect(parseManagerLog(bad), bad.slice(0, 40)).toBeNull();
    }
  });
});

describe('team spirit seed', () => {
  it('is neutral for an ordinary player and without stored morale', () => {
    const neutral = DEFAULT_PLAYER_CONDITION.morale;
    expect(teamSpiritFromSeed({ form: 65, morale: 60 })).toBe(neutral);
    expect(teamSpiritFromSeed({ form: 95 })).toBe(neutral);
    expect(teamSpiritFromSeed({ form: 75, morale: 100 })).toBe(neutral + 25);
    expect(teamSpiritFromSeed({ form: 55, morale: 10 })).toBe(neutral - 30);
    expect(teamSpiritFromSeed({ form: 20, morale: 0 })).toBe(18);
  });
});
