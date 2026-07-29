'use client';

import { useEffect } from 'react';

import { StateBanner } from '@/components/ui';
import { UI_COPY } from '@/lib/ui/copy';

export default function DomainError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{ padding: 'var(--lf-space-4) 0', maxWidth: '42rem' }}>
      <StateBanner tone="error" onRetry={reset} retryLabel={UI_COPY.retry}>
        Nie udało się wczytać tego ekranu. {UI_COPY.retry} — jeśli problem wraca, wróć do Hub.
      </StateBanner>
    </div>
  );
}
