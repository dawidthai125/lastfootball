'use client';

import { useActionState } from 'react';
import Link from 'next/link';

import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { formatMoney } from '@/lib/finance/format-money';
import {
  acceptLiveTransferOffer,
  buyLiveTransferPlayer,
  buyTransferPlayer,
  counterLiveTransferOffer,
  createLiveTransferOffer,
  rejectLiveTransferOffer,
  respondIncomingOffer,
  sellTransferPlayer,
  setTransferListing,
  withdrawLiveTransferOffer,
} from '@/lib/transfers/actions';
import { TRANSFER_ACTION_INITIAL } from '@/lib/transfers/action-types';
import {
  resolveCounterAmount,
  resolveOfferAmount,
  type OfferPreset,
} from '@/lib/transfers/resolve-negotiation';
import type {
  IncomingOfferDto,
  LiveH2hOfferDto,
  LiveListingDto,
  SellCandidateDto,
  TransferMarketDto,
} from '@/lib/transfers/types';

import './transfers-decision.css';

const PRESET_LABEL: Record<OfferPreset, string> = {
  low: 'Niska',
  normal: 'Normalna',
  high: 'Wysoka',
};

/** Player-facing labels (amounts remain in title / formatMoney). */
const OFFER_PRESET_LABEL: Record<OfferPreset | 'counter', string> = {
  low: 'Niska',
  normal: 'Normalna',
  high: 'Wysoka',
  counter: 'Kontrpropozycja',
};

