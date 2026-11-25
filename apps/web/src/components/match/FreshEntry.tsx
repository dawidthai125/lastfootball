'use client';

import { useEffect, useState, type ReactNode } from 'react';

/** Entries of this tab that were already played from. */
const used = new Set<string>();
const SETTLED_MS = 1_000;

/**
 * Browser Back shows the page as it was sent before, with the match at its old minute.
 * Such an entry is loaded again, so the match goes on from the saved tick.
 */
export function FreshEntry({ token, children }: { token: string; children: ReactNode }) {
  const [stale] = useState(() => used.has(token));

  useEffect(() => {
    if (stale) {
      window.location.reload();
      return;
    }
    const at = Date.now();
    return () => {
      if (Date.now() - at >= SETTLED_MS) used.add(token);
    };
  }, [stale, token]);

  if (stale) return <p role="status">Wczytywanie meczu…</p>;
  return <>{children}</>;
}
