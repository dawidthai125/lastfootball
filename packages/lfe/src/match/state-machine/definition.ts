import type { MatchLifecycleEventType } from './events';
import type { LifecycleContext } from './context';
import type { MatchLifecycleState } from './states';

export interface StateEntryExit {
  readonly description: string;
  /** Soft conditions — documented; enforced by transition guards where applicable. */
  readonly conditions: readonly string[];
}

export interface LifecycleTransitionRule {
  readonly from: MatchLifecycleState;
  readonly to: MatchLifecycleState;
  readonly event: MatchLifecycleEventType;
  readonly description: string;
  readonly guard?: (ctx: LifecycleContext) => boolean;
  readonly guardDescription?: string;
}

export interface LifecycleStateDefinition {
  readonly state: MatchLifecycleState;
  readonly entry: StateEntryExit;
  readonly exit: StateEntryExit;
  readonly allowedEvents: readonly MatchLifecycleEventType[];
}

/** Allowed events per state (before guard evaluation). */
export const STATE_DEFINITIONS: Record<MatchLifecycleState, LifecycleStateDefinition> = {
  PRE_MATCH: {
    state: 'PRE_MATCH',
    entry: {
      description: 'Match created; waiting to open lineup phase.',
      conditions: ['Match aggregate exists', 'Settings frozen for this match'],
    },
    exit: {
      description: 'Lineup phase opened.',
      conditions: ['PREPARE_LINEUPS accepted'],
    },
    allowedEvents: ['PREPARE_LINEUPS', 'ABANDON_MATCH', 'DECLARE_WALKOVER'],
  },
  LINEUP: {
    state: 'LINEUP',
    entry: {
      description: 'Both sides select / confirm starting XI + benches.',
      conditions: ['Entered from PRE_MATCH'],
    },
    exit: {
      description: 'Lineups locked; ready for kickoff ceremony.',
      conditions: ['Both lineups confirmed'],
    },
    allowedEvents: ['CONFIRM_LINEUPS', 'ABANDON_MATCH', 'DECLARE_WALKOVER'],
  },
  KICKOFF: {
    state: 'KICKOFF',
    entry: {
      description: 'Pre-play kickoff setup (centre spot, sides).',
      conditions: ['Lineups locked'],
    },
    exit: {
      description: 'Ball in play for first half.',
      conditions: ['OPEN_PLAY accepted'],
    },
    allowedEvents: ['START_KICKOFF', 'OPEN_PLAY', 'ABANDON_MATCH'],
  },
  FIRST_HALF: {
    state: 'FIRST_HALF',
    entry: {
      description: 'Regulation first half in progress.',
      conditions: ['Opened from KICKOFF'],
    },
    exit: {
      description: 'First half ended; half-time break.',
      conditions: ['END_FIRST_HALF accepted'],
    },
    allowedEvents: ['END_FIRST_HALF', 'ABANDON_MATCH'],
  },
  HALF_TIME: {
    state: 'HALF_TIME',
    entry: {
      description: 'Interval between halves.',
      conditions: ['Came from FIRST_HALF'],
    },
    exit: {
      description: 'Second half begins.',
      conditions: ['START_SECOND_HALF accepted'],
    },
    allowedEvents: ['START_SECOND_HALF', 'ABANDON_MATCH'],
  },
  SECOND_HALF: {
    state: 'SECOND_HALF',
    entry: {
      description: 'Regulation second half in progress.',
      conditions: ['Came from HALF_TIME'],
    },
    exit: {
      description: 'Regulation complete — branch to ET / pens / full time.',
      conditions: ['END_SECOND_HALF accepted'],
    },
    allowedEvents: ['END_SECOND_HALF', 'ABANDON_MATCH'],
  },
  EXTRA_TIME: {
    state: 'EXTRA_TIME',
    entry: {
      description: 'Extra time period(s) — score still tied, ET enabled.',
      conditions: ['scoreTied', 'enableExtraTime'],
    },
    exit: {
      description: 'ET finished — pens or full time.',
      conditions: ['END_EXTRA_TIME accepted'],
    },
    allowedEvents: ['END_EXTRA_TIME', 'ABANDON_MATCH'],
  },
  PENALTIES: {
    state: 'PENALTIES',
    entry: {
      description: 'Penalty shoot-out.',
      conditions: ['scoreTied', 'enablePenalties'],
    },
    exit: {
      description: 'Shoot-out complete.',
      conditions: ['END_PENALTIES accepted'],
    },
    allowedEvents: ['END_PENALTIES', 'ABANDON_MATCH'],
  },
  FULL_TIME: {
    state: 'FULL_TIME',
    entry: {
      description: 'Competitive play ended; awaiting finalize.',
      conditions: ['Regulation/ET/pens path resolved without abandon'],
    },
    exit: {
      description: 'Match sealed as FINISHED.',
      conditions: ['COMPLETE_MATCH accepted'],
    },
    allowedEvents: ['COMPLETE_MATCH', 'START_EXTRA_TIME', 'START_PENALTIES'],
  },
  FINISHED: {
    state: 'FINISHED',
    entry: {
      description: 'Terminal — no further lifecycle transitions.',
      conditions: ['Completed, abandoned, or walkover'],
    },
    exit: {
      description: 'None — terminal state.',
      conditions: [],
    },
    allowedEvents: [],
  },
};

