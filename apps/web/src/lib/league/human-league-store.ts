import type { PitchRole } from '@lastfootball/lfe';

import { env } from '@/config/env';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import { seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { resolveStartingXi } from '@/lib/squad/resolve-club-squad';
import { SquadUnavailableError, type AttrGroups } from '@/lib/squad/types';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';

import {
  fillHumanSeats,
  humanFixtureMatchday,
  humanRoundFromFixture,
  isBotClubId,
  kickoffDate,
  kickoffWindowSentence,
  kickoffWindowState,
  nextHumanRound,
  pairingForClub,
  sharedHumanSeed,
  type HumanPairing,
  type HumanSeat,
} from './human-league';
import { finishSharedSession } from './human-play';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping, energy, form, wage, suspension_matches, recent_ratings';

const PLAYER_SELECT_LEGACY =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at';

export type HumanLeagueCard = {
  readonly seats: readonly { slot: number; name: string; kind: 'human' | 'bot'; yours: boolean }[];
  readonly round: number | null;
  readonly opponentName: string | null;
  readonly windowSentence: string | null;
  readonly fixtureId: string | null;
  readonly note: string | null;
};

type BroadcastRow = {
  id: string;
  matchday: number;
  home_id: string;
  away_id: string;
  home_name: string;
  away_name: string;
  home_short: string;
  away_short: string;
  seed: string;
  kickoff_on: string;
  home_xi: Json | null;
  away_xi: Json | null;
  home_score: number | null;
  away_score: number | null;
  locked_at: string | null;
};

type SeatTable = {
  readonly seasonKey: string;
  readonly frozen: boolean;
  readonly seats: readonly HumanSeat[];
};

function bots() {
  return OPPONENT_CATALOG.map((bot) => ({
    id: bot.id,
    name: bot.name,
    shortName: bot.shortName,
  }));
}

function missingRelation(error: { code?: string; message?: string } | null): boolean {
  if (!error) return false;
  return (
    error.code === '42P01' ||
    error.code === 'PGRST205' ||
    /human_league|human_broadcasts|schema cache/i.test(error.message ?? '')
  );
}

function previewCard(club: ClubDto, note: string): HumanLeagueCard {
  const seats = fillHumanSeats(
    [{ id: club.id, name: club.name, shortName: club.shortName, createdAt: club.createdAt }],
    bots(),
  );
  const pair = pairingForClub(seats, 1, club.id);
  const opponent = pair ? (pair.home.id === club.id ? pair.away : pair.home) : null;
  return {
    seats: seats.map((seat) => ({
      slot: seat.slot,
      name: seat.name,
      kind: seat.kind,
      yours: seat.id === club.id,
    })),
    round: 1,
    opponentName: opponent?.name ?? null,
    windowSentence: 'Wspólny początek o 18:00 czasu warszawskiego.',
    fixtureId: null,
    note,
  };
}

async function ensureSeatTable(now: Date): Promise<SeatTable | 'missing' | null> {
  if (!env.isSupabaseConfigured || !env.supabaseServiceRoleKey) return null;
  const admin = createAdminClient();
  const existing = await admin
    .from('human_league')
    .select('season_key, frozen')
    .eq('id', 1)
    .maybeSingle();
  if (missingRelation(existing.error)) return 'missing';
  if (existing.error) return null;

  let seasonKey = existing.data?.season_key;
  let frozen = existing.data?.frozen ?? false;
  if (!seasonKey) {
    seasonKey = warsawDateKey(now);
    const inserted = await admin.from('human_league').insert({
      id: 1,
      season_key: seasonKey,
      frozen: false,
    });
    if (missingRelation(inserted.error)) return 'missing';
    if (inserted.error) {
      const again = await admin
        .from('human_league')
        .select('season_key, frozen')
        .eq('id', 1)
        .maybeSingle();
      if (!again.data) return null;
      seasonKey = again.data.season_key;
      frozen = again.data.frozen;
    }
  }

  if (!frozen) {
    const clubs = await admin
      .from('clubs')
      .select('id, name, short_name, created_at')
      .order('created_at', { ascending: true });
    if (clubs.error || !clubs.data) return null;
    const seats = fillHumanSeats(
      clubs.data.map((row) => ({
        id: row.id,
        name: row.name,
        shortName: row.short_name,
        createdAt: row.created_at,
      })),
      bots(),
    );
    await admin.from('human_league_seats').delete().gte('slot', 0);
    const saved = await admin.from('human_league_seats').insert(
      seats.map((seat) => ({
        slot: seat.slot,
        kind: seat.kind,
        ref_id: seat.id,
        display_name: seat.name,
        short_name: seat.shortName,
      })),
    );
    if (saved.error) return null;
    return { seasonKey, frozen: false, seats };
  }

  const seatRows = await admin
    .from('human_league_seats')
    .select('slot, kind, ref_id, display_name, short_name')
    .order('slot', { ascending: true });
  if (seatRows.error || !seatRows.data || seatRows.data.length !== 12) return null;
  return {
    seasonKey,
    frozen: true,
    seats: seatRows.data.map((row) => ({
      slot: row.slot,
      kind: row.kind === 'human' ? 'human' : 'bot',
      id: row.ref_id,
      name: row.display_name,
      shortName: row.short_name,
    })),
  };
}

function isGroups(value: unknown): value is AttrGroups {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.attack === 'number' &&
    typeof row.passing === 'number' &&
    typeof row.defense === 'number' &&
    typeof row.physical === 'number' &&
    typeof row.goalkeeping === 'number'
  );
}

