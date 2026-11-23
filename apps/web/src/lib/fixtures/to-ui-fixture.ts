import type { FormationCode } from '@lastfootball/lfe';

import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import { stadiumLook, stadiumSeatLabel } from '@/lib/stadium/levels';
import type { Fixture, LiveMatchBundle, PreMatchBundle } from '@/data/fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { cupRoundForMatchday, cupRoundLabel } from '@/lib/cup/matchdays';
import { humanRoundFromFixture } from '@/lib/league/human-league';
import { leagueTierGenitive, resolveLeagueTierLabel } from '@/lib/league/league-tier';
import {
  preMatchStakeValue,
  preMatchWeatherDetail,
  preMatchWeatherNote,
} from '@/lib/fixtures/pre-match-copy';
import { orderForFormation, pitchSlotsFor } from '@/lib/match/order-xi';
import { seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';
import { kickoffPressingWithLine } from '@/lib/training/press-line';
import { kickoffTempo, kickoffWidth } from '@/lib/training/style';

function groundStadiumLabel(dto: FixtureDto, club: ClubDto): string {
  const cupRound = cupRoundForMatchday(dto.matchday);
  const base =
    dto.competition === 'cup' && cupRound === 4
      ? 'Stadion finałowy'
      : dto.isHome
        ? STARTER_PACKAGE.stadiumLabel(club.name)
        : `Stadion ${dto.opponent.name}`;
  const pitch = dto.homePitchLevel ?? 0;
  const stands = dto.homeStandsLevel ?? 0;
  if (pitch <= 0 && stands <= 0) return base;
  if (dto.competition === 'cup' && cupRound === 4) return base;
  const look = stadiumLook({ stands, pitch, trainingCenter: 0 });
  return `${base} · ${look.stands} · ${look.pitch}`;
}

/** Same owner rule as the match session. A missing habit stays at pressing 50. */
function ownerKickoffPressing(dto: FixtureDto): number {
  const shared = typeof dto.sharedSeed === 'number';
  const tacticsSide = shared ? 'home' : dto.isHome ? 'home' : 'away';
  const habit =
    tacticsSide === 'home' ? (dto.homeStylePressing ?? 0) : (dto.viewerStylePressing ?? 0);
  const line =
    tacticsSide === 'home' ? (dto.homePressLine ?? 'mid') : (dto.viewerPressLine ?? 'mid');
  const shape =
    tacticsSide === 'home' ? (dto.homePressShape ?? 'flat') : (dto.viewerPressShape ?? 'flat');
  return kickoffPressingWithLine(habit, line, shape);
}

/** Same owner rule as pressing. A missing habit stays at tempo 50. */
function ownerKickoffTempo(dto: FixtureDto): number {
  const shared = typeof dto.sharedSeed === 'number';
  const tacticsSide = shared ? 'home' : dto.isHome ? 'home' : 'away';
  const habit = tacticsSide === 'home' ? (dto.homeStyleTempo ?? 0) : (dto.viewerStyleTempo ?? 0);
  return kickoffTempo(habit);
}

/** Same owner rule as pressing. A missing habit stays at width 50. */
function ownerKickoffWidth(dto: FixtureDto): number {
  const shared = typeof dto.sharedSeed === 'number';
  const tacticsSide = shared ? 'home' : dto.isHome ? 'home' : 'away';
  const habit = tacticsSide === 'home' ? (dto.homeStyleWidth ?? 0) : (dto.viewerStyleWidth ?? 0);
  return kickoffWidth(habit);
}

/** Saved note only. Blank and missing notes stay empty — never invented. */
function uiMatchNote(note: string | null | undefined): string | null {
  if (typeof note !== 'string' || note.trim().length === 0) return null;
  return note;
}

/** Adapt FixtureDto → UI Fixture used by Prematch/Live chrome. */
export function toUiFixture(dto: FixtureDto, club: ClubDto): Fixture {
  const score =
    dto.status === 'played' && dto.homeScore != null && dto.awayScore != null
      ? `${dto.homeScore}:${dto.awayScore}`
      : undefined;
  const leagueLabel = resolveLeagueTierLabel(club.leagueTier);
  const cupRound = dto.competition === 'cup' ? cupRoundForMatchday(dto.matchday) : null;
  const cupLabel = cupRound ? cupRoundLabel(cupRound) : 'Puchar';
  const humanRound = dto.competition === 'human' ? humanRoundFromFixture(dto.matchday) : null;

  return {
    id: dto.id,
    day: dto.matchday,
    whenLabel:
      dto.competition === 'challenge'
        ? 'Wyzwanie'
        : dto.competition === 'human'
          ? 'Liga ludzi'
          : dto.competition === 'cup'
            ? dto.status === 'upcoming'
              ? 'Dziś'
              : cupLabel
            : dto.status === 'upcoming'
              ? 'Dziś'
              : `Kolejka ${dto.matchday}`,
    dateLabel:
      dto.competition === 'challenge'
        ? 'Wyzwanie'
        : dto.competition === 'human'
          ? `Liga ludzi · kolejka ${humanRound ?? dto.matchday}`
          : dto.competition === 'cup'
            ? cupLabel
            : `Kolejka ${dto.matchday}`,
    kickoff:
      dto.competition === 'human' ? '18:00' : dto.status === 'upcoming' ? 'Teraz' : undefined,
    competition:
      dto.competition === 'cup' ? 'cup' : dto.competition === 'challenge' ? 'friendly' : 'league',
    kickoffCompetition: dto.competition,
    competitionLabel:
      dto.competition === 'challenge'
        ? 'Wyzwanie'
        : dto.competition === 'human'
          ? `Liga ludzi · kolejka ${humanRound ?? dto.matchday}`
          : dto.competition === 'cup'
            ? `Puchar Krajowy · ${cupLabel}`
            : `${leagueLabel} · kolejka ${dto.matchday}`,
    opponent: dto.opponent.name,
    opponentShort: dto.opponent.shortName,
    opponentClubId: dto.opponentClubId,
    home: dto.isHome,
    stadium: groundStadiumLabel(dto, club),
    status:
      dto.status === 'played' ? 'played' : dto.status === 'upcoming' ? 'upcoming' : 'scheduled',
    score,
    matchNote: dto.status === 'played' ? uiMatchNote(dto.matchNote) : null,
  };
}

/** Average stored energy of the XI — the same number the engine starts from. */
function teamCondition(xi: readonly RosterPlayerSeed[]): { label: string; value: number } {
  const value =
    xi.length === 0 ? 80 : Math.round(xi.reduce((sum, p) => sum + (p.energy ?? 80), 0) / xi.length);
  const label = value >= 70 ? 'Gotowa' : value >= 45 ? 'Podmęczona' : 'Zmęczona';
  return { label, value };
}

export function buildLeaguePreMatchBundle(
  club: ClubDto,
  dto: FixtureDto,
  ourXi: readonly RosterPlayerSeed[],
  formationCode: FormationCode = '4-4-2',
  theirXi?: readonly RosterPlayerSeed[] | null,
): PreMatchBundle {
  const fixture = toUiFixture(dto, club);
  const our = orderForFormation(ourXi, formationCode);
  const their =
    theirXi && theirXi.length === 11
      ? orderForFormation(theirXi, '4-4-2')
      : seedOpponentSquad(dto.opponentClubId, club.leagueTier);

  return {
    fixture,
    weather: 'Pochmurnie',
    weatherDetail: preMatchWeatherDetail(dto.competition, leagueTierGenitive(club.leagueTier)),
    weatherNote: preMatchWeatherNote(dto.competition),
    temperature: '14°C',
    attendance: dto.isHome ? '2 400' : '1 800',
    referee: 'Piotr Malinowski',
    countdown: 'Gotowy',
    ourTeam: {
      name: club.name,
      shortName: club.shortName,
      form: [],
      place: 0,
      points: 0,
    },
    theirTeam: {
      name: dto.opponent.name,
      shortName: dto.opponent.shortName,
      form: [],
      place: 0,
      points: 0,
    },
    stakes: [
      {
        id: 'league',
        label: 'Rozgrywki',
        value: preMatchStakeValue(dto.competition, resolveLeagueTierLabel(club.leagueTier)),
      },
      {
        id: 'md',
        label: 'Kolejka',
        value: String(
          dto.competition === 'human'
            ? (humanRoundFromFixture(dto.matchday) ?? dto.matchday)
            : dto.matchday,
        ),
      },
      {
        id: 'venue',
        label: 'Stadion',
        value: dto.isHome ? STARTER_PACKAGE.stadiumLabel(club.name) : dto.opponent.name,
      },
    ],
    h2h: [],
    formation: formationCode,
    styleLabel: 'Zbilansowany',
    tactics: [
      { id: 'mentality', label: 'Mentalność', value: 50 },
      { id: 'possession', label: 'Posiadanie', value: 50 },
      { id: 'pressing', label: 'Pressing', value: ownerKickoffPressing(dto) },
      { id: 'tempo', label: 'Tempo', value: ownerKickoffTempo(dto) },
      { id: 'width', label: 'Szerokość', value: ownerKickoffWidth(dto) },
      { id: 'density', label: 'Zagęszczenie', value: 50 },
    ],
    ourLineup: our.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
      rating: p.skill ?? 60,
      condition: Math.max(1, Math.min(5, Math.round((p.energy ?? 80) / 20))),
      id: p.id,
      captain: p.captain,
    })),
    theirLineup: their.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
    })),
    pitchSlots: pitchSlotsFor(our, formationCode),
    teamCondition: teamCondition(our),
    ticker:
      dto.competition === 'cup'
        ? `${club.name} · Puchar Krajowy vs ${dto.opponent.name}.`
        : dto.competition === 'human'
          ? `${club.name} · Liga ludzi vs ${dto.opponent.name}. Jeden mecz z jednego seeda.`
          : `${club.name} · kolejka ${dto.matchday} vs ${dto.opponent.name}.`,
    decisions: [
      {
        id: 'lineup',
        label: 'Skład',
        hint: 'Skład startowy — potwierdź i wyjdź na boisko',
      },
      { id: 'tactics', label: 'Taktyka', hint: `Ustawienie ${formationCode}` },
      { id: 'setpieces', label: 'Stałe fragmenty', hint: 'Domyślne' },
    ],
  };
}

