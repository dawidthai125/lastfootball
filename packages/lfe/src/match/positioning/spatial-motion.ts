import type { EngineEvent } from '../../events';
import type { MatchState, MatchTactics } from '../domain';
import { tacticsOwnedBy } from '../domain';

import { position } from './coordinates';
import {
  createMatchSpatialState,
  type MatchSpatialState,
  type SpatialPlayer,
} from './spatial-state';

/**
 * Put the current lineup on the pitch without a simulation tick.
 * Players who stayed keep their pose. A newcomer takes the pose of the
 * player who left the same slot. The ball stays where it is.
 */
export function reseatSpatialLineup(
  previous: MatchSpatialState,
  matchState: MatchState,
): MatchSpatialState {
  const baseline = createMatchSpatialState(matchState);
  const previousById = new Map(previous.players.map((player) => [player.playerId, player]));
  const previousBySlot = new Map(
    previous.players.map((player) => [`${player.side}:${player.slotIndex}`, player]),
  );
  const players = baseline.players.map((anchor) => {
    const stayed = previousById.get(anchor.playerId);
    const vacated = previousBySlot.get(`${anchor.side}:${anchor.slotIndex}`);
    const pose = stayed ?? vacated ?? anchor;
    return Object.freeze({
      ...anchor,
      position: pose.position,
      facing: pose.facing,
    });
  });

  return Object.freeze({
    ...previous,
    players: Object.freeze(players),
    ball: previous.ball,
  });
}

/**
 * Deterministic movement Thin for the spatial read model.
 *
 * This is deliberately not Physics: it keeps a formation-shaped team block,
 * moves it in response to possession, and eases each player toward a new
 * target. A recent GOAL, CORNER, PENALTY, or FREE_KICK pulls the ball to
 * that restart for a short window. Canvas and Replay only consume the snapshots.
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
  const setPiece = latestSetPiece(input.events, input.tick);
  const possession = setPiece?.side ?? resolvePossessionSide(input.events);
  const ballTarget = resolveBallTarget(pitch.length, pitch.width, possession, input.tick, setPiece);
  const previousByPlayer = new Map(
    input.previous.players.map((player) => [player.playerId, player]),
  );
  const players = baseline.players.map((anchor) => {
    const player = previousByPlayer.get(anchor.playerId) ?? anchor;
    const target = resolvePlayerTarget(
      anchor,
      pitch.length,
      pitch.width,
      ballTarget,
      possession,
      input.tick,
      tacticsOwnedBy(input.matchState, anchor.side),
    );
    return Object.freeze({
      ...anchor,
      position: moveToward(player.position, target, anchor.role === 'GK' ? 0.18 : 0.52),
    });
  });

  return Object.freeze({
    ...input.previous,
    players: Object.freeze(players),
    ball: Object.freeze({
      position: moveToward(input.previous.ball.position, ballTarget, setPiece ? 3.4 : 1.1),
    }),
  });
}

function isPlayPhase(phase: MatchState['phase']): boolean {
  return phase === 'FIRST_HALF' || phase === 'SECOND_HALF';
}

const SET_PIECE_TYPES = new Set(['GOAL', 'CORNER', 'PENALTY', 'FREE_KICK']);
const SET_PIECE_TICKS = 40;

function readSide(payload: unknown): 'home' | 'away' | undefined {
  if (!payload || typeof payload !== 'object' || !('side' in payload)) return undefined;
  const side = String((payload as { side: unknown }).side);
  return side === 'home' || side === 'away' ? side : undefined;
}

function latestSetPiece(
  events: readonly EngineEvent[],
  tick: number,
): { type: string; side: 'home' | 'away' } | undefined {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (!event || !SET_PIECE_TYPES.has(event.type)) continue;
    if (event.tick > tick || tick - event.tick > SET_PIECE_TICKS) continue;
    const side = readSide(event.payload);
    if (side) return { type: event.type, side };
  }
  return undefined;
}

function resolvePossessionSide(events: readonly EngineEvent[]): 'home' | 'away' {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const side = readSide(events[index]?.payload);
    if (side) return side;
  }
  return 'home';
}

function resolveBallTarget(
  length: number,
  width: number,
  side: 'home' | 'away',
  tick: number,
  setPiece: { type: string; side: 'home' | 'away' } | undefined,
) {
  if (setPiece?.type === 'GOAL') return position(length / 2, width / 2);
  if (setPiece?.type === 'CORNER') {
    const x = setPiece.side === 'home' ? length - 1 : 1;
    const y = setPiece.side === 'home' ? 1 : width - 1;
    return position(x, y);
  }
  if (setPiece?.type === 'PENALTY') {
    const x = setPiece.side === 'home' ? length - 11 : 11;
    return position(x, width / 2);
  }
  if (setPiece?.type === 'FREE_KICK') {
    const x = setPiece.side === 'home' ? length - 25 : 25;
    return position(x, width / 2);
  }

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
  tactics: MatchTactics,
) {
  const centreX = length / 2;
  const centreY = width / 2;
  const shaped = shapeAnchor(anchor, length, width, centreY, tactics);
  const ownsBall = anchor.side === possession;
  const roleWeight = anchor.role === 'GK' ? 0.04 : ownsBall ? 0.3 : 0.14;
  const attackDirection = anchor.side === 'home' ? 1 : -1;
  const forwardRun =
    ownsBall && anchor.role !== 'GK' ? attackDirection * roleForwardBias(anchor.role) : 0;
  const wave = Math.sin(tick * 0.13 + anchor.slotIndex * 1.71 + (anchor.side === 'home' ? 0 : 2.4));
  const lateralWave =
    Math.cos(tick * 0.1 + anchor.slotIndex * 1.17) * (anchor.role === 'GK' ? 0.15 : 0.75);
  const press = !ownsBall && anchor.role !== 'GK' ? ((tactics.pressing - 50) / 50) * 3.2 : 0;
  const pressX = ball.x - shaped.x;
  const pressY = ball.y - shaped.y;
  const pressDistance = Math.hypot(pressX, pressY);

  return position(
    clamp(
      shaped.x +
        (ball.x - centreX) * roleWeight +
        forwardRun +
        wave * 0.55 +
        (pressDistance === 0 ? 0 : (pressX / pressDistance) * press),
      1,
      length - 1,
    ),
    clamp(
      shaped.y +
        (ball.y - centreY) * roleWeight +
        lateralWave +
        (pressDistance === 0 ? 0 : (pressY / pressDistance) * press),
      1,
      width - 1,
    ),
  );
}

/** Mentality shifts the block. Width opens it. 50/50 leaves the anchor. */
function shapeAnchor(
  anchor: SpatialPlayer,
  length: number,
  width: number,
  centreY: number,
  tactics: MatchTactics,
) {
  const attackDirection = anchor.side === 'home' ? 1 : -1;
  const depth =
    attackDirection * ((tactics.mentality - 50) / 50) * (anchor.role === 'GK' ? 1.2 : 8);
  const spread = anchor.role === 'GK' ? 1 : 0.72 + (tactics.width / 100) * 0.56;
  return {
    x: clamp(anchor.position.x + depth, 1, length - 1),
    y: clamp(centreY + (anchor.position.y - centreY) * spread, 1, width - 1),
  };
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
