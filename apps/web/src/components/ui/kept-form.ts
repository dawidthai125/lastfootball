'use client';

import { startTransition, useEffect, useRef, type FormEvent } from 'react';

type FormAction = (data: FormData) => void;
type Outcome = { readonly error?: string | null };

/**
 * React 19 clears a form after every `action`. Sent from onSubmit it keeps what was typed.
 * Leave `action` on the form too: it still works before the page is hydrated.
 */
export function keepFields(action: FormAction) {
  return (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => action(data));
  };
}

/** After an error only the current password goes. After success the form starts over. */
export function settleForm(
  form: Pick<HTMLFormElement, 'reset' | 'querySelectorAll'>,
  state: Outcome,
): void {
  if (!state.error) {
    form.reset();
    return;
  }
  form
    .querySelectorAll<HTMLInputElement>('input[autocomplete="current-password"]')
    .forEach((input) => {
      input.value = '';
    });
}

export function useKeptForm(action: FormAction, state: Outcome) {
  const ref = useRef<HTMLFormElement>(null);
  const settled = useRef(state);
  useEffect(() => {
    if (settled.current === state) return;
    settled.current = state;
    if (ref.current) settleForm(ref.current, state);
  }, [state]);
  return { ref, action, onSubmit: keepFields(action) };
}
