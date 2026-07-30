import { describe, expect, it } from 'vitest';

import {
  allocateAcademyShirt,
  buildAcademyIntakeDraft,
  canPromoteProspect,
  resolveClubAcademy,
  ACADEMY_THIN,
} from '@/lib/academy';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { filterSeniorPlayers, resolveClubSquad } from '@/lib/squad';
import { resolveClubTraining } from '@/lib/training';
import { resolveTransferMarket } from '@/lib/transfers';

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
  return {
    name: 'Youth',
    pos: 'N',
    role: 'ST',
    starter: false,
    captain: false,
    age: 17,
    skill: 45,
    potential: 80,
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

describe('LFE-ACADEMY-01 resolveClubAcademy', () => {
  it('lists prospects with potential bands only; soft-locks intake before SEASON', () => {
    const clubId = 'club-aca-1';
    const rows = [
      mapPlayerRow(seniorRow({ id: 's-1', club_id: clubId, shirt_number: 8 })),
      mapPlayerRow(prospectRow({ id: 'a-1', club_id: clubId, shirt_number: 90, name: 'J. Test' })),
    ];
    const early = resolveClubAcademy({ id: clubId }, rows, 'EARLY_CLUB');
    expect(early.unlocked).toBe(false);
    expect(early.canIntake).toBe(false);
    expect(early.intakeBlockedReason).toBe('not_season');
    expect(early.prospects).toHaveLength(1);
    expect(early.prospects[0]!.potentialLabel).toBeTruthy();
    expect(early.prospects[0]).not.toHaveProperty('skill');

    const season = resolveClubAcademy({ id: clubId }, rows, 'SEASON');
    expect(season.unlocked).toBe(true);
    expect(season.canIntake).toBe(true);
    expect(season.canPromote).toBe(true);
  });

  it('blocks intake at max 3 prospects', () => {
    const clubId = 'club-aca-2';
    const rows = [1, 2, 3].map((n) =>
      mapPlayerRow(
        prospectRow({
          id: `a-${n}`,
          club_id: clubId,
          shirt_number: 89 + n,
          name: `Y${n}`,
        }),
      ),
    );
    const dto = resolveClubAcademy({ id: clubId }, rows, 'SEASON');
    expect(dto.prospectCount).toBe(ACADEMY_THIN.MAX_PROSPECTS);
    expect(dto.canIntake).toBe(false);
    expect(dto.intakeBlockedReason).toBe('slots_full');
  });
});

describe('LFE-ACADEMY-01 intake / promote pure', () => {
  it('buildAcademyIntakeDraft reuses potential ≥ skill and respects limit', () => {
    const clubId = '11111111-2222-3333-4444-555555555555';
    const empty = buildAcademyIntakeDraft(clubId, [], 1001);
    expect('error' in empty).toBe(false);
    if ('error' in empty) return;
    expect(empty.id.startsWith('a-')).toBe(true);
    expect(empty.potential).toBeGreaterThanOrEqual(empty.skill);
    expect(empty.age).toBeGreaterThanOrEqual(16);
    expect(empty.age).toBeLessThanOrEqual(18);
    expect(empty.shirtNumber).toBeGreaterThanOrEqual(90);

    const full = [1, 2, 3].map((n) =>
      mapPlayerRow(prospectRow({ id: `a-x-${n}`, club_id: clubId, shirt_number: 90 + n })),
    );
    const blocked = buildAcademyIntakeDraft(clubId, full, 1002);
    expect(blocked).toEqual({ error: 'Limit perspektyw akademii wyczerpany (3).' });
  });

  it('canPromoteProspect requires academy_track', () => {
    const clubId = 'c1';
    const rows = [
      mapPlayerRow(seniorRow({ id: 's-1', club_id: clubId })),
      mapPlayerRow(prospectRow({ id: 'a-1', club_id: clubId, shirt_number: 91 })),
    ];
    expect(canPromoteProspect(rows, 's-1', clubId).ok).toBe(false);
    expect(canPromoteProspect(rows, 'a-1', clubId).ok).toBe(true);
  });

  it('allocateAcademyShirt prefers 90–99', () => {
    expect(allocateAcademyShirt(new Set())).toBe(90);
    expect(allocateAcademyShirt(new Set([90, 91]))).toBe(92);
  });
});

describe('LFE-ACADEMY-01 senior filters (no academy logic leak)', () => {
  it('resolveClubSquad excludes academy_track prospects', () => {
    const clubId = 'club-filter';
    const rows = [
      mapPlayerRow(seniorRow({ id: 's-1', club_id: clubId, shirt_number: 8, starter: true })),
      mapPlayerRow(prospectRow({ id: 'a-1', club_id: clubId, shirt_number: 90 })),
    ];
    // Need enough seniors — pad with starters for squad not to throw oddly; one senior is enough
    const squad = resolveClubSquad({ id: clubId }, rows);
    expect(squad.players).toHaveLength(1);
    expect(squad.players[0]!.id).toBe('s-1');
    expect(filterSeniorPlayers(rows)).toHaveLength(1);
  });

  it('resolveClubTraining readiness ignores prospects', () => {
    const clubId = 'club-tr';
    const rows = [
      mapPlayerRow(seniorRow({ id: 's-1', club_id: clubId, shirt_number: 8, status: 'READY' })),
      mapPlayerRow(prospectRow({ id: 'a-1', club_id: clubId, shirt_number: 90, status: 'READY' })),
    ];
    const dto = resolveClubTraining({
      clubId,
      playedCount: 5,
      lastTrainingOn: null,
      activePlayers: rows,
      today: '2026-07-30',
    });
    expect(dto.readiness.active).toBe(1);
    expect(dto.readiness.ready).toBe(1);
  });

  it('resolveTransferMarket roster count ignores prospects', () => {
    const clubId = 'club-tx';
    const seniors = Array.from({ length: 18 }, (_, i) =>
      mapPlayerRow(
        seniorRow({
          id: `s-${i}`,
          club_id: clubId,
          shirt_number: i + 1,
          starter: i < 11,
        }),
      ),
    );
    const withProspect = [
      ...seniors,
      mapPlayerRow(prospectRow({ id: 'a-1', club_id: clubId, shirt_number: 99 })),
    ];
    const market = resolveTransferMarket({
      clubId,
      cashBalance: 500_000,
      transferWindowOpen: true,
      activePlayers: withProspect,
    });
    expect(market.activeRosterCount).toBe(18);
    expect(market.sellCandidates.every((c) => c.playerId !== 'a-1')).toBe(true);
  });
});
