import type { PlayerCupTieDto } from '@/lib/cup/types';

/** Secondary hub link. League stays the primary action (GDD §11.2, §11 priority). */
export type HubCupLink = {
  readonly href: '/league';
  readonly label: string;
};

export function resolveHubCupLink(tie: PlayerCupTieDto | null | undefined): HubCupLink | null {
  if (!tie?.due) return null;
  const venue = tie.round === 4 ? 'neutralny' : tie.isHome ? 'u siebie' : 'wyjazd';
  return {
    href: '/league',
    label: `Puchar · ${tie.roundLabel} · ${venue} · ${tie.opponentShort}`,
  };
}
