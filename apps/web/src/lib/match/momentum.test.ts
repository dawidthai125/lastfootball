import { describe, expect, it } from 'vitest';

import { MOMENTUM_WINDOWS, momentumFromEvents } from '@/lib/match/momentum';

describe('momentumFromEvents', () => {
  it('is level before anything happens', () => {
    expect(momentumFromEvents([])).toEqual(new Array(MOMENTUM_WINDOWS).fill(50));
  });

  it('follows the side that attacks and keeps extra time in the last window', () => {
    const line = momentumFromEvents([
      { type: 'SHOT', payload: { side: 'home', minute: 3 } },
      { type: 'ATTACK', payload: { side: 'away', minute: 4 } },
      { type: 'GOAL', payload: { side: 'away', minute: 20 } },
      { type: 'SHOT', payload: { side: 'home', minute: 118 } },
      { type: 'GOAL', payload: { side: 'away', minute: 120, kind: 'penalty_decider' } },
      { type: 'FOUL', payload: { side: 'away', minute: 50 } },
    ]);
    expect(line[0]).toBe(67);
    expect(line[2]).toBe(0);
    expect(line[6]).toBe(50);
    expect(line[11]).toBe(100);
  });
});
