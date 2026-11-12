import { describe, expect, it } from 'vitest';

import {
  emptyStadiumLevels,
  homePitchBonus,
  pitchStripeCount,
  stadiumLook,
  stadiumSeatLabel,
  standDress,
  standHasRoof,
  standInset,
  ticketIncome,
  trainingSessionCap,
  upgradePart,
  type StadiumLevels,
  type StadiumPart,
} from '@/lib/stadium/levels';

describe('upgradePart', () => {
  it('refuses cash below the cost and does not change levels', () => {
    const levels = Object.freeze(emptyStadiumLevels());
    const result = upgradePart({ levels, part: 'stands', cash: 39_999 });
    expect(result).toEqual({ ok: false, reason: 'cash' });
    expect(levels).toEqual({ stands: 0, pitch: 0, trainingCenter: 0 });
  });

  it('spends the exact cost and leaves cash at 0', () => {
    const levels = Object.freeze(emptyStadiumLevels());
    const result = upgradePart({ levels, part: 'stands', cash: 40_000 });
    expect(result).toEqual({
      ok: true,
      levels: { stands: 1, pitch: 0, trainingCenter: 0 },
      cost: 40_000,
      cashAfter: 0,
    });
    expect(result.ok && result.levels).not.toBe(levels);
    expect(levels.stands).toBe(0);
  });

  it('upgrades stands three times and rejects the fourth as max', () => {
    const costs = [40_000, 80_000, 140_000] as const;
    let levels: StadiumLevels = emptyStadiumLevels();
    let cash = costs.reduce((sum, cost) => sum + cost, 0);

    for (let step = 0; step < costs.length; step += 1) {
      const frozen = Object.freeze({ ...levels });
      const result = upgradePart({ levels: frozen, part: 'stands', cash });
      expect(result.ok).toBe(true);
      if (!result.ok) return;
      expect(result.cost).toBe(costs[step]);
      expect(result.levels.stands).toBe(step + 1);
      expect(result.levels.pitch).toBe(0);
      expect(result.levels.trainingCenter).toBe(0);
      expect(frozen.stands).toBe(step);
      cash = result.cashAfter;
      levels = result.levels;
    }

    expect(cash).toBe(0);
    expect(levels.stands).toBe(3);
    expect(upgradePart({ levels, part: 'stands', cash: 0 })).toEqual({
      ok: false,
      reason: 'max',
    });
    expect(levels.stands).toBe(3);
  });

  it('rejects a part outside the three', () => {
    const levels = Object.freeze(emptyStadiumLevels());
    const result = upgradePart({
      levels,
      part: 'roof' as StadiumPart,
      cash: 1_000_000,
    });
    expect(result).toEqual({ ok: false, reason: 'part' });
    expect(levels).toEqual(emptyStadiumLevels());
  });

  it('prices pitch and the training center on their own rows', () => {
    const start = Object.freeze(emptyStadiumLevels());
    expect(upgradePart({ levels: start, part: 'pitch', cash: 25_000 })).toEqual({
      ok: true,
      levels: { stands: 0, pitch: 1, trainingCenter: 0 },
      cost: 25_000,
      cashAfter: 0,
    });
    expect(upgradePart({ levels: start, part: 'training_center', cash: 30_000 })).toEqual({
      ok: true,
      levels: { stands: 0, pitch: 0, trainingCenter: 1 },
      cost: 30_000,
      cashAfter: 0,
    });
    expect(start).toEqual(emptyStadiumLevels());
  });

  it('clamps a level outside 0..3 before pricing', () => {
    expect(
      upgradePart({
        levels: { stands: -2, pitch: 4, trainingCenter: 1 },
        part: 'stands',
        cash: 40_000,
      }),
    ).toEqual({
      ok: true,
      levels: { stands: 1, pitch: 4, trainingCenter: 1 },
      cost: 40_000,
      cashAfter: 0,
    });

    expect(
      upgradePart({
        levels: { stands: 1.9, pitch: 0, trainingCenter: 0 },
        part: 'stands',
        cash: 80_000,
      }),
    ).toEqual({
      ok: true,
      levels: { stands: 2, pitch: 0, trainingCenter: 0 },
      cost: 80_000,
      cashAfter: 0,
    });

    expect(
      upgradePart({
        levels: { stands: 9, pitch: 0, trainingCenter: 0 },
        part: 'stands',
        cash: 1,
      }),
    ).toEqual({ ok: false, reason: 'max' });
  });
});

describe('stadiumSeatLabel', () => {
  it('keeps the starter seats at level 0 and grows with the stands', () => {
    expect(stadiumSeatLabel(0)).toBe('4 200 miejsc');
    expect(stadiumSeatLabel(1)).toBe('7 200 miejsc');
    expect(stadiumSeatLabel(2)).toBe('11 000 miejsc');
    expect(stadiumSeatLabel(3)).toBe('16 000 miejsc');
    expect(stadiumSeatLabel(9)).toBe('16 000 miejsc');
  });
});

describe('standInset', () => {
  it('adds no margin at level 0 and room for a roof at level 3', () => {
    expect(standInset(0)).toBe(0);
    expect(standInset(3)).toBe(20);
    expect(pitchStripeCount(0)).toBe(0);
    expect(pitchStripeCount(3)).toBe(5);
  });
});

describe('ticketIncome', () => {
  it('is 0 at level 0, 4200 for level 2 lively, and quiet pays less than steady', () => {
    expect(ticketIncome({ standsLevel: 0, attendance: 'lively' })).toBe(0);
    expect(ticketIncome({ standsLevel: 2, attendance: 'lively' })).toBe(4_200);
    expect(ticketIncome({ standsLevel: 2, attendance: 'quiet' })).toBeLessThan(
      ticketIncome({ standsLevel: 2, attendance: 'steady' }),
    );
  });
});

describe('homePitchBonus', () => {
  it('is 0 at level 0 and 3 at level 3', () => {
    expect(homePitchBonus(0)).toBe(0);
    expect(homePitchBonus(3)).toBe(3);
  });
});

describe('trainingSessionCap', () => {
  it('keeps 3 at level 0 and reaches 6 at level 3', () => {
    expect(trainingSessionCap(0)).toBe(3);
    expect(trainingSessionCap(3)).toBe(6);
  });
});

describe('standDress', () => {
  it('keeps level 0 bare and grows rows, lights, then a roof', () => {
    expect(standDress(0)).toEqual({ rows: 0, crowd: 'none', roof: false, lights: false });
    expect(standDress(1)).toEqual({ rows: 2, crowd: 'sparse', roof: false, lights: false });
    expect(standDress(2).lights).toBe(true);
    expect(standDress(2).roof).toBe(false);
    expect(standDress(3)).toEqual({ rows: 4, crowd: 'covered', roof: true, lights: true });
    expect(standDress(9).roof).toBe(standHasRoof(9));
  });
});

describe('stadiumLook', () => {
  it('uses the starter stands label and does not contain the word token', () => {
    const look = stadiumLook(emptyStadiumLevels());
    expect(look.stands).toBe('Trybuny startowe');
    expect(JSON.stringify(look).toLowerCase()).not.toContain('token');
  });
});
