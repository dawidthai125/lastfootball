import { describe, expect, it } from 'vitest';

import { standInNote } from '@/lib/league/human-league-store';
import { emergencyJunior, emergencyNeed, missingRole } from '@/lib/squad/emergency-junior';
import { fillLineup, isStandIn, lineupProblem, repairLineup } from '@/lib/squad/lineup-problem';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { resolveClubSquad, resolveStartingXi } from '@/lib/squad/resolve-club-squad';
import { servedAbsence } from '@/lib/squad/rest';
import { seenState } from '@/lib/squad/seen-state';
import { energyAfterTraining } from '@/lib/squad/truth';
import type { PlayerRowDto } from '@/lib/squad/types';
import { pickBestXi, replaceUnavailableStarters } from '@/lib/squad/validate-starting-xi';
import { isTransferSellEligible } from '@/lib/transfers/sell-eligibility';
import { loanBlock } from '@/lib/squad/loan';
import { saleBlock } from '@/lib/transfers/fair-sale';

const TODAY = '2026-12-08';
const CLUB = '11111111-2222-3333-4444-555555555555';
const SHAPE = ['BR', 'PO', 'ŚO', 'ŚO', 'LO', 'PN', 'ŚP', 'ŚP', 'PN', 'N', 'N'];
const ROLES = ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'];

function row(i: number, extra: Partial<PlayerDbRow> = {}): PlayerDbRow {
  return {
    id: `p${i}`,
    club_id: CLUB,
    name: `Gracz ${i}`,
    shirt_number: i + 1,
    pos: SHAPE[i % 11]!,
    role: ROLES[i % 11]!,
    starter: i < 11,
    captain: i === 1,
    age: 25,
    skill: 60,
    potential: 70,
    status: 'READY',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    energy: 80,
    energy_on: TODAY,
    injury_matches: 0,
    suspension_matches: 0,
    absence_on: TODAY,
    ...extra,
  };
}

const squad = (rows: PlayerDbRow[]): PlayerRowDto[] =>
  rows.map((r) => mapPlayerRow(r, TODAY, TODAY));
const players = (rows: PlayerRowDto[]) => resolveClubSquad({ id: CLUB }, rows).players;

describe('days without a match (D160)', () => {
  const hurt = (injuryMatches: number, suspensionMatches = 0) => ({
    status: 'INJURED' as const,
    injuryMatches,
    suspensionMatches,
  });
  const banned = (suspensionMatches: number) => ({
    status: 'SUSPENDED' as const,
    injuryMatches: 0,
    suspensionMatches,
  });

  it('counts the full days after the last match, not that day and not today', () => {
    expect(servedAbsence(hurt(2), TODAY, TODAY)).toEqual(hurt(2));
    expect(servedAbsence(hurt(2), '2026-12-07', TODAY)).toEqual(hurt(2));
    expect(servedAbsence(hurt(2), '2026-12-06', TODAY)).toEqual(hurt(1));
    expect(servedAbsence(hurt(2), '2026-12-05', TODAY).status).toBe('READY');
    expect(servedAbsence(banned(2), '2026-12-06', TODAY)).toEqual(banned(1));
    expect(servedAbsence(banned(1), '2026-12-06', TODAY).status).toBe('READY');
  });

  it('serves the ban after the injury, and heals an old row without a number', () => {
    expect(servedAbsence(hurt(1, 1), '2026-12-06', TODAY)).toEqual(banned(1));
    expect(servedAbsence(hurt(1, 1), '2026-12-05', TODAY).status).toBe('READY');
    expect(servedAbsence(hurt(0), '2026-12-06', TODAY).status).toBe('READY');
  });

  it('leaves everybody else, the future and a missing day alone', () => {
    const tired = { status: 'TIRED' as const, injuryMatches: 0, suspensionMatches: 0 };
    expect(servedAbsence(tired, '2026-11-01', TODAY)).toEqual(tired);
    expect(servedAbsence(hurt(1), '2026-12-20', TODAY)).toEqual(hurt(1));
    expect(servedAbsence(hurt(1), null, TODAY)).toEqual(hurt(1));
  });

  it('reads the served state but guards the write with the stored one', () => {
    const player = mapPlayerRow(
      row(1, { status: 'INJURED', injury_matches: 2, absence_on: '2026-12-06' }),
      TODAY,
      TODAY,
    );
    expect(player).toMatchObject({ status: 'INJURED', injuryMatches: 1 });
    expect(seenState(player)).toMatchObject({ status: 'INJURED', injury_matches: 2 });
  });

  it('counts Warsaw days, also when the UTC day is another one', () => {
    const hurtRow = row(1, { status: 'INJURED', injury_matches: 1, absence_on: '2026-11-25' });
    // Played on the 25th at 00:30 in Warsaw (23:30 UTC on the 24th), again on the 26th.
    expect(mapPlayerRow(hurtRow, '2026-11-26', '2026-11-26').status).toBe('INJURED');
    expect(mapPlayerRow(hurtRow, '2026-11-26', '2026-11-27').status).toBe('READY');
    // A repeated save of a match played on the 26th reads the squad as on the 26th.
    expect(mapPlayerRow(hurtRow, '2026-11-28', '2026-11-26').status).toBe('INJURED');
  });

  it('spares the injured the training load', () => {
    expect(
      energyAfterTraining({ energy: 40, focus: 'physical', intensity: 'high', status: 'INJURED' }),
    ).toEqual({ energy: 40, status: 'INJURED' });
  });
});

