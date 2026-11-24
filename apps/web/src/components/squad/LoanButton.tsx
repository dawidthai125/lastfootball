'use client';

import { useActionState } from 'react';

import { savePlayerLoan, type LoanState } from '@/lib/squad/actions-loan';
import { returnIncomingLoan, type IncomingLoanState } from '@/lib/squad/actions-loan-incoming';

const INITIAL: LoanState = {};
const IN_INITIAL: IncomingLoanState = {};

export function LoanButton({
  playerId,
  position,
  starter,
  onLoan,
  loanedIn = false,
}: {
  readonly playerId: string;
  readonly position: string;
  readonly starter: boolean;
  readonly onLoan: boolean;
  readonly loanedIn?: boolean;
}) {
  const [state, action, pending] = useActionState(savePlayerLoan, INITIAL);
  const [inState, inAction, inPending] = useActionState(returnIncomingLoan, IN_INITIAL);

  if (loanedIn) {
    return (
      <form action={inAction} style={{ marginTop: '0.5rem' }}>
        <input type="hidden" name="playerId" value={playerId} />
        <button type="submit" disabled={inPending}>
          {inPending ? 'Zapisuję…' : 'Odeślij wypożyczenie'}
        </button>
        {inState.error ? (
          <p role="alert" style={{ margin: '0.25rem 0 0' }}>
            {inState.error}
          </p>
        ) : null}
      </form>
    );
  }

  if (!onLoan && position === 'BR') {
    return <p style={{ margin: '0.5rem 0 0' }}>Bramkarza nie wypożyczysz.</p>;
  }
  if (!onLoan && starter) {
    return <p style={{ margin: '0.5rem 0 0' }}>Zdejmij go z jedenastki.</p>;
  }
  return (
    <form action={action} style={{ marginTop: '0.5rem' }}>
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="intent" value={onLoan ? 'recall' : 'loan'} />
      <button type="submit" disabled={pending}>
        {pending ? 'Zapisuję…' : onLoan ? 'Ściągnij z wypożyczenia' : 'Wypożycz na 120 dni'}
      </button>
      {state.error ? (
        <p role="alert" style={{ margin: '0.25rem 0 0' }}>
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p style={{ margin: '0.25rem 0 0' }}>Zapisane.</p> : null}
    </form>
  );
}
