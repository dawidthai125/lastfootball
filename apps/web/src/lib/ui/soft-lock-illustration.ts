/** Soft-lock art by FLAT_NAV module id (presentation only). */

export type SoftLockIllustration = {
  waId: string;
  illustrationSrc: string;
};

const ILL_002: SoftLockIllustration = {
  waId: 'ILL-002',
  illustrationSrc: '/assets/world-art/ill-002-softlock-training.png',
};

const ILL_003: SoftLockIllustration = {
  waId: 'ILL-003',
  illustrationSrc: '/assets/world-art/ill-003-window-closed.png',
};

/** ILL-009 ships in public/assets/world-art (ill-009-youth-prospect.png). */
const ILL_009: SoftLockIllustration = {
  waId: 'ILL-009',
  illustrationSrc: '/assets/world-art/ill-009-youth-prospect.png',
};

export function resolveSoftLockIllustration(moduleId: string): SoftLockIllustration {
  if (moduleId === 'transfers') return ILL_003;
  if (moduleId === 'academy') return ILL_009;
  if (moduleId === 'training') return ILL_002;
  return ILL_002;
}
