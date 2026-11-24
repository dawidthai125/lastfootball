import { demandWage, isTalkPersonality } from '@/lib/squad/contract-talk';

/** The board keeps enough people to play: below this nobody else may leave (D139). */
export const CONTRACT_MIN_SENIORS = 14;

export type ContractPlayer = {
  readonly id: string;
  readonly name: string;
  readonly pos: string;
  readonly skill: number;
  readonly wage?: number;
  readonly personality?: string;
  readonly academyTrack: boolean;
  readonly departedAt?: string | null;
  readonly loanedIn?: boolean;
  /** Last club season the contract covers. Unknown never expires. */
  readonly contractSeason?: number | null;
};

export type ContractPlan<T> = { readonly leave: readonly T[]; readonly keep: readonly T[] };

function isOurs(player: ContractPlayer): boolean {
  return !player.academyTrack && !player.loanedIn && player.departedAt == null;
}

function expires(player: ContractPlayer, season: number): boolean {
  return (
    isOurs(player) && typeof player.contractSeason === 'number' && player.contractSeason <= season
  );
}

/** The weakest leave first. The board keeps the last goalkeeper and fourteen seniors for a season. */
export function planContractExpiry<T extends ContractPlayer>(
  players: readonly T[],
  endedSeason: number,
): ContractPlan<T> {
  const ours = players.filter(isOurs);
  let seniors = ours.length;
  let keepers = ours.filter((p) => p.pos === 'BR').length;
  const leave: T[] = [];
  const keep: T[] = [];
  const due = ours
    .filter((p) => expires(p, endedSeason))
    .sort((a, b) => a.skill - b.skill || a.id.localeCompare(b.id));
  for (const player of due) {
    const keeper = player.pos === 'BR';
    if (seniors <= CONTRACT_MIN_SENIORS || (keeper && keepers <= 1)) {
      keep.push(player);
      continue;
    }
    seniors -= 1;
    if (keeper) keepers -= 1;
    leave.push(player);
  }
  return { leave, keep };
}

/** What the board pays a player it keeps: his own demand. */
export function keptWage(player: Pick<ContractPlayer, 'wage' | 'personality'>): number | null {
  if (typeof player.wage !== 'number') return null;
  const personality = player.personality ?? '';
  return demandWage(player.wage, isTalkPersonality(personality) ? personality : 'spokojny');
}

function names(players: readonly ContractPlayer[], max = 3): string {
  const shown = players.slice(0, max).map((p) => p.name);
  const more = players.length - shown.length;
  return more > 0 ? `${shown.join(', ')} i jeszcze ${more}` : shown.join(', ');
}

/** One line for the message list, from the first day of the last season. */
export function contractReminder(
  players: readonly ContractPlayer[],
  season: number,
): string | null {
  const due = players.filter((p) => expires(p, season));
  if (due.length === 0) return null;
  return `Ostatni sezon kontraktu: ${names(due, 2)}`;
}

/** Off-season: what the start of the next season does. */
export function contractPreview(
  players: readonly ContractPlayer[],
  endedSeason: number,
): string | null {
  const plan = planContractExpiry(players, endedSeason);
  const lines = [
    plan.leave.length > 0 ? `Bez przedłużenia odejdą za darmo: ${names(plan.leave, 6)}.` : null,
    plan.keep.length > 0
      ? `Zarząd zatrzyma na jeden sezon, bo kadra jest wąska: ${names(plan.keep, 6)}.`
      : null,
  ].filter(Boolean);
  return lines.length > 0 ? lines.join(' ') : null;
}

export function contractFarewell(namesLeft: readonly string[]): string | null {
  if (namesLeft.length === 0) return null;
  const shown = namesLeft.slice(0, 2).join(', ');
  const more = namesLeft.length - 2;
  return `Koniec kontraktu, odeszli: ${shown}${more > 0 ? ` i jeszcze ${more}` : ''}`;
}
