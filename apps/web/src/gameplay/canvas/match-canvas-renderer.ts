/**
 * Match Canvas Renderer 2D — LFE-CANVAS-RENDERER-01.
 * Reads MatchCanvasReadModel only. Never imports Engine / AI / CommandBus.
 * Never mutates MatchState.
 */

import type { MatchCanvasReadModel, MatchCanvasRenderer } from '@/gameplay/canvas-host';

import { deriveVisualFrame } from './derive-visual-frame';
import type {
  CanvasPlaybackMode,
  CanvasViewMode,
  VisualFrame,
  VisualFxKind,
  VisualPoint,
} from './types';

/** Design-token hex mirrors (canvas cannot use CSS vars on 2D context reliably). */
const TOKENS = {
  pitch: '#1F5C38',
  pitchDark: '#0C2818',
  line: 'rgba(240, 244, 250, 0.38)',
  home: '#C4A35A',
  away: '#5A7EA0',
  ball: '#F0F4FA',
  ballStroke: '#8A7340',
  void: '#03050A',
  text: '#F0F4FA',
  gold: '#C4A35A',
  danger: '#B85A5A',
  dangerSoft: 'rgba(184, 90, 90, 0.35)',
  warnSoft: 'rgba(196, 160, 53, 0.3)',
  infoSoft: 'rgba(90, 126, 160, 0.35)',
} as const;

const FX_MS: Record<VisualFxKind, number> = {
  MATCH_START: 1600,
  GOAL: 2200,
  SHOT: 900,
  FOUL: 1000,
  CORNER: 1100,
  SUBSTITUTION: 1400,
  HALF_END: 1800,
  MATCH_END: 2400,
};

export type MatchCanvasRendererOptions = {
  viewMode?: CanvasViewMode;
  playbackMode?: CanvasPlaybackMode;
  /** Target blend duration between simulation frames (ms). */
  interpMs?: number;
};

export type MatchCanvasRendererApi = MatchCanvasRenderer & {
  setViewMode(mode: CanvasViewMode): void;
  setPlaybackMode(mode: CanvasPlaybackMode): void;
  setInterpMs(ms: number): void;
};

