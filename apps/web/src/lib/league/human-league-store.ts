import { fillLineup, isStandIn, lineupProblem, repairLineup } from '@/lib/squad/lineup-problem';
import type { PitchRole } from '@lastfootball/lfe';

import { env } from '@/config/env';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { OPPONENT_CATALOG } from '@/lib/fixtures/opponent-catalog';
import { utcDateString } from '@/lib/fixtures/played-unlock';
import { parseLeagueTier } from '@/lib/league/league-tier';
import { humanDayBlockReason, warsawDateKey } from '@/lib/fixtures/matchday-gate';
import { createSessionFromLeagueFixture } from '@/lib/fixtures/create-session';
import { seedOpponentBench, seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';
import { mapPlayerRow, type PlayerDbRow } from '@/lib/squad/map-player';
import { reconcileExpiredLoans } from '@/lib/squad/reconcile-loans';
import { resolveMatchBench, resolveStartingXi } from '@/lib/squad/resolve-club-squad';
import { isTalent } from '@/lib/squad/talents';
import { filterSeniorPlayers, type AttrGroups, type PlayerRowDto } from '@/lib/squad/types';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Json } from '@/types/database';

import {
  dueHumanSeasonKey,
  HUMAN_ACTIVE_DAYS,
  HUMAN_LEAGUE_SIZE,
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
import { resolveHumanScorers } from '@/lib/league/human-scorers';
import type { ScorerRow } from '@/lib/stats/scorers';
import { HUMAN_PRIZES, humanAwards, humanPrizes } from '@/lib/league/human-awards';
import { parsePlayerLines } from '@/lib/match/match-players';
import type { ReplayedMatch } from '@/lib/match/replay-manager-match';
import { finishSharedSession } from './human-play';

const PLAYER_SELECT =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at, attr_attack, attr_passing, attr_defense, attr_physical, attr_goalkeeping, energy, energy_on, form, wage, suspension_matches, injury_matches, recent_ratings, morale, personality, set_piece, on_loan, loaned_in, loan_until, intl_absent_until, absence_on';

const PLAYER_SELECT_LEGACY =
  'id, club_id, name, shirt_number, pos, role, starter, captain, age, skill, potential, status, nationality, version, departed_at, transfer_listed_at, academy_track, promoted_at';

const MISSING_COLUMN = new Set(['42703', 'PGRST204']);

export type HumanLeagueCard = {
  readonly seats: readonly { slot: number; name: string; kind: 'human' | 'bot'; yours: boolean }[];
  readonly round: number | null;
  readonly opponentName: string | null;
  readonly windowSentence: string | null;
  /** The shared window is over; the round can still be caught up. */
  readonly late: boolean;
  readonly fixtureId: string | null;
  readonly note: string | null;
  /** Null without a seat, or when the league could not be read. */
  readonly season: number | null;
  /** Number of this league, and how many leagues and player clubs there are. */
  readonly leagueId: number | null;
  readonly leagues: number | null;
  readonly clubs: number | null;
  readonly prizes: readonly number[];
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
  stats: Json | null;
};

type SeatTable = {
  readonly leagueId: number;
  readonly seasonKey: string;
  /** Unique across leagues: fixtures, broadcasts and history are keyed by it. */
  readonly season: number;
  /** Season of this league, as people see it. */
  readonly cycle: number;
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

/** No seat, or nothing could be read: only the reason, no made-up round or league. */
function noteCard(
  note: string,
  counts: Pick<HumanLeagueCard, 'leagues' | 'clubs'> | null,
): HumanLeagueCard {
  return {
    seats: [],
    round: null,
    opponentName: null,
    windowSentence: null,
    late: false,
    fixtureId: null,
    note,
    season: null,
    leagueId: null,
    leagues: counts?.leagues ?? null,
    clubs: counts?.clubs ?? null,
    prizes: [],
    nextSeasonOn: null,
    standings: [],
    lastSeason: null,
  };
}

/** Null = not a full set of seats. 'error' = the read failed. */
async function readSeats(leagueId: number): Promise<HumanSeat[] | null | 'error'> {
  const { data, error } = await createAdminClient()
    .from('human_league_seats')
    .select('slot, kind, ref_id, display_name, short_name')
    .eq('league_id', leagueId)
    .order('slot', { ascending: true });
  if (error || !data) return 'error';
  if (data.length !== HUMAN_LEAGUE_SIZE) return null;
  return data.map((row) => ({
    slot: row.slot,
    kind: row.kind === 'human' ? 'human' : 'bot',
    id: row.ref_id,
    name: row.display_name,
    shortName: row.short_name,
  }));
}

/** Rounds each club played itself. The archive keeps them when a club season deletes fixtures. */
async function playedRoundsByClub(season: number): Promise<ReadonlyMap<string, number> | null> {
  const { data, error } = await createAdminClient()
    .from('club_matches' as never)
    .select('club_id, matchday')
    .eq('competition', 'human')
    .gte('matchday', humanFixtureMatchday(1, season))
    .lte('matchday', humanFixtureMatchday(HUMAN_ROUND_COUNT, season));
  if (error || !data) return null;
  const rounds = new Map<string, Set<number>>();
  for (const row of data as unknown as { club_id: string; matchday: number }[]) {
    rounds.set(row.club_id, (rounds.get(row.club_id) ?? new Set()).add(row.matchday));
  }
  return new Map([...rounds].map(([id, days]) => [id, days.size]));
}

/** The season that ran when the rule came in keeps the prizes it promised (D155). */
const FULL_PRIZE_SEASON = 1;

function leaguePrizes(season: number, seats: readonly HumanSeat[]): readonly number[] {
  return season === FULL_PRIZE_SEASON
    ? HUMAN_PRIZES
    : humanPrizes(seats.filter((seat) => seat.kind === 'human').length);
}

/**
 * Table of a season that closes now, with every missing match decided, and its awards.
 * Null = there is no full set of seats. 'error' = a failed read: the season closes later.
 */
async function finalStandings(leagueId: number, season: number, seasonKey: string, now: Date) {
  const seats = await readSeats(leagueId);
  if (seats === 'error') return seats;
  if (!seats) return null;
  const [stored, played] = await Promise.all([storedResults(season), playedRoundsByClub(season)]);
  if (!stored || !played) return 'error' as const;
  const results = [...stored, ...settleMissing({ seats, seasonKey, results: stored })];
  const standings = resolveHumanTable({ seats, seasonKey, results, now });
  return { standings, awards: humanAwards(standings, played, leaguePrizes(season, seats)) };
}

/** The season of this league before the running one, for the card. */
async function lastSeason(
  table: SeatTable,
  clubId: string,
): Promise<HumanLeagueCard['lastSeason']> {
  if (table.cycle < 2) return null;
  const { data } = await createAdminClient()
    .from('human_league_history')
    .select('standings')
    .eq('league_id', table.leagueId)
    .eq('cycle', table.cycle - 1)
    .order('season', { ascending: false })
    .limit(1)
    .maybeSingle();
  const rows = data?.standings as unknown as HumanTableRow[] | undefined;
  if (!Array.isArray(rows) || !rows[0]) return null;
  const place = rows.findIndex((row) => row.id === clubId) + 1;
  return { season: table.cycle - 1, champion: rows[0].name, place: place > 0 ? place : null };
}

type LeagueState = {
  readonly leagues: number;
  readonly clubs: number;
  readonly table: SeatTable | null;
};

/** A call, not a read: Next remembers equal reads while it renders one page. */
async function leagueState(clubId: string): Promise<LeagueState | 'missing' | null> {
  const { data, error } = await createAdminClient().rpc(
    'human_league_of' as never,
    { p_club: clubId } as never,
  );
  if (error) return missingRelation(error) || error.code === 'PGRST202' ? 'missing' : null;
  const state = data as unknown as {
    leagues: number;
    clubs: number;
    league: {
      id: number;
      season_key: string;
      season_number: number;
      cycle: number;
      frozen: boolean;
      seats: HumanSeat[] | null;
    } | null;
  } | null;
  if (!state) return null;
  const league = state.league;
  if (league && league.seats?.length !== HUMAN_LEAGUE_SIZE) return null;
  return {
    leagues: state.leagues,
    clubs: state.clubs,
    table: league
      ? {
          leagueId: league.id,
          seasonKey: league.season_key,
          season: league.season_number,
          cycle: league.cycle,
          frozen: league.frozen,
          seats: league.seats!,
        }
      : null,
  };
}

/** Closes every league season that is over. False = a failed read: it closes later. */
async function closeDueLeagues(now: Date): Promise<boolean> {
  const admin = createAdminClient();
  const due = await admin.rpc(
    'human_leagues_due' as never,
    { p_today: warsawDateKey(now) } as never,
  );
  if (due.error) return false;
  const leagues = (due.data ?? []) as unknown as {
    id: number;
    season_key: string;
    season_number: number;
  }[];
  for (const league of leagues) {
    const nextKey = dueHumanSeasonKey(league.season_key, now);
    if (!nextKey) continue;
    const final = await finalStandings(league.id, league.season_number, league.season_key, now);
    if (final === 'error') return false;
    const closed = await admin.rpc(
      'close_human_season' as never,
      {
        p_season: league.season_number,
        p_key: nextKey,
        p_standings: final?.standings ?? null,
        p_awards: final?.awards ?? null,
      } as never,
    );
    if (closed.error) return false;
  }
  return true;
}

/**
 * The league of this club (D154). Leagues open and close by themselves: a club without a seat
 * joins one that has not started, or a new league opens for the waiting clubs.
 */
async function ensureSeatTable(clubId: string, now: Date): Promise<LeagueState | 'missing' | null> {
  if (!env.isSupabaseConfigured || !env.supabaseServiceRoleKey) return null;
  const first = await leagueState(clubId);
  if (first === null || first === 'missing') return first;
  const ended =
    first.table !== null && warsawDateKey(now) >= nextHumanSeasonStart(first.table.seasonKey);
  if (first.table?.frozen && !ended) return first;

  if (!(await closeDueLeagues(now))) return null;
  const synced = await createAdminClient().rpc(
    'human_league_sync' as never,
    {
      p_since: new Date(now.getTime() - HUMAN_ACTIVE_DAYS * 86_400_000).toISOString(),
      p_today: warsawDateKey(now),
      p_start: kickoffDate(warsawDateKey(now), 2),
      p_bots: bots(),
    } as never,
  );
  return synced.error ? null : leagueState(clubId);
}

/** Closes the seats before the first line-up is locked, then reads them once more. */
async function frozenTable(table: SeatTable, clubId: string): Promise<SeatTable | null> {
  if (table.frozen) return table;
  const frozen = await createAdminClient().rpc(
    'freeze_human_league' as never,
    { p_season: table.season } as never,
  );
  if (frozen.error) return null;
  const state = await leagueState(clubId);
  return state && state !== 'missing' && state.table?.season === table.season ? state.table : null;
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
  const rows = parseSquad(value, true);
  return rows?.length === 11 ? rows : null;
}

export function parseSquad(value: unknown, starter: boolean): RosterPlayerSeed[] | null {
  if (!Array.isArray(value)) return null;
  const rows: RosterPlayerSeed[] = [];
  for (const item of value as Json[]) {
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
      starter,
      captain: row.captain === true,
      setPiece: row.setPiece === true || undefined,
      skill: row.skill,
      groups: isGroups(row.groups) ? row.groups : undefined,
      energy: typeof row.energy === 'number' ? row.energy : undefined,
      form: typeof row.form === 'number' ? row.form : undefined,
      ...(typeof row.morale === 'number' ? { morale: row.morale } : {}),
      ...(typeof row.leadership === 'number' ? { leadership: row.leadership } : {}),
      ...(Array.isArray(row.talents) ? { talents: row.talents.filter(isTalent) } : {}),
    });
  }
  return rows;
}

