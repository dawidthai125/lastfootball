import { describe, expect, it } from 'vitest';

import {
  canAddToShortlist,
  isEligibleShortlistTarget,
  resolveClubScouting,
  SCOUTING_THIN,
} from '@/lib/scouting';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { filterSeniorPlayers } from '@/lib/squad';
import { resolveTransferMarket } from '@/lib/transfers';
import type { LiveListingDto } from '@/lib/transfers/types';

function seniorRow(
  partial: Partial<PlayerDbRow> & Pick<PlayerDbRow, 'id' | 'club_id'>,
): PlayerDbRow {
  return {
    name: 'Senior',
    shirt_number: 8,
    pos: 'ŚP',
    role: 'CM',
    starter: true,
    captain: false,
    age: 24,
    skill: 60,
    potential: 75,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    transfer_listed_at: null,
    academy_track: false,
    promoted_at: null,
    ...partial,
  };
}

function prospectRow(
  partial: Partial<PlayerDbRow> & Pick<PlayerDbRow, 'id' | 'club_id' | 'shirt_number'>,
): PlayerDbRow {
  return seniorRow({
    name: 'Prospect',
    academy_track: true,
    starter: false,
    age: 17,
    skill: 40,
    potential: 80,
    ...partial,
  });
}

const CLUB = { id: 'club-a' } as const;

function liveListing(playerId: string): LiveListingDto {
  return {
    playerId,
    playerName: 'Listed',
    pos: 'N',
    role: 'ST',
    age: 22,
    skill: 58,
    ask: 1000,
    askLabel: '1 000',
    sellerClubId: 'club-b',
    sellerClubLabel: 'Rival',
    sellerWindowOpen: true,
  };
}

describe('LFE-SCOUTING-01 contracts', () => {
  it('resolveClubScouting organizes facts without scout_score / AI rank fields', () => {
    const rows = [mapPlayerRow(seniorRow({ id: 'p1', club_id: CLUB.id, shirt_number: 1 }))];
    const market = resolveTransferMarket({
      clubId: CLUB.id,
      cashBalance: 100_000,
      transferWindowOpen: true,
      activePlayers: rows,
      liveListings: [liveListing('live-1')],
    });
    const dto = resolveClubScouting(CLUB, rows, market, ['live-1'], 'SEASON');

    expect(dto.unlocked).toBe(true);
    expect(dto.shortlist).toHaveLength(1);
    expect(dto.shortlist[0]!.playerId).toBe('live-1');
    expect(dto.candidates.some((c) => c.source === 'market_listed')).toBe(true);
    expect(dto.candidates.some((c) => c.source === 'own_senior')).toBe(true);

    const json = JSON.stringify(dto);
    expect(json).not.toMatch(/scout_score|aiPick|ai_rank|hiddenPotential|ranking/i);
  });

  it('shortlist ids do not change resolveTransferMarket output (no market side-effect)', () => {
    const rows = [
      mapPlayerRow(
        seniorRow({
          id: 'p1',
          club_id: CLUB.id,
          shirt_number: 1,
          transfer_listed_at: '2026-07-01T00:00:00Z',
        }),
      ),
    ];
    const live = [liveListing('live-1')];
    const marketA = resolveTransferMarket({
      clubId: CLUB.id,
      cashBalance: 50_000,
      transferWindowOpen: true,
      activePlayers: rows,
      liveListings: live,
    });
    const marketB = resolveTransferMarket({
      clubId: CLUB.id,
      cashBalance: 50_000,
      transferWindowOpen: true,
      activePlayers: rows,
      liveListings: live,
    });
    expect(marketA).toEqual(marketB);

    const withShort = resolveClubScouting(CLUB, rows, marketA, ['live-1', 'p1'], 'SEASON');
    const withoutShort = resolveClubScouting(CLUB, rows, marketA, [], 'SEASON');
    expect(withShort.shortlistCount).toBe(2);
    expect(withoutShort.shortlistCount).toBe(0);
    /** Same market snapshot reused — shortlist is orthogonal. */
    expect(withShort.windowOpen).toBe(marketA.windowOpen);
    expect(withoutShort.windowOpen).toBe(marketA.windowOpen);
    expect(marketA.listedPlayers).toEqual(marketB.listedPlayers);
    expect(marketA.liveListings).toEqual(marketB.liveListings);
  });

  it('academy prospects are not eligible for shortlist (Academy ≠ Scouting)', () => {
    const prospect = mapPlayerRow(prospectRow({ id: 'a1', club_id: CLUB.id, shirt_number: 40 }));
    const senior = mapPlayerRow(seniorRow({ id: 's1', club_id: CLUB.id, shirt_number: 8 }));
    expect(isEligibleShortlistTarget('a1', [prospect, senior], [])).toBe(false);
    expect(isEligibleShortlistTarget('s1', [prospect, senior], [])).toBe(true);
    expect(filterSeniorPlayers([prospect, senior])).toHaveLength(1);
  });

  it('shortlist preference never mutates player row fields in resolver output', () => {
    const row = mapPlayerRow(
      seniorRow({ id: 'p1', club_id: CLUB.id, shirt_number: 9, skill: 55, potential: 70 }),
    );
    const market = resolveTransferMarket({
      clubId: CLUB.id,
      cashBalance: 10_000,
      transferWindowOpen: false,
      activePlayers: [row],
    });
    const before = { ...row };
    resolveClubScouting(CLUB, [row], market, ['p1'], 'SEASON');
    expect(row).toEqual(before);
    expect(row.skill).toBe(55);
    expect(row.potential).toBe(70);
    expect(row.transferListedAt).toBeNull();
    expect(row.academyTrack).toBe(false);
  });

  it('enforces max shortlist and blocks duplicate add', () => {
    const rows = Array.from({ length: 3 }, (_, i) =>
      mapPlayerRow(seniorRow({ id: `p${i}`, club_id: CLUB.id, shirt_number: i + 1 })),
    );
    const ids = rows.map((r) => r.id);
    expect(canAddToShortlist(ids, 'p0', rows, []).ok).toBe(false);
    const full = Array.from({ length: SCOUTING_THIN.MAX_SHORTLIST }, (_, i) => `x${i}`);
    expect(canAddToShortlist(full, 'p0', rows, []).ok).toBe(false);
  });

  it('soft-locks before SEASON', () => {
    const rows = [mapPlayerRow(seniorRow({ id: 'p1', club_id: CLUB.id, shirt_number: 1 }))];
    const market = resolveTransferMarket({
      clubId: CLUB.id,
      cashBalance: 0,
      transferWindowOpen: false,
      activePlayers: rows,
    });
    const dto = resolveClubScouting(CLUB, rows, market, [], 'EARLY_CLUB');
    expect(dto.unlocked).toBe(false);
  });
});
