export const LFE_VERSION = '0.0.1-foundation';

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

/** Modules exist as stubs; simulation logic is intentionally not implemented yet. */
const MODULES: EngineModuleStatus[] = [
  {
    id: 'core',
    label: 'Core (clock, rng, seed)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'world',
    label: 'World (pitch, entities)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'physics',
    label: 'Physics (ball, collisions)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'ai',
    label: 'AI (roles, tactics)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'rules',
    label: 'Rules (fouls, restarts)',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'match',
    label: 'Match session',
    ready: false,
    notes: 'Placeholder API — no simulation',
  },
  {
    id: 'events',
    label: 'Event stream',
    ready: false,
    notes: 'Scaffold only',
  },
  {
    id: 'input',
    label: 'Match input DTO',
    ready: false,
    notes: 'Scaffold only',
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
