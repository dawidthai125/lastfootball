'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/FormControls';
import {
  blockAccount,
  closeReport,
  renameClub,
  unblockAccount,
} from '@/lib/moderation/admin-actions';
import { MODERATION_INITIAL, type ModerationState } from '@/lib/moderation/types';

const FORM = { display: 'grid', gap: 'var(--lf-space-2)', maxWidth: '24rem' } as const;

function Answer({ state }: { state: ModerationState }) {
  const text = state.error ?? state.info;
  return text ? (
    <p role={state.error ? 'alert' : 'status'} style={{ margin: 0 }}>
      {text}
    </p>
  ) : null;
}

export function CloseReportForm({ reportId }: { reportId: string }) {
  const [state, action, pending] = useActionState(closeReport, MODERATION_INITIAL);
  return (
    <form action={action} style={FORM}>
      <input type="hidden" name="reportId" value={reportId} />
      <Answer state={state} />
      <Button type="submit" size="md" disabled={pending}>
        Zamknij zgłoszenie
      </Button>
    </form>
  );
}

export function ClubTools({
  clubId,
  name,
  shortName,
  blocked,
}: {
  clubId: string;
  name: string;
  shortName: string;
  blocked: boolean;
}) {
  const [renamed, rename, renaming] = useActionState(renameClub, MODERATION_INITIAL);
  const [locked, lock, locking] = useActionState(blockAccount, MODERATION_INITIAL);
  const [freed, free, freeing] = useActionState(unblockAccount, MODERATION_INITIAL);
  return (
    <details>
      <summary>Działania</summary>
      <div style={{ display: 'grid', gap: 'var(--lf-space-3)', padding: 'var(--lf-space-2) 0' }}>
        <form action={rename} style={FORM}>
          <input type="hidden" name="clubId" value={clubId} />
          <Input name="name" aria-label="Nowa nazwa" defaultValue={name} required />
          <Input name="shortName" aria-label="Nowy skrót" defaultValue={shortName} required />
          <Input name="reason" aria-label="Powód zmiany nazwy" placeholder="Powód" required />
          <Answer state={renamed} />
          <Button type="submit" size="md" disabled={renaming}>
            Zmień nazwę
          </Button>
        </form>
        {blocked ? (
          <form action={free} style={FORM}>
            <input type="hidden" name="clubId" value={clubId} />
            <Answer state={freed} />
            <Button type="submit" size="md" disabled={freeing}>
              Odblokuj konto
            </Button>
          </form>
        ) : (
          <form action={lock} style={FORM}>
            <input type="hidden" name="clubId" value={clubId} />
            <Input name="reason" aria-label="Powód blokady" placeholder="Powód" required />
            <Input name="confirm" aria-label="Potwierdzenie" placeholder="Wpisz BLOKUJ" required />
            <Answer state={locked} />
            <Button type="submit" variant="danger" size="md" disabled={locking}>
              Zablokuj konto
            </Button>
          </form>
        )}
      </div>
    </details>
  );
}
