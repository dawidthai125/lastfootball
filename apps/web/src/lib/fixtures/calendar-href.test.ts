import { describe, expect, it } from 'vitest';

import { calendarFixtureHref, fixtureKickoffSentence } from '@/lib/fixtures/calendar-href';
import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';

const now = new Date('2026-11-12T18:00:00.000Z');
const earlierToday = '2026-11-12T12:00:00.000Z';
const yesterday = '2026-11-11T12:00:00.000Z';

describe('fixtureKickoffSentence', () => {
  it('delegates to kickoffBlockReason, including a human match on the same day', () => {
    const human = {
      matchesBlocked: false,
      competition: 'human' as const,
      lastPlayedAt: earlierToday,
      now,
    };
    const league = { ...human, competition: 'league' as const };
    expect(fixtureKickoffSentence(human)).toBe(kickoffBlockReason(human));
    expect(fixtureKickoffSentence(human)).toBeNull();
    expect(fixtureKickoffSentence(league)).toBe(kickoffBlockReason(league));
    expect(fixtureKickoffSentence(league)).not.toBeNull();
  });
});

describe('calendarFixtureHref', () => {
  const blockedDay = {
    matchesBlocked: false,
    lastPlayedAt: earlierToday,
    now,
  };

  it('keeps a played row on the match page, not the tunnel', () => {
    expect(
      calendarFixtureHref({
        id: 'fx-7',
        status: 'played',
        competition: 'league',
        ...blockedDay,
      }),
    ).toBe('/match/fx-7');
  });

  it('does not open the tunnel for a blocked league, cup, or challenge kickoff', () => {
    for (const competition of ['league', 'cup', 'challenge'] as const) {
      expect(
        calendarFixtureHref({
          id: 'fx',
          status: 'upcoming',
          competition,
          ...blockedDay,
        }),
      ).toBeNull();
      expect(
        calendarFixtureHref({
          id: 'later',
          status: 'scheduled',
          competition,
          ...blockedDay,
        }),
      ).toBeNull();
    }
  });

  it('still opens a human upcoming match on a day that already has a result', () => {
    expect(
      calendarFixtureHref({
        id: 'hum',
        status: 'upcoming',
        competition: 'human',
        ...blockedDay,
      }),
    ).toBe('/match/hum/tunnel');
  });

  it('blocks every competition, including human, after the email deadline', () => {
    expect(
      calendarFixtureHref({
        id: 'hum',
        status: 'upcoming',
        competition: 'human',
        matchesBlocked: true,
        lastPlayedAt: null,
        now,
      }),
    ).toBeNull();
  });

  it('keeps the tunnel when the Warsaw day is still open', () => {
    expect(
      calendarFixtureHref({
        id: 'fx',
        status: 'upcoming',
        competition: 'league',
        matchesBlocked: false,
        lastPlayedAt: yesterday,
        now,
      }),
    ).toBe('/match/fx/tunnel');
  });

  it('leaves a scheduled row without a tunnel even when the day is open', () => {
    expect(
      calendarFixtureHref({
        id: 'later',
        status: 'scheduled',
        competition: 'cup',
        matchesBlocked: false,
        lastPlayedAt: yesterday,
        now,
      }),
    ).toBeNull();
  });

  it('keeps live on /live while the kickoff gate is closed', () => {
    expect(
      calendarFixtureHref({
        id: 'live-1',
        status: 'live',
        competition: 'league',
        ...blockedDay,
      }),
    ).toBe('/match/live-1/live');
  });
});
