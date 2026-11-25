'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
import { setTransferListing } from '@/lib/transfers/actions';

/** Also outside the transfer window, when the Transfers page is closed. */
export function UnlistPlayer({ playerId }: { playerId: string }) {
  const [state, action, pending] = useActionState(setTransferListing, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="lf-tx-actions">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="intent" value="unlist" />
      <p className="text-[12px] text-[var(--lf-muted)]">Zawodnik jest na liście transferowej.</p>
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={pending}>
        {pending ? '…' : 'Zdejmij z listy'}
      </Button>
    </form>
  );
}
