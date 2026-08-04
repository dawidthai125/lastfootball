import type { EngineEvent } from '../../events';
import type { MatchState } from '../domain';

import { position } from './coordinates';
import {
  createMatchSpatialState,
  type MatchSpatialState,
  type SpatialPlayer,
} from './spatial-state';

/**
 * Deterministic movement Thin for the spatial read model.
 *
 * This is deliberately not Physics: it keeps a formation-shaped team block,
 * moves it in response to possession, and eases each player toward a new
 * target. Canvas and Replay only consume the resulting snapshots.
 */
export function advanceMatchSpatialState(input: {
  readonly previous: MatchSpatialState;
  readonly matchState: MatchState;
  readonly tick: number;
  readonly events: readonly EngineEvent[];
}): MatchSpatialState {
  if (!isPlayPhase(input.matchState.phase)) return input.previous;

  const { pitch } = input.previous;
  const baseline = createMatchSpatialState(input.matchState);
  const possession = resolvePossessionSide(input.events, input.tick);
  const ballTarget = resolveBallTarget(pitch.length, pitch.width, possession, input.tick);
  const baselineByPlayer = new Map(baseline.players.map((player) => [player.playerId, player]));

  const players = input.previous.players.map((player) => {
    const anchor = baselineByPlayer.get(player.playerId) ?? player;
    const target = resolvePlayerTarget(
      anchor,
      pitch.length,
      pitch.width,
      ballTarget,
      possession,
      input.tick,
    );
    return Object.freeze({
      ...player,
      position: moveToward(player.position, target, player.role === 'GK' ? 0.18 : 0.52),
    });
  });

  return Object.freeze({
    ...input.previous,
    players: Object.freeze(players),
    ball: Object.freeze({ position: moveToward(input.previous.ball.position, ballTarget, 1.1) }),
  });
}

function isPlayPhase(phase: MatchState['phase']): boolean {
  return phase === 'FIRST_HALF' || phase === 'SECOND_HALF';
}

function resolvePossessionSide(events: readonly EngineEvent[], tick: number): 'home' | 'away' {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const payload = events[index]?.payload;
    if (!payload || typeof payload !== 'object' || !('side' in payload)) continue;
    const side = String((payload as { side: unknown }).side);
    if (side === 'home' || side === 'away') return side;
  }
  return tick % 2 === 0 ? 'home' : 'away';
}

function resolveBallTarget(length: number, width: number, side: 'home' | 'away', tick: number) {
  const progress = 0.48 + Math.sin(tick * 0.11) * 0.2;
  const x = side === 'home' ? length * progress : length * (1 - progress);
  const y = width * (0.5 + Math.sin(tick * 0.17 + (side === 'home' ? 0 : Math.PI)) * 0.22);
  return position(clamp(x, 2, length - 2), clamp(y, 2, width - 2));
}

function resolvePlayerTarget(
  anchor: SpatialPlayer,
  length: number,
  width: number,
  ball: { readonly x: number; readonly y: number },
  possession: 'home' | 'away',
  tick: number,
) {
  const centreX = length / 2;
  const centreY = width / 2;
  const ownsBall = anchor.side === possession;
  const roleWeight = anchor.role === 'GK' ? 0.04 : ownsBall ? 0.3 : 0.14;
  const attackDirection = anchor.side === 'home' ? 1 : -1;
  const forwardRun =
    ownsBall && anchor.role !== 'GK' ? attackDirection * roleForwardBias(anchor.role) : 0;
  const wave = Math.sin(tick * 0.13 + anchor.slotIndex * 1.71 + (anchor.side === 'home' ? 0 : 2.4));
  const lateralWave =
    Math.cos(tick * 0.1 + anchor.slotIndex * 1.17) * (anchor.role === 'GK' ? 0.15 : 0.75);

  return position(
    clamp(
      anchor.position.x + (ball.x - centreX) * roleWeight + forwardRun + wave * 0.55,
      1,
      length - 1,
    ),
    clamp(anchor.position.y + (ball.y - centreY) * roleWeight + lateralWave, 1, width - 1),
  );
}

function roleForwardBias(role: SpatialPlayer['role']): number {
  if (role === 'ST' || role === 'CF' || role === 'RW' || role === 'LW') return 4.2;
  if (role === 'CAM' || role === 'RM' || role === 'LM') return 2.4;
  if (role === 'CM' || role === 'CDM') return 1.2;
  return 0.4;
}

function moveToward(
  from: { readonly x: number; readonly y: number },
  to: { readonly x: number; readonly y: number },
  maxDistance: number,
) {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const distance = Math.hypot(dx, dy);
  if (distance <= maxDistance || distance === 0) return position(to.x, to.y);
  const ratio = maxDistance / distance;
  return position(from.x + dx * ratio, from.y + dy * ratio);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
