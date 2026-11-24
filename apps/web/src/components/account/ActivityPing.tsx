'use client';

import { useEffect } from 'react';

/** Tells the server once a day that this account plays. */
export function ActivityPing({ accountId }: { readonly accountId: string }) {
  useEffect(() => {
    const key = `lf-activity-${accountId}`;
    const today = new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Warsaw' });
    try {
      if (localStorage.getItem(key) === today) return;
    } catch {
      // Blocked storage: the server ignores repeats.
    }
    void fetch('/api/activity', { method: 'POST' })
      .then((response) => {
        if (response.ok) localStorage.setItem(key, today);
      })
      .catch(() => undefined);
  }, [accountId]);
  return null;
}
