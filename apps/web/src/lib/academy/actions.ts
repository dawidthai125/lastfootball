'use server';

import { serverDb, tryAdminClient } from '@/lib/supabase/admin';
import { revalidatePath } from 'next/cache';

import { env } from '@/config/env';
import {
  buildAcademyIntakeDraft,
  generateAcademyCandidates,
  intakeWaitDays,
  isAcademyId,
  canPromoteProspect,
} from '@/lib/academy/intake';
import {
  academyLevel,
  academyUpgrade,
  JUNIOR_MAX_AGE,
  JUNIOR_TRAINING,
} from '@/lib/academy/levels';
import { readAcademyLevel } from '@/lib/academy/read-level';
import { loadAcademyRecords } from '@/lib/academy/store';
import type { AcademyActionState } from '@/lib/academy/types';
import { getManagerClub } from '@/lib/club/get-manager-club';
import { CASH_STALE_ERROR, writeClubCash } from '@/lib/finance/club-cash';
import { listClubFixtures } from '@/lib/fixtures';
import { resolveHubPhase } from '@/lib/hub';
import { listClubPlayers } from '@/lib/squad/get-players';
import { isAcademyProspect, type PlayerRowDto } from '@/lib/squad/types';
import { createClient } from '@/lib/supabase/server';
import { isCoachGroup } from '@/lib/training/coach';

function revalidateAcademyPaths() {
  revalidatePath('/academy');
  revalidatePath('/squad');
  revalidatePath('/hub');
  revalidatePath('/training');
  revalidatePath('/transfers');
}

async function requireSeasonClub() {
  if (!env.isSupabaseConfigured) {
    return { error: 'Supabase nie jest skonfigurowany.' } as const;
  }
  const club = await getManagerClub();
  if (!club) return { error: 'Nie znaleziono klubu.' } as const;

  const fixtures = await listClubFixtures(club.id);
  const phase = resolveHubPhase(club, { hasFixtures: fixtures.length > 0 });
  if (phase !== 'SEASON' && phase !== 'PLAYOFF' && phase !== 'OFFSEASON') {
    return { error: 'Akademia odblokuje się w sezonie.' } as const;
  }
  return { club } as const;
}

type ManagedClub = NonNullable<Awaited<ReturnType<typeof getManagerClub>>>;

const NOT_SAVED = 'Nie udało się zapisać. Spróbuj ponownie.';

/** The academy before D134: one junior, straight in. Only while the migration is missing. */
async function intakeWithoutOffers(
  club: ManagedClub,
  rows: readonly PlayerRowDto[],
): Promise<AcademyActionState> {
  const supabase = await createClient();
  // Everyone who ever joined: numbers stay taken, and a promoted or sold junior still counts.
  const { data: everyone, error: historyErr } = await serverDb(supabase)
    .from('players')
    .select('id, shirt_number, created_at')
    .eq('club_id', club.id);
  if (historyErr) return { error: 'Nie udało się sprawdzić naboru.' };
  const history = (everyone ?? []) as { id: string; shirt_number: number; created_at: string }[];
  const wait = intakeWaitDays(
    history.filter((p) => isAcademyId(p.id, club.id)).map((p) => p.created_at),
    new Date(),
  );
  if (wait > 0) {
    return { error: `Następny nabór za ${wait} ${wait === 1 ? 'dzień' : 'dni'}.` };
  }
  const draft = buildAcademyIntakeDraft(
    club.id,
    rows,
    Date.now(),
    history.map((p) => p.shirt_number),
  );
  if ('error' in draft) return { error: draft.error };

  const { error } = await serverDb(supabase)
    .from('players')
    .insert({
      id: draft.id,
      club_id: club.id,
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
      academy_track: true,
      origin: 'academy',
      joined_at: new Date().toISOString(),
      promoted_at: null,
      transfer_listed_at: null,
    } as never);

  if (error) {
    return { error: 'Nie udało się przeprowadzić naboru.' };
  }

  revalidateAcademyPaths();
  return { ok: true, message: `${draft.name} dołączył do akademii.` };
}

