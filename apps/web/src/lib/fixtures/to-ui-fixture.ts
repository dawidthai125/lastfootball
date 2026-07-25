import type { ClubDto } from '@/lib/club/types';
import { STARTER_PACKAGE } from '@/lib/club/types';
import type { Fixture, LiveMatchBundle, PreMatchBundle } from '@/data/fixtures';
import type { FixtureDto } from '@/lib/fixtures/types';
import { seedOpponentSquad, type RosterPlayerSeed } from '@/lib/squad';

/** Adapt FixtureDto → UI Fixture used by Prematch/Live chrome. */
export function toUiFixture(dto: FixtureDto, club: ClubDto): Fixture {
  const score =
    dto.status === 'played' && dto.homeScore != null && dto.awayScore != null
      ? `${dto.homeScore}:${dto.awayScore}`
      : undefined;

  return {
    id: dto.id,
    day: dto.matchday,
    whenLabel: dto.status === 'upcoming' ? 'Dziś' : `Kolejka ${dto.matchday}`,
    dateLabel: `Kolejka ${dto.matchday}`,
    kickoff: dto.status === 'upcoming' ? 'Teraz' : undefined,
    competition: 'league',
    competitionLabel: `${STARTER_PACKAGE.league} · kolejka ${dto.matchday}`,
    opponent: dto.opponent.name,
    opponentShort: dto.opponent.shortName,
    opponentClubId: dto.opponentClubId,
    home: dto.isHome,
    stadium: dto.isHome ? STARTER_PACKAGE.stadiumLabel(club.name) : `Stadion ${dto.opponent.name}`,
    status:
      dto.status === 'played' ? 'played' : dto.status === 'upcoming' ? 'upcoming' : 'scheduled',
    score,
  };
}

const PITCH_SLOTS = [
  { number: 1, x: 50, y: 88 },
  { number: 2, x: 18, y: 68 },
  { number: 4, x: 38, y: 72 },
  { number: 5, x: 62, y: 72 },
  { number: 3, x: 82, y: 68 },
  { number: 6, x: 35, y: 52 },
  { number: 8, x: 65, y: 52 },
  { number: 7, x: 18, y: 36 },
  { number: 10, x: 50, y: 34 },
  { number: 11, x: 82, y: 36 },
  { number: 9, x: 50, y: 16 },
] as const;

export function buildLeaguePreMatchBundle(
  club: ClubDto,
  dto: FixtureDto,
  ourXi: readonly RosterPlayerSeed[],
): PreMatchBundle {
  const fixture = toUiFixture(dto, club);
  const our = ourXi;
  const their = seedOpponentSquad(dto.opponentClubId);

  return {
    fixture,
    weather: 'Pochmurnie',
    weatherDetail: 'Warunki typowe dla IV ligi',
    weatherNote: 'Mecz ligowy — bez wpływu pogody na silnik (Thin A)',
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
      { id: 'league', label: 'Rozgrywki', value: STARTER_PACKAGE.league },
      { id: 'md', label: 'Kolejka', value: String(dto.matchday) },
      {
        id: 'venue',
        label: 'Stadion',
        value: dto.isHome ? STARTER_PACKAGE.stadiumLabel(club.name) : dto.opponent.name,
      },
    ],
    h2h: [],
    formation: '4-4-2',
    styleLabel: 'Zbilansowany',
    tactics: [
      { id: 'mentality', label: 'Mentalność', value: 50 },
      { id: 'possession', label: 'Posiadanie', value: 50 },
      { id: 'pressing', label: 'Pressing', value: 50 },
      { id: 'tempo', label: 'Tempo', value: 50 },
      { id: 'width', label: 'Szerokość', value: 55 },
      { id: 'density', label: 'Zagęszczenie', value: 50 },
    ],
    ourLineup: our.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
      rating: 60,
      condition: 4,
      id: p.id,
      captain: p.captain,
    })),
    theirLineup: their.map((p) => ({
      pos: p.pos,
      name: p.name,
      number: p.number,
    })),
    pitchSlots: [...PITCH_SLOTS],
    teamCondition: { label: 'Gotowa', value: 82 },
    ticker: `${club.name} · kolejka ${dto.matchday} vs ${dto.opponent.name}.`,
    decisions: [
      {
        id: 'lineup',
        label: 'Skład',
        hint: 'Skład startowy — potwierdź i wyjdź na boisko',
      },
      { id: 'tactics', label: 'Taktyka', hint: 'Ustawienie 4-4-2 (podgląd)' },
      { id: 'setpieces', label: 'Stałe fragmenty', hint: 'Domyślne' },
    ],
  };
}

export function buildLeagueLiveBundle(club: ClubDto, dto: FixtureDto): LiveMatchBundle {
  const fixture = toUiFixture(dto, club);
  return {
    fixture,
    clock: '00:00',
    period: 'Kick-off',
    homeScore: 0,
    awayScore: 0,
    viewers: '—',
    weather: '14°C · pochmurnie',
    stadiumCapacity: STARTER_PACKAGE.stadiumCapacity,
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
        text: `Kolejka ${dto.matchday}: ${club.name} vs ${dto.opponent.name}.`,
      },
    ],
    commands: [
      { id: 'attack', label: 'Atak agresywny' },
      { id: 'press', label: 'Pressing wysoki' },
      { id: 'tempo', label: 'Tempo szybkie' },
      { id: 'balance', label: 'Zbilansowany' },
      { id: 'defend', label: 'Blok niski' },
      { id: 'wide', label: 'Gra szeroka' },
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
