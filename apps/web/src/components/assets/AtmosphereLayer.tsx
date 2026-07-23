import type { CSSProperties, ReactNode } from 'react';

import { textureSrc } from '@/assets';

type AtmosphereLayerProps = {
  children?: ReactNode;
  /** Which texture layers to stack (token-aligned SVG overlays) */
  layers?: Array<'floodlight' | 'vignette' | 'grain'>;
  className?: string;
  style?: CSSProperties;
  /** Accessible name for the section wrapper */
  'aria-label'?: string;
};

/**
 * Night-matchday atmosphere for Hero / Matchday / Live hosts.
 * Uses pack-01 textures; no gameplay side effects.
 */
export function AtmosphereLayer({
  children,
  layers = ['floodlight', 'vignette', 'grain'],
  className,
  style,
  'aria-label': ariaLabel,
}: AtmosphereLayerProps) {
  return (
    <div
      className={className}
      aria-label={ariaLabel}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style,
      }}
    >
      {layers.map((id) => (
        <div
          key={id}
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 0,
            backgroundImage: `url(${textureSrc(id)})`,
            backgroundSize: id === 'grain' ? '160px 160px' : 'cover',
            backgroundRepeat: id === 'grain' ? 'repeat' : 'no-repeat',
            backgroundPosition: 'center',
            opacity: id === 'grain' ? 0.35 : 1,
            mixBlendMode: id === 'grain' ? 'overlay' : 'normal',
          }}
        />
      ))}
      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>
    </div>
  );
}
