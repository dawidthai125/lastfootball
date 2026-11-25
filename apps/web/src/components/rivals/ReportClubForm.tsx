'use client';

import { useActionState, useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/FormControls';
import { keepFields } from '@/components/ui/kept-form';
import { reportClub } from '@/lib/moderation/report';
import { MODERATION_INITIAL, REPORT_REASONS } from '@/lib/moderation/types';

export function ReportClubForm({ clubId }: { readonly clubId: string }) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(reportClub, MODERATION_INITIAL);

  if (state.info) {
    return (
      <p role="status" style={{ margin: 0 }}>
        {state.info}
      </p>
    );
  }
  if (!open) {
    return (
      <Button variant="ghost" size="md" onClick={() => setOpen(true)}>
        Zgłoś
      </Button>
    );
  }
  return (
    <form
      action={action}
      onSubmit={keepFields(action)}
      style={{ display: 'grid', gap: 'var(--lf-space-2)', maxWidth: '22rem' }}
    >
      <input type="hidden" name="clubId" value={clubId} />
      <Select name="reason" aria-label="Powód zgłoszenia" defaultValue="name" disabled={pending}>
        {Object.entries(REPORT_REASONS).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>
      <Input
        name="details"
        maxLength={300}
        placeholder="Co się stało? (nieobowiązkowe)"
        aria-label="Opis zgłoszenia"
        disabled={pending}
      />
      {state.error ? (
        <p role="alert" style={{ margin: 0, color: 'var(--lf-color-status-danger)' }}>
          {state.error}
        </p>
      ) : null}
      <div style={{ display: 'flex', gap: 'var(--lf-space-2)' }}>
        <Button type="submit" size="md" disabled={pending}>
          {pending ? 'Wysyłam…' : 'Wyślij zgłoszenie'}
        </Button>
        <Button variant="ghost" size="md" disabled={pending} onClick={() => setOpen(false)}>
          Anuluj
        </Button>
      </div>
    </form>
  );
}
