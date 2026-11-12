/** Pure squad truth: attributes, wages, training energy, match availability. No I/O. */

type Status = 'READY' | 'INJURED' | 'SUSPENDED' | 'TIRED' | 'DEPARTED';

export type AttrGroups = {
  readonly attack: number;
  readonly passing: number;
  readonly defense: number;
  readonly physical: number;
  readonly goalkeeping: number;
};

type GroupKey = keyof AttrGroups;
type TrainingFocus = 'tactics' | 'technique' | 'physical' | 'regeneration';
type TrainingIntensity = 'light' | 'normal' | 'high';
type MatchRole = 'xi' | 'bench' | 'out';
type MatchResult = 'win' | 'draw' | 'loss';

export type SquadTruthPlayer = {
  readonly id: string;
  readonly pos: string;
  readonly status: Status;
  readonly skill: number;
  readonly potential: number;
  readonly groups: AttrGroups;
  readonly energy: number;
  readonly form: number;
  readonly recentRatings: readonly number[];
  readonly suspensionMatches: number;
};

/** Finite integer in 1..99. Non-finite → 1. */
export function clampAttr(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(1, Math.min(99, Math.trunc(n)));
}

export function groupsFromSkill(skill: number): AttrGroups {
  const value = clampAttr(skill);
  return {
    attack: value,
    passing: value,
    defense: value,
    physical: value,
    goalkeeping: value,
  };
}

export function groupKeyForFocus(focus: TrainingFocus, pos: string): GroupKey | null {
  if (focus === 'regeneration') return null;
  if (focus === 'technique') return 'passing';
  if (focus === 'physical') return 'physical';
  if (pos === 'BR') return 'goalkeeping';
  if (pos === 'PO' || pos === 'LO' || pos === 'ŚO' || pos === 'OB') return 'defense';
  if (pos === 'PN' || pos === 'N') return 'attack';
  return 'passing';
}

export function bumpGroup(
  groups: AttrGroups,
  key: GroupKey,
  delta: number,
  ceiling: number,
): AttrGroups {
  const cap = clampAttr(ceiling);
  const next = Math.min(cap, clampAttr(groups[key] + delta));
  return { ...groups, [key]: next };
}

export function mapGroupsToLfeSkills(groups: AttrGroups): {
  finishing: number;
  longShots: number;
  volleys: number;
  heading: number;
  shortPassing: number;
  longPassing: number;
  crossing: number;
  ballControl: number;
  dribbling: number;
  tackling: number;
  marking: number;
  positioning: number;
  vision: number;
  composure: number;
  reactions: number;
  gkDiving: number;
  gkHandling: number;
  gkReflexes: number;
  gkPositioning: number;
} {
  const { attack, passing, defense, physical, goalkeeping } = groups;
  return {
    finishing: clampAttr(attack),
    longShots: clampAttr(attack - 4),
    volleys: clampAttr(attack - 6),
    heading: clampAttr(Math.round((attack + physical) / 2)),
    shortPassing: clampAttr(passing),
    longPassing: clampAttr(passing - 3),
    crossing: clampAttr(passing - 2),
    ballControl: clampAttr(Math.round((passing + attack) / 2)),
    dribbling: clampAttr(attack - 2),
    tackling: clampAttr(defense),
    marking: clampAttr(defense - 2),
    positioning: clampAttr(Math.round((defense + physical) / 2)),
    vision: clampAttr(passing - 1),
    composure: clampAttr(Math.round((passing + defense) / 2)),
    reactions: clampAttr(physical),
    gkDiving: clampAttr(goalkeeping),
    gkHandling: clampAttr(goalkeeping - 2),
    gkReflexes: clampAttr(goalkeeping - 1),
    gkPositioning: clampAttr(goalkeeping - 3),
  };
}

export function attributeBars(groups: AttrGroups): readonly { label: string; value: number }[] {
  return [
    { label: 'Atak', value: groups.attack },
    { label: 'Podanie', value: groups.passing },
    { label: 'Obrona', value: groups.defense },
    { label: 'Fizyczność', value: groups.physical },
    { label: 'Bramkarskie', value: groups.goalkeeping },
  ];
}

export function wageFromSkill(skill: number, age: number): number {
  const youth = Number.isFinite(age) ? Math.max(0, 32 - age) * 50 : 0;
  return 1200 + clampAttr(skill) * 35 + youth;
}

/** One match pays a seventh of the weekly wage bill. Cash still cannot go below zero. */
export function weeklyMatchWage(bill: number): number {
  const due = Number.isFinite(bill) ? Math.max(0, Math.trunc(bill)) : 0;
  return Math.round(due / 7);
}

export function payWages(cash: number, bill: number): { paid: number; nextCash: number } {
  const available = Number.isFinite(cash) ? Math.max(0, cash) : 0;
  const due = Number.isFinite(bill) ? Math.max(0, bill) : 0;
  const paid = Math.min(due, available);
  return { paid, nextCash: available - paid };
}