/** Opens the next intake, or shows the open one again: the stored candidates never change. */
export async function intakeAcademyProspect(
  _prev: AcademyActionState,
  _formData: FormData,
): Promise<AcademyActionState> {
  void _prev;
  void _formData;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const rows = await listClubPlayers(club.id);
  const admin = tryAdminClient();
  if (!admin) return { error: 'Nabór nie jest skonfigurowany na serwerze.' };
  const records = await loadAcademyRecords(admin, club.id, new Date());
  if (records.status === 'missing') return intakeWithoutOffers(club, rows);
  if (records.status === 'error') return { error: 'Nie udało się sprawdzić naboru.' };
  if (records.open) {
    revalidateAcademyPaths();
    return { ok: true, message: 'Kandydaci czekają na decyzję.' };
  }
  if (rows.filter(isAcademyProspect).length >= academyLevel(records.level).slots) {
    return { error: 'Brak wolnego miejsca w akademii.' };
  }
  if (records.waitDays > 0) {
    return {
      error: `Następny nabór za ${records.waitDays} ${records.waitDays === 1 ? 'dzień' : 'dni'}.`,
    };
  }

  const seq = records.lastSeq + 1;
  const { data, error } = await admin.rpc(
    'open_academy_intake' as never,
    {
      p_club_id: club.id,
      p_seq: seq,
      p_candidates: generateAcademyCandidates(club.id, seq, records.level),
    } as never,
  );
  if (error || (data as { ok?: boolean } | null)?.ok !== true) {
    return { error: 'Nie udało się przeprowadzić naboru.' };
  }
  revalidateAcademyPaths();
  return { ok: true, message: 'Skauci pokazali kandydatów. Wybierz jednego.' };
}

const TAKE_ERRORS: Readonly<Record<string, string>> = {
  slots: 'Brak wolnego miejsca w akademii.',
  shirt: 'Brak wolnego numeru koszulki.',
  closed: 'Ten nabór jest już zamknięty.',
};

export async function takeAcademyCandidate(
  _prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;
  const seq = Number(formData.get('seq'));
  const index = Number(formData.get('index') ?? -1);
  if (!Number.isInteger(seq) || !Number.isInteger(index)) return { error: 'Brak kandydata.' };

  const admin = tryAdminClient();
  if (!admin) return { error: NOT_SAVED };
  const level = await readAcademyLevel(admin, club.id);
  if (level == null) return { error: NOT_SAVED };
  const { data, error } = await admin.rpc(
    'take_academy_candidate' as never,
    {
      p_club_id: club.id,
      p_seq: seq,
      p_index: index,
      p_slots: academyLevel(level).slots,
    } as never,
  );
  const row = data as { ok?: boolean; reason?: string; name?: string } | null;
  if (error || !row) return { error: NOT_SAVED };
  if (row.ok !== true) return { error: TAKE_ERRORS[row.reason ?? ''] ?? NOT_SAVED };
  revalidateAcademyPaths();
  return { ok: true, message: `${row.name ?? 'Junior'} dołączył do akademii.` };
}

/** Refuses all candidates. The next intake still waits its full time. */
export async function declineAcademyIntake(
  _prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const seq = Number(formData.get('seq'));
  if (!Number.isInteger(seq)) return { error: 'Brak naboru.' };
  const admin = tryAdminClient();
  if (!admin) return { error: NOT_SAVED };
  const { error } = await admin.rpc(
    'decline_academy_intake' as never,
    { p_club_id: gate.club.id, p_seq: seq } as never,
  );
  if (error) return { error: NOT_SAVED };
  revalidateAcademyPaths();
  return { ok: true, message: 'Nabór zamknięty bez wyboru.' };
}

