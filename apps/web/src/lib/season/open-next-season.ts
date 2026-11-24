import { serverDb } from '@/lib/supabase/admin';
import { academyDraftId, buildAcademyIntakeDraft } from '@/lib/academy/intake';
import { isLastAcademySeason } from '@/lib/academy/levels';
import type { LeagueTier } from '@/lib/league/league-tier';
import {
  formatRetirementFarewell,
  planSeasonDeparture,
  type RetirementFarewell,
} from '@/lib/season/departure';
import { revertSeasonTransitionHAge, type HAgePlayersPort } from '@/lib/season/transition/h-age';
import type { SeasonAgePlayerSlice } from '@/lib/squad/season-age';
import { isAcademyProspect, type PlayerRowDto, type PlayerStatus } from '@/lib/squad/types';
import type { createClient } from '@/lib/supabase/server';

type SeasonDb = Awaited<ReturnType<typeof createClient>>;

type RetireeSnapshot = {
  readonly id: string;
  readonly status: PlayerStatus;
  readonly starter: boolean;
};

/** Squad writes to reverse when the club row never leaves offseason. */
export type SeasonDepartureUndo = {
  readonly clubId: string;
  readonly retiree: RetireeSnapshot | null;
  readonly replacement:
    | { readonly kind: 'promote'; readonly id: string; readonly starter: boolean | null }
    | { readonly kind: 'insert'; readonly id: string };
};

export type OpenNextSeasonInput = {
  readonly supabase: SeasonDb;
  readonly clubId: string;
  readonly endedSeason: number;
  readonly loadRoster: (clubId: string) => Promise<readonly PlayerRowDto[]>;
  readonly nextSeason: number;
  readonly nextTier: LeagueTier;
  readonly goalNote: string;
  readonly hAgePort: HAgePlayersPort;
  readonly hAgeSnapshot: readonly SeasonAgePlayerSlice[];
};

/**
 * Departure is written before the club row flips to in_season.
 * If that update does not land, the club is still offseason — undo the squad write, then H-AGE.
 * A failed departure already restored inside apply; this path must not undo again.
 * Every undo step runs even when an earlier one failed, and a failed one is reported.
 */
export type OpenNextSeasonOk = {
  readonly ok: true;
  readonly farewell: RetirementFarewell | null;
};

export async function openNextSeasonAfterDeparture(
  input: OpenNextSeasonInput,
): Promise<OpenNextSeasonOk | { ok: false; error: string }> {
  const roster = await input.loadRoster(input.clubId);
  const departure = await applySeasonDeparture(
    input.supabase,
    input.clubId,
    input.endedSeason,
    roster,
    // Empty: an earlier run aged everybody, so the marker exists.
    input.hAgeSnapshot.length === 0 ||
      input.hAgeSnapshot.some((player) => player.agedForSeason !== undefined),
  );
  const before = new Map(input.hAgeSnapshot.map((player) => [player.id, player.age]));
  const leavers: PlayerRowDto[] = [];
  const rollback = async (undo: SeasonDepartureUndo | null, error: string) => {
    const juniors = await restoreJuniors(input.supabase, input.clubId, leavers);
    const squad = await undoSeasonDeparture(input.supabase, undo);
    const ages = await revertSeasonTransitionHAge(input.clubId, input.hAgePort, input.hAgeSnapshot);
    if (juniors && squad && ages.ok) return { ok: false as const, error };
    console.error('openNextSeason: undo incomplete', { juniors, squad, ages: ages.ok });
    return { ok: false as const, error: `${error} Części zmian w kadrze nie udało się cofnąć.` };
  };
  if (!departure.ok) return rollback(null, departure.error);

  // D134: the age before the tick decides. A player an earlier run aged is one year older now.
  // A junior the departure just promoted stays.
  const promoted = departure.undo?.replacement.id;
  leavers.push(
    ...roster.filter(
      (player) =>
        isAcademyProspect(player) &&
        isLastAcademySeason(before.get(player.id) ?? player.age - 1) &&
        player.id !== promoted,
    ),
  );
  if (!(await releaseJuniors(input.supabase, input.clubId, leavers))) {
    return rollback(departure.undo, 'Nie udało się zamknąć rocznika akademii.');
  }

  const { data: opened, error: updErr } = await input.supabase
    .from('clubs')
    .update({
      season_number: input.nextSeason,
      season_phase: 'in_season',
      league_tier: input.nextTier,
      season_goal_paid_for: input.endedSeason,
      season_goal_note: input.goalNote,
    } as never)
    .eq('id', input.clubId)
    .eq('season_phase', 'offseason')
    .select('id');

  if (updErr || !opened || opened.length === 0) {
    return rollback(departure.undo, 'Nie udało się otworzyć nowego sezonu.');
  }

  return { ok: true, farewell: departure.farewell };
}

