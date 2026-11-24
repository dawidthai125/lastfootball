import { lineupProblem, repairLineup } from '@/lib/squad/lineup-problem';
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
  dueHumanSeasonKey,
  HUMAN_ACTIVE_DAYS,
  HUMAN_ROUND_COUNT,
  humanFixtureMatchday,
  humanSeasonFromFixture,
  nextHumanSeasonStart,
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
import {
  resolveHumanTable,
  settleMissing,
  type HumanResult,
  type HumanTableRow,
} from '@/lib/league/human-table';
import { parseHomeSetup, type HumanHomeSetup } from '@/lib/league/human-home-setup';
import { finishSharedSession } from './human-play';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping, energy, energy_on, form, wage, suspension_matches, injury_matches, recent_ratings';

const PLAYER_SELECT_LEGACY =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at';

export type HumanLeagueCard = {
  readonly seats: readonly { slot: number; name: string; kind: 'human' | 'bot'; yours: boolean }[];
  readonly round: number | null;
  readonly opponentName: string | null;
  readonly windowSentence: string | null;
  /** The shared window is over; the round can still be caught up. */
  readonly late: boolean;
  readonly fixtureId: string | null;
  readonly note: string | null;
  readonly season: number;
  /** Warsaw date when the next season may start. */
  readonly nextSeasonOn: string | null;
  readonly standings: readonly HumanTableRow[];
  readonly lastSeason: {
    readonly season: number;
    readonly champion: string;
    readonly place: number | null;
  } | null;
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
  home_setup: Json | null;
};

type SeatTable = {
  readonly seasonKey: string;
  readonly season: number;
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
    late: false,
    fixtureId: null,
    note,
    season: 1,
    nextSeasonOn: null,
    standings: [],
    lastSeason: null,
  };
}

async function readSeats(): Promise<HumanSeat[] | null> {
  const { data, error } = await createAdminClient()
    .from('human_league_seats')
    .select('slot, kind, ref_id, display_name, short_name')
    .order('slot', { ascending: true });
  if (error || !data || data.length !== 12) return null;
  return data.map((row) => ({
    slot: row.slot,
    kind: row.kind === 'human' ? 'human' : 'bot',
    id: row.ref_id,
    name: row.display_name,
    shortName: row.short_name,
  }));
}

/** Table of a season that closes now, with every missing match decided. Null = no seats to read. */
async function finalStandings(
  season: number,
  seasonKey: string,
  now: Date,
): Promise<readonly HumanTableRow[] | null> {
  const seats = await readSeats();
  if (!seats) return null;
  const results = await seasonResults(season);
  const missing = settleMissing({ seats, seasonKey, results });
  return resolveHumanTable({ seats, seasonKey, results: [...results, ...missing], now });
}

/** The season before this one, for the card. */
async function lastSeason(season: number, clubId: string): Promise<HumanLeagueCard['lastSeason']> {
  if (season < 2) return null;
  const { data } = await createAdminClient()
    .from('human_league_history')
    .select('season, standings')
    .eq('season', season - 1)
    .maybeSingle();
  const rows = data?.standings as unknown as HumanTableRow[] | undefined;
  if (!Array.isArray(rows) || !rows[0]) return null;
  const place = rows.findIndex((row) => row.id === clubId) + 1;
  return { season: season - 1, champion: rows[0].name, place: place > 0 ? place : null };
}

