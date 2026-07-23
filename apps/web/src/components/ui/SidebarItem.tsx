import Link from 'next/link';

type SidebarItemProps = {
  href: string;
  label: string;
  active?: boolean;
  badge?: number | string;
};

export function SidebarItem({ href, label, active = false, badge }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className={[
        'flex items-center justify-between gap-2 border-l-2 px-2.5 py-[5px] text-[12px] transition-colors',
        active
          ? 'border-[var(--lf-gold)] bg-[var(--lf-gold-soft)] text-[var(--lf-text-strong)]'
          : 'border-transparent text-[var(--lf-muted)] hover:bg-[var(--lf-panel-hover)] hover:text-[var(--lf-text)]',
      ].join(' ')}
    >
      <span className="truncate font-[family-name:var(--font-ui)] tracking-wide">{label}</span>
      {badge != null ? (
        <span className="min-w-[1.1rem] rounded-[var(--lf-radius-sm)] bg-[var(--lf-danger)] px-1 text-center text-[10px] font-semibold text-white tabular-nums">
          {badge}
        </span>
      ) : null}
    </Link>
  );
}
