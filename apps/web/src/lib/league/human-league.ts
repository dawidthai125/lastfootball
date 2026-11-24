/**
 * Liga ludzi — 12 miejsc, boty na wolne, jeden seed na mecz.
 * Czyste funkcje. Nie ruszają ligi z botami (kolejki 1–22).
 * Kolejka w tabeli fixtures to 301–322, żeby nie zderzyć się z ligą, pucharem i wyzwaniem.
 */

import { hashSeed } from '@/lib/match/hash-seed';
import { warsawDateKey } from '@/lib/fixtures/matchday-gate';

export const HUMAN_LEAGUE_SIZE = 12;
export const HUMAN_ROUND_COUNT = 22;
export const HUMAN_FIXTURE_BASE = 300;
export const KICKOFF_OPEN_HOUR = 18;
export const KICKOFF_CLOSE_HOUR = 21;

export type HumanSeat = {
  readonly slot: number;
  readonly kind: 'human' | 'bot';
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
};

export type HumanClubInput = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly createdAt: string;
};

export type HumanPairing = {
  readonly matchday: number;
  readonly home: HumanSeat;
  readonly away: HumanSeat;
};

export type KickoffWindow = 'before' | 'open' | 'after';

export function fillHumanSeats(
  humans: readonly HumanClubInput[],
  bots: readonly { id: string; name: string; shortName: string }[],
): readonly HumanSeat[] {
  const sorted = [...humans].sort(
    (a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
  );
  const seats: HumanSeat[] = [];
  for (const human of sorted) {
    if (seats.length >= HUMAN_LEAGUE_SIZE) break;
    seats.push({
      slot: seats.length,
      kind: 'human',
      id: human.id,
      name: human.name,
      shortName: human.shortName,
    });
  }
  for (const bot of bots) {
    if (seats.length >= HUMAN_LEAGUE_SIZE) break;
    seats.push({
      slot: seats.length,
      kind: 'bot',
      id: bot.id,
      name: bot.name,
      shortName: bot.shortName,
    });
  }
  if (seats.length !== HUMAN_LEAGUE_SIZE) {
    throw new Error('Za mało klubów, żeby zamknąć ligę ludzi.');
  }
  return seats;
}

/** Season 1 keeps 301–322. Later seasons sit far above the challenge days (201+). */
const LATER_SEASON_BASE = 100_000;

export function humanFixtureMatchday(round: number, season = 1): number {
  return season <= 1 ? HUMAN_FIXTURE_BASE + round : LATER_SEASON_BASE + season * 100 + round;
}

export function humanSeasonFromFixture(matchday: number): number {
  return matchday < LATER_SEASON_BASE ? 1 : Math.trunc((matchday - LATER_SEASON_BASE) / 100);
}

export function humanRoundFromFixture(matchday: number): number | null {
  const round =
    matchday < LATER_SEASON_BASE
      ? matchday - HUMAN_FIXTURE_BASE
      : (matchday - LATER_SEASON_BASE) % 100;
  if (round < 1 || round > HUMAN_ROUND_COUNT) return null;
  return round;
}

/** Free days after round 22, for overdue matches. Then the next season starts (D138). */
export const HUMAN_BREAK_DAYS = 3;

/** A club that did nothing for this long gives its seat back in the next season (D140). */
export const HUMAN_ACTIVE_DAYS = 14;

/** First day of the next season, when nobody comes late. */
export function nextHumanSeasonStart(seasonKey: string): string {
  return kickoffDate(seasonKey, HUMAN_ROUND_COUNT + HUMAN_BREAK_DAYS + 1);
}

/**
 * Key of the season that should start now, or null. A late start counts from the day it happens,
 * and from tomorrow once the shared kickoff of today has passed: no round is overdue at birth.
 */
export function dueHumanSeasonKey(seasonKey: string, now: Date): string | null {
  const today = warsawDateKey(now);
  if (today < nextHumanSeasonStart(seasonKey)) return null;
  return warsawHour(now) < KICKOFF_OPEN_HOUR ? today : kickoffDate(today, 2);
}

/** Circle method. Matchdays 12–22 are the return legs. */
export function pairingsForMatchday(
  seats: readonly HumanSeat[],
  matchday: number,
): readonly HumanPairing[] {
  if (seats.length !== HUMAN_LEAGUE_SIZE) {
    throw new Error('Liga ludzi ma 12 miejsc.');
  }
  if (matchday < 1 || matchday > HUMAN_ROUND_COUNT) {
    throw new Error('Kolejka ligi ludzi jest od 1 do 22.');
  }
  const leg = matchday > 11 ? matchday - 12 : matchday - 1;
  const swap = matchday > 11;
  const rotating = seats.slice(1);
  const spun = rotating.map((_, index) => rotating[(index + leg) % rotating.length]!);
  const ring = [seats[0]!, ...spun];
  const pairs: HumanPairing[] = [];
  for (let i = 0; i < HUMAN_LEAGUE_SIZE / 2; i += 1) {
    const left = ring[i]!;
    const right = ring[HUMAN_LEAGUE_SIZE - 1 - i]!;
    const homeLeft = (leg + i) % 2 === 0;
    const home = homeLeft ? left : right;
    const away = homeLeft ? right : left;
    pairs.push({
      matchday,
      home: swap ? away : home,
      away: swap ? home : away,
    });
  }
  return pairs;
}

export function pairingForClub(
  seats: readonly HumanSeat[],
  matchday: number,
  clubId: string,
): HumanPairing | null {
  return (
    pairingsForMatchday(seats, matchday).find(
      (pair) => pair.home.id === clubId || pair.away.id === clubId,
    ) ?? null
  );
}

/** Same string for both clubs. Home and away ids are the sides, not the viewer. */
export function sharedHumanSeed(
  seasonKey: string,
  matchday: number,
  homeId: string,
  awayId: string,
): number {
  return hashSeed(`human:${seasonKey}:${matchday}:${homeId}:${awayId}`);
}

export function kickoffDate(seasonKey: string, matchday: number): string {
  const [year, month, day] = seasonKey.split('-').map(Number);
  const date = new Date(Date.UTC(year!, (month ?? 1) - 1, (day ?? 1) + (matchday - 1)));
  return date.toISOString().slice(0, 10);
}

export function warsawHour(date: Date): number {
  const hour = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Warsaw',
    hour: '2-digit',
    hourCycle: 'h23',
  })
    .formatToParts(date)
    .find((part) => part.type === 'hour')?.value;
  const value = Number(hour);
  if (!Number.isFinite(value)) return 0;
  return value === 24 ? 0 : value;
}

