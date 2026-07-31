import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as publicApi from './index';
import { LFE_PUBLIC_ALLOWLIST } from './public-allowlist';

const rootDir = dirname(fileURLToPath(import.meta.url));

/** Parse `export { … }` / `export type { … }` names from index.ts (value + type aliases). */
function exportedNamesFromIndexSource(src: string): Set<string> {
  const names = new Set<string>();
  const blockRe = /export\s+(?:type\s+)?\{([^}]+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = blockRe.exec(src))) {
    for (const part of m[1].split(',')) {
      const raw = part.trim();
      if (!raw) continue;
      const name = raw.includes(' as ') ? raw.split(' as ').pop()!.trim() : raw;
      if (name) names.add(name);
    }
  }
  // Named value exports: export { X } from — already covered.
  // export { LFE_PUBLIC_ALLOWLIST } — covered.
  return names;
}

describe('LFE-PUBLIC-API-01 root allowlist gate', () => {
  it('runtime public module keys ⊆ allowlist (plus allowlist itself)', () => {
    const keys = Object.keys(publicApi).filter((k) => k !== 'default');
    for (const key of keys) {
      expect(LFE_PUBLIC_ALLOWLIST).toContain(key);
    }
  });

  it('index.ts export surface matches allowlist (types + values)', () => {
    const src = readFileSync(join(rootDir, 'index.ts'), 'utf8');
    const exported = exportedNamesFromIndexSource(src);
    // Allowlist symbols must all appear as exports (type or value).
    for (const name of LFE_PUBLIC_ALLOWLIST) {
      expect(exported.has(name)).toBe(true);
    }
    // No extra export names beyond allowlist.
    for (const name of exported) {
      expect(LFE_PUBLIC_ALLOWLIST).toContain(name);
    }
  });

  it('forbidden internals are not on public runtime surface', () => {
    const forbidden = [
      'simulateMatchTick',
      'createSimulation',
      'decidePossession',
      'decideAction',
      'createRng',
      'createEventBus',
      'buildMatchFromConfig',
      'SESSION_TRANSITIONS',
      'gameplay',
    ] as const;
    for (const name of forbidden) {
      expect(name in publicApi).toBe(false);
      expect(LFE_PUBLIC_ALLOWLIST).not.toContain(name);
    }
  });
});
