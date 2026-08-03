import { describe, expect, it } from 'vitest';

import {
  careerPhaseLabel,
  resolveCareerPhase,
  resolveCareerPhaseView,
} from '@/lib/squad/career-phase';
import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import { allowGrowthImpulse, resolveGrowthCoefficient } from '@/lib/squad/growth-gate';
import { applyMatchDevelopmentEffects } from '@/lib/squad/match-development';
import { applySeasonAgeEffects } from '@/lib/squad/season-age';

describe('LFE-CAREER-DECLINE-01 Career Phase', () => {
  it('maps age bands monotonically', () => {
    expect(resolveCareerPhase({ age: 18 })).toBe('youth');
    expect(resolveCareerPhase({ age: 20 })).toBe('youth');
    expect(resolveCareerPhase({ age: 21 })).toBe('rising');
    expect(resolveCareerPhase({ age: 25 })).toBe('rising');
    expect(resolveCareerPhase({ age: 27 })).toBe('rising');
    expect(resolveCareerPhase({ age: 28 })).toBe('prime');
    expect(resolveCareerPhase({ age: 30 })).toBe('prime');
    expect(resolveCareerPhase({ age: 31 })).toBe('prime');
    expect(resolveCareerPhase({ age: 32 })).toBe('decline');
    expect(resolveCareerPhase({ age: 34 })).toBe('decline');
    expect(resolveCareerPhase({ age: 37 })).toBe('decline');
    expect(resolveCareerPhase({ age: 38 })).toBe('late');
    expect(resolveCareerPhase({ age: 40 })).toBe('late');
  });

  it('accepts reserved extensible fields without changing Thin age derive', () => {
    expect(resolveCareerPhase({ age: 30, role: 'GK', experience: 200 })).toBe('prime');
    expect(resolveCareerPhase({ age: 30 })).toBe(
      resolveCareerPhase({ age: 30, role: 'ST', experience: 1 }),
    );
  });

  it('labels are Information Thin (no numeric score)', () => {
    expect(resolveCareerPhaseView('decline').label).toBe('Schyłek');
    expect(careerPhaseLabel({ age: 34 })).toBe('Schyłek');
  });
});

describe('LFE-CAREER-DECLINE-01 Growth Gate', () => {
  it('coefficients stay in (0, 1]', () => {
    for (const phase of ['youth', 'rising', 'prime', 'decline', 'late'] as const) {
      const c = resolveGrowthCoefficient(phase);
      expect(c).toBeGreaterThan(0);
      expect(c).toBeLessThanOrEqual(1);
    }
    expect(resolveGrowthCoefficient('youth')).toBe(1);
    expect(resolveGrowthCoefficient('decline')).toBe(DEVELOPMENT_THIN.GROWTH_COEFF_DECLINE);
    expect(resolveGrowthCoefficient('late')).toBe(DEVELOPMENT_THIN.GROWTH_COEFF_LATE);
  });

  it('prime always allows; gate is deterministic', () => {
    expect(allowGrowthImpulse('p1', 'm1', 'prime')).toBe(true);
    expect(allowGrowthImpulse('p1', 'm1', { age: 30 })).toBe(true);
    const a = allowGrowthImpulse('veteran', 'match:42', 'late');
    const b = allowGrowthImpulse('veteran', 'match:42', 'late');
    expect(a).toBe(b);
  });

  it('decline/late gate reduces boosts vs rising on same pool', () => {
    const rising = Array.from({ length: 11 }, (_, i) => ({
      id: `r${i}`,
      name: `R${i}`,
      skill: 60,
      potential: 90,
      starter: true,
      age: 24,
    }));
    const late = rising.map((p) => ({ ...p, id: `l${p.id}`, age: 40 }));
    const risingUps = applyMatchDevelopmentEffects(rising, 'gate-cmp').filter(
      (p, i) => p.skill > rising[i]!.skill,
    );
    const lateUps = applyMatchDevelopmentEffects(late, 'gate-cmp').filter(
      (p, i) => p.skill > late[i]!.skill,
    );
    expect(risingUps.length).toBe(5);
    expect(lateUps.length).toBeLessThanOrEqual(risingUps.length);
  });
});

describe('LFE-CAREER-DECLINE-01 season regress bands', () => {
  it('decline −1 and late −2; academy-aged row same path', () => {
    const out = applySeasonAgeEffects([
      { id: 'dec', age: 33, skill: 70, potential: 80 },
      { id: 'academy-old', age: 37, skill: 50, potential: 70 },
    ]);
    expect(out.find((p) => p.id === 'dec')).toEqual({ id: 'dec', age: 34, skill: 69 });
    expect(out.find((p) => p.id === 'academy-old')).toEqual({
      id: 'academy-old',
      age: 38,
      skill: 48,
    });
  });
});