function parseXi(value: Json | null): RosterPlayerSeed[] | null {
  if (!Array.isArray(value) || value.length !== 11) return null;
  const rows: RosterPlayerSeed[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
    const row = item as Record<string, Json | undefined>;
    if (
      typeof row.id !== 'string' ||
      typeof row.name !== 'string' ||
      typeof row.skill !== 'number'
    ) {
      return null;
    }
    rows.push({
      id: row.id,
      name: row.name,
      number: typeof row.number === 'number' ? row.number : 0,
      pos: typeof row.pos === 'string' ? row.pos : 'ŚP',
      role: (typeof row.role === 'string' ? row.role : 'CM') as PitchRole,
      starter: true,
      captain: row.captain === true,
      skill: row.skill,
      groups: isGroups(row.groups) ? row.groups : undefined,
      energy: typeof row.energy === 'number' ? row.energy : undefined,
      form: typeof row.form === 'number' ? row.form : undefined,
    });
  }
  return rows;
}

async function snapshotXi(
  clubId: string,
): Promise<readonly RosterPlayerSeed[] | { error: string }> {
  const admin = createAdminClient();
  const full = await admin
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null);
  const result = full.error
    ? await admin
        .from('players')
        .select(PLAYER_SELECT_LEGACY)
        .eq('club_id', clubId)
        .is('departed_at', null)
    : full;
  if (result.error || !result.data) return { error: 'Nie mogę odczytać składu.' };
  try {
    return resolveStartingXi((result.data as PlayerDbRow[]).map(mapPlayerRow));
  } catch (error: unknown) {
    if (error instanceof SquadUnavailableError) return { error: error.message };
    throw error;
  }
}

function sideXi(
  seat: HumanSeat,
  stored: Json | null,
): readonly RosterPlayerSeed[] | { error: string } {
  if (isBotClubId(seat.id)) return [...seedOpponentSquad(seat.id, 'iv')];
  const parsed = parseXi(stored);
  if (!parsed) return { error: `${seat.name} nie ma zamkniętej jedenastki.` };
  return parsed;
}

async function readBroadcast(pair: HumanPairing): Promise<BroadcastRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('human_broadcasts')
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at',
    )
    .eq('matchday', pair.matchday)
    .eq('home_id', pair.home.id)
    .eq('away_id', pair.away.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as BroadcastRow;
}

async function lockBroadcast(
  table: SeatTable,
  pair: HumanPairing,
  now: Date,
): Promise<BroadcastRow | { error: string }> {
  const existing = await readBroadcast(pair);
  if (existing?.locked_at) return existing;

  const homeSnap = isBotClubId(pair.home.id) ? null : await snapshotXi(pair.home.id);
  const awaySnap = isBotClubId(pair.away.id) ? null : await snapshotXi(pair.away.id);
  if (homeSnap && 'error' in homeSnap) return homeSnap;
  if (awaySnap && 'error' in awaySnap) return awaySnap;

  const admin = createAdminClient();
  const payload = {
    matchday: pair.matchday,
    home_id: pair.home.id,
    away_id: pair.away.id,
    home_name: pair.home.name,
    away_name: pair.away.name,
    home_short: pair.home.shortName,
    away_short: pair.away.shortName,
    seed: String(sharedHumanSeed(table.seasonKey, pair.matchday, pair.home.id, pair.away.id)),
    kickoff_on: kickoffDate(table.seasonKey, pair.matchday),
    home_xi: (homeSnap ?? null) as Json | null,
    away_xi: (awaySnap ?? null) as Json | null,
    locked_at: now.toISOString(),
  };

  if (existing) {
    const updated = await admin
      .from('human_broadcasts')
      .update(payload)
      .eq('id', existing.id)
      .select(
        'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at',
      )
      .maybeSingle();
    if (updated.error || !updated.data) return { error: 'Nie udało się zamknąć składów.' };
    await admin.from('human_league').update({ frozen: true }).eq('id', 1);
    return updated.data as BroadcastRow;
  }

  const inserted = await admin
    .from('human_broadcasts')
    .insert(payload)
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at',
    )
    .maybeSingle();
  if (inserted.error || !inserted.data) {
    const raced = await readBroadcast(pair);
    if (raced) return raced;
    return { error: 'Nie udało się zapisać meczu ligi ludzi.' };
  }
  await admin.from('human_league').update({ frozen: true }).eq('id', 1);
  return inserted.data as BroadcastRow;
}

