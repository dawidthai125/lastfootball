import Image from 'next/image';

import './domain-states.css';

type LocationHeroProps = {
  waId: string;
  src: string;
  mobileSrc?: string;
  className?: string;
  priority?: boolean;
};

/**
 * LocationHero — LFE-UI-IMPL-03 / Hi-Fi LocationHero.
 * Full-bleed WA plane; no overlay copy on art.
 */
export function LocationHero({
  waId,
  src,
  mobileSrc,
  className = '',
  priority = false,
}: LocationHeroProps) {
  const hasMobile = Boolean(mobileSrc);
  return (
    <div className={`lf-dh${className ? ` ${className}` : ''}`} data-wa={waId} aria-hidden>
      <Image
        className={hasMobile ? 'lf-dh__img lf-dh__img--desktop' : 'lf-dh__img lf-dh__img--single'}
        src={src}
        alt=""
        fill
        sizes={hasMobile ? '(max-width: 767px) 0px, 100vw' : '100vw'}
        priority={priority}
      />
      {hasMobile && mobileSrc ? (
        <Image
          className="lf-dh__img lf-dh__img--mobile"
          src={mobileSrc}
          alt=""
          fill
          sizes="(min-width: 768px) 0px, 100vw"
          priority={priority}
        />
      ) : null}
      <div className="lf-dh__veil" />
    </div>
  );
}
