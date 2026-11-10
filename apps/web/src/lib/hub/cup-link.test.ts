import { describe, expect, it } from 'vitest';

import type { PlayerCupTieDto } from '@/lib/cup/types';
import { resolveHubCupLink } from '@/lib/hub/cup-link';

function tie(patch: Partial<PlayerCupTieDto> = {}): PlayerCupTieDto {
  return {
    round: 1,
    roundLabel: '1/8 finału',
    matchday: 101,
    due: true,
    opponentId: 'cup-iii-1',
    opponentName: 'Gość III',
    opponentShort: 'GIII',
    isHome: true,
    ...patch,
  };
}

describe('resolveHubCupLink', () => {
  it('links a due tie to the league screen and keeps the venue', () => {
    expect(resolveHubCupLink(tie())).toEqual({
      href: '/league',
      label: 'Puchar · 1/8 finału · u siebie · GIII',
    });
    expect(resolveHubCupLink(tie({ isHome: false }))?.label).toContain('wyjazd');
    expect(resolveHubCupLink(tie({ round: 4, roundLabel: 'Finał' }))?.label).toContain('neutralny');
  });

  it('stays quiet before the round is due, or when the path is closed', () => {
    expect(resolveHubCupLink(tie({ due: false }))).toBeNull();
    expect(resolveHubCupLink(null)).toBeNull();
  });
});
