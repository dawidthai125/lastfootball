import Link from 'next/link';

import { formatMoney, type ClubFinanceDto, type FinanceMovementDto } from '@/lib/finance';

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
 * Finances Experience — LFE-UI-EVOLUTION-01H.
 * Decision-first presentation; economy / DTO unchanged (D5 / D8).
 */
export function FinanceView({ finance }: { finance: ClubFinanceDto }) {
  const movements = finance.recentMovements;
  const hasMovements = movements.length > 0;
  /** Presentation-only calm heuristic (D8) — no domain change. */
  const needsReaction = Boolean(finance.lastMovement && finance.lastMovement.amount < 0);
  const primaryLabel = needsReaction ? 'Przejdź do transferów' : 'Zobacz rynek transferowy';

  return (
    <div className="lf-fi">
      {/* M1 — Hero: saldo + pytanie (D2); no KPI wall (D7) */}
      <header className="lf-fi__hero">
        <p className="lf-fi__eyebrow">Finanse</p>
        <p className="lf-fi__cash">{finance.cashLabel}</p>
        <h1 className="lf-fi__question">Czy moja sytuacja finansowa wymaga dziś reakcji?</h1>
        <p className="lf-fi__currency">{finance.currency}</p>
      </header>

      {/* M2 — Primary CTA deep-link Transfers (D1 / D8) */}
      <div className="lf-fi__cta-wrap">
        <Link href="/transfers" className="lf-fi__primary">
          {primaryLabel}
        </Link>
        <Link href="/hub" className="lf-fi__secondary">
          Wróć do Hub
        </Link>
      </div>

      {/* M2 — Status Summary before history (D3) */}
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

      {/* M3 / M4 — History browse + empty state (D4 / D6) */}
      <section className="lf-fi__browse" aria-labelledby="lf-fi-browse-title">
        <h2 id="lf-fi-browse-title" className="lf-fi__browse-title">
          Ostatnie operacje
        </h2>

        {!hasMovements ? (
          <p className="lf-fi__empty">
            Brak zapisanych operacji. Gdy pojawi się ruch kasowy, zobaczysz go tutaj — decyzje
            transferowe podejmiesz na rynku.
          </p>
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
