'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keeps the match on screen when the save refreshes this route. The fixture is then
 * played, so the server sends no match; the first one stays for the summary.
 * A played fixture opened fresh has nothing to keep and goes to its result page.
 */
export function LiveMatchShell({
  playedHref,
  children,
}: {
  playedHref: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [match] = useState<ReactNode>(children);
  const empty = match == null;

  useEffect(() => {
    if (empty) router.replace(playedHref);
  }, [empty, playedHref, router]);

  return <>{match}</>;
}
