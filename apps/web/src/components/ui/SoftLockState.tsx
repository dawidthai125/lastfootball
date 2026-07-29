import Image from 'next/image';
import Link from 'next/link';

import { UI_COPY } from '@/lib/ui/copy';

import './domain-states.css';

type SoftLockStateProps = {
  waId: string;
  illustrationSrc: string;
  title: string;
  reason: string;
  unlockHint?: string | null;
  hubHref?: string;
  hubLabel?: string;
  secondaryHref?: string;
  secondaryLabel?: string;
};

/**
 * SoftLockState — HF-TRN-02 / HF-XFR-03.
 * Art ILL-* + ICO-020 · wyjście Hub — bez fałszywego „Odblokuj”.
 */
export function SoftLockState({
  waId,
  illustrationSrc,
  title,
  reason,
  unlockHint = null,
  hubHref = '/hub',
  hubLabel = UI_COPY.hubExit,
  secondaryHref,
  secondaryLabel,
}: SoftLockStateProps) {
  return (
    <div className="lf-sl" data-wa={waId} data-lf-impl="LFE-UI-IMPL-03" role="status">
      <div className="lf-sl__art">
        <Image
          className="lf-sl__ill"
          src={illustrationSrc}
          alt=""
          width={640}
          height={360}
          sizes="(max-width: 767px) 100vw, 640px"
        />
        <Image
          className="lf-sl__lock"
          src="/assets/world-art/ico-020-lock.png"
          alt=""
          width={40}
          height={40}
          data-wa="ICO-020"
        />
      </div>
      <h1 className="lf-sl__title">{title}</h1>
      <p className="lf-sl__reason">{reason}</p>
      {unlockHint ? <p className="lf-sl__hint">{unlockHint}</p> : null}
      <div className="lf-sl__actions">
        <Link href={hubHref} className="lf-sl__hub">
          {hubLabel}
        </Link>
        {secondaryHref && secondaryLabel ? (
          <Link href={secondaryHref} className="lf-sl__soft">
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
