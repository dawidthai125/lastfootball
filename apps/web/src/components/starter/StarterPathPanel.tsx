'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { Panel } from '@/components/ui/Panel';
import { formatMoney } from '@/lib/finance/format-money';
import { claimStarterReward, type StarterRewardState } from '@/lib/starter/actions';
import { STARTER_REWARD, type StarterPath } from '@/lib/starter/steps';

const INITIAL: StarterRewardState = { error: null };

/** First steps on the hub (D142). Gone once the reward is collected. */
export function StarterPathPanel({ path }: { readonly path: StarterPath }) {
  const [state, action, pending] = useActionState(claimStarterReward, INITIAL);
  const done = path.steps.filter((step) => step.done).length;

  return (
    <Panel title="Pierwsze kroki" action={`${done}/${path.steps.length}`}>
      <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: '0.5rem' }}>
        {path.steps.map((step) => (
          <li key={step.id} style={{ opacity: step.done || step.id === path.nextId ? 1 : 0.6 }}>
            <span aria-hidden>{step.done ? '✓ ' : '○ '}</span>
            {step.id === path.nextId ? (
              <Link href={step.href} style={{ color: 'var(--lf-color-text-gold)' }}>
                {step.label}
              </Link>
            ) : (
              step.label
            )}
            {step.done ? <span className="sr-only"> (zrobione)</span> : null}
            {step.id === path.nextId ? (
              <span
                style={{
                  display: 'block',
                  color: 'var(--lf-color-text-muted)',
                  fontSize: '0.85em',
                }}
              >
                {step.why}
              </span>
            ) : null}
          </li>
        ))}
      </ol>
      {path.complete ? (
        <form action={action} style={{ marginTop: 'var(--lf-space-3)' }}>
          <Button type="submit" variant="primary" size="md" disabled={pending}>
            {pending ? 'Zapisuję…' : `Odbierz ${formatMoney(STARTER_REWARD)}`}
          </Button>
        </form>
      ) : (
        <p style={{ margin: 'var(--lf-space-2) 0 0', color: 'var(--lf-color-text-muted)' }}>
          Nagroda za wszystkie kroki: {formatMoney(STARTER_REWARD)}.
        </p>
      )}
      {state.error ? (
        <p role="alert" style={{ margin: '0.5rem 0 0' }}>
          {state.error}
        </p>
      ) : null}
    </Panel>
  );
}
