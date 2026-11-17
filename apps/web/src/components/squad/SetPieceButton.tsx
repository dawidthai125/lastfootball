'use client';

import { useActionState } from 'react';

import { setClubSetPiece, type SetPieceState } from '@/lib/squad/actions-set-piece';

const INITIAL: SetPieceState = {};

export function SetPieceButton({
  playerId,
  active,
  goalkeeper,
}: {
  readonly playerId: string;
  readonly active: boolean;
  readonly goalkeeper: boolean;
}) {
  const [state, action, pending] = useActionState(setClubSetPiece, INITIAL);
  if (goalkeeper) return <p style={{ margin: 0 }}>Bramkarz nie bierze rzutów rożnych.</p>;
  if (active) return <p style={{ margin: 0 }}>Bierze stałe fragmenty.</p>;
  return (
    <form action={action}>
      <input type="hidden" name="playerId" value={playerId} />
      <button type="submit" disabled={pending}>
        {pending ? 'Zapisuję…' : 'Wyznacz do stałych fragmentów'}
      </button>
      {state.error ? (
        <p role="alert" style={{ margin: '0.25rem 0 0' }}>
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
