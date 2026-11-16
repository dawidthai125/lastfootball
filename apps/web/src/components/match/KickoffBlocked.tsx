import Link from 'next/link';

import { UI_COPY } from '@/lib/ui/copy';

/** Upcoming entry is closed. The match engine is not mounted. */
export function KickoffBlocked({ sentence }: { sentence: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--lf-space-3)' }}>
      <p
        style={{
          margin: 0,
          fontSize: 'var(--lf-type-body)',
          color: 'var(--lf-color-text-primary)',
        }}
      >
        {sentence}
      </p>
      <Link
        href="/hub"
        style={{ color: 'var(--lf-color-text-gold)', fontSize: 'var(--lf-type-caption)' }}
      >
        {UI_COPY.hubExit}
      </Link>
    </div>
  );
}
