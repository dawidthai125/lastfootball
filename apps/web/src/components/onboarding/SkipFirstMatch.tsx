'use client';

import { useActionState, useState } from 'react';

import { completeFirstMatch } from '@/lib/first-match/actions';
import { COMPLETE_FIRST_MATCH_INITIAL } from '@/lib/first-match/action-types';

/** Plays the first match on the server, without decisions, and goes on to the hub. */
export function SkipFirstMatch() {
  const [asked, setAsked] = useState(false);
  const [state, action, pending] = useActionState(completeFirstMatch, COMPLETE_FIRST_MATCH_INITIAL);

  if (!asked) {
    return (
      <button type="button" className="lf-fm__skip" onClick={() => setAsked(true)}>
        Pomiń mecz
      </button>
    );
  }
  return (
    <form action={action} className="lf-fm__confirm">
      <input type="hidden" name="managerLog" value="[]" />
      <p>Mecz rozegra się sam, bez Twoich decyzji, i od razu zapisze wynik.</p>
      <button type="submit" className="lf-fm__skip" disabled={pending}>
        {pending ? 'Rozgrywam…' : 'Rozegraj bez oglądania'}
      </button>
      <button
        type="button"
        className="lf-fm__skip"
        disabled={pending}
        onClick={() => setAsked(false)}
      >
        Wróć
      </button>
      {state.error ? <p role="alert">{state.error}</p> : null}
    </form>
  );
}
