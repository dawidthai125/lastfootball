'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

import type { FormationCode } from '@lastfootball/lfe';

import type { Fixture, LiveMatchBundle } from '@/data/fixtures';
import type { ClubDto } from '@/lib/club/types';
import type { FixtureDto } from '@/lib/fixtures/types';
import type { RosterPlayerSeed } from '@/lib/squad';
import { LiveMatchRuntime, type LiveMatchSnapshot } from '@/gameplay/live-match-runtime';

export function useLiveMatchRuntime(
  fixture: Fixture,
  shell: LiveMatchBundle,
  club?: ClubDto | null,
  leagueFixture?: FixtureDto | null,
  ourXi?: readonly RosterPlayerSeed[] | null,
  ourBench?: readonly RosterPlayerSeed[] | null,
  ourFormation: FormationCode = '4-4-2',
  theirXi?: readonly RosterPlayerSeed[] | null,
): {
  snapshot: LiveMatchSnapshot | null;
  runtime: LiveMatchRuntime | null;
  sessionError: string | null;
  dispatchUiCommand: (commandId: string) => boolean;
  substitute: (outId: string, inId: string) => { ok: boolean; error?: string };
  togglePause: () => void;
  setWatchSpeed: (speed: 1 | 2 | 4) => void;
} {
  const [runtime, setRuntime] = useState<LiveMatchRuntime | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const xiKey = `${ourFormation}|${ourXi?.map((p) => p.id).join(',') ?? ''}|${ourBench?.map((p) => p.id).join(',') ?? ''}|${theirXi?.map((p) => p.id).join(',') ?? ''}`;

  useEffect(() => {
    setSessionError(null);
    let rt: LiveMatchRuntime;
    try {
      rt = new LiveMatchRuntime(
        fixture,
        shell,
        club,
        leagueFixture,
        ourXi,
        ourBench,
        ourFormation,
        theirXi,
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Nie można rozpocząć meczu.';
      setSessionError(message);
      return;
    }
    rt.ensureSimulationRunning();
    setRuntime(rt);
    return () => {
      rt.dispose();
      setRuntime(null);
    };
    // Recreate only when match identity / XI ids change — not on parent re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fixture/shell/club by id
  }, [fixture.id, shell.fixture.id, club?.id, leagueFixture?.id, xiKey, ourFormation]);

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
    sessionError,
    dispatchUiCommand: (id) => runtime?.dispatchUiCommand(id) ?? false,
    substitute: (outId, inId) =>
      runtime?.substitute(outId, inId) ?? { ok: false, error: 'Mecz nie jest uruchomiony.' },
    togglePause: () => runtime?.togglePause(),
    setWatchSpeed: (speed) => runtime?.setWatchSpeed(speed),
  };
}
