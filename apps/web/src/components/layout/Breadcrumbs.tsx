import Link from 'next/link';

type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb" style={{ marginBottom: 'var(--lf-space-3)' }}>
      <ol
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 'var(--lf-space-1)',
          listStyle: 'none',
          margin: 0,
          padding: 0,
          fontSize: 'var(--lf-type-caption)',
          color: 'var(--lf-color-text-muted)',
        }}
      >
        {items.map((item, index) => {
          const last = index === items.length - 1;
          return (
            <li key={`${item.label}-${index}`} style={{ display: 'flex', alignItems: 'center', gap: 'var(--lf-space-1)' }}>
              {index > 0 ? <span style={{ color: 'var(--lf-color-text-faint)' }}>/</span> : null}
              {item.href && !last ? (
                <Link href={item.href} style={{ color: 'var(--lf-color-text-gold)' }}>
                  {item.label}
                </Link>
              ) : (
                <span style={{ color: last ? 'var(--lf-color-text-primary)' : undefined }}>{item.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
