import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveNavAccess } from '@/lib/hub/unlock';
import type { HubCta, HubCtaContext, HubPhase, HubSession } from '@/lib/hub/types';
import { UI_COPY } from '@/lib/ui/copy';

const DECISION_PHASES = new Set<HubPhase>(['EARLY_CLUB', 'SEASON']);

export type SecondaryCtaContext = {
  readonly hasFixtures?: boolean;
  readonly trainingUnlocked?: boolean;
  readonly transferWindowOpen?: boolean;
};

/**
 * Exactly one Primary CTA for the Hub decision screen (GDD §23.4).
 */
export function resolvePrimaryCta(
  phase: HubPhase,
  session: HubSession,
  ctx: HubCtaContext = { nextFixture: null },
): HubCta {
  // Offseason: exactly one Primary CTA — Confirm N+1 is the sole transition (D85).
  if (phase === 'OFFSEASON') {
    return {
      id: 'prepare-next-season',
      label: UI_COPY.prepareNextSeason,
      href: '/hub',
      access: 'open',
    };
  }

  if (DECISION_PHASES.has(phase) && session === 'matchday' && ctx.nextFixture) {
    return {
      id: 'play-next-match',
      label: UI_COPY.goToMatch,
      href: `/match/${ctx.nextFixture.id}/tunnel`,
      access: 'open',
    };
  }

  void session;
  return {
    id: 'view-squad',
    label: UI_COPY.viewSquad,
    href: '/squad',
    access: 'open',
  };
}

/**
 * Secondary daily loop — max 5 (LFE-UI-EVOLUTION-02).
 * Unlock via existing resolveNavAccess (no new rules).
 */
export function resolveSecondaryCtas(phase: HubPhase, ctx: SecondaryCtaContext = {}): HubCta[] {
  if (!DECISION_PHASES.has(phase)) return [];

  const navCtx = {
    trainingUnlocked: ctx.trainingUnlocked,
    transferWindowOpen: ctx.transferWindowOpen,
  };
  const fixturesOpen = Boolean(ctx.hasFixtures);

  return [
    {
      id: 'training',
      label: 'Trening',
      href: '/training',
      access: resolveNavAccess('training', phase, navCtx),
    },
    {
      id: 'squad',
      label: UI_COPY.squadNav,
      href: '/squad',
      access: resolveNavAccess('squad', phase, navCtx),
    },
    {
      id: 'transfers',
      label: 'Transfery',
      href: '/transfers',
      access: resolveNavAccess('transfers', phase, navCtx),
    },
    {
      id: 'finance',
      label: 'Finanse',
      href: '/finance',
      access: resolveNavAccess('finance', phase, navCtx),
    },
    {
      id: 'fixtures',
      label: 'Terminarz',
      href: '/matches',
      access: fixturesOpen ? 'open' : 'soft_locked',
    },
  ];
}

/** @deprecated use HubCtaContext — kept for call-site clarity */
export type { FixtureDto };
