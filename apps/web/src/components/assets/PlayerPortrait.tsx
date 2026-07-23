import type { CSSProperties } from 'react';

import { portraitSrc } from '@/assets';

const sizeMap = {
  sm: 'var(--lf-space-6)',
  md: 'calc(var(--lf-space-8) + var(--lf-space-2))',
  lg: 'calc(var(--lf-space-8) + var(--lf-space-6))',
} as const;

type PlayerPortraitProps = {
  playerId?: string | null;
  name?: string;
  size?: keyof typeof sizeMap;
  style?: CSSProperties;
};

/**
 * Player portrait placeholder from Asset Pack.
 * Later: map playerId → final art in pack-01/portraits.
 */
export function PlayerPortrait({ playerId, name, size = 'md', style }: PlayerPortraitProps) {
  const dim = sizeMap[size];
  const src = portraitSrc(playerId);
  const alt = name ? `Portret: ${name}` : 'Portret zawodnika';

  return (
    // Local pack SVG placeholder
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={64}
      height={64}
      draggable={false}
      style={{
        display: 'block',
        width: dim,
        height: dim,
        flexShrink: 0,
        objectFit: 'cover',
        borderRadius: 'var(--lf-radius-sm)',
        borderWidth: 'var(--lf-border-width-hair)',
        borderStyle: 'solid',
        borderColor: 'var(--lf-color-border-subtle)',
        background: 'var(--lf-color-bg-inset)',
        ...style,
      }}
    />
  );
}