export async function upgradeAcademy(
  _prev: AcademyActionState,
  _formData: FormData,
): Promise<AcademyActionState> {
  void _prev;
  void _formData;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;
  const supabase = await createClient();
  const level = await readAcademyLevel(supabase, club.id);
  if (level == null) return { error: 'Rozbudowa nie jest jeszcze włączona.' };
  const next = academyUpgrade({ level, cash: club.cashBalance });
  if (!next.ok) {
    return {
      error:
        next.reason === 'cash'
          ? 'Za mało środków w kasie.'
          : 'Akademia jest już na najwyższym poziomie.',
    };
  }
  const written = await writeClubCash({
    clubId: club.id,
    expected: club.cashBalance,
    next: next.cashAfter,
    extra: { academy_level: next.level },
  });
  if (written === 'stale') return { error: CASH_STALE_ERROR };
  if (written === 'error') return { error: 'Rozbudowa nie jest jeszcze włączona.' };
  await serverDb(supabase)
    .from('finance_movements')
    .insert({
      club_id: club.id,
      category: 'academy_build',
      label: `Akademia · poziom ${next.level}`,
      amount: -next.cost,
      fixture_id: null,
    } as never);
  revalidateAcademyPaths();
  revalidatePath('/finance');
  return { ok: true, message: `Akademia ma poziom ${next.level}.` };
}

const TRAIN_ERRORS: Readonly<Record<string, string>> = {
  group: 'Wybierz grupę.',
  today: 'Trening na dziś wykonany.',
  player: 'Nie znaleziono juniora.',
  age: 'Za stary na trening akademii.',
  season: 'Limit treningów w sezonie.',
  potential: 'Ta grupa jest już na suficie juniora.',
  cash: 'Za mało środków w kasie.',
};

/** One junior a UTC day, +1 in one group. Like individual training, it leaves skill alone. */
export async function trainAcademyJunior(
  _prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const playerId = String(formData.get('playerId') ?? '');
  const group = formData.get('group');
  if (!playerId || !isCoachGroup(group)) return { error: 'Wybierz juniora i grupę.' };
  const admin = tryAdminClient();
  if (!admin) return { error: NOT_SAVED };
  const { data, error } = await admin.rpc(
    'train_academy_junior' as never,
    {
      p_club_id: gate.club.id,
      p_player_id: playerId,
      p_group: group,
      p_cost: JUNIOR_TRAINING.COST,
      p_max_gain: JUNIOR_TRAINING.SEASON_GAIN,
      p_max_age: JUNIOR_MAX_AGE,
      p_label: 'Trening juniora',
    } as never,
  );
  const row = data as { ok?: boolean; reason?: string; name?: string; gain?: number } | null;
  if (error || !row) return { error: NOT_SAVED };
  if (row.ok !== true) return { error: TRAIN_ERRORS[row.reason ?? ''] ?? NOT_SAVED };
  revalidateAcademyPaths();
  revalidatePath('/finance');
  return {
    ok: true,
    message: `${row.name ?? 'Junior'} potrenował. Sezon: ${row.gain ?? 1}/${JUNIOR_TRAINING.SEASON_GAIN}.`,
  };
}

export async function promoteAcademyProspect(
  prev: AcademyActionState,
  formData: FormData,
): Promise<AcademyActionState> {
  void prev;
  const gate = await requireSeasonClub();
  if ('error' in gate) return { error: gate.error };
  const { club } = gate;

  const playerId = String(formData.get('playerId') ?? '');
  if (!playerId) return { error: 'Brak zawodnika.' };

  const rows = await listClubPlayers(club.id);
  const check = canPromoteProspect(rows, playerId, club.id);
  if (!check.ok) return { error: check.error };

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data, error } = await serverDb(supabase)
    .from('players')
    .update({
      academy_track: false,
      promoted_at: now,
      origin: 'academy',
      joined_at: now,
      starter: false,
      transfer_listed_at: null,
    } as never)
    .eq('id', playerId)
    .eq('club_id', club.id)
    .eq('academy_track', true)
    .is('departed_at', null)
    .select('id, name')
    .maybeSingle();

  if (error || !data) {
    return { error: 'Nie udało się wypromować zawodnika.' };
  }

  const name = (data as { name: string }).name;
  revalidateAcademyPaths();
  return { ok: true, message: `${name} trafił do kadry seniorów.` };
}
