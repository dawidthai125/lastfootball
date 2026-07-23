import type { Lineup } from '../domain/lineup';
import type { Pitch } from '../domain/pitch';
import type { PlayerId, PitchRole, PitchSide } from '../domain/ids';

import type { Position } from './coordinates';
import { centreSpotPosition } from './sides';
import { buildFormationLayout, occupyFormationLayout } from './formation-layout';

/** Named spawn catalog for set pieces / kickoff (static poses only). */
export interface SpawnPoint {
  readonly id: string;
  readonly side: PitchSide | 'neutral';
  readonly position: Position;
  readonly role?: PitchRole;
  readonly playerId?: PlayerId;
  readonly slotIndex?: number;
}

export interface SpawnPoints {
  readonly ball: Position;
  readonly home: readonly SpawnPoint[];
  readonly away: readonly SpawnPoint[];
  readonly all: readonly SpawnPoint[];
}

/**
 * Kickoff / default spawn: formation layout for both sides + ball at centre.
 * No movement — poses only.
 */
export function createKickoffSpawnPoints(
  homeLineup: Lineup,
  awayLineup: Lineup,
  pitch: Pitch,
): SpawnPoints {
  const homeLayout = buildFormationLayout(homeLineup.formation, 'home', pitch);
  const awayLayout = buildFormationLayout(awayLineup.formation, 'away', pitch);
  const homeOcc = occupyFormationLayout(homeLayout, homeLineup);
  const awayOcc = occupyFormationLayout(awayLayout, awayLineup);

  const home = Object.freeze(
    homeOcc.map((s) =>
      Object.freeze({
        id: `spawn-home-${s.slotIndex}`,
        side: 'home' as const,
        position: s.position,
        role: s.role,
        playerId: s.playerId,
        slotIndex: s.slotIndex,
      }),
    ),
  );
  const away = Object.freeze(
    awayOcc.map((s) =>
      Object.freeze({
        id: `spawn-away-${s.slotIndex}`,
        side: 'away' as const,
        position: s.position,
        role: s.role,
        playerId: s.playerId,
        slotIndex: s.slotIndex,
      }),
    ),
  );

  const ball = centreSpotPosition(pitch);
  return Object.freeze({
    ball,
    home,
    away,
    all: Object.freeze([...home, ...away]),
  });
}