function liveGround(dto: FixtureDto): { stands: number; pitch: number } {
  const cupRound = dto.competition === 'cup' ? cupRoundForMatchday(dto.matchday) : null;
  if (cupRound === 4) return { stands: 0, pitch: 0 };
  return {
    stands: dto.homeStandsLevel ?? 0,
    pitch: dto.homePitchLevel ?? 0,
  };
}

export function buildLeagueLiveBundle(club: ClubDto, dto: FixtureDto): LiveMatchBundle {
  const fixture = toUiFixture(dto, club);
  const ground = liveGround(dto);
  return {
    fixture,
    clock: '00:00',
    period: 'Kick-off',
    homeScore: 0,
    awayScore: 0,
    viewers: '—',
    weather: '14°C · pochmurnie',
    stadiumCapacity: stadiumSeatLabel(ground.stands),
    groundStands: ground.stands,
    groundPitch: ground.pitch,
    possession: { home: 50, away: 50 },
    stats: [
      { label: 'Strzały', home: 0, away: 0 },
      { label: 'Na bramkę', home: 0, away: 0 },
      { label: 'Faule', home: 0, away: 0 },
      { label: 'Rożne', home: 0, away: 0 },
      { label: 'Żółte', home: 0, away: 0 },
    ],
    momentum: [50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50, 50],
    events: [
      {
        id: 'e0',
        minute: "0'",
        kind: 'info',
        text:
          dto.competition === 'cup'
            ? `Puchar: ${club.name} vs ${dto.opponent.name}.`
            : dto.competition === 'human'
              ? `Liga ludzi: ${club.name} vs ${dto.opponent.name}. Taktyka jest zamknięta.`
              : `Kolejka ${dto.matchday}: ${club.name} vs ${dto.opponent.name}.`,
      },
    ],
    commands:
      dto.competition === 'human'
        ? []
        : [
            { id: 'attack', label: 'Atak agresywny' },
            { id: 'press', label: 'Pressing wysoki' },
            { id: 'tempo', label: 'Tempo szybkie' },
            { id: 'balance', label: 'Zbilansowany' },
            { id: 'defend', label: 'Blok niski' },
            { id: 'wide', label: 'Gra szeroka' },
            { id: 'form-442', label: 'Układ 4-4-2' },
            { id: 'form-433', label: 'Układ 4-3-3' },
          ],
    instructions: [
      { id: 'focus', label: 'Focus gry', value: 'Środek' },
      { id: 'trap', label: 'Pułapka ofsajdowa', value: 'Wyłączona', on: false },
      { id: 'counter', label: 'Kontry', value: 'Średnie' },
    ],
    subs: {
      remaining: '3/3',
      bench: [
        { name: 'Rezerwowy A', pos: 'OB' },
        { name: 'Rezerwowy B', pos: 'PO' },
        { name: 'Rezerwowy C', pos: 'N' },
      ],
    },
    viewModes: [
      { id: 'tactical', label: 'Taktyczny' },
      { id: 'shape', label: 'Ustawienie' },
      { id: 'pressing', label: 'Pressing' },
      { id: 'balance', label: 'Balans' },
    ],
  };
}
