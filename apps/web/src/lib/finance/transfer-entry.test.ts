import { describe, expect, it } from 'vitest';

import { resolveNavLockLabel } from '@/lib/nav-lock-copy';
import { TRANSFERS_THIN } from '@/lib/transfers/types';
import { UI_COPY } from '@/lib/ui/copy';

import {
  resolveFinanceTransferEntry,
  resolveTransfersClosedSoftLock,
} from '@/lib/finance/transfer-entry';

const before = TRANSFERS_THIN.UNLOCK_AFTER_PLAYED - 1;
const unlock = TRANSFERS_THIN.UNLOCK_AFTER_PLAYED;
const lockedLabel = resolveNavLockLabel('transfers', 'Transfery', before);

describe('resolveFinanceTransferEntry', () => {
  it('does not send a locked club into the market', () => {
    for (const needsReaction of [false, true]) {
      for (const variant of ['primary', 'empty'] as const) {
        const entry = resolveFinanceTransferEntry({
          transferWindowOpen: false,
          playedCount: before,
          needsReaction,
          variant,
        });
        expect(entry).toEqual({ href: '/hub', label: lockedLabel });
        expect(entry.label).toContain('po 2 meczach ligowych');
        expect(entry.label).not.toBe('Zobacz rynek transferowy');
        expect(entry.label).not.toBe('Przejdź do transferów');
      }
    }
  });

  it('keeps the open-window finance labels on /transfers', () => {
    expect(
      resolveFinanceTransferEntry({
        transferWindowOpen: true,
        playedCount: before,
        needsReaction: false,
        variant: 'primary',
      }),
    ).toEqual({ href: '/transfers', label: 'Zobacz rynek transferowy' });
    expect(
      resolveFinanceTransferEntry({
        transferWindowOpen: true,
        playedCount: unlock,
        needsReaction: true,
        variant: 'primary',
      }),
    ).toEqual({ href: '/transfers', label: 'Przejdź do transferów' });
    expect(
      resolveFinanceTransferEntry({
        transferWindowOpen: true,
        playedCount: unlock,
        needsReaction: true,
        variant: 'empty',
      }),
    ).toEqual({ href: '/transfers', label: 'Transfery' });
  });

  it('uses the closed-window nav label once the league unlock is met', () => {
    const entry = resolveFinanceTransferEntry({
      transferWindowOpen: false,
      playedCount: unlock,
      needsReaction: true,
      variant: 'primary',
    });
    expect(entry.href).toBe('/hub');
    expect(entry.label).toBe(resolveNavLockLabel('transfers', 'Transfery', unlock));
    expect(entry.label).toBe('Transfery · okno zamknięte');
  });
});

describe('resolveTransfersClosedSoftLock', () => {
  it('says the league-match lock before the window has opened', () => {
    const copy = resolveTransfersClosedSoftLock(before);
    expect(copy.title).toBe(lockedLabel);
    expect(copy.reason).toBe(lockedLabel);
    expect(copy.title).toContain('po 2 meczach ligowych');
    expect(copy.reason).toContain('po 2 meczach ligowych');
    expect(copy.title).not.toBe('Okno transferowe zamknięte');
    expect(copy.reason).not.toBe(UI_COPY.transferWindowClosed);
    expect(TRANSFERS_THIN.UNLOCK_AFTER_PLAYED).toBe(2);
  });

  it('keeps the closed-window copy after the unlock', () => {
    expect(resolveTransfersClosedSoftLock(unlock)).toEqual({
      title: 'Okno transferowe zamknięte',
      reason: UI_COPY.transferWindowClosed,
    });
    expect(resolveTransfersClosedSoftLock(unlock + 3)).toEqual({
      title: 'Okno transferowe zamknięte',
      reason: UI_COPY.transferWindowClosed,
    });
  });
});
