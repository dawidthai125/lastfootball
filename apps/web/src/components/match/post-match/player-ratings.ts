/**
 * LFE-PLAYER-RATINGS-01 — pure Post Match derive from MatchState.
 * No Engine / AI / MatchState mutation.
 *
 * MVP Formula v1 — intentionally simple; future versions may incorporate assists, minutes played, passes, tackles, interceptions, saves, xG and xA without changing the public API.
 */

import type { MatchState } from '@lastfootball/lfe';

export type PlayerRatingStatus = 'mvp' | 'solid' | 'average' | 'poor';

export type PlayerRatingView = {
  readonly playerId: string;
  readonly side: 'home' | 'away';
  readonly name: string;
  readonly shirtNumber: number;
  readonly role: string;
  readonly slotIndex: number;
  readonly rating: number;
  readonly status: PlayerRatingStatus;
  readonly goals: number;
  readonly shots: number;
  readonly foulsCommitted: number;
  readonly isMvp: boolean;
};

export type PlayerRatingsResult = {
  readonly home: readonly PlayerRatingView[];
  readonly away: readonly PlayerRatingView[];
  readonly mvpPlayerId: string | null;
};

const BASE = 6.0;
const GOAL_DELTA = 1.0;
const GOAL_CAP = 3;
const SHOT_DELTA = 0.1;
const SHOT_CAP = 6;
const FOUL_DELTA = -0.25;
const FOUL_CAP = 4;
const TEAM_WIN = 0.3;
const TEAM_LOSE = -0.3;
const GK_CLEAN_SHEET = 0.5;

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

/** One decimal place, stable for formula range. */
export function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

export function clampRating(n: number): number {
  return round1(clamp(n, 1.0, 10.0));
}

function teamResultDelta(side: 'home' | 'away', homeScore: number, awayScore: number): number {
  if (homeScore === awayScore) return 0;
  const won = side === 'home' ? homeScore > awayScore : awayScore > homeScore;
  return won ? TEAM_WIN : TEAM_LOSE;
}

function statusForRating(rating: number, isMvp: boolean): PlayerRatingStatus {
  if (isMvp) return 'mvp';
  if (rating >= 7.0) return 'solid';
  if (rating >= 5.5) return 'average';
  return 'poor';
}

function ratePlayer(input: {
  readonly goals: number;
  readonly shots: number;
  readonly foulsCommitted: number;
  readonly role: string;
  readonly side: 'home' | 'away';
  readonly homeScore: number;
  readonly awayScore: number;
}): number {
  const goals = Math.min(input.goals, GOAL_CAP);
  const shots = Math.min(input.shots, SHOT_CAP);
  const fouls = Math.min(input.foulsCommitted, FOUL_CAP);

  let raw =
    BASE +
    goals * GOAL_DELTA +
    shots * SHOT_DELTA +
    fouls * FOUL_DELTA +
    teamResultDelta(input.side, input.homeScore, input.awayScore);

  const goalsAgainst = input.side === 'home' ? input.awayScore : input.homeScore;
  if (input.role === 'GK' && goalsAgainst === 0) {
    raw += GK_CLEAN_SHEET;
  }

  return clampRating(raw);
}

/**
 * Deterministic MVP: max rating → goals → shots → fewer fouls → home → slotIndex → playerId.
 */
export function selectMvp(players: readonly PlayerRatingView[]): string | null {
  if (players.length === 0) return null;

  const ranked = [...players].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.goals !== a.goals) return b.goals - a.goals;
    if (b.shots !== a.shots) return b.shots - a.shots;
    if (a.foulsCommitted !== b.foulsCommitted) return a.foulsCommitted - b.foulsCommitted;
    if (a.side !== b.side) return a.side === 'home' ? -1 : 1;
    if (a.slotIndex !== b.slotIndex) return a.slotIndex - b.slotIndex;
    return a.playerId < b.playerId ? -1 : a.playerId > b.playerId ? 1 : 0;
  });

  return ranked[0]!.playerId;
}

function buildSideRatings(
  state: MatchState,
  side: 'home' | 'away',
): Omit<PlayerRatingView, 'status' | 'isMvp'>[] {
  const lineup = side === 'home' ? state.homeLineup : state.awayLineup;
  const homeScore = state.score.home;
  const awayScore = state.score.away;

  const rows = lineup.slots.map((slot) => {
    const player = state.players.find((p) => p.id === slot.playerId);
    const stats = state.statistics.players.find((p) => p.playerId === slot.playerId);
    const goals = stats?.goals ?? 0;
    const shots = stats?.shots ?? 0;
    const foulsCommitted = stats?.foulsCommitted ?? 0;

    return {
      playerId: slot.playerId,
      side,
      name: player?.name ?? slot.playerId,
      shirtNumber: player?.shirtNumber ?? 0,
      role: slot.role,
      slotIndex: slot.slotIndex,
      goals,
      shots,
      foulsCommitted,
      rating: ratePlayer({
        goals,
        shots,
        foulsCommitted,
        role: slot.role,
        side,
        homeScore,
        awayScore,
      }),
    };
  });

  return rows.sort((a, b) => a.slotIndex - b.slotIndex);
}

type RatedRow = Omit<PlayerRatingView, 'status' | 'isMvp'>;

function toView(row: RatedRow, mvpPlayerId: string | null): PlayerRatingView {
  const isMvp = mvpPlayerId !== null && row.playerId === mvpPlayerId;
  return {
    ...row,
    isMvp,
    status: statusForRating(row.rating, isMvp),
  };
}

/** Pure derive: full XI both sides + MVP. */
export function computePlayerRatings(matchState: MatchState): PlayerRatingsResult {
  const homeRaw = buildSideRatings(matchState, 'home');
  const awayRaw = buildSideRatings(matchState, 'away');
  const provisional: PlayerRatingView[] = [...homeRaw, ...awayRaw].map((row) => toView(row, null));
  const mvpPlayerId = selectMvp(provisional);

  return {
    home: Object.freeze(homeRaw.map((r) => toView(r, mvpPlayerId))),
    away: Object.freeze(awayRaw.map((r) => toView(r, mvpPlayerId))),
    mvpPlayerId,
  };
}
