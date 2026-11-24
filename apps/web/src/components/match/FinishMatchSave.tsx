'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

import { COMPLETE_FIXTURE_INITIAL } from '@/lib/fixtures/action-types';
import { completeFixture } from '@/lib/fixtures/complete-fixture';
import type { UnfinishedMatch } from '@/lib/fixtures/unfinished-match';

/** Finishes a save that stopped half way. The server does every step at most once. */
export function FinishMatchSave({ match }: { match: UnfinishedMatch }) {
  const router = useRouter();
  const started = useRef<string | null>(null);

  useEffect(() => {
    if (started.current === match.fixtureId) return;
    started.current = match.fixtureId;
    const form = new FormData();
    form.set('fixtureId', match.fixtureId);
    form.set('managerLog', match.managerLog);
    form.set('shape', match.shape);
    form.set('stay', '1');
    // Nobody asked for this save, so its failure must not take the page away.
    completeFixture(COMPLETE_FIXTURE_INITIAL, form).then(
      () => router.refresh(),
      () => undefined,
    );
  }, [match, router]);

  return null;
}