function clampEnergy(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

export function energyAfterTraining(input: {
  energy: number;
  focus: TrainingFocus;
  intensity: TrainingIntensity;
  status: Status;
}): { energy: number; status: Status } {
  const energy = clampEnergy(input.energy);
  const { focus, intensity, status } = input;

  if (status === 'DEPARTED' || status === 'SUSPENDED') {
    return { energy, status };
  }

  if (focus === 'regeneration') {
    const next = Math.min(100, energy + 28);
    const healed = status === 'TIRED' || status === 'INJURED' ? 'READY' : status;
    return { energy: next, status: healed };
  }

  if (intensity === 'light') {
    return { energy: Math.min(100, energy + 10), status };
  }

  const drop = intensity === 'high' ? 14 : 6;
  const next = Math.max(0, energy - drop);
  const tired = next < 34 && status === 'READY' ? 'TIRED' : status;
  return { energy: next, status: tired };
}

/** FNV-1a 32-bit. Deterministic; no Math.random. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function clampBand(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formFromRatings(ratings: readonly number[], previous: number): number {
  if (ratings.length === 0) return previous;
  let sum = 0;
  for (const rating of ratings) sum += rating;
  return clampBand(Math.round(sum / ratings.length), 20, 95);
}

function pushRating(ratings: readonly number[], rating: number): number[] {
  return [...ratings, rating].slice(-5);
}

function resultDelta(result: MatchResult): number {
  if (result === 'win') return 10;
  if (result === 'draw') return 2;
  return -8;
}

function applyOne(
  player: SquadTruthPlayer,
  matchKey: string,
  result: MatchResult,
  role: MatchRole,
): SquadTruthPlayer {
  if ((player.status === 'SUSPENDED' || player.suspensionMatches > 0) && role !== 'xi') {
    const left = Math.max(0, player.suspensionMatches - 1);
    return {
      ...player,
      status: left > 0 ? 'SUSPENDED' : 'READY',
      suspensionMatches: left,
      energy: Math.min(100, player.energy + 14),
      form: formFromRatings(player.recentRatings, player.form),
    };
  }

  if (player.status === 'INJURED' && role === 'out') {
    const heal = hash(`${player.id}:${matchKey}:heal`) % 100 < 55;
    return {
      ...player,
      status: heal ? 'READY' : player.status,
      energy: Math.min(100, player.energy + 14),
    };
  }

  if (role === 'out' && (player.status === 'READY' || player.status === 'TIRED')) {
    const energy = Math.min(100, player.energy + 14);
    const recovered = player.status === 'TIRED' && energy >= 70 ? 'READY' : player.status;
    return { ...player, energy, status: recovered };
  }

  if (role === 'bench') {
    const energy = Math.max(10, player.energy - 8);
    const recentRatings = pushRating(player.recentRatings, 60);
    const status = energy < 34 && player.status === 'READY' ? 'TIRED' : player.status;
    return {
      ...player,
      energy,
      recentRatings,
      form: formFromRatings(recentRatings, player.form),
      status,
    };
  }

  if (role === 'xi') {
    const energyBefore = player.energy;
    const energy = Math.max(10, energyBefore - 22);
    const rating = clampBand(
      62 + resultDelta(result) + Math.round((energyBefore - 50) / 10),
      20,
      95,
    );
    const recentRatings = pushRating(player.recentRatings, rating);
    let status: Status = player.status;
    let suspensionMatches = player.suspensionMatches;

    if (status !== 'INJURED' && status !== 'SUSPENDED') {
      const injRoll = hash(`${player.id}:${matchKey}:inj`) % 100;
      const injured = (energy < 45 && injRoll < 8) || (energy < 25 && injRoll < 18);
      if (injured) {
        status = 'INJURED';
      } else if (hash(`${player.id}:${matchKey}:y`) % 100 < 12) {
        status = 'SUSPENDED';
        suspensionMatches = 1;
      } else if (hash(`${player.id}:${matchKey}:r`) % 100 < 3) {
        status = 'SUSPENDED';
        suspensionMatches = 2;
      }
    }

    if (energy < 34 && status === 'READY') status = 'TIRED';

    return {
      ...player,
      energy,
      recentRatings,
      form: formFromRatings(recentRatings, player.form),
      status,
      suspensionMatches,
    };
  }

  return { ...player };
}

export function applyMatchSquadTruth(
  players: readonly SquadTruthPlayer[],
  input: {
    readonly matchKey: string;
    readonly result: MatchResult;
    readonly roleById: Readonly<Record<string, MatchRole>>;
  },
): SquadTruthPlayer[] {
  return players.map((player) =>
    applyOne(player, input.matchKey, input.result, input.roleById[player.id] ?? 'out'),
  );
}
