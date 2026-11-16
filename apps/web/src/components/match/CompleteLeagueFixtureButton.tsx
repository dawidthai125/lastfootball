'use client';

import { useActionState, useEffect, useRef } from 'react';

import { COMPLETE_FIXTURE_INITIAL } from '@/lib/fixtures/action-types';
import { completeFixture } from '@/lib/fixtures/complete-fixture';
import { UI_COPY } from '@/lib/ui/copy';

function saveForm(fixtureId: string, homeScore: number, awayScore: number): FormData {
  const data = new FormData();
  data.set('fixtureId', fixtureId);
  data.set('homeScore', String(homeScore));
  data.set('awayScore', String(awayScore));
  data.set('stay', '1');
  return data;
}

const buttonStyle = {
  borderWidth: 'var(--lf-border-width-hair)',
  borderStyle: 'solid' as const,
  borderColor: 'var(--lf-color-border-gold)',
  background: 'var(--lf-color-gold-soft)',
  color: 'var(--lf-color-gold-base)',
  fontSize: 'var(--lf-type-body)',
  fontWeight: 600,
  padding: 'var(--lf-space-2) var(--lf-space-5)',
  borderRadius: 'var(--lf-radius-sm)',
  textDecoration: 'none',
  display: 'inline-block',
};

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
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    action(saveForm(fixtureId, homeScore, awayScore));
  }, [action, awayScore, fixtureId, homeScore]);

  if (state.saved) {
    return (
      <a href="/hub" style={buttonStyle}>
        {UI_COPY.hubExit}
      </a>
    );
  }

  return (
    <form action={action} style={{ display: 'inline' }}>
      <input type="hidden" name="fixtureId" value={fixtureId} />
      <input type="hidden" name="homeScore" value={homeScore} />
      <input type="hidden" name="awayScore" value={awayScore} />
      <input type="hidden" name="stay" value="1" />
      {state.error ? (
        <p role="alert" style={{ color: 'var(--lf-color-status-danger)', margin: '0 0 0.5rem' }}>
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending || !state.error}
        style={{ ...buttonStyle, cursor: pending ? 'wait' : 'pointer' }}
      >
        {pending || !state.error ? UI_COPY.saving : 'Zapisz wynik'}
      </button>
    </form>
  );
}
