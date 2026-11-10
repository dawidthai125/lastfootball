import { describe, expect, it } from 'vitest';

import type { FixtureDto } from '@/lib/fixtures/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import { CUP_UNLOCK_AFTER_MATCHDAY, resolveNationalCup } from '@/lib/cup';
import type { CupTieDto } from '@/lib/cup';

const club = {
  id: 'club-aaa',
  name: 'Alpha FC',
  shortName: 'AFC',
  leagueTier: 'iv' as const,
  seasonNumber: 1,
};

function played(n: number): FixtureDto[] {
  return Array.from({ length: n }, (_, i) => {
    const opp = OPPONENT_CATALOG[i % OPPONENT_CATALOG.length]!;
    return {
      id: `fx-${i + 1}`,
      clubId: club.id,
      matchday: i + 1,
      competition: 'league',
      opponentClubId: opp.id,
      opponent: opp,
      isHome: true,
      status: 'played',
      homeScore: 1,
      awayScore: 0,
      playedAt: '2026-07-25T00:00:00.000Z',
      createdAt: '2026-07-25T00:00:00.000Z',
    };
  });
}

function ties(cup: ReturnType<typeof resolveNationalCup>): CupTieDto[] {
  return cup.rounds.flatMap((r) => [...r.ties]);
}

describe('resolveNationalCup', () => {
  it('stays closed until 8 league matches and lists 16 clubs without a draw', () => {
    const cup = resolveNationalCup(club, played(7));
    expect(cup.editionOpen).toBe(false);
    expect(cup.rounds).toHaveLength(0);
    expect(cup.qualified).toHaveLength(16);
    expect(cup.qualified.filter((c) => c.origin === 'guest')).toHaveLength(4);
    expect(cup.qualified.filter((c) => c.isPlayer)).toHaveLength(1);
    expect(cup.guestOriginLabel).toBe('III liga');
    const names = cup.qualified.map((c) => c.name);
    expect([...names].sort((a, b) => a.localeCompare(b, 'pl'))).toEqual(names);
  });

  it('opens a 15-tie bracket after matchday 8 and never invents the player result', () => {
    const cup = resolveNationalCup(club, played(CUP_UNLOCK_AFTER_MATCHDAY));
    expect(cup.editionOpen).toBe(true);
    expect(cup.rounds.map((r) => r.ties.length)).toEqual([8, 4, 2, 1]);
    expect(cup.rounds.map((r) => r.label)).toEqual([
      '1/8 finału',
      '1/4 finału',
      'Półfinał',
      'Finał',
    ]);

    const all = ties(cup);
    expect(all).toHaveLength(15);
    const playedTies = all.filter((t) => t.status === 'played');
    const waiting = all.filter((t) => t.status === 'awaiting_player');
    const blocked = all.filter((t) => t.status === 'blocked');
    expect(playedTies).toHaveLength(11);
    expect(waiting).toHaveLength(1);
    expect(blocked).toHaveLength(3);

    expect(waiting[0]?.homeScore).toBeNull();
    expect(waiting[0]?.winnerId).toBeNull();
    expect(playedTies.every((t) => t.homeScore !== t.awayScore && t.winnerId)).toBe(true);
    expect(playedTies.some((t) => t.winnerId === club.id)).toBe(false);

    const r16 = cup.rounds[0]!.ties;
    for (const tie of r16) {
      if (tie.home.kind !== 'club' || tie.away.kind !== 'club') continue;
      expect(tie.home.club.origin === 'guest' && tie.away.club.origin === 'guest').toBe(false);
    }

    const playerTie = waiting[0]!;
    if (playerTie.home.kind === 'club' && playerTie.away.kind === 'club') {
      const opp = playerTie.home.club.isPlayer ? playerTie.away.club : playerTie.home.club;
      if (opp.origin === 'guest') expect(playerTie.hostClubId).toBe(club.id);
    }

    const finalTie = cup.rounds[3]!.ties[0]!;
    expect(finalTie.status).toBe('blocked');
    expect(finalTie.venue).toBe('neutral');
    expect(finalTie.homeScore).toBeNull();
    expect(cup.rounds[2]!.ties.filter((t) => t.status === 'played')).toHaveLength(1);
  });

  it('is deterministic and changes with the season', () => {
    const a = resolveNationalCup(club, played(8));
    const b = resolveNationalCup(club, played(8));
    expect(a).toEqual(b);

    const next = resolveNationalCup({ ...club, seasonNumber: 2 }, played(8));
    expect(next.rounds[0]).not.toEqual(a.rounds[0]);
  });

  it('uses wildcards when the club is in Liga I', () => {
    const cup = resolveNationalCup({ ...club, leagueTier: 'i' }, played(8));
    expect(cup.guestOriginLabel).toBe('dzikie karty');
    expect(
      cup.qualified.filter((c) => c.origin === 'guest').every((c) => c.id.startsWith('cup-wild-')),
    ).toBe(true);
  });

  it('ignores a played row that has no score', () => {
    const rows = played(8);
    rows[7] = { ...rows[7]!, homeScore: null, awayScore: null };
    expect(resolveNationalCup(club, rows).editionOpen).toBe(false);
  });
});
