export type CompetitionFilter = 'ALL' | 'league' | 'cup' | 'friendly';

export type MatchStatus = 'played' | 'upcoming' | 'scheduled' | 'live';

export type FormResult = 'W' | 'R' | 'P';

export type Fixture = {
  id: string;
  day: number;
  whenLabel: string;
  dateLabel?: string;
  kickoff?: string;
  competition: Exclude<CompetitionFilter, 'ALL'>;
  competitionLabel: string;
  opponent: string;
  opponentShort: string;
  home: boolean;
  stadium: string;
  status: MatchStatus;
  score?: string;
  result?: FormResult;
};

export type TeamSnap = {
  name: string;
  shortName: string;
  form: FormResult[];
  place: number;
  points: number;
};

export type PreMatchBundle = {
  fixture: Fixture;
  weather: string;
  weatherDetail: string;
  weatherNote: string;
  temperature: string;
  attendance: string;
  referee: string;
  countdown: string;
  ourTeam: TeamSnap;
  theirTeam: TeamSnap;
  stakes: { id: string; label: string; value: string }[];
  h2h: { score: string; when: string }[];
  formation: string;
  styleLabel: string;
  tactics: { id: string; label: string; value: number }[];
  ourLineup: {
    pos: string;
    name: string;
    number: number;
    rating: number;
    condition: number;
    id?: string;
    captain?: boolean;
  }[];
  theirLineup: { pos: string; name: string; number: number }[];
  pitchSlots: { number: number; x: number; y: number }[];
  teamCondition: { label: string; value: number };
  ticker: string;
  decisions: { id: string; label: string; hint: string }[];
};

export type LiveEventKind = 'goal' | 'card' | 'sub' | 'shot' | 'corner' | 'info';

export type LiveMatchBundle = {
  fixture: Fixture;
  clock: string;
  period: string;
  homeScore: number;
  awayScore: number;
  viewers: string;
  weather: string;
  stadiumCapacity: string;
  possession: { home: number; away: number };
  stats: { label: string; home: number; away: number }[];
  momentum: number[];
  events: { id: string; minute: string; kind: LiveEventKind; text: string; highlight?: boolean }[];
  commands: { id: string; label: string }[];
  instructions: { id: string; label: string; value: string; on?: boolean }[];
  subs: { remaining: string; bench: { name: string; pos: string }[] };
  viewModes: { id: string; label: string }[];
};

export const COMPETITION_LABEL: Record<Exclude<CompetitionFilter, 'ALL'>, string> = {
  league: 'Liga',
  cup: 'Puchar',
  friendly: 'Towarzyskie',
};

export const STATUS_LABEL: Record<MatchStatus, string> = {
  played: 'Rozegrany',
  upcoming: 'Nadchodzący',
  scheduled: 'Zaplanowany',
  live: 'Live',
};

export const FIXTURES: Fixture[] = [
  {
    id: 'm-041',
    day: 41,
    whenLabel: 'Dzień 41',
    dateLabel: '21.05.2025, Śr',
    competition: 'league',
    competitionLabel: 'Liga · kolejka 11',
    opponent: 'Lechia Południe',
    opponentShort: 'LPD',
    home: true,
    stadium: 'Arena Lastovia',
    status: 'played',
    score: '2:0',
    result: 'W',
  },
  {
    id: 'm-039',
    day: 39,
    whenLabel: 'Dzień 39',
    dateLabel: '18.05.2025, Nd',
    competition: 'league',
    competitionLabel: 'Liga · kolejka 10',
    opponent: 'Górnik Wschód',
    opponentShort: 'GW',
    home: false,
    stadium: 'Stadion Wschodni',
    status: 'played',
    score: '1:3',
    result: 'P',
  },
  {
    id: 'm-037',
    day: 37,
    whenLabel: 'Dzień 37',
    dateLabel: '14.05.2025, Śr',
    competition: 'friendly',
    competitionLabel: 'Sparing',
    opponent: 'Akademia Nord',
    opponentShort: 'AN',
    home: true,
    stadium: 'Arena Lastovia',
    status: 'played',
    score: '0:0',
    result: 'R',
  },
  {
    id: 'm-next',
    day: 43,
    whenLabel: 'Jutro 18:00',
    dateLabel: '24.05.2025, Sob',
    kickoff: '18:00',
    competition: 'league',
    competitionLabel: 'Liga · kolejka 12',
    opponent: 'Orzeł Grodzisk',
    opponentShort: 'ORG',
    home: true,
    stadium: 'Arena Lastovia',
    status: 'upcoming',
  },
  {
    id: 'm-045',
    day: 45,
    whenLabel: 'Dzień 45',
    dateLabel: '28.05.2025, Śr',
    kickoff: '18:00',
    competition: 'league',
    competitionLabel: 'Liga · kolejka 13',
    opponent: 'Atletyk Centrum',
    opponentShort: 'ATC',
    home: false,
    stadium: 'Centrum Arena',
    status: 'scheduled',
  },
  {
    id: 'm-048',
    day: 48,
    whenLabel: 'Dzień 48',
    dateLabel: '01.06.2025, Nd',
    kickoff: '20:00',
    competition: 'cup',
    competitionLabel: 'Puchar · 1/16',
    opponent: 'Victoria Harbor',
    opponentShort: 'VH',
    home: true,
    stadium: 'Arena Lastovia',
    status: 'scheduled',
  },
];

