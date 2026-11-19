import { kickoffBlockReason } from '@/lib/fixtures/kickoff-gate';
import type { FixtureDto } from '@/lib/fixtures/types';
import { resolveNavAccess } from '@/lib/hub/unlock';
import type { HubCta, HubCtaContext, HubNavAccess, HubPhase, HubSession } from '@/lib/hub/types';
import { resolveNavLockLabel } from '@/lib/nav-lock-copy';
import { UI_COPY } from '@/lib/ui/copy';

const DECISION_PHASES = new Set<HubPhase>(['EARLY_CLUB', 'SEASON']);

export type SecondaryCtaContext = {
  readonly hasFixtures?: boolean;
  readonly trainingUnlocked?: boolean;
  readonly transferWindowOpen?: boolean;
  /** League fixtures with status played. Same count as the shell layout. */
  readonly playedCount?: number;
};

function trainingSecondaryLabel(access: HubNavAccess, playedCount: number): string {
  if (access === 'open') return 'Trening';
  return resolveNavLockLabel('training', 'Trening', playedCount);
}

function transfersSecondaryLabel(access: HubNavAccess, playedCount: number): string {
  if (access === 'open') return 'Transfery';
  return resolveNavLockLabel('transfers', 'Transfery', playedCount);
}

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
    const sentence = kickoffBlockReason({
      matchesBlocked: ctx.matchesBlocked ?? false,
      competition: ctx.nextFixture.competition,
      lastPlayedAt:
        ctx.lastPlayedAt !== undefined ? ctx.lastPlayedAt : ctx.lastPlayedFixture?.playedAt,
      now: ctx.now ?? new Date(),
    });
    if (sentence) {
      if (ctx.matchesBlocked) {
        return {
          id: 'confirm-email',
          label: 'Potwierdź email',
          href: '/profile',
          access: 'open',
        };
      }
      return {
        id: 'matchday-blocked',
        label: sentence,
        href: '/matches',
        access: 'open',
      };
    }
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
  const playedCount = ctx.playedCount ?? 0;
  const trainingAccess = resolveNavAccess('training', phase, navCtx);
  const transfersAccess = resolveNavAccess('transfers', phase, navCtx);

  return [
    {
      id: 'training',
      label: trainingSecondaryLabel(trainingAccess, playedCount),
      href: '/training',
      access: trainingAccess,
    },
    {
      id: 'squad',
      label: UI_COPY.squadNav,
      href: '/squad',
      access: resolveNavAccess('squad', phase, navCtx),
    },
    {
      id: 'transfers',
      label: transfersSecondaryLabel(transfersAccess, playedCount),
      href: '/transfers',
      access: transfersAccess,
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
