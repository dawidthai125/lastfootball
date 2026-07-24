import type { FixtureDto } from '@/lib/fixtures/types';
import type { HubCta, HubCtaContext, HubPhase, HubSession } from '@/lib/hub/types';

/**
 * Exactly one Primary CTA for the Hub decision screen (GDD §23.4).
 */
export function resolvePrimaryCta(
  phase: HubPhase,
  session: HubSession,
  ctx: HubCtaContext = { nextFixture: null },
): HubCta {
  if (phase === 'EARLY_CLUB' && session === 'matchday' && ctx.nextFixture) {
    return {
      id: 'play-next-match',
      label: 'Przygotuj mecz',
      href: `/match/${ctx.nextFixture.id}`,
      access: 'open',
    };
  }

  void session;
  return {
    id: 'view-squad',
    label: 'Zobacz skład',
    href: '/squad',
    access: 'open',
  };
}

/** Secondary actions — max 5 including soft-locked teases. */
export function resolveSecondaryCtas(
  phase: HubPhase,
  ctx: Pick<HubCtaContext, 'hasFixtures'> = {},
): HubCta[] {
  if (phase !== 'EARLY_CLUB') return [];
  const fixturesOpen = Boolean(ctx.hasFixtures);
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
      access: fixturesOpen ? 'open' : 'soft_locked',
    },
    {
      id: 'message',
      label: 'Wiadomość zarządu',
      href: '/messages',
      access: 'open',
    },
  ];
}

/** @deprecated use HubCtaContext — kept for call-site clarity */
export type { FixtureDto };
