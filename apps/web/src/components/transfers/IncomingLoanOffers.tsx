'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/Button';
import { formatMoney } from '@/lib/finance/format-money';
import { acceptIncomingLoan, type IncomingLoanState } from '@/lib/squad/actions-loan-incoming';
import type { IncomingLoanOffer } from '@/lib/squad/incoming-loan';
import { polishDay } from '@/lib/ui/polish-day';

const INITIAL: IncomingLoanState = {};

export function IncomingLoanOffers({ offers }: { offers: readonly IncomingLoanOffer[] }) {
  const [state, action, pending] = useActionState(acceptIncomingLoan, INITIAL);
  if (offers.length === 0) return null;
  return (
    <section className="lf-tx__section" aria-labelledby="tx-loan-in-title">
      <h2 id="tx-loan-in-title" className="lf-tx__section-title">
        Wypożyczenia przychodzące
      </h2>
      {state.error ? (
        <p className="lf-tx__meta" role="alert">
          {state.error}
        </p>
      ) : null}
      <ul className="lf-tx__inbox">
        {offers.map((offer) => (
          <li key={offer.offerId}>
            <div>
              <strong>{offer.name}</strong> · {offer.pos} · {offer.skill} · {offer.partnerLabel}
              <div className="lf-tx__meta">
                Pensja {formatMoney(offer.wage)} · ważny do {polishDay(offer.until)}
              </div>
            </div>
            <form action={action}>
              <input type="hidden" name="offerId" value={offer.offerId} />
              <Button type="submit" disabled={pending}>
                Weź na wypożyczenie
              </Button>
            </form>
          </li>
        ))}
      </ul>
    </section>
  );
}
