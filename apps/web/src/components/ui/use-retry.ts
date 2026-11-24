'use client';

import { startTransition } from 'react';
import { useRouter } from 'next/navigation';

/** `reset` alone draws the same failed page again, so the page is asked for anew. */
export function useRetry(reset: () => void): () => void {
  const router = useRouter();
  return () =>
    startTransition(() => {
      router.refresh();
      reset();
    });
}
