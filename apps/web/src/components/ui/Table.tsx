import type { ReactNode } from 'react';

type Column<T> = {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
};

type TableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  dense?: boolean;
  highlight?: (row: T) => boolean;
};

const alignClass = {
  left: 'text-left',
  right: 'text-right',
  center: 'text-center',
} as const;

export function Table<T>({ columns, rows, rowKey, dense = true, highlight }: TableProps<T>) {
  const pad = dense ? 'px-2 py-1' : 'px-2.5 py-1.5';

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left text-[12px]">
        <thead>
          <tr className="border-b border-[var(--lf-border)] bg-[var(--lf-inset)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className={`${pad} font-[family-name:var(--font-ui)] text-[10px] font-semibold tracking-wide text-[var(--lf-faint)] uppercase ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const hi = highlight?.(row);
            return (
              <tr
                key={rowKey(row)}
                className={[
                  'border-b border-[var(--lf-border)]/70',
                  hi ? 'bg-[var(--lf-gold-soft)]' : 'hover:bg-[var(--lf-panel-hover)]/60',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`${pad} ${alignClass[col.align ?? 'left']} ${col.className ?? ''}`}
                  >
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
