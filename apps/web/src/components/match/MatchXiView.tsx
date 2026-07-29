'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { PlayerPortrait } from '@/components/assets';
import { LocationHero, StateBanner } from '@/components/ui';
import { saveStartingXi, SAVE_XI_INITIAL } from '@/lib/squad/actions';
import { STATUS_LABEL, type SquadPlayerDto } from '@/lib/squad';
import {
  applyXiSelection,
  sortXiPlayers,
  validateStartingXi,
} from '@/lib/squad/validate-starting-xi';
import { matchLivePath, matchPrePath } from '@/lib/match/match-path';
import { UI_COPY } from '@/lib/ui/copy';

import './match-xi.css';

/**
 * SCR-SQD-04 / HF-SQD-04 — Match XI composition (Match Path only).
 */
export function MatchXiView({
  matchId,
  players: initialPlayers,
}: {
  matchId: string;
  players: readonly SquadPlayerDto[];
}) {
  const router = useRouter();
  const [players, setPlayers] = useState(() => initialPlayers.map((p) => ({ ...p })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [state, action, pending] = useActionState(saveStartingXi, SAVE_XI_INITIAL);

  const starters = useMemo(
    () => sortXiPlayers(players.filter((p) => p.starter && p.status !== 'DEPARTED')),
    [players],
  );
  const bench = useMemo(
    () => sortXiPlayers(players.filter((p) => !p.starter && p.status !== 'DEPARTED')),
    [players],
  );
  const validation = useMemo(() => validateStartingXi(starters), [starters]);

  useEffect(() => {
    if (state.ok) {
      router.push(matchLivePath(matchId));
    }
  }, [state.ok, matchId, router]);

  function onTap(id: string) {
    const next = applyXiSelection(players, selectedId, id);
    setPlayers(next.players);
    setSelectedId(next.selectedId);
  }

  return (
    <div className="lf-xi" data-lf-impl="LFE-UI-IMPL-05" data-scr="SCR-SQD-04">
      <LocationHero waId="HERO-004" src="/assets/world-art/hero-004-locker-night.png" priority />

      <header className="lf-xi__decision">
        <p className="lf-xi__eyebrow">Skład</p>
        <h1 className="lf-xi__title">{UI_COPY.lineupTitle}</h1>
        <p className="lf-xi__meta">
          XI {starters.length}/11
          {validation.hasGoalkeeper ? '' : ' · brak bramkarza'}
          {selectedId ? ' · wybierz drugiego zawodnika do wymiany' : ' · tapnij zawodnika'}
        </p>
      </header>

      {validation.errors.length > 0 ? (
        <StateBanner tone="error">{validation.errors.join(' ')}</StateBanner>
      ) : null}
      {validation.warnings.length > 0 ? (
        <StateBanner tone="info">{validation.warnings.join(' ')}</StateBanner>
      ) : null}
      {state.error ? <StateBanner tone="error">{state.error}</StateBanner> : null}

      <form action={action} className="lf-xi__cta">
        <input type="hidden" name="matchId" value={matchId} />
        <input type="hidden" name="starterIds" value={starters.map((p) => p.id).join(',')} />
        <button type="submit" className="lf-xi__primary" disabled={!validation.ok || pending}>
          {pending ? UI_COPY.saving : UI_COPY.saveAndContinue}
        </button>
        <Link href={matchPrePath(matchId)} className="lf-xi__soft">
          {UI_COPY.backToChecklist}
        </Link>
      </form>

      <section className="lf-xi__block" aria-labelledby="lf-xi-starters-title">
        <h2 id="lf-xi-starters-title" className="lf-xi__block-title">
          Wyjściowa 11
        </h2>
        <ul className="lf-xi__list">
          {starters.map((p) => (
            <XiRow
              key={p.id}
              player={p}
              slot="xi"
              selected={selectedId === p.id}
              onSelect={() => onTap(p.id)}
            />
          ))}
          {starters.length < 11
            ? Array.from({ length: 11 - starters.length }).map((_, i) => (
                <li key={`empty-${i}`} className="lf-xi__row lf-xi__row--empty">
                  <span className="lf-xi__empty-label">Wolny slot</span>
                </li>
              ))
            : null}
        </ul>
      </section>

      <section className="lf-xi__block" aria-labelledby="lf-xi-bench-title">
        <h2 id="lf-xi-bench-title" className="lf-xi__block-title lf-xi__block-title--muted">
          Ławka / rezerwa
        </h2>
        <ul className="lf-xi__list">
          {bench.map((p) => (
            <XiRow
              key={p.id}
              player={p}
              slot="bench"
              selected={selectedId === p.id}
              onSelect={() => onTap(p.id)}
            />
          ))}
          {bench.length === 0 ? (
            <li className="lf-xi__row lf-xi__row--empty">
              <span className="lf-xi__empty-label">Brak zawodników na ławce</span>
            </li>
          ) : null}
        </ul>
      </section>
    </div>
  );
}

function XiRow({
  player,
  slot,
  selected,
  onSelect,
}: {
  player: SquadPlayerDto;
  slot: 'xi' | 'bench';
  selected: boolean;
  onSelect: () => void;
}) {
  const warn = player.status === 'INJURED' || player.status === 'SUSPENDED';
  return (
    <li>
      <button
        type="button"
        className={[
          'lf-xi__row',
          slot === 'xi' ? 'lf-xi__row--starter' : '',
          selected ? 'lf-xi__row--selected' : '',
          warn ? 'lf-xi__row--warn' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={`${player.name}, ${player.position}, ${STATUS_LABEL[player.status]}`}
      >
        <PlayerPortrait playerId={player.id} name={player.name} size="sm" />
        <span className="lf-xi__row-body">
          <span className="lf-xi__row-name">
            {player.name}
            {player.captain ? <span className="lf-xi__cap">C</span> : null}
          </span>
          <span className="lf-xi__row-meta">
            {player.position} · {STATUS_LABEL[player.status]} · {player.skill}
          </span>
        </span>
        <span className="lf-xi__row-slot">{slot === 'xi' ? 'XI' : 'Ław'}</span>
      </button>
    </li>
  );
}