async function ensureFixture(input: {
  clubId: string;
  opponentId: string;
  isHome: boolean;
  round: number;
}): Promise<string | null> {
  if (isBotClubId(input.clubId)) return null;
  const admin = createAdminClient();
  const matchday = humanFixtureMatchday(input.round);
  const existing = await admin
    .from('fixtures')
    .select('id, status')
    .eq('club_id', input.clubId)
    .eq('matchday', matchday)
    .maybeSingle();
  if (existing.data) {
    if (existing.data.status === 'scheduled') {
      await admin
        .from('fixtures')
        .update({ status: 'upcoming' })
        .eq('id', existing.data.id)
        .eq('status', 'scheduled');
    }
    return existing.data.id;
  }
  const inserted = await admin
    .from('fixtures')
    .insert({
      club_id: input.clubId,
      matchday,
      competition: 'human',
      opponent_club_id: input.opponentId,
      is_home: input.isHome,
      status: 'upcoming',
    })
    .select('id')
    .maybeSingle();
  return inserted.data?.id ?? null;
}

function cardFrom(
  club: ClubDto,
  table: SeatTable,
  extra: Partial<HumanLeagueCard>,
): HumanLeagueCard {
  return {
    seats: table.seats.map((seat) => ({
      slot: seat.slot,
      name: seat.name,
      kind: seat.kind,
      yours: seat.id === club.id,
    })),
    round: extra.round ?? null,
    opponentName: extra.opponentName ?? null,
    windowSentence: extra.windowSentence ?? null,
    fixtureId: extra.fixtureId ?? null,
    note: extra.note ?? null,
  };
}

export async function loadHumanLeagueCard(
  club: ClubDto,
  now = new Date(),
): Promise<HumanLeagueCard> {
  const table = await ensureSeatTable(now);
  if (table === null || table === 'missing') {
    return previewCard(
      club,
      table === 'missing'
        ? 'Tabela ligi ludzi nie jest jeszcze na bazie.'
        : 'Liga ludzi włączy się, gdy baza przyjmie migrację.',
    );
  }

  const mine = table.seats.find((seat) => seat.id === club.id);
  if (!mine) {
    return cardFrom(club, table, {
      note: 'Liga ludzi ma już 12 klubów. Wchodzisz, gdy zwolni się miejsce.',
    });
  }

  const admin = createAdminClient();
  const playedRows = await admin
    .from('fixtures')
    .select('matchday, status, played_at')
    .eq('club_id', club.id)
    .eq('competition', 'human');
  const rows = playedRows.data ?? [];
  const playedRounds = rows
    .filter((row) => row.status === 'played')
    .map((row) => humanRoundFromFixture(row.matchday))
    .filter((round): round is number => round != null);
  const today = warsawDateKey(now);
  const playedHumanToday = rows.some(
    (row) =>
      row.status === 'played' && row.played_at && warsawDateKey(new Date(row.played_at)) === today,
  );
  const round = nextHumanRound({
    seasonKey: table.seasonKey,
    playedRounds,
    now,
    playedHumanToday,
  });
  if (!round) {
    return cardFrom(club, table, {
      note: playedHumanToday
        ? 'Kolejka ludzi na dziś już rozegrana.'
        : 'Sezon ligi ludzi nie ma teraz meczu do rozegrania.',
    });
  }

  const pair = pairingForClub(table.seats, round, club.id);
  if (!pair) return cardFrom(club, table, { round, note: 'Brak pary na tę kolejkę.' });
  const opponent = pair.home.id === club.id ? pair.away : pair.home;
  const window = kickoffWindowState(now, kickoffDate(table.seasonKey, round));
  if (window === 'before') {
    return cardFrom(club, table, {
      round,
      opponentName: opponent.name,
      windowSentence: kickoffWindowSentence(window),
      note: 'Składy zamykają się o 18:00. Do tego czasu nowy klub może zająć miejsce bota.',
    });
  }

  const locked = await lockBroadcast(table, pair, now);
  if ('error' in locked) {
    return cardFrom(club, table, {
      round,
      opponentName: opponent.name,
      windowSentence: kickoffWindowSentence(window),
      note: locked.error,
    });
  }
  const fixtureId = await ensureFixture({
    clubId: club.id,
    opponentId: opponent.id,
    isHome: pair.home.id === club.id,
    round,
  });
  await ensureFixture({
    clubId: opponent.id,
    opponentId: club.id,
    isHome: pair.home.id === opponent.id,
    round,
  });
  return cardFrom(club, table, {
    round,
    opponentName: opponent.name,
    windowSentence: kickoffWindowSentence(window),
    fixtureId,
  });
}