type SquadSnapshot = {
  readonly xi: readonly RosterPlayerSeed[];
  readonly bench: readonly RosterPlayerSeed[];
};

async function snapshotSquad(clubId: string): Promise<SquadSnapshot | { error: string }> {
  const admin = createAdminClient();
  const full = await admin
    .from('players')
    .select(PLAYER_SELECT)
    .eq('club_id', clubId)
    .is('departed_at', null);
  // Only an older database plays from fewer columns: what is read here stays for the match.
  const result = MISSING_COLUMN.has(full.error?.code ?? '')
    ? await admin
        .from('players')
        .select(PLAYER_SELECT_LEGACY)
        .eq('club_id', clubId)
        .is('departed_at', null)
    : full;
  if (result.error || !result.data) return { error: 'Nie mogę odczytać składu.' };
  // The account was deleted: its seat plays on like a bot until the season ends.
  if (result.data.length === 0) {
    return { xi: seedOpponentSquad(clubId, 'iv'), bench: seedOpponentBench(clubId, 'iv') };
  }
  const squad = withoutExpiredLoans((result.data as PlayerDbRow[]).map((row) => mapPlayerRow(row)));
  // A rival's injured starter must not cancel the match for both clubs.
  let rows = filterSeniorPlayers(squad).length > 0 ? repairLineup(clubId, squad) : squad;
  if (filterSeniorPlayers(squad).length === 0 || lineupProblem(clubId, rows)) {
    const club = await admin.from('clubs').select('league_tier').eq('id', clubId).maybeSingle();
    if (club.error) return { error: 'Nie mogę odczytać klubu.' };
    rows = fillLineup(clubId, parseLeagueTier(club.data?.league_tier), squad);
  }
  return { xi: resolveStartingXi(rows), bench: resolveMatchBench(rows) };
}

