/**
 * ECS scaffold — entity component storage arrives in a later epic.
 * EPIC-1 owns World State as the single source of truth instead.
 */

export interface EntityId {
  readonly value: number;
}

export type ComponentTypeId = string;
