import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveLeagueMembers } from '@/lib/league/league-members';
import { formatSeasonLabel } from '@/lib/season/types';

import { cupGuestOriginLabel, cupGuestsForTier } from '@/lib/cup/cup-guests';
import type {
  CupClub,
  CupDecidedBy,
  CupRoundDto,
  CupRoundIndex,
  CupSide,
  CupTieDto,
  CupVenue,
  NationalCupDto,
} from '@/lib/cup/types';

/** Draw opens after this many played league fixtures (GDD §11.8, after matchday 8). */
export const CUP_UNLOCK_AFTER_MATCHDAY = 8 as const;

const ROUND_LABEL: Record<CupRoundIndex, string> = {
  1: '1/8 finału',
  2: '1/4 finału',
  3: 'Półfinał',
  4: 'Finał',
};

const GUEST_SLOTS = [0, 4, 8, 12] as const;
const LEAGUE_SLOTS = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15] as const;

type BuiltTie = CupTieDto;

/**
 * National cup bracket for the current season.
 * AI ties that do not need the player get a decisive score (no draw).
 * The player's own tie is never given a result here.
 */
export function resolveNationalCup(
  club: Pick<ClubDto, 'id' | 'name' | 'shortName' | 'leagueTier'> & {
    readonly seasonNumber?: number;
  },
  fixtures: readonly FixtureDto[],
): NationalCupDto {
  const seasonNumber = club.seasonNumber ?? 1;
  const field = buildField(club);
  const qualified = [...field].sort((a, b) => a.name.localeCompare(b.name, 'pl'));
  const playedLeagueMatchdays = countPlayedLeagueMatchdays(fixtures);
  const editionOpen = playedLeagueMatchdays >= CUP_UNLOCK_AFTER_MATCHDAY;

  return {
    name: 'Puchar Krajowy',
    seasonLabel: formatSeasonLabel(seasonNumber),
    guestOriginLabel: cupGuestOriginLabel(club.leagueTier),
    unlockAfterMatchday: CUP_UNLOCK_AFTER_MATCHDAY,
    playedLeagueMatchdays,
    editionOpen,
    qualified,
    rounds: editionOpen ? drawRounds(field, `${club.id}|${seasonNumber}`) : [],
  };
}

function buildField(club: Pick<ClubDto, 'id' | 'name' | 'shortName' | 'leagueTier'>): CupClub[] {
  const league: CupClub[] = resolveLeagueMembers(club).map((m) => ({
    id: m.id,
    name: m.name,
    shortName: m.shortName,
    isPlayer: m.isPlayer,
    origin: 'league',
  }));
  const guests: CupClub[] = cupGuestsForTier(club.leagueTier).map((g) => ({
    id: g.id,
    name: g.name,
    shortName: g.shortName,
    isPlayer: false,
    origin: 'guest',
  }));
  return [...league, ...guests];
}

function countPlayedLeagueMatchdays(fixtures: readonly FixtureDto[]): number {
  let n = 0;
  for (const f of fixtures) {
    if (f.competition !== 'league' || f.status !== 'played') continue;
    if (f.homeScore == null || f.awayScore == null) continue;
    n += 1;
  }
  return n;
}

function drawRounds(field: readonly CupClub[], seedKey: string): readonly CupRoundDto[] {
  const seed = `cup-draw-v1|${seedKey}`;
  let entrants: CupSide[] = drawSlots(field, seed).map((club) => ({ kind: 'club', club }));
  const rounds: CupRoundDto[] = [];

  for (const round of [1, 2, 3, 4] as const) {
    const ties: BuiltTie[] = [];
    const next: CupSide[] = [];
    for (let i = 0; i < entrants.length; i += 2) {
      const tie = makeTie(round, i / 2, entrants[i]!, entrants[i + 1]!, seed);
      ties.push(tie);
      next.push(advance(tie));
    }
    rounds.push({ round, label: ROUND_LABEL[round], ties });
    entrants = next;
  }

  return rounds;
}

