export type PlayerStatus = 'ready' | 'injured' | 'suspended' | 'tired';

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
};

export type SquadDto = {
  readonly clubId: string;
  readonly players: readonly SquadPlayerDto[];
};

export const POSITION_FILTERS = ['ALL', 'BR', 'OB', 'ŚP', 'PO', 'PN', 'N'] as const;
export const STATUS_FILTERS = ['ALL', 'ready', 'injured', 'tired', 'suspended'] as const;
export const STATUS_LABEL: Record<PlayerStatus, string> = {
  ready: 'Gotowy',
  injured: 'Kontuzja',
  tired: 'Zmęczony',
  suspended: 'Zawieszony',
};
export type SortKey = 'name' | 'position' | 'age' | 'form' | 'energy' | 'skill' | 'status';
