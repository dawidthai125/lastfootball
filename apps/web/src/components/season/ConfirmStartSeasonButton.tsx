'use client';

import { SeasonFarewellHost } from '@/components/season/SeasonFarewellHost';

/**
 * Confirm N+1 — sole mutation into Season N+1 (D85).
 * Presentation: Primary CTA form; not part of read-only report (D86).
 * Farewell lives on SeasonFarewellHost (LFE-RETIREMENT-01).
 */
export function ConfirmStartSeasonButton({ label }: { label: string }) {
  return <SeasonFarewellHost showConfirm confirmLabel={label} />;
}
