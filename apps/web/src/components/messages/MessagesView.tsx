import Link from 'next/link';

import type { ClubMessagesDto } from '@/lib/messages';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * Messages inbox — presentation only.
 * Renders resolveClubMessages order as-is (no sort/filter in UI).
 */
export function MessagesView({ messages }: { messages: ClubMessagesDto }) {
  const { items } = messages;

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
                  {m.priority === 'decision' ? UI_COPY.messagesPriorityDecision : UI_COPY.messagesPriorityInfo}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