function drawSlots(field: readonly CupClub[], seed: string): CupClub[] {
  const league = shuffle(
    field.filter((c) => c.origin === 'league'),
    `${seed}|league`,
  );
  const guests = shuffle(
    field.filter((c) => c.origin === 'guest'),
    `${seed}|guest`,
  );
  const slots: CupClub[] = new Array(16);
  GUEST_SLOTS.forEach((slot, i) => {
    slots[slot] = guests[i]!;
  });
  LEAGUE_SLOTS.forEach((slot, i) => {
    slots[slot] = league[i]!;
  });
  return slots;
}

function makeTie(
  round: CupRoundIndex,
  index: number,
  left: CupSide,
  right: CupSide,
  seed: string,
): BuiltTie {
  const played = resolveTie(round, left, right, seed);
  const onPlayerPath = sideOnPath(played.home) || sideOnPath(played.away);
  return {
    id: `r${round}-${index}`,
    ...played,
    onPlayerPath,
  };
}

function resolveTie(
  round: CupRoundIndex,
  left: CupSide,
  right: CupSide,
  seed: string,
): Omit<BuiltTie, 'id' | 'onPlayerPath'> {
  if (left.kind === 'club' && right.kind === 'club') {
    const ordered = orderSides(left.club, right.club, seed, round);
    const home: CupSide = { kind: 'club', club: ordered.home };
    const away: CupSide = { kind: 'club', club: ordered.away };
    if (left.club.isPlayer || right.club.isPlayer) {
      return {
        home,
        away,
        homeScore: null,
        awayScore: null,
        winnerId: null,
        status: 'awaiting_player',
        venue: ordered.venue,
        hostClubId: ordered.hostClubId,
        decidedBy: null,
      };
    }
    const score = decisiveScore(ordered.home.id, ordered.away.id, round);
    const winnerId = score.home > score.away ? ordered.home.id : ordered.away.id;
    return {
      home,
      away,
      homeScore: score.home,
      awayScore: score.away,
      winnerId,
      status: 'played',
      venue: ordered.venue,
      hostClubId: ordered.hostClubId,
      decidedBy: score.decidedBy,
    };
  }

  return {
    home: left,
    away: right,
    homeScore: null,
    awayScore: null,
    winnerId: null,
    status: 'blocked',
    venue: round === 4 ? 'neutral' : 'unknown',
    hostClubId: null,
    decidedBy: null,
  };
}

function orderSides(
  a: CupClub,
  b: CupClub,
  seed: string,
  round: CupRoundIndex,
): { home: CupClub; away: CupClub; venue: CupVenue; hostClubId: string | null } {
  if (round === 4) {
    return { home: a, away: b, venue: 'neutral', hostClubId: null };
  }
  const aGuest = a.origin === 'guest';
  const bGuest = b.origin === 'guest';
  let home = a;
  let away = b;
  if (aGuest !== bGuest) {
    home = aGuest ? b : a;
    away = aGuest ? a : b;
  } else if ((hashSeed(`${seed}|host|${a.id}|${b.id}`) & 1) === 1) {
    home = b;
    away = a;
  }
  return { home, away, venue: 'club', hostClubId: home.id };
}

/** Knockout has no draws. A level score is broken and marked as extra time. */
function decisiveScore(
  homeId: string,
  awayId: string,
  round: CupRoundIndex,
): { home: number; away: number; decidedBy: CupDecidedBy } {
  const h = hashSeed(`${homeId}|${awayId}|cup-v1|r${round}`);
  let home = h % 4;
  let away = Math.floor(h / 4) % 4;
  if (home !== away) return { home, away, decidedBy: 'regulation' };
  if ((h >>> 8) & 1) home += 1;
  else away += 1;
  return { home, away, decidedBy: 'extra' };
}

function advance(tie: BuiltTie): CupSide {
  if (tie.winnerId) {
    if (tie.home.kind === 'club' && tie.home.club.id === tie.winnerId) return tie.home;
    if (tie.away.kind === 'club' && tie.away.club.id === tie.winnerId) return tie.away;
  }
  if (tie.onPlayerPath) return { kind: 'path' };
  return { kind: 'tbd' };
}

function sideOnPath(side: CupSide): boolean {
  if (side.kind === 'path') return true;
  return side.kind === 'club' && side.club.isPlayer;
}

function shuffle<T>(items: readonly T[], seed: string): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = hashSeed(`${seed}|${i}`) % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

function hashSeed(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
