export type IntlReconcileRow = {
  readonly id: string;
  readonly intlAbsentUntil: string | null;
};

export type IntlReconcilePatch = {
  readonly id: string;
};

/** Pure: clear national call-up when intl_absent_until is before today. */
export function reconcileExpiredIntl(
  rows: readonly IntlReconcileRow[],
  today: string,
): readonly IntlReconcilePatch[] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return [];
  const patches: IntlReconcilePatch[] = [];
  for (const row of rows) {
    if (!row.intlAbsentUntil || row.intlAbsentUntil >= today) continue;
    patches.push({ id: row.id });
  }
  return patches;
}