export function getFixtureById(id: string): Fixture | undefined {
  return FIXTURES.find((f) => f.id === id);
}

export function getNextFixture(): Fixture {
  const next =
    FIXTURES.find((f) => f.status === 'upcoming' || f.status === 'live') ??
    FIXTURES.find((f) => f.status === 'scheduled');
  if (next) return next;
  if (FIXTURES.length === 0) {
    throw new Error('FIXTURES is empty');
  }
  return FIXTURES[0]!;
}

export function getPreMatchBundle(id: string): PreMatchBundle | undefined {
  const fixture = getFixtureById(id);
  if (!fixture) return undefined;
  if (fixture.status === 'played') return undefined;

  return {
    fixture,
    weather: 'Pochmurno',
    weatherDetail: 'Lekki deszcz',
    weatherNote: 'Placeholder pogody — bez wpływu na silnik w tej iteracji',
    temperature: '12°C',
    attendance: '1 250',
    referee: 'Tomasz Wójcik',
    countdown: fixture.status === 'upcoming' ? '18:42:11' : '—',
    ourTeam: {
      name: 'FC Lastovia',
      shortName: 'FCL',
      form: ['W', 'W', 'R', 'P', 'W'],
      place: 4,
      points: 22,
    },
    theirTeam: {
      name: fixture.opponent,
      shortName: fixture.opponentShort,
      form: ['P', 'R', 'W', 'P', 'R'],
      place: 3,
      points: 24,
    },
    stakes: [
      { id: 'title', label: 'Walka o pozycję', value: '3 pkt · Top 4' },
      { id: 'prestige', label: 'Prestiż', value: 'Derby regionu' },
      {
        id: 'finance',
        label: 'Finanse',
        value: fixture.competition === 'cup' ? 'Premia pucharowa' : '42 500 € bramki',
      },
    ],
    h2h: [
      { score: '2:1', when: 'Sezon 1 · kolejka 3' },
      { score: '1:1', when: 'Sezon 1 · puchar' },
      { score: '0:2', when: 'Sezon 0 · sparing' },
    ],
    formation: '4-2-3-1 szeroko',
    styleLabel: 'Zbilansowany',
    tactics: [
      { id: 'mentality', label: 'Mentalność', value: 58 },
      { id: 'possession', label: 'Posiadanie', value: 55 },
      { id: 'pressing', label: 'Pressing', value: 62 },
      { id: 'tempo', label: 'Tempo', value: 60 },
      { id: 'width', label: 'Szerokość', value: 65 },
      { id: 'density', label: 'Zagęszczenie', value: 52 },
    ],
    ourLineup: [
      { pos: 'BR', name: 'M. Nowak', number: 1, rating: 64, condition: 4, id: 'p-nowak' },
      { pos: 'PO', name: 'K. Baran', number: 2, rating: 61, condition: 3, id: 'p-baran' },
      { pos: 'ŚO', name: 'P. Lis', number: 4, rating: 63, condition: 3, id: 'p-lis' },
      { pos: 'ŚO', name: 'A. Sowa', number: 5, rating: 60, condition: 4, id: 'p-sowa' },
      { pos: 'LO', name: 'M. Kowalik', number: 3, rating: 58, condition: 3, id: 'p-kowalik' },
      { pos: 'ŚP', name: 'D. K.', number: 8, rating: 68, condition: 4, id: 'p-dk', captain: true },
      { pos: 'ŚP', name: 'A. Wróbel', number: 6, rating: 62, condition: 3, id: 'p-wrobel' },
      { pos: 'PO', name: 'T. Marek', number: 7, rating: 65, condition: 4, id: 'p-marek' },
      { pos: 'ŚP', name: 'R. Lew', number: 10, rating: 59, condition: 3 },
      { pos: 'PN', name: 'K. Biały', number: 11, rating: 57, condition: 4 },
      { pos: 'N', name: 'J. Czarny', number: 9, rating: 66, condition: 3 },
    ],
    theirLineup: [
      { pos: 'BR', name: 'R. Zieliński', number: 1 },
      { pos: 'OB', name: 'S. Kruk', number: 2 },
      { pos: 'OB', name: 'B. Palej', number: 4 },
      { pos: 'OB', name: 'L. Most', number: 5 },
      { pos: 'OB', name: 'W. Dąb', number: 3 },
      { pos: 'ŚP', name: 'I. Domagała', number: 6 },
      { pos: 'ŚP', name: 'N. Czech', number: 8 },
      { pos: 'PO', name: 'F. Orzeł', number: 7 },
      { pos: 'PO', name: 'H. Gaj', number: 10 },
      { pos: 'N', name: 'P. Sokół', number: 9 },
      { pos: 'N', name: 'T. Lis', number: 11 },
    ],
    pitchSlots: [
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
    ],
    teamCondition: { label: 'Dobra', value: 78 },
    ticker: 'Kontuzja P. Lis — ograniczona dyspozycja. Kibice wierzą w punktację.',
    decisions: [
      { id: 'lineup', label: 'Skład', hint: 'Potwierdź wyjściową jedenastkę (edycja w kolejnym EPIC)' },
      { id: 'tactics', label: 'Taktyka', hint: 'Ustawienie i intensywność — tylko podgląd' },
      { id: 'setpieces', label: 'Stałe fragmenty', hint: 'Do rozbudowy w kolejnych EPIC' },
    ],
  };
}

