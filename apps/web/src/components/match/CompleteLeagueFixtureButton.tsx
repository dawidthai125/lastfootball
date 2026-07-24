'use client';

import { useActionState } from 'react';

import { COMPLETE_FIXTURE_INITIAL } from '@/lib/fixtures/action-types';
import { completeFixture } from '@/lib/fixtures/complete-fixture';

export function CompleteLeagueFixtureButton({
  fixtureId,
  homeScore,
  awayScore,
}: {
  fixtureId: string;
  homeScore: number;
  awayScore: number;
}) {
  const [state, action, pending] = useActionState(completeFixture, COMPLETE_FIXTURE_INITIAL);

  return (
    <form action={action} style={{ display: 'inline' }}>
      <input type="hidden" name="fixtureId" value={fixtureId} />
      <input type="hidden" name="homeScore" value={homeScore} />
      <input type="hidden" name="awayScore" value={awayScore} />
      {state.error ? (
        <p role="alert" style={{ color: 'var(--lf-color-status-danger)', margin: '0 0 0.5rem' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        style={{
          borderWidth: 'var(--lf-border-width-hair)',
          borderStyle: 'solid',
          borderColor: 'var(--lf-color-border-gold)',
          background: 'var(--lf-color-gold-soft)',
          color: 'var(--lf-color-gold-base)',
          fontSize: 'var(--lf-type-body)',
          fontWeight: 600,
          padding: 'var(--lf-space-2) var(--lf-space-5)',
          borderRadius: 'var(--lf-radius-sm)',
          cursor: pending ? 'wait' : 'pointer',
        }}
      >
        {pending ? 'Zapisuję…' : 'Wróć do Hubu'}
      </button>
    </form>
  );
}
