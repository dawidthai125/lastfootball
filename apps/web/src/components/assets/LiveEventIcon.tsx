'use client';

import { LIVE_ICON_FILES, liveIconSrc, type LiveIconId } from '@/assets';
import type { LiveEventKind } from '@/data/fixtures';

type LiveEventIconProps = {
  kind: LiveEventKind | LiveIconId;
  size?: number;
  highlight?: boolean;
  title?: string;
};

/**
 * Live match event icon from Asset Pack.
 */
export function LiveEventIcon({ kind, size = 14, highlight = false, title }: LiveEventIconProps) {
  if (!(kind in LIVE_ICON_FILES)) return null;
  const src = liveIconSrc(kind as LiveIconId);
  const color = highlight
    ? 'var(--lf-color-status-live)'
    : kind === 'goal'
      ? 'var(--lf-color-text-gold)'
      : kind === 'card'
        ? 'var(--lf-color-status-warn)'
        : 'var(--lf-color-text-muted)';

  return (
    <span
      role="img"
      aria-hidden={title ? undefined : true}
      title={title ?? kind}
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        flexShrink: 0,
        verticalAlign: 'middle',
        backgroundColor: color,
        maskImage: `url(${src})`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${src})`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}
