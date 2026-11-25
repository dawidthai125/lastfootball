'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/FormControls';
import { useKeptForm } from '@/components/ui/kept-form';
import { changePassword, requestEmailChange } from '@/lib/account/credentials';
import { MIN_PASSWORD } from '@/lib/auth/password-policy';
import { AUTH_ACTION_INITIAL, type AuthActionState } from '@/lib/auth/types';

function Answer({ state }: { state: AuthActionState }) {
  const text = state.error ?? state.info;
  if (!text) return null;
  return (
    <p
      role={state.error ? 'alert' : 'status'}
      style={{
        margin: 0,
        color: state.error ? 'var(--lf-color-status-danger)' : 'var(--lf-color-status-ok)',
      }}
    >
      {text}
    </p>
  );
}

const FORM = { display: 'grid', gap: 'var(--lf-space-2)', maxWidth: '26rem' } as const;

function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, AUTH_ACTION_INITIAL);
  const form = useKeptForm(action, state);
  return (
    <form {...form} style={FORM}>
      <Field label="Obecne hasło" htmlFor="pw-current">
        <Input
          id="pw-current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </Field>
      <Field label="Nowe hasło" htmlFor="pw-next">
        <Input
          id="pw-next"
          name="next"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
          disabled={pending}
        />
      </Field>
      <Field label="Powtórz nowe hasło" htmlFor="pw-confirm">
        <Input
          id="pw-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          minLength={MIN_PASSWORD}
          required
          disabled={pending}
        />
      </Field>
      <Answer state={state} />
      <Button type="submit" size="md" disabled={pending}>
        {pending ? 'Zapisuję…' : 'Zmień hasło'}
      </Button>
    </form>
  );
}

function EmailForm({ email }: { email: string }) {
  const [state, action, pending] = useActionState(requestEmailChange, AUTH_ACTION_INITIAL);
  const form = useKeptForm(action, state);
  return (
    <form {...form} style={FORM}>
      <p style={{ margin: 0 }}>Obecny adres: {email}</p>
      <Field label="Nowy adres e-mail" htmlFor="em-next">
        <Input
          id="em-next"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={pending}
        />
      </Field>
      <Field label="Hasło" htmlFor="em-current">
        <Input
          id="em-current"
          name="current"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </Field>
      <Answer state={state} />
      <Button type="submit" size="md" disabled={pending}>
        {pending ? 'Wysyłam…' : 'Wyślij link na nowy adres'}
      </Button>
    </form>
  );
}

/** Password and address of the account. Closed until asked for. */
export function CredentialForms({ email }: { email: string }) {
  const [open, setOpen] = useState<'password' | 'email' | null>(null);
  return (
    <div style={{ display: 'grid', gap: 'var(--lf-space-3)', marginTop: 'var(--lf-space-3)' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--lf-space-2)' }}>
        <Button size="md" onClick={() => setOpen(open === 'password' ? null : 'password')}>
          Zmień hasło
        </Button>
        <Button size="md" onClick={() => setOpen(open === 'email' ? null : 'email')}>
          Zmień e-mail
        </Button>
      </div>
      {open === 'password' ? <PasswordForm /> : null}
      {open === 'email' ? <EmailForm email={email} /> : null}
    </div>
  );
}
