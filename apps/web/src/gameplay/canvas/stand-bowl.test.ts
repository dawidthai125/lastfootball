import { describe, expect, it } from 'vitest';

import { paintStandBowl } from '@/gameplay/canvas/stand-bowl';

type Rect = { fill: string; x: number; y: number; w: number; h: number };

function recorder() {
  const rects: Rect[] = [];
  return {
    rects,
    ctx: {
      fillStyle: '',
      fillRect(x: number, y: number, w: number, h: number) {
        rects.push({ fill: this.fillStyle, x, y, w, h });
      },
    },
  };
}

describe('paintStandBowl', () => {
  it('paints nothing at level 0', () => {
    const rec = recorder();
    paintStandBowl(rec.ctx, 40, 30, 200, 120, 0);
    expect(rec.rects).toHaveLength(0);
  });

  it('paints a bowl and seats at level 1, with no roof', () => {
    const rec = recorder();
    paintStandBowl(rec.ctx, 40, 30, 200, 120, 1);
    expect(rec.rects.length).toBeGreaterThan(4);
    expect(rec.rects.some((rect) => rect.fill === '#141820')).toBe(true);
    expect(rec.rects.some((rect) => rect.fill === '#1C2230')).toBe(false);
    const seats = rec.rects.filter((rect) => rect.w === 2 && rect.h === 2);
    expect(seats.length).toBeGreaterThan(8);
    for (const seat of seats) {
      const onPitch = seat.x >= 40 && seat.x < 240 && seat.y >= 30 && seat.y < 150;
      expect(onPitch).toBe(false);
    }
  });

  it('adds a roof at level 3', () => {
    const rec = recorder();
    paintStandBowl(rec.ctx, 40, 30, 200, 120, 3);
    expect(rec.rects.some((rect) => rect.fill === '#1C2230' && rect.h === 4)).toBe(true);
  });
});