export function getLiveMatchBundle(id: string): LiveMatchBundle | undefined {
  const fixture = getFixtureById(id);
  if (!fixture) return undefined;
  if (fixture.status === 'played') return undefined;

  return {
    fixture,
    clock: '00:00',
    period: 'Pre-silnik',
    homeScore: 0,
    awayScore: 0,
    viewers: '—',
    weather: '12°C · pochmurno',
    stadiumCapacity: '12 400',
    possession: { home: 52, away: 48 },
    stats: [
      { label: 'Strzały', home: 0, away: 0 },
      { label: 'Na bramkę', home: 0, away: 0 },
      { label: 'Faule', home: 0, away: 0 },
      { label: 'Rożne', home: 0, away: 0 },
      { label: 'Żółte', home: 0, away: 0 },
    ],
    momentum: [50, 52, 48, 55, 53, 50, 47, 49, 51, 54, 52, 50],
    events: [
      {
        id: 'e0',
        minute: '0\'',
        kind: 'info',
        text: 'Oczekiwanie na pipeline symulacji LFE. Feed gotowy pod eventy silnika.',
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
      { id: 'focus', label: 'Focus gry', value: 'Lewe skrzydło' },
      { id: 'trap', label: 'Pułapka ofsajdowa', value: 'Włączona', on: true },
      { id: 'counter', label: 'Kontry', value: 'Średnie' },
    ],
    subs: {
      remaining: '3/3',
      bench: [
        { name: 'A. Sowa', pos: 'OB' },
        { name: 'M. Kowalik', pos: 'PO' },
        { name: 'R. Lew', pos: 'N' },
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
