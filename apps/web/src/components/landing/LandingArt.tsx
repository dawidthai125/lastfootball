import Image from 'next/image';

type LandingArtProps = {
  /** Public path under /assets/world-art/ */
  desktopSrc: string;
  mobileSrc?: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  priority?: boolean;
  /** data-wa attribute for QA / WA index */
  waId?: string;
};

/**
 * Full-bleed / band World Art — existing assets only (no new illustrations).
 */
export function LandingArt({
  desktopSrc,
  mobileSrc,
  alt,
  className = '',
  imgClassName = '',
  priority = false,
  waId,
}: LandingArtProps) {
  return (
    <div className={['lf-landing__art', className].filter(Boolean).join(' ')} data-wa={waId}>
      {mobileSrc ? (
        <>
          <Image
            src={desktopSrc}
            alt={alt}
            fill
            sizes="(max-width: 767px) 0px, 100vw"
            className={['lf-landing__art-img', 'lf-landing__art-img--desktop', imgClassName]
              .filter(Boolean)
              .join(' ')}
            priority={priority}
          />
          <Image
            src={mobileSrc}
            alt=""
            fill
            sizes="(max-width: 767px) 100vw, 0px"
            className={['lf-landing__art-img', 'lf-landing__art-img--mobile', imgClassName]
              .filter(Boolean)
              .join(' ')}
            priority={priority}
            aria-hidden
          />
        </>
      ) : (
        <Image
          src={desktopSrc}
          alt={alt}
          fill
          sizes="100vw"
          className={['lf-landing__art-img', imgClassName].filter(Boolean).join(' ')}
          priority={priority}
        />
      )}
    </div>
  );
}
