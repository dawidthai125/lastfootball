import type { EngineEvent } from '@lastfootball/lfe';
import { describe, expect, it } from 'vitest';

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';

import { deriveVisualFrame } from './derive-visual-frame';

function frame(
  events: readonly EngineEvent[] = [],
  tick = 12,
): ReturnType<typeof deriveVisualFrame> {
  const model = {
    matchId: 'm1',
    tick,
    matchState: {
      phase: 'FIRST_HALF',
      players: [{ id: 'p1', shirtNumber: 9 }],
    },
    spatial: {
      pitch: { length: 105, width: 68 },
      players: [
        {
          playerId: 'p1',
          side: 'home',
          slotIndex: 10,
          role: 'ST',
          position: { x: 81.5, y: 33.25 },
          facing: 0,
        },
      ],
      ball: { position: { x: 72.4, y: 21.1 } },
    },
    events,
  } as unknown as MatchCanvasReadModel;
  return deriveVisualFrame(model);
}

describe('deriveVisualFrame spatial reuse', () => {
  it('paints player and ball from the spatial snapshot', () => {
    const visual = frame();
    expect(visual.players[0]).toMatchObject({
      playerId: 'p1',
      shirtNumber: 9,
      x: 81.5,
      y: 33.25,
    });
    expect(visual.ball).toEqual({ x: 72.4, y: 21.1 });
    expect(visual.pitchLength).toBe(105);
    expect(visual.pitchWidth).toBe(68);
  });

  it('does not move the ball when a goal event arrives', () => {
    const goal = {
      type: 'GOAL',
      tick: 12,
      payload: { side: 'home' },
    } as EngineEvent;
    const visual = frame([goal]);
    expect(visual.ball).toEqual({ x: 72.4, y: 21.1 });
    expect(visual.players[0]?.x).toBe(81.5);
    expect(visual.fx).toMatchObject({ kind: 'GOAL', side: 'home', tick: 12 });
  });

  it('keeps the same pose when only the tick changes', () => {
    const early = frame([], 4);
    const later = frame([], 40);
    expect(later.players).toEqual(early.players);
    expect(later.ball).toEqual(early.ball);
  });
});
