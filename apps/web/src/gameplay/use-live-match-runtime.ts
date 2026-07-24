'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import type { Fixture, LiveMatchBundle } from '@/data/fixtures';
import type { ClubDto } from '@/lib/club/types';
import { LiveMatchRuntime, type LiveMatchSnapshot } from '@/gameplay/live-match-runtime';

export function useLiveMatchRuntime(
  fixture: Fixture,
  shell: LiveMatchBundle,
  club?: ClubDto | null,
): {
  snapshot: LiveMatchSnapshot | null;
  runtime: LiveMatchRuntime | null;
  dispatchUiCommand: (commandId: string) => void;
} {
  const [runtime, setRuntime] = useState<LiveMatchRuntime | null>(null);

  useEffect(() => {
    const rt = new LiveMatchRuntime(fixture, shell, club);
    rt.ensureSimulationRunning();
    setRuntime(rt);
    return () => {
      rt.dispose();
      setRuntime(null);
    };
    // Recreate only when match identity changes — not on parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixture/shell/club by id
  }, [fixture.id, shell.fixture.id, club?.id]);

  const snapshot = useSyncExternalStore(
    (onStoreChange) => {
      if (!runtime) return () => undefined;
      return runtime.subscribe(onStoreChange);
    },
    () => (runtime ? runtime.getSnapshot() : null),
    () => (runtime ? runtime.getSnapshot() : null),
  );

  return {
    snapshot,
    runtime,
    dispatchUiCommand: (id) => {
      runtime?.dispatchUiCommand(id);
    },
  };
}
