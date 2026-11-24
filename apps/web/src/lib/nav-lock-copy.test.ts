import { describe, expect, it } from 'vitest';

import { resolveSecondaryCtas } from '@/lib/hub/resolve-primary-cta';
import { TRAINING_THIN } from '@/lib/training/types';
import { closedWindowSentence } from '@/lib/transfers/window';
import { TRANSFERS_THIN } from '@/lib/transfers/types';
import { UI_COPY } from '@/lib/ui/copy';

import { resolveNavLockLabel, resolveNavLockReason } from '@/lib/nav-lock-copy';

function secondaryLabel(
  id: 'training' | 'transfers',
  ctx: Parameters<typeof resolveSecondaryCtas>[1],
): string | undefined {
  return resolveSecondaryCtas('SEASON', ctx).find((cta) => cta.id === id)?.label;
}

describe('resolveNavLockLabel', () => {
  it('uses progress labels and does not drift from hub secondary', () => {
    const trainingAt0 = `Trening · 0/${TRAINING_THIN.UNLOCK_AFTER_PLAYED}`;
    const trainingAt1 = `Trening · 1/${TRAINING_THIN.UNLOCK_AFTER_PLAYED}`;
    const transfersBefore = `Transfery · ${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED - 1}/${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED}`;
    const windowClosed = 'Transfery · okno zamknięte';

    expect(resolveNavLockLabel('training', 'Trening', 0)).toBe(trainingAt0);
    expect(resolveNavLockLabel('training', 'Trening', 0)).toBe(
      secondaryLabel('training', {
        playedCount: 0,
        trainingUnlocked: false,
        transferWindowOpen: false,
      }),
    );
    expect(resolveNavLockLabel('training', 'Trening', 1)).toBe(trainingAt1);
    expect(resolveNavLockLabel('training', 'Trening', TRAINING_THIN.UNLOCK_AFTER_PLAYED)).toBe(
      `Trening · ${TRAINING_THIN.UNLOCK_AFTER_PLAYED}/${TRAINING_THIN.UNLOCK_AFTER_PLAYED}`,
    );

    const before = TRANSFERS_THIN.UNLOCK_AFTER_PLAYED - 1;
    expect(resolveNavLockLabel('transfers', 'Transfery', before)).toBe(transfersBefore);
    expect(resolveNavLockLabel('transfers', 'Transfery', before)).toBe(
      secondaryLabel('transfers', {
        playedCount: before,
        trainingUnlocked: false,
        transferWindowOpen: false,
      }),
    );

    expect(resolveNavLockLabel('transfers', 'Transfery', TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)).toBe(
      windowClosed,
    );
    expect(resolveNavLockLabel('transfers', 'Transfery', TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)).toBe(
      secondaryLabel('transfers', {
        playedCount: TRANSFERS_THIN.UNLOCK_AFTER_PLAYED,
        trainingUnlocked: true,
        transferWindowOpen: false,
      }),
    );

    const open = resolveSecondaryCtas('SEASON', {
      hasFixtures: true,
      playedCount: 3,
      trainingUnlocked: true,
      transferWindowOpen: true,
    });
    expect(open.find((cta) => cta.id === 'training')?.label).toBe('Trening');
    expect(open.find((cta) => cta.id === 'transfers')?.label).toBe('Transfery');
  });

  it('leaves other locked items as niedostępne', () => {
    expect(resolveNavLockLabel('finance', 'Finanse', 4)).toBe(
      `Finanse — ${UI_COPY.softLockUnavailable}`,
    );
    expect(resolveNavLockLabel('league', 'Liga', 0)).toBe(`Liga — ${UI_COPY.softLockUnavailable}`);
    expect(UI_COPY.softLockUnavailable).toBe('niedostępne');
  });
});

describe('resolveNavLockReason', () => {
  it('pairs progress title with masz-N reason for soft-lock surfaces', () => {
    expect(resolveNavLockLabel('training', 'Trening', 1)).toBe(
      `Trening · 1/${TRAINING_THIN.UNLOCK_AFTER_PLAYED}`,
    );
    expect(resolveNavLockReason('training', 1)).toContain('(masz 1)');
    expect(resolveNavLockLabel('transfers', 'Transfery', 1)).toBe(
      `Transfery · 1/${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED}`,
    );
    expect(resolveNavLockReason('transfers', 1)).toContain('(masz 1)');
  });

  it('states the match threshold for trening and transfery', () => {
    expect(resolveNavLockReason('training', 1)).toBe(
      `Trening odblokuje się po ${TRAINING_THIN.UNLOCK_AFTER_PLAYED} rozegranych meczach ligowych (masz 1).`,
    );
    expect(resolveNavLockReason('transfers', 1)).toBe(
      `Transfery odblokują się po ${TRANSFERS_THIN.UNLOCK_AFTER_PLAYED} rozegranych meczach ligowych (masz 1).`,
    );
  });

  it('uses okno zamknięte after transfer unlock matches', () => {
    expect(resolveNavLockReason('transfers', TRANSFERS_THIN.UNLOCK_AFTER_PLAYED)).toBe(
      closedWindowSentence(TRANSFERS_THIN.UNLOCK_AFTER_PLAYED),
    );
  });

  it('falls back to generic soft-lock reason for other modules', () => {
    expect(resolveNavLockReason('finance', 4)).toBe(UI_COPY.softLockReason);
  });
});
