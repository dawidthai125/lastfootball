import { describe, expect, it } from 'vitest';

import type { ClubDto } from '@/lib/club/types';
import { buildFirstLiveBundle, buildFirstPreMatchBundle } from '@/lib/first-match/bundles';
import { seedClubRoster } from '@/lib/squad/seed-roster';

const club = { id: 'club-aaa', name: 'Alpha FC', shortName: 'AFC', leagueTier: 'iv' } as ClubDto;

describe('first match screens', () => {
  const xi = seedClubRoster(club.id)
    .filter((p) => p.starter)
    .map((p) => ({ ...p, skill: 50 + p.number, energy: 60 }));
  const pre = buildFirstPreMatchBundle(club, xi);

  it('shows the stored skill and energy, without links to closed player pages', () => {
    expect(pre.ourLineup).toHaveLength(11);
    for (const row of pre.ourLineup) {
      expect(row.rating).toBe(50 + row.number);
      expect(row.condition).toBe(3);
      expect(row.id).toBeUndefined();
    }
    expect(pre.teamCondition.value).toBe(60);
    expect(pre.tactics.find((t) => t.id === 'width')?.value).toBe(50);
  });

  it('keeps one crowd on both screens', () => {
    expect(buildFirstLiveBundle(club).viewers).toBe(pre.attendance);
  });
});
