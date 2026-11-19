/** Soft-lock art by FLAT_NAV module id (presentation only). */

export type SoftLockIllustration = {
  waId: string;
  illustrationSrc: string;
};

const ILL_002: SoftLockIllustration = {
  waId: 'ILL-002',
  illustrationSrc: '/assets/world-art/ill-002-softlock-training.png',
};

/** ILL-009 ships in public/assets/world-art (ill-009-youth-prospect.png). */
const ILL_009: SoftLockIllustration = {
  waId: 'ILL-009',
  illustrationSrc: '/assets/world-art/ill-009-youth-prospect.png',
};

/**
 * Soft-lock (match-count / phase) art — not transfer-window-closed.
 * ILL-003 stays hardcoded where the window is actually closed (TransfersView).
 */
export function resolveSoftLockIllustration(moduleId: string): SoftLockIllustration {
  if (moduleId === 'academy') return ILL_009;
  return ILL_002;
}
