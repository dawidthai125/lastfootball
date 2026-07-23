import type { CSSProperties } from 'react';

import { crestSrc } from '@/assets';

const sizeMap = {
  sm: 'var(--lf-space-6)',
  md: 'calc(var(--lf-space-8) + var(--lf-space-2))',
  lg: 'calc(var(--lf-space-8) + var(--lf-space-5))',
  xl: 'calc(var(--lf-space-8) + var(--lf-space-6))',
} as const;

export type ClubCrestSize = keyof typeof sizeMap;

type ClubCrestProps = {
  shortName?: string | null;
  clubName?: string | null;
  label?: string;
  size?: ClubCrestSize;
  style?: CSSProperties;
};

/**
 * Club crest from Asset Pack — replaces letter monograms.
 * Swap SVG under public/assets/pack-01/crests to upgrade art.
 */
export function ClubCrest({
  shortName,
  clubName,
  label,
  size = 'lg',
  style,
}: ClubCrestProps) {
  const dim = sizeMap[size];
  const src = crestSrc(shortName, clubName);
  const alt = label ?? clubName ?? shortName ?? 'Herb klubu';

  return (
    <div style={{ textAlign: 'center', ...style }}>
      {/* Local pack SVG — next/image unnecessary for tiny static crests */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
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
          marginInline: 'auto',
          objectFit: 'contain',
          borderRadius: 'var(--lf-radius-sm)',
        }}
      />
      {label ? (
        <div
          style={{
            marginTop: 'var(--lf-space-2)',
            fontSize: 'var(--lf-type-caption)',
            color: 'var(--lf-color-text-muted)',
            maxWidth: 'calc(var(--lf-space-8) * 3)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            marginInline: 'auto',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