export function createMatchCanvasRenderer(
  options: MatchCanvasRendererOptions = {},
): MatchCanvasRendererApi {
  let root: HTMLElement | null = null;
  let canvas: HTMLCanvasElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let raf = 0;
  let viewMode: CanvasViewMode = options.viewMode ?? 'tactical';
  let playbackMode: CanvasPlaybackMode = options.playbackMode ?? 'live';
  let interpMs = options.interpMs ?? 80;

  let from: VisualFrame | null = null;
  let to: VisualFrame | null = null;
  let blendStart = 0;
  let displayed: VisualFrame | null = null;
  let fxUntil = 0;
  let fxKind: VisualFxKind | null = null;
  let fxSide: string | undefined;
  let lastFxTick = -1;
  let running = false;

  const api: MatchCanvasRendererApi = {
    setViewMode(mode: CanvasViewMode) {
      viewMode = mode;
    },

    setPlaybackMode(mode: CanvasPlaybackMode) {
      playbackMode = mode;
      // Replay seeks often jump — tighten blend when entering live again.
      if (mode === 'replay') {
        lastFxTick = -1;
      }
    },

    setInterpMs(ms: number) {
      interpMs = Math.max(16, ms);
    },

    mount(el: HTMLElement) {
      root = el;
      canvas = document.createElement('canvas');
      canvas.setAttribute('data-lf-canvas-renderer', 'true');
      canvas.setAttribute('aria-hidden', 'true');
      canvas.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;z-index:1;pointer-events:none;display:block;';
      el.appendChild(canvas);
      ctx = canvas.getContext('2d');
      resize();
      running = true;
      loop();
    },

    unmount() {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
      canvas = null;
      ctx = null;
      root = null;
      from = to = displayed = null;
    },

    render(model: MatchCanvasReadModel) {
      const next = deriveVisualFrame(model);
      from = displayed ?? next;
      to = next;
      blendStart = performance.now();

      if (next.fx && next.fx.tick !== lastFxTick) {
        lastFxTick = next.fx.tick;
        fxKind = next.fx.kind;
        fxSide = next.fx.side;
        fxUntil = performance.now() + FX_MS[next.fx.kind];
      }

      if (!running && canvas && ctx) {
        running = true;
        loop();
      }
    },
  };

  function resize() {
    if (!canvas || !root) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = root.clientWidth || 640;
    const h = root.clientHeight || 360;
    canvas.width = Math.max(1, Math.floor(w * dpr));
    canvas.height = Math.max(1, Math.floor(h * dpr));
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;
    if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function loop() {
    if (!running) return;
    raf = requestAnimationFrame(loop);
    if (!ctx || !canvas || !root) return;
    if (
      canvas.width !==
      Math.floor((root.clientWidth || 1) * Math.min(window.devicePixelRatio || 1, 2))
    ) {
      resize();
    }

    const now = performance.now();
    if (from && to) {
      const t = clamp01((now - blendStart) / interpMs);
      displayed = lerpFrame(from, to, smoothstep(t));
    }

    if (!displayed) return;
    paint(ctx, root.clientWidth || 640, root.clientHeight || 360, displayed, {
      viewMode,
      playbackMode,
      fxKind: now < fxUntil ? fxKind : null,
      fxSide,
      fxAlpha: now < fxUntil ? clamp01((fxUntil - now) / 600) : 0,
    });
  }

  return api;
}

type PaintFx = {
  viewMode: CanvasViewMode;
  playbackMode: CanvasPlaybackMode;
  fxKind: VisualFxKind | null;
  fxSide?: string;
  fxAlpha: number;
};

function paint(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  frame: VisualFrame,
  fx: PaintFx,
) {
  const pad = viewPadding(fx.viewMode);
  const { sx, sy, ox, oy } = fitPitch(frame.pitchLength, frame.pitchWidth, cssW, cssH, pad);

  ctx.clearRect(0, 0, cssW, cssH);
  ctx.fillStyle = TOKENS.void;
  ctx.fillRect(0, 0, cssW, cssH);

  // Pitch body
  const pw = frame.pitchLength * sx;
  const ph = frame.pitchWidth * sy;
  const grad = ctx.createLinearGradient(ox, oy, ox, oy + ph);
  grad.addColorStop(0, 'rgba(31, 92, 56, 0.85)');
  grad.addColorStop(0.45, TOKENS.pitch);
  grad.addColorStop(1, TOKENS.pitchDark);
  roundRect(ctx, ox, oy, pw, ph, 6);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = TOKENS.line;
  ctx.lineWidth = 1;
  ctx.stroke();

  drawPitchMarkings(ctx, ox, oy, pw, ph);

  // Players
  for (const p of frame.players) {
    const c = worldToCanvas(p, sx, sy, ox, oy);
    drawPlayer(ctx, c.x, c.y, p.side, p.shirtNumber, fx.viewMode === 'formation');
  }

  // Ball
  const b = worldToCanvas(frame.ball, sx, sy, ox, oy);
  drawBall(ctx, b.x, b.y, fx.fxKind === 'SHOT' || fx.fxKind === 'GOAL');

  if (fx.fxKind && fx.fxAlpha > 0) {
    drawEventFx(ctx, cssW, cssH, ox, oy, pw, ph, fx.fxKind, fx.fxSide, fx.fxAlpha);
  }

  if (fx.playbackMode === 'replay') {
    ctx.save();
    ctx.fillStyle = 'rgba(3, 5, 10, 0.72)';
    ctx.fillRect(ox + 8, oy + ph - 28, 72, 18);
    ctx.strokeStyle = TOKENS.gold;
    ctx.strokeRect(ox + 8, oy + ph - 28, 72, 18);
    ctx.fillStyle = TOKENS.gold;
    ctx.font = 'bold 10px IBM Plex Sans, ui-sans-serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('REPLAY', ox + 44, oy + ph - 19);
    ctx.restore();
  }
}

function drawPitchMarkings(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  pw: number,
  ph: number,
) {
  ctx.save();
  ctx.strokeStyle = TOKENS.line;
  ctx.lineWidth = 1.25;
  // Halfway
  ctx.beginPath();
  ctx.moveTo(ox + pw / 2, oy);
  ctx.lineTo(ox + pw / 2, oy + ph);
  ctx.stroke();
  // Centre circle
  ctx.beginPath();
  ctx.arc(ox + pw / 2, oy + ph / 2, Math.min(pw, ph) * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(ox + pw / 2, oy + ph / 2, 2.2, 0, Math.PI * 2);
  ctx.fillStyle = TOKENS.line;
  ctx.fill();
  // Penalty boxes
  const boxW = pw * 0.14;
  const boxH = ph * 0.44;
  ctx.strokeRect(ox, oy + (ph - boxH) / 2, boxW, boxH);
  ctx.strokeRect(ox + pw - boxW, oy + (ph - boxH) / 2, boxW, boxH);
  const sixW = pw * 0.05;
  const sixH = ph * 0.22;
  ctx.strokeRect(ox, oy + (ph - sixH) / 2, sixW, sixH);
  ctx.strokeRect(ox + pw - sixW, oy + (ph - sixH) / 2, sixW, sixH);
  ctx.restore();
}

function drawPlayer(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  side: 'home' | 'away',
  shirt: number,
  showNumber: boolean,
) {
  const r = 7;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = side === 'home' ? TOKENS.home : TOKENS.away;
  ctx.fill();
  ctx.strokeStyle = 'rgba(3, 5, 10, 0.55)';
  ctx.lineWidth = 1;
  ctx.stroke();
  if (showNumber) {
    ctx.fillStyle = TOKENS.void;
    ctx.font = 'bold 8px IBM Plex Sans, ui-sans-serif, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(shirt), x, y + 0.5);
  }
}

function drawBall(ctx: CanvasRenderingContext2D, x: number, y: number, hot: boolean) {
  const r = hot ? 5.5 : 4.2;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = TOKENS.ball;
  ctx.fill();
  ctx.strokeStyle = TOKENS.ballStroke;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  if (hot) {
    ctx.beginPath();
    ctx.arc(x, y, r + 4, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(196, 163, 90, 0.45)';
    ctx.stroke();
  }
}

function drawEventFx(
  ctx: CanvasRenderingContext2D,
  cssW: number,
  cssH: number,
  ox: number,
  oy: number,
  pw: number,
  ph: number,
  kind: VisualFxKind,
  side: string | undefined,
  alpha: number,
) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, alpha + 0.25);

  if (kind === 'GOAL') {
    ctx.fillStyle = TOKENS.dangerSoft;
    ctx.fillRect(ox, oy, pw, ph);
  } else if (kind === 'FOUL') {
    ctx.fillStyle = TOKENS.warnSoft;
    ctx.fillRect(ox, oy, pw, ph);
  } else if (kind === 'SHOT') {
    const goalX = side === 'away' ? ox + 8 : ox + pw - 8;
    ctx.strokeStyle = TOKENS.gold;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(ox + pw / 2, oy + ph / 2);
    ctx.lineTo(goalX, oy + ph / 2);
    ctx.stroke();
  } else if (kind === 'CORNER') {
    ctx.strokeStyle = TOKENS.gold;
    ctx.lineWidth = 2;
    const cx = side === 'home' ? ox + pw - 10 : ox + 10;
    const cy = oy + 10;
    ctx.strokeRect(cx - 8, cy - 8, 16, 16);
  } else if (kind === 'SUBSTITUTION') {
    ctx.fillStyle = TOKENS.infoSoft;
    ctx.fillRect(ox, oy + ph - 18, pw, 18);
  } else if (kind === 'MATCH_START' || kind === 'HALF_END' || kind === 'MATCH_END') {
    ctx.fillStyle = 'rgba(3, 5, 10, 0.35)';
    ctx.fillRect(ox, oy, pw, ph);
  }

  const label = fxLabel(kind);
  ctx.fillStyle = TOKENS.text;
  ctx.font = 'bold 13px IBM Plex Sans, ui-sans-serif, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, cssW / 2, oy + 22);
  ctx.restore();
}

function fxLabel(kind: VisualFxKind): string {
  switch (kind) {
    case 'MATCH_START':
      return 'KICK-OFF';
    case 'GOAL':
      return 'GOL!';
    case 'SHOT':
      return 'STRZAŁ';
    case 'FOUL':
      return 'FAUL';
    case 'CORNER':
      return 'RÓŻNY';
    case 'SUBSTITUTION':
      return 'ZMIANA';
    case 'HALF_END':
      return 'KONIEC POŁOWY';
    case 'MATCH_END':
      return 'KONIEC MECZU';
  }
}

function viewPadding(mode: CanvasViewMode): number {
  if (mode === 'formation') return 28;
  if (mode === 'pressing') return 18;
  if (mode === 'balance') return 22;
  return 16;
}

function fitPitch(
  length: number,
  width: number,
  cssW: number,
  cssH: number,
  pad: number,
): { sx: number; sy: number; ox: number; oy: number } {
  const availW = Math.max(1, cssW - pad * 2);
  const availH = Math.max(1, cssH - pad * 2);
  const scale = Math.min(availW / length, availH / width);
  const pw = length * scale;
  const ph = width * scale;
  return {
    sx: scale,
    sy: scale,
    ox: (cssW - pw) / 2,
    oy: (cssH - ph) / 2,
  };
}

function worldToCanvas(
  p: VisualPoint,
  sx: number,
  sy: number,
  ox: number,
  oy: number,
): VisualPoint {
  // Pitch x along length (left=home goal), y along width — canvas y grows down.
  return { x: ox + p.x * sx, y: oy + p.y * sy };
}

function lerpFrame(a: VisualFrame, b: VisualFrame, t: number): VisualFrame {
  const byId = new Map(b.players.map((p) => [p.playerId, p]));
  const players = a.players.map((pa) => {
    const pb = byId.get(pa.playerId) ?? pa;
    return {
      ...pb,
      x: lerp(pa.x, pb.x, t),
      y: lerp(pa.y, pb.y, t),
    };
  });
  // Include any new players only in b
  for (const pb of b.players) {
    if (!a.players.some((p) => p.playerId === pb.playerId)) players.push(pb);
  }
  return {
    tick: b.tick,
    phase: b.phase,
    pitchLength: b.pitchLength,
    pitchWidth: b.pitchWidth,
    players,
    ball: { x: lerp(a.ball.x, b.ball.x, t), y: lerp(a.ball.y, b.ball.y, t) },
    fx: t > 0.5 ? b.fx : a.fx,
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function smoothstep(t: number): number {
  const x = clamp01(t);
  return x * x * (3 - 2 * x);
}

function clamp01(n: number): number {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}
