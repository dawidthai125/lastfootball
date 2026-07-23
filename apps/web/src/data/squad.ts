export type PlayerStatus = 'ready' | 'injured' | 'suspended' | 'tired';

export type SquadPlayer = {
  id: string;
  name: string;
  shortName: string;
  position: string;
  age: number;
  form: number;
  energy: number;
  skill: number;
  status: PlayerStatus;
  nationality: string;
  attributes: { label: string; value: number }[];
  contract: {
    wage: number;
    until: string;
    clause: number;
    role: string;
  };
  history: string[];
};

export const SQUAD_PLAYERS: SquadPlayer[] = [
  {
    id: 'p-nowak',
    name: 'Marek Nowak',
    shortName: 'M. Nowak',
    position: 'BR',
    age: 29,
    form: 71,
    energy: 82,
    skill: 64,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Reflex', value: 72 },
      { label: 'Loty', value: 68 },
      { label: 'Gra nogą', value: 55 },
      { label: 'Wyprowadzenie', value: 61 },
      { label: 'Jeden na jeden', value: 70 },
      { label: 'Siła', value: 66 },
      { label: 'Wytrzymałość', value: 64 },
      { label: 'Koncentracja', value: 69 },
    ],
    contract: {
      wage: 3200,
      until: '30.06.2027',
      clause: 450_000,
      role: 'Pierwszy bramkarz',
    },
    history: ['Sezon 1 · 11 meczów · 4 czyste konta', 'Dołączył: transfer wolny'],
  },
  {
    id: 'p-lis',
    name: 'Piotr Lis',
    shortName: 'P. Lis',
    position: 'OB',
    age: 26,
    form: 58,
    energy: 40,
    skill: 62,
    status: 'injured',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 54 },
      { label: 'Siła', value: 71 },
      { label: 'Wytrzymałość', value: 48 },
      { label: 'Podania', value: 59 },
      { label: 'Strzały', value: 32 },
      { label: 'Obrona', value: 74 },
      { label: 'Technika', value: 51 },
      { label: 'Głowa', value: 68 },
    ],
    contract: {
      wage: 2800,
      until: '30.06.2028',
      clause: 380_000,
      role: 'Stoper',
    },
    history: ['Kontuzja barku · 1 dzień', 'Sezon 1 · 9 meczów · 0 goli'],
  },
  {
    id: 'p-baran',
    name: 'Kamil Baran',
    shortName: 'K. Baran',
    position: 'OB',
    age: 21,
    form: 76,
    energy: 88,
    skill: 58,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 72 },
      { label: 'Siła', value: 55 },
      { label: 'Wytrzymałość', value: 70 },
      { label: 'Podania', value: 61 },
      { label: 'Strzały', value: 28 },
      { label: 'Obrona', value: 66 },
      { label: 'Technika', value: 58 },
      { label: 'Głowa', value: 52 },
    ],
    contract: {
      wage: 1800,
      until: '30.06.2029',
      clause: 220_000,
      role: 'Boczny obrońca',
    },
    history: ['Wychowanek akademii', 'Sezon 1 · 7 meczów'],
  },
  {
    id: 'p-dk',
    name: 'Dawid K.',
    shortName: 'D. K.',
    position: 'ŚP',
    age: 23,
    form: 74,
    energy: 68,
    skill: 66,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 64 },
      { label: 'Siła', value: 58 },
      { label: 'Wytrzymałość', value: 71 },
      { label: 'Podania', value: 69 },
      { label: 'Strzały', value: 62 },
      { label: 'Obrona', value: 55 },
      { label: 'Technika', value: 66 },
      { label: 'Głowa', value: 51 },
    ],
    contract: {
      wage: 4200,
      until: '30.06.2028',
      clause: 850_000,
      role: 'Zawodnik / menedżer',
    },
    history: [
      'Sezon 1 · 8 meczów · 2 gole',
      'Debiut: kolejka 3 vs Wisła Północ',
      'Akademia: FC Lastovia U19',
    ],
  },
  {
    id: 'p-wrobel',
    name: 'Adam Wróbel',
    shortName: 'A. Wróbel',
    position: 'PO',
    age: 27,
    form: 69,
    energy: 55,
    skill: 67,
    status: 'tired',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 61 },
      { label: 'Siła', value: 57 },
      { label: 'Wytrzymałość', value: 52 },
      { label: 'Podania', value: 78 },
      { label: 'Strzały', value: 58 },
      { label: 'Obrona', value: 49 },
      { label: 'Technika', value: 74 },
      { label: 'Głowa', value: 44 },
    ],
    contract: {
      wage: 5100,
      until: '30.06.2027',
      clause: 920_000,
      role: 'Rozgrywający',
    },
    history: ['Transfer z Atletyk Centrum', 'Sezon 1 · 10 meczów · 1 gol · 4 asysty'],
  },
  {
    id: 'p-marek',
    name: 'Tomasz Marek',
    shortName: 'T. Marek',
    position: 'N',
    age: 19,
    form: 81,
    energy: 90,
    skill: 61,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 78 },
      { label: 'Siła', value: 60 },
      { label: 'Wytrzymałość', value: 66 },
      { label: 'Podania', value: 52 },
      { label: 'Strzały', value: 73 },
      { label: 'Obrona', value: 28 },
      { label: 'Technika', value: 65 },
      { label: 'Głowa', value: 58 },
    ],
    contract: {
      wage: 2100,
      until: '30.06.2029',
      clause: 500_000,
      role: 'Napastnik',
    },
    history: ['Sezon 1 · 6 meczów · 3 gole', 'Debiut w kolejce 6'],
  },
  {
    id: 'p-sowa',
    name: 'Michał Sowa',
    shortName: 'M. Sowa',
    position: 'PO',
    age: 24,
    form: 45,
    energy: 72,
    skill: 59,
    status: 'suspended',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 63 },
      { label: 'Siła', value: 64 },
      { label: 'Wytrzymałość', value: 67 },
      { label: 'Podania', value: 60 },
      { label: 'Strzały', value: 48 },
      { label: 'Obrona', value: 62 },
      { label: 'Technika', value: 55 },
      { label: 'Głowa', value: 50 },
    ],
    contract: {
      wage: 2400,
      until: '30.06.2026',
      clause: 200_000,
      role: 'Boks do boks',
    },
    history: ['Zawieszenie · 1 mecz', 'Sezon 1 · 8 meczów'],
  },
  {
    id: 'p-kowalik',
    name: 'Jakub Kowalik',
    shortName: 'J. Kowalik',
    position: 'ŚP',
    age: 17,
    form: 66,
    energy: 95,
    skill: 52,
    status: 'ready',
    nationality: 'POL',
    attributes: [
      { label: 'Tempo', value: 68 },
      { label: 'Siła', value: 48 },
      { label: 'Wytrzymałość', value: 60 },
      { label: 'Podania', value: 58 },
      { label: 'Strzały', value: 44 },
      { label: 'Obrona', value: 50 },
      { label: 'Technika', value: 62 },
      { label: 'Głowa', value: 41 },
    ],
    contract: {
      wage: 900,
      until: '30.06.2028',
      clause: 150_000,
      role: 'Rezerwa / akademia',
    },
    history: ['Promocja z U19', 'Debiut: ławka kolejka 10'],
  },
];

export const POSITION_FILTERS = ['ALL', 'BR', 'OB', 'ŚP', 'PO', 'N'] as const;
export const STATUS_FILTERS = ['ALL', 'ready', 'injured', 'tired', 'suspended'] as const;

export type SortKey = 'name' | 'position' | 'age' | 'form' | 'energy' | 'skill' | 'status';

export function getPlayerById(id: string): SquadPlayer | undefined {
  return SQUAD_PLAYERS.find((p) => p.id === id);
}

export const STATUS_LABEL: Record<PlayerStatus, string> = {
  ready: 'Gotowy',
  injured: 'Kontuzja',
  tired: 'Zmęczony',
  suspended: 'Zawieszony',
};
