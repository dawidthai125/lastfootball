import { describe, expect, it } from 'vitest';

import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveIncomingOffers } from '@/lib/transfers/resolve-incoming-offers';
import { resolveOfferAmount } from '@/lib/transfers/resolve-negotiation';
import { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
import {
  isTransferSellEligible,
  listTransferSellEligiblePlayers,
} from '@/lib/transfers/sell-eligibility';

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
      transfer_listed_at: null,
    } satisfies PlayerDbRow),
  );
}

describe('transfer listing Thin (LFE-TRANSFERS-04)', () => {
  const clubId = 'bbbbbbbb-cccc-dddd-eeee-ffffffffffff';

  it('shared eligibility helper gates list/sell/incoming', () => {
    const rows = activeRows(clubId);
    const anyId = rows[0]!.id;
    expect(
      isTransferSellEligible({
        transferWindowOpen: true,
        activePlayers: rows,
        playerId: anyId,
      }),
    ).toBe(false); // roster at MIN

    const withExtra = [
      ...rows,
      mapPlayerRow({
        id: 't-list-0',
        club_id: clubId,
        name: 'L. Listed',
        shirt_number: 19,
        pos: 'ŚP',
        role: 'CM',
        starter: false,
        captain: false,
        age: 24,
        skill: 61,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
        transfer_listed_at: '2026-07-01T12:00:00.000Z',
      }),
    ];

    expect(
      isTransferSellEligible({
        transferWindowOpen: true,
        activePlayers: withExtra,
        playerId: 't-list-0',
      }),
    ).toBe(true);
    expect(
      listTransferSellEligiblePlayers({
        transferWindowOpen: true,
        activePlayers: withExtra,
      }).map((p) => p.id),
    ).toContain('t-list-0');
  });

  it('resolveTransferMarket exposes listed flag and listedPlayers; ask = fee', () => {
    const rows = [
      ...activeRows(clubId),
      mapPlayerRow({
        id: 't-list-1',
        club_id: clubId,
        name: 'L. One',
        shirt_number: 19,
        pos: 'PN',
        role: 'RW',
        starter: false,
        captain: false,
        age: 22,
        skill: 60,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
        transfer_listed_at: '2026-07-01T12:00:00.000Z',
      }),
    ];

    const market = resolveTransferMarket({
      clubId,
      cashBalance: 200_000,
      transferWindowOpen: true,
      activePlayers: rows,
    });

    const listed = market.sellCandidates.find((c) => c.playerId === 't-list-1');
    expect(listed?.listed).toBe(true);
    expect(listed?.fee).toBe(deriveTransferFee(60, 22));
    expect(market.listedPlayers.some((p) => p.playerId === 't-list-1')).toBe(true);

    const closed = resolveTransferMarket({
      clubId,
      cashBalance: 200_000,
      transferWindowOpen: false,
      activePlayers: rows,
    });
    expect(closed.sellCandidates).toHaveLength(0);
    expect(closed.listedPlayers).toHaveLength(1);
    expect(closed.incomingOffers).toHaveLength(0);
  });

  it('incoming offers only for listed players', () => {
    const listed = mapPlayerRow({
      id: 't-list-2',
      club_id: clubId,
      name: 'L. Two',
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
      transfer_listed_at: '2026-07-01T12:00:00.000Z',
    });
    const unlisted = mapPlayerRow({
      id: 't-list-3',
      club_id: clubId,
      name: 'L. Three',
      shirt_number: 20,
      pos: 'ŚP',
      role: 'CM',
      starter: false,
      captain: false,
      age: 23,
      skill: 59,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      departed_at: null,
      transfer_listed_at: null,
    });
    const rows = [...activeRows(clubId), listed, unlisted];
    const offers = resolveIncomingOffers({
      clubId,
      transferWindowOpen: true,
      activePlayers: rows,
    });
    expect(offers.every((o) => o.playerId === 't-list-2')).toBe(true);
    expect(offers.every((o) => o.ask === deriveTransferFee(60, 22))).toBe(true);
    expect(offers.every((o) => o.amount === resolveOfferAmount(o.ask, o.aiPreset))).toBe(true);
  });
});
