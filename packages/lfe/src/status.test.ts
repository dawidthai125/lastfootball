import { describe, expect, it } from 'vitest';

import { LFE_STATUS, LFE_VERSION, getEngineStatus } from './status';

describe('LFE foundation status', () => {
  it('reports foundation status and version', () => {
    const report = getEngineStatus();
    expect(report.name).toBe('Last Football Engine');
    expect(report.version).toBe(LFE_VERSION);
    expect(report.status).toBe(LFE_STATUS);
    expect(report.modules.length).toBeGreaterThan(0);
    expect(report.modules.every((m) => typeof m.id === 'string')).toBe(true);
  });

  it('marks all modules as stubs until Epic-1', () => {
    const report = getEngineStatus();
    expect(report.modules.every((m) => m.ready === false)).toBe(true);
  });
});
