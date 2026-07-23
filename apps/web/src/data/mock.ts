/** Placeholder session data for dense chrome until live APIs exist. */

export const sessionChrome = {
  server: 'EU-1',
  season: 1,
  day: 42,
  money: 1_245_800,
  premium: 120,
  energy: { current: 68, max: 100 },
  notifications: 3,
  player: {
    name: 'Dawid K.',
    club: 'FC Lastovia',
    position: 'ŚP',
    avatarInitials: 'DK',
  },
} as const;

export const dashboardMock = {
  club: {
    name: 'FC Lastovia',
    shortName: 'FCL',
    division: 'III liga · grupa B',
    stadium: 'Arena Lastovia',
    place: 4,
    morale: 72,
    reputation: 48,
    supporters: 12_400,
  },
  nextMatch: {
    opponent: 'Orzeł Grodzisk',
    opponentShort: 'ORG',
    competition: 'Liga · kolejka 12',
    when: 'Jutro 18:00',
    countdown: '18:42:11',
    home: true,
    stake: 'Walka o Top 4',
  },
  nextTraining: {
    focus: 'Wytrzymałość',
    when: 'Dziś 20:00',
    intensity: 'Średnia',
  },
  form: 74,
  injuries: [
    { name: 'M. Nowak', detail: 'Uraz mięśniowy · 3 dni' },
    { name: 'P. Lis', detail: 'Kontuzja barku · 1 dzień' },
  ],
  recentResults: [
    { opp: 'Wisła Północ', score: '2:1', result: 'W' as const },
    { opp: 'Stal Portowa', score: '0:0', result: 'R' as const },
    { opp: 'Górnik Wschód', score: '1:3', result: 'P' as const },
    { opp: 'Lechia Południe', score: '2:0', result: 'W' as const },
  ],
  standingsPreview: [
    { pos: 1, club: 'Victoria Harbor', pts: 28, gd: 12, self: false },
    { pos: 2, club: 'Atletyk Centrum', pts: 26, gd: 9, self: false },
    { pos: 3, club: 'Orzeł Grodzisk', pts: 24, gd: 5, self: false },
    { pos: 4, club: 'FC Lastovia', pts: 22, gd: 4, self: true },
    { pos: 5, club: 'Wisła Północ', pts: 21, gd: 2, self: false },
  ],
  messagesPreview: [
    { id: 'm1', from: 'Zarząd', subject: 'Oczekiwania na kolejkę 12', when: '1d', unread: true },
    { id: 'm2', from: 'Skaut', subject: 'Raport: K. Baran', when: '5h', unread: true },
    { id: 'm3', from: 'System', subject: 'Okno transferowe otwarte', when: '2d', unread: false },
  ],
  dailyTasks: [
    { id: 't1', label: 'Ukończ sesję treningową', done: false, reward: '+15 energii' },
    { id: 't2', label: 'Sprawdź listę transferową', done: true, reward: '+5 LP' },
    { id: 't3', label: 'Odpowiedz na wiadomość zarządu', done: false, reward: '+2 morale' },
  ],
  financeSnap: {
    balance: 1_245_800,
    weeklyWage: 84_200,
    lastMatchGate: 42_500,
  },
  squadSnap: {
    players: 24,
    avgAge: 24.6,
    avgSkill: 61,
  },
} as const;

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}
