import { describe, expect, it } from 'vitest';

import {
  applyLeagueTierOutcome,
  parseLeagueTier,
  resolveLeagueTierLabel,
  resolvePromotionOutcome,
  type LeagueTier,
} from '@/lib/league/league-tier';

describe('LFE-PROMOTION-01 resolveLeagueTierLabel', () => {
  it('maps all tiers', () => {
    expect(resolveLeagueTierLabel('iv')).toBe('IV liga');
    expect(resolveLeagueTierLabel('iii')).toBe('III liga');
    expect(resolveLeagueTierLabel('ii')).toBe('II liga');
    expect(resolveLeagueTierLabel('i')).toBe('I liga');
  });

  it('parseLeagueTier defaults unknown to iv', () => {
    expect(parseLeagueTier(null)).toBe('iv');
    expect(parseLeagueTier('nope')).toBe('iv');
    expect(parseLeagueTier('iii')).toBe('iii');
  });
});

describe('LFE-PROMOTION-01 resolvePromotionOutcome + applyLeagueTierOutcome', () => {
  it('promotes places 1–2 from IV', () => {
    const o1 = resolvePromotionOutcome(1, 12, 'iv');
    expect(o1.kind).toBe('promote');
    expect(o1.label).toBe('Awans do III liga');
    expect(applyLeagueTierOutcome('iv', o1.kind)).toBe('iii');

    const o2 = resolvePromotionOutcome(2, 12, 'iv');
    expect(o2.kind).toBe('promote');
    expect(applyLeagueTierOutcome('iv', o2.kind)).toBe('iii');
  });

  it('mid-table stays', () => {
    const o = resolvePromotionOutcome(6, 12, 'iii');
    expect(o.kind).toBe('stay');
    expect(o.label).toBe('Utrzymanie w III liga');
    expect(applyLeagueTierOutcome('iii', o.kind)).toBe('iii');
  });

  it('relegates places 11–12 except floor IV', () => {
    const o11 = resolvePromotionOutcome(11, 12, 'iii');
    expect(o11.kind).toBe('relegate');
    expect(o11.label).toBe('Spadek do IV liga');
    expect(applyLeagueTierOutcome('iii', o11.kind)).toBe('iv');

    const floor = resolvePromotionOutcome(12, 12, 'iv');
    expect(floor.kind).toBe('stay');
    expect(floor.label).toMatch(/Podłoga/);
    expect(applyLeagueTierOutcome('iv', floor.kind)).toBe('iv');
  });

  it('ceiling Liga I: top stay without promote', () => {
    const champ = resolvePromotionOutcome(1, 12, 'i');
    expect(champ.kind).toBe('stay');
    expect(champ.label).toMatch(/Mistrz/);
    expect(applyLeagueTierOutcome('i', champ.kind)).toBe('i');

    const second = resolvePromotionOutcome(2, 12, 'i');
    expect(second.kind).toBe('stay');
    expect(second.label).toMatch(/Wicemistrz/);
  });

  it('applyLeagueTierOutcome climbs and descends one rung', () => {
    const climb: LeagueTier[] = ['iv', 'iii', 'ii', 'i'];
    for (let i = 0; i < climb.length - 1; i += 1) {
      expect(applyLeagueTierOutcome(climb[i]!, 'promote')).toBe(climb[i + 1]);
    }
    expect(applyLeagueTierOutcome('i', 'promote')).toBe('i');
    for (let i = climb.length - 1; i > 0; i -= 1) {
      expect(applyLeagueTierOutcome(climb[i]!, 'relegate')).toBe(climb[i - 1]);
    }
    expect(applyLeagueTierOutcome('iv', 'relegate')).toBe('iv');
  });
});
