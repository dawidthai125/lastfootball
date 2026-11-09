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
  /** League SSOT catalog id when from fixtures table. */
  opponentClubId?: string;
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
