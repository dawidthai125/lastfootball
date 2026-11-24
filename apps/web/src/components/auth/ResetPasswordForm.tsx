'use client';

import { useActionState } from 'react';

import { updatePasswordFromRecovery } from '@/lib/auth/actions';
import { AUTH_ACTION_INITIAL } from '@/lib/auth/types';
import { Field, Input } from '@/components/ui/FormControls';

export function ResetPasswordForm({
  token = '',
  retry = false,
}: {
  token?: string;
  retry?: boolean;
}) {
  const [state, action, pending] = useActionState(updatePasswordFromRecovery, AUTH_ACTION_INITIAL);

  return (
    <form action={action} className="lf-auth-form">
      {state.error || retry ? (
        <p className="lf-auth-form__error" role="alert">
          {state.error ?? 'Tego hasła nie da się ustawić. Wybierz inne niż poprzednie.'}
        </p>
      ) : null}
      {token ? <input type="hidden" name="token" value={token} /> : null}

      <Field label="Nowe hasło" htmlFor="reset-password">
        <Input
          id="reset-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={pending}
        />
      </Field>

      <Field label="Powtórz hasło" htmlFor="reset-confirm">
        <Input
          id="reset-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={pending}
        />
      </Field>

      <button
        type="submit"
        className="lf-landing__cta lf-landing__cta--primary lf-auth-form__submit"
        disabled={pending}
      >
        {pending ? 'Zapisuję…' : 'Zapisz hasło'}
      </button>
    </form>
  );
}
