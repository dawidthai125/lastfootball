/** Number for a newcomer, null when all 99 are worn. */
export function freeShirt(
  rows: readonly { readonly shirt_number: number; readonly departed_at: string | null }[],
): number | null {
  const worn = new Set(rows.filter((r) => r.departed_at == null).map((r) => r.shirt_number));
  const known = new Set(rows.map((r) => r.shirt_number));
  const all = Array.from({ length: 99 }, (_, i) => i + 1);
  // A number nobody ever had comes first; numbers of departed players are free as well.
  return all.find((n) => !known.has(n)) ?? all.find((n) => !worn.has(n)) ?? null;
}
