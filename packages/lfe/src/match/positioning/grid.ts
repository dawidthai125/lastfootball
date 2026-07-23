import type { Pitch } from '../domain/pitch';

import type { Position } from './coordinates';
import { position } from './coordinates';

/**
 * Discrete pitch grid for zone queries / future spatial indexes.
 * Pure data — not a renderer tilemap.
 */
export interface PitchGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cellWidth: number;
  readonly cellHeight: number;
  readonly pitchLength: number;
  readonly pitchWidth: number;
}

export interface GridCell {
  readonly col: number;
  readonly row: number;
}

export function createPitchGrid(pitch: Pitch, cols = 21, rows = 14): PitchGrid {
  const c = Math.max(1, Math.floor(cols));
  const r = Math.max(1, Math.floor(rows));
  return Object.freeze({
    cols: c,
    rows: r,
    cellWidth: pitch.length / c,
    cellHeight: pitch.width / r,
    pitchLength: pitch.length,
    pitchWidth: pitch.width,
  });
}

export function cellAt(grid: PitchGrid, pos: Position): GridCell {
  const col = Math.min(grid.cols - 1, Math.max(0, Math.floor(pos.x / grid.cellWidth)));
  const row = Math.min(grid.rows - 1, Math.max(0, Math.floor(pos.y / grid.cellHeight)));
  return Object.freeze({ col, row });
}

export function cellCenter(grid: PitchGrid, col: number, row: number): Position {
  const c = Math.min(grid.cols - 1, Math.max(0, col));
  const r = Math.min(grid.rows - 1, Math.max(0, row));
  return position((c + 0.5) * grid.cellWidth, (r + 0.5) * grid.cellHeight);
}

export function sameCell(a: GridCell, b: GridCell): boolean {
  return a.col === b.col && a.row === b.row;
}