/** The same end of a loan as when the club opens its squad, without the write. */
function withoutExpiredLoans(rows: readonly PlayerRowDto[]): PlayerRowDto[] {
  const ended = new Map(
    reconcileExpiredLoans(
      rows.map((row) => ({
        id: row.id,
        onLoan: row.onLoan === true,
        loanedIn: row.loanedIn === true,
        loanUntil: row.loanUntil ?? null,
        wage: row.wage ?? 0,
        wageBank: row.wageBank ?? null,
      })),
      utcDateString(),
    ).map((patch) => [patch.id, patch.kind]),
  );
  return rows
    .filter((row) => ended.get(row.id) !== 'return_in')
    .map((row) => (ended.has(row.id) ? { ...row, onLoan: false } : row));
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
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup, stats',
    )
    .eq('season', season)
    .eq('matchday', pair.matchday)
    .eq('home_id', pair.home.id)
    .eq('away_id', pair.away.id)
    .maybeSingle();
  if (error || !data) return null;
  return data as BroadcastRow;
}

/** Everything of the home club that the match uses besides its line-up. Null = a failed read. */
async function readHomeSetup(homeId: string): Promise<HumanHomeSetup | null> {
  if (isBotClubId(homeId)) return parseHomeSetup(null);
  const { data, error } = await createAdminClient()
    .from('clubs')
    .select('pitch_level, style_pressing, style_tempo, style_width, press_line, press_shape')
    .eq('id', homeId)
    .maybeSingle();
  if (error) return null;
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
async function setupOf(broadcast: BroadcastRow): Promise<HumanHomeSetup | null> {
  return broadcast.home_setup
    ? parseHomeSetup(broadcast.home_setup)
    : readHomeSetup(broadcast.home_id);
}

/** Null = locked before the benches existed: the match plays without full rules. */
function benchesOf(broadcast: BroadcastRow) {
  const setup = broadcast.home_setup as { homeBench?: unknown; awayBench?: unknown } | null;
  const home = parseSquad(setup?.homeBench, false);
  const away = parseSquad(setup?.awayBench, false);
  return home && away ? { home, away } : null;
}

async function lockBroadcast(
  table: SeatTable,
  pair: HumanPairing,
  now: Date,
): Promise<BroadcastRow | { error: string }> {
  const existing = await readBroadcast(table.season, pair);
  if (existing?.locked_at) return existing;

  const homeSnap = isBotClubId(pair.home.id) ? null : await snapshotSquad(pair.home.id);
  const awaySnap = isBotClubId(pair.away.id) ? null : await snapshotSquad(pair.away.id);
  if ((homeSnap && 'error' in homeSnap) || (awaySnap && 'error' in awaySnap)) {
    return { error: 'Nie udało się odczytać składów. Odśwież stronę.' };
  }
  const homeSetup = await readHomeSetup(pair.home.id);
  if (!homeSetup) return { error: 'Nie udało się odczytać ustawień gospodarza. Odśwież stronę.' };

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
    home_xi: (homeSnap?.xi ?? null) as unknown as Json | null,
    away_xi: (awaySnap?.xi ?? null) as unknown as Json | null,
    // The benches are frozen here too. Their presence means full match rules (D151).
    home_setup: {
      ...homeSetup,
      homeBench: homeSnap?.bench ?? seedOpponentBench(pair.home.id, 'iv'),
      awayBench: awaySnap?.bench ?? seedOpponentBench(pair.away.id, 'iv'),
    } as unknown as Json,
    locked_at: now.toISOString(),
  };

  if (existing) {
    const updated = await admin
      .from('human_broadcasts')
      .update(payload)
      .eq('id', existing.id)
      .select(
        'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup, stats',
      )
      .maybeSingle();
    if (updated.error || !updated.data) return { error: 'Nie udało się zamknąć składów.' };
    return updated.data as BroadcastRow;
  }

  const inserted = await admin
    .from('human_broadcasts')
    .insert(payload)
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup, stats',
    )
    .maybeSingle();
  if (inserted.error || !inserted.data) {
    const raced = await readBroadcast(table.season, pair);
    if (raced) return raced;
    return { error: 'Nie udało się zapisać meczu ligi ludzi.' };
  }
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

