'use client';

import { useEffect } from 'react';

import type { LiveMatchRuntime } from '@/gameplay/live-match-runtime';

const EVERY_MS = 8_000;
const CHECK_MS = 1_000;

/** Tells the server how far the match is: often, after a decision or a goal, and on leaving. */
export function useMatchProgress(runtime: LiveMatchRuntime | null, fixtureId: string | null): void {
  useEffect(() => {
    if (!runtime || !fixtureId) return;
    let sentTick = -1;
    let sentMark = '';
    let sentAt = 0;

    const send = (leaving: boolean) => {
      const { tick, log } = runtime.progress();
      const score = runtime.session.getMatchState().score;
      const mark = `${log.length}|${score.home}|${score.away}`;
      const due = Date.now() - sentAt >= EVERY_MS && tick !== sentTick;
      if (tick <= 0 || (tick === sentTick && mark === sentMark)) return;
      if (!leaving && !due && mark === sentMark) return;
      sentTick = tick;
      sentMark = mark;
      sentAt = Date.now();
      // Best effort: the next call carries everything again.
      void fetch('/api/match/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtureId, tick, log }),
        keepalive: true,
      }).catch(() => undefined);
    };

    const onHide = () => send(true);
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') send(true);
    };
    const timer = setInterval(() => send(false), CHECK_MS);
    window.addEventListener('pagehide', onHide);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      clearInterval(timer);
      window.removeEventListener('pagehide', onHide);
      document.removeEventListener('visibilitychange', onVisibility);
      send(true);
    };
  }, [runtime, fixtureId]);
}
