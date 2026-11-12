'use client';

import { useActionState } from 'react';

import { Input } from '@/components/ui/FormControls';
import { assignShirtNumber } from '@/lib/squad/actions-shirt';
import { ASSIGN_SHIRT_INITIAL } from '@/lib/squad/shirt-action-state';

import './squad-decision.css';

export function ShirtNumberForm({
  playerId,
  shirtNumber,
}: {
  playerId: string;
  shirtNumber: number;
}) {
  const [state, action, pending] = useActionState(assignShirtNumber, ASSIGN_SHIRT_INITIAL);
  const saved = state.ok
    ? state.swappedWith
      ? `Zapisano. Zamiana z ${state.swappedWith}.`
      : 'Zapisano.'
    : null;

  return (
    <form action={action} className="lf-sq-detail__shirt">
      <input type="hidden" name="playerId" value={playerId} />
      <label className="lf-sq-detail__shirt-field" htmlFor={`shirt-${playerId}`}>
        <span>Numer koszulki</span>
        <Input
          id={`shirt-${playerId}`}
          name="shirtNumber"
          type="number"
          min={1}
          max={99}
          step={1}
          required
          defaultValue={shirtNumber}
          inputMode="numeric"
          className="lf-sq-detail__shirt-input"
        />
      </label>
      <button type="submit" disabled={pending} className="lf-sq-detail__decision">
        {pending ? 'Zapis…' : 'Zapisz numer'}
      </button>
      <p className="lf-sq-detail__shirt-hint">
        Od 1 do 99. Zajęty numer zamienia się z tamtym zawodnikiem. Na boisku widać go od następnego
        wczytania meczu.
      </p>
      {state.error ? (
        <p role="alert" className="lf-sq-detail__shirt-msg lf-sq-detail__shirt-msg--bad">
          {state.error}
        </p>
      ) : null}
      {saved ? (
        <p role="status" className="lf-sq-detail__shirt-msg">
          {saved}
        </p>
      ) : null}
    </form>
  );
}
