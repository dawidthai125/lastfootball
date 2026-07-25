import { describe, expect, it } from 'vitest';

import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import {
  buildIncomingOfferId,
  INCOMING_THIN,
  resolveIncomingOffers,
} from '@/lib/transfers/resolve-incoming-offers';

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

describe('incoming offers Thin (LFE-TRANSFERS-03)', () => {
  const clubId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  it('returns empty when window closed or roster at min', () => {
    const rows = activeRows(clubId);
    expect(rows).toHaveLength(18);
    expect(
      resolveIncomingOffers({
        clubId,
        transferWindowOpen: false,
        activePlayers: rows,
      }),
    ).toEqual([]);
    expect(
      resolveIncomingOffers({
        clubId,
        transferWindowOpen: true,
        activePlayers: rows,
      }),
    ).toEqual([]);
  });

  it('offer amount is 100% deriveTransferFee; offerId stable', () => {
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
        transfer_listed_at: '2026-01-01T00:00:00.000Z',
      }),
    ];

    const a = resolveIncomingOffers({
      clubId,
      transferWindowOpen: true,
      activePlayers: rows,
    });
    const b = resolveIncomingOffers({
      clubId,
      transferWindowOpen: true,
      activePlayers: rows,
    });

    expect(a).toEqual(b);
    expect(a.length).toBeGreaterThan(0);
    expect(a.length).toBeLessThanOrEqual(INCOMING_THIN.MAX_OFFERS);

    for (const offer of a) {
      const player = rows.find((p) => p.id === offer.playerId)!;
      expect(offer.amount).toBe(deriveTransferFee(player.skill, player.age));
      expect(offer.offerId).toBe(buildIncomingOfferId(clubId, offer.playerId));
      expect(offer.offerId.startsWith('in-')).toBe(true);
    }
  });

  it('identical input → identical output (pure)', () => {
    const rows = [
      ...activeRows(clubId),
      mapPlayerRow({
        id: 't-extra-1',
        club_id: clubId,
        name: 'Y. Bench',
        shirt_number: 20,
        pos: 'ŚP',
        role: 'ST',
        starter: false,
        captain: false,
        age: 25,
        skill: 58,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
      }),
    ];
    const input = {
      clubId,
      transferWindowOpen: true as const,
      activePlayers: rows,
    };
    expect(resolveIncomingOffers(input)).toEqual(resolveIncomingOffers({ ...input }));
  });

  it('returns empty when eligible but not listed (TRANSFERS-04 gate)', () => {
    const rows = [
      ...activeRows(clubId),
      mapPlayerRow({
        id: 't-extra-unlisted',
        club_id: clubId,
        name: 'U. Free',
        shirt_number: 22,
        pos: 'ŚP',
        role: 'CM',
        starter: false,
        captain: false,
        age: 23,
        skill: 57,
        status: 'READY',
        nationality: 'POL',
        version: 1,
        departed_at: null,
        transfer_listed_at: null,
      }),
    ];
    expect(
      resolveIncomingOffers({
        clubId,
        transferWindowOpen: true,
        activePlayers: rows,
      }),
    ).toEqual([]);
  });
});
