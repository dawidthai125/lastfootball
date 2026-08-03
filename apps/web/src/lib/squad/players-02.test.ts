import { describe, expect, it } from 'vitest';

import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import {
  applyMatchDevelopmentEffects,
  summarizeMatchDevelopment,
} from '@/lib/squad/match-development';
import {
  hashPlayerId,
  POTENTIAL_BAND_LABEL,
  resolvePlayerPotential,
  resolvePotentialBand,
  seedPotentialCeiling,
} from '@/lib/squad/potential';
import { applySeasonAgeEffects } from '@/lib/squad/season-age';
import { applyTrainingSessionEffects } from '@/lib/training/apply-effects';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';

describe('LFE-PLAYERS-02 potential (wariant B)', () => {
  it('is deterministic for same id+age', () => {
    const a = resolvePlayerPotential(60, 's-abc-01', 22);
    const b = resolvePlayerPotential(60, 's-abc-01', 22);
    expect(a).toBe(b);
    expect(hashPlayerId('s-abc-01')).toBe(hashPlayerId('s-abc-01'));
  });

  it('potential = max(skill, seeded) and never below skill', () => {
    const id = 'player-high-skill';
    const seeded = seedPotentialCeiling(id, 24);
    expect(resolvePlayerPotential(seeded - 5, id, 24)).toBe(seeded);
    expect(resolvePlayerPotential(95, id, 24)).toBe(Math.max(95, seeded));
    expect(resolvePlayerPotential(99, id, 40)).toBe(99);
  });

  it('bands map without exposing numbers in labels', () => {
    expect(resolvePotentialBand(50)).toBe('low');
    expect(resolvePotentialBand(70)).toBe('medium');
    expect(resolvePotentialBand(80)).toBe('high');
    expect(resolvePotentialBand(90)).toBe('elite');
    expect(Object.values(POTENTIAL_BAND_LABEL)).toEqual([
      'Niski',
      'Średni',
      'Wysoki',
      'Bardzo wysoki',
    ]);
  });
});

describe('LFE-PLAYERS-02 match development', () => {
  const starters = [
    { id: 'a', name: 'A', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'b', name: 'B', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'c', name: 'C', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'd', name: 'D', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'e', name: 'E', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'f', name: 'F', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'g', name: 'G', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'h', name: 'H', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'i', name: 'I', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'j', name: 'J', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'k', name: 'K', skill: 60, potential: 80, starter: true, age: 24 },
    { id: 'bench', name: 'Bench', skill: 60, potential: 80, starter: false, age: 24 },
  ];

  it('caps at K_MATCH=5 and +1; only starters; never above potential', () => {
    const after = applyMatchDevelopmentEffects(starters);
    const ups = after.filter((p, i) => p.skill > starters[i]!.skill);
    expect(ups.length).toBeLessThanOrEqual(DEVELOPMENT_THIN.SKILL_UP_MAX_PER_MATCH);
    expect(ups.length).toBe(5);
    for (const p of ups) {
      const prev = starters.find((s) => s.id === p.id)!;
      expect(prev.starter).toBe(true);
      expect(p.skill - prev.skill).toBe(1);
      expect(p.skill).toBeLessThanOrEqual(prev.potential);
    }
    expect(after.find((p) => p.id === 'bench')?.skill).toBe(60);
  });

  it('skips players already at potential', () => {
    const capped = [
      { id: 'x', name: 'X', skill: 75, potential: 75, starter: true, age: 24 },
      { id: 'y', name: 'Y', skill: 70, potential: 80, starter: true, age: 24 },
    ];
    const after = applyMatchDevelopmentEffects(capped);
    expect(after.find((p) => p.id === 'x')?.skill).toBe(75);
    expect(after.find((p) => p.id === 'y')?.skill).toBe(71);
  });

  it('summarize lists skill-up names', () => {
    const after = applyMatchDevelopmentEffects(starters);
    const summary = summarizeMatchDevelopment(starters, after);
    expect(summary.skillUp).toBe(5);
    expect(summary.skillUpNames).toHaveLength(5);
  });
});

describe('LFE-PLAYERS-02 training respects potential', () => {
  it('does not raise skill above potential', () => {
    const base = [
      { id: 'a', status: 'READY' as const, skill: 70, potential: 70, age: 24 },
      { id: 'b', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
      { id: 'c', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
      { id: 'd', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
      { id: 'e', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
      { id: 'f', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
      { id: 'g', status: 'READY' as const, skill: 60, potential: 80, age: 24 },
    ];
    const out = applyTrainingSessionEffects(base, 'tactics', 'normal');
    expect(out.find((p) => p.id === 'a')?.skill).toBe(70);
    for (const p of out) {
      const prev = base.find((b) => b.id === p.id)!;
      expect(p.skill).toBeLessThanOrEqual(prev.potential);
    }
  });
});

describe('LFE-AGE-01 / PLAYERS-02 season age pure', () => {
  it('applySeasonAgeEffects ages +1 and soft-regresses from AGE_REGRESS_FROM', () => {
    const out = applySeasonAgeEffects([
      { id: 'young', age: 20, skill: 70, potential: 90 },
      { id: 'edge', age: DEVELOPMENT_THIN.AGE_REGRESS_FROM - 1, skill: 80, potential: 85 },
      { id: 'old', age: DEVELOPMENT_THIN.AGE_REGRESS_FROM, skill: 80, potential: 85 },
    ]);
    expect(out.find((p) => p.id === 'young')).toEqual({
      id: 'young',
      age: 21,
      skill: 70,
    });
    expect(out.find((p) => p.id === 'edge')).toEqual({
      id: 'edge',
      age: DEVELOPMENT_THIN.AGE_REGRESS_FROM,
      skill: 79,
    });
    expect(out.find((p) => p.id === 'old')).toEqual({
      id: 'old',
      age: DEVELOPMENT_THIN.AGE_REGRESS_FROM + 1,
      skill: 79,
    });
  });

  it('caps age at 50 and never drops skill below 1; late regress −2', () => {
    const out = applySeasonAgeEffects([
      { id: 'cap', age: 50, skill: 40, potential: 50 },
      { id: 'floor', age: 40, skill: 1, potential: 60 },
      { id: 'late', age: 37, skill: 70, potential: 80 },
    ]);
    expect(out.find((p) => p.id === 'cap')).toEqual({ id: 'cap', age: 50, skill: 38 });
    expect(out.find((p) => p.id === 'floor')).toEqual({ id: 'floor', age: 41, skill: 1 });
    expect(out.find((p) => p.id === 'late')).toEqual({ id: 'late', age: 38, skill: 68 });
  });
});

describe('LFE-PLAYERS-02 transfer fee unchanged', () => {
  it('deriveTransferFee still uses skill+age only', () => {
    const fee = deriveTransferFee(70, 24);
    expect(fee).toBe(deriveTransferFee(70, 24));
    expect(typeof fee).toBe('number');
  });
});
