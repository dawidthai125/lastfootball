'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/FormControls';
import { deleteAccount, type DeleteAccountState } from '@/lib/account/delete-account';

const INITIAL: DeleteAccountState = { error: null };

export function DeleteAccountForm({ clubName }: { readonly clubName: string | null }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(deleteAccount, INITIAL);

  if (!open) {
    return (
      <Button variant="ghost" size="md" onClick={() => setOpen(true)}>
        Usuń konto
      </Button>
    );
  }
  return (
    <form action={action} style={{ display: 'grid', gap: 'var(--lf-space-2)', maxWidth: '26rem' }}>
      <p style={{ margin: 0 }}>
        Usuniemy na zawsze konto, adres e-mail{clubName ? `, klub ${clubName}` : ''}, zawodników,
        wyniki i powiadomienia. Tego nie da się cofnąć. W tabelach innych graczy zostanie „Klub
        usunięty”.
      </p>
      <Field label="Hasło" htmlFor="delete-password">
        <Input
          id="delete-password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          disabled={pending}
        />
      </Field>
      <Field label="Wpisz USUŃ" htmlFor="delete-confirm">
        <Input id="delete-confirm" name="confirm" autoComplete="off" required disabled={pending} />
      </Field>
      {state.error ? (
        <p role="alert" style={{ margin: 0, color: 'var(--lf-color-status-danger)' }}>
          {state.error}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: 'var(--lf-space-2)' }}>
        <Button type="submit" variant="danger" size="md" disabled={pending}>
          {pending ? 'Usuwam…' : 'Usuń konto na zawsze'}
        </Button>
        <Button variant="ghost" size="md" disabled={pending} onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
