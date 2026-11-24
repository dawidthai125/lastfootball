import { describe, expect, it } from 'vitest';

import { lerpFrame } from '@/gameplay/canvas/match-canvas-renderer';

type Frame = Parameters<typeof lerpFrame>[0];

const frame = (players: { playerId: string; x: number; y: number }[]): Frame =>
  ({
    tick: 1,
    phase: 'FIRST_HALF',
    pitchLength: 105,
    pitchWidth: 68,
    players,
    ball: { x: 0, y: 0 },
    ballOwnerId: null,
    referee: null,
    fx: null,
  }) as unknown as Frame;

describe('lerpFrame', () => {
  it('drops a player who went off and adds the one who came on', () => {
    const mixed = lerpFrame(
      frame([
        { playerId: 'off', x: 10, y: 10 },
        { playerId: 'stays', x: 0, y: 0 },
      ]),
      frame([
        { playerId: 'stays', x: 10, y: 20 },
        { playerId: 'on', x: 5, y: 5 },
      ]),
      0.5,
    );
    expect(mixed.players.map((p) => p.playerId)).toEqual(['stays', 'on']);
    expect(mixed.players[0]).toMatchObject({ x: 5, y: 10 });
  });
});