describe('emergency junior (D160)', () => {
  const out = { status: 'INJURED', injury_matches: 2 };

  it('is nobody while an eleven exists, two keepers included', () => {
    const rows = [...SHAPE.keys()].map((i) => row(i));
    expect(missingRole(players(squad(rows)), TODAY)).toBeNull();
    rows[5] = row(5, out);
    rows.push(row(11));
    expect(missingRole(players(squad(rows)), TODAY)).toBeNull();
  });

  it('is a keeper first, then the thinnest line', () => {
    const rows = [...SHAPE.keys()].map((i) => row(i));
    rows[0] = row(0, out);
    expect(missingRole(players(squad(rows)), TODAY)?.role).toBe('GK');
    rows[0] = row(0);
    rows[9] = row(9, out);
    expect(missingRole(players(squad(rows)), TODAY)?.role).toBe('ST');
    rows[9] = row(9);
    rows[2] = row(2, { on_loan: true });
    expect(missingRole(players(squad(rows)), TODAY)?.role).toBe('CB');
    rows[2] = row(2, { intl_absent_until: TODAY });
    expect(missingRole(players(squad(rows)), TODAY)?.role).toBe('CB');
  });

  it('waits until the players on loan are back', () => {
    const rows = [...SHAPE.keys()].map((i) => row(i));
    rows[2] = row(2, { on_loan: true });
    expect(emergencyNeed(players(squad(rows)), TODAY)).toBe('recall');
    rows[0] = row(0, out);
    expect(emergencyNeed(players(squad(rows)), TODAY)).toMatchObject({ role: 'GK' });
    rows[0] = row(0);
    rows[2] = row(2, { on_loan: true, ...out });
    expect(emergencyNeed(players(squad(rows)), TODAY)).toMatchObject({ role: 'CB' });
  });

  it('is neither loaned out nor counted among the players a sale must leave', () => {
    expect(loanBlock({ position: 'N', starter: false, onLoan: false, emergency: true })).toContain(
      'Juniora',
    );
    const eligible = (list: PlayerDbRow[]) =>
      isTransferSellEligible({
        transferWindowOpen: true,
        activePlayers: squad(list),
        playerId: 'p5',
      });
    const eighteen = Array.from({ length: 18 }, (_, i) => row(i));
    expect(eligible([...eighteen, row(18, { origin: 'emergency' })])).toBe(false);
    expect(eligible([...eighteen, row(18)])).toBe(true);
  });

  it('stays under the level of the league and is never for sale', () => {
    expect(emergencyJunior('iv', 'x')).toMatchObject({ skill: 42, potential: 47, wage: 1200 });
    expect(emergencyJunior('i', 'x')).toMatchObject({ skill: 61, potential: 66 });
    expect(saleBlock({ skill: 42, age: 17, origin: 'emergency' })).toContain('Juniora');
  });
});

describe('a second goalkeeper as the last resort', () => {
  const rows = [...SHAPE.keys()].map((i) => row(i));
  rows[5] = row(5, { status: 'INJURED', injury_matches: 1 });
  rows.push(row(11));
  const legal = squad(rows);

  it('is found by both buttons and by the repair', () => {
    for (const fixed of [
      replaceUnavailableStarters(players(legal), TODAY),
      pickBestXi(players(legal), TODAY),
    ]) {
      const ids = fixed.filter((p) => p.starter).map((p) => p.id);
      expect(ids).toHaveLength(11);
      expect(ids).toContain('p11');
      expect(ids).not.toContain('p5');
    }
    expect(lineupProblem(CLUB, repairLineup(CLUB, legal, TODAY), TODAY)).toBeNull();
  });

  it('goes to goal first, and waits while a field player is free', () => {
    const gone = [...rows];
    gone[0] = row(0, { status: 'INJURED', injury_matches: 1 });
    const fixed = replaceUnavailableStarters(players(squad(gone)), TODAY);
    expect(fixed.find((p) => p.id === 'p11')?.starter).toBe(true);
    expect(fixed.find((p) => p.id === 'p0')?.starter).toBe(false);
    expect(fixed.find((p) => p.id === 'p5')?.starter).toBe(true);

    const more = squad([...rows, row(16, { skill: 40 })]);
    for (const list of [
      replaceUnavailableStarters(players(more), TODAY),
      pickBestXi(players(more), TODAY),
    ]) {
      expect(list.find((p) => p.id === 'p16')?.starter).toBe(true);
      expect(list.filter((p) => p.starter && p.position === 'BR')).toHaveLength(1);
    }
  });
});

describe('fillLineup (D138.4)', () => {
  it('keeps the fit players and adds only the missing juniors', () => {
    const hurt = { status: 'INJURED', injury_matches: 2 };
    const rows = [...SHAPE.keys()].map((i) => row(i, i === 0 || i > 8 ? hurt : {}));
    const filled = fillLineup(CLUB, 'iv', squad(rows), TODAY);
    expect(lineupProblem(CLUB, filled, TODAY)).toBeNull();
    const xi = resolveStartingXi(filled);
    expect(xi.filter((p) => isStandIn(p.id))).toHaveLength(3);
    expect(new Set(filled.map((p) => p.shirtNumber)).size).toBe(filled.length);
    expect(xi.filter((p) => !isStandIn(p.id)).map((p) => p.id)).toEqual(
      rows.slice(1, 9).map((r) => r.id),
    );
  });

  it('plays even without a single senior', () => {
    const xi = resolveStartingXi(fillLineup(CLUB, 'iii', [], TODAY));
    expect(xi).toHaveLength(11);
    expect(xi.filter((p) => p.pos === 'BR')).toHaveLength(1);
    const note = (homeId: string) =>
      standInNote({ home_id: homeId, home_xi: xi as never, away_xi: null }, CLUB, 'Rywal');
    expect(note(CLUB)).toContain('Twój skład');
    expect(note('x')).toContain('Rywal ma niepełny skład');
  });
});
