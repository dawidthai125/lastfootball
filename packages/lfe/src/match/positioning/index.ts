/**
 * EPIC-7 — Match positioning (spatial model, no physics / movement).
 */

export type { Position, PitchCoordinates } from './coordinates';
export { position, pitchCoordinates } from './coordinates';

export type { PitchSideOrientation } from './sides';
export { HomeSide, AwaySide, sideOrientation, centreSpotPosition } from './sides';

export type { PitchGrid, GridCell } from './grid';
export { createPitchGrid, cellAt, cellCenter, sameCell } from './grid';

export type { PitchZoneId, PitchZone } from './zones';
export { createZones, pointInZone, zonesContaining, longitudinalThird } from './zones';

export type { DistanceCalculator } from './distance';
export { distanceCalculator } from './distance';

export type { FormationLayout, FormationLayoutSlot, OccupiedSlot } from './formation-layout';
export { buildFormationLayout, occupyFormationLayout } from './formation-layout';

export type { SpawnPoint, SpawnPoints } from './spawn';
export { createKickoffSpawnPoints } from './spawn';

export type { SpatialPlayer, SpatialBall, MatchSpatialState } from './spatial-state';
export { createMatchSpatialState, findSpatialPlayer } from './spatial-state';
