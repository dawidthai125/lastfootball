import type { MatchState } from '../domain/match-state';
import type { Pitch } from '../domain/pitch';
import type { PlayerId, PitchRole, PitchSide } from '../domain/ids';

import { position, type Position } from './coordinates';
import { createPitchGrid, type PitchGrid } from './grid';
import { createKickoffSpawnPoints } from './spawn';
import { createZones, type PitchZone } from './zones';

/** Replay-friendly player pose (no velocity). */
export interface SpatialPlayer {
  readonly playerId: PlayerId;
  readonly side: PitchSide;
  readonly slotIndex: number;
  readonly role: PitchRole;
  readonly position: Position;
  readonly facing: number;
}

export interface SpatialBall {
  readonly position: Position;
  /** Player the ball is travelling to, or at whose feet it already sits. */
  readonly targetPlayerId: string | null;
  /** Tick of the pass that locked this target. -1 before the first aim. */
  readonly aimedTick: number;
}

export interface SpatialOfficial {
  readonly position: Position;
}

/**
 * Full spatial snapshot for a match moment — serializable for Replay.
 */
export interface MatchSpatialState {
  readonly pitch: Pitch;
  readonly grid: PitchGrid;
  readonly zonesHome: readonly PitchZone[];
  readonly zonesAway: readonly PitchZone[];
  readonly players: readonly SpatialPlayer[];
  readonly ball: SpatialBall;
  readonly referee: SpatialOfficial;
}

/**
 * Build initial spatial state from MatchState lineups (kickoff poses).
 */
export function createMatchSpatialState(matchState: MatchState): MatchSpatialState {
  const pitch = matchState.pitch;
  const spawns = createKickoffSpawnPoints(matchState.homeLineup, matchState.awayLineup, pitch);

  const players: SpatialPlayer[] = spawns.all.map((s) =>
    Object.freeze({
      playerId: s.playerId!,
      side: s.side as PitchSide,
      slotIndex: s.slotIndex!,
      role: s.role!,
      position: s.position,
      facing: s.side === 'home' ? 0 : Math.PI,
    }),
  );

  return Object.freeze({
    pitch,
    grid: createPitchGrid(pitch),
    zonesHome: createZones(pitch, 'home'),
    zonesAway: createZones(pitch, 'away'),
    players: Object.freeze(players),
    ball: Object.freeze({
      position: spawns.ball,
      targetPlayerId: null,
      aimedTick: -1,
    }),
    referee: Object.freeze({
      position: position(pitch.length / 2, Math.min(pitch.width - 2, pitch.width / 2 + 8)),
    }),
  });
}

export function findSpatialPlayer(
  state: MatchSpatialState,
  playerId: PlayerId,
): SpatialPlayer | undefined {
  return state.players.find((p) => p.playerId === playerId);
}
