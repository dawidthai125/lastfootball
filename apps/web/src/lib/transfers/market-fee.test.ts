import { describe, expect, it } from 'vitest';

import { deriveTransferFee } from './derive-fee';
import { marketFee } from './market-fee';

describe('marketFee', () => {
  it('is zero only for the exact free-agent label', () => {
    expect(marketFee(60, 24, 'Wolny agent')).toBe(0);
    expect(marketFee(60, 24, 'Orzeł Grodzisk')).toBe(deriveTransferFee(60, 24));
    expect(marketFee(60, 24, 'wolny agent')).not.toBe(0);
  });
});