/** Scores somebody already played. Null = the read failed. */
async function storedResults(season: number): Promise<HumanResult[] | null> {
  const { data, error } = await createAdminClient()
    .from('human_broadcasts')
    .select('matchday, home_id, away_id, home_score, away_score')
    .eq('season', season)
    .not('home_score', 'is', null);
  if (error || !data) return null;
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
  state: LeagueState,
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
    season: table.cycle,
    leagueId: table.leagueId,
    leagues: state.leagues,
    clubs: state.clubs,
    prizes: leaguePrizes(table.season, table.seats),
    nextSeasonOn: nextHumanSeasonStart(table.seasonKey),
    standings: extra.standings ?? [],
    lastSeason: extra.lastSeason ?? null,
  };
}

const CARD_UNREAD = 'Nie udało się wczytać Ligi ludzi. Odśwież stronę.';

export async function loadHumanLeagueCard(
  club: ClubDto,
  now = new Date(),
): Promise<HumanLeagueCard> {
  const state = await ensureSeatTable(club.id, now);
  if (state === null || state === 'missing') {
    return noteCard(
      state === 'missing' ? 'Tabela ligi ludzi nie jest jeszcze na bazie.' : CARD_UNREAD,
      null,
    );
  }
  if (!state.table) {
    const note =
      'Kolejna liga otworzy się sama, gdy będzie czekać drugi klub. Miejsce dostaje klub, który w ostatnich 14 dniach grał, trenował albo powstał.';
    return noteCard(note, state);
  }
  let table = state.table;

  const admin = createAdminClient();
  const [results, playedRows] = await Promise.all([
    storedResults(table.season),
    admin
      .from('fixtures')
      .select('matchday, status, played_at')
      .eq('club_id', club.id)
      .eq('competition', 'human'),
  ]);
  // Nothing read is not the same as nothing played.
  if (!results || playedRows.error || !playedRows.data) return noteCard(CARD_UNREAD, state);

  const standings = resolveHumanTable({
    seats: table.seats,
    seasonKey: table.seasonKey,
    results,
    now,
  });
  const previous = await lastSeason(table, club.id);
  const card = (extra: Partial<HumanLeagueCard>) =>
    cardFrom(club, state, table, { standings, lastSeason: previous, ...extra });

  const rows = playedRows.data;
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
        : today < table.seasonKey
          ? `Liga startuje ${dayLabel(table.seasonKey)} o 18:00. Do tego czasu mogą dołączyć kolejne kluby.`
          : today > kickoffDate(table.seasonKey, HUMAN_ROUND_COUNT)
            ? `Sezon ${table.cycle} rozegrany. Nowy sezon od ${dayLabel(nextHumanSeasonStart(table.seasonKey))}, wolne miejsca biorą nowe kluby.`
            : 'Sezon ligi ludzi nie ma teraz meczu do rozegrania.',
    });
  }

  const window = kickoffWindowState(now, kickoffDate(table.seasonKey, round));
  if (window !== 'before') {
    const frozen = await frozenTable(table, club.id);
    if (!frozen) return card({ round, note: 'Nie udało się zamknąć miejsc. Odśwież stronę.' });
    table = frozen;
  }
  const pair = pairingForClub(table.seats, round, club.id);
  if (!pair) return card({ round, note: 'Brak pary na tę kolejkę.' });
  const opponent = pair.home.id === club.id ? pair.away : pair.home;
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
    note: standInNote(locked, club.id, opponent.name),
  });
}

