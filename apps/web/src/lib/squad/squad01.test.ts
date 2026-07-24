import { describe, expect, it } from 'vitest';

import { resolveClubSquad, resolveStartingXi, seedStarterSquad } from '@/lib/squad';

describe('squad SSOT', () => {
  it('XI matches seedStarterSquad ids', () => {
    const clubId = '11111111-2222-3333-4444-555555555555';
    const xi = resolveStartingXi(clubId);
    const seed = seedStarterSquad(clubId);
    expect(xi.map((p) => p.id)).toEqual(seed.map((p) => p.id));
    expect(xi).toHaveLength(11);
  });

  it('roster includes XI + bench and all ready', () => {
    const squad = resolveClubSquad({ id: 'club-1' });
    expect(squad.players.length).toBeGreaterThanOrEqual(18);
    expect(squad.players.filter((p) => p.starter)).toHaveLength(11);
    expect(squad.players.every((p) => p.status === 'ready')).toBe(true);
  });

  it('is deterministic', () => {
    expect(resolveClubSquad({ id: 'x' }).players.map((p) => p.id)).toEqual(
      resolveClubSquad({ id: 'x' }).players.map((p) => p.id),
    );
  });
});