export type HumanLiveReady = {
  readonly fixture: FixtureDto;
  readonly ourXi: readonly RosterPlayerSeed[];
  readonly theirXi: readonly RosterPlayerSeed[];
  readonly block: string | null;
};

export async function prepareHumanLive(
  club: ClubDto,
  dto: FixtureDto,
  now = new Date(),
): Promise<HumanLiveReady> {
  const blocked = (block: string): HumanLiveReady => ({
    fixture: dto,
    ourXi: [],
    theirXi: [],
    block,
  });
  const round = humanRoundFromFixture(dto.matchday);
  if (!round) return blocked('To nie jest mecz ligi ludzi.');
  const table = await ensureSeatTable(now);
  if (table === null || table === 'missing') {
    return blocked('Liga ludzi nie jest jeszcze włączona na bazie.');
  }
  const pair = pairingForClub(table.seats, round, club.id);
  if (!pair) return blocked('Nie ma Cię w tej kolejce ligi ludzi.');
  const window = kickoffWindowState(now, kickoffDate(table.seasonKey, round));
  if (window === 'before') {
    return blocked(
      kickoffWindowSentence(window) ?? 'Wspólny początek o 18:00 czasu warszawskiego.',
    );
  }
  const locked = await lockBroadcast(table, pair, now);
  if ('error' in locked) return blocked(locked.error);

  const homeXi = sideXi(pair.home, locked.home_xi);
  const awayXi = sideXi(pair.away, locked.away_xi);
  if ('error' in homeXi) return blocked(homeXi.error);
  if ('error' in awayXi) return blocked(awayXi.error);
  const isHome = pair.home.id === club.id;
  const opponent = isHome ? pair.away : pair.home;
  return {
    block: null,
    ourXi: isHome ? homeXi : awayXi,
    theirXi: isHome ? awayXi : homeXi,
    fixture: {
      ...dto,
      isHome,
      opponentClubId: opponent.id,
      opponent: { id: opponent.id, name: opponent.name, shortName: opponent.shortName },
      sharedSeed: Number(locked.seed),
    },
  };
}

async function homePitchLevel(
  admin: ReturnType<typeof createAdminClient>,
  homeId: string,
): Promise<number> {
  if (isBotClubId(homeId)) return 0;
  const row = await admin.from('clubs').select('pitch_level').eq('id', homeId).maybeSingle();
  if (row.error || !row.data) return 0;
  const level = (row.data as { pitch_level?: number }).pitch_level;
  if (typeof level !== 'number' || !Number.isFinite(level)) return 0;
  return Math.max(0, Math.min(3, Math.trunc(level)));
}

async function homeStylePressing(
  admin: ReturnType<typeof createAdminClient>,
  homeId: string,
): Promise<number> {
  if (isBotClubId(homeId)) return 0;
  const row = await admin.from('clubs').select('style_pressing').eq('id', homeId).maybeSingle();
  if (row.error || !row.data) return 0;
  const points = (row.data as { style_pressing?: number }).style_pressing;
  if (typeof points !== 'number' || !Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(8, Math.trunc(points)));
}

async function homeStyleTempo(
  admin: ReturnType<typeof createAdminClient>,
  homeId: string,
): Promise<number> {
  if (isBotClubId(homeId)) return 0;
  const row = await admin.from('clubs').select('style_tempo').eq('id', homeId).maybeSingle();
  if (row.error || !row.data) return 0;
  const points = (row.data as { style_tempo?: number }).style_tempo;
  if (typeof points !== 'number' || !Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(8, Math.trunc(points)));
}

