import { describe, expect, it } from 'vitest';

import { hideFutureRounds } from '@/lib/cup/hide-future-rounds';
import { resolveNationalCup } from '@/lib/cup/resolve-national-cup';
import { planClubFixtures } from '@/lib/fixtures/plan-fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { refreshSquadForSeason } from '@/lib/season/refresh-squad';
import { firstBaseDue } from '@/lib/sponsors/pay-due';
import { pickBestXi, validateStartingXi } from '@/lib/squad/validate-starting-xi';
import type { SquadPlayerDto } from '@/lib/squad/types';

const TODAY = '2026-11-24';
const ROLES = 'GK GK RB RB CB CB CB LB LB RW RW LW CM CM CM CM ST ST'.split(' ');
const POS: Record<string, string> = { GK: 'BR', RB: 'PO', CB: 'OB', LB: 'OB', CM: 'ŚP', ST: 'N' };

function squad(patch: (i: number) => Partial<SquadPlayerDto> = () => ({})): SquadPlayerDto[] {
  return ROLES.map(
    (role, i) =>
      ({
        id: `p${i}`,
        name: `P${i}`,
        position: POS[role] ?? 'PN',
        pitchRole: role,
        skill: 60 + (i % 5),
        energy: 90,
        status: 'READY',
        starter: i < 11,
        ...patch(i),
      }) as SquadPlayerDto,
  );
}

const xi = (players: SquadPlayerDto[]) => players.filter((p) => p.starter);

describe('pickBestXi (D136)', () => {
  it('picks a valid XI with one goalkeeper and every line filled', () => {
    const best = xi(pickBestXi(squad(), TODAY));
    expect(validateStartingXi(best, TODAY).ok).toBe(true);
    expect(best.filter((p) => p.position === 'BR')).toHaveLength(1);
    expect(best.filter((p) => ['PO', 'OB'].includes(p.position))).toHaveLength(4);
    expect(best.filter((p) => p.position === 'N')).toHaveLength(2);
  });

  it('brings back the better goalkeeper and leaves out the exhausted and the unavailable', () => {
    const players = squad((i) =>
      i === 1
        ? { skill: 70 }
        : i === 4
          ? { energy: 10, skill: 66 }
          : i === 16
            ? { status: 'INJURED', skill: 90 }
            : {},
    );
    const ids = xi(pickBestXi(players, TODAY)).map((p) => p.id);
    expect(ids).toContain('p1');
    expect(ids).not.toContain('p0');
    expect(ids).not.toContain('p4');
    expect(ids).not.toContain('p16');
    expect(ids).toHaveLength(11);
  });

  it('changes nothing when eleven players are not available', () => {
    const players = squad((i) => ({ status: i > 8 ? 'INJURED' : 'READY' }));
    expect(pickBestXi(players, TODAY)).toEqual(players);
  });
});

describe('cup bracket view (D136)', () => {
  const club = {
    id: '1be439c0-9530-400a-a437-ceaccf61d482',
    name: 'Klub Probny',
    shortName: 'PROB',
    leagueTier: 'iv' as const,
    seasonNumber: 1,
  };
  const played = (n: number) =>
    planClubFixtures(club.id, 'iv').map((p) => ({
      ...p,
      id: `f${p.matchday}`,
      competition: 'league',
      status: p.matchday <= n ? 'played' : 'scheduled',
      homeScore: p.matchday <= n ? 1 : null,
      awayScore: p.matchday <= n ? 0 : null,
    })) as unknown as FixtureDto[];

  it('hides later rounds until they open and keeps the bracket itself', () => {
    const cup = resolveNationalCup(club, played(8));
    const view = hideFutureRounds(cup);
    expect(view[0]).toEqual(cup.rounds[0]);
    expect(view[1]!.ties.every((t) => t.homeScore === null && t.status !== 'played')).toBe(true);
    // Pairs of the quarter-final follow from the open round, later ones do not.
    expect(view[1]!.ties.some((t) => t.home.kind === 'club')).toBe(true);
    for (const r of [2, 3]) {
      expect(view[r]!.ties.every((t) => t.home.kind !== 'club' && t.away.kind !== 'club')).toBe(
        true,
      );
    }
    expect(cup.rounds[1]!.ties.some((t) => t.status === 'played')).toBe(true);
    const closed = resolveNationalCup(club, played(22));
    expect(hideFutureRounds(closed)).toEqual(closed.rounds);
  });
});

describe('sponsor base of the first contract (D136)', () => {
  it('is due once, in its own season', () => {
    expect(firstBaseDue({ season_number: 1, base_paid_season_number: null }, 1)).toBe(true);
    expect(firstBaseDue({ season_number: 1, base_paid_season_number: 1 }, 1)).toBe(false);
    expect(firstBaseDue({ season_number: 2, base_paid_season_number: null }, 1)).toBe(false);
  });
});

describe('refreshSquadForSeason (D136)', () => {
  it('reports a failed write and stops', async () => {
    let calls = 0;
    const chain: Record<string, unknown> = {
      then: (done: (v: unknown) => void) => {
        calls += 1;
        done({ error: calls === 2 ? { code: 'x' } : null });
      },
    };
    for (const m of ['update', 'eq', 'is', 'gt', 'in']) chain[m] = () => chain;
    const db = { from: () => chain } as never;
    expect(await refreshSquadForSeason(db, 'c')).toBe(false);
    expect(calls).toBe(2);
    expect(await refreshSquadForSeason(db, 'c')).toBe(true);
  });
});
