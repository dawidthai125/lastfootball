'use client';

import { useActionState } from 'react';

import { COMPLETE_FIRST_MATCH_INITIAL } from '@/lib/first-match/action-types';
import { completeFirstMatch } from '@/lib/first-match/actions';

export function CompleteFirstMatchButton() {
  const [state, action, pending] = useActionState(completeFirstMatch, COMPLETE_FIRST_MATCH_INITIAL);

  return (
    <form action={action} style={{ display: 'inline' }}>
      {state.error ? (
        <p role="alert" style={{ color: 'var(--lf-color-status-danger)', margin: '0 0 0.5rem' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-gold)',
          background: 'var(--lf-color-gold-soft)',
          color: 'var(--lf-color-gold-base)',
          fontSize: 'var(--lf-type-body)',
          fontWeight: 600,
          padding: 'var(--lf-space-2) var(--lf-space-5)',
          borderRadius: 'var(--lf-radius-sm)',
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Zapisuję…' : 'Dalej — Witaj w LastFootball'}
      </button>
    </form>
  );
}
