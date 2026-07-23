import type { Rating } from './ids';

/** Technical football skills (0–100). No action resolution here. */
export interface PlayerSkills {
  readonly finishing: Rating;
  readonly longShots: Rating;
  readonly volleys: Rating;
  readonly heading: Rating;
  readonly shortPassing: Rating;
  readonly longPassing: Rating;
  readonly crossing: Rating;
  readonly ballControl: Rating;
  readonly dribbling: Rating;
  readonly tackling: Rating;
  readonly marking: Rating;
  readonly positioning: Rating;
  readonly vision: Rating;
  readonly composure: Rating;
  readonly reactions: Rating;
  readonly gkDiving: Rating;
  readonly gkHandling: Rating;
  readonly gkReflexes: Rating;
  readonly gkPositioning: Rating;
}

export const DEFAULT_PLAYER_SKILLS: PlayerSkills = Object.freeze({
  finishing: 50,
  longShots: 50,
  volleys: 50,
  heading: 50,
  shortPassing: 50,
  longPassing: 50,
  crossing: 50,
  ballControl: 50,
  dribbling: 50,
  tackling: 50,
  marking: 50,
  positioning: 50,
  vision: 50,
  composure: 50,
  reactions: 50,
  gkDiving: 50,
  gkHandling: 50,
  gkReflexes: 50,
  gkPositioning: 50,
});