/** Says who plays with juniors in the place of missing players. */
export function standInNote(
  row: Pick<BroadcastRow, 'home_id' | 'home_xi' | 'away_xi'>,
  clubId: string,
  opponentName: string,
): string | null {
  const short = (value: Json | null) => parseXi(value)?.some((p) => isStandIn(p.id)) === true;
  const [ours, theirs] =
    row.home_id === clubId ? [row.home_xi, row.away_xi] : [row.away_xi, row.home_xi];
  const notes = [
    short(ours)
      ? 'Twój skład był niepełny, w tym meczu uzupełniają go juniorzy spoza kadry.'
      : null,
    short(theirs) ? `${opponentName} ma niepełny skład, uzupełniają go juniorzy.` : null,
  ].filter(Boolean);
  return notes.length > 0 ? notes.join(' ') : null;
}

/** Scorers of the running human season. Reads only. Null = nothing to show. */
export async function loadHumanScorers(
  clubId: string,
  now = new Date(),
): Promise<readonly ScorerRow[] | null> {
  if (!env.isSupabaseConfigured || !env.supabaseServiceRoleKey) return null;
  const admin = createAdminClient();
  const state = await leagueState(clubId);
  if (!state || state === 'missing' || !state.table) return null;
  const { table } = state;
  const { data, error } = await admin
    .from('human_broadcasts')
    .select('home_id, away_id, stats')
    .eq('season', table.season)
    .not('stats', 'is', null);
  if (error || !data) return null;
  return resolveHumanScorers({
    seats: table.seats,
    seasonKey: table.seasonKey,
    broadcasts: data.map((row) => ({
      homeId: row.home_id,
      awayId: row.away_id,
      stats: row.stats,
    })),
    now,
    clubId,
  });
}

