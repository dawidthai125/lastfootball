import Image from 'next/image';
import Link from 'next/link';

import { matchVsPath } from '@/lib/match/match-path';

import './match-path.css';

/**
 * HF-MCH-01 Tunnel — immersive entry (nav off via AppShell).
 */
export function MatchTunnelView({
  matchId,
  opponentLabel,
}: {
  matchId: string;
  opponentLabel: string;
}) {
  return (
    <div className="lf-mp lf-mp--immersive" data-lf-impl="LFE-UI-IMPL-02" data-mch="SCR-MCH-01">
      <div className="lf-mp__hero" data-wa="HERO-002">
        <Image
          className="lf-mp__hero-img lf-mp__hero-img--desktop"
          src="/assets/world-art/hero-002-tunnel-night.png"
          alt=""
          fill
          sizes="(max-width: 767px) 0px, 100vw"
          priority
        />
        <Image
          className="lf-mp__hero-img lf-mp__hero-img--mobile"
          src="/assets/world-art/hero-002-tunnel-mobile.png"
          alt=""
          fill
          sizes="(min-width: 768px) 0px, 100vw"
          priority
        />
        <div className="lf-mp__veil" />
      </div>
      <div className="lf-mp__decision">
        <p className="lf-mp__eyebrow">Tunel</p>
        <h1 className="lf-mp__title">Wejdź na boisko</h1>
        <p className="lf-mp__support">Immersyjne wejście w mecz · vs {opponentLabel}</p>
        <Link href={matchVsPath(matchId)} className="lf-mp__primary">
          Wejdź
        </Link>
      </div>
    </div>
  );
}
