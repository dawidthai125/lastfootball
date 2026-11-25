import { describe, expect, it } from 'vitest';

import { humanDayBlockReason } from '@/lib/fixtures/matchday-gate';
import { lineupOf, parseSquad } from '@/lib/league/human-league-store';
import type { Json } from '@/types/database';

const squad = (prefix: string, count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}${i}`,
    name: `Gracz ${i}`,
    skill: 60,
    morale: 80,
    setPiece: i === 3,
  })) as unknown as Json;

const broadcast = {
  home_id: 'home',
  home_xi: squad('h', 11),
  away_xi: squad('a', 11),
  home_setup: { homeBench: squad('hb', 5), awayBench: squad('ab', 4) } as unknown as Json,
};

describe('frozen human line-up', () => {
  it('gives each club its own eleven and bench', () => {
    expect(lineupOf(broadcast, 'home')?.xi).toContain('h0');
    expect(lineupOf(broadcast, 'home')?.bench).toHaveLength(5);
    expect(lineupOf(broadcast, 'away')?.xi).toContain('a10');
    expect(lineupOf(broadcast, 'away')?.bench).toEqual(['ab0', 'ab1', 'ab2', 'ab3']);
  });

  it('is unknown without a kept line-up, and has no bench before benches were kept', () => {
    expect(lineupOf({ ...broadcast, home_xi: null }, 'home')).toBeNull();
    expect(lineupOf({ ...broadcast, home_setup: null }, 'home')?.bench).toEqual([]);
  });

  it('keeps morale and the set piece taker', () => {
    const rows = parseSquad(squad('h', 11), true)!;
    expect(rows[0]?.morale).toBe(80);
    expect(rows.filter((p) => p.setPiece).map((p) => p.id)).toEqual(['h3']);
  });
});

describe('one human round a day', () => {
  const now = new Date('2026-11-24T23:30:00.000Z');

  it('counts the Warsaw day', () => {
    expect(humanDayBlockReason('2026-11-24T22:30:00.000Z', now)).toBeNull();
    expect(humanDayBlockReason('2026-11-24T23:05:00.000Z', now)).toContain('już rozegrana');
    expect(humanDayBlockReason(null, now)).toBeNull();
  });
});
