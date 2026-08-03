import {
  applySeasonAgeEffects,
  type SeasonAgePlayerSlice,
  type SeasonAgeResultSlice,
} from '@/lib/squad/season-age';

/**
 * Minimal DB surface for H-AGE (testable · no Supabase import in pure orchestration).
 * Season Transition Pipeline — step H-AGE (LFE-AGE-01).
 */
export type HAgePlayersPort = {
  readonly listActiveClubPlayers: (
    clubId: string,
  ) => Promise<readonly SeasonAgePlayerSlice[] | { error: string }>;
  readonly writePlayerAgeSkill: (
    clubId: string,
    row: SeasonAgeResultSlice,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export type HAgeSuccess = {
  readonly ok: true;
  readonly updatedCount: number;
  /** Pre-age snapshot for Confirm fail compensation. */
  readonly snapshot: readonly SeasonAgePlayerSlice[];
};

export type HAgeFailure = {
  readonly ok: false;
  readonly error: string;
};

/**
 * H-AGE — first Season Transition Pipeline step.
 * Loads club roster (senior + academy_track, non-departed) → pure age tick → persist.
 */
export async function runSeasonTransitionHAge(
  clubId: string,
  port: HAgePlayersPort,
): Promise<HAgeSuccess | HAgeFailure> {
  const loaded = await port.listActiveClubPlayers(clubId);
  if ('error' in loaded) {
    return { ok: false, error: loaded.error };
  }

  const snapshot = loaded;
  if (snapshot.length === 0) {
    return { ok: true, updatedCount: 0, snapshot };
  }

  const next = applySeasonAgeEffects(snapshot);
  const written: SeasonAgeResultSlice[] = [];

  for (const row of next) {
    const result = await port.writePlayerAgeSkill(clubId, row);
    if (!result.ok) {
      await revertWritten(clubId, port, snapshot, written);
      return { ok: false, error: result.error };
    }
    written.push(row);
  }

  return { ok: true, updatedCount: written.length, snapshot };
}

/**
 * Restore ages/skills from snapshot after a later Confirm step fails.
 */
export async function revertSeasonTransitionHAge(
  clubId: string,
  port: HAgePlayersPort,
  snapshot: readonly SeasonAgePlayerSlice[],
): Promise<HAgeFailure | { ok: true }> {
  for (const row of snapshot) {
    const result = await port.writePlayerAgeSkill(clubId, {
      id: row.id,
      age: row.age,
      skill: row.skill,
    });
    if (!result.ok) {
      return {
        ok: false,
        error: 'Nie udało się wycofać zmian wieku kadry po błędzie sezonu.',
      };
    }
  }
  return { ok: true };
}

async function revertWritten(
  clubId: string,
  port: HAgePlayersPort,
  snapshot: readonly SeasonAgePlayerSlice[],
  written: readonly SeasonAgeResultSlice[],
): Promise<void> {
  const byId = new Map(snapshot.map((p) => [p.id, p]));
  for (const row of written) {
    const prev = byId.get(row.id);
    if (!prev) continue;
    await port.writePlayerAgeSkill(clubId, {
      id: prev.id,
      age: prev.age,
      skill: prev.skill,
    });
  }
}
