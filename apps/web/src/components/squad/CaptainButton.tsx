'use client';

import { useActionState } from 'react';

import { setClubCaptain, type CaptainState } from '@/lib/squad/actions-captain';

const INITIAL: CaptainState = {};

export function CaptainButton({
  playerId,
  active,
}: {
  readonly playerId: string;
  readonly active: boolean;
}) {
  const [state, action, pending] = useActionState(setClubCaptain, INITIAL);
  if (active) return <p style={{ margin: 0 }}>Kapitan</p>;
  return (
    <form action={action}>
      <input type="hidden" name="playerId" value={playerId} />
      <button type="submit" disabled={pending}>
        {pending ? 'Zapisuję…' : 'Wyznacz kapitana'}
      </button>
      {state.error ? (
        <p role="alert" style={{ margin: '0.25rem 0 0' }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
