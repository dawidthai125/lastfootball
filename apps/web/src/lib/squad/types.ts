/** Domain player readiness — stored in DB; localized in STATUS_LABEL / UI. */
export type PlayerStatus = 'READY' | 'INJURED' | 'SUSPENDED' | 'TIRED' | 'DEPARTED';

export type SquadPlayerDto = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
  readonly position: string;
  readonly age: number;
  readonly form: number;
  readonly energy: number;
  readonly skill: number;
  readonly status: PlayerStatus;
  readonly nationality: string;
  readonly attributes: readonly { label: string; value: number }[];
  readonly contract: {
    readonly wage: number;
    readonly until: string;
    readonly clause: number;
    readonly role: string;
  };
  readonly history: readonly string[];
  readonly starter: boolean;
  readonly captain: boolean;
  readonly version: number;
};

export type SquadDto = {
  readonly clubId: string;
  readonly players: readonly SquadPlayerDto[];
};

/** Persistence / list shape (DB → app). */
export type PlayerRowDto = {
  readonly id: string;
  readonly clubId: string;
  readonly name: string;
  readonly shirtNumber: number;
  readonly pos: string;
  readonly role: string;
  readonly starter: boolean;
  readonly captain: boolean;
  readonly age: number;
  readonly skill: number;
  readonly status: PlayerStatus;
  readonly nationality: string;
  readonly version: number;
  readonly departedAt: string | null;
};

export const POSITION_FILTERS = ['ALL', 'BR', 'OB', 'ŚP', 'PO', 'PN', 'N'] as const;
export const STATUS_FILTERS = ['ALL', 'READY', 'INJURED', 'TIRED', 'SUSPENDED'] as const;
export const STATUS_LABEL: Record<PlayerStatus, string> = {
  READY: 'Gotowy',
  INJURED: 'Kontuzja',
  TIRED: 'Zmęczony',
  SUSPENDED: 'Zawieszony',
  DEPARTED: 'Odszedł',
};
export type SortKey = 'name' | 'position' | 'age' | 'form' | 'energy' | 'skill' | 'status';

export class SquadUnavailableError extends Error {
  readonly clubId: string;

  constructor(clubId: string, message?: string) {
    super(message ?? `Squad unavailable for club ${clubId}`);
    this.name = 'SquadUnavailableError';
    this.clubId = clubId;
  }
}

export function isActivePlayer(row: PlayerRowDto): boolean {
  return row.departedAt == null && row.status !== 'DEPARTED';
}
