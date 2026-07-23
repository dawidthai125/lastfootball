import type { PitchSide, TeamId } from './ids';

export interface TeamColors {
  readonly primary: string;
  readonly secondary: string;
}

export interface Team {
  readonly id: TeamId;
  readonly name: string;
  readonly shortName: string;
  readonly side: PitchSide;
  readonly colors: TeamColors;
}

export function createTeam(input: Omit<Team, 'colors'> & { colors?: TeamColors }): Team {
  return Object.freeze({
    id: input.id,
    name: input.name,
    shortName: input.shortName,
    side: input.side,
    colors: Object.freeze(input.colors ?? { primary: '#ffffff', secondary: '#111111' }),
  });
}
