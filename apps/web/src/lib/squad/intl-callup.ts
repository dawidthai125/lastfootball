export type IntlCallup = {
  readonly playerId: string;
  readonly playerName: string;
  readonly until: string;
  readonly subject: string;
};

export type IntlCandidate = {
  readonly id: string;
  readonly name: string;
  readonly skill: number;
  readonly nationality: string;
  readonly starter: boolean;
  readonly onLoan: boolean;
  readonly loanedIn: boolean;
};

function addDays(iso: string, days: number): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return '2026-11-18';
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(Date.UTC(y!, m! - 1, d! + days));
  const yy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

/**
 * Thin national call-up: at most one Polish starter with skill ≥ 66 per day hash.
 * Pure — absence is stored when the manager accepts the message action.
 */
export function resolveIntlCallup(input: {
  readonly clubId: string;
  readonly today: string;
  readonly players: readonly IntlCandidate[];
  readonly alreadyAbsentIds: readonly string[];
}): IntlCallup | null {
  const pool = input.players
    .filter(
      (p) =>
        p.starter &&
        !p.onLoan &&
        !p.loanedIn &&
        p.nationality === 'POL' &&
        p.skill >= 66 &&
        !input.alreadyAbsentIds.includes(p.id),
    )
    .slice()
    .sort((a, b) => b.skill - a.skill || a.id.localeCompare(b.id));
  if (pool.length === 0) return null;
  let hash = 0;
  const key = `${input.clubId}:${input.today}`;
  for (let i = 0; i < key.length; i++) hash = (hash * 33 + key.charCodeAt(i)) >>> 0;
  if (hash % 5 !== 0) return null;
  const pick = pool[hash % pool.length]!;
  const until = addDays(input.today, 3);
  return {
    playerId: pick.id,
    playerName: pick.name,
    until,
    subject: `Powołanie: ${pick.name}`,
  };
}

export function intlBlocksLineup(absentUntil: string | null | undefined, today: string): boolean {
  if (!absentUntil || !/^\d{4}-\d{2}-\d{2}/.test(absentUntil)) return false;
  return absentUntil.slice(0, 10) >= today;
}
