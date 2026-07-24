'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { AUTH_ACTION_INITIAL } from '@/lib/auth/types';
import { signUpWithPassword } from '@/lib/auth/actions';
import { Checkbox, Field, Input } from '@/components/ui/FormControls';

export function RegisterForm() {
  const [state, action, pending] = useActionState(signUpWithPassword, AUTH_ACTION_INITIAL);

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

      <Field label="Email" htmlFor="register-email">
        <Input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
          placeholder="ty@email.pl"
        />
      </Field>

      <Field label="Hasło" htmlFor="register-password" hint="Minimum 6 znaków">
        <Input
          id="register-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={6}
          disabled={pending}
        />
      </Field>

      <div className="lf-auth-form__terms">
        <Checkbox
          name="terms"
          required
          disabled={pending}
          label="Akceptuję"
        />
        <span className="lf-auth-form__terms-links">
          <Link href="/regulamin" className="lf-auth-form__link">
            Regulamin
          </Link>
          {' i '}
          <Link href="/prywatnosc" className="lf-auth-form__link">
            Politykę prywatności
          </Link>
        </span>
      </div>

      <button
        type="submit"
        className="lf-landing__cta lf-landing__cta--primary lf-auth-form__submit"
        disabled={pending}
      >
        {pending ? 'Tworzenie konta…' : 'Utwórz konto'}
      </button>

      <p className="lf-auth-form__switch">
        Masz już konto?{' '}
        <Link href="/login" className="lf-auth-form__link">
          Zaloguj się
        </Link>
      </p>
    </form>
  );
}
