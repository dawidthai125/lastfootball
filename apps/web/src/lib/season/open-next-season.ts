import { buildAcademyIntakeDraft } from '@/lib/academy/intake';
import type { LeagueTier } from '@/lib/league/league-tier';
import {
  formatRetirementFarewell,
  planSeasonDeparture,
  type RetirementFarewell,
} from '@/lib/season/departure';
import { revertSeasonTransitionHAge, type HAgePlayersPort } from '@/lib/season/transition/h-age';
import type { SeasonAgePlayerSlice } from '@/lib/squad/season-age';
import type { PlayerRowDto, PlayerStatus } from '@/lib/squad/types';
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
 */
export type OpenNextSeasonOk = {
  readonly ok: true;
  readonly farewell: RetirementFarewell | null;
};

export async function openNextSeasonAfterDeparture(
  input: OpenNextSeasonInput,
): Promise<OpenNextSeasonOk | { ok: false; error: string }> {
  const departure = await applySeasonDeparture(
    input.supabase,
    input.clubId,
    input.endedSeason,
    input.loadRoster,
  );
  if (!departure.ok) {
    await revertSeasonTransitionHAge(input.clubId, input.hAgePort, input.hAgeSnapshot);
    return { ok: false, error: departure.error };
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
    await undoSeasonDeparture(input.supabase, departure.undo);
    await revertSeasonTransitionHAge(input.clubId, input.hAgePort, input.hAgeSnapshot);
    return { ok: false, error: 'Nie udało się otworzyć nowego sezonu.' };
  }

  return { ok: true, farewell: departure.farewell };
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
  loadRoster: (clubId: string) => Promise<readonly PlayerRowDto[]>,
): Promise<DepartureApplyOk | { ok: false; error: string }> {
  const roster = await loadRoster(clubId);
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
  const { error: leaveErr } = await supabase
    .from('players')
    .update({ status: 'DEPARTED', departed_at: now, starter: false } as never)
    .eq('id', plan.retireId)
    .eq('club_id', clubId)
    .is('departed_at', null);
  if (leaveErr) return { ok: false, error: 'Nie udało się zakończyć kariery zawodnika.' };

  const restoreRetiree = async () => {
    if (!retiree) return;
    await supabase
      .from('players')
      .update({
        status: retiree.status,
        departed_at: null,
        starter: retiree.starter,
      } as never)
      .eq('id', retiree.id)
      .eq('club_id', clubId);
  };

  const undoBase = {
    clubId,
    retiree: retiree ? { id: retiree.id, status: retiree.status, starter: retiree.starter } : null,
  };
  const retireName = retiree?.name?.trim() || 'Zawodnik';

  if (plan.promoteId) {
    const prospect = roster.find((player) => player.id === plan.promoteId);
    const { error: promoteErr } = await supabase
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
    .select('shirt_number')
    .eq('club_id', clubId);
  if (shirtErr || !shirtRows) {
    await restoreRetiree();
    return { ok: false, error: 'Nie udało się uzupełnić kadry.' };
  }
  const seen = new Set(roster.map((player) => player.shirtNumber));
  const blockers: PlayerRowDto[] = (shirtRows as { shirt_number: number | null }[])
    .map((shirt) => shirt.shirt_number)
    .filter((shirt): shirt is number => typeof shirt === 'number' && !seen.has(shirt))
    .map((shirt) => ({
      id: `shirt-${shirt}`,
      clubId,
      name: 'Numer',
      shirtNumber: shirt,
      pos: 'N',
      role: 'ST',
      starter: false,
      captain: false,
      age: 20,
      skill: 40,
      potential: 40,
      status: 'READY',
      nationality: 'POL',
      version: 1,
      departedAt: null,
      transferListedAt: null,
      academyTrack: false,
      promotedAt: null,
    }));
  const draft = buildAcademyIntakeDraft(clubId, [...roster, ...blockers], seasonNumber);
  if ('error' in draft) {
    await restoreRetiree();
    return { ok: false, error: draft.error };
  }
  const { error: insertErr } = await supabase.from('players').insert({
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

async function undoSeasonDeparture(
  supabase: SeasonDb,
  undo: SeasonDepartureUndo | null,
): Promise<void> {
  if (!undo) return;

  if (undo.retiree) {
    await supabase
      .from('players')
      .update({
        status: undo.retiree.status,
        departed_at: null,
        starter: undo.retiree.starter,
      } as never)
      .eq('id', undo.retiree.id)
      .eq('club_id', undo.clubId);
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
    await supabase
      .from('players')
      .update(patch as never)
      .eq('id', undo.replacement.id)
      .eq('club_id', undo.clubId);
    return;
  }

  await supabase.from('players').delete().eq('id', undo.replacement.id).eq('club_id', undo.clubId);
}