/** One human round a Warsaw day, also for a club that is behind. Null when the club may play. */
export async function humanDayBlock(clubId: string, now: Date): Promise<string | null> {
  const { data, error } = await createAdminClient()
    .from('fixtures')
    .select('played_at')
    .eq('club_id', clubId)
    .eq('competition', 'human')
    .eq('status', 'played')
    .order('played_at', { ascending: false, nullsFirst: false })
    .limit(1)
    .maybeSingle();
  if (error) return 'Nie udało się sprawdzić dnia meczu. Spróbuj ponownie.';
  return humanDayBlockReason(data?.played_at ?? null, now);
}

/** Our players of a locked match. Null = not locked yet, or locked before line-ups were kept. */
export async function humanMatchLineup(
  clubId: string,
  fixtureMatchday: number,
): Promise<HumanLineup | null | 'error'> {
  const round = humanRoundFromFixture(fixtureMatchday);
  if (!round || !env.supabaseServiceRoleKey) return null;
  const { data, error } = await createAdminClient()
    .from('human_broadcasts')
    .select('home_id, home_xi, away_xi, home_setup')
    .eq('season', humanSeasonFromFixture(fixtureMatchday))
    .eq('matchday', round)
    .or(`home_id.eq.${clubId},away_id.eq.${clubId}`)
    .maybeSingle();
  if (error) return 'error';
  return data ? lineupOf(data, clubId) : null;
}

export type HumanLineup = { readonly xi: readonly string[]; readonly bench: readonly string[] };

export function lineupOf(
  row: Pick<BroadcastRow, 'home_id' | 'home_xi' | 'away_xi' | 'home_setup'>,
  clubId: string,
): HumanLineup | null {
  const isHome = row.home_id === clubId;
  const xi = parseXi(isHome ? row.home_xi : row.away_xi);
  if (!xi) return null;
  const setup = row.home_setup as { homeBench?: unknown; awayBench?: unknown } | null;
  const bench = parseSquad(isHome ? setup?.homeBench : setup?.awayBench, false) ?? [];
  return { xi: xi.map((p) => p.id), bench: bench.map((p) => p.id) };
}

