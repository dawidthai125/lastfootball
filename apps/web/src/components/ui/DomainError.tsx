'use client';

import { useEffect } from 'react';

import { StateBanner } from '@/components/ui';

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
      <StateBanner tone="error" onRetry={reset} retryLabel="Spróbuj ponownie">
        Nie udało się wczytać tego ekranu. Spróbuj ponownie — jeśli problem wraca, wróć do Hub.
      </StateBanner>
    </div>
  );
}
