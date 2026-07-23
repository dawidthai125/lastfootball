import { describe, expect, it } from 'vitest';

import {
  MATCH_LIFECYCLE_STATES,
  applyLifecycleEvent,
  defaultLifecycleContext,
  getAllowedEvents,
} from './index';

function ev(
  type: Parameters<typeof applyLifecycleEvent>[1]['type'],
  tick = 0,
  extra?: { walkoverWinner?: 'home' | 'away'; reason?: string },
) {
  return { type, tick, ...extra };
}

describe('EPIC-3 match state machine', () => {
  it('exposes the required lifecycle states', () => {
    expect([...MATCH_LIFECYCLE_STATES]).toEqual([
      'PRE_MATCH',
      'LINEUP',
      'KICKOFF',
      'FIRST_HALF',
      'HALF_TIME',
      'SECOND_HALF',
      'EXTRA_TIME',
      'PENALTIES',
      'FULL_TIME',
      'FINISHED',
    ]);
  });

  it('follows the happy path regulation → full time → finished', () => {
    let state: (typeof MATCH_LIFECYCLE_STATES)[number] = 'PRE_MATCH';
    const ctx = defaultLifecycleContext({
      homeLineupConfirmed: true,
      awayLineupConfirmed: true,
      scoreTied: false,
    });

    const steps = [
      'PREPARE_LINEUPS',
      'CONFIRM_LINEUPS',
      'OPEN_PLAY',
      'END_FIRST_HALF',
      'START_SECOND_HALF',
      'END_SECOND_HALF',
      'COMPLETE_MATCH',
    ] as const;

    const expected = [
      'LINEUP',
      'KICKOFF',
      'FIRST_HALF',
      'HALF_TIME',
      'SECOND_HALF',
      'FULL_TIME',
      'FINISHED',
    ] as const;

    steps.forEach((type, i) => {
      const result = applyLifecycleEvent(state, ev(type, i + 1), ctx);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.to).toBe(expected[i]);
        state = result.to;
      }
    });
  });

  it('branches to extra time then penalties when tied', () => {
    let state: (typeof MATCH_LIFECYCLE_STATES)[number] = 'SECOND_HALF';
    const ctx = defaultLifecycleContext({
      scoreTied: true,
      enableExtraTime: true,
      enablePenalties: true,
    });

    let r = applyLifecycleEvent(state, ev('END_SECOND_HALF', 1), ctx);
    expect(r.ok && r.to).toBe('EXTRA_TIME');
    if (r.ok) state = r.to;

    r = applyLifecycleEvent(state, ev('END_EXTRA_TIME', 2), ctx);
    expect(r.ok && r.to).toBe('PENALTIES');
    if (r.ok) state = r.to;

    r = applyLifecycleEvent(state, ev('END_PENALTIES', 3), ctx);
    expect(r.ok && r.to).toBe('FULL_TIME');
  });

  it('rejects illegal events and is deterministic', () => {
    const ctx = defaultLifecycleContext();
    const a = applyLifecycleEvent('PRE_MATCH', ev('OPEN_PLAY'), ctx);
    const b = applyLifecycleEvent('PRE_MATCH', ev('OPEN_PLAY'), ctx);
    expect(a).toEqual(b);
    expect(a.ok).toBe(false);
  });

  it('supports abandon and walkover into FINISHED', () => {
    const ctx = defaultLifecycleContext();
    const abandon = applyLifecycleEvent('FIRST_HALF', ev('ABANDON_MATCH', 9), ctx);
    expect(abandon.ok && abandon.to).toBe('FINISHED');

    const walkover = applyLifecycleEvent(
      'LINEUP',
      ev('DECLARE_WALKOVER', 2, { walkoverWinner: 'home' }),
      ctx,
    );
    expect(walkover.ok && walkover.to).toBe('FINISHED');

    const bad = applyLifecycleEvent('LINEUP', ev('DECLARE_WALKOVER', 2), ctx);
    expect(bad.ok).toBe(false);
  });

  it('lists allowed events per state', () => {
    expect(getAllowedEvents('FINISHED')).toEqual([]);
    expect(getAllowedEvents('PRE_MATCH')).toContain('PREPARE_LINEUPS');
  });
});
