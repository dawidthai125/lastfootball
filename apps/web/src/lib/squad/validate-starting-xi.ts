import { resolveDressingConflict } from '@/lib/squad/dressing-room';
import type { Personality } from '@/lib/squad/depth';
import type { PlayerStatus, SquadPlayerDto } from '@/lib/squad/types';

export type XiValidation = {
  readonly ok: boolean;
  readonly starterCount: number;
  readonly hasGoalkeeper: boolean;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
};

function asPersonality(value: string | undefined): Personality {
  if (value === 'lider' || value === 'wybuchowy' || value === 'spokojny') return value;
  return 'spokojny';
}

const GK_POSITIONS = new Set(['BR']);

export function isGoalkeeper(player: Pick<SquadPlayerDto, 'position'>): boolean {
  return GK_POSITIONS.has(player.position);
}

export function isXiEligibleStatus(status: PlayerStatus): boolean {
  return status !== 'DEPARTED';
}

/**
 * Pure XI validation — HF-SQD-04 / LFE-TRAINING-02 XI Gate.
 * Exactly 11 starters + ≥1 BR; INJURED/SUSPENDED = hard block; TIRED ≥4 = warning.
 * Optional `today` (YYYY-MM-DD) also blocks national call-ups still away.
 */
export function validateStartingXi(
  starters: readonly SquadPlayerDto[],
  today?: string,
): XiValidation {
  const active = starters.filter((p) => isXiEligibleStatus(p.status));
  const errors: string[] = [];
  const warnings: string[] = [];

  if (active.length !== 11) {
    errors.push(`Potrzebujesz dokładnie 11 zawodników w XI (masz ${active.length}).`);
  }

  const hasGoalkeeper = active.some(isGoalkeeper);
  if (!hasGoalkeeper) {
    errors.push('W XI musi być przynajmniej jeden bramkarz.');
  }

  const blocked = active.filter((p) => p.status === 'INJURED' || p.status === 'SUSPENDED');
  if (blocked.length > 0) {
    errors.push(
      `${blocked.length} zawodnik${blocked.length === 1 ? '' : 'ów'} w XI ma status kontuzji lub zawieszenia — usuń ${blocked.length === 1 ? 'go' : 'ich'} ze składu.`,
    );
  }

  const loaned = active.filter((p) => p.onLoan);
  if (loaned.length > 0) {
    errors.push('Wypożyczony zawodnik nie może grać w XI.');
  }

  if (today && /^\d{4}-\d{2}-\d{2}$/.test(today)) {
    const intl = active.filter((p) => p.intlAbsentUntil && p.intlAbsentUntil.slice(0, 10) >= today);
    if (intl.length > 0) {
      errors.push(
        intl.length === 1
          ? 'Zawodnik z powołania nie może grać w XI.'
          : 'Zawodnicy z powołania nie mogą grać w XI.',
      );
    }
  }

  const tired = active.filter((p) => p.status === 'TIRED');
  if (tired.length >= 4) {
    warnings.push('Wielu zmęczonych w XI — rozważ rotację.');
  }

  const conflict = resolveDressingConflict(
    active.map((p) => ({
      id: p.id,
      name: p.name,
      morale: typeof p.morale === 'number' ? p.morale : 60,
      personality: asPersonality(p.personality),
      starter: true,
    })),
  );
  if (conflict) {
    warnings.push(`${conflict.subject} — napięcie w szatni.`);
  }

  return {
    ok: errors.length === 0,
    starterCount: active.length,
    hasGoalkeeper,
    warnings,
    errors,
  };
}

/** Position sort for XI list: GK → DEF → MID → ATT. */
export function xiSortKey(player: SquadPlayerDto): number {
  const pos = player.position;
  if (pos === 'BR') return 0;
  if (pos === 'OB' || pos === 'PO' || pos === 'ŚO' || pos === 'LO') return 1;
  if (pos === 'ŚP') return 2;
  if (pos === 'PN') return 3;
  if (pos === 'N') return 4;
  return 5;
}

export function sortXiPlayers(players: readonly SquadPlayerDto[]): SquadPlayerDto[] {
  return [...players].sort((a, b) => {
    const d = xiSortKey(a) - xiSortKey(b);
    if (d !== 0) return d;
    return a.name.localeCompare(b.name, 'pl');
  });
}

/**
 * Compose XI selection:
 * - tap alone on bench while XI < 11 → promote
 * - tap alone on starter while XI > 11 (shouldn't happen) → demote
 * - tap A then B across XI/bench → swap
 * - tap same again → clear selection
 */
