import { existsSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const WA = path.resolve(__dirname, '../../public/assets/world-art');

const REQUIRED = [
  'hero-004-locker-night.png',
  'hero-005-transfer-night.png',
  'hero-006-training.png',
  'hero-007-finance-ledger.png',
  'emp-002-empty-locker.png',
  'emp-003-blank-ledger.png',
  'ill-002-softlock-training.png',
  'ill-003-window-closed.png',
  'lod-007-ledger-close.png',
  'ico-020-lock.png',
] as const;

describe('LFE-UI-IMPL-03 World Art P0', () => {
  it('exposes required domain assets in public/world-art', () => {
    for (const file of REQUIRED) {
      expect(existsSync(path.join(WA, file)), file).toBe(true);
    }
  });
});
