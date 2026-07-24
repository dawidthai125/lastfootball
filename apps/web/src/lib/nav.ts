export type NavItem = {
  id: string;
  href: string;
  label: string;
  shortLabel: string;
  badge?: boolean;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

/** IA-01 navigation map — groups and labels. Routes map to existing or stub pages. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'start',
    label: 'Start',
    items: [{ id: 'panel', href: '/hub', label: 'Panel', shortLabel: 'P' }],
  },
  {
    id: 'club',
    label: 'Klub',
    items: [
      { id: 'club', href: '/club', label: 'Klub', shortLabel: 'K' },
      { id: 'squad', href: '/squad', label: 'Kadra', shortLabel: 'Kd' },
      { id: 'stadium', href: '/stadium', label: 'Stadion', shortLabel: 'S' },
    ],
  },
  {
    id: 'competitions',
    label: 'Rozgrywki',
    items: [
      { id: 'league', href: '/league', label: 'Liga', shortLabel: 'L' },
      { id: 'matches', href: '/matches', label: 'Terminarz', shortLabel: 'T' },
    ],
  },
  {
    id: 'development',
    label: 'Rozwój',
    items: [
      { id: 'training', href: '/training', label: 'Trening', shortLabel: 'Tr' },
      { id: 'academy', href: '/academy', label: 'Akademia', shortLabel: 'A' },
    ],
  },
  {
    id: 'market',
    label: 'Rynek',
    items: [
      { id: 'scouting', href: '/scouting', label: 'Skauting', shortLabel: 'Sk' },
      { id: 'transfers', href: '/transfers', label: 'Transfery', shortLabel: 'Tf' },
    ],
  },
  {
    id: 'operations',
    label: 'Operacje',
    items: [
      { id: 'finance', href: '/finance', label: 'Finanse', shortLabel: 'F' },
      { id: 'sponsors', href: '/sponsors', label: 'Sponsorzy', shortLabel: 'Sp' },
      { id: 'board', href: '/board', label: 'Zarząd', shortLabel: 'Z' },
    ],
  },
  {
    id: 'comms',
    label: 'Komunikacja',
    items: [
      {
        id: 'messages',
        href: '/messages',
        label: 'Wiadomości',
        shortLabel: 'W',
        badge: true,
      },
    ],
  },
  {
    id: 'system',
    label: 'System',
    items: [
      { id: 'achievements', href: '/achievements', label: 'Osiągnięcia', shortLabel: 'O' },
      { id: 'profile', href: '/profile', label: 'Profil', shortLabel: 'Pr' },
      { id: 'settings', href: '/settings', label: 'Ustawienia', shortLabel: 'U' },
    ],
  },
];

export const DEV_NAV: NavItem[] = [
  { id: 'status', href: '/status', label: 'Status silnika', shortLabel: 'St' },
];

/** Flat list for mobile nav */
export const FLAT_NAV: NavItem[] = NAV_GROUPS.flatMap((g) => g.items);
