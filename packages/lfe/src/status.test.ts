import { describe, expect, it } from 'vitest';

import { LFE_STATUS, LFE_VERSION, getEngineStatus } from './status';

describe('LFE foundation status', () => {
  it('reports foundation status and EPIC-1 version', () => {
    const report = getEngineStatus();
    expect(report.name).toBe('Last Football Engine');
    expect(report.version).toBe(LFE_VERSION);
    expect(report.status).toBe(LFE_STATUS);
    expect(report.modules.length).toBeGreaterThan(0);
    expect(report.modules.every((m) => typeof m.id === 'string')).toBe(true);
  });

  it('marks EPIC-1 core modules ready and gameplay stubs not ready', () => {
    const report = getEngineStatus();
    const byId = Object.fromEntries(report.modules.map((m) => [m.id, m]));
    expect(byId.core?.ready).toBe(true);
    expect(byId.rng?.ready).toBe(true);
    expect(byId.events?.ready).toBe(true);
    expect(byId.scheduler?.ready).toBe(true);
    expect(byId.world?.ready).toBe(true);
    expect(byId.simulation?.ready).toBe(true);
    expect(byId.replay?.ready).toBe(true);
    expect(byId.config?.ready).toBe(true);
    expect(byId['match-domain']?.ready).toBe(true);
    expect(byId['match-state-machine']?.ready).toBe(true);
    expect(byId['simulation-systems']?.ready).toBe(true);
    expect(byId.commands?.ready).toBe(true);
    expect(byId.match?.ready).toBe(true);
    expect(byId.positioning?.ready).toBe(true);
    expect(byId.input?.ready).toBe(true);
    expect(byId.physics?.ready).toBe(false);
    expect(byId.ai?.ready).toBe(true);
    expect(byId['match-ai']?.ready).toBe(true);
    expect(byId['match-engine']?.ready).toBe(true);
  });
});
