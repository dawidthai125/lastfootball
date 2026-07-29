'use client';

import type { ReactNode } from 'react';

import { UI_COPY } from '@/lib/ui/copy';

type StateBannerProps = {
  tone?: 'error' | 'info';
  children: ReactNode;
  onRetry?: () => void;
  retryLabel?: string;
};

/** StateBanner — error/info strip (SYS-05 presentation, no stack traces). */
export function StateBanner({
  tone = 'error',
  children,
  onRetry,
  retryLabel = UI_COPY.retry,
}: StateBannerProps) {
  return (
    <div
      className={tone === 'error' ? 'lf-sb lf-sb--error' : 'lf-sb lf-sb--info'}
      role={tone === 'error' ? 'alert' : 'status'}
      data-lf-impl="LFE-UI-IMPL-03"
    >
      <div className="lf-sb__body">{children}</div>
      {onRetry ? (
        <button type="button" className="lf-sb__retry" onClick={onRetry}>
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
