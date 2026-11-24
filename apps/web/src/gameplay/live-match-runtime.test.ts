import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LiveMatchRuntime } from '@/gameplay/live-match-runtime';
import type { ClubDto } from '@/lib/club/types';
import { buildLeagueLiveBundle } from '@/lib/fixtures/to-ui-fixture';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { RosterPlayerSeed } from '@/lib/squad/seed-roster';

const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'RW', 'CM', 'ST', 'LW'] as const;

function runtime() {
  const club = { id: 'c1', name: 'T', shortName: 'T', leagueTier: 'iv' } as ClubDto;
  const dto = {
    id: 'fx',
    clubId: 'c1',
    matchday: 1,
    competition: 'league',
    opponentClubId: 'opp-stal-brzeg',
    opponent: { id: 'opp-stal-brzeg', name: 'Stal', shortName: 'STB' },
    isHome: true,
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
  const bundle = buildLeagueLiveBundle(club, dto);
  return new LiveMatchRuntime(bundle.fixture, bundle, club, dto, xi);
}

describe('live match clock', () => {
  beforeEach(() => void vi.useFakeTimers());
  afterEach(() => void vi.useRealTimers());

  it('goes on after pause, replay, back and resume', () => {
    const rt = runtime();
    rt.ensureSimulationRunning();
    vi.advanceTimersByTime(2_000);
    rt.togglePause();
    const paused = rt.progress().tick;
    expect(paused).toBeGreaterThan(0);
    rt.enterReplay('start');
    rt.exitReplay();
    rt.togglePause();
    vi.advanceTimersByTime(2_000);
    expect(rt.progress().tick).toBeGreaterThan(paused);
    expect(rt.getSnapshot().momentum).toHaveLength(12);
    rt.dispose();
  });
});
