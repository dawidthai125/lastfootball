import type { HubCta, HubPhase, HubSession } from '@/lib/hub/types';

/**
 * Exactly one Primary CTA for the Hub decision screen (GDD §23.4).
 */
export function resolvePrimaryCta(phase: HubPhase, session: HubSession): HubCta {
  void session;
  if (phase === 'EARLY_CLUB') {
    return {
      id: 'view-squad',
      label: 'Zobacz skład',
      href: '/squad',
      access: 'open',
    };
  }
  // Future phases — safe fallback until SEASON SSOT exists
  return {
    id: 'view-squad',
    label: 'Zobacz skład',
    href: '/squad',
    access: 'open',
  };
}

/** Secondary actions — max 5 including soft-locked teases. */
export function resolveSecondaryCtas(phase: HubPhase): HubCta[] {
  if (phase !== 'EARLY_CLUB') return [];
  return [
    {
      id: 'club',
      label: 'Zobacz klub',
      href: '/club',
      access: 'open',
    },
    {
      id: 'fixtures',
      label: 'Terminarz',
      href: '/matches',
      access: 'soft_locked',
    },
    {
      id: 'message',
      label: 'Wiadomość zarządu',
      href: '/messages',
      access: 'open',
    },
  ];
}
