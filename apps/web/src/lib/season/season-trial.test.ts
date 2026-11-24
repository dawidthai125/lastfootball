import { describe, expect, it } from 'vitest';

import { generateAcademyCandidates } from '@/lib/academy/intake';
import { suggestShortName } from '@/lib/club/catalog';
import { describeFanMoodAfterResult } from '@/lib/club/fans';
import { hasPlayedUnlock, unlockPlayedCount } from '@/lib/fixtures/played-unlock';

describe('second season (season trial 2026-11-24)', () => {
  it('keeps modules unlocked after the season slate is cleared', () => {
    expect(hasPlayedUnlock(unlockPlayedCount(0, 1), 2)).toBe(false);
    expect(hasPlayedUnlock(unlockPlayedCount(2, 1), 2)).toBe(true);
    expect(hasPlayedUnlock(unlockPlayedCount(0, 2), 2)).toBe(true);
  });

  it('does not offer a junior with a taken name', () => {
    const club = '1be439c0-9530-400a-a437-ceaccf61d482';
    for (let seq = 1; seq <= 40; seq += 1) {
      const plain = generateAcademyCandidates(club, seq, 1);
      const taken = plain.map((c) => c.name);
      const next = generateAcademyCandidates(club, seq, 1, taken);
      for (const c of next) expect(taken).not.toContain(c.name);
      expect(new Set(plain.map((c) => c.name)).size).toBe(plain.length);
      // Only the name may differ from the plain roll.
      expect(next.map((c) => [c.id, c.skill, c.age])).toEqual(
        plain.map((c) => [c.id, c.skill, c.age]),
      );
    }
  });

  it('suggests a short name that the form accepts', () => {
    expect(suggestShortName('Nowy Klub')).toBe('NOKL');
    expect(suggestShortName('Bóbrka United')).toMatch(/^[A-Z0-9]{3,4}$/);
    expect(suggestShortName('Klub Sportowy Orzeł')).toBe('KSO');
  });

  it('shows no invented fan change at the edge', () => {
    expect(describeFanMoodAfterResult(100, 'win')).toBe('Kibice: Gorący 100');
    expect(describeFanMoodAfterResult(80, 'win')).toBe('Kibice: Gorący 80 (+6)');
  });
});
