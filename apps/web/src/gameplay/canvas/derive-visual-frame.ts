/**
 * Presentation frame from the session spatial snapshot.
 * Positions come only from `getSpatialState()`. Events drive FX, not a second pitch.
 * Pure. Never mutates MatchState. No Engine or AI imports.
 */

import type { EngineEvent } from '@lastfootball/lfe';

import type { MatchCanvasReadModel } from '@/gameplay/canvas-host';
import type { VisualFrame, VisualFx, VisualFxKind, VisualPlayer } from './types';

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
  const players = spatial.players.map((sp) => {
    const meta = matchState.players.find((p) => p.id === sp.playerId);
    return {
      playerId: String(sp.playerId),
      side: sp.side,
      role: sp.role,
      shirtNumber: meta?.shirtNumber ?? sp.slotIndex + 1,
      facing: typeof sp.facing === 'number' ? sp.facing : sp.side === 'home' ? 0 : Math.PI,
      x: clamp(sp.position.x, 0, pitch.length),
      y: clamp(sp.position.y, 0, pitch.width),
    } satisfies VisualPlayer;
  });
  const referee = spatial.referee?.position;

  return {
    tick,
    phase: matchState.phase,
    pitchLength: pitch.length,
    pitchWidth: pitch.width,
    players,
    ball: {
      x: clamp(spatial.ball.position.x, 0, pitch.length),
      y: clamp(spatial.ball.position.y, 0, pitch.width),
    },
    ballOwnerId: spatial.ball.targetPlayerId ?? null,
    referee: referee
      ? {
          x: clamp(referee.x, 0, pitch.length),
          y: clamp(referee.y, 0, pitch.width),
        }
      : null,
    fx: deriveFx(events, tick),
  };
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

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
