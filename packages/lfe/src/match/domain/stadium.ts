export interface Stadium {
  readonly id: string;
  readonly name: string;
  readonly capacity: number;
  readonly turf: 'grass' | 'hybrid' | 'artificial';
  /** 0–100 atmosphere / crowd intensity baseline. */
  readonly atmosphere: number;
}

export function createStadium(partial?: Partial<Stadium>): Stadium {
  return Object.freeze({
    id: partial?.id ?? 'stadium-default',
    name: partial?.name ?? 'Stadium',
    capacity: partial?.capacity ?? 20000,
    turf: partial?.turf ?? 'grass',
    atmosphere: partial?.atmosphere ?? 50,
  });
}
