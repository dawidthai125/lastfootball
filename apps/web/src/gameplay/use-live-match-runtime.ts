'use client';

import { useEffect, useMemo, useSyncExternalStore } from 'react';

import type { Fixture, LiveMatchBundle } from '@/data/fixtures';
import { LiveMatchRuntime, type LiveMatchSnapshot } from '@/gameplay/live-match-runtime';

export function useLiveMatchRuntime(
  fixture: Fixture,
  shell: LiveMatchBundle,
): {
  snapshot: LiveMatchSnapshot;
  runtime: LiveMatchRuntime;
  dispatchUiCommand: (commandId: string) => void;
} {
  const runtime = useMemo(() => new LiveMatchRuntime(fixture, shell), [fixture, shell]);

  useEffect(() => {
    return () => runtime.dispose();
  }, [runtime]);

  const snapshot = useSyncExternalStore(
    (onStoreChange) => runtime.subscribe(onStoreChange),
    () => runtime.getSnapshot(),
    () => runtime.getSnapshot(),
  );

  return {
    snapshot,
    runtime,
    dispatchUiCommand: (id) => runtime.dispatchUiCommand(id),
  };
}