export function applyXiSelection(
  players: readonly SquadPlayerDto[],
  selectedId: string | null,
  tappedId: string,
): { players: SquadPlayerDto[]; selectedId: string | null } {
  if (selectedId === tappedId) {
    return { players: [...players], selectedId: null };
  }

  const list = players.map((p) => ({ ...p }));
  const tapped = list.find((p) => p.id === tappedId);
  if (!tapped || tapped.status === 'DEPARTED') {
    return { players: list, selectedId };
  }

  const blockedStatus = tapped.status === 'INJURED' || tapped.status === 'SUSPENDED';
  const starterCount = list.filter((p) => p.starter && p.status !== 'DEPARTED').length;

  if (!selectedId) {
    if (!tapped.starter && starterCount < 11) {
      if (blockedStatus) {
        return { players: list, selectedId: null };
      }
      tapped.starter = true;
      return { players: list, selectedId: null };
    }
    if (tapped.starter && starterCount > 11) {
      tapped.starter = false;
      return { players: list, selectedId: null };
    }
    return { players: list, selectedId: tappedId };
  }

  const selected = list.find((p) => p.id === selectedId);
  if (!selected || selected.status === 'DEPARTED') {
    return { players: list, selectedId: tappedId };
  }

  if (selected.starter === tapped.starter) {
    return { players: list, selectedId: tappedId };
  }

  // Swap: do not promote INJURED/SUSPENDED onto XI (no auto-heal / auto-swap around gate).
  if (!tapped.starter && blockedStatus) {
    return { players: list, selectedId: null };
  }
  if (selected.starter && (selected.status === 'INJURED' || selected.status === 'SUSPENDED')) {
    // Allow demoting blocked starter by swapping with eligible bench.
    if (tapped.status === 'INJURED' || tapped.status === 'SUSPENDED') {
      return { players: list, selectedId: null };
    }
  }

  selected.starter = !selected.starter;
  tapped.starter = !tapped.starter;
  return { players: list, selectedId: null };
}

function isUnavailable(player: SquadPlayerDto, today: string): boolean {
  return (
    player.status === 'INJURED' ||
    player.status === 'SUSPENDED' ||
    player.onLoan === true ||
    Boolean(player.intlAbsentUntil && player.intlAbsentUntil.slice(0, 10) >= today)
  );
}

/**
 * Manager-triggered fix on the XI screen: each unavailable starter swaps with the best
 * free bench player, same position first. A goalkeeper only swaps with a goalkeeper.
 * Nothing is saved here and a starter without a replacement stays, so the gate still holds.
 */
export function replaceUnavailableStarters(
  players: readonly SquadPlayerDto[],
  today: string,
): SquadPlayerDto[] {
  let list = players.map((p) => ({ ...p }));
  for (const out of players) {
    if (!out.starter || out.status === 'DEPARTED' || !isUnavailable(out, today)) continue;
    const best = list
      .filter(
        (p) =>
          !p.starter &&
          p.status !== 'DEPARTED' &&
          !isUnavailable(p, today) &&
          isGoalkeeper(p) === isGoalkeeper(out),
      )
      .sort(
        (a, b) =>
          Number(b.position === out.position) - Number(a.position === out.position) ||
          Number(a.status === 'TIRED') - Number(b.status === 'TIRED') ||
          b.skill - a.skill,
      )[0];
    if (best) list = applyXiSelection(list, out.id, best.id).players;
  }
  return list;
}

const SLOTS_442 = ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'] as const;

function roleLine(role: string): 'G' | 'D' | 'M' | 'W' | 'A' {
  if (role === 'GK') return 'G';
  if (['RB', 'LB', 'CB', 'RWB', 'LWB'].includes(role)) return 'D';
  if (['RM', 'LM', 'RW', 'LW'].includes(role)) return 'W';
  return ['ST', 'CF'].includes(role) ? 'A' : 'M';
}

const ROLE_BY_POSITION: Readonly<Record<string, string>> = {
  BR: 'GK',
  PO: 'RB',
  OB: 'CB',
  ŚO: 'CB',
  LO: 'LB',
  PN: 'RW',
  N: 'ST',
};

/** Points lost by a player outside his own slot. */
function slotCost(slot: string, role: string): number {
  const [a, b] = [roleLine(slot), roleLine(role)];
  if (a === b) {
    if (slot === role || a === 'M' || a === 'A') return 0;
    if (a === 'W') return slot[0] === role[0] ? 0 : 1;
    return 3;
  }
  const pair = [a, b].sort().join('');
  if (pair === 'MW') return 3;
  if (pair === 'AW') return 4;
  if (pair === 'AM') return 6;
  return 15;
}

/** Skill minus what missing energy takes. Under 45 the injury risk starts, so it weighs more. */
export function xiReadiness(player: Pick<SquadPlayerDto, 'skill' | 'energy'>): number {
  return (
    player.skill - Math.max(0, 70 - player.energy) * 0.2 - Math.max(0, 45 - player.energy) * 0.3
  );
}

/**
 * The strongest available XI for 4-4-2, energy included. Saves nothing.
 * Without eleven available players, or a goalkeeper, the squad comes back unchanged.
 */
export function pickBestXi(players: readonly SquadPlayerDto[], today: string): SquadPlayerDto[] {
  const free = players.filter((p) => p.status !== 'DEPARTED' && !isUnavailable(p, today));
  const pairs = free
    .flatMap((player) => {
      const role = player.pitchRole ?? ROLE_BY_POSITION[player.position] ?? 'CM';
      return SLOTS_442.flatMap((slot, index) =>
        isGoalkeeper(player) !== (slot === 'GK')
          ? []
          : [{ id: player.id, index, score: xiReadiness(player) - slotCost(slot, role) }],
      );
    })
    .sort((a, b) => b.score - a.score || a.index - b.index || a.id.localeCompare(b.id));

  const taken = new Set<number>();
  const chosen = new Set<string>();
  for (const pair of pairs) {
    if (taken.has(pair.index) || chosen.has(pair.id)) continue;
    taken.add(pair.index);
    chosen.add(pair.id);
  }
  if (chosen.size !== SLOTS_442.length) return players.map((p) => ({ ...p }));
  return players.map((p) => ({ ...p, starter: chosen.has(p.id) }));
}
