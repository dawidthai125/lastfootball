import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import {
  resolveClubDailyGoal,
  resolveHubSession,
  resolvePrimaryCta,
  type HubPhase,
} from '@/lib/hub';

function club(partial?: Partial<ClubDto>): ClubDto {
  return {
    id: 'c1',
    ownerId: 'u1',
    name: 'Test FC',
    shortName: 'TFC',
    primaryColor: '#112233',
    secondaryColor: '#445566',
    crestTemplateId: 'crest-a',
    createdAt: '2026-01-01T00:00:00.000Z',
    firstMatchCompletedAt: '2026-07-24T12:00:00.000Z',
    cashBalance: 100_000,
    transferWindowOpen: false,
    lastTrainingOn: null,
    seasonNumber: 1,
    seasonPhase: 'in_season',
    leagueTier: 'iv',
    ...partial,
  };
}

function fixture(partial?: Partial<FixtureDto>): FixtureDto {
  return {
    id: 'fx-1',
    clubId: 'c1',
    matchday: 1,
    competition: 'league',
    opponentClubId: 'opp-wilki-polnocy',
    opponent: { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
    isHome: true,
    status: 'upcoming',
    homeScore: null,
    awayScore: null,
    playedAt: null,
    createdAt: '2026-07-24T12:00:00.000Z',
    ...partial,
  };
}

const today = '2026-07-30';
const phaseSeason: HubPhase = 'SEASON';

function resolve(input: {
  phase?: HubPhase;
  next?: FixtureDto | null;
  last?: FixtureDto | null;
  trainingUnlocked?: boolean;
  lastTrainingOn?: string | null;
  todayUtc?: string;
}) {
  const phase = input.phase ?? phaseSeason;
  const next = input.next ?? null;
  const last = input.last ?? null;
  const session = resolveHubSession(phase, next, last);
  const primary = resolvePrimaryCta(phase, session, {
    nextFixture: next,
    lastPlayedFixture: last,
    hasFixtures: true,
  });
  return {
    session,
    primary,
    goal: resolveClubDailyGoal({
      phase,
      session,
      primary,
      nextFixture: next,
      lastPlayedFixture: last,
      hasFixtures: true,
      trainingUnlocked: input.trainingUnlocked ?? false,
      lastTrainingOn: input.lastTrainingOn ?? null,
      todayUtc: input.todayUtc ?? today,
    }),
  };
}

describe('resolveClubDailyGoal', () => {
  it('returns null outside decision phases', () => {
    const primary = resolvePrimaryCta('NEW_CLUB', 'idle', { nextFixture: null });
    expect(
      resolveClubDailyGoal({
        phase: 'NEW_CLUB',
        session: 'idle',
        primary,
        nextFixture: null,
        trainingUnlocked: false,
        lastTrainingOn: null,
        todayUtc: today,
      }),
    ).toBeNull();
  });

  it('matchday syncs with Primary match href', () => {
    const next = fixture();
    const { session, primary, goal } = resolve({ next });
    expect(session).toBe('matchday');
    expect(primary.id).toBe('play-next-match');
    expect(goal).not.toBeNull();
    expect(goal!.kind).toBe('match');
    expect(goal!.href).toBe(primary.href);
    expect(goal!.syncedWithPrimary).toBe(true);
  });

  it('post_match without upcoming → squad; Primary stays view-squad', () => {
    const played = fixture({
      status: 'played',
      homeScore: 2,
      awayScore: 1,
      matchday: 1,
    });
    const { session, primary, goal } = resolve({ next: null, last: played });
    expect(session).toBe('post_match');
    expect(primary.href).toBe('/squad');
    expect(goal!.kind).toBe('squad');
    expect(goal!.href).toBe('/squad');
    expect(goal!.syncedWithPrimary).toBe(true);
  });

  it('idle + training unlocked + not trained today → training; not Primary', () => {
    const { session, primary, goal } = resolve({
      trainingUnlocked: true,
      lastTrainingOn: null,
    });
    expect(session).toBe('idle');
    expect(primary.href).toBe('/squad');
    expect(goal!.kind).toBe('training');
    expect(goal!.href).toBe('/training');
    expect(goal!.syncedWithPrimary).toBe(false);
  });

  it('soft-lock training → no training suggestion (fallback squad)', () => {
    const { goal } = resolve({
      trainingUnlocked: false,
      lastTrainingOn: null,
    });
    expect(goal!.kind).toBe('squad');
    expect(goal!.href).toBe('/squad');
  });

  it('already trained today UTC → fallback squad', () => {
    const { goal } = resolve({
      trainingUnlocked: true,
      lastTrainingOn: today,
      todayUtc: today,
    });
    expect(goal!.kind).toBe('squad');
  });

  it('is deterministic for identical domain state', () => {
    const next = fixture();
    const a = resolve({ next, trainingUnlocked: true, lastTrainingOn: '2026-07-29' });
    const b = resolve({ next, trainingUnlocked: true, lastTrainingOn: '2026-07-29' });
    expect(a.goal).toEqual(b.goal);
  });

  it('reuses utcDateString shape for todayUtc', () => {
    expect(utcDateString(new Date('2026-07-30T18:00:00.000Z'))).toBe('2026-07-30');
    const c = club();
    void c;
  });

  it('never returns reward-like fields', () => {
    const { goal } = resolve({ next: fixture() });
    expect(goal).toEqual({
      kind: 'match',
      label: expect.any(String),
      href: `/match/fx-1/tunnel`,
      syncedWithPrimary: true,
    });
    expect(goal).not.toHaveProperty('reward');
    expect(goal).not.toHaveProperty('xp');
    expect(goal).not.toHaveProperty('questId');
  });
});
