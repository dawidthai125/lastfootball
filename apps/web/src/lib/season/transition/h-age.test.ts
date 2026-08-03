import { describe, expect, it, vi } from 'vitest';

import {
  revertSeasonTransitionHAge,
  runSeasonTransitionHAge,
  type HAgePlayersPort,
} from '@/lib/season/transition/h-age';
import { DEVELOPMENT_THIN } from '@/lib/squad/development-thin';
import type { SeasonAgePlayerSlice, SeasonAgeResultSlice } from '@/lib/squad/season-age';

function memoryPort(initial: SeasonAgePlayerSlice[]): {
  port: HAgePlayersPort;
  store: Map<string, SeasonAgePlayerSlice>;
} {
  const store = new Map(initial.map((p) => [p.id, { ...p }]));
  const port: HAgePlayersPort = {
    async listActiveClubPlayers() {
      return [...store.values()];
    },
    async writePlayerAgeSkill(_clubId, row: SeasonAgeResultSlice) {
      const prev = store.get(row.id);
      if (!prev) return { ok: false, error: 'missing' };
      store.set(row.id, {
        ...prev,
        age: row.age,
        skill: row.skill,
      });
      return { ok: true };
    },
  };
  return { port, store };
}

describe('LFE-AGE-01 H-AGE transition', () => {
  it('persists age++ for senior and academy slices via pure effects', async () => {
    const { port, store } = memoryPort([
      { id: 's1', age: 24, skill: 70, potential: 80 },
      { id: 'a1', age: 17, skill: 40, potential: 75 },
      {
        id: 'v1',
        age: DEVELOPMENT_THIN.AGE_REGRESS_FROM,
        skill: 70,
        potential: 80,
      },
    ]);

    const result = await runSeasonTransitionHAge('club-1', port);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.updatedCount).toBe(3);
    expect(store.get('s1')).toMatchObject({ age: 25, skill: 70 });
    expect(store.get('a1')).toMatchObject({ age: 18, skill: 40 });
    expect(store.get('v1')).toMatchObject({
      age: DEVELOPMENT_THIN.AGE_REGRESS_FROM + 1,
      skill: 69,
    });
  });

  it('rolls back partial writes when a later write fails', async () => {
    const base: SeasonAgePlayerSlice[] = [
      { id: 'ok', age: 20, skill: 50, potential: 60 },
      { id: 'fail', age: 21, skill: 50, potential: 60 },
    ];
    const store = new Map(base.map((p) => [p.id, { ...p }]));
    let writes = 0;
    const port: HAgePlayersPort = {
      async listActiveClubPlayers() {
        return [...store.values()];
      },
      async writePlayerAgeSkill(_clubId, row) {
        writes += 1;
        if (row.id === 'fail' && row.age === 22) {
          return { ok: false, error: 'Nie udało się zapisać wieku zawodnika.' };
        }
        const prev = store.get(row.id);
        if (!prev) return { ok: false, error: 'missing' };
        store.set(row.id, { ...prev, age: row.age, skill: row.skill });
        return { ok: true };
      },
    };

    const result = await runSeasonTransitionHAge('club-1', port);
    expect(result.ok).toBe(false);
    expect(writes).toBeGreaterThan(1);
    expect(store.get('ok')).toMatchObject({ age: 20, skill: 50 });
    expect(store.get('fail')).toMatchObject({ age: 21, skill: 50 });
  });

  it('revertSeasonTransitionHAge restores snapshot after Confirm failure', async () => {
    const { port, store } = memoryPort([{ id: 'p1', age: 30, skill: 66, potential: 70 }]);
    const aged = await runSeasonTransitionHAge('club-1', port);
    expect(aged.ok).toBe(true);
    if (!aged.ok) return;
    expect(store.get('p1')?.age).toBe(31);

    const reverted = await revertSeasonTransitionHAge('club-1', port, aged.snapshot);
    expect(reverted.ok).toBe(true);
    expect(store.get('p1')).toMatchObject({ age: 30, skill: 66 });
  });

  it('empty roster is success with zero updates', async () => {
    const port: HAgePlayersPort = {
      listActiveClubPlayers: vi.fn(async () => []),
      writePlayerAgeSkill: vi.fn(async () => ({ ok: true as const })),
    };
    const result = await runSeasonTransitionHAge('club-1', port);
    expect(result).toEqual({ ok: true, updatedCount: 0, snapshot: [] });
    expect(port.writePlayerAgeSkill).not.toHaveBeenCalled();
  });
});
