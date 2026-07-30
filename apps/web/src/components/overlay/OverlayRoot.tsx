'use client';

import Link from 'next/link';

import { useClubMessages } from '@/components/club/ClubProvider';
import { useOverlay } from '@/components/overlay/OverlayProvider';
import { UI_COPY } from '@/lib/ui/copy';

/**
 * Notifications overlay — same ClubMessagesDto as /messages (LFE-MESSAGES-01 · D43).
 * No runtime mocks · no mark-as-read workflow.
 */
export function OverlayRoot() {
  const { active, close } = useOverlay();
  const messages = useClubMessages();

  if (!active) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 'var(--lf-z-modal)' }} role="presentation">
      <button
        type="button"
        aria-label="Zamknij overlay"
        className="absolute inset-0 border-0"
        style={{
          background: 'var(--lf-color-overlay-scrim)',
          zIndex: 'var(--lf-z-overlay)',
          cursor: 'pointer',
        }}
        onClick={close}
      />

      {active === 'notifications' ? (
        <aside
          role="dialog"
          aria-modal="true"
          aria-label={UI_COPY.messagesOverlayTitle}
          className="absolute top-0 right-0 flex h-full flex-col border-l"
          style={{
            width: 'var(--lf-overlay-panel-width)',
            maxWidth: '100%',
            background: 'var(--lf-color-bg-panel)',
            borderColor: 'var(--lf-color-border-subtle)',
            boxShadow: 'var(--lf-shadow-md)',
            zIndex: 'var(--lf-z-modal)',
            borderRadius: 'var(--lf-radius-none)',
          }}
        >
          <header
            className="flex items-center justify-between border-b"
            style={{
              borderColor: 'var(--lf-color-border-subtle)',
              background: 'var(--lf-color-bg-panel-alt)',
              padding: 'var(--lf-space-3)',
              height: 'var(--lf-shell-topbar)',
            }}
          >
            <h2
              className="font-[family-name:var(--font-ui)] font-semibold uppercase"
              style={{
                fontSize: 'var(--lf-type-label)',
                letterSpacing: 'var(--lf-type-tracking-label)',
                color: 'var(--lf-color-text-gold)',
              }}
            >
              {UI_COPY.messagesOverlayTitle}
            </h2>
            <button
              type="button"
              onClick={close}
              className="border bg-transparent"
              style={{
                borderColor: 'var(--lf-color-border-subtle)',
                color: 'var(--lf-color-text-muted)',
                fontSize: 'var(--lf-type-caption)',
                padding: 'var(--lf-space-1) var(--lf-space-2)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
            >
              Zamknij
            </button>
          </header>

          <ul className="flex-1 overflow-y-auto" style={{ padding: 'var(--lf-space-2)' }}>
            {messages.items.length === 0 ? (
              <li
                className="font-[family-name:var(--font-ui)]"
                style={{
                  padding: 'var(--lf-space-3)',
                  fontSize: 'var(--lf-type-table)',
                  color: 'var(--lf-color-text-muted)',
                }}
              >
                {UI_COPY.messagesEmptyHint}
              </li>
            ) : (
              messages.items.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={close}
                    className="flex items-center justify-between border-b no-underline transition-colors"
                    style={{
                      borderColor: 'var(--lf-color-border-subtle)',
                      padding: 'var(--lf-space-2) var(--lf-space-2)',
                      fontSize: 'var(--lf-type-table)',
                      color: 'var(--lf-color-text-secondary)',
                      transitionDuration: 'var(--lf-motion-fast)',
                      transitionTimingFunction: 'var(--lf-motion-easing)',
                    }}
                  >
                    <span style={{ color: 'var(--lf-color-text-primary)' }}>{n.subject}</span>
                    <span
                      style={{
                        color: 'var(--lf-color-text-faint)',
                        fontSize: 'var(--lf-type-caption)',
                      }}
                    >
                      {n.fromLabel}
                    </span>
                  </Link>
                </li>
              ))
            )}
          </ul>

          <footer
            className="border-t"
            style={{
              borderColor: 'var(--lf-color-border-subtle)',
              padding: 'var(--lf-space-2)',
            }}
          >
            <Link
              href="/messages"
              onClick={close}
              className="block w-full border text-center no-underline"
              style={{
                borderColor: 'var(--lf-color-border-gold)',
                background: 'var(--lf-color-gold-soft)',
                color: 'var(--lf-color-gold-base)',
                fontSize: 'var(--lf-type-caption)',
                padding: 'var(--lf-space-2)',
                borderRadius: 'var(--lf-radius-sm)',
              }}
            >
              {UI_COPY.messagesOpenInbox}
            </Link>
          </footer>
        </aside>
      ) : null}
    </div>
  );
}
