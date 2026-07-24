import type { FixtureDto } from '@/lib/fixtures/types';
import type { HubCta, HubCtaContext, HubPhase, HubSession } from '@/lib/hub/types';

const DECISION_PHASES = new Set<HubPhase>(['EARLY_CLUB', 'SEASON']);

/**
 * Exactly one Primary CTA for the Hub decision screen (GDD §23.4).
 */
export function resolvePrimaryCta(
  phase: HubPhase,
  session: HubSession,
  ctx: HubCtaContext = { nextFixture: null },
): HubCta {
  if (DECISION_PHASES.has(phase) && session === 'matchday' && ctx.nextFixture) {
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
  if (!DECISION_PHASES.has(phase)) return [];
  const fixturesOpen = Boolean(ctx.hasFixtures);
  const seasonOpen = phase === 'SEASON';
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
      id: 'league',
      label: 'Tabela',
      href: '/league',
      access: seasonOpen ? 'open' : 'soft_locked',
    },
    {
      id: 'finance',
      label: 'Finanse',
      href: '/finance',
      access: seasonOpen ? 'open' : 'soft_locked',
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
