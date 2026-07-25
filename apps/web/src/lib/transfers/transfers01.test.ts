import { describe, expect, it } from 'vitest';

import { ECONOMY_THIN } from '@/lib/finance/types';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
import { seedTransferCatalogue } from '@/lib/transfers/seed-catalogue';
import { TRANSFERS_THIN } from '@/lib/transfers/types';

function activeRows(clubId: string) {
  return buildStarterPlayerInserts(clubId).map((r) =>
    mapPlayerRow({
      id: r.id,
      club_id: r.club_id,
      name: r.name,
      shirt_number: r.shirt_number,
      pos: r.pos,
      role: r.role,
      starter: r.starter,
      captain: r.captain,
      age: r.age,
      skill: r.skill,
      status: r.status,
      nationality: r.nationality,
      version: r.version,
      departed_at: null,
    } satisfies PlayerDbRow),
  );
}

describe('transfers Thin (LFE-TRANSFERS-01)', () => {
  it('catalogue is deterministic with m-{tag} market ids', () => {
    const clubId = '11111111-2222-3333-4444-555555555555';
    const a = seedTransferCatalogue(clubId);
    const b = seedTransferCatalogue(clubId);
    expect(a.map((x) => x.marketId)).toEqual(b.map((x) => x.marketId));
    expect(a.every((x) => x.marketId.startsWith('m-'))).toBe(true);
    expect(a.length).toBeGreaterThanOrEqual(5);
  });

  it('deriveTransferFee uses ECONOMY_THIN.TRANSFER_FEE (GDD §26)', () => {
    const { SKILL_MULT, AGE_BONUS, AGE_REF, FLOOR, ROUND } = ECONOMY_THIN.TRANSFER_FEE;
    const skill = 60;
    const age = 24;
    const raw = skill * SKILL_MULT + Math.max(0, AGE_REF - age) * AGE_BONUS;
    const expected = Math.max(FLOOR, Math.round(raw / ROUND) * ROUND);
    expect(deriveTransferFee(skill, age)).toBe(expected);
    expect(deriveTransferFee(skill, age)).toBe(deriveTransferFee(skill, age));
    expect(deriveTransferFee(1, 99)).toBe(FLOOR);
  });

  it('resolveTransferMarket closes deals when window shut', () => {
    const clubId = 'club-1';
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 100_000,
      transferWindowOpen: false,
      activePlayers: activeRows(clubId),
    });
    expect(market.windowOpen).toBe(false);
    expect(market.canBuy).toBe(false);
    expect(market.canSell).toBe(false);
    expect(market.listings.length).toBeGreaterThan(0);
    expect(market.sellCandidates).toHaveLength(0);
    expect(market.activeRosterCount).toBe(18);
    expect(market.minRoster).toBe(TRANSFERS_THIN.MIN_ROSTER);
    expect(market.maxRoster).toBe(TRANSFERS_THIN.MAX_ROSTER);
    expect(market.currency).toBe(ECONOMY_THIN.CURRENCY);
  });

  it('resolveTransferMarket allows buy/sell when window open and roster mid-range', () => {
    const clubId = 'club-2';
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 500_000,
      transferWindowOpen: true,
      activePlayers: activeRows(clubId),
    });
    expect(market.canBuy).toBe(true);
    expect(market.canSell).toBe(false); // exactly MIN_ROSTER 18
    expect(market.listings.every((l) => l.fee > 0 && l.feeLabel.length > 0)).toBe(true);
  });

  it('sell candidates appear when roster above min', () => {
    const clubId = 'club-3';
    const rows = [
      ...activeRows(clubId),
      mapPlayerRow({
        id: 't-extra-0',
        club_id: clubId,
        name: 'X. Extra',
        shirt_number: 19,
        pos: 'ŚP',
        role: 'CM',
        starter: false,
        captain: false,
        age: 22,
        skill: 60,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
      }),
    ];
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 100_000,
      transferWindowOpen: true,
      activePlayers: rows,
    });
    expect(market.activeRosterCount).toBe(19);
    expect(market.canSell).toBe(true);
    expect(market.sellCandidates.length).toBeGreaterThan(0);
  });

  it('UNLOCK_AFTER_PLAYED is 2', () => {
    expect(TRANSFERS_THIN.UNLOCK_AFTER_PLAYED).toBe(2);
  });
});
