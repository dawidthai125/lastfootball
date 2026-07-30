/**
 * AI opponent catalog — SSOT for opponent_club_id display + bot XI seed.
 * Not player clubs; ids are stable string keys (no FK to clubs).
 */

export type OpponentClub = {
  readonly id: string;
  readonly name: string;
  readonly shortName: string;
};

/** Fixed IV-liga style rivals — 11 AI (+ player = 12 clubs / GDD §10). */
export const OPPONENT_CATALOG: readonly OpponentClub[] = [
  { id: 'opp-wilki-polnocy', name: 'Wilki Północy', shortName: 'WLP' },
  { id: 'opp-stal-brzeg', name: 'Stal Brzeg', shortName: 'STB' },
  { id: 'opp-legia-malych', name: 'Legia Małych', shortName: 'LGM' },
  { id: 'opp-grom-zachod', name: 'Grom Zachód', shortName: 'GRZ' },
  { id: 'opp-portowcy', name: 'Portowcy', shortName: 'POR' },
  { id: 'opp-sokoly', name: 'Sokoły', shortName: 'SOK' },
  { id: 'opp-hutnik', name: 'Hutnik Doliny', shortName: 'HUT' },
  { id: 'opp-bialy-orzel', name: 'Biały Orzeł', shortName: 'BOR' },
  { id: 'opp-motor-pola', name: 'Motor Pola', shortName: 'MTP' },
  { id: 'opp-wisla-mala', name: 'Wisła Mała', shortName: 'WSM' },
  { id: 'opp-legia-rzeczna', name: 'Legia Rzeczna', shortName: 'LGR' },
] as const;

/** Opponents in one round-robin leg (catalog size). */
export const LEAGUE_SINGLE_RR_COUNT = OPPONENT_CATALOG.length;

/**
 * Full season calendar SSOT (LFE-LEAGUE-04): double RR = home+away vs each AI.
 * GDD §10 — 22 matchdays.
 */
export const LEAGUE_FIXTURE_COUNT = 22 as const;

export function getOpponentById(id: string): OpponentClub | null {
  return OPPONENT_CATALOG.find((o) => o.id === id) ?? null;
}

export function requireOpponent(id: string): OpponentClub {
  const o = getOpponentById(id);
  if (!o) {
    return { id, name: 'Rywal', shortName: 'RYW' };
  }
  return o;
}

/** Deterministic pick of `count` distinct opponents from catalog. */
export function pickOpponentsForClub(clubId: string, count: number): readonly OpponentClub[] {
  const n = Math.min(count, OPPONENT_CATALOG.length);
  if (n <= 0) return [];
  const start = hashIndex(clubId) % OPPONENT_CATALOG.length;
  const out: OpponentClub[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(OPPONENT_CATALOG[(start + i) % OPPONENT_CATALOG.length]!);
  }
  return out;
}

function hashIndex(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
