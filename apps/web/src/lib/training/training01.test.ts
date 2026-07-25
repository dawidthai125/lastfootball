import { describe, expect, it } from 'vitest';

import { countPlayedInList, hasPlayedUnlock, utcDateString } from '@/lib/fixtures/played-unlock';
import { buildStarterPlayerInserts } from '@/lib/squad/build-player-inserts';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import type { PlayerRowDto } from '@/lib/squad/types';
import { applyTrainingSessionEffects } from '@/lib/training/apply-effects';
import { resolveClubTraining } from '@/lib/training/resolve-club-training';
import { TRAINING_THIN } from '@/lib/training/types';

function activeRows(clubId: string): PlayerRowDto[] {
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

describe('played unlock helper', () => {
  it('hasPlayedUnlock respects threshold', () => {
    expect(hasPlayedUnlock(0, 2)).toBe(false);
    expect(hasPlayedUnlock(1, 2)).toBe(false);
    expect(hasPlayedUnlock(2, 2)).toBe(true);
    expect(hasPlayedUnlock(5, 2)).toBe(true);
  });

  it('countPlayedInList counts only played', () => {
    expect(
      countPlayedInList([
        { status: 'played' },
        { status: 'upcoming' },
        { status: 'played' },
        { status: 'scheduled' },
      ]),
    ).toBe(2);
  });

  it('utcDateString is YYYY-MM-DD', () => {
    expect(utcDateString(new Date('2026-07-25T15:30:00.000Z'))).toBe('2026-07-25');
  });
});

describe('resolveClubTraining (LFE-TRAINING-01)', () => {
  const clubId = 'club-train-1';
  const today = '2026-07-25';

  it('locks when played below unlock', () => {
    const dto = resolveClubTraining({
      clubId,
      playedCount: 1,
      lastTrainingOn: null,
      activePlayers: activeRows(clubId),
      today,
    });
    expect(dto.unlocked).toBe(false);
    expect(dto.canTrain).toBe(false);
    expect(dto.lockReason).toBe('not_unlocked');
    expect(dto.playedRequired).toBe(TRAINING_THIN.UNLOCK_AFTER_PLAYED);
  });

  it('allows train when unlocked and not trained today', () => {
    const dto = resolveClubTraining({
      clubId,
      playedCount: 2,
      lastTrainingOn: null,
      activePlayers: activeRows(clubId),
      today,
    });
    expect(dto.unlocked).toBe(true);
    expect(dto.canTrain).toBe(true);
    expect(dto.lockReason).toBeNull();
    expect(dto.defaults.focusId).toBe('tactics');
    expect(dto.defaults.intensityId).toBe('normal');
    expect(dto.individualAvailable).toBe(false);
    expect(dto.readiness.active).toBe(18);
    expect(dto.readiness.ready).toBe(18);
  });

  it('locks already_trained_today', () => {
    const dto = resolveClubTraining({
      clubId,
      playedCount: 3,
      lastTrainingOn: today,
      activePlayers: activeRows(clubId),
      today,
    });
    expect(dto.canTrain).toBe(false);
    expect(dto.lockReason).toBe('already_trained_today');
  });

  it('locks squad_unavailable when empty', () => {
    const dto = resolveClubTraining({
      clubId,
      playedCount: 2,
      lastTrainingOn: null,
      activePlayers: [],
      today,
    });
    expect(dto.canTrain).toBe(false);
    expect(dto.lockReason).toBe('squad_unavailable');
  });
});

describe('applyTrainingSessionEffects', () => {
  const base = [
    { id: 'a', status: 'READY' as const },
    { id: 'b', status: 'READY' as const },
    { id: 'c', status: 'TIRED' as const },
    { id: 'd', status: 'INJURED' as const },
    { id: 'e', status: 'READY' as const },
  ];

  it('regeneration turns TIRED → READY; leaves INJURED', () => {
    const out = applyTrainingSessionEffects(base, 'regeneration', 'normal');
    expect(out.find((p) => p.id === 'c')?.status).toBe('READY');
    expect(out.find((p) => p.id === 'd')?.status).toBe('INJURED');
    expect(out.filter((p) => p.status === 'READY').length).toBe(4);
  });

  it('light intensity is a no-op on statuses', () => {
    const out = applyTrainingSessionEffects(base, 'tactics', 'light');
    expect(out).toEqual(base);
  });

  it('normal tires every 3rd READY by sorted id; never changes INJURED', () => {
    const out = applyTrainingSessionEffects(base, 'technique', 'normal');
    expect(out.find((p) => p.id === 'd')?.status).toBe('INJURED');
    const tiredReady = out.filter((p) => p.status === 'TIRED' && p.id !== 'c');
    // ready ids sorted: a, b, e → index 0 (a) tires
    expect(out.find((p) => p.id === 'a')?.status).toBe('TIRED');
    expect(out.find((p) => p.id === 'b')?.status).toBe('READY');
    expect(out.find((p) => p.id === 'e')?.status).toBe('READY');
    expect(tiredReady.length).toBeGreaterThanOrEqual(1);
  });

  it('high tires every 2nd READY', () => {
    const out = applyTrainingSessionEffects(base, 'physical', 'high');
    expect(out.find((p) => p.id === 'a')?.status).toBe('TIRED');
    expect(out.find((p) => p.id === 'b')?.status).toBe('READY');
    expect(out.find((p) => p.id === 'e')?.status).toBe('TIRED');
  });

  it('does not change player count', () => {
    const out = applyTrainingSessionEffects(base, 'tactics', 'high');
    expect(out).toHaveLength(base.length);
    expect(out.map((p) => p.id).sort()).toEqual(base.map((p) => p.id).sort());
  });
});
