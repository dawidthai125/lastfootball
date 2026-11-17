'use client';

import { useActionState } from 'react';

import { saveContractTalk, type ContractTalkState } from '@/lib/squad/actions-contract';

const INITIAL: ContractTalkState = {};

export function ContractTalkForm({
  playerId,
  demand,
  extended,
}: {
  readonly playerId: string;
  readonly demand: number;
  readonly extended: boolean;
}) {
  const [state, action, pending] = useActionState(saveContractTalk, INITIAL);
  if (extended) return <p style={{ margin: '0.5rem 0 0' }}>Kontrakt jest już przedłużony.</p>;
  return (
    <form
      action={action}
      style={{
        marginTop: '0.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        alignItems: 'flex-start',
      }}
    >
      <input type="hidden" name="playerId" value={playerId} />
      <label style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        Nowa pensja, minimum {demand} €
        <input name="offer" type="number" min={demand} step={1} defaultValue={demand} required />
      </label>
      <button type="submit" disabled={pending}>
        {pending ? 'Zapisuję…' : 'Przedłuż do 30.06.2029'}
      </button>
      {state.error ? (
        <p role="alert" style={{ margin: 0 }}>
          {state.error}
        </p>
      ) : null}
      {state.ok ? <p style={{ margin: 0 }}>Kontrakt przedłużony.</p> : null}
    </form>
  );
}
