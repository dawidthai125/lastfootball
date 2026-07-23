import type { PlayerId, PitchRole, PitchSide, TeamId } from './ids';
import type { PlayerAttributes } from './player-attributes';
import { DEFAULT_PLAYER_ATTRIBUTES } from './player-attributes';
import type { PlayerCondition } from './player-condition';
import { DEFAULT_PLAYER_CONDITION } from './player-condition';
import type { PlayerSkills } from './player-skills';
import { DEFAULT_PLAYER_SKILLS } from './player-skills';

/** Preferred / listed role — not live pitch slot (see LineupSlot). */
export interface Player {
  readonly id: PlayerId;
  readonly teamId: TeamId;
  readonly side: PitchSide;
  readonly name: string;
  readonly shirtNumber: number;
  readonly preferredRole: PitchRole;
  readonly attributes: PlayerAttributes;
  readonly skills: PlayerSkills;
  readonly condition: PlayerCondition;
}

export interface CreatePlayerInput {
  id: PlayerId;
  teamId: TeamId;
  side: PitchSide;
  name: string;
  shirtNumber: number;
  preferredRole: PitchRole;
  attributes?: PlayerAttributes;
  skills?: PlayerSkills;
  condition?: PlayerCondition;
}

export function createPlayer(input: CreatePlayerInput): Player {
  return Object.freeze({
    id: input.id,
    teamId: input.teamId,
    side: input.side,
    name: input.name,
    shirtNumber: input.shirtNumber,
    preferredRole: input.preferredRole,
    attributes: Object.freeze({ ...(input.attributes ?? DEFAULT_PLAYER_ATTRIBUTES) }),
    skills: Object.freeze({ ...(input.skills ?? DEFAULT_PLAYER_SKILLS) }),
    condition: Object.freeze({ ...(input.condition ?? DEFAULT_PLAYER_CONDITION) }),
  });
}
