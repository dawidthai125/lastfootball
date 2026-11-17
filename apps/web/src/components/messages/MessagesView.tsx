'use client';

import Link from 'next/link';
import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import type { ClubMessagesDto } from '@/lib/messages';
import {
  settleDressingConflict,
  type DressingState,
} from '@/lib/squad/actions-dressing-room';
import { acceptIntlCallup, type IntlState } from '@/lib/squad/actions-intl-callup';
import { UI_COPY } from '@/lib/ui/copy';

const DRESS_INITIAL: DressingState = {};
const INTL_INITIAL: IntlState = {};

export type MessagesDeskProps = {
  readonly messages: ClubMessagesDto;
  readonly dressingConflictId?: string | null;
  readonly intlPlayerId?: string | null;
};

/**
 * Messages inbox — presentation only.
 * Renders resolveClubMessages order as-is (no sort/filter in UI).
 */
export function MessagesView({
  messages,
  dressingConflictId = null,
  intlPlayerId = null,
}: MessagesDeskProps) {
  const { items } = messages;
  const [dressState, dressAction, dressPending] = useActionState(
    settleDressingConflict,
    DRESS_INITIAL,
  );
  const [intlState, intlAction, intlPending] = useActionState(acceptIntlCallup, INTL_INITIAL);

  return (
    <div>
      <header className="mb-3">
        <h1
          className="font-[family-name:var(--font-display)] font-bold"
          style={{ fontSize: 'var(--lf-type-title)', color: 'var(--lf-color-text-primary)' }}
        >
          {UI_COPY.messagesTitle}
        </h1>
        <p
          className="mt-1 font-[family-name:var(--font-ui)]"
          style={{ fontSize: 'var(--lf-type-caption)', color: 'var(--lf-color-text-muted)' }}
        >
          {UI_COPY.messagesSubtitle}
        </p>
      </header>

      {dressingConflictId ? (
        <section className="mb-4" aria-label="Konflikt w szatni">
          <p
            className="mb-2 font-[family-name:var(--font-ui)]"
            style={{ fontSize: 'var(--lf-type-table)', color: 'var(--lf-color-text-primary)' }}
          >
            Dwóch wybuchowych w jedenastce ma niski nastrój. Porozmawiaj (+3) albo odpuść (−2).
          </p>
          {dressState.error ? (
            <p role="alert" style={{ color: 'var(--lf-color-text-muted)' }}>
              {dressState.error}
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <form action={dressAction}>
              <input type="hidden" name="intent" value="mediate" />
              <Button type="submit" disabled={dressPending}>
                Porozmawiaj
              </Button>
            </form>
            <form action={dressAction}>
              <input type="hidden" name="intent" value="ignore" />
              <Button type="submit" variant="default" disabled={dressPending}>
                Odpuść
              </Button>
            </form>
          </div>
        </section>
      ) : null}

      {intlPlayerId ? (
        <section className="mb-4" aria-label="Powołanie">
          <p
            className="mb-2 font-[family-name:var(--font-ui)]"
            style={{ fontSize: 'var(--lf-type-table)', color: 'var(--lf-color-text-primary)' }}
          >
            Reprezentacja bierze zawodnika na kilka dni. Zdejmie go z jedenastki.
          </p>
          {intlState.error ? (
            <p role="alert" style={{ color: 'var(--lf-color-text-muted)' }}>
              {intlState.error}
            </p>
          ) : null}
          <form action={intlAction}>
            <input type="hidden" name="playerId" value={intlPlayerId} />
            <Button type="submit" disabled={intlPending}>
              Zwolnij do kadry
            </Button>
          </form>
        </section>
      ) : null}

      {items.length === 0 ? (
        <p
          className="font-[family-name:var(--font-ui)]"
          style={{ fontSize: 'var(--lf-type-table)', color: 'var(--lf-color-text-muted)' }}
        >
          {UI_COPY.messagesEmptyHint}
        </p>
      ) : (
        <ul
          className="divide-y"
          style={{ borderColor: 'var(--lf-color-border-subtle)' }}
          aria-label={UI_COPY.messagesTitle}
        >
          {items.map((m) => (
            <li key={m.id}>
              <Link
                href={m.href}
                className="flex items-center justify-between gap-3 py-2.5 no-underline"
                style={{ fontSize: 'var(--lf-type-table)' }}
              >
                <span className="min-w-0">
                  <span
                    className="block font-medium"
                    style={{ color: 'var(--lf-color-text-primary)' }}
                  >
                    {m.subject}
                  </span>
                  <span
                    className="mt-0.5 block"
                    style={{
                      fontSize: 'var(--lf-type-caption)',
                      color: 'var(--lf-color-text-muted)',
                    }}
                  >
                    od: {m.fromLabel}
                  </span>
                </span>
                <span
                  className="shrink-0 uppercase"
                  style={{
                    fontSize: '9px',
                    letterSpacing: 'var(--lf-type-tracking-label)',
                    color:
                      m.priority === 'decision'
                        ? 'var(--lf-color-text-gold)'
                        : 'var(--lf-color-text-faint)',
                  }}
                >
                  {m.priority === 'decision'
                    ? UI_COPY.messagesPriorityDecision
                    : UI_COPY.messagesPriorityInfo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
