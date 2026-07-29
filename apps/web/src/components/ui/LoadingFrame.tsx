import Image from 'next/image';

import './domain-states.css';

type LoadingFrameProps = {
  waId?: string;
  illustrationSrc?: string;
  label?: string;
};

/** LoadingFrame — LOD-* / skeleton inset (STATE-SPECS §2). */
export function LoadingFrame({
  waId = 'LOD',
  illustrationSrc,
  label = 'Ładowanie…',
}: LoadingFrameProps) {
  return (
    <div className="lf-ld" data-wa={waId} role="status" aria-busy="true" aria-live="polite">
      {illustrationSrc ? (
        <Image
          className="lf-ld__ill"
          src={illustrationSrc}
          alt=""
          width={640}
          height={200}
          sizes="100vw"
          priority
        />
      ) : null}
      <div className="lf-ld__skeleton" aria-hidden>
        <div className="lf-ld__bar lf-ld__bar--wide" />
        <div className="lf-ld__bar" />
        <div className="lf-ld__bar lf-ld__bar--short" />
      </div>
      <p className="lf-ld__label">{label}</p>
    </div>
  );
}
