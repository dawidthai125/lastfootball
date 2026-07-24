'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { AUTH_ACTION_INITIAL } from '@/lib/auth/types';
import { signInWithPassword } from '@/lib/auth/actions';
import { Field, Input } from '@/components/ui/FormControls';

type LoginFormProps = {
  nextPath?: string;
  bannerError?: string | null;
};

export function LoginForm({ nextPath, bannerError }: LoginFormProps) {
  const [state, action, pending] = useActionState(signInWithPassword, AUTH_ACTION_INITIAL);

  return (
    <form action={action} className="lf-auth-form">
      {nextPath ? <input type="hidden" name="next" value={nextPath} /> : null}

      {(bannerError || state.error) && (
        <p className="lf-auth-form__error" role="alert">
          {state.error ?? bannerError}
        </p>
      )}

      <Field label="Email" htmlFor="login-email">
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          placeholder="ty@email.pl"
        />
      </Field>

      <Field label="Hasło" htmlFor="login-password">
        <Input
          id="login-password"
          name="password"
          type="password"
          autoComplete="current-password"
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
        {pending ? 'Logowanie…' : 'Zaloguj się'}
      </button>

      <p className="lf-auth-form__switch">
        Nie masz konta?{' '}
        <Link href="/register" className="lf-auth-form__link">
          Załóż klub
        </Link>
      </p>
    </form>
  );
}
