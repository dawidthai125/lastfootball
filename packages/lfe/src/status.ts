export const LFE_VERSION = '0.9.1-match-ai01';

export type EngineStatus = 'foundation' | 'ready' | 'error';

export interface EngineModuleStatus {
  id: string;
  label: string;
  ready: boolean;
  notes: string;
}

export interface EngineStatusReport {
  name: string;
  version: string;
  status: EngineStatus;
  modules: EngineModuleStatus[];
  checkedAt: string;
}

/** EPIC-1 marks core loop modules ready; gameplay modules remain stubs. */
const MODULES: EngineModuleStatus[] = [
  {
    id: 'core',
    label: 'Core (tick, clock, time, logger)',
    ready: true,
    notes: 'EPIC-1 tick engine + game clock + time controller',
  },
  {
    id: 'rng',
    label: 'RNG (seeded Mulberry32)',
    ready: true,
    notes: 'Deterministic PRNG with serializable state',
  },
  {
    id: 'events',
    label: 'Event Bus',
    ready: true,
    notes: 'Queued emit → flush in events phase',
  },
  {
    id: 'scheduler',
    label: 'Scheduler',
    ready: true,
    notes: 'Schedule by tick / seconds / match minutes',
  },
  {
    id: 'world',
    label: 'World State',
    ready: true,
    notes: 'Single world container; entity slots empty until later epics',
  },
  {
    id: 'simulation',
    label: 'Simulation Loop',
    ready: true,
    notes: 'Headless createSimulation + step/run',
  },
  {
    id: 'replay',
    label: 'Replay Snapshot',
    ready: true,
    notes: 'Per-tick snapshot buffer',
  },
  {
    id: 'config',
    label: 'Config',
    ready: true,
    notes: 'Default 20 ticks/sec',
  },
  {
    id: 'physics',
    label: 'Physics (ball, collisions)',
    ready: false,
    notes: 'Scaffold only — out of scope for EPIC-1',
  },
  {
    id: 'ai',
    label: 'AI (roles, tactics)',
    ready: true,
    notes: 'MATCH-AI-01: possession/action decisions — Engine executes via RNG',
  },
  {
    id: 'rules',
    label: 'Rules (fouls, restarts)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'match-domain',
    label: 'Match domain model',
    ready: true,
    notes: 'EPIC-2: Match/MatchState + entities — no simulation logic',
  },
  {
    id: 'match-state-machine',
    label: 'Match state machine',
    ready: true,
    notes: 'EPIC-3: deterministic lifecycle SSOT for MatchState.phase',
  },
  {
    id: 'simulation-systems',
    label: 'Simulation systems pipeline',
    ready: true,
    notes: 'EPIC-4: Clock→Scheduler→Lifecycle→Event→Replay + priorities',
  },
  {
    id: 'commands',
    label: 'Match command system',
    ready: true,
    notes: 'EPIC-5: CommandBus — validate → mutate → events',
  },
  {
    id: 'match',
    label: 'Match session',
    ready: true,
    notes: 'EPIC-6: createMatch → MatchSession (sole public match entry)',
  },
  {
    id: 'positioning',
    label: 'Match positioning',
    ready: true,
    notes: 'EPIC-7: pitch coords, formation layout, zones, distances',
  },
  {
    id: 'gameplay-foundation',
    label: 'Gameplay foundation (MatchState · EventBus · CommandBus)',
    ready: true,
    notes: 'GAMEPLAY-01: event vocabulary + tactical commands',
  },
  {
    id: 'match-engine',
    label: 'Match Engine (tick simulation)',
    ready: true,
    notes: 'MATCH-ENGINE-01: clock, halves, events; decisions from Match AI',
  },
  {
    id: 'match-ai',
    label: 'Match AI (decisions)',
    ready: true,
    notes: 'MATCH-AI-01: tactics/score/phase/strength → probabilities for Engine',
  },
  {
    id: 'input',
    label: 'Match input DTO',
    ready: true,
    notes: 'MatchSessionConfig extends MatchInput',
  },
  {
    id: 'ecs',
    label: 'ECS',
    ready: false,
    notes: 'Reserved — World State is SSOT in EPIC-1',
  },
];

export function getEngineStatus(): EngineStatusReport {
  return {
    name: 'Last Football Engine',
    version: LFE_VERSION,
    status: 'foundation',
    modules: MODULES,
    checkedAt: new Date().toISOString(),
  };
}

export const LFE_STATUS = 'foundation' as const;