async function homeStyleWidth(
  admin: ReturnType<typeof createAdminClient>,
  homeId: string,
): Promise<number> {
  if (isBotClubId(homeId)) return 0;
  const row = await admin.from('clubs').select('style_width').eq('id', homeId).maybeSingle();
  if (row.error || !row.data) return 0;
  const points = (row.data as { style_width?: number }).style_width;
  if (typeof points !== 'number' || !Number.isFinite(points)) return 0;
  return Math.max(0, Math.min(8, Math.trunc(points)));
}

export async function authoritativeHumanScore(
  clubId: string,
  fixtureMatchday: number,
): Promise<{ home: number; away: number } | { error: string }> {
  const round = humanRoundFromFixture(fixtureMatchday);
  if (!round) return { error: 'To nie jest mecz ligi ludzi.' };
  if (!env.supabaseServiceRoleKey) return { error: 'Brak zapisu wyniku ligi ludzi.' };
  const admin = createAdminClient();
  const found = await admin
    .from('human_broadcasts')
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at',
    )
    .eq('matchday', round)
    .or(`home_id.eq.${clubId},away_id.eq.${clubId}`)
    .maybeSingle();
  if (found.error || !found.data) return { error: 'Nie ma wspólnego meczu do zapisania.' };
  const broadcast = found.data as BroadcastRow;
  if (broadcast.home_score != null && broadcast.away_score != null) {
    return { home: broadcast.home_score, away: broadcast.away_score };
  }
  if (!broadcast.locked_at) return { error: 'Składy tej kolejki nie są jeszcze zamknięte.' };

  const homeSeat: HumanSeat = {
    slot: 0,
    kind: isBotClubId(broadcast.home_id) ? 'bot' : 'human',
    id: broadcast.home_id,
    name: broadcast.home_name,
    shortName: broadcast.home_short,
  };
  const awaySeat: HumanSeat = {
    slot: 1,
    kind: isBotClubId(broadcast.away_id) ? 'bot' : 'human',
    id: broadcast.away_id,
    name: broadcast.away_name,
    shortName: broadcast.away_short,
  };
  const homeXi = sideXi(homeSeat, broadcast.home_xi);
  const awayXi = sideXi(awaySeat, broadcast.away_xi);
  if ('error' in homeXi) return homeXi;
  if ('error' in awayXi) return awayXi;

  const session = createSessionFromLeagueFixture(
    {
      id: broadcast.home_id,
      ownerId: '',
      name: broadcast.home_name,
      shortName: broadcast.home_short,
      primaryColor: '#111',
      secondaryColor: '#eee',
      crestTemplateId: 'crest',
      createdAt: broadcast.kickoff_on,
      firstMatchCompletedAt: broadcast.kickoff_on,
      cashBalance: 0,
      transferWindowOpen: false,
      lastTrainingOn: null,
      seasonNumber: 1,
      seasonPhase: 'in_season',
      leagueTier: 'iv',
    },
    {
      id: broadcast.id,
      clubId: broadcast.home_id,
      matchday: humanFixtureMatchday(round),
      competition: 'human',
      opponentClubId: broadcast.away_id,
      opponent: {
        id: broadcast.away_id,
        name: broadcast.away_name,
        shortName: broadcast.away_short,
      },
      isHome: true,
      status: 'upcoming',
      homeScore: null,
      awayScore: null,
      playedAt: null,
      createdAt: broadcast.kickoff_on,
      sharedSeed: Number(broadcast.seed),
      homePitchLevel: await homePitchLevel(admin, broadcast.home_id),
      homeStylePressing: await homeStylePressing(admin, broadcast.home_id),
      homeStyleTempo: await homeStyleTempo(admin, broadcast.home_id),
      homeStyleWidth: await homeStyleWidth(admin, broadcast.home_id),
    },
    homeXi,
    [],
    '4-4-2',
    awayXi,
  );
  const played = finishSharedSession(session);
  session.dispose();
  const saved = await admin
    .from('human_broadcasts')
    .update({ home_score: played.home, away_score: played.away })
    .eq('id', broadcast.id)
    .is('home_score', null)
    .select('home_score, away_score')
    .maybeSingle();
  if (saved.data?.home_score != null && saved.data.away_score != null) {
    return { home: saved.data.home_score, away: saved.data.away_score };
  }
  const again = await admin
    .from('human_broadcasts')
    .select('home_score, away_score')
    .eq('id', broadcast.id)
    .maybeSingle();
  if (again.data?.home_score != null && again.data?.away_score != null) {
    return { home: again.data.home_score, away: again.data.away_score };
  }
  return { home: played.home, away: played.away };
}
