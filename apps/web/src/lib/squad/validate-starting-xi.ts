import type { PlayerStatus, SquadPlayerDto } from '@/lib/squad/types';

export type XiValidation = {
  readonly ok: boolean;
  readonly starterCount: number;
  readonly hasGoalkeeper: boolean;
  readonly warnings: readonly string[];
  readonly errors: readonly string[];
};

const GK_POSITIONS = new Set(['BR']);

export function isGoalkeeper(player: Pick<SquadPlayerDto, 'position'>): boolean {
  return GK_POSITIONS.has(player.position);
}

export function isXiEligibleStatus(status: PlayerStatus): boolean {
  return status !== 'DEPARTED';
}

/**
 * Pure XI validation — HF-SQD-04 / STATE-SPECS warn XI.
 * Exactly 11 starters + ≥1 BR; soft warnings for injured/suspended.
 */
export function validateStartingXi(starters: readonly SquadPlayerDto[]): XiValidation {
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
    warnings.push(
      `${blocked.length} zawodnik${blocked.length === 1 ? '' : 'ów'} w XI ma status kontuzji lub zawieszenia.`,
    );
  }

  const tired = active.filter((p) => p.status === 'TIRED');
  if (tired.length >= 4) {
    warnings.push('Wielu zmęczonych w XI — rozważ rotację.');
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

  const starterCount = list.filter((p) => p.starter && p.status !== 'DEPARTED').length;

  if (!selectedId) {
    if (!tapped.starter && starterCount < 11) {
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

  selected.starter = !selected.starter;
  tapped.starter = !tapped.starter;
  return { players: list, selectedId: null };
}
