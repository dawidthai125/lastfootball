import { describe, expect, it } from 'vitest';

import { resolveSoftLockIllustration } from '@/lib/ui/soft-lock-illustration';

describe('resolveSoftLockIllustration', () => {
  it('maps training / transfers / academy; defaults to ILL-002', () => {
    expect(resolveSoftLockIllustration('training')).toEqual({
      waId: 'ILL-002',
      illustrationSrc: '/assets/world-art/ill-002-softlock-training.png',
    });
    expect(resolveSoftLockIllustration('transfers')).toEqual({
      waId: 'ILL-002',
      illustrationSrc: '/assets/world-art/ill-002-softlock-training.png',
    });
    expect(resolveSoftLockIllustration('academy')).toEqual({
      waId: 'ILL-009',
      illustrationSrc: '/assets/world-art/ill-009-youth-prospect.png',
    });
    expect(resolveSoftLockIllustration('scouting').waId).toBe('ILL-002');
    expect(resolveSoftLockIllustration('finance').waId).toBe('ILL-002');
  });
});
