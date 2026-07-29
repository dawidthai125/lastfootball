import Link from 'next/link';

import { EmptyState, LocationHero } from '@/components/ui';
import { formatMoney, type ClubFinanceDto, type FinanceMovementDto } from '@/lib/finance';
import { UI_COPY } from '@/lib/ui/copy';

import './finance-decision.css';

function amountClass(amount: number): string {
  return amount >= 0 ? 'lf-fi__amount--in' : 'lf-fi__amount--out';
}

function formatSignedAmount(amount: number): string {
  return `${amount >= 0 ? '+' : ''}${formatMoney(amount)}`;
}

function lastMovementSummary(m: FinanceMovementDto | null): string {
  if (!m) return 'brak';
  return `${formatSignedAmount(m.amount)} · ${m.label}`;
}

/**
 * Finances Experience — LFE-UI-IMPL-03 / HF-FIN-01.
 * Decision-first; economy / DTO unchanged.
 */
export function FinanceView({ finance }: { finance: ClubFinanceDto }) {
  const movements = finance.recentMovements;
  const hasMovements = movements.length > 0;
  const needsReaction = Boolean(finance.lastMovement && finance.lastMovement.amount < 0);
  const primaryLabel = needsReaction ? 'Przejdź do transferów' : 'Zobacz rynek transferowy';

  return (
    <div className="lf-fi" data-lf-impl="LFE-UI-IMPL-03">
      <LocationHero waId="HERO-007" src="/assets/world-art/hero-007-finance-ledger.png" priority />

      <header className="lf-fi__hero">
        <p className="lf-fi__eyebrow">Finanse</p>
        <p className="lf-fi__cash">{finance.cashLabel}</p>
        <h1 className="lf-fi__question">Czy moja sytuacja finansowa wymaga dziś reakcji?</h1>
        <p className="lf-fi__currency">{finance.currency}</p>
      </header>

      <div className="lf-fi__cta-wrap">
        <Link href="/transfers" className="lf-fi__primary">
          {primaryLabel}
        </Link>
        <Link href="/hub" className="lf-fi__secondary">
          {UI_COPY.hubExit}
        </Link>
      </div>

      <section className="lf-fi__status" aria-labelledby="lf-fi-status-label">
        <p id="lf-fi-status-label" className="lf-fi__status-label">
          Podsumowanie
        </p>
        <p className="lf-fi__status-line">
          Budżet transferowy <strong>{finance.envelopeLabel}</strong>
          {' · '}
          Ostatnia operacja <strong>{lastMovementSummary(finance.lastMovement)}</strong>
        </p>
      </section>

      <section className="lf-fi__browse" aria-labelledby="lf-fi-browse-title">
        <h2 id="lf-fi-browse-title" className="lf-fi__browse-title">
          Ostatnie operacje
        </h2>

        {!hasMovements ? (
          <EmptyState
            waId="EMP-003"
            illustrationSrc="/assets/world-art/emp-003-blank-ledger.png"
            title="Księga jeszcze pusta"
            body="Brak zapisanych operacji. Gdy pojawi się ruch kasowy, zobaczysz go tutaj — decyzje transferowe podejmiesz na rynku."
            links={[{ href: '/transfers', label: 'Transfery' }]}
          />
        ) : (
          <>
            <ul className="lf-fi__cards">
              {movements.map((m) => (
                <li key={m.id} className="lf-fi__card">
                  <span className="lf-fi__card-when">{m.createdAt.slice(0, 10)}</span>
                  <span className="lf-fi__card-desc">{m.label}</span>
                  <span className={`lf-fi__card-amount ${amountClass(m.amount)}`}>
                    {formatSignedAmount(m.amount)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="lf-fi__table-wrap">
              <table className="lf-fi__table">
                <thead>
                  <tr>
                    <th>Kiedy</th>
                    <th>Opis</th>
                    <th>Kwota</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id}>
                      <td className="tabular-nums" style={{ color: 'var(--lf-color-text-faint)' }}>
                        {m.createdAt.slice(0, 10)}
                      </td>
                      <td>{m.label}</td>
                      <td className={`tabular-nums ${amountClass(m.amount)}`}>
                        {formatSignedAmount(m.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
