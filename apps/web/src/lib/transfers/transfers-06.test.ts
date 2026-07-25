import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from '@/lib/transfers/derive-fee';
import { resolveLiveListings } from '@/lib/transfers/resolve-live-listings';
import { resolveTransferMarket } from '@/lib/transfers/resolve-transfer-market';
import { isAllowedAgreedAmount } from '@/lib/transfers/resolve-negotiation';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';

describe('live transfer market Thin (LFE-TRANSFERS-06)', () => {
  const clubId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

  it('resolveLiveListings ask = deriveTransferFee; pure', () => {
    const rows = [
      {
        player_id: 'p-live-1',
        player_name: 'L. One',
        pos: 'ŚP',
        role: 'CM',
        age: 24,
        skill: 60,
        seller_club_id: 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
        seller_club_name: 'Hutnik Test',
        seller_short_name: 'HUT',
        seller_window_open: true,
      },
    ];
    const a = resolveLiveListings(rows);
    const b = resolveLiveListings(rows);
    expect(a).toEqual(b);
    expect(a).toHaveLength(1);
    const ask = deriveTransferFee(60, 24);
    expect(a[0]!.ask).toBe(ask);
    expect(a[0]!.playerId).toBe('p-live-1');
    expect(isAllowedAgreedAmount(ask, ask)).toBe(true);
  });

  it('resolveTransferMarket includes liveListings; seed listings remain fallback', () => {
    const rows = buildStarterPlayerInserts(clubId).map((r) =>
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
    const live = resolveLiveListings([
      {
        player_id: 'other-1',
        player_name: 'O. Ther',
        pos: 'N',
        role: 'ST',
        age: 22,
        skill: 58,
        seller_club_id: 'cccccccc-bbbb-cccc-dddd-eeeeeeeeeeee',
        seller_club_name: 'Stal',
        seller_short_name: 'STL',
        seller_window_open: true,
      },
    ]);
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 500_000,
      transferWindowOpen: true,
      activePlayers: rows,
      liveListings: live,
    });
    expect(market.liveListings).toHaveLength(1);
    expect(market.liveListings[0]!.ask).toBe(deriveTransferFee(58, 22));
    expect(market.listings.length).toBeGreaterThan(0);
  });

  it('single ask snapshot equals Instant 100% settlement amount', () => {
    const askSnapshot = deriveTransferFee(61, 23);
    expect(askSnapshot).toBe(deriveTransferFee(61, 23));
    expect(isAllowedAgreedAmount(askSnapshot, askSnapshot)).toBe(true);
  });
});
