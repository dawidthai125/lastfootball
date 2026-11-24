import { describe, expect, it } from 'vitest';

import { invitePath, isInviteCode, newInviteCode } from '@/lib/invites/code';
import { resolveStarterPath } from '@/lib/starter/steps';

const none = { played: 0, trained: false, intake: false, claimed: false };

describe('first steps (D142)', () => {
  it('points at the first step that is not done', () => {
    expect(resolveStarterPath(none)?.nextId).toBe('match-1');
    expect(resolveStarterPath({ ...none, played: 2 })?.nextId).toBe('training');
    // Steps may be done out of order.
    expect(resolveStarterPath({ ...none, played: 3 })?.nextId).toBe('training');
    expect(resolveStarterPath({ ...none, played: 2, trained: true, intake: true })?.nextId).toBe(
      'match-3',
    );
  });

  it('is complete only with every step and disappears after the reward', () => {
    const all = { played: 3, trained: true, intake: true, claimed: false };
    expect(resolveStarterPath(all)).toMatchObject({ complete: true, nextId: null });
    expect(resolveStarterPath({ ...all, intake: false })?.complete).toBe(false);
    expect(resolveStarterPath({ ...all, claimed: true })).toBeNull();
    expect(resolveStarterPath(null)).toBeNull();
  });
});

describe('invitation code (D142)', () => {
  it('makes codes it accepts and refuses anything else', () => {
    const codes = new Set(Array.from({ length: 50 }, newInviteCode));
    expect(codes.size).toBe(50);
    for (const code of codes) expect(isInviteCode(code)).toBe(true);
    for (const bad of [null, '', 'abc', '../../hub', 'x'.repeat(25), 'ab cd efghij']) {
      expect(isInviteCode(bad)).toBe(false);
    }
    expect(invitePath('abcdefghij')).toBe('/zaproszenie/abcdefghij');
  });
});
