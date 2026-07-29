import { describe, expect, it } from 'vitest';

import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import {
  getSquadPlayerById,
  resolveClubSquad,
  resolveStartingXi,
  seedClubRoster,
  seedStarterSquad,
  SquadUnavailableError,
} from '@/lib/squad';

function rowsFromSeed(clubId: string) {
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

describe('squad SSOT (LFE-PLAYERS-01)', () => {
  it('seed generator builds 18 with deterministic s-{tag} ids', () => {
    const clubId = '11111111-2222-3333-4444-555555555555';
    const inserts = buildStarterPlayerInserts(clubId);
    expect(inserts).toHaveLength(18);
    expect(inserts.filter((p) => p.starter)).toHaveLength(11);
    expect(inserts.every((p) => p.id.startsWith('s-'))).toBe(true);
    expect(inserts.every((p) => p.version === 1)).toBe(true);
    expect(inserts.every((p) => p.status === 'READY')).toBe(true);
    expect(inserts.map((p) => p.id)).toEqual(seedClubRoster(clubId).map((p) => p.id));
  });

  it('resolveClubSquad maps DB rows — never empty without error', () => {
    const clubId = 'club-1';
    const rows = rowsFromSeed(clubId);
    const squad = resolveClubSquad({ id: clubId }, rows);
    expect(squad.players.length).toBeGreaterThanOrEqual(18);
    expect(squad.players.filter((p) => p.starter)).toHaveLength(11);
    expect(squad.players.every((p) => p.status === 'READY')).toBe(true);
    expect(squad.players.every((p) => p.version === 1)).toBe(true);
  });

  it('resolveClubSquad throws on empty rows (no seed fallback)', () => {
    expect(() => resolveClubSquad({ id: 'x' }, [])).toThrow(SquadUnavailableError);
  });

  it('resolveStartingXi matches seedStarterSquad ids when fed generator rows', () => {
    const clubId = '11111111-2222-3333-4444-555555555555';
    const xi = resolveStartingXi(rowsFromSeed(clubId));
    expect(xi.map((p) => p.id)).toEqual(seedStarterSquad(clubId).map((p) => p.id));
    expect(xi).toHaveLength(11);
  });

  it('resolveStartingXi hard-fails on injured starter (no auto-swap)', () => {
    const clubId = 'club-xi-gate';
    const rows = rowsFromSeed(clubId).map((r, i) =>
      i === 0 && r.starter ? { ...r, status: 'INJURED' as const } : r,
    );
    expect(() => resolveStartingXi(rows)).toThrow(SquadUnavailableError);
    try {
      resolveStartingXi(rows);
    } catch (e) {
      expect(e).toBeInstanceOf(SquadUnavailableError);
      expect((e as SquadUnavailableError).message).toMatch(/kontuzjowanych|zawieszonych/i);
    }
  });

  it('getSquadPlayerById reads from resolved squad', () => {
    const clubId = 'abc';
    const squad = resolveClubSquad({ id: clubId }, rowsFromSeed(clubId));
    const first = squad.players[0]!;
    expect(getSquadPlayerById(squad, first.id)?.name).toBe(first.name);
    expect(getSquadPlayerById(squad, 'missing')).toBeNull();
  });
});
