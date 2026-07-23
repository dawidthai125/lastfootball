/**
 * Derive a presentation frame from MatchState + spatial + EventBus history.
 * Pure / deterministic — never mutates MatchState. No Engine / AI imports.
 */

import type { EngineEvent, MatchState, MatchSpatialState } from '@lastfootball/lfe';

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';
import type { VisualFrame, VisualFx, VisualFxKind, VisualPlayer, VisualPoint } from './types';

const FX_KINDS = new Set<string>([
  'MATCH_START',
  'GOAL',
  'SHOT',
  'FOUL',
  'CORNER',
  'SUBSTITUTION',
  'HALF_END',
  'MATCH_END',
]);

export function deriveVisualFrame(model: MatchCanvasReadModel): VisualFrame {
  const { matchState, spatial, tick, events } = model;
  const pitch = spatial.pitch;
  const ballTarget = deriveBallTarget(matchState, spatial, events);
  const players = spatial.players.map((sp) => {
    const meta = matchState.players.find((p) => p.id === sp.playerId);
    const toward = pullToward(sp.position, ballTarget, sp.role === 'GK' ? 0.02 : 0.12);
    const idle = idleWobble(sp.playerId, tick, sp.role === 'GK' ? 0.08 : 0.28);
    return {
      playerId: String(sp.playerId),
      side: sp.side,
      role: sp.role,
      shirtNumber: meta?.shirtNumber ?? sp.slotIndex + 1,
      x: clamp(toward.x + idle.x, 0, pitch.length),
      y: clamp(toward.y + idle.y, 0, pitch.width),
    } satisfies VisualPlayer;
  });

  return {
    tick,
    phase: matchState.phase,
    pitchLength: pitch.length,
    pitchWidth: pitch.width,
    players,
    ball: ballTarget,
    fx: deriveFx(events, tick),
  };
}

function deriveBallTarget(
  matchState: MatchState,
  spatial: MatchSpatialState,
  events: readonly EngineEvent[],
): VisualPoint {
  const L = spatial.pitch.length;
  const W = spatial.pitch.width;
  const centre = { x: L / 2, y: W / 2 };
  const phase = matchState.phase;

  if (
    phase === 'HALF_TIME' ||
    phase === 'FULL_TIME' ||
    phase === 'FINISHED' ||
    phase === 'PRE_MATCH'
  ) {
    return centre;
  }

  const lastFx = [...events].reverse().find((e) => FX_KINDS.has(String(e.type)));
  const lastPoss = [...events]
    .reverse()
    .find((e) => e.type === 'POSSESSION' || e.type === 'ATTACK');
  const side = eventSide(lastFx) ?? eventSide(lastPoss) ?? 'home';
  const attackX = side === 'home' ? 1 : -1;

  if (lastFx) {
    switch (lastFx.type) {
      case 'GOAL':
        return { x: side === 'home' ? L - 1.5 : 1.5, y: W / 2 };
      case 'SHOT':
        return {
          x: side === 'home' ? L * 0.88 : L * 0.12,
          y: W / 2 + signedHash(String(lastFx.tick), 4),
        };
      case 'CORNER':
        return {
          x: side === 'home' ? L - 1 : 1,
          y: hashBit(String(lastFx.tick)) ? W - 1 : 1,
        };
      case 'FOUL':
        return offsetFromCentre(centre, attackX * 12, signedHash(`foul-${lastFx.tick}`, 8));
      case 'HALF_END':
      case 'MATCH_END':
      case 'MATCH_START':
        return centre;
      case 'SUBSTITUTION':
        return offsetFromCentre(centre, attackX * 6, side === 'home' ? W * 0.15 : -W * 0.15);
      default:
        break;
    }
  }

  // Possession / attack pressure — move ball into attacking third
  if (lastPoss) {
    const depth = lastPoss.type === 'ATTACK' ? 0.72 : 0.58;
    const x = side === 'home' ? L * depth : L * (1 - depth);
    const y = W / 2 + signedHash(`poss-${lastPoss.tick}`, 10);
    return { x: clamp(x, 4, L - 4), y: clamp(y, 4, W - 4) };
  }

  // Fallback: MatchState.ball.position (metres / PitchPoint)
  const bp = matchState.ball.position;
  if (bp && Number.isFinite(bp.x) && Number.isFinite(bp.y)) {
    return { x: clamp(bp.x, 0, L), y: clamp(bp.y, 0, W) };
  }

  return { x: spatial.ball.position.x, y: spatial.ball.position.y };
}

function deriveFx(events: readonly EngineEvent[], tick: number): VisualFx | null {
  const recent = [...events].reverse().find((e) => {
    if (!FX_KINDS.has(String(e.type))) return false;
    return tick - e.tick <= 40;
  });
  if (!recent) return null;
  return {
    kind: recent.type as VisualFxKind,
    side: eventSide(recent),
    tick: recent.tick,
  };
}

function eventSide(e: EngineEvent | undefined): string | undefined {
  if (!e?.payload || typeof e.payload !== 'object') return undefined;
  if ('side' in e.payload) return String((e.payload as { side: string }).side);
  if ('against' in e.payload) {
    const against = String((e.payload as { against: string }).against);
    return against === 'home' ? 'away' : 'home';
  }
  return undefined;
}

function pullToward(from: VisualPoint, to: VisualPoint, amount: number): VisualPoint {
  return {
    x: from.x + (to.x - from.x) * amount,
    y: from.y + (to.y - from.y) * amount,
  };
}

function idleWobble(playerId: string, tick: number, amp: number): VisualPoint {
  const h = hashString(playerId);
  const a = tick * 0.17 + h;
  return {
    x: Math.sin(a) * amp,
    y: Math.cos(a * 0.91 + h) * amp * 0.85,
  };
}

function offsetFromCentre(centre: VisualPoint, dx: number, dy: number): VisualPoint {
  return { x: centre.x + dx, y: centre.y + dy };
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function signedHash(s: string, amp: number): number {
  return (hashString(s) * 2 - 1) * amp;
}

function hashBit(s: string): boolean {
  return hashString(s) > 0.5;
}