function BuyNegotiate({
  marketId,
  ask,
  canBuy,
  envelopeBalance,
}: {
  marketId: string;
  ask: number;
  canBuy: boolean;
  envelopeBalance: number;
}) {
  const [state, action, pending] = useActionState(buyTransferPlayer, TRANSFER_ACTION_INITIAL);
  const counter = state.negotiation?.marketId === marketId ? state.negotiation : null;

  if (counter) {
    const canAccept = canBuy && envelopeBalance >= counter.counterAmount;
    return (
      <div className="lf-tx-actions">
        <p className="lf-tx-actions__hint">
          Kontroferta:{' '}
          <span className="text-[var(--lf-gold)] tabular-nums">
            {formatMoney(counter.counterAmount)}
          </span>
        </p>
        {state.error ? (
          <span className="text-xs text-[var(--lf-danger)]" role="alert">
            {state.error}
          </span>
        ) : null}
        <div className="lf-tx-actions__row">
          <form action={action} className="inline">
            <input type="hidden" name="marketId" value={marketId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="playerAction" value="accept" />
            <Button type="submit" variant="primary" disabled={!canAccept || pending}>
              {pending ? '…' : 'Akceptuj'}
            </Button>
          </form>
          <form action={action} className="inline">
            <input type="hidden" name="marketId" value={marketId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="playerAction" value="reject" />
            <Button type="submit" variant="default" disabled={pending}>
              Odrzuć
            </Button>
          </form>
        </div>
      </div>
    );
  }

  const presets: OfferPreset[] = ['low', 'normal', 'high'];

  return (
    <div className="lf-tx-actions">
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <div className="lf-tx-actions__row">
        {presets.map((preset) => {
          const offer =
            preset === 'low' ? resolveCounterAmount(ask) : resolveOfferAmount(ask, preset);
          const disabled = !canBuy || envelopeBalance < offer || pending;
          return (
            <form key={preset} action={action} className="inline">
              <input type="hidden" name="marketId" value={marketId} />
              <input type="hidden" name="phase" value="opening" />
              <input type="hidden" name="preset" value={preset} />
              <Button
                type="submit"
                variant={preset === 'normal' ? 'primary' : 'default'}
                disabled={disabled}
                title={formatMoney(resolveOfferAmount(ask, preset))}
              >
                {PRESET_LABEL[preset]}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function SellButton({ playerId, disabled }: { playerId: string; disabled: boolean }) {
  const [state, action, pending] = useActionState(sellTransferPlayer, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={playerId} />
      {state.error ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={disabled || pending}>
        {pending ? '…' : 'Sprzedaj'}
      </Button>
    </form>
  );
}

function ListingButton({
  playerId,
  listed,
  disabled,
}: {
  playerId: string;
  listed: boolean;
  disabled?: boolean;
}) {
  const [state, action, pending] = useActionState(setTransferListing, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={playerId} />
      <input type="hidden" name="intent" value={listed ? 'unlist' : 'list'} />
      {state.error ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={Boolean(disabled) || pending}>
        {pending ? '…' : listed ? 'Z listy' : 'Wystaw'}
      </Button>
    </form>
  );
}

function SellActions({ row, canSell }: { row: SellCandidateDto; canSell: boolean }) {
  return (
    <div className="lf-tx-actions__row">
      <ListingButton
        playerId={row.playerId}
        listed={row.listed}
        disabled={!canSell && !row.listed}
      />
      <SellButton playerId={row.playerId} disabled={!canSell} />
    </div>
  );
}

function IncomingOfferActions({ offer, disabled }: { offer: IncomingOfferDto; disabled: boolean }) {
  const [state, action, pending] = useActionState(respondIncomingOffer, TRANSFER_ACTION_INITIAL);
  const counter =
    state.sellerNegotiation?.offerId === offer.offerId ? state.sellerNegotiation : null;

  if (counter) {
    return (
      <div className="lf-tx-actions">
        <p className="lf-tx-actions__hint">
          Twoja kontroferta:{' '}
          <span className="text-[var(--lf-gold)] tabular-nums">
            {formatMoney(counter.counterAmount)}
          </span>
        </p>
        {state.error ? (
          <span className="text-xs text-[var(--lf-danger)]" role="alert">
            {state.error}
          </span>
        ) : null}
        <div className="lf-tx-actions__row">
          <form action={action} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <input type="hidden" name="playerId" value={offer.playerId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="decision" value="accept" />
            <Button type="submit" variant="primary" disabled={disabled || pending}>
              {pending ? '…' : 'Akceptuj'}
            </Button>
          </form>
          <form action={action} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <input type="hidden" name="playerId" value={offer.playerId} />
            <input type="hidden" name="phase" value="counter" />
            <input type="hidden" name="decision" value="reject" />
            <Button type="submit" variant="default" disabled={pending}>
              Odrzuć
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="lf-tx-actions">
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <div className="lf-tx-actions__row">
        <form action={action} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <input type="hidden" name="playerId" value={offer.playerId} />
          <input type="hidden" name="phase" value="opening" />
          <input type="hidden" name="decision" value="accept" />
          <Button type="submit" variant="primary" disabled={disabled || pending}>
            {pending ? '…' : 'Akceptuj'}
          </Button>
        </form>
        {offer.canCounter ? (
          <form action={action} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <input type="hidden" name="playerId" value={offer.playerId} />
            <input type="hidden" name="phase" value="opening" />
            <input type="hidden" name="decision" value="counter" />
            <Button type="submit" variant="default" disabled={disabled || pending}>
              Kontroferta
            </Button>
          </form>
        ) : null}
        <form action={action} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <input type="hidden" name="playerId" value={offer.playerId} />
          <input type="hidden" name="phase" value="opening" />
          <input type="hidden" name="decision" value="reject" />
          <Button type="submit" variant="default" disabled={pending}>
            Odrzuć
          </Button>
        </form>
      </div>
    </div>
  );
}

function LiveBuyButton({ listing, disabled }: { listing: LiveListingDto; disabled: boolean }) {
  const [state, action, pending] = useActionState(buyLiveTransferPlayer, TRANSFER_ACTION_INITIAL);
  return (
    <form action={action} className="inline">
      <input type="hidden" name="playerId" value={listing.playerId} />
      <input type="hidden" name="sellerClubId" value={listing.sellerClubId} />
      {state.error ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <Button type="submit" variant="primary" disabled={disabled || pending}>
        {pending ? '…' : 'Kup od razu'}
      </Button>
    </form>
  );
}

function LiveOfferCreate({
  listing,
  disabled,
  envelopeBalance,
}: {
  listing: LiveListingDto;
  disabled: boolean;
  envelopeBalance: number;
}) {
  const [state, action, pending] = useActionState(createLiveTransferOffer, TRANSFER_ACTION_INITIAL);
  const presets: Array<OfferPreset | 'counter'> = ['low', 'counter', 'normal', 'high'];
  return (
    <div className="lf-tx-actions">
      {state.error ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {state.error}
        </span>
      ) : null}
      <div className="lf-tx-actions__row">
        {presets.map((preset) => {
          const amount =
            preset === 'counter'
              ? resolveCounterAmount(listing.ask)
              : resolveOfferAmount(listing.ask, preset);
          return (
            <form key={preset} action={action} className="inline">
              <input type="hidden" name="playerId" value={listing.playerId} />
              <input type="hidden" name="sellerClubId" value={listing.sellerClubId} />
              <input type="hidden" name="preset" value={preset} />
              <Button
                type="submit"
                variant={preset === 'normal' ? 'primary' : 'default'}
                disabled={disabled || pending || envelopeBalance < amount}
                title={formatMoney(amount)}
              >
                {OFFER_PRESET_LABEL[preset]}
              </Button>
            </form>
          );
        })}
      </div>
    </div>
  );
}

function IncomingH2hActions({ offer, disabled }: { offer: LiveH2hOfferDto; disabled: boolean }) {
  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const [counterState, counterAction, counterPending] = useActionState(
    counterLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const err = acceptState.error || rejectState.error || counterState.error;
  const pending = acceptPending || rejectPending || counterPending;

  if (offer.phase === 'countered') {
    return <p className="lf-tx-actions__hint">Oczekiwanie na kupującego</p>;
  }

  const presets: Array<OfferPreset | 'counter'> = ['low', 'counter', 'normal', 'high'];

  return (
    <div className="lf-tx-actions">
      {err ? (
        <span className="text-xs text-[var(--lf-danger)]" role="alert">
          {err}
        </span>
      ) : null}
      <div className="lf-tx-actions__row">
        <form action={acceptAction} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <Button type="submit" variant="primary" disabled={disabled || pending}>
            {acceptPending ? '…' : 'Akceptuj'}
          </Button>
        </form>
        <form action={rejectAction} className="inline">
          <input type="hidden" name="offerId" value={offer.offerId} />
          <Button type="submit" variant="default" disabled={pending}>
            Odrzuć
          </Button>
        </form>
      </div>
      <div className="lf-tx-actions__row">
        {presets.map((preset) => (
          <form key={preset} action={counterAction} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <input type="hidden" name="preset" value={preset} />
            <Button
              type="submit"
              variant="default"
              disabled={disabled || pending}
              title={`Kontroferta: ${OFFER_PRESET_LABEL[preset]}`}
            >
              {OFFER_PRESET_LABEL[preset]}
            </Button>
          </form>
        ))}
      </div>
    </div>
  );
}

function OutgoingH2hActions({
  offer,
  disabled,
  envelopeBalance,
}: {
  offer: LiveH2hOfferDto;
  disabled: boolean;
  envelopeBalance: number;
}) {
  const [withdrawState, withdrawAction, withdrawPending] = useActionState(
    withdrawLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const [acceptState, acceptAction, acceptPending] = useActionState(
    acceptLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const [rejectState, rejectAction, rejectPending] = useActionState(
    rejectLiveTransferOffer,
    TRANSFER_ACTION_INITIAL,
  );
  const err = withdrawState.error || acceptState.error || rejectState.error;
  const pending = withdrawPending || acceptPending || rejectPending;

  if (offer.phase === 'countered') {
    return (
      <div className="lf-tx-actions">
        {err ? (
          <span className="text-xs text-[var(--lf-danger)]" role="alert">
            {err}
          </span>
        ) : null}
        <p className="lf-tx-actions__hint">Kontrpropozycja sprzedawcy</p>
        <div className="lf-tx-actions__row">
          <form action={acceptAction} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <Button
              type="submit"
              variant="primary"
              disabled={disabled || pending || envelopeBalance < offer.amount}
            >
              {acceptPending ? '…' : 'Akceptuj'}
            </Button>
          </form>
          <form action={rejectAction} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <Button type="submit" variant="default" disabled={pending}>
              Odrzuć
            </Button>
          </form>
          <form action={withdrawAction} className="inline">
            <input type="hidden" name="offerId" value={offer.offerId} />
            <Button type="submit" variant="default" disabled={pending}>
              Wycofaj
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <form action={withdrawAction} className="inline">
      <input type="hidden" name="offerId" value={offer.offerId} />
      {err ? (
        <span className="mr-1 text-xs text-[var(--lf-danger)]" role="alert">
          {err}
        </span>
      ) : null}
      <Button type="submit" variant="default" disabled={pending}>
        {pending ? '…' : 'Wycofaj'}
      </Button>
    </form>
  );
}

type DecisionCase =
  | { kind: 'ai'; offer: IncomingOfferDto }
  | { kind: 'h2h-in'; offer: LiveH2hOfferDto }
  | { kind: 'h2h-out-countered'; offer: LiveH2hOfferDto };

/**
 * Transfer Command Center — LFE-UI-EVOLUTION-01D (presentation only).
 * Actions / DTO / resolvers unchanged.
 */
export function TransfersView({ market }: { market: TransferMarketDto }) {
  const outgoingOpening = market.outgoingLiveOffers.filter((o) => o.phase === 'opening');
  const outgoingCountered = market.outgoingLiveOffers.filter((o) => o.phase === 'countered');

  const inbox: DecisionCase[] = [
    ...market.incomingOffers.map((offer) => ({ kind: 'ai' as const, offer })),
    ...market.incomingLiveOffers.map((offer) => ({ kind: 'h2h-in' as const, offer })),
    ...outgoingCountered.map((offer) => ({ kind: 'h2h-out-countered' as const, offer })),
  ];

  const windowLabel = market.windowOpen ? 'Okno otwarte' : 'Okno zamknięte';

  return (
    <div className="lf-tx" data-pti="PTI-01-XFR-02-M" data-lf-impl="LFE-UI-IMPL-01">
      {/* A — context line (no KPI wall) */}
      <p className="lf-tx__context" aria-label="Kontekst transferów">
        {windowLabel}
        <span className="lf-tx__dot" aria-hidden>
          ·
        </span>
        Kasa {market.cashLabel}
        <span className="lf-tx__dot" aria-hidden>
          ·
        </span>
        Budżet {market.envelopeLabel}
      </p>

      {!market.windowOpen ? (
        <p className="lf-tx__note">
          Okno transferowe jest zamknięte. Możesz przeglądać oferty i rynek, ale finalizacja
          transakcji jest niedostępna. Wróć po kolejnych meczach ligowych.
        </p>
      ) : null}

      <nav className="lf-tx__soft-nav" aria-label="Powiązane ekrany">
        <Link href="/finance" className="lf-tx__soft-link">
          Finanse
        </Link>
        <Link href="/squad" className="lf-tx__soft-link">
          Kadra
        </Link>
      </nav>

      {/* B — Inbox */}
      <section className="lf-tx__section" aria-labelledby="tx-inbox-title">
        <h2 id="tx-inbox-title" className="lf-tx__section-title">
          Sprawy wymagające decyzji
        </h2>

        {inbox.length === 0 ? (
          <div className="lf-tx__empty">
            <p className="lf-tx__empty-title">Brak spraw do zamknięcia</p>
            <p className="lf-tx__empty-body">
              Nie czekają na Ciebie żadne oferty. Możesz przejść do rynku i poszukać wzmocnienia.
            </p>
            {/* D7: jedyne dominant CTA gdy Inbox pusty */}
            <a href="#transfer-market" className="lf-tx__primary-cta">
              Przejrzyj rynek
            </a>
          </div>
        ) : (
          <ul className="lf-tx__inbox">
            {inbox.map((item) => {
              if (item.kind === 'ai') {
                const o = item.offer;
                return (
                  <li key={`ai-${o.offerId}`} className="lf-tx__case">
                    <div className="lf-tx__case-main">
                      <p className="lf-tx__case-label">Oferta za Twojego zawodnika</p>
                      <p className="lf-tx__case-title">{o.playerName}</p>
                      <p className="lf-tx__case-meta">
                        {o.pos} · {o.buyerLabel} ·{' '}
                        <span className="text-[var(--lf-gold)] tabular-nums">{o.amountLabel}</span>
                      </p>
                    </div>
                    <IncomingOfferActions
                      offer={o}
                      disabled={!market.windowOpen || !market.canSell}
                    />
                  </li>
                );
              }
              if (item.kind === 'h2h-in') {
                const o = item.offer;
                return (
                  <li key={`in-${o.offerId}`} className="lf-tx__case">
                    <div className="lf-tx__case-main">
                      <p className="lf-tx__case-label">Oferta od klubu</p>
                      <p className="lf-tx__case-title">{o.playerName}</p>
                      <p className="lf-tx__case-meta">
                        {o.counterpartLabel} ·{' '}
                        <span className="text-[var(--lf-gold)] tabular-nums">{o.amountLabel}</span>
                        {o.phase === 'countered' ? ' · kontrpropozycja wysłana' : ''}
                      </p>
                    </div>
                    <IncomingH2hActions
                      offer={o}
                      disabled={!market.windowOpen || !market.canSell}
                    />
                  </li>
                );
              }
              const o = item.offer;
              return (
                <li key={`out-c-${o.offerId}`} className="lf-tx__case">
                  <div className="lf-tx__case-main">
                    <p className="lf-tx__case-label">Kontrpropozycja — Twoja oferta</p>
                    <p className="lf-tx__case-title">{o.playerName}</p>
                    <p className="lf-tx__case-meta">
                      {o.counterpartLabel} ·{' '}
                      <span className="text-[var(--lf-gold)] tabular-nums">{o.amountLabel}</span>
                    </p>
                  </div>
                  <OutgoingH2hActions
                    offer={o}
                    disabled={!market.windowOpen || !market.canBuy}
                    envelopeBalance={market.envelopeBalance}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* C — Active negotiations (opening outgoing only) */}
      {outgoingOpening.length > 0 ? (
        <section className="lf-tx__section" aria-labelledby="tx-nego-title">
          <h2 id="tx-nego-title" className="lf-tx__section-title lf-tx__section-title--muted">
            Twoje oferty w toku
          </h2>
          <ul className="lf-tx__inbox lf-tx__inbox--muted">
            {outgoingOpening.map((o) => (
              <li key={o.offerId} className="lf-tx__case lf-tx__case--muted">
                <div className="lf-tx__case-main">
                  <p className="lf-tx__case-label">Oferta złożona — oczekujesz odpowiedzi</p>
                  <p className="lf-tx__case-title">{o.playerName}</p>
                  <p className="lf-tx__case-meta">
                    {o.counterpartLabel} ·{' '}
                    <span className="text-[var(--lf-gold)] tabular-nums">{o.amountLabel}</span>
                  </p>
                </div>
                <OutgoingH2hActions
                  offer={o}
                  disabled={!market.windowOpen || !market.canBuy}
                  envelopeBalance={market.envelopeBalance}
                />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* D — Market */}
      <section id="transfer-market" className="lf-tx__section" aria-labelledby="tx-market-title">
        <h2 id="tx-market-title" className="lf-tx__section-title lf-tx__section-title--muted">
          Rynek
        </h2>

        <h3 className="lf-tx__subhead">Zawodnicy wystawieni przez kluby</h3>
        {market.liveListings.length === 0 ? (
          <p className="lf-tx__soft">
            Brak wystawionych zawodników innych klubów. Poniżej znajdziesz więcej zawodników.
          </p>
        ) : (
          <>
            <div className="lf-tx__cards md:hidden">
              {market.liveListings.map((r) => {
                const canLive = market.canBuy && r.sellerWindowOpen;
                return (
                  <article key={r.playerId} className="lf-tx__card">
                    <p className="lf-tx__case-title">{r.playerName}</p>
                    <p className="lf-tx__case-meta">
                      {r.pos} · {r.sellerClubLabel} ·{' '}
                      <span className="text-[var(--lf-gold)] tabular-nums">{r.askLabel}</span>
                    </p>
                    <div className="lf-tx-actions">
                      <LiveBuyButton
                        listing={r}
                        disabled={!canLive || market.envelopeBalance < r.ask}
                      />
                      <LiveOfferCreate
                        listing={r}
                        disabled={!canLive}
                        envelopeBalance={market.envelopeBalance}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="lf-tx__table-wrap hidden md:block">
              <Table
                rowKey={(r) => r.playerId}
                rows={[...market.liveListings]}
                columns={[
                  { key: 'name', header: 'Zawodnik', render: (r) => r.playerName },
                  { key: 'pos', header: 'Poz.', render: (r) => r.pos },
                  { key: 'club', header: 'Klub', render: (r) => r.sellerClubLabel },
                  {
                    key: 'ask',
                    header: 'Cena',
                    align: 'right',
                    render: (r) => (
                      <span className="text-[var(--lf-gold)] tabular-nums">{r.askLabel}</span>
                    ),
                  },
                  {
                    key: 'act',
                    header: '',
                    align: 'right',
                    render: (r) => {
                      const canLive = market.canBuy && r.sellerWindowOpen;
                      return (
                        <div className="lf-tx-actions">
                          <LiveBuyButton
                            listing={r}
                            disabled={!canLive || market.envelopeBalance < r.ask}
                          />
                          <LiveOfferCreate
                            listing={r}
                            disabled={!canLive}
                            envelopeBalance={market.envelopeBalance}
                          />
                        </div>
                      );
                    },
                  },
                ]}
              />
            </div>
          </>
        )}

        <h3 className="lf-tx__subhead">Więcej zawodników</h3>
        <div className="lf-tx__cards md:hidden">
          {market.listings.map((r) => (
            <article key={r.marketId} className="lf-tx__card">
              <p className="lf-tx__case-title">{r.name}</p>
              <p className="lf-tx__case-meta">
                {r.pos} · {r.age} lat · {r.clubLabel} ·{' '}
                <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
              </p>
              <BuyNegotiate
                marketId={r.marketId}
                ask={r.fee}
                canBuy={market.canBuy}
                envelopeBalance={market.envelopeBalance}
              />
            </article>
          ))}
        </div>
        <div className="lf-tx__table-wrap hidden md:block">
          <Table
            rowKey={(r) => r.marketId}
            rows={[...market.listings]}
            columns={[
              { key: 'name', header: 'Zawodnik', render: (r) => r.name },
              { key: 'pos', header: 'Poz.', render: (r) => r.pos },
              {
                key: 'age',
                header: 'Wiek',
                align: 'right',
                render: (r) => <span className="tabular-nums">{r.age}</span>,
              },
              { key: 'club', header: 'Klub', render: (r) => r.clubLabel },
              {
                key: 'fee',
                header: 'Cena',
                align: 'right',
                render: (r) => (
                  <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                ),
              },
              {
                key: 'act',
                header: 'Oferta',
                align: 'right',
                render: (r) => (
                  <BuyNegotiate
                    marketId={r.marketId}
                    ask={r.fee}
                    canBuy={market.canBuy}
                    envelopeBalance={market.envelopeBalance}
                  />
                ),
              },
            ]}
          />
        </div>
      </section>

      {/* Listed when window closed */}
      {!market.windowOpen && market.listedPlayers.length > 0 ? (
        <section className="lf-tx__section" aria-labelledby="tx-listed-title">
          <h2 id="tx-listed-title" className="lf-tx__section-title lf-tx__section-title--muted">
            Na Twojej liście
          </h2>
          <ul className="lf-tx__inbox lf-tx__inbox--muted">
            {market.listedPlayers.map((r) => (
              <li key={r.playerId} className="lf-tx__case lf-tx__case--muted">
                <div className="lf-tx__case-main">
                  <p className="lf-tx__case-title">{r.name}</p>
                  <p className="lf-tx__case-meta">
                    {r.pos} ·{' '}
                    <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                  </p>
                </div>
                <ListingButton playerId={r.playerId} listed disabled={false} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* E — Sell */}
      <section className="lf-tx__section" aria-labelledby="tx-sell-title">
        <h2 id="tx-sell-title" className="lf-tx__section-title lf-tx__section-title--muted">
          Sprzedaż
        </h2>
        {market.sellCandidates.length === 0 ? (
          <p className="lf-tx__soft">Brak zawodników gotowych do sprzedaży w tej chwili.</p>
        ) : (
          <>
            <div className="lf-tx__cards md:hidden">
              {market.sellCandidates.map((r) => (
                <article key={r.playerId} className="lf-tx__card">
                  <p className="lf-tx__case-title">
                    {r.name}
                    {r.listed ? <span className="lf-tx__tag"> · na liście</span> : null}
                  </p>
                  <p className="lf-tx__case-meta">
                    {r.pos} · {r.age} lat ·{' '}
                    <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                  </p>
                  <SellActions row={r} canSell={market.canSell} />
                </article>
              ))}
            </div>
            <div className="lf-tx__table-wrap hidden md:block">
              <Table
                rowKey={(r) => r.playerId}
                rows={[...market.sellCandidates]}
                columns={[
                  {
                    key: 'name',
                    header: 'Zawodnik',
                    render: (r) => (
                      <span>
                        {r.name}
                        {r.listed ? (
                          <span className="ml-1 text-xs text-[var(--lf-gold)]">· na liście</span>
                        ) : null}
                      </span>
                    ),
                  },
                  { key: 'pos', header: 'Poz.', render: (r) => r.pos },
                  {
                    key: 'age',
                    header: 'Wiek',
                    align: 'right',
                    render: (r) => <span className="tabular-nums">{r.age}</span>,
                  },
                  {
                    key: 'fee',
                    header: 'Wycena',
                    align: 'right',
                    render: (r) => (
                      <span className="text-[var(--lf-gold)] tabular-nums">{r.feeLabel}</span>
                    ),
                  },
                  {
                    key: 'act',
                    header: '',
                    align: 'right',
                    render: (r) => <SellActions row={r} canSell={market.canSell} />,
                  },
                ]}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
