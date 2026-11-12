import { standDress, standInset, type StandCrowd } from '@/lib/stadium/levels';

const BOWL = '#141820';
const FASCIA = '#C4A35A';
const ROOF = '#1C2230';

const SEAT_A: Record<Exclude<StandCrowd, 'none'>, string> = {
  sparse: '#8EA4BE',
  full: '#C4A35A',
  covered: '#E6D7A8',
};

const SEAT_B: Record<Exclude<StandCrowd, 'none'>, string> = {
  sparse: '#F0F4FA',
  full: '#F0F4FA',
  covered: '#8EA4BE',
};

type BowlCtx = {
  fillStyle: CanvasRenderingContext2D['fillStyle'];
  fillRect(x: number, y: number, w: number, h: number): void;
};

/**
 * Stands around the grass. Level 0 paints nothing.
 * Seat rows stay inside the existing inset, so the pitch size does not change.
 */
export function paintStandBowl(
  ctx: BowlCtx,
  ox: number,
  oy: number,
  pw: number,
  ph: number,
  level: number,
): void {
  const band = standInset(level);
  const dress = standDress(level);
  if (band <= 0 || dress.rows <= 0 || dress.crowd === 'none' || pw < 8 || ph < 8) return;

  const gap = 2;
  const x0 = ox - band - gap;
  const y0 = oy - band - gap;
  const x1 = ox + pw + gap;
  const span = pw + gap * 2 + band * 2;

  ctx.fillStyle = BOWL;
  ctx.fillRect(x0, y0, span, band);
  ctx.fillRect(x0, oy + ph + gap, span, band);
  ctx.fillRect(x0, oy, band, ph);
  ctx.fillRect(x1, oy, band, ph);

  paintSeatRun(ctx, ox, y0, pw, band, true, dress.rows, dress.crowd);
  paintSeatRun(ctx, ox, oy + ph + gap, pw, band, true, dress.rows, dress.crowd);
  paintSeatRun(ctx, x0, oy, ph, band, false, dress.rows, dress.crowd);
  paintSeatRun(ctx, x1, oy, ph, band, false, dress.rows, dress.crowd);

  if (dress.roof) {
    ctx.fillStyle = ROOF;
    ctx.fillRect(x0 - 2, y0 - 5, span + 4, 4);
    ctx.fillStyle = FASCIA;
    ctx.fillRect(x0 - 2, y0 - 1, span + 4, 1);
  }

  if (dress.lights) {
    const lampY = y0 - (dress.roof ? 7 : 3);
    ctx.fillStyle = FASCIA;
    ctx.fillRect(x0 + 2, lampY, 2, 2);
    ctx.fillRect(x0 + span - 4, lampY, 2, 2);
  }
}

function paintSeatRun(
  ctx: BowlCtx,
  originX: number,
  originY: number,
  along: number,
  depth: number,
  horizontal: boolean,
  rows: number,
  crowd: Exclude<StandCrowd, 'none'>,
): void {
  const rowH = 2;
  const rowGap = 1;
  const used = rows * rowH + (rows - 1) * rowGap;
  const inset = Math.max(1, Math.floor((depth - used) / 2));
  const step = 4;
  for (let row = 0; row < rows; row += 1) {
    const cross = inset + row * (rowH + rowGap);
    if (cross + rowH > depth) break;
    for (let seat = 2; seat < along - 2; seat += step) {
      const index = Math.floor(seat / step);
      if (index % 7 === 6) continue;
      ctx.fillStyle = (row + index) % 2 === 0 ? SEAT_A[crowd] : SEAT_B[crowd];
      if (horizontal) ctx.fillRect(originX + seat, originY + cross, 2, 2);
      else ctx.fillRect(originX + cross, originY + seat, 2, 2);
    }
  }
}