/** Safe to repeat: a junior who left already is no longer in the roster. */
async function releaseJuniors(
  supabase: SeasonDb,
  clubId: string,
  juniors: readonly PlayerRowDto[],
): Promise<boolean> {
  const now = new Date().toISOString();
  for (const junior of juniors) {
    const { error } = await serverDb(supabase)
      .from('players')
      .update({ status: 'DEPARTED', departed_at: now, starter: false } as never)
      .eq('id', junior.id)
      .eq('club_id', clubId)
      .eq('academy_track', true)
      .is('departed_at', null);
    if (error) return false;
  }
  return true;
}

async function restoreJuniors(
  supabase: SeasonDb,
  clubId: string,
  juniors: readonly PlayerRowDto[],
): Promise<boolean> {
  let ok = true;
  for (const junior of juniors) {
    const { error } = await serverDb(supabase)
      .from('players')
      .update({ status: junior.status, departed_at: null, starter: junior.starter } as never)
      .eq('id', junior.id)
      .eq('club_id', clubId)
      .eq('academy_track', true);
    if (error) ok = false;
  }
  return ok;
}

type DepartureApplyOk = {
  readonly ok: true;
  readonly undo: SeasonDepartureUndo | null;
  readonly farewell: RetirementFarewell | null;
};

async function applySeasonDeparture(
  supabase: SeasonDb,
  clubId: string,
  seasonNumber: number,
  roster: readonly PlayerRowDto[],
  agingIsMarked: boolean,
): Promise<DepartureApplyOk | { ok: false; error: string }> {
  // An interrupted start of this season got as far as the replacement: nobody else retires.
  if (roster.some((player) => player.id === academyDraftId(clubId, seasonNumber))) {
    return { ok: true, undo: null, farewell: null };
  }
  const plan = planSeasonDeparture(
    roster.map((player) => ({
      id: player.id,
      age: player.age,
      skill: player.skill,
      academyTrack: Boolean(player.academyTrack),
      departed: player.departedAt != null || player.status === 'DEPARTED',
    })),
  );
  if (!plan.retireId) return { ok: true, undo: null, farewell: null };

  const retiree = roster.find((player) => player.id === plan.retireId);
  const now = new Date().toISOString();
  const { error: leaveErr } = await serverDb(supabase)
    .from('players')
    .update({ status: 'DEPARTED', departed_at: now, starter: false } as never)
    .eq('id', plan.retireId)
    .eq('club_id', clubId)
    .is('departed_at', null);
  if (leaveErr) return { ok: false, error: 'Nie udało się zakończyć kariery zawodnika.' };

  const restoreRetiree = async () => {
    if (!retiree) return;
    const { error } = await serverDb(supabase)
      .from('players')
      .update({
        status: retiree.status,
        departed_at: null,
        starter: retiree.starter,
      } as never)
      .eq('id', retiree.id)
      .eq('club_id', clubId);
    if (error) console.error('applySeasonDeparture: restore failed', { code: error.code });
  };

  const undoBase = {
    clubId,
    retiree: retiree ? { id: retiree.id, status: retiree.status, starter: retiree.starter } : null,
  };
  const retireName = retiree?.name?.trim() || 'Zawodnik';

  if (plan.promoteId) {
    const prospect = roster.find((player) => player.id === plan.promoteId);
    const { error: promoteErr } = await serverDb(supabase)
      .from('players')
      .update({
        academy_track: false,
        promoted_at: now,
        starter: false,
        transfer_listed_at: null,
      } as never)
      .eq('id', plan.promoteId)
      .eq('club_id', clubId)
      .eq('academy_track', true)
      .is('departed_at', null);
    if (promoteErr) {
      await restoreRetiree();
      return { ok: false, error: 'Nie udało się wprowadzić zawodnika z akademii.' };
    }
    return {
      ok: true,
      undo: {
        ...undoBase,
        replacement: {
          kind: 'promote',
          id: plan.promoteId,
          starter: prospect ? prospect.starter : null,
        },
      },
      farewell: formatRetirementFarewell(retireName, prospect?.name ?? null),
    };
  }

  const { data: shirtRows, error: shirtErr } = await supabase
    .from('players')
    .select('shirt_number, departed_at')
    .eq('club_id', clubId);
  if (shirtErr || !shirtRows) {
    await restoreRetiree();
    return { ok: false, error: 'Nie udało się uzupełnić kadry.' };
  }
  // Numbers of departed players are free, but not the first choice.
  const departedShirts = (shirtRows as { shirt_number: number; departed_at: string | null }[])
    .filter((row) => row.departed_at != null)
    .map((row) => row.shirt_number);
  const draft = buildAcademyIntakeDraft(clubId, roster, seasonNumber, departedShirts);
  if ('error' in draft) {
    await restoreRetiree();
    return { ok: false, error: draft.error };
  }
  const { error: insertErr } = await serverDb(supabase)
    .from('players')
    .insert({
      id: draft.id,
      club_id: clubId,
      name: draft.name,
      shirt_number: draft.shirtNumber,
      pos: draft.pos,
      role: draft.role,
      starter: false,
      captain: false,
      age: draft.age,
      skill: draft.skill,
      potential: draft.potential,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      academy_track: false,
      promoted_at: now,
      // Home-grown as well: computer clubs pay by his senior matches (D134).
      origin: 'academy',
      joined_at: now,
      ...(agingIsMarked ? { aged_for_season: seasonNumber } : {}),
      transfer_listed_at: null,
    } as never);
  if (insertErr) {
    await restoreRetiree();
    return { ok: false, error: 'Nie udało się uzupełnić kadry.' };
  }
  return {
    ok: true,
    undo: {
      ...undoBase,
      replacement: { kind: 'insert', id: draft.id },
    },
    farewell: formatRetirementFarewell(retireName, draft.name),
  };
}

/** Every step runs; false when one of them failed. */
async function undoSeasonDeparture(
  supabase: SeasonDb,
  undo: SeasonDepartureUndo | null,
): Promise<boolean> {
  if (!undo) return true;
  let ok = true;

  if (undo.retiree) {
    const { error } = await serverDb(supabase)
      .from('players')
      .update({
        status: undo.retiree.status,
        departed_at: null,
        starter: undo.retiree.starter,
      } as never)
      .eq('id', undo.retiree.id)
      .eq('club_id', undo.clubId);
    if (error) ok = false;
  }

  if (undo.replacement.kind === 'promote') {
    const patch: {
      academy_track: true;
      promoted_at: null;
      starter?: boolean;
    } = {
      academy_track: true,
      promoted_at: null,
    };
    if (undo.replacement.starter !== null) patch.starter = undo.replacement.starter;
    const { error } = await serverDb(supabase)
      .from('players')
      .update(patch as never)
      .eq('id', undo.replacement.id)
      .eq('club_id', undo.clubId);
    return ok && !error;
  }

  const { error } = await serverDb(supabase)
    .from('players')
    .delete()
    .eq('id', undo.replacement.id)
    .eq('club_id', undo.clubId);
  return ok && !error;
}
