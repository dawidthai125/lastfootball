import { describe, expect, it } from 'vitest';

import { resolveClubAcademy } from '@/lib/academy/resolve-club-academy';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { resolveClubScouting } from '@/lib/scouting/resolve-club-scouting';
import { applyTrainingSessionEffects } from '@/lib/training/apply-effects';
import { applyCoachYield } from '@/lib/training/coach';
import type { LiveListingDto } from '@/lib/transfers/types';
import { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';

function row(partial: Partial<PlayerDbRow> & Pick<PlayerDbRow, 'id'>): PlayerDbRow {
  return {
    club_id: 'club-a',
    name: 'Młody',
    shirt_number: 90,
    pos: 'N',
    role: 'ST',
    starter: false,
    captain: false,
    age: 17,
    skill: 40,
    potential: 90,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    transfer_listed_at: null,
    academy_track: true,
    promoted_at: null,
    ...partial,
  };
}

describe('hidden ceiling on the academy and the market', () => {
  it('hides the band until the prospect id is revealed', () => {
    const dto = resolveClubAcademy(
      { id: 'club-a' },
      [mapPlayerRow(row({ id: 'a-1' }))],
      'SEASON',
      new Set(),
    );
    expect(dto.prospects[0]?.potentialLabel).toBe('Sufit ukryty');
    expect(JSON.stringify(dto)).not.toContain('90');
  });

  it('shows only the band word after a report', () => {
    const dto = resolveClubAcademy(
      { id: 'club-a' },
      [mapPlayerRow(row({ id: 'a-1' }))],
      'SEASON',
      new Set(['a-1']),
    );
    expect(dto.prospects[0]?.potentialLabel).toBe('Bardzo wysoki');
    expect(JSON.stringify(dto)).not.toMatch(/"potential":/);
  });

  it('hides a live listing band and keeps an owned senior', () => {
    const senior = mapPlayerRow(
      row({
        id: 's-1',
        academy_track: false,
        shirt_number: 9,
        age: 24,
        skill: 70,
        potential: 80,
        name: 'Senior',
      }),
    );
    const listing: LiveListingDto = {
      playerId: 'live-1',
      playerName: 'Obcy',
      pos: 'N',
      role: 'ST',
      age: 18,
      skill: 55,
      ask: 40_000,
      askLabel: '40 000',
      sellerClubId: 'club-b',
      sellerClubLabel: 'Rywale',
      sellerWindowOpen: true,
    };
    const market = resolveTransferMarket({
      clubId: 'club-a',
      cashBalance: 100_000,
      transferWindowOpen: true,
      activePlayers: [senior],
      liveListings: [listing],
    });
    const hidden = resolveClubScouting({ id: 'club-a' }, [senior], market, [], 'SEASON', new Set());
    const marketRow = hidden.candidates.find((c) => c.playerId === 'live-1');
    const own = hidden.candidates.find((c) => c.playerId === 's-1');
    expect(marketRow?.potentialLabel).toBe('Sufit ukryty');
    expect(own?.potentialLabel).not.toBe('Sufit ukryty');
  });
});

describe('coach yield does not raise overall skill', () => {
  it('adds one point in the coach group only after a skill session', () => {
    const before = [
      {
        id: 'p1',
        pos: 'PN',
        status: 'READY' as const,
        skill: 60,
        potential: 90,
        age: 22,
        groups: { attack: 60, passing: 60, defense: 60, physical: 60, goalkeeping: 40 },
      },
    ];
    const trained = applyTrainingSessionEffects(before, 'tactics', 'normal', 'impulse', 3);
    const raised = trained.map((player, index) => {
      if (player.skill <= before[index]!.skill) return player;
      return applyCoachYield(player, 'attack', 'attack');
    });
    const next = raised[0]!;
    expect(next.skill).toBe(61);
    expect(next.groups?.attack).toBe(62);
    expect(next.groups?.passing).toBe(60);
  });
});
