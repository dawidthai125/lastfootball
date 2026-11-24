import { CUP_ROUND_AFTER_LEAGUE, cupRoundForMatchday } from '@/lib/cup/matchdays';
import type { FixtureDto } from '@/lib/fixtures/types';
import { humanRoundFromFixture } from '@/lib/league/human-league';
import { unitHash } from '@/lib/match/hash-seed';
import { formatSeats, stadiumSeats } from '@/lib/stadium/levels';

/** Scenery of one fixture. Pure derive, no engine effect (D129). */
export type MatchFacts = {
  readonly referee: string;
  /** "Pochmurnie" */
  readonly weather: string;
  /** "14°C" */
  readonly temperature: string;
  /** "14°C · pochmurnie" */
  readonly weatherLine: string;
  /** "2 940" — never above the seats of the ground. */
  readonly attendance: string;
};

const REFEREES = [
  'Piotr Malinowski',
  'Tomasz Zawilski',
  'Marek Olszarz',
  'Adam Brzezicki',
  'Krzysztof Wielgórski',
  'Paweł Dębniak',
  'Jakub Sarnowicz',
  'Rafał Kłosiński',
  'Michał Jeziorny',
  'Grzegorz Turowiak',
  'Łukasz Modrzycki',
  'Wojciech Karpiel',
] as const;

const WARM_SKY = ['Słonecznie', 'Słonecznie', 'Przelotne chmury', 'Pochmurnie', 'Deszcz'] as const;
const COOL_SKY = ['Słonecznie', 'Pochmurnie', 'Pochmurnie', 'Wietrznie', 'Deszcz'] as const;
const COLD_SKY = ['Pochmurnie', 'Pochmurnie', 'Mgła', 'Wietrznie', 'Śnieg'] as const;

/** League week 1–22 the fixture falls in. */
function seasonWeek(dto: Pick<FixtureDto, 'competition' | 'matchday'>): number {
  const cupRound = dto.competition === 'cup' ? cupRoundForMatchday(dto.matchday) : null;
  const week = cupRound
    ? CUP_ROUND_AFTER_LEAGUE[cupRound]
    : ((dto.competition === 'human' ? humanRoundFromFixture(dto.matchday) : null) ?? dto.matchday);
  return ((Math.max(1, Math.trunc(week)) - 1) % 22) + 1;
}

/** Weeks 1–11 run from August to November, 12–22 from late February to May. */
function typicalTemperature(week: number): number {
  return week <= 11 ? 22 - (week - 1) * 1.7 : 3 + (week - 12) * 1.5;
}

function pick<T>(list: readonly T[], u: number): T {
  return list[Math.min(list.length - 1, Math.floor(u * list.length))]!;
}

function fillRate(dto: FixtureDto, key: string, wet: boolean): number {
  const cupRound = dto.competition === 'cup' ? cupRoundForMatchday(dto.matchday) : null;
  // A shared human match has two viewers, and only one of them may read the host's mood.
  const known = dto.competition === 'human' || cupRound === 4 ? undefined : dto.homeFanMood;
  const mood = Math.max(0, Math.min(100, known ?? 60));
  const visitor = dto.isHome ? dto.opponentClubId : dto.clubId;
  return (
    0.35 +
    mood * 0.005 +
    unitHash(`${visitor}|draw`) * 0.08 +
    (cupRound === 4 ? 0.2 : cupRound ? 0.05 : 0) -
    (wet ? 0.06 : 0) +
    (unitHash(`${key}|crowd`) - 0.5) * 0.1
  );
}

/**
 * @param standsLevel stands of the ground the match is played on (a cup final is neutral)
 */
export function resolveMatchFacts(dto: FixtureDto, standsLevel: number): MatchFacts {
  const key =
    dto.competition === 'human' && typeof dto.sharedSeed === 'number'
      ? `human|${dto.sharedSeed}`
      : dto.id;
  const degrees = Math.round(
    typicalTemperature(seasonWeek(dto)) + (unitHash(`${key}|temp`) - 0.5) * 8,
  );
  const sky = degrees <= 2 ? COLD_SKY : degrees <= 12 ? COOL_SKY : WARM_SKY;
  const weather = pick(sky, unitHash(`${key}|sky`));
  const wet = weather === 'Deszcz' || weather === 'Śnieg';
  const seats = stadiumSeats(standsLevel);
  const attendance = Math.min(seats, Math.max(0, Math.round(seats * fillRate(dto, key, wet))));
  const temperature = `${degrees}°C`;
  return {
    referee: pick(REFEREES, unitHash(`${key}|referee`)),
    weather,
    temperature,
    weatherLine: `${temperature} · ${weather.toLowerCase()}`,
    attendance: formatSeats(attendance),
  };
}
