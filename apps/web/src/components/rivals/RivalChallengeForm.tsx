'use client';

import { useActionState } from 'react';

import { createRivalChallenge, type RivalChallengeState } from '@/lib/rivals/actions';

const INITIAL: RivalChallengeState = {};

export function RivalChallengeForm({
  rivalId,
  rivalName,
  rivalShort,
}: {
  readonly rivalId: string;
  readonly rivalName: string;
  readonly rivalShort: string;
}) {
  const [state, action, pending] = useActionState(createRivalChallenge, INITIAL);

  return (
    <form action={action}>
      <input type="hidden" name="rivalId" value={rivalId} />
      {rivalName} ({rivalShort}){' '}
      <button type="submit" disabled={pending}>
        {pending ? 'Zapisuję…' : 'Wyzwij'}
      </button>
      {state.error ? (
        <p role="alert" style={{ color: 'var(--lf-color-status-danger)', margin: '0.25rem 0 0' }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