/**
 * Declarative transition table.
 * Order matters only when multiple rules share from+event (first matching guard wins).
 */
export const TRANSITION_RULES: readonly LifecycleTransitionRule[] = [
  {
    from: 'PRE_MATCH',
    to: 'LINEUP',
    event: 'PREPARE_LINEUPS',
    description: 'Open lineup confirmation.',
  },
  {
    from: 'LINEUP',
    to: 'KICKOFF',
    event: 'CONFIRM_LINEUPS',
    description: 'Lock both lineups and move to kickoff.',
    guard: (ctx) => ctx.homeLineupConfirmed && ctx.awayLineupConfirmed,
    guardDescription: 'homeLineupConfirmed && awayLineupConfirmed',
  },
  {
    from: 'KICKOFF',
    to: 'KICKOFF',
    event: 'START_KICKOFF',
    description: 'Acknowledge kickoff setup (idempotent stay).',
  },
  {
    from: 'KICKOFF',
    to: 'FIRST_HALF',
    event: 'OPEN_PLAY',
    description: 'Kickoff taken — first half starts.',
  },
  {
    from: 'FIRST_HALF',
    to: 'HALF_TIME',
    event: 'END_FIRST_HALF',
    description: 'Whistle for half-time.',
  },
  {
    from: 'HALF_TIME',
    to: 'SECOND_HALF',
    event: 'START_SECOND_HALF',
    description: 'Resume for second half.',
  },
  {
    from: 'SECOND_HALF',
    to: 'EXTRA_TIME',
    event: 'END_SECOND_HALF',
    description: 'Tied knockout — go to extra time.',
    guard: (ctx) => ctx.scoreTied && ctx.enableExtraTime,
    guardDescription: 'scoreTied && enableExtraTime',
  },
  {
    from: 'SECOND_HALF',
    to: 'PENALTIES',
    event: 'END_SECOND_HALF',
    description: 'Tied — skip ET, go straight to penalties.',
    guard: (ctx) => ctx.scoreTied && !ctx.enableExtraTime && ctx.enablePenalties,
    guardDescription: 'scoreTied && !enableExtraTime && enablePenalties',
  },
  {
    from: 'SECOND_HALF',
    to: 'FULL_TIME',
    event: 'END_SECOND_HALF',
    description: 'Regulation ends (decided or no ET/pens).',
    guard: (ctx) => !ctx.scoreTied || (!ctx.enableExtraTime && !ctx.enablePenalties),
    guardDescription: '!scoreTied || (!enableExtraTime && !enablePenalties)',
  },
  {
    from: 'EXTRA_TIME',
    to: 'PENALTIES',
    event: 'END_EXTRA_TIME',
    description: 'Still tied after ET — penalties.',
    guard: (ctx) => ctx.scoreTied && ctx.enablePenalties,
    guardDescription: 'scoreTied && enablePenalties',
  },
  {
    from: 'EXTRA_TIME',
    to: 'FULL_TIME',
    event: 'END_EXTRA_TIME',
    description: 'ET produced a winner, or pens disabled.',
    guard: (ctx) => !ctx.scoreTied || !ctx.enablePenalties,
    guardDescription: '!scoreTied || !enablePenalties',
  },
  {
    from: 'PENALTIES',
    to: 'FULL_TIME',
    event: 'END_PENALTIES',
    description: 'Shoot-out finished.',
  },
  {
    from: 'FULL_TIME',
    to: 'EXTRA_TIME',
    event: 'START_EXTRA_TIME',
    description: 'Optional late decision to play ET from full-time buffer.',
    guard: (ctx) => ctx.scoreTied && ctx.enableExtraTime,
    guardDescription: 'scoreTied && enableExtraTime',
  },
  {
    from: 'FULL_TIME',
    to: 'PENALTIES',
    event: 'START_PENALTIES',
    description: 'Optional late decision to take pens from full-time buffer.',
    guard: (ctx) => ctx.scoreTied && ctx.enablePenalties,
    guardDescription: 'scoreTied && enablePenalties',
  },
  {
    from: 'FULL_TIME',
    to: 'FINISHED',
    event: 'COMPLETE_MATCH',
    description: 'Seal match result.',
  },
  // Abandon / walkover → FINISHED from non-terminal states
  ...(
    [
      'PRE_MATCH',
      'LINEUP',
      'KICKOFF',
      'FIRST_HALF',
      'HALF_TIME',
      'SECOND_HALF',
      'EXTRA_TIME',
      'PENALTIES',
    ] as const
  ).flatMap((from) => [
    {
      from,
      to: 'FINISHED' as const,
      event: 'ABANDON_MATCH' as const,
      description: 'Match abandoned early.',
    },
    {
      from,
      to: 'FINISHED' as const,
      event: 'DECLARE_WALKOVER' as const,
      description: 'Walkover awarded (winner on event.walkoverWinner).',
    },
  ]),
];
