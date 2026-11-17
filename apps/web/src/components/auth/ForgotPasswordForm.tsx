'use client';

import { useActionState } from 'react';

import { requestPasswordReset } from '@/lib/auth/actions';
import { AUTH_ACTION_INITIAL } from '@/lib/auth/types';
import { Field, Input } from '@/components/ui/FormControls';

export function ForgotPasswordForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, AUTH_ACTION_INITIAL);

  return (
    <form action={action} className="lf-auth-form">
      {state.error ? (
        <p className="lf-auth-form__error" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.info ? (
        <p className="lf-auth-form__info" role="status">
          {state.info}
        </p>
      ) : null}

      <Field label="Email" htmlFor="forgot-email">
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          placeholder="ty@email.pl"
        />
      </Field>

      <button
        type="submit"
        className="lf-landing__cta lf-landing__cta--primary lf-auth-form__submit"
        disabled={pending}
      >
        {pending ? 'Wysyłam…' : 'Wyślij link'}
      </button>
    </form>
  );
}
