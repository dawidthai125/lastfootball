import { describe, expect, it } from 'vitest';

import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveClubDailyGoal, resolvePrimaryCta } from '@/lib/hub';

const now = new Date('2026-11-12T18:00:00.000Z');
const earlierToday = '2026-11-12T12:00:00.000Z';
const email = 'Potwierdź email, żeby rozgrywać kolejne mecze.';
const day = 'Kolejka na dziś już rozegrana. Następny mecz od jutra.';

function fixture(partial?: Partial<FixtureDto>): FixtureDto {
  return {
    id: 'fx-1',
    clubId: 'c1',
    matchday: 2,
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

describe('resolvePrimaryCta kickoff gate', () => {
  it('sends the email block to profile instead of the tunnel', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      matchesBlocked: true,
      lastPlayedAt: earlierToday,
      now,
    });
    expect(primary).toMatchObject({
      id: 'confirm-email',
      label: 'Potwierdź email',
      href: '/profile',
      access: 'open',
    });
    expect(primary.href).not.toContain('/tunnel');
  });

  it('labels the same-day block with the helper sentence and opens the calendar', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('EARLY_CLUB', 'matchday', {
      nextFixture: next,
      matchesBlocked: false,
      lastPlayedAt: earlierToday,
      now,
    });
    expect(primary).toMatchObject({
      id: 'matchday-blocked',
      label: day,
      href: '/matches',
    });
    expect(primary.href).not.toContain('/match/');
  });

  it('still opens the tunnel when the day is clear', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      matchesBlocked: false,
      lastPlayedAt: '2026-11-11T12:00:00.000Z',
      now,
    });
    expect(primary).toMatchObject({
      id: 'play-next-match',
      label: 'Idź do meczu',
      href: '/match/fx-1/tunnel',
    });
  });

  it('does not apply the day rule to a human fixture', () => {
    const next = fixture({ competition: 'human' });
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      matchesBlocked: false,
      lastPlayedAt: earlierToday,
      now,
    });
    expect(primary.href).toBe('/match/fx-1/tunnel');
  });

  it('leaves squad and offseason alone', () => {
    expect(
      resolvePrimaryCta('SEASON', 'idle', {
        nextFixture: null,
        matchesBlocked: true,
        lastPlayedAt: earlierToday,
        now,
      }).href,
    ).toBe('/squad');
    expect(
      resolvePrimaryCta('OFFSEASON', 'idle', {
        nextFixture: fixture(),
        matchesBlocked: true,
        lastPlayedAt: earlierToday,
        now,
      }).href,
    ).toBe('/hub');
  });
});

describe('resolveClubDailyGoal kickoff gate', () => {
  const base = {
    phase: 'SEASON' as const,
    trainingUnlocked: true,
    lastTrainingOn: null,
    todayUtc: '2026-11-12',
    hasFixtures: true,
    now,
  };

  it('does not point at the tunnel after the email deadline', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      matchesBlocked: true,
      now,
    });
    const goal = resolveClubDailyGoal({
      ...base,
      session: 'matchday',
      primary,
      nextFixture: next,
      matchesBlocked: true,
    });
    expect(goal).toMatchObject({
      label: email,
      href: '/profile',
      syncedWithPrimary: true,
    });
    expect(goal!.href).not.toContain('tunnel');
  });

  it('uses the day sentence and the calendar while the Warsaw day is closed', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      lastPlayedAt: earlierToday,
      now,
    });
    const goal = resolveClubDailyGoal({
      ...base,
      lastTrainingOn: base.todayUtc,
      session: 'matchday',
      primary,
      nextFixture: next,
      lastPlayedAt: earlierToday,
    });
    expect(goal).toMatchObject({
      kind: 'fixtures',
      label: day,
      href: '/matches',
      syncedWithPrimary: true,
    });
  });

  it('points at the open training when the match of the day is done', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'matchday', {
      nextFixture: next,
      lastPlayedAt: earlierToday,
      now,
    });
    const goal = resolveClubDailyGoal({
      ...base,
      session: 'matchday',
      primary,
      nextFixture: next,
      lastPlayedAt: earlierToday,
    });
    expect(goal).toMatchObject({ kind: 'training', href: '/training' });
  });

  it('keeps a defensive post-match upcoming link off the tunnel', () => {
    const next = fixture();
    const primary = resolvePrimaryCta('SEASON', 'idle', { nextFixture: null });
    const goal = resolveClubDailyGoal({
      ...base,
      session: 'post_match',
      primary,
      nextFixture: next,
      matchesBlocked: true,
    });
    expect(goal!.href).toBe('/profile');
    expect(goal!.label).toBe(email);
    expect(goal!.syncedWithPrimary).toBe(false);
  });
});
