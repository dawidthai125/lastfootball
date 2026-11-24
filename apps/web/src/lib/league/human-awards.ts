import { formatMoney } from '@/lib/finance/format-money';
import type { HumanTableRow } from '@/lib/league/human-table';

/** A club has to play half of the season itself: nobody is paid for walkovers of others. */
export const HUMAN_AWARD_MIN_PLAYED = 11;

/** € by place 1–6, paid once when the season closes (D143). */
export const HUMAN_PRIZES: readonly number[] = [30_000, 20_000, 12_000, 6_000, 6_000, 6_000];

/** "Nagrody: 1. miejsce 30 000 €, …" Equal neighbours share one entry. */
export function humanPrizeLine(prizes: readonly number[] = HUMAN_PRIZES): string {
  const parts: string[] = [];
  for (let from = 0; from < prizes.length;) {
    let to = from;
    while (to + 1 < prizes.length && prizes[to + 1] === prizes[from]) to += 1;
    const places = to > from ? `${from + 1}.–${to + 1}.` : `${from + 1}.`;
    parts.push(`${places} miejsce ${formatMoney(prizes[from]!)}`);
    from = to + 1;
  }
  return `Nagrody na koniec sezonu: ${parts.join(', ')}. Trzeba rozegrać co najmniej ${HUMAN_AWARD_MIN_PLAYED} z 22 kolejek.`;
}

export type HumanAward = {
  readonly club_id: string;
  readonly place: number;
  readonly amount: number;
  readonly played: number;
};

/** Every player club that earned its place. Bots keep their places and take no money. */
export function humanAwards(
  standings: readonly HumanTableRow[],
  playedByClub: ReadonlyMap<string, number>,
): readonly HumanAward[] {
  return standings.flatMap((row, index) => {
    const played = playedByClub.get(row.id) ?? 0;
    if (row.isBot || played < HUMAN_AWARD_MIN_PLAYED) return [];
    return [{ club_id: row.id, place: index + 1, amount: HUMAN_PRIZES[index] ?? 0, played }];
  });
}

export function parseHumanAwards(raw: unknown): readonly HumanAward[] {
  if (!Array.isArray(raw)) return [];
  return (raw as Partial<HumanAward>[]).flatMap((row) =>
    typeof row?.club_id === 'string' && typeof row.place === 'number'
      ? [
          {
            club_id: row.club_id,
            place: row.place,
            amount: Number(row.amount) || 0,
            played: Number(row.played) || 0,
          },
        ]
      : [],
  );
}
