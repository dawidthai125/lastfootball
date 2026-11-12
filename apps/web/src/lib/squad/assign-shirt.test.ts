import { describe, expect, it } from 'vitest';

import { planShirtAssignment } from '@/lib/squad/assign-shirt';

const squad = [
  { id: 'a', name: 'Nowak', shirtNumber: 1 },
  { id: 'b', name: 'Lew', shirtNumber: 10 },
  { id: 'c', name: 'Czarny', shirtNumber: 9 },
];

describe('planShirtAssignment', () => {
  it('sets a free number', () => {
    expect(planShirtAssignment(squad, 'c', 19)).toEqual({
      ok: true,
      swappedWith: null,
      updates: [{ id: 'c', shirtNumber: 19 }],
    });
  });

  it('swaps when the number is taken', () => {
    const plan = planShirtAssignment(squad, 'c', 10);
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;
    expect(plan.swappedWith).toBe('Lew');
    expect(plan.updates[1]).toEqual({ id: 'c', shirtNumber: 10 });
    expect(plan.updates[2]).toEqual({ id: 'b', shirtNumber: 9 });
  });

  it('does nothing when the number is already his', () => {
    expect(planShirtAssignment(squad, 'c', 9)).toEqual({
      ok: true,
      updates: [],
      swappedWith: null,
    });
  });

  it('rejects a number outside 1–99', () => {
    expect(planShirtAssignment(squad, 'c', 0).ok).toBe(false);
    expect(planShirtAssignment(squad, 'c', 100).ok).toBe(false);
    expect(planShirtAssignment(squad, 'c', 9.5).ok).toBe(false);
  });

  it('rejects a player who is not in the squad', () => {
    expect(planShirtAssignment(squad, 'z', 4)).toEqual({ ok: false, reason: 'missing' });
  });

  it('rejects a swap when every number from 1 to 99 is taken', () => {
    const full = Array.from({ length: 99 }, (_, i) => ({
      id: String(i + 1),
      shirtNumber: i + 1,
    }));
    expect(planShirtAssignment(full, '9', 10)).toEqual({ ok: false, reason: 'full' });
  });
});
