const ROWS = 1000;

type Page = PromiseLike<{ data: unknown; error: unknown }>;

/**
 * PostgREST answers with at most 1000 rows, so longer lists come in parts. The query needs a
 * stable order. Null = a part failed: a list with a hole is not shown as the whole.
 */
export async function readPages<T>(query: (from: number, to: number) => Page): Promise<T[] | null> {
  const rows: T[] = [];
  for (;;) {
    const { data, error } = await query(rows.length, rows.length + ROWS - 1);
    if (error || !Array.isArray(data)) return null;
    rows.push(...(data as T[]));
    if (data.length < ROWS) return rows;
  }
}