export type HumanLiveReady = {
  readonly fixture: FixtureDto;
  readonly ourXi: readonly RosterPlayerSeed[];
  readonly theirXi: readonly RosterPlayerSeed[];
  readonly ourBench: readonly RosterPlayerSeed[];
  readonly theirBench: readonly RosterPlayerSeed[];
  readonly fullRules: boolean;
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
    ourBench: [],
    theirBench: [],
    fullRules: true,
    block,
  });
  const round = humanRoundFromFixture(dto.matchday);
  if (!round) return blocked('To nie jest mecz ligi ludzi.');
  const state = await ensureSeatTable(club.id, now);
  if (state === null || state === 'missing' || !state.table) {
    return blocked('Nie masz teraz miejsca w Lidze ludzi.');
  }
  const { table } = state;
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
  if (!table.frozen) return blocked('Wejdź w mecz ze strony Ligi.');
  const day = await humanDayBlock(club.id, now);
  if (day) return blocked(day);
  const locked = await lockBroadcast(table, pair, now);
  if ('error' in locked) return blocked(locked.error);

  const homeXi = sideXi(pair.home, locked.home_xi);
  const awayXi = sideXi(pair.away, locked.away_xi);
  if ('error' in homeXi) return blocked(homeXi.error);
  if ('error' in awayXi) return blocked(awayXi.error);
  const isHome = pair.home.id === club.id;
  const opponent = isHome ? pair.away : pair.home;
  const benches = benchesOf(locked);
  const setup = await setupOf(locked);
  if (!setup) return blocked('Nie udało się odczytać meczu. Odśwież stronę.');
  return {
    block: null,
    ourXi: isHome ? homeXi : awayXi,
    theirXi: isHome ? awayXi : homeXi,
    ourBench: (isHome ? benches?.home : benches?.away) ?? [],
    theirBench: (isHome ? benches?.away : benches?.home) ?? [],
    fullRules: benches !== null,
    fixture: {
      ...dto,
      isHome,
      opponentClubId: opponent.id,
      opponent: { id: opponent.id, name: opponent.name, shortName: opponent.shortName },
      sharedSeed: Number(locked.seed),
      ...setup,
    },
  };
}

export async function authoritativeHumanScore(
  clubId: string,
  fixtureMatchday: number,
): Promise<ReplayedMatch | { error: string }> {
  const round = humanRoundFromFixture(fixtureMatchday);
  if (!round) return { error: 'To nie jest mecz ligi ludzi.' };
  if (!env.supabaseServiceRoleKey) return { error: 'Brak zapisu wyniku ligi ludzi.' };
  const admin = createAdminClient();
  const found = await admin
    .from('human_broadcasts')
    .select(
      'id, matchday, home_id, away_id, home_name, away_name, home_short, away_short, seed, kickoff_on, home_xi, away_xi, home_score, away_score, locked_at, home_setup, stats',
    )
    .eq('season', humanSeasonFromFixture(fixtureMatchday))
    .eq('matchday', round)
    .or(`home_id.eq.${clubId},away_id.eq.${clubId}`)
    .maybeSingle();
  if (found.error || !found.data) return { error: 'Nie ma wspólnego meczu do zapisania.' };
  const broadcast = found.data as BroadcastRow;
  if (broadcast.home_score != null && broadcast.away_score != null) {
    return {
      home: broadcast.home_score,
      away: broadcast.away_score,
      players: parsePlayerLines(broadcast.stats) ?? [],
    };
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

  const benches = benchesOf(broadcast);
  const setup = await setupOf(broadcast);
  if (!setup) return { error: 'Nie udało się odczytać meczu. Spróbuj ponownie.' };
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
      ...setup,
    },
    homeXi,
    benches?.home ?? [],
    '4-4-2',
    awayXi,
    { theirBench: benches?.away ?? [], fullRules: benches !== null },
  );
  const played = finishSharedSession(session);
  session.dispose();
  const saved = await admin
    .from('human_broadcasts')
    .update({
      home_score: played.home,
      away_score: played.away,
      stats: played.players as unknown as Json,
    })
    .eq('id', broadcast.id)
    .is('home_score', null)
    .select('home_score, away_score, stats')
    .maybeSingle();
  if (saved.data?.home_score != null && saved.data.away_score != null) {
    return {
      home: saved.data.home_score,
      away: saved.data.away_score,
      players: parsePlayerLines(saved.data.stats) ?? [],
    };
  }
  const again = await admin
    .from('human_broadcasts')
    .select('home_score, away_score, stats')
    .eq('id', broadcast.id)
    .maybeSingle();
  if (again.data?.home_score != null && again.data?.away_score != null) {
    return {
      home: again.data.home_score,
      away: again.data.away_score,
      players: parsePlayerLines(again.data.stats) ?? [],
    };
  }
  return { home: played.home, away: played.away, players: played.players };
}
