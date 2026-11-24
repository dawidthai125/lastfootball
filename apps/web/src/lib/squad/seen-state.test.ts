import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/supabase/admin', () => ({ serverDb: (db: unknown) => db }));

import { settleFixture } from '@/lib/fixtures/settle-fixture';
import { applyMatchDevelopment } from '@/lib/squad/apply-match-development';
import { mapPlayerRow } from '@/lib/squad/map-player';
import { seenState } from '@/lib/squad/seen-state';
import { completeTrainingSession } from '@/lib/training/complete-session';

const player = mapPlayerRow(
  {
    id: 'p1',
    club_id: 'c1',
    name: 'Gracz',
    shirt_number: 1,
    pos: 'ŚP',
    role: 'CM',
    starter: true,
    captain: false,
    age: 25,
    skill: 60,
    potential: 70,
    status: 'TIRED',
    nationality: 'POL',
    version: 1,
    departed_at: null,
    energy: 50,
    energy_on: '2026-12-10',
    morale: 55,
  },
  '2026-12-14',
);

function database(answer: { data: unknown; error: { code: string } | null }) {
  const calls: { p_updates: Record<string, unknown>[] }[] = [];
  const db = {
    rpc: async (_name: string, args: (typeof calls)[number]) => {
      calls.push(args);
      return answer;
    },
  };
  return { calls, db: db as never };
}

const SEEN = { energy: 50, energy_on: '2026-12-10', status: 'TIRED', skill: 60, morale: 55 };
const MOVED = { data: null, error: { code: 'LFOLD' } };

function train(db: never) {
  return completeTrainingSession(db, {
    clubId: 'c1',
    lastTrainingOn: null,
    playedCount: 22,
    activePlayers: [player],
    focusId: 'physical',
    intensityId: 'light',
    today: '2026-12-14',
  });
}

describe('seen state', () => {
  it('is the stored row, not the rested one', () => {
    expect(player).toMatchObject({ energy: 70, status: 'READY' });
    expect(seenState(player)).toEqual(SEEN);
    expect(seenState({ ...player, stored: undefined })).toBeUndefined();
  });

  it('goes with every match and training row', async () => {
    const match = database({ data: { ok: true }, error: null });
    await applyMatchDevelopment(match.db, {
      clubId: 'c1',
      matchKey: 'm1',
      activePlayers: [player],
      truthById: { p1: { energy: 40 } },
    });
    expect(match.calls[0]?.p_updates[0]).toMatchObject({ id: 'p1', seen: SEEN });
    const training = database({ data: { ok: true }, error: null });
    await train(training.db);
    expect(training.calls[0]?.p_updates[0]).toMatchObject({ id: 'p1', seen: SEEN });
  });

  it('tells the caller to read again when a player moved', async () => {
    const moved = { ok: false, moved: true };
    expect(
      await applyMatchDevelopment(database(MOVED).db, {
        clubId: 'c1',
        matchKey: 'm1',
        activePlayers: [player],
      }),
    ).toMatchObject(moved);
    expect(await train(database(MOVED).db)).toMatchObject(moved);
  });

  it('names a match day taken by another save', async () => {
    const taken = { data: null, error: { code: 'LFDAY' } };
    expect(await settleFixture(database(taken).db, {})).toBe('day_taken');
  });
});
