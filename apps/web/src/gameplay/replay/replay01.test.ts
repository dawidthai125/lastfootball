/**
 * LFE-REPLAY-01 — buffer + controller unit checks (no Engine).
 */
import { describe, expect, it, vi } from 'vitest';

import type { MatchCanvasReadModel } from '../canvas-host';
import { createReplayBuffer } from './replay-buffer';
import { createReplayController } from './replay-controller';

function fakeModel(tick: number): MatchCanvasReadModel {
  return {
    matchId: 'm-test',
    tick,
    matchState: { tick, phase: 'FIRST_HALF' } as unknown as MatchCanvasReadModel['matchState'],
    spatial: {
      players: [],
      ball: { position: { x: 0, y: 0 } },
    } as unknown as MatchCanvasReadModel['spatial'],
    events: Object.freeze([{ type: 'POSSESSION', tick, payload: { side: 'home' } }]),
  };
}

describe('LFE-REPLAY-01', () => {
  it('buffers frames and presents on play/seek without Engine', () => {
    const buffer = createReplayBuffer({ capacity: 8 });
    for (let i = 0; i < 5; i++) buffer.append(fakeModel(i * 8));

    const presented: number[] = [];
    const ctrl = createReplayController(buffer, {
      onPresent: (m) => presented.push(m.tick),
      baseIntervalMs: 10_000,
    });

    expect(buffer.length).toBe(5);
    ctrl.seek(2);
    expect(presented.at(-1)).toBe(16);
    ctrl.play();
    expect(ctrl.getStatus()).toBe('playing');
    ctrl.pause();
    expect(ctrl.getStatus()).toBe('paused');
    ctrl.setSpeed(2);
    expect(ctrl.getSpeed()).toBe(2);
    ctrl.stop();
    expect(ctrl.getIndex()).toBe(0);
    expect(presented.at(-1)).toBe(0);
    ctrl.dispose();
  });

  it('ring buffer drops oldest frames', () => {
    const buffer = createReplayBuffer({ capacity: 3 });
    buffer.append(fakeModel(1));
    buffer.append(fakeModel(2));
    buffer.append(fakeModel(3));
    buffer.append(fakeModel(4));
    expect(buffer.length).toBe(3);
    expect(buffer.at(0)?.model.tick).toBe(2);
    expect(buffer.at(2)?.model.tick).toBe(4);
  });

  it('seekRatio maps 0..1 onto buffer', () => {
    const buffer = createReplayBuffer({ capacity: 10 });
    for (let i = 0; i < 5; i++) buffer.append(fakeModel(i));
    const onPresent = vi.fn();
    const ctrl = createReplayController(buffer, { onPresent });
    ctrl.seekRatio(1);
    expect(ctrl.getIndex()).toBe(4);
    ctrl.seekRatio(0);
    expect(ctrl.getIndex()).toBe(0);
    ctrl.dispose();
  });
});
