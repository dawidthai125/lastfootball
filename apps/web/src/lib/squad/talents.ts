import type { PlayerSkills } from '@lastfootball/lfe';

/**
 * Talents (GDD §7.16): nothing to two traits a player keeps for life. They follow his id and
 * position, so they need no storage and nobody can roll them again.
 */
export const TALENTS = {
  lowca: { label: 'Łowca goli', effect: 'Lepiej wykańcza akcje.' },
  egzekutor: { label: 'Egzekutor', effect: 'Groźniejszy z karnych, wolnych i rożnych.' },
  glowa: { label: 'Mocna głowa', effect: 'Częściej trafia po rożnych.' },
  filar: { label: 'Filar obrony', effect: 'Lepiej odbiera i się ustawia.' },
  rezyser: { label: 'Reżyser', effect: 'Lepiej podaje i prowadzi piłkę.' },
  przywodca: { label: 'Przywódca', effect: 'Jako kapitan mocniej niesie drużynę.' },
  pluca: { label: 'Żelazne płuca', effect: 'Wolniej męczy się w meczu.' },
  twardziel: { label: 'Twardziel', effect: 'Rzadziej łapie kontuzję.' },
  mur: { label: 'Mur', effect: 'Lepiej broni strzały z karnych i wolnych.' },
} as const;

export type Talent = keyof typeof TALENTS;

const ANY: readonly Talent[] = ['przywodca', 'pluca', 'twardziel'];

/** What a position can have. A keeper never gets a striker's trait. */
const BY_POS: Readonly<Record<string, readonly Talent[]>> = {
  BR: ['mur', 'mur', 'przywodca', 'twardziel'],
  PO: ['filar', 'egzekutor', ...ANY],
  LO: ['filar', 'egzekutor', ...ANY],
  ŚO: ['filar', 'glowa', ...ANY],
  ŚP: ['rezyser', 'egzekutor', ...ANY],
  PN: ['lowca', 'egzekutor', 'rezyser', ...ANY],
  N: ['lowca', 'lowca', 'glowa', ...ANY],
};

/** FNV-1a 32-bit with a finishing mix, so neighbouring ids do not share a talent. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return (h ^ (h >>> 16)) >>> 0;
}

/** 50% none, 38% one, 12% two. */
export function talentsOf(id: string, pos: string): readonly Talent[] {
  const pool = BY_POS[pos] ?? ANY;
  const roll = hash(`${id}|talents`) % 100;
  const count = roll < 50 ? 0 : roll < 88 ? 1 : 2;
  if (count === 0) return [];
  const first = pool[hash(`${id}|talent-1`) % pool.length]!;
  if (count === 1) return [first];
  const rest = pool.filter((t) => t !== first);
  return [first, rest[hash(`${id}|talent-2`) % rest.length]!];
}

export function talentLabels(talents: readonly Talent[]): readonly string[] {
  return talents.map((talent) => TALENTS[talent].label);
}

export function isTalent(value: unknown): value is Talent {
  return typeof value === 'string' && Object.hasOwn(TALENTS, value);
}

const cap = (n: number) => Math.max(1, Math.min(99, n));

export function withTalentSkills(
  skills: Partial<PlayerSkills>,
  talents: readonly Talent[] | undefined,
): Partial<PlayerSkills> {
  if (!talents || talents.length === 0) return skills;
  const out: Record<string, number> = { ...skills };
  const add = (key: keyof PlayerSkills, n: number) => {
    out[key] = cap((out[key] ?? 50) + n);
  };
  for (const talent of talents) {
    if (talent === 'lowca') add('finishing', 5);
    if (talent === 'egzekutor') {
      add('longShots', 12);
      add('crossing', 12);
      add('composure', 3);
    }
    if (talent === 'glowa') add('heading', 12);
    if (talent === 'filar') {
      add('tackling', 4);
      add('positioning', 4);
    }
    if (talent === 'rezyser') {
      add('shortPassing', 4);
      add('ballControl', 4);
    }
    if (talent === 'mur') add('gkReflexes', 10);
  }
  return out;
}

/** Engine attributes a talent moves. 50 is neutral. */
export function talentAttributes(talents: readonly Talent[] | undefined): {
  stamina: number;
  strength: number;
} {
  return {
    stamina: talents?.includes('pluca') ? 90 : 50,
    strength: talents?.includes('twardziel') ? 100 : 50,
  };
}

/** 0–100, what a captain brings. 50 changes nothing. */
export function leadershipOf(input: {
  readonly personality: string;
  readonly age: number;
  readonly talents: readonly Talent[];
}): number {
  const base = input.personality === 'lider' ? 70 : input.personality === 'wybuchowy' ? 40 : 52;
  const age = input.age >= 28 ? 8 : input.age <= 20 ? -8 : 0;
  return Math.max(0, Math.min(100, base + age + (input.talents.includes('przywodca') ? 20 : 0)));
}

export function captainLabel(leadership: number): string {
  if (leadership >= 80) return 'bardzo mocno niesie drużynę';
  if (leadership >= 60) return 'niesie drużynę';
  if (leadership >= 45) return 'nie zmienia gry drużyny';
  return 'osłabia drużynę';
}
