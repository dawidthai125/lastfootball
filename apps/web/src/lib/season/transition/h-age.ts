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
    row: SeasonAgeResultSlice & { readonly agedForSeason?: number | null },
    /** Write only when this season did not age him yet. */
    unlessAgedFor?: number,
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
};

export type HAgeSuccess = {
  readonly ok: true;
  readonly updatedCount: number;
  /** Players aged by this run, as they were before: Confirm fail compensation. */
  readonly snapshot: readonly SeasonAgePlayerSlice[];
};

export type HAgeFailure = {
  readonly ok: false;
  readonly error: string;
};

/**
 * H-AGE — first Season Transition Pipeline step.
 * Loads club roster (senior + academy_track, non-departed) → pure age tick → persist.
 * One tick per season end: a retry skips the players an earlier run aged already.
 */
export async function runSeasonTransitionHAge(
  clubId: string,
  port: HAgePlayersPort,
  endedSeason: number,
): Promise<HAgeSuccess | HAgeFailure> {
  const loaded = await port.listActiveClubPlayers(clubId);
  if ('error' in loaded) {
    return { ok: false, error: loaded.error };
  }

  const snapshot = loaded.filter((p) => p.agedForSeason !== endedSeason);
  if (snapshot.length === 0) {
    return { ok: true, updatedCount: 0, snapshot };
  }

  const next = applySeasonAgeEffects(snapshot);
  const written: SeasonAgeResultSlice[] = [];

  for (const [i, row] of next.entries()) {
    const marked = snapshot[i]?.agedForSeason !== undefined;
    const result = marked
      ? await port.writePlayerAgeSkill(clubId, { ...row, agedForSeason: endedSeason }, endedSeason)
      : await port.writePlayerAgeSkill(clubId, row);
    if (!result.ok) {
      await revertWritten(clubId, port, snapshot, written);
      return { ok: false, error: result.error };
    }
    written.push(row);
  }

  return { ok: true, updatedCount: written.length, snapshot };
}

/**
 * Restore ages/skills (and the season marker) from snapshot after a later Confirm step fails.
 * A row that stays aged also keeps its marker, so the next try does not age it again.
 */
export async function revertSeasonTransitionHAge(
  clubId: string,
  port: HAgePlayersPort,
  snapshot: readonly SeasonAgePlayerSlice[],
): Promise<HAgeFailure | { ok: true }> {
  let failed = 0;
  for (const row of snapshot) {
    const result = await port.writePlayerAgeSkill(clubId, {
      id: row.id,
      age: row.age,
      skill: row.skill,
      ...(row.agedForSeason === undefined ? {} : { agedForSeason: row.agedForSeason }),
    });
    if (!result.ok) failed += 1;
  }
  return failed > 0
    ? { ok: false, error: 'Nie udało się wycofać zmian wieku kadry po błędzie sezonu.' }
    : { ok: true };
}

async function revertWritten(
  clubId: string,
  port: HAgePlayersPort,
  snapshot: readonly SeasonAgePlayerSlice[],
  written: readonly SeasonAgeResultSlice[],
): Promise<void> {
  const ids = new Set(written.map((row) => row.id));
  const reverted = await revertSeasonTransitionHAge(
    clubId,
    port,
    snapshot.filter((p) => ids.has(p.id)),
  );
  if (!reverted.ok) console.error('H-AGE: revert failed', { clubId });
}