async function ensureSeatTable(now: Date): Promise<SeatTable | 'missing' | null> {
  if (!env.isSupabaseConfigured || !env.supabaseServiceRoleKey) return null;
  const admin = createAdminClient();
  const existing = await admin
    .from('human_league')
    .select('season_key, season_number, frozen')
    .eq('id', 1)
    .maybeSingle();
  if (missingRelation(existing.error)) return 'missing';
  if (existing.error) return null;

  let seasonKey = existing.data?.season_key;
  let season = existing.data?.season_number ?? 1;
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
        .select('season_key, season_number, frozen')
        .eq('id', 1)
        .maybeSingle();
      if (!again.data) return null;
      seasonKey = again.data.season_key;
      season = again.data.season_number;
      frozen = again.data.frozen;
    }
  }

  const nextKey = dueHumanSeasonKey(seasonKey, now);
  if (nextKey) {
    const rolled = await admin.rpc(
      'close_human_season' as never,
      {
        p_season: season,
        p_key: nextKey,
        p_standings: await finalStandings(season, seasonKey, now),
      } as never,
    );
    // Next remembers equal reads while it renders one page, so the call itself returns the state.
    const state = rolled.data as unknown as {
      season_key: string;
      season_number: number;
      frozen: boolean;
    } | null;
    if (rolled.error || !state) return null;
    ({ season_key: seasonKey, season_number: season, frozen } = state);
  }

  if (!frozen) {
    const since = new Date(now.getTime() - HUMAN_ACTIVE_DAYS * 86_400_000).toISOString();
    const clubs = await admin.rpc('human_league_clubs' as never, { p_since: since } as never);
    const rows = clubs.data as
      { id: string; name: string; short_name: string; created_at: string }[] | null;
    if (clubs.error || !rows) return null;
    const seats = fillHumanSeats(
      rows.map((row) => ({
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
    return { seasonKey, season, frozen: false, seats };
  }

  const seats = await readSeats();
  return seats ? { seasonKey, season, frozen: true, seats } : null;
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
      setPiece: row.setPiece === true || undefined,
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
  // The account was deleted: its seat plays on like a bot until the season ends.
  if (result.data.length === 0) return [...seedOpponentSquad(clubId, 'iv')];
  try {
    // A rival's injured starter must not cancel the match for both clubs.
    const rows = repairLineup(
      clubId,
      (result.data as PlayerDbRow[]).map((row) => mapPlayerRow(row)),
    );
    const xi = resolveStartingXi(rows);
    const problem = lineupProblem(clubId, rows);
    return problem ? { error: problem } : xi;
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

async function readBroadcast(season: number, pair: HumanPairing): Promise<BroadcastRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from('human_broadcasts')
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup',
    )
    .eq('season', season)
    .eq('matchday', pair.matchday)
    .eq('home_id', pair.home.id)
    .eq('away_id', pair.away.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as BroadcastRow;
}

/** Everything of the home club that the match uses besides its line-up. */
async function readHomeSetup(homeId: string): Promise<HumanHomeSetup> {
  if (isBotClubId(homeId)) return parseHomeSetup(null);
  const { data } = await createAdminClient()
    .from('clubs')
    .select('pitch_level, style_pressing, style_tempo, style_width, press_line, press_shape')
    .eq('id', homeId)
    .maybeSingle();
  const row = data as Record<string, unknown> | null;
  return parseHomeSetup(
    row && {
      homePitchLevel: row.pitch_level,
      homeStylePressing: row.style_pressing,
      homeStyleTempo: row.style_tempo,
      homeStyleWidth: row.style_width,
      homePressLine: row.press_line,
      homePressShape: row.press_shape,
    },
  );
}

/** A broadcast locked before the column existed reads the club as it is now. */
async function setupOf(broadcast: BroadcastRow): Promise<HumanHomeSetup> {
  return broadcast.home_setup
    ? parseHomeSetup(broadcast.home_setup)
    : readHomeSetup(broadcast.home_id);
}

/** Only its own season: a late request must not close the seats of the next one. */
async function freezeSeats(season: number): Promise<void> {
  await createAdminClient()
    .from('human_league')
    .update({ frozen: true })
    .eq('id', 1)
    .eq('season_number', season);
}

async function lockBroadcast(
  table: SeatTable,
  pair: HumanPairing,
  now: Date,
): Promise<BroadcastRow | { error: string }> {
  const existing = await readBroadcast(table.season, pair);
  if (existing?.locked_at) return existing;

  const homeSnap = isBotClubId(pair.home.id) ? null : await snapshotXi(pair.home.id);
  const awaySnap = isBotClubId(pair.away.id) ? null : await snapshotXi(pair.away.id);
  if (homeSnap && 'error' in homeSnap) return homeSnap;
  if (awaySnap && 'error' in awaySnap) return awaySnap;

  const admin = createAdminClient();
  const payload = {
    season: table.season,
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
    home_setup: await readHomeSetup(pair.home.id),
    locked_at: now.toISOString(),
  };

  if (existing) {
    const updated = await admin
      .from('human_broadcasts')
      .update(payload)
      .eq('id', existing.id)
      .select(
        'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup',
      )
      .maybeSingle();
    if (updated.error || !updated.data) return { error: 'Nie udało się zamknąć składów.' };
    await freezeSeats(table.season);
    return updated.data as BroadcastRow;
  }

  const inserted = await admin
    .from('human_broadcasts')
    .insert(payload)
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup',
    )
    .maybeSingle();
  if (inserted.error || !inserted.data) {
    const raced = await readBroadcast(table.season, pair);
    if (raced) return raced;
    return { error: 'Nie udało się zapisać meczu ligi ludzi.' };
  }
  await freezeSeats(table.season);
  return inserted.data as BroadcastRow;
}

async function ensureFixture(input: {
  clubId: string;
  opponentId: string;
  isHome: boolean;
  season: number;
  round: number;
}): Promise<string | null> {
  if (isBotClubId(input.clubId)) return null;
  const admin = createAdminClient();
  const matchday = humanFixtureMatchday(input.round, input.season);
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

function dayLabel(date: string): string {
  const [, month, day] = date.split('-');
  return `${day}.${month}`;
}

/** Scores somebody already played, for the standings. */
async function seasonResults(season: number): Promise<HumanResult[]> {
  const { data, error } = await createAdminClient()
    .from('human_broadcasts')
    .select('matchday, home_id, away_id, home_score, away_score')
    .eq('season', season)
    .not('home_score', 'is', null);
  if (error || !data) return [];
  return data.flatMap((row) =>
    row.home_score == null || row.away_score == null
      ? []
      : [
          {
            round: row.matchday,
            homeId: row.home_id,
            awayId: row.away_id,
            homeScore: row.home_score,
            awayScore: row.away_score,
          },
        ],
  );
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
    late: extra.late ?? false,
    fixtureId: extra.fixtureId ?? null,
    note: extra.note ?? null,
    season: table.season,
    nextSeasonOn: nextHumanSeasonStart(table.seasonKey),
    standings: extra.standings ?? [],
    lastSeason: extra.lastSeason ?? null,
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

  const standings = resolveHumanTable({
    seats: table.seats,
    seasonKey: table.seasonKey,
    results: await seasonResults(table.season),
    now,
  });
  const previous = await lastSeason(table.season, club.id);
  const card = (extra: Partial<HumanLeagueCard>) =>
    cardFrom(club, table, { standings, lastSeason: previous, ...extra });

  const mine = table.seats.find((seat) => seat.id === club.id);
  if (!mine) {
    return card({
      note: !table.frozen
        ? 'Miejsce dostaje klub, który grał albo trenował w ostatnich 14 dniach. Zagraj mecz przed 18:00 pierwszej kolejki, a zajmiesz wolne miejsce.'
        : table.seats.some((seat) => seat.kind === 'bot')
          ? `Miejsca w tym sezonie są zamknięte. Wejdziesz w nowym sezonie, od ${dayLabel(nextHumanSeasonStart(table.seasonKey))}.`
          : 'Liga ludzi ma już 12 klubów. Wchodzisz, gdy zwolni się miejsce.',
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
    .filter(
      (row) => row.status === 'played' && humanSeasonFromFixture(row.matchday) === table.season,
    )
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
    return card({
      note: playedHumanToday
        ? 'Kolejka ludzi na dziś już rozegrana.'
        : today > kickoffDate(table.seasonKey, HUMAN_ROUND_COUNT)
          ? `Sezon ${table.season} rozegrany. Nowy sezon od ${dayLabel(nextHumanSeasonStart(table.seasonKey))}, wolne miejsca biorą nowe kluby.`
          : 'Sezon ligi ludzi nie ma teraz meczu do rozegrania.',
    });
  }

  const pair = pairingForClub(table.seats, round, club.id);
  if (!pair) return card({ round, note: 'Brak pary na tę kolejkę.' });
  const opponent = pair.home.id === club.id ? pair.away : pair.home;
  const window = kickoffWindowState(now, kickoffDate(table.seasonKey, round));
  if (window === 'before') {
    return card({
      round,
      opponentName: opponent.name,
      windowSentence: kickoffWindowSentence(window),
      note: 'Składy zamykają się o 18:00. Do tego czasu nowy klub może zająć miejsce bota.',
    });
  }

  const locked = await lockBroadcast(table, pair, now);
  if ('error' in locked) {
    return card({
      round,
      opponentName: opponent.name,
      windowSentence: null,
      note: locked.error,
    });
  }
  const fixtureId = await ensureFixture({
    clubId: club.id,
    opponentId: opponent.id,
    isHome: pair.home.id === club.id,
    season: table.season,
    round,
  });
  await ensureFixture({
    clubId: opponent.id,
    opponentId: club.id,
    isHome: pair.home.id === opponent.id,
    season: table.season,
    round,
  });
  return card({
    round,
    opponentName: opponent.name,
    windowSentence: kickoffWindowSentence(window),
    late: window === 'after',
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
  if (humanSeasonFromFixture(dto.matchday) !== table.season) {
    return blocked('Ten sezon Ligi ludzi jest już zamknięty.');
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
      ...(await setupOf(locked)),
    },
  };
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
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup',
    )
    .eq('season', humanSeasonFromFixture(fixtureMatchday))
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
      matchday: fixtureMatchday,
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
      ...(await setupOf(broadcast)),
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