export function kickoffWindowState(now: Date, kickoffOn: string): KickoffWindow {
  const today = warsawDateKey(now);
  if (today < kickoffOn) return 'before';
  if (today > kickoffOn) return 'after';
  const hour = warsawHour(now);
  if (hour < KICKOFF_OPEN_HOUR) return 'before';
  if (hour >= KICKOFF_CLOSE_HOUR) return 'after';
  return 'open';
}

export function kickoffWindowSentence(state: KickoffWindow): string | null {
  if (state === 'before') return 'Wspólny początek o 18:00 czasu warszawskiego.';
  if (state === 'after')
    return 'Wspólna transmisja już była. Możesz obejrzeć i zapisać zaległy mecz. Wynik jest jeden dla obu klubów.';
  return null;
}

/**
 * Oldest unplayed round whose kickoff date has arrived.
 * One human match per Warsaw day: if one is already played today, wait.
 */
export function nextHumanRound(input: {
  readonly seasonKey: string;
  readonly playedRounds: readonly number[];
  readonly now: Date;
  readonly playedHumanToday: boolean;
}): number | null {
  if (input.playedHumanToday) return null;
  const today = warsawDateKey(input.now);
  const played = new Set(input.playedRounds);
  for (let round = 1; round <= HUMAN_ROUND_COUNT; round += 1) {
    if (played.has(round)) continue;
    if (kickoffDate(input.seasonKey, round) <= today) return round;
    return null;
  }
  return null;
}

export function isBotClubId(id: string): boolean {
  return id.startsWith('opp-');
}
